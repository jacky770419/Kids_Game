# 把錄好的故事（_tts/stories/<id>/pN.mp3＋pN.timing.json）轉成遊戲要的東西，不呼叫 API：
#   assets/story/audio/<id>-N.mp3   單聲道 64k（原檔 128k 立體聲規格，語音用不到）
#   js/story-script.js              window.STORY_SCRIPT：每頁每句的文字、誰說、起訖秒、逐字起始秒
# 用法：python tools/tts/build_story.py
# 逐字時間：ElevenLabs 回的 alignment 連句首的「[語氣標籤] 」一起算字元，這裡把標籤那段切掉，
# 剩下的字元要跟腳本的 text 一字不差，對不上就停（代表腳本改過但沒重錄）。
import json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
WORK = os.path.join(ROOT, '_tts', 'stories')
DATA = json.load(open(os.path.join(HERE, 'stories.json'), encoding='utf-8'))
AUDIO = os.path.join(ROOT, 'assets', 'story', 'audio')
os.makedirs(AUDIO, exist_ok=True)

import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

out = {'stories': []}
total = 0
for s in DATA['stories']:
    pages = []
    for n, page in enumerate(s['pages'], 1):
        t = json.load(open(os.path.join(WORK, s['id'], f'p{n}.timing.json'), encoding='utf-8'))
        a = t['alignment']
        chars, starts, ends = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
        segs = sorted(t['voice_segments'], key=lambda g: g['dialogue_input_index'])
        if len(segs) != len(page['lines']):
            raise SystemExit(f"{s['id']} 第 {n} 頁：錄音 {len(segs)} 句、腳本 {len(page['lines'])} 句")
        lines = []
        for seg, line in zip(segs, page['lines']):
            i0, i1 = seg['character_start_index'], seg['character_end_index']
            body = ''.join(chars[i0:i1])
            m = re.match(r'\s*\[[^\]]*\]\s*', body)
            skip = m.end() if m else 0
            text = body[skip:]
            if text.strip() != line['text']:
                raise SystemExit(f"{s['id']} 第 {n} 頁對不上：錄的「{text}」／腳本「{line['text']}」")
            lead = len(text) - len(text.lstrip())
            ts = [round(x, 2) for x in starts[i0 + skip + lead:i0 + skip + lead + len(line['text'])]]
            lines.append({'who': line['who'], 'text': line['text'],
                          's': round(starts[i0 + skip + lead], 2), 'e': round(seg['end_time_seconds'], 2), 't': ts})
        src = os.path.join(WORK, s['id'], f'p{n}.mp3')
        dst = os.path.join(AUDIO, f"{s['id']}-{n}.mp3")
        subprocess.run([FF, '-loglevel', 'error', '-y', '-i', src, '-ac', '1', '-ar', '44100', '-b:a', '64k', dst], check=True)
        total += os.path.getsize(dst)
        pages.append({'audio': f"assets/story/audio/{s['id']}-{n}.mp3", 'dur': round(ends[-1], 2), 'lines': lines})
    out['stories'].append({'id': s['id'], 'title': s['title'], 'pages': pages})

js = ('/* 由 tools/tts/build_story.py 產生，不要手改：故事的文字、誰說、每句與每個字的時間。\n'
      '   要改故事內容，改 tools/tts/stories.json、重錄那一頁、再重跑這支。 */\n'
      'window.STORY_SCRIPT = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(ROOT, 'js', 'story-script.js'), 'w', encoding='utf-8', newline='\n').write(js)
print('音檔', sum(len(s['pages']) for s in out['stories']), '個', total // 1024, 'KB；js/story-script.js', len(js) // 1024, 'KB')
