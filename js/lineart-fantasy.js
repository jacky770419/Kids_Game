/* 城堡／公主主題的著色線稿（第二批，11 張）：全部是點陣線稿（黑線透明底的 PNG stencil），
   走跟場景、動物、上傳照片同一套疊桶填色引擎。
   2026-11 整批換掉：原本是手繪 SVG，公主和城堡都畫得生硬；改由 Codex 內建生圖畫兒童著色本風格的線稿，
   原圖放 assets/lineart-src/，用 tools/make_stencil.py 轉成 assets/lineart/ 底下的 stencil。
   每筆只有 name 與 src；name 是進度存檔的 key，跟以前的向量版同名，但引擎不同、舊進度不會接上。
   coloring.js 會讀 window.LINEART_FANTASY，預設分到「公主城堡」頁籤。 */
const LINEART_FANTASY = [
  { name: '棒棒糖城堡', src: 'assets/lineart/castle-lollipop.png' },
  { name: '綿綿雲城堡', src: 'assets/lineart/castle-cloud.png' },
  { name: '花花小公主', src: 'assets/lineart/princess-flower.png' },
  { name: '捲捲髮公主', src: 'assets/lineart/princess-curly.png' },
  { name: '南瓜小馬車', src: 'assets/lineart/pumpkin-carriage.png' },
  { name: '彩虹獨角獸', src: 'assets/lineart/unicorn.png' },
  { name: '公主的城堡', src: 'assets/lineart/princess-castle.png' },
  { name: '閃亮皇冠', src: 'assets/lineart/crown.png' },
  { name: '城堡前的公主', src: 'assets/lineart/princess-front-castle.png' },
  { name: '城堡前的小公主', src: 'assets/lineart/little-princess-castle.png' },
  { name: '公主與小狗', src: 'assets/lineart/princess-puppy.png' }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 是用 window.LINEART_FANTASY 取值（缺檔時要能安全跳過），所以這裡補一行。 */
window.LINEART_FANTASY = LINEART_FANTASY;
