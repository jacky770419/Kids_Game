# 有聲故事書錄音（ElevenLabs v4 多角色對話；做法抄自另一個專案的 el_ch10.py／el_round2.py）。
# 腳本＝同資料夾的 stories.json。錄出來的檔放 repo 根目錄的 _tts/（不進版本庫）。
#
#   python el_story.py dry                    只算字元與預估扣點，不呼叫生成
#   python el_story.py trial                  試錄：兩個故事各挑幾頁，A／B 兩組選角各一份
#   python el_story.py record [故事id …]      正式錄：每頁一檔＋逐字時間軸（with-timestamps）
#   python el_story.py page                   把錄好的各頁接成整本試聽頁（不呼叫 API）
#
# 扣點：中文每字約 0.69 點，英文語氣標籤也算。大量錄之前先跑 dry、先問使用者。
import base64, html, json, os, subprocess, sys
from el_common import api, subscription

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.normpath(os.path.join(HERE, '..', '..', '_tts'))
DATA = json.load(open(os.path.join(HERE, 'stories.json'), encoding='utf-8'))
MODEL = DATA.get('model', 'eleven_v4')
FMT = 'mp3_44100_128'

# 試錄的頁（1 起算）與選角組：A＝cast 的 find，B＝有 alt 的角色換成 alt
TRIAL = {'bear-hug': [2, 4], 'princess-star': [3, 4, 5]}
TRIAL_B = {'bear-hug': [2], 'princess-star': [4, 5]}

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


def voice_map(variant='A'):
    out = {}
    for who, c in DATA['cast'].items():
        part = c['alt'] if (variant == 'B' and c.get('alt')) else c['find']
        out[who] = (part, None)
    return out


def inputs_for(page, vids):
    return [{'text': (f"[{l['tag']}] " if l.get('tag') else '') + l['text'], 'voice_id': vids[l['who']]} for l in page['lines']]


def chars(pages):
    zh = sum(len(l['text']) for p in pages for l in p['lines'])
    tag = sum(len(l.get('tag', '')) + 3 for p in pages for l in p['lines'] if l.get('tag'))
    return zh, tag


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


def cmd_dry():
    total = 0
    for s in DATA['stories']:
        zh, tag = chars(s['pages'])
        est = round(zh * 0.69 + tag)
        total += est
        print(f"{s['title']}：{len(s['pages'])} 頁、{sum(len(p['lines']) for p in s['pages'])} 句、中文 {zh} 字＋標籤 {tag} 字元 → 約 {est} 點")
    print('合計約', total, '點（不含重錄）')
    for sid, pp in TRIAL.items():
        zh, tag = chars([story(sid)['pages'][n - 1] for n in pp])
        zb, tb = chars([story(sid)['pages'][n - 1] for n in TRIAL_B[sid]])
        print(f'試錄 {sid}：A 第 {pp} 頁＋B 第 {TRIAL_B[sid]} 頁 → 約 {round((zh + zb) * 0.69 + tag + tb)} 點')


def cmd_trial():
    out = os.path.join(WORK, 'trial')
    os.makedirs(out, exist_ok=True)
    used0 = subscription()[0]
    rows = []
    for variant, plan in (('A', TRIAL), ('B', TRIAL_B)):
        names = voice_map(variant)
        vids = {who: ensure(part) for who, (part, _) in names.items()}
        for sid, pp in plan.items():
            s = story(sid)
            files = []
            for n in pp:
                fn = os.path.join(out, f'{sid}_p{n}_{variant}.mp3')
                if not os.path.exists(fn):
                    body = {'model_id': MODEL, 'inputs': inputs_for(s['pages'][n - 1], vids)}
                    open(fn, 'wb').write(api(f'/v1/text-to-dialogue?output_format={FMT}', body, raw=True))
                    print('錄好', os.path.basename(fn))
                files.append(fn)
            joined = os.path.join(out, f"試錄_{s['title']}_{variant}.mp3")
            concat(files, joined)
            who_used = sorted({l['who'] for n in pp for l in s['pages'][n - 1]['lines']})
            cast_txt = '、'.join(f'{w}＝{names[w][0]}' for w in who_used)
            text = '<br>'.join(f"<b>{html.escape(l['who'])}</b>：{html.escape(l['text'])}" for n in pp for l in s['pages'][n - 1]['lines'])
            b64 = base64.b64encode(open(joined, 'rb').read()).decode()
            rows.append(f"<div class='v'><div class='t'>《{s['title']}》第 {'、'.join(map(str, pp))} 頁　<span class='k'>{variant} 組</span></div>"
                        f"<div class='d'>{html.escape(cast_txt)}</div><audio controls preload='none' src='data:audio/mpeg;base64,{b64}'></audio>"
                        f"<div class='x'>{text}</div></div>")
    used1 = subscription()
    page = f"""<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>故事書試錄</title>
<style>body{{font:16px/1.7 system-ui,"Microsoft JhengHei",sans-serif;max-width:700px;margin:0 auto;padding:16px;background:#FFF8E7;color:#2b2b2b}}
h1{{font-size:22px}}.v{{background:#fff;border:3px solid #2b2b2b;border-radius:14px;box-shadow:4px 4px 0 #2b2b2b;padding:10px 14px;margin:14px 0}}
.t{{font-weight:700}}.k{{background:#FFD93D;border:2px solid #2b2b2b;border-radius:10px;padding:0 8px;font-size:14px}}
.d{{color:#666;font-size:14px;margin:2px 0 6px}}.x{{font-size:15px;margin-top:8px;color:#444}}audio{{width:100%}}p{{color:#555;font-size:14px}}</style>
<h1>故事書試錄（ElevenLabs v4）</h1>
<p>旁白都是 Yui。A 組的小熊、小公主是童聲；B 組換成年輕的大人聲音，其他角色相同。</p>
{''.join(rows)}</html>"""
    dst = os.path.join(WORK, '試錄_故事書.html')
    open(dst, 'w', encoding='utf-8').write(page)
    print('試聽頁', dst)
    print('本次扣點', used1[0] - used0, '／已用', used1[0], '／上限', used1[1])


def cmd_record(ids):
    vids = {who: ensure(part) for who, (part, _) in voice_map('A').items()}
    used0 = subscription()[0]
    for sid in ids or [s['id'] for s in DATA['stories']]:
        s = story(sid)
        out = os.path.join(WORK, 'stories', sid)
        os.makedirs(out, exist_ok=True)
        for n, page in enumerate(s['pages'], 1):
            fn = os.path.join(out, f'p{n}.mp3')
            if os.path.exists(fn):
                continue
            body = {'model_id': MODEL, 'inputs': inputs_for(page, vids)}
            r = api(f'/v1/text-to-dialogue/with-timestamps?output_format={FMT}', body)
            audio = r.get('audio_base64') or r.get('audio_base_64') or r.get('audio')
            if not audio:   # 回傳格式跟預期不同：把回應留下來再停，免得白扣點
                json.dump(r, open(os.path.join(out, f'p{n}.raw.json'), 'w', encoding='utf-8'), ensure_ascii=False)
                raise SystemExit('回應裡找不到音訊欄位，已存 raw.json；欄位：' + ', '.join(r.keys()))
            open(fn, 'wb').write(base64.b64decode(audio))
            json.dump({k: v for k, v in r.items() if not k.startswith('audio')}, open(os.path.join(out, f'p{n}.timing.json'), 'w', encoding='utf-8'), ensure_ascii=False)
            print('錄好', sid, n)
    used1 = subscription()
    print('本次扣點', used1[0] - used0, '／已用', used1[0], '／上限', used1[1])


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'dry'
    if cmd == 'dry':
        cmd_dry()
    elif cmd == 'trial':
        cmd_trial()
    elif cmd == 'record':
        cmd_record(sys.argv[2:])
    elif cmd == 'page':
        pass   # 定義在檔尾，由檔尾的區塊執行
    else:
        raise SystemExit(__doc__ or '用法見檔頭')


def cmd_page():
    """整本試聽頁：每個故事一顆播放器（各頁接起來）＋逐頁文字。不呼叫 API。"""
    rows = []
    for s in DATA['stories']:
        d = os.path.join(WORK, 'stories', s['id'])
        joined = os.path.join(d, f"{s['title']}_整本.mp3")
        concat([os.path.join(d, f'p{n}.mp3') for n in range(1, len(s['pages']) + 1)], joined, gap=1.2)
        b64 = base64.b64encode(open(joined, 'rb').read()).decode()
        text = ''.join(
            f"<div class='pg'><span class='n'>{n}</span><div>" +
            '<br>'.join(f"<b>{html.escape(l['who'])}</b>：{html.escape(l['text'])}" for l in p['lines']) + '</div></div>'
            for n, p in enumerate(s['pages'], 1))
        rows.append(f"<div class='v'><div class='t'>《{s['title']}》</div><audio controls preload='none' src='data:audio/mpeg;base64,{b64}'></audio>{text}</div>")
    page = f"""<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>故事書整本試聽</title>
<style>body{{font:16px/1.7 system-ui,"Microsoft JhengHei",sans-serif;max-width:700px;margin:0 auto;padding:16px;background:#FFF8E7;color:#2b2b2b}}
h1{{font-size:22px}}.v{{background:#fff;border:3px solid #2b2b2b;border-radius:14px;box-shadow:4px 4px 0 #2b2b2b;padding:12px 14px;margin:16px 0}}
.t{{font-weight:700;font-size:19px;margin-bottom:6px}}audio{{width:100%}}p{{color:#555;font-size:14px}}
.pg{{display:flex;gap:10px;margin-top:10px;font-size:15px;color:#444}}.n{{flex:none;width:1.7em;height:1.7em;line-height:1.7em;text-align:center;background:#FFD93D;border:2px solid #2b2b2b;border-radius:50%;font-weight:700}}</style>
<h1>故事書整本試聽</h1>
<p>旁白 Yui，小熊與小公主用童聲。每頁之間停 1.2 秒。聽到念錯、語氣怪或聲音不對的，告訴我第幾頁哪一句，那一頁可以單獨重錄。</p>
{''.join(rows)}</html>"""
    dst = os.path.join(WORK, '試聽_故事書整本.html')
    open(dst, 'w', encoding='utf-8').write(page)
    print('寫出', dst, os.path.getsize(dst) // 1024, 'KB')


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'page':
    cmd_page()
