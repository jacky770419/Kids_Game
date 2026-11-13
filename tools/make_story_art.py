# 故事書的圖：把 Codex 畫的原圖（assets/story-src/）轉成遊戲用的檔。
#   角色（白底 PNG）→ assets/story/chars/<名字>.png   透明底、裁到主體、256 色
#   背景（bg_ 開頭）→ assets/story/bg/<名字>.jpg     裁成 3:2、1200×800
# 用法：python tools/make_story_art.py            全部重轉（冪等）
#       python tools/make_story_art.py bear_walk   只轉指定的（不含副檔名）
# 去背做法跟 tools/make_color_art.py 的 --sticker 一樣（從四邊灌水挖掉相連的白底、
# 貼著線條的那一圈反推半透明去白邊）；差別只在角色大小不一：長頸鹿在舞台上佔九成高，
# 512 會糊，所以每個角色可以指定最長邊。只需要 Pillow 與 numpy。
import os, sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SRC = os.path.join(ROOT, 'assets', 'story-src')
CHARS = os.path.join(ROOT, 'assets', 'story', 'chars')
BG = os.path.join(ROOT, 'assets', 'story', 'bg')

DEFAULT_MAX = 640
MAX_SIDE = {'giraffe_stand': 960, 'giraffe_bend': 900, 'unicorn_ride': 760, 'princess_bed': 760,
            'frog_sit': 360, 'frog_jump': 420, 'bear_sleep': 560,
            'house_straw': 760, 'house_wood': 760, 'house_brick': 760,
            'tortoise_walk': 520, 'tortoise_cheer': 520}
BG_SIZE = (1200, 800)
# 網子的格子會把白底圍起來，從四邊灌水灌不進去：這幾張另外把「被圍住、面積夠大」的白色塊也挖掉。
# 數字＝最小面積（原圖像素）；獅子眼睛的反光點約 230，網子圍出來的白縫最小約 310
HOLES = {'net_torn': 0, 'lion_net': 280}


def fill_holes(white, bg, min_area):
    """把沒連到四邊、面積 ≥ min_area 的白色連通塊也當成底。"""
    H, W = white.shape
    seen = bg.copy()
    for y0, x0 in zip(*np.nonzero(white & ~bg)):
        if seen[y0, x0]:
            continue
        comp = [(y0, x0)]
        seen[y0, x0] = True
        i = 0
        while i < len(comp):
            cy, cx = comp[i]
            i += 1
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < H and 0 <= nx < W and white[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    comp.append((ny, nx))
        if len(comp) >= min_area:
            ys, xs = zip(*comp)
            bg[list(ys), list(xs)] = True


def cutout(path, holes=None):
    rgb = np.array(Image.open(path).convert('RGB')).astype(np.float32)
    H, W = rgb.shape[:2]
    white = rgb.min(axis=2) >= 232
    bg = np.zeros((H, W), bool)
    q = deque((y, x) for x in range(W) for y in (0, H - 1) if white[y, x])
    q.extend((y, x) for y in range(H) for x in (0, W - 1) if white[y, x])
    for y, x in q:
        bg[y, x] = True
    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < H and 0 <= nx < W and white[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                q.append((ny, nx))
    if holes is not None:
        fill_holes(white, bg, holes)
    band = (np.array(Image.fromarray(bg.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(7))) > 0) & ~bg
    alpha = np.full((H, W), 255.0)
    alpha[bg] = 0
    a = ((255 - rgb.min(axis=2)) / 255).clip(0.0, 1.0)
    a_band = np.maximum(a[band], 1 / 255)
    rgb[band] = (255 - (255 - rgb[band]) / a_band[:, None]).clip(0, 255)
    alpha[band] = a[band] * 255
    rgba = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')
    ys, xs = np.nonzero(alpha > 8)
    pad = round(max(W, H) * 0.01)
    return rgba.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(W, xs.max() + 1 + pad), min(H, ys.max() + 1 + pad)))


def do_char(name):
    sub = cutout(os.path.join(SRC, name + '.png'), HOLES.get(name))
    s = MAX_SIDE.get(name, DEFAULT_MAX) / max(sub.size)
    im = sub.resize((round(sub.width * s), round(sub.height * s)), Image.LANCZOS)
    dst = os.path.join(CHARS, name.replace('_', '-') + '.png')
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(dst, optimize=True)
    return dst, im.size


def do_bg(name):
    im = Image.open(os.path.join(SRC, name + '.png')).convert('RGB')
    w, h = im.size
    tw = min(w, round(h * 1.5))
    th = round(tw / 1.5)
    left, top = (w - tw) // 2, (h - th) // 2
    im = im.crop((left, top, left + tw, top + th)).resize(BG_SIZE, Image.LANCZOS)
    dst = os.path.join(BG, name[3:].replace('_', '-') + '.jpg')
    im.save(dst, quality=84, optimize=True, progressive=True)
    return dst, im.size


def main():
    os.makedirs(CHARS, exist_ok=True)
    os.makedirs(BG, exist_ok=True)
    names = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(SRC) if f.endswith('.png'))
    total = 0
    for n in names:
        dst, size = (do_bg if n.startswith('bg_') else do_char)(n)
        total += os.path.getsize(dst)
        print(f'{n:22s} → {os.path.relpath(dst, ROOT):40s} {size[0]}x{size[1]} {os.path.getsize(dst) // 1024} KB')
    print('合計', total // 1024, 'KB')


# 有 main 保護：tools/tts/build_books.py 會 import cutout() 來轉新書的圖（以前沒保護，import 就整批重轉）
if __name__ == '__main__':
    main()
