# 用 ElevenLabs 的時間軸＋音量，抓「多念」：標點（逗號、句號、驚嘆號）那段時間照理是停頓，
# 如果那段裡大部分時間都有人聲，多半是多念了字（例如「好熱好熱」念成三次）。不呼叫任何 API。
# 用法：python pause_check.py <mp3> [<mp3> …]      （同名 .timing.json 要在旁邊）
#       python pause_check.py --story <id> [--new] [--lang zh|en]   掃整本
import json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.normpath(os.path.join(HERE, '..', '..', '_tts'))
PUNCT = set('，。！？、；：,.!?;:…')
SR = 16000


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def pcm(path):
    raw = subprocess.run([ffmpeg(), '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def voiced_ratio(x, s, e, thr):
    """s～e 秒內，每 20ms 一格，有幾成的格子音量超過門檻。"""
    a, b = int(s * SR), int(e * SR)
    seg = x[a:b]
    if len(seg) < SR * 0.04:
        return 0.0
    hop = int(SR * 0.02)
    rms = np.sqrt(np.mean(seg[:len(seg) // hop * hop].reshape(-1, hop) ** 2, axis=1))
    return float(np.mean(rms > thr))


def check(mp3):
    t = json.load(open(mp3[:-4] + '.timing.json', encoding='utf-8'))
    a = t['alignment']
    ch, st, en = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
    x = pcm(mp3)
    hop = int(SR * 0.02)
    rms = np.sqrt(np.mean(x[:len(x) // hop * hop].reshape(-1, hop) ** 2, axis=1))
    thr = max(0.02, np.percentile(rms, 70) * 0.25)   # 說話音量的四分之一當「有聲」門檻
    out = []
    for g in sorted(t['voice_segments'], key=lambda g: g['dialogue_input_index']):
        i0, i1 = g['character_start_index'], g['character_end_index']
        k = i0
        while k < i1 and ch[k] != ']' and ch[i0] == '[':   # 跳過句首的 [語氣標籤]
            k += 1
        k = k + 1 if ch[i0] == '[' else i0
        text = ''.join(ch[k:i1]).strip()
        for j in range(k, i1):
            if ch[j] in PUNCT and j < i1 - 1 and en[j] - st[j] >= 0.25:   # 句中、夠長的停頓才檢查
                r = voiced_ratio(x, st[j] + 0.05, en[j] - 0.05, thr)
                if r >= 0.6:
                    out.append((g['dialogue_input_index'] + 1, text, ''.join(ch[max(k, j - 6):j + 1]), round(en[j] - st[j], 2), round(r, 2)))
    return out


def main(argv):
    files = []
    if '--story' in argv:
        sid = argv[argv.index('--story') + 1]
        lang = argv[argv.index('--lang') + 1] if '--lang' in argv else 'zh'
        d = os.path.join(WORK, 'stories', sid) if lang == 'zh' else os.path.join(WORK, 'stories', sid, 'en')
        files = sorted((os.path.join(d, f) for f in os.listdir(d) if f[0] == 'p' and f.endswith('.mp3')),
                       key=lambda p: int(os.path.basename(p)[1:-4]))
    else:
        files = argv
    for f in files:
        hits = check(f)
        name = os.path.relpath(f, WORK)
        if not hits:
            print(name, '：停頓都正常')
        for line, text, ctx, dur, r in hits:
            print(f'{name} 第 {line} 句「{text}」：「{ctx}」後面該停 {dur} 秒，但有 {int(r * 100)}% 的時間有聲音 → 可能多念')


if __name__ == '__main__':
    main(sys.argv[1:])
