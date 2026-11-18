# 故事書插圖 → 著色線稿（2026-11-18）。
# 故事書的角色／道具圖本身就是「白底、黑粗框、平塗」，直接把黑線抽出來就是著色線稿，不用再叫 Codex 畫。
# 做法：只留「暗且不帶顏色」的像素（最亮通道 < 95、通道差 < 45）當線，其餘變白，裁到主體留一成白邊，
#       存到 assets/lineart-src/story/<id>.png（黑白小檔，進版本庫），再交給 make_stencil.py 轉成 assets/lineart/story-<id>.png。
# 原圖在 _tts/art/<書>/（不進版本庫）；清單就是下面的 ITEMS，網站上的名字與分類寫在 js/lineart-stories.js。
# 不適合的：整隻黑色的（黑牛、蝌蚪）會變一整塊黑；背景圖線太細會漏色，要另外請 Codex 重畫。
# 用法：python tools/make_story_lineart.py [id ...]   （不給 id＝全部重做）；加 --debug-regions 另存封閉區檢查圖
import sys, subprocess, os, numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, '_tts', 'art')
SRC_DIR = os.path.join(ROOT, 'assets', 'lineart-src', 'story')
OUT_DIR = os.path.join(ROOT, 'assets', 'lineart')

# id: 故事書插圖的相對路徑（_tts/art 底下）
ITEMS = {
  # 公主城堡
  'princess-pink':     'frog-prince/chars/princess.png',
  'pinky-promise':     'frog-prince/pinky_promise.png',
  'rapunzel':          'rapunzel/chars/rapunzel.png',
  'rapunzel-birds':    'rapunzel/rapunzel_wow.png',
  'ella-dance':        'cinderella/ella_dance.png',
  'fairy-godmother':   'cinderella/fairy_cast.png',
  'crystal-slipper':   'cinderella/slipper.png',
  'prince':            'cinderella/prince_bow.png',
  'snow-princess':     'snow-white/chars/snow.png',
  'magic-mirror':      'snow-white/mirror_gentle.png',
  'queen':             'snow-white/queen_apple.png',
  'change-rabbit':     'chang-e/change_rabbit_wave.png',
  'golden-harp':       'jack-beanstalk/harp_sing.png',
  # 動物
  'wolf-nightcap':     'red-hood/wolf_grin.png',
  'wolf-wave':         'red-hood/wolf_peek.png',
  'tiger':             'zodiac/chars/tiger.png',
  'dragon':            'zodiac/chars/dragon.png',
  'horse':             'zodiac/chars/horse.png',
  'white-pony':        'cinderella/horse.png',
  'rooster':           'zodiac/chars/rooster.png',
  'snake':             'zodiac/chars/snake.png',
  'sheep':             'zodiac/chars/goat.png',
  'mouse':             'zodiac/chars/rat.png',
  'mouse-coachman':    'cinderella/mouse_coachman.png',
  'puppy':             'chang-e/chars/dog.png',
  'kitten-nap':        'zodiac/cat_sleep.png',
  'cow':               'jack-beanstalk/chars/cow.png',
  'hen-egg':           'jack-beanstalk/hen_egg.png',
  'rabbit-pound':      'chang-e/rabbit_pound.png',
  'bear-pajamas':      'bear-bedtime/chars/bear_pj.png',
  'mama-bear-book':    'bear-bedtime/mama_book.png',
  'turtle':            'tadpole/chars/turtle.png',
  'frog-mama':         'tadpole/chars/frogmom.png',
  'frog-pillow':       'frog-prince/frog_pillow.png',
  'clownfish':         'water-drop/chars/fish.png',
  'white-bird':        'hansel-gretel/bird_fly.png',
  'blue-bird':         'rapunzel/chars/bird.png',
  # 故事書（人物與道具）
  'red-hood':          'red-hood/chars/girl.png',
  'red-hood-skip':     'red-hood/girl_skip.png',
  'candy-witch':       'hansel-gretel/witch_invite.png',
  'gretel-lollipop':   'hansel-gretel/sister_lick.png',
  'nian':              'nian/chars/nian.png',
  'nian-hop':          'nian/nian_hop.png',
  'mei':               'nian/chars/mei.png',
  'dwarf':             'snow-white/chars/dot.png',
  'jack-climb':        'jack-beanstalk/jack_climb.png',
  'teacup-peek':       'jack-beanstalk/cup_peek.png',
  'giant':             'jack-beanstalk/chars/giant.png',
  'king':              'frog-prince/king_smile.png',
  'moon':              'bear-bedtime/chars/moon.png',
  'sun':               'wind-sun/chars/sun.png',
  'wind-sun-friends':  'wind-sun/wind_sun_friends.png',
  'water-drop':        'water-drop/chars/drop.png',
  'drops-hug':         'water-drop/drops_hug.png',
  'smile-flower':      'water-drop/chars/flower.png',
  'apple-friend':      'food-journey/apple_hi.png',
  'tooth':             'food-journey/chars/tooth.png',
  'big-pumpkin':       'cinderella/pumpkin.png',
}

def extract(src, dst):
  a = np.asarray(Image.open(src).convert('RGB')).astype(int)
  mx, mn = a.max(2), a.min(2)
  dark = (mx < 95) & ((mx - mn) < 45)
  # 裁到主體（四周留一成白邊、補成正方形）：有些原圖主體只佔中間一小塊，不裁的話畫面上會太小、線太細
  ys, xs = np.nonzero(dark)
  y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
  side = int(max(y1 - y0, x1 - x0) * 1.2)
  canvas = np.full((side, side), 255, np.uint8)
  oy, ox = (side - (y1 - y0)) // 2, (side - (x1 - x0)) // 2
  canvas[oy:oy + y1 - y0, ox:ox + x1 - x0] = np.where(dark[y0:y1, x0:x1], 0, 255)
  Image.fromarray(canvas, 'L').save(dst, optimize=True)

if __name__ == '__main__':
  debug = '--debug-regions' in sys.argv
  ids = [a for a in sys.argv[1:] if not a.startswith('--')] or list(ITEMS)
  os.makedirs(SRC_DIR, exist_ok=True)
  for i in ids:
    src = os.path.join(SRC_DIR, i + '.png')
    extract(os.path.join(ART, ITEMS[i]), src)
    cmd = [sys.executable, os.path.join(ROOT, 'tools', 'make_stencil.py'), src, os.path.join(OUT_DIR, 'story-' + i + '.png')]
    if debug: cmd.append('--debug-regions')
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(i, [l for l in r.stdout.splitlines() if l.startswith('regions')])
