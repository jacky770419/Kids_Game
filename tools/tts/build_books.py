# 新書（2026-11 起的 41 本）上架用：把錄音和插圖轉成遊戲要的檔，不呼叫任何 API。
#   上架清單  tools/tts/stories-new/_上架.json   {"books": ["wind-sun", …]}（選書頁照這個順序排在舊的 6 本後面）
#   來源      錄音 _tts/stories/<id>/pN.mp3（＋en/）、插圖 _tts/art/<id>/*.png（都不進版本庫）
#   產出      assets/books/<id>/N.mp3、N-en.mp3    單聲道 64k（跟舊書一樣）
#             assets/books/<id>/<名字>.png          角色／道具：去背、最長邊 640（_art.json 可以個別指定）
#             assets/books/<id>/bg-<名字>.jpg       背景：3:2、1200×800
#             js/books/<id>-script.js               文字、誰說、逐字時間（格式同 js/story-script.js 的一本）
#   分鏡是手寫的 js/books/<id>.js；全部寫好後跑 node tools/build_books.js 產生書單（js/story-books.js）。
# 跟舊書的差別：舊書整包預先快取、跟著版號重抓；新書在背景一本一本下載、改版不重抓（js/book-sync.js）。
# 用法：python tools/tts/build_books.py [故事id …]     不給＝上架清單全部；已經轉過、來源沒換的檔會跳過
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from build_story import build_page          # noqa: E402  （有 main 保護）
from make_story_art import cutout           # noqa: E402  （有 main 保護）
from PIL import Image                       # noqa: E402

NEW_DIR = os.path.join(HERE, 'stories-new')
ART = os.path.join(ROOT, '_tts', 'art')
WORK = os.path.join(ROOT, '_tts', 'stories')
SHELF = json.load(open(os.path.join(NEW_DIR, '_上架.json'), encoding='utf-8'))['books']
_af = os.path.join(NEW_DIR, '_art.json')
ART_OPT = json.load(open(_af, encoding='utf-8')) if os.path.exists(_af) else {}
DEFAULT_MAX = 640
BG_SIZE = (1200, 800)


def fresh(dst, src):
    return os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)


def do_art(sid, out):
    opt = ART_OPT.get(sid, {})
    holes, maxs, skip = opt.get('holes', {}), opt.get('max', {}), set(opt.get('skip', []))
    src_dir = os.path.join(ART, sid)
    n = 0
    for f in sorted(os.listdir(src_dir)):
        if not f.endswith('.png') or f.startswith('_') or f[:-4] in skip:
            continue
        name = f[:-4]
        src = os.path.join(src_dir, f)
        if name.startswith('bg_'):
            dst = os.path.join(out, name.replace('_', '-') + '.jpg')
            if fresh(dst, src):
                continue
            im = Image.open(src).convert('RGB')
            w, h = im.size
            tw = min(w, round(h * 1.5))
            th = round(tw / 1.5)
            left, top = (w - tw) // 2, (h - th) // 2
            im.crop((left, top, left + tw, top + th)).resize(BG_SIZE, Image.LANCZOS).save(dst, quality=84, optimize=True, progressive=True)
        else:
            dst = os.path.join(out, name.replace('_', '-') + '.png')
            if fresh(dst, src):
                continue
            sub = cutout(src, holes.get(name))
            s = maxs.get(name, DEFAULT_MAX) / max(sub.size)
            im = sub.resize((round(sub.width * s), round(sub.height * s)), Image.LANCZOS)
            im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(dst, optimize=True)
        n += 1
    return n


def do_book(sid):
    s = json.load(open(os.path.join(NEW_DIR, sid + '.json'), encoding='utf-8'))
    out = os.path.join(ROOT, 'assets', 'books', sid)
    os.makedirs(out, exist_ok=True)
    for n in range(1, len(s['pages']) + 1):
        for lang in ('zh', 'en'):
            p = os.path.join(WORK, sid, '' if lang == 'zh' else 'en', f'p{n}.timing.json')
            if not os.path.exists(p):
                raise SystemExit(f'{sid} 第 {n} 頁（{lang}）還沒錄：{p}')
    pages = []
    for n, page in enumerate(s['pages'], 1):
        entry = {}
        for lang in ('zh', 'en'):
            name = f'{n}.mp3' if lang == 'zh' else f'{n}-en.mp3'
            entry[lang], _ = build_page(sid, n, page, lang, dst=os.path.join(out, name), url=f'assets/books/{sid}/{name}')
        pages.append(entry)
    art = do_art(sid, out)
    data = {'id': sid, 'title': {'zh': s['title'], 'en': s['title_en']}, 'pages': pages}
    js = ('/* 由 tools/tts/build_books.py 產生，不要手改：' + s['title'] + '的文字、誰說、每句與每個字元的時間。\n'
          '   要改故事內容，改 tools/tts/stories-new/' + sid + '.json、重錄那一頁、再重跑那支。 */\n'
          'StoryData.addScript(' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ');\n')
    open(os.path.join(ROOT, 'js', 'books', sid + '-script.js'), 'w', encoding='utf-8', newline='\n').write(js)
    size = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
    print(f'{sid}：{len(pages)} 頁、圖新轉 {art} 張；assets/books/{sid} 共 {size // 1024} KB；script {len(js) // 1024} KB')


for sid in (sys.argv[1:] or SHELF):
    do_book(sid)
