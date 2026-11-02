# 把白底的彩色圖（Codex 依著色線稿上色的成品）轉成遊戲要的兩種圖：
#   --sticker  透明底貼紙：從四邊灌水把相連的白底挖掉，貼著線條的抗鋸齒邊緣「去白邊」，裁到主體、最長邊 512。
#   --picture  拼圖／單字圖：主體疊在兩層淡色圓角方塊上，1024 正方形（跟以前 Kenney 圖的底色框同一個樣子）。
# 用法：python tools/make_color_art.py assets/color-src/x.png [--sticker assets/stickers/x.png] [--picture assets/pictures/x.png] [--bg 外框色,內框色]
# 主體內部的白色（眼睛反光、白色身體）因為被黑線圍住、跟四邊不相連，不會被挖掉；只需要 Pillow 與 numpy。
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from collections import deque

def opt(name, default=None):
  return sys.argv[sys.argv.index(name)+1] if name in sys.argv else default

src = sys.argv[1]
sticker, picture = opt('--sticker'), opt('--picture')
bg = opt('--bg', '#C9E6D4,#E6F6EC').split(',')

rgb = np.array(Image.open(src).convert('RGB')).astype(np.float32)
H, W = rgb.shape[:2]

# 近白（三色都 ≥ 232）的像素才算底；從四邊每個近白點灌水（四連通），相連的才是背景
# （Pillow 12 的 ImageDraw.floodfill 對 L 模式不動作，所以自己用 deque 走，跟 make_stencil.py 同一套）
white = rgb.min(axis=2) >= 232
bgmask = np.zeros((H, W), bool)
q = deque((y, x) for x in range(W) for y in (0, H-1) if white[y, x])
q.extend((y, x) for y in range(H) for x in (0, W-1) if white[y, x])
for y, x in q: bgmask[y, x] = True
while q:
  cy, cx = q.popleft()
  for ny, nx in ((cy-1, cx), (cy+1, cx), (cy, cx-1), (cy, cx+1)):
    if 0 <= ny < H and 0 <= nx < W and white[ny, nx] and not bgmask[ny, nx]:
      bgmask[ny, nx] = True; q.append((ny, nx))

# 去白邊：背景外擴 3px 的那一圈，把「疊在白底上的半透明」反推回來（alpha = 離白多遠，顏色除回去）
band = (np.array(Image.fromarray(bgmask.astype(np.uint8)*255).filter(ImageFilter.MaxFilter(7))) > 0) & ~bgmask
alpha = np.full((H, W), 255.0)
alpha[bgmask] = 0
a = ((255 - rgb.min(axis=2)) / 255).clip(0.0, 1.0)
a_band = np.maximum(a[band], 1/255)
rgb[band] = (255 - (255 - rgb[band]) / a_band[:, None]).clip(0, 255)
alpha[band] = a[band] * 255
rgba = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')

# 裁到主體（四周留 3%）
ys, xs = np.nonzero(alpha > 8)
pad = round(max(W, H) * 0.03)
box = (max(0, xs.min()-pad), max(0, ys.min()-pad), min(W, xs.max()+1+pad), min(H, ys.max()+1+pad))
subject = rgba.crop(box)
print('subject box', box, 'size', subject.size)

if sticker:
  s = 512 / max(subject.size)
  st = subject.resize((round(subject.width*s), round(subject.height*s)), Image.LANCZOS)
  # 平塗圖 256 色看不出差別，檔案小六成（RGBA 也能用 FASTOCTREE 量化，透明度一起保留）
  st.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(sticker, optimize=True)
  print('sticker', st.size, sticker)

if picture:
  N = 1024
  pic = Image.new('RGBA', (N, N), bg[0])
  ImageDraw.Draw(pic).rounded_rectangle((26, 26, N-27, N-27), radius=102, fill=bg[1])
  s = (N * 0.84) / max(subject.size)
  sub = subject.resize((round(subject.width*s), round(subject.height*s)), Image.LANCZOS)
  pic.alpha_composite(sub, ((N - sub.width)//2, (N - sub.height)//2))
  pic.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(picture, optimize=True)
  print('picture', pic.size, picture)
