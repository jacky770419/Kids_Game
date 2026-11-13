# 把錄好的故事轉成遊戲要的東西，不呼叫 API：
#   來源  _tts/stories/<id>/pN.mp3＋pN.timing.json（中文）、_tts/stories/<id>/en/…（英文）
#   產出  assets/story/audio/<id>-N.mp3（中文）、<id>-N-en.mp3（英文）  單聲道 64k
#         js/story-script.js   window.STORY_SCRIPT：
#           stories[i] = { id, title:{zh,en}, pages:[ { zh:{audio,dur,lines}, en:{audio,dur,lines} } ] }
#           lines[j]   = { who, text, s, e, t }   s／e＝這句的起訖秒，t＝每個字元的起始秒
# 用法：python tools/tts/build_story.py
# 逐字時間：ElevenLabs 回的 alignment 連句首的「[語氣標籤] 」一起算字元，這裡把標籤那段切掉，
# 剩下的字元要跟腳本的文字一字不差，對不上就停（代表腳本改過但沒重錄）。
# 中文一定要有；英文還沒錄的故事就只出中文，遊戲會自己退回中文。
import json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
WORK = os.path.join(ROOT, '_tts', 'stories')
AUDIO = os.path.join(ROOT, 'assets', 'story', 'audio')

import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()


def build_page(sid, n, page, lang, dst=None, url=None):
    """dst＝轉好的音檔要放哪（預設 assets/story/audio/<id>-N[-en].mp3）、url＝遊戲裡寫的路徑。
    tools/tts/build_books.py（新書）也用這支，只是放的位置不同。"""
    d = os.path.join(WORK, sid) if lang == 'zh' else os.path.join(WORK, sid, 'en')
    key = 'text' if lang == 'zh' else 'en'
    t = json.load(open(os.path.join(d, f'p{n}.timing.json'), encoding='utf-8'))
    a = t['alignment']
    chars, starts, ends = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
    segs = sorted(t['voice_segments'], key=lambda g: g['dialogue_input_index'])
    if len(segs) != len(page['lines']):
        raise SystemExit(f"{sid} 第 {n} 頁（{lang}）：錄音 {len(segs)} 句、腳本 {len(page['lines'])} 句")
    lines = []
    for seg, line in zip(segs, page['lines']):
        i0, i1 = seg['character_start_index'], seg['character_end_index']
        body = ''.join(chars[i0:i1])
        m = re.match(r'\s*\[[^\]]*\]\s*', body)
        skip = m.end() if m else 0
        text = body[skip:]
        want = line[key]
        if text.strip() != want:
            raise SystemExit(f"{sid} 第 {n} 頁（{lang}）對不上：錄的「{text}」／腳本「{want}」")
        lead = len(text) - len(text.lstrip())
        ts = [round(x, 2) for x in starts[i0 + skip + lead:i0 + skip + lead + len(want)]]
        lines.append({'who': line['who'], 'text': want, 's': round(starts[i0 + skip + lead], 2), 'e': round(seg['end_time_seconds'], 2), 't': ts})
    if dst is None:
        name = f"{sid}-{n}.mp3" if lang == 'zh' else f"{sid}-{n}-en.mp3"
        dst = os.path.join(AUDIO, name)
        url = 'assets/story/audio/' + name
    src = os.path.join(d, f'p{n}.mp3')
    # 已經轉過、母帶沒換就不重轉（新書的檔名雜湊才不會每次都變、iPad 才不用重抓）
    if not (os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)):
        subprocess.run([FF, '-loglevel', 'error', '-y', '-i', src, '-ac', '1', '-ar', '44100', '-b:a', '64k', dst], check=True)
    return {'audio': url, 'dur': round(ends[-1], 2), 'lines': lines}, os.path.getsize(dst)


def main():
    DATA = json.load(open(os.path.join(HERE, 'stories.json'), encoding='utf-8'))
    os.makedirs(AUDIO, exist_ok=True)
    out = {'stories': []}
    total = {'zh': 0, 'en': 0}
    count = {'zh': 0, 'en': 0}
    for s in DATA['stories']:
        has_en = all(os.path.exists(os.path.join(WORK, s['id'], 'en', f'p{n}.timing.json')) for n in range(1, len(s['pages']) + 1))
        pages = []
        for n, page in enumerate(s['pages'], 1):
            entry = {}
            for lang in (('zh', 'en') if has_en else ('zh',)):
                entry[lang], size = build_page(s['id'], n, page, lang)
                total[lang] += size
                count[lang] += 1
            pages.append(entry)
        title = {'zh': s['title']}
        if has_en and s.get('title_en'):
            title['en'] = s['title_en']
        out['stories'].append({'id': s['id'], 'title': title, 'pages': pages})
        print(s['id'], '中文' + ('＋英文' if has_en else '（英文還沒錄）'))

    js = ('/* 由 tools/tts/build_story.py 產生，不要手改：故事的文字、誰說、每句與每個字元的時間（中文與英文各一份）。\n'
          '   要改故事內容，改 tools/tts/stories.json、重錄那一頁、再重跑這支。 */\n'
          'window.STORY_SCRIPT = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'js', 'story-script.js'), 'w', encoding='utf-8', newline='\n').write(js)
    print(f"音檔 中文 {count['zh']} 個 {total['zh'] // 1024} KB、英文 {count['en']} 個 {total['en'] // 1024} KB；js/story-script.js {len(js) // 1024} KB")


if __name__ == '__main__':
    main()
