/* 車車著色線稿（12 台）：點陣線稿（黑線透明底的 PNG stencil），跟動物系列同一套疊桶填色引擎。
   2026-11 由 Codex 內建生圖畫兒童著色本風格的側面車子（沒有臉），原圖放 assets/lineart-src/，
   用 tools/make_stencil.py 轉成 assets/lineart/ 底下的 stencil。
   每筆只有 name 與 src；name 是進度存檔的 key。coloring.js 會讀 window.LINEART_VEHICLES，預設分到「車車」頁籤。 */
const LINEART_VEHICLES = [
  { name: '消防車', src: 'assets/lineart/fire-truck.png' },
  { name: '警車', src: 'assets/lineart/police-car.png' },
  { name: '救護車', src: 'assets/lineart/ambulance.png' },
  { name: '公車', src: 'assets/lineart/bus.png' },
  { name: '垃圾車', src: 'assets/lineart/garbage-truck.png' },
  { name: '怪手', src: 'assets/lineart/excavator.png' },
  { name: '水泥攪拌車', src: 'assets/lineart/cement-mixer.png' },
  { name: '蒸汽小火車', src: 'assets/lineart/train.png' },
  { name: '賽車', src: 'assets/lineart/race-car.png' },
  { name: '冰淇淋車', src: 'assets/lineart/ice-cream-truck.png' },
  { name: '拖拉機', src: 'assets/lineart/tractor.png' },
  { name: '砂石車', src: 'assets/lineart/dump-truck.png' }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 用 window.LINEART_VEHICLES 取值（缺檔時要能安全跳過）。 */
window.LINEART_VEHICLES = LINEART_VEHICLES;
