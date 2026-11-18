/* 故事書裡的角色著色線稿（2026-11-18）：直接從有聲故事書插圖抽黑線做成的點陣線稿，
   她在故事書裡看過的公主、動物、大野狼，到畫畫這裡是同一張臉。
   轉檔：python tools/make_story_lineart.py（原圖在 _tts/art/，抽出的黑白檔在 assets/lineart-src/story/）。
   每筆寫 cat：公主類放「公主城堡」；「動物」頁一種動物只放一張（2026-11-18 使用者定），
   同種動物的其他故事姿勢（睡帽大野狼、熊媽媽說故事、搗藥的玉兔…）跟其他故事人物與道具放「故事書」頁籤。
   name 是進度存檔的 key，不要跟其他系列重名。 */
const LINEART_STORIES = [
  // 公主城堡
  { name: '粉紅裙公主', cat: 'fantasy', src: 'assets/lineart/story-princess-pink.png' },
  { name: '公主和青蛙打勾勾', cat: 'fantasy', src: 'assets/lineart/story-pinky-promise.png' },
  { name: '長髮公主', cat: 'fantasy', src: 'assets/lineart/story-rapunzel.png' },
  { name: '長髮公主和小鳥', cat: 'fantasy', src: 'assets/lineart/story-rapunzel-birds.png' },
  { name: '跳舞的艾拉', cat: 'fantasy', src: 'assets/lineart/story-ella-dance.png' },
  { name: '仙女變魔法', cat: 'fantasy', src: 'assets/lineart/story-fairy-godmother.png' },
  { name: '水晶鞋', cat: 'fantasy', src: 'assets/lineart/story-crystal-slipper.png' },
  { name: '鞠躬的王子', cat: 'fantasy', src: 'assets/lineart/story-prince.png' },
  { name: '白雪公主', cat: 'fantasy', src: 'assets/lineart/story-snow-princess.png' },
  { name: '魔鏡', cat: 'fantasy', src: 'assets/lineart/story-magic-mirror.png' },
  { name: '皇后', cat: 'fantasy', src: 'assets/lineart/story-queen.png' },
  { name: '嫦娥和玉兔', cat: 'fantasy', src: 'assets/lineart/story-change-rabbit.png' },
  { name: '會唱歌的豎琴', cat: 'fantasy', src: 'assets/lineart/story-golden-harp.png' },
  // 動物
  { name: '揮手的大野狼', cat: 'animal', src: 'assets/lineart/story-wolf-wave.png' },
  { name: '小老虎', cat: 'animal', src: 'assets/lineart/story-tiger.png' },
  { name: '小龍', cat: 'animal', src: 'assets/lineart/story-dragon.png' },
  { name: '小白馬', cat: 'animal', src: 'assets/lineart/story-white-pony.png' },
  { name: '大公雞', cat: 'animal', src: 'assets/lineart/story-rooster.png' },
  { name: '小青蛇', cat: 'animal', src: 'assets/lineart/story-snake.png' },
  { name: '小綿羊', cat: 'animal', src: 'assets/lineart/story-sheep.png' },
  { name: '戴高帽的小老鼠', cat: 'animal', src: 'assets/lineart/story-mouse-coachman.png' },
  { name: '黃色小狗', cat: 'animal', src: 'assets/lineart/story-puppy.png' },
  { name: '乳牛', cat: 'animal', src: 'assets/lineart/story-cow.png' },
  { name: '母雞和金蛋', cat: 'animal', src: 'assets/lineart/story-hen-egg.png' },
  { name: '烏龜爺爺', cat: 'animal', src: 'assets/lineart/story-turtle.png' },
  { name: '小藍鳥', cat: 'animal', src: 'assets/lineart/story-blue-bird.png' },
  // 故事書（人物與道具）
  { name: '戴睡帽的大野狼', cat: 'story', src: 'assets/lineart/story-wolf-nightcap.png' },
  { name: '小馬', cat: 'story', src: 'assets/lineart/story-horse.png' },
  { name: '小老鼠', cat: 'story', src: 'assets/lineart/story-mouse.png' },
  { name: '睡午覺的小貓', cat: 'story', src: 'assets/lineart/story-kitten-nap.png' },
  { name: '搗藥的玉兔', cat: 'story', src: 'assets/lineart/story-rabbit-pound.png' },
  { name: '穿睡衣的小熊', cat: 'story', src: 'assets/lineart/story-bear-pajamas.png' },
  { name: '熊媽媽說故事', cat: 'story', src: 'assets/lineart/story-mama-bear-book.png' },
  { name: '青蛙媽媽', cat: 'story', src: 'assets/lineart/story-frog-mama.png' },
  { name: '枕頭上的青蛙', cat: 'story', src: 'assets/lineart/story-frog-pillow.png' },
  { name: '小丑魚', cat: 'story', src: 'assets/lineart/story-clownfish.png' },
  { name: '小白鳥', cat: 'story', src: 'assets/lineart/story-white-bird.png' },
  { name: '小紅帽', cat: 'story', src: 'assets/lineart/story-red-hood.png' },
  { name: '蹦蹦跳的小紅帽', cat: 'story', src: 'assets/lineart/story-red-hood-skip.png' },
  { name: '糖果巫婆', cat: 'story', src: 'assets/lineart/story-candy-witch.png' },
  { name: '舔棒棒糖的妹妹', cat: 'story', src: 'assets/lineart/story-gretel-lollipop.png' },
  { name: '年獸', cat: 'story', src: 'assets/lineart/story-nian.png' },
  { name: '跳跳年獸', cat: 'story', src: 'assets/lineart/story-nian-hop.png' },
  { name: '過年的小美', cat: 'story', src: 'assets/lineart/story-mei.png' },
  { name: '小矮人', cat: 'story', src: 'assets/lineart/story-dwarf.png' },
  { name: '爬豆莖的傑克', cat: 'story', src: 'assets/lineart/story-jack-climb.png' },
  { name: '茶杯裡的傑克', cat: 'story', src: 'assets/lineart/story-teacup-peek.png' },
  { name: '大巨人', cat: 'story', src: 'assets/lineart/story-giant.png' },
  { name: '國王', cat: 'story', src: 'assets/lineart/story-king.png' },
  { name: '月亮', cat: 'story', src: 'assets/lineart/story-moon.png' },
  { name: '太陽公公', cat: 'story', src: 'assets/lineart/story-sun.png' },
  { name: '北風和太陽', cat: 'story', src: 'assets/lineart/story-wind-sun-friends.png' },
  { name: '小水滴', cat: 'story', src: 'assets/lineart/story-water-drop.png' },
  { name: '水滴抱抱', cat: 'story', src: 'assets/lineart/story-drops-hug.png' },
  { name: '笑臉小花', cat: 'story', src: 'assets/lineart/story-smile-flower.png' },
  { name: '蘋果小弟', cat: 'story', src: 'assets/lineart/story-apple-friend.png' },
  { name: '牙齒寶寶', cat: 'story', src: 'assets/lineart/story-tooth.png' },
  { name: '大南瓜', cat: 'story', src: 'assets/lineart/story-big-pumpkin.png' }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 用 window.LINEART_STORIES 取值（缺檔時要能安全跳過）。 */
window.LINEART_STORIES = LINEART_STORIES;
