# 有聲故事書錄音（ElevenLabs v4 多角色對話；做法抄自另一個專案的 el_ch10.py／el_round2.py）。
# 腳本＝同資料夾的 stories.json（中英雙語）。錄出來的檔放 repo 根目錄的 _tts/（不進版本庫）：
#   中文 _tts/stories/<id>/pN.mp3、英文 _tts/stories/<id>/en/pN.mp3，旁邊各有 pN.timing.json（逐字時間軸）
#
#   python el_story.py dry                          只算字元與預估扣點，不呼叫生成
#   python el_story.py trial                        試錄：英文旁白候選各念一頁＋新故事的中文新角色各一兩頁
#   python el_story.py record zh|en|all [故事id …]   正式錄：每頁一檔；已經有檔的頁會跳過（要重錄先刪那一頁的 mp3）
#   python el_story.py page                         把錄好的各頁接成整本試聽頁（不呼叫 API）
#
# 扣點實測（2026-11）：中文一字不到 0.5 點、英文一個字元約 1 點。大量錄之前先跑 dry、先問使用者。
import base64, html, json, os, subprocess, sys
from el_common import api, subscription

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.normpath(os.path.join(HERE, '..', '..', '_tts'))
DATA = json.load(open(os.path.join(HERE, 'stories.json'), encoding='utf-8'))
MODEL = DATA.get('model', 'eleven_v4')
FMT = 'mp3_44100_128'
LANGS = ('zh', 'en')

# 試錄：英文旁白候選（各念同一頁，其他角色相同）、中文新角色（旁白照舊）
EN_NARRATORS = ['Emma - Bright Kids', 'Lila - Upbeat', 'Macy - Cheerful', 'Clara - Children']
EN_TRIAL_PAGE = ('bear-hug', 2)
ZH_TRIAL = {'tortoise-hare': [1, 2], 'three-pigs': [3, 4]}

_shared = None
_mine = None


def my_voices(refresh=False):
    global _mine
    if _mine is None or refresh:
        _mine = api('/v1/voices')['voices']
    return _mine


def ensure(name_part):
    """帳號裡已經有名字含 name_part 的聲音就用它；沒有就從聲音庫加進帳號（不扣點）。回 voice_id。"""
    global _shared
    for v in my_voices():
        if name_part in v['name']:
            return v['voice_id']
    if _shared is None:
        _shared = json.load(open(os.path.join(WORK, 'shared_voices.json'), encoding='utf-8'))
    for v in _shared.values():
        if v['name'].startswith(name_part):
            r = api(f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", {'new_name': 'kids_' + v['name'][:40]})
            my_voices(refresh=True)
            return r['voice_id']
    raise SystemExit('找不到聲音：' + name_part)


def cast_names(lang, narrator=None):
    """說話的人 → 聲音名字的一段。"""
    out = {who: (c['find'] if lang == 'zh' else c['en']) for who, c in DATA['cast'].items()}
    if narrator:
        out['旁白'] = narrator
    return out


def text_of(line, lang):
    return line['text'] if lang == 'zh' else line['en']


def inputs_for(page, vids, lang):
    return [{'text': (f"[{l['tag']}] " if l.get('tag') else '') + text_of(l, lang), 'voice_id': vids[l['who']]} for l in page['lines']]


def vids_for(pages, names):
    """只把這幾頁用得到的聲音加進帳號。"""
    return {who: ensure(names[who]) for who in sorted({l['who'] for p in pages for l in p['lines']})}


def count(pages, lang):
    body = sum(len(text_of(l, lang)) for p in pages for l in p['lines'])
    tag = sum(len(l.get('tag', '')) + 3 for p in pages for l in p['lines'] if l.get('tag'))
    return body, tag


def ffmpeg():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def concat(files, out, gap=0.9):
    ff = ffmpeg()
    d = os.path.dirname(out)
    sil = os.path.join(d, '_sil.mp3')
    lst = os.path.join(d, '_concat.txt')
    subprocess.run([ff, '-loglevel', 'error', '-y', '-f', 'lavfi', '-t', str(gap), '-i', 'anullsrc=r=44100:cl=mono', '-b:a', '128k', sil], check=True)
    with open(lst, 'w', encoding='utf-8') as f:
        for i, x in enumerate(files):
            if i:
                f.write(f"file '{sil.replace(os.sep, '/')}'\n")
            f.write(f"file '{x.replace(os.sep, '/')}'\n")
    subprocess.run([ff, '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-ac', '1', '-b:a', '128k', out], check=True)
    os.remove(sil)
    os.remove(lst)


def story(sid):
    for s in DATA['stories']:
        if s['id'] == sid:
            return s
    raise SystemExit('沒有這個故事：' + sid)


def page_dir(sid, lang):
    return os.path.join(WORK, 'stories', sid) if lang == 'zh' else os.path.join(WORK, 'stories', sid, 'en')


def rate(lang):
    return 0.5 if lang == 'zh' else 1.0


PAGE_CSS = """body{font:16px/1.7 system-ui,"Microsoft JhengHei",sans-serif;max-width:720px;margin:0 auto;padding:16px;background:#FFF8E7;color:#2b2b2b}
h1{font-size:22px}h2{font-size:18px;margin:28px 0 4px;border-bottom:3px solid #2b2b2b;padding-bottom:4px}
.v{background:#fff;border:3px solid #2b2b2b;border-radius:14px;box-shadow:4px 4px 0 #2b2b2b;padding:10px 14px;margin:14px 0}
.t{font-weight:700}.k{background:#FFD93D;border:2px solid #2b2b2b;border-radius:10px;padding:0 8px;font-size:14px;margin-right:6px}
.d{color:#666;font-size:14px;margin:2px 0 6px}.x{font-size:15px;margin-top:8px;color:#444}audio{width:100%}p{color:#555;font-size:14px}
.pg{display:flex;gap:10px;margin-top:10px;font-size:15px;color:#444}.n{flex:none;width:1.7em;height:1.7em;line-height:1.7em;text-align:center;background:#FFD93D;border:2px solid #2b2b2b;border-radius:50%;font-weight:700}"""


def html_page(title, intro, rows):
    return (f'<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{title}</title><style>{PAGE_CSS}</style><h1>{title}</h1><p>{intro}</p>{"".join(rows)}</html>')


def audio_tag(path):
    return f"<audio controls preload='none' src='data:audio/mpeg;base64,{base64.b64encode(open(path, 'rb').read()).decode()}'></audio>"


def lines_html(pages, lang):
    return '<br>'.join(f"<b>{html.escape(l['who'])}</b>：{html.escape(text_of(l, lang))}" for p in pages for l in p['lines'])


def cmd_dry():
    total = 0
    for lang in LANGS:
        for s in DATA['stories']:
            body, tag = count(s['pages'], lang)
            done = all(os.path.exists(os.path.join(page_dir(s['id'], lang), f'p{n}.mp3')) for n in range(1, len(s['pages']) + 1))
            est = round(body * rate(lang) + tag * 0.3)
            if not done:
                total += est
            print(f"[{lang}] {s['title']}：{len(s['pages'])} 頁、{body} 字元＋標籤 {tag} → 約 {est} 點{'（已錄）' if done else ''}")
    print('還沒錄的合計約', total, '點（不含重錄）')


def cmd_trial():
    out = os.path.join(WORK, 'trial2')
    os.makedirs(out, exist_ok=True)
    used0 = subscription()[0]
    rows = ['<h2>英文旁白：四個候選念同一頁</h2>']
    sid, n = EN_TRIAL_PAGE
    pg = story(sid)['pages'][n - 1]
    for k, narr in enumerate(EN_NARRATORS, 1):
        names = cast_names('en', narr)
        fn = os.path.join(out, f'en_{k}.mp3')
        if not os.path.exists(fn):
            body = {'model_id': MODEL, 'inputs': inputs_for(pg, vids_for([pg], names), 'en')}
            open(fn, 'wb').write(api(f'/v1/text-to-dialogue?output_format={FMT}', body, raw=True))
            print('錄好', os.path.basename(fn), narr)
        who = sorted({l['who'] for l in pg['lines']} - {'旁白'})
        rows.append(f"<div class='v'><div class='t'><span class='k'>{k}</span>旁白 {html.escape(narr)}</div>"
                    f"<div class='d'>{html.escape('、'.join(w + '＝' + names[w] for w in who))}</div>{audio_tag(fn)}"
                    + (f"<div class='x'>{lines_html([pg], 'en')}</div>" if k == 1 else '') + '</div>')
    rows.append('<h2>中文新角色（旁白照舊是 Yui）</h2>')
    names = cast_names('zh')
    for sid, pp in ZH_TRIAL.items():
        s = story(sid)
        pages = [s['pages'][n - 1] for n in pp]
        vids = vids_for(pages, names)
        files = []
        for n, pg in zip(pp, pages):
            fn = os.path.join(out, f'zh_{sid}_p{n}.mp3')
            if not os.path.exists(fn):
                body = {'model_id': MODEL, 'inputs': inputs_for(pg, vids, 'zh')}
                open(fn, 'wb').write(api(f'/v1/text-to-dialogue?output_format={FMT}', body, raw=True))
                print('錄好', os.path.basename(fn))
            files.append(fn)
        joined = os.path.join(out, f'zh_{sid}.mp3')
        concat(files, joined)
        who = sorted({l['who'] for p in pages for l in p['lines']} - {'旁白'})
        rows.append(f"<div class='v'><div class='t'>《{s['title']}》第 {'、'.join(map(str, pp))} 頁</div>"
                    f"<div class='d'>{html.escape('、'.join(w + '＝' + names[w] for w in who))}</div>{audio_tag(joined)}"
                    f"<div class='x'>{lines_html(pages, 'zh')}</div></div>")
    used1 = subscription()
    dst = os.path.join(WORK, '試錄_英文旁白與新角色.html')
    open(dst, 'w', encoding='utf-8').write(html_page('試錄：英文旁白與新角色', '英文四段只有旁白不同，角色聲音一樣。聽完告訴我英文旁白要哪一個、新角色的聲音有沒有要換的。', rows))
    print('試聽頁', dst)
    print('本次扣點', used1[0] - used0, '／已用', used1[0], '／上限', used1[1])


def cmd_record(args):
    langs = LANGS if (not args or args[0] == 'all') else (args[0],)
    if any(l not in LANGS for l in langs):
        raise SystemExit('語言要是 zh、en 或 all')
    ids = args[1:] or [s['id'] for s in DATA['stories']]
    used0 = subscription()[0]
    for lang in langs:
        names = cast_names(lang)
        for sid in ids:
            s = story(sid)
            out = page_dir(sid, lang)
            os.makedirs(out, exist_ok=True)
            todo = [(n, p) for n, p in enumerate(s['pages'], 1) if not os.path.exists(os.path.join(out, f'p{n}.mp3'))]
            if not todo:
                continue
            vids = vids_for([p for _, p in todo], names)
            for n, page in todo:
                body = {'model_id': MODEL, 'inputs': inputs_for(page, vids, lang)}
                r = api(f'/v1/text-to-dialogue/with-timestamps?output_format={FMT}', body)
                audio = r.get('audio_base64') or r.get('audio_base_64') or r.get('audio')
                if not audio:   # 回傳格式跟預期不同：把回應留下來再停，免得白扣點
                    json.dump(r, open(os.path.join(out, f'p{n}.raw.json'), 'w', encoding='utf-8'), ensure_ascii=False)
                    raise SystemExit('回應裡找不到音訊欄位，已存 raw.json；欄位：' + ', '.join(r.keys()))
                open(os.path.join(out, f'p{n}.mp3'), 'wb').write(base64.b64decode(audio))
                json.dump({k: v for k, v in r.items() if not k.startswith('audio')},
                          open(os.path.join(out, f'p{n}.timing.json'), 'w', encoding='utf-8'), ensure_ascii=False)
                print('錄好', lang, sid, n)
    used1 = subscription()
    print('本次扣點', used1[0] - used0, '／已用', used1[0], '／上限', used1[1])


def cmd_page():
    """整本試聽頁：每個故事每種語言一顆播放器（各頁接起來）＋逐頁文字。不呼叫 API。"""
    rows = []
    for s in DATA['stories']:
        rows.append(f"<h2>《{html.escape(s['title'])}》 {html.escape(s.get('title_en', ''))}</h2>")
        for lang in LANGS:
            d = page_dir(s['id'], lang)
            files = [os.path.join(d, f'p{n}.mp3') for n in range(1, len(s['pages']) + 1)]
            if not all(os.path.exists(f) for f in files):
                continue
            joined = os.path.join(d, f'_整本_{lang}.mp3')
            concat(files, joined, gap=1.2)
            text = ''.join(f"<div class='pg'><span class='n'>{n}</span><div>{lines_html([p], lang)}</div></div>" for n, p in enumerate(s['pages'], 1))
            rows.append(f"<div class='v'><div class='t'><span class='k'>{'中文' if lang == 'zh' else 'English'}</span></div>{audio_tag(joined)}{text}</div>")
    dst = os.path.join(WORK, '試聽_故事書整本.html')
    open(dst, 'w', encoding='utf-8').write(html_page('故事書整本試聽', '每頁之間停 1.2 秒。聽到念錯、語氣怪或聲音不對的，告訴我哪一本、哪種語言、第幾頁，那一頁可以單獨重錄。', rows))
    print('寫出', dst, os.path.getsize(dst) // 1024, 'KB')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'dry'
    if cmd == 'dry':
        cmd_dry()
    elif cmd == 'trial':
        cmd_trial()
    elif cmd == 'record':
        cmd_record(sys.argv[2:])
    elif cmd == 'page':
        cmd_page()
    else:
        raise SystemExit('用法見檔頭')
