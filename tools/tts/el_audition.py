# 候選聲音試聽頁：只抓聲音庫官方的試音檔（preview_url），不呼叫生成、不扣點。
# 用法：python tools/tts/el_audition.py      （在 repo 根目錄或任何地方跑都可以）
# 產出：_tts/audition/*.mp3、_tts/試聽_候選聲音.html（音檔內嵌，單檔就能聽）
import base64, html, json, os, re, urllib.request
from el_common import api

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
WORK = os.path.join(ROOT, '_tts')
OUT = os.path.join(WORK, 'audition')
os.makedirs(OUT, exist_ok=True)

# 候選：聲音庫裡的名字開頭（對 _tts/shared_voices.json）。'@' 開頭＝帳號內建聲音。
PICKS = {
    '英文（唸單字、數數、點餐）': [
        ('Emma - Bright Kids Educator', '明亮、溫暖，兒童教學用'),
        ('Lila - Upbeat Kids Learning', '友善、有精神，兒童學習用'),
        ('Macy - Cheerful, Upbeat and Playful', '開朗活潑，抓小孩注意力'),
        ('Clara - Children', '說故事的溫柔女聲，最沉穩'),
    ],
    '中文（鼓勵與提示，台灣口音）': [
        ('Yui - Delicate', '年輕、柔、可愛'),
        ('Lee Ting Ting', '年輕、溫柔、甜'),
        ('Nydia - Sweet', '甜、溫暖、清楚'),
        ('Lucy - Friendly Taiwanese', '開心、有活力'),
    ],
}

shared = json.load(open(os.path.join(WORK, 'shared_voices.json'), encoding='utf-8'))
mine = api('/v1/voices')['voices']


def find(prefix):
    if prefix.startswith('@'):
        for v in mine:
            if v['name'].startswith(prefix[1:]) and v.get('category') == 'premade':
                return {'name': v['name'], 'voice_id': v['voice_id'], 'public_owner_id': None, 'preview_url': v.get('preview_url')}
    else:
        for v in shared.values():
            if v['name'].startswith(prefix):
                return v
    raise SystemExit('找不到候選：' + prefix)


def slug(s):
    return re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-')[:32]


rows, picked = [], {}
for group, items in PICKS.items():
    rows.append(f'<h2>{html.escape(group)}</h2>')
    picked[group] = []
    for n, (prefix, note) in enumerate(items, 1):
        v = find(prefix)
        fn = os.path.join(OUT, f"{'en' if group.startswith('英') else 'zh'}{n}_{slug(v['name'])}.mp3")
        if not os.path.exists(fn):
            with urllib.request.urlopen(v['preview_url'], timeout=120) as r:   # 公開試音檔，不帶金鑰
                open(fn, 'wb').write(r.read())
        b64 = base64.b64encode(open(fn, 'rb').read()).decode()
        picked[group].append({'n': n, 'name': v['name'], 'voice_id': v['voice_id'], 'public_owner_id': v.get('public_owner_id'), 'note': note})
        rows.append(f'<div class="v"><div class="t"><b>{n}</b> {html.escape(v["name"])}</div>'
                    f'<div class="d">{html.escape(note)}</div>'
                    f'<audio controls preload="none" src="data:audio/mpeg;base64,{b64}"></audio></div>')
        print(group[:2], n, v['name'], os.path.getsize(fn) // 1024, 'KB')

json.dump(picked, open(os.path.join(WORK, 'audition_picks.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
page = f'''<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>候選聲音試聽</title>
<style>body{{font:16px/1.6 system-ui,"Microsoft JhengHei",sans-serif;max-width:680px;margin:0 auto;padding:16px;background:#FFF8E7;color:#2b2b2b}}
h1{{font-size:22px}}h2{{font-size:18px;margin:28px 0 8px;border-bottom:3px solid #2b2b2b;padding-bottom:4px}}
.v{{background:#fff;border:3px solid #2b2b2b;border-radius:14px;box-shadow:4px 4px 0 #2b2b2b;padding:10px 14px;margin:12px 0}}
.t b{{display:inline-block;min-width:1.6em;height:1.6em;line-height:1.6em;text-align:center;background:#FFD93D;border:2px solid #2b2b2b;border-radius:50%;margin-right:6px}}
.d{{color:#666;font-size:14px;margin:2px 0 6px}}audio{{width:100%}}p{{color:#555;font-size:14px}}</style>
<h1>候選聲音試聽</h1>
<p>這些是聲音庫官方的試音檔（每個聲音念自己的範例句，不是我們的句子），聽音色和口氣就好。選出各兩三個之後，再用我們的句子各錄幾句比較。</p>
{''.join(rows)}</html>'''
dst = os.path.join(WORK, '試聽_候選聲音.html')
open(dst, 'w', encoding='utf-8').write(page)
print('寫出', dst, os.path.getsize(dst) // 1024, 'KB')
