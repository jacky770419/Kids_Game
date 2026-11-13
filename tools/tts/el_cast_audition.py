# 新角色聲音試鏡頁（第一輪：只抓聲音庫官方試音檔，不呼叫生成、不扣點）。
# 用法：python tools/tts/el_cast_audition.py
# 產出：_tts/audition2/*.mp3、_tts/試聽_新角色候選.html（音檔內嵌，單檔就能聽）、_tts/audition2/picks.json
# 中文聲音優先抓聲音庫裡「中文」那一段試音（verified_languages），沒有才用預設試音。
# 候選名字＝帳號內聲音名字的一段，或聲音庫名字的開頭；帳號裡的 tdj_xxx_／kids_ 前綴會先去掉再去聲音庫找。
import base64, html, json, os, re, sys, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from el_common import api, _key

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
WORK = os.path.join(ROOT, '_tts')
OUT = os.path.join(WORK, 'audition2')
os.makedirs(OUT, exist_ok=True)

# (角色類型, 用在哪) → 中文候選、英文候選：(名字的一段, 說明)
GROUPS = [
    ('國王・老爺爺', '灰姑娘的國王、太陽公公、老爺爺', [
        ('Hardy', '台灣口音，親切的「台灣阿伯」'),
        ('James Gao', '中年，平穩友善'),
        ('Da Fei', '台灣口音，說故事型男聲'),
    ], [
        ('Grandfather Joe', '英國腔，溫暖慈祥的老爺爺'),
        ('Mr. Claus', '低沉溫暖、愛笑的老爺爺（聖誕老公公型）'),
        ('@Bill', '內建聲音，沉穩睿智的長者'),
    ]),
    ('王后・巫婆', '灰姑娘的繼母、白雪公主的王后、糖果屋的巫婆', [
        ('Stella Gu', '冷淡、高傲（適合愛使喚人的繼母）'),
        ('Hua Feng', '低沉溫暖的大嬸'),
        ('YT', '台灣口音，很低很平穩'),
    ], [
        ('Daria - Funny', '英國腔，好笑不恐怖的巫婆，標明適合兒童有聲書'),
        ('Kristen – Cold', '冷豔的壞王后（比較兇）'),
        ('Elariel', '英國腔，有氣勢的女王'),
    ]),
    ('王子', '灰姑娘、白雪公主、長髮公主的王子', [
        ('Yao Yuan Wu', '台灣口音，溫暖甜'),
        ('Devon', '台灣口音，自然溫和'),
        ('Chen 23', '台灣口音，清爽的二十多歲'),
    ], [
        ('Arthur - Deep and Powerful King', '年輕沉穩，有王者感'),
        ('Anthony Francis', '年輕、輕柔'),
        ('Prince - London guy', '英國腔，年輕有魅力'),
    ]),
    ('仙女・媽媽', '仙女、小紅帽的媽媽、熊媽媽', [
        ('Shusita', '台灣口音，溫暖有磁性'),
        ('Nydia', '台灣口音，甜美溫暖'),
        ('Angel - Narration', '台灣口音，標明適合兒童故事'),
    ], [
        ('Linda – Gentle Mom', '溫柔的睡前媽媽，慢慢說'),
        ('Flicker', '英國腔，可愛閃亮的小仙女'),
        ('Holly - Engaging, Cheerful', '開朗、有戲，標明適合兒童書'),
    ]),
    ('巨人・怪獸', '傑克與魔豆的巨人、年獸、北風、老虎', [
        ('WangSong', '低沉、有共鳴'),
        ('Haoran', '低沉有磁性'),
        ('Jerry Lin', '台灣口音，低沉有威嚴'),
    ], [
        ('Austin - Deep, Raspy', '低沉沙啞、憨厚的大個子'),
        ('Wolfgang - Deep, Resonant', '低沉渾厚、有說書人味道'),
        ('Azgar', '很低很粗的怪獸聲（比較兇）'),
    ]),
    ('小男孩', '傑克、漢賽爾、桃太郎', [
        ('Xiaobao', '台灣口音，年輕有活力的男聲'),
        ('童_男', '現有的小熊聲音（男孩童聲），會跟小熊撞聲'),
        ('Akun', '台灣口音，溫暖、嘴快的年輕男生'),
    ], [
        ('Ryan Quin', '溫和安靜的小男孩'),
        ('Austin - Timid', '害羞的小男孩'),
        ('Quang Anh', '明亮的小男孩'),
    ]),
    ('神仙', '玉皇大帝、神燈精靈、女媧、月亮上的神仙', [
        ('Neil Chuang', '台灣口音，渾厚低沉'),
        ('Martin Li', '沙啞嚴肅'),
        ('Juin', '台灣口音，成熟正式'),
    ], [
        ('Myrrdin', '英國腔，很老的魔法師'),
        ('Older Joe', '英國腔，沉穩有權威'),
        ('Frank - Wise', '低沉睿智'),
    ]),
    ('少女主角', '灰姑娘、小紅帽、長髮公主（比現有的小公主童聲大一點）', [
        ('Yu-Ting', '台灣口音，明亮年輕'),
        ('Anna Su', '台灣口音，年輕活潑友善'),
        ('Wen Wen', '台灣口音，溫柔自然'),
    ], [
        ('Libby - Animated', '明亮溫柔的女高音，故事書感'),
        ('Emmaline', '英國腔，年輕小女孩'),
        ('Ivy - Spirited', '活潑有冒險感的女孩'),
    ]),
]

mine = api('/v1/voices')['voices']
_cache = {}


def lib_search(name):
    if name not in _cache:
        _cache[name] = api('/v1/shared-voices', query={'search': name, 'page_size': 20}).get('voices', [])
    return _cache[name]


def strip(n):
    n = re.sub(r'^(tdj_[^_]+_|kids_)', '', n)
    return n


def pick_preview(v, lang):
    if lang == 'zh':
        best = None
        for e in v.get('verified_languages') or []:
            if e.get('language') == 'zh' and e.get('preview_url'):
                if best is None or e.get('model_id') in ('eleven_v4', 'eleven_multilingual_v2'):
                    best = e
        if best:
            return best['preview_url'], '中文試音'
    return v.get('preview_url'), '預設試音'


def find(part, lang):
    """回 (顯示名, 在帳號裡的名字或 None, 試音網址, 試音種類)。"""
    if part.startswith('@'):
        for v in mine:
            if v['name'].startswith(part[1:]) and v.get('category') == 'premade':
                return v['name'], v['name'], v.get('preview_url'), '預設試音'
        raise SystemExit('找不到內建聲音 ' + part)
    acc = next((v for v in mine if part in v['name']), None)
    q = strip(acc['name']) if acc else part
    lib = [v for v in lib_search(q[:40]) if v['name'].startswith(q) or (not acc and part in v['name'])]
    if not lib:
        lib = [v for v in lib_search(re.split(r' [-–] ', q)[0]) if v['name'].startswith(q)]
    if lib:
        url, kind = pick_preview(lib[0], lang)
        return lib[0]['name'], acc['name'] if acc else None, url, kind
    if acc and acc.get('preview_url'):
        return acc['name'], acc['name'], acc['preview_url'], '帳號內試音'
    raise SystemExit(f'找不到候選 {part}')


def fetch(url, dst):
    if os.path.exists(dst):
        return
    req = urllib.request.Request(url)
    if 'elevenlabs.io' in url:
        req.add_header('xi-api-key', _key())
    with urllib.request.urlopen(req, timeout=120) as r:
        open(dst, 'wb').write(r.read())


def slug(s):
    return re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-')[:28]


rows, picks = [], []
for gi, (role, use, zh, en) in enumerate(GROUPS, 1):
    rows.append(f"<h2>{gi}. {html.escape(role)}</h2><p>{html.escape(use)}</p>")
    for lang, items in (('zh', zh), ('en', en)):
        rows.append(f"<div class='lang'>{'中文' if lang == 'zh' else '英文'}</div>")
        for k, (part, note) in enumerate(items):
            letter = 'ABC'[k]
            name, acc, url, kind = find(part, lang)
            fn = os.path.join(OUT, f'{gi}{lang}{letter}_{slug(name)}.mp3')
            try:
                fetch(url, fn)
            except Exception as e:
                print('試音檔抓不到，跳過', name, e)
                continue
            picks.append({'group': gi, 'role': role, 'lang': lang, 'key': f'{gi}{"中" if lang == "zh" else "英"}{letter}',
                          'find': part, 'name': name, 'in_account': acc, 'note': note})
            b64 = base64.b64encode(open(fn, 'rb').read()).decode()
            rows.append(f"<div class='v'><div class='t'><b>{letter}</b> {html.escape(name)}"
                        f"{' <span class=acc>帳號已有</span>' if acc else ''} <span class='kind'>{kind}</span></div>"
                        f"<div class='d'>{html.escape(note)}</div>"
                        f"<audio controls preload='none' src='data:audio/mpeg;base64,{b64}'></audio></div>")
            print(gi, lang, letter, name, '|', kind, '|', '帳號已有' if acc else '聲音庫', os.path.getsize(fn) // 1024, 'KB')

json.dump(picks, open(os.path.join(OUT, 'picks.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
page = f'''<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>新角色聲音試聽</title>
<style>body{{font:16px/1.6 system-ui,"Microsoft JhengHei",sans-serif;max-width:680px;margin:0 auto;padding:16px;background:#FFF8E7;color:#2b2b2b}}
h1{{font-size:22px}}h2{{font-size:19px;margin:30px 0 0;border-bottom:3px solid #2b2b2b;padding-bottom:4px}}
.lang{{font-weight:700;margin:14px 0 0;color:#8a5a00}}
.v{{background:#fff;border:3px solid #2b2b2b;border-radius:14px;box-shadow:4px 4px 0 #2b2b2b;padding:10px 14px;margin:10px 0}}
.t b{{display:inline-block;min-width:1.6em;height:1.6em;line-height:1.6em;text-align:center;background:#FFD93D;border:2px solid #2b2b2b;border-radius:50%;margin-right:6px}}
.acc,.kind{{font-size:12px;border:1.5px solid #2b2b2b;border-radius:8px;padding:0 6px;margin-left:4px}}.acc{{background:#C8F0D0}}.kind{{background:#eee}}
.d{{color:#666;font-size:14px;margin:2px 0 6px}}audio{{width:100%}}p{{color:#555;font-size:14px;margin:4px 0}}</style>
<h1>新角色聲音試聽</h1>
<p>八種新角色，每種中文三個、英文三個候選。這些是聲音庫官方的試音檔（念的是聲音主人自己的範例句，不是我們的故事），聽音色和口氣就好。
「中文試音」＝聲音庫裡這個聲音念中文的那段；「預設試音」可能是英文。選完之後我再用我們的故事句子各錄一小段給你確認。</p>
{''.join(rows)}</html>'''
dst = os.path.join(WORK, '試聽_新角色候選.html')
open(dst, 'w', encoding='utf-8').write(page)
print('寫出', dst, os.path.getsize(dst) // 1024, 'KB')
