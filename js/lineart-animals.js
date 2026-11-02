/* 動物著色線稿（15 隻）：點陣線稿（黑線透明底的 PNG stencil），走跟場景、上傳照片同一套疊桶填色引擎。
   2026-11 整批換掉：原本是手繪 SVG（Q 版大頭圓身），認得出是什麼動物但很不像；
   改由 Codex 內建生圖畫兒童著色本風格的線稿，原圖放 assets/lineart-src/，
   用 tools/make_stencil.py 轉成 assets/lineart/ 底下的 stencil。
   每筆只有 name 與 src；name 是進度存檔的 key，跟以前的向量版同名，但引擎不同、舊進度不會接上。
   coloring.js 會讀 window.LINEART_ANIMALS，預設分到「動物」頁籤。 */
const LINEART_ANIMALS = [
  { name: '喵喵貓', src: 'assets/lineart/cat.png' },
  { name: '花蝴蝶', src: 'assets/lineart/butterfly.png' },
  { name: '泡泡魚', src: 'assets/lineart/fish.png' },
  { name: '抱抱熊', src: 'assets/lineart/bear.png' },
  { name: '圓圓貓熊', src: 'assets/lineart/panda.png' },
  { name: '長耳兔', src: 'assets/lineart/rabbit.png' },
  { name: '胖小豬', src: 'assets/lineart/pig.png' },
  { name: '呱呱蛙', src: 'assets/lineart/frog.png' },
  { name: '黃色小鴨', src: 'assets/lineart/duck.png' },
  { name: '大象寶寶', src: 'assets/lineart/elephant.png' },
  { name: '高高長頸鹿', src: 'assets/lineart/giraffe.png' },
  { name: '搖擺企鵝', src: 'assets/lineart/penguin.png' },
  { name: '頑皮小猴', src: 'assets/lineart/monkey.png' },
  { name: '大眼貓頭鷹', src: 'assets/lineart/owl.png' },
  { name: '噴水鯨魚', src: 'assets/lineart/whale.png' }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 是用 window.LINEART_ANIMALS 取值（缺檔時要能安全跳過），所以這裡補一行。 */
window.LINEART_ANIMALS = LINEART_ANIMALS;
