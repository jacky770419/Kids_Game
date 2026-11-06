/* 拼圖圖片清單。
   想加女兒的照片：把照片（jpg/png 都可以）放進 assets/pictures/，
   然後在下面照格式加一行即可，例如：
   { name: '我們的合照', src: 'assets/pictures/family.jpg', word: 'family' },

   主角圖（動物、車、公主）一律用 assets/puzzle/ 的滿版場景：白底或單色底框切成 3×3 時，
   好幾塊都是一模一樣的空白，五歲小孩拼不出來（2026-11-06 使用者回報）。單字卡仍用 assets/pictures/ 的去背框圖。

   word 欄是拼完之後語音要唸的英文字（全小寫）——拼圖拼完的那一刻是她注意力最集中的時候，
   順便把圖的英文名唸一次，等於免費多一次單字輸入。 */
const PICTURES = [
  { name: '彩虹小屋', src: 'assets/pictures/house.svg', word: 'house' },
  { name: '海底世界', src: 'assets/pictures/sea.svg', word: 'sea' },
  { name: '小熊', src: 'assets/pictures/bear.svg', word: 'bear' },
  { name: '小火箭', src: 'assets/pictures/rocket.svg', word: 'rocket' },
  { name: '夢幻城堡', src: 'assets/puzzle/castle.jpg', word: 'castle' },
  { name: '小公主', src: 'assets/puzzle/princess.jpg', word: 'princess' },
  { name: '辮子公主', src: 'assets/puzzle/princess-braid.jpg', word: 'princess' },
  { name: '美人魚公主', src: 'assets/puzzle/mermaid.jpg', word: 'mermaid' },
  /* 動物系列：著色頁的動物線稿由 Codex 上色，再請 Codex 畫成滿版場景（assets/puzzle-src/ → 1024 JPEG） */
  { name: '棕熊', src: 'assets/puzzle/bear.jpg', word: 'bear' },
  { name: '貓熊', src: 'assets/puzzle/panda.jpg', word: 'panda' },
  { name: '小兔子', src: 'assets/puzzle/rabbit.jpg', word: 'rabbit' },
  { name: '小豬', src: 'assets/puzzle/pig.jpg', word: 'pig' },
  { name: '青蛙', src: 'assets/puzzle/frog.jpg', word: 'frog' },
  { name: '小鴨', src: 'assets/puzzle/duck.jpg', word: 'duck' },
  { name: '大象', src: 'assets/puzzle/elephant.jpg', word: 'elephant' },
  { name: '長頸鹿', src: 'assets/puzzle/giraffe.jpg', word: 'giraffe' },
  { name: '企鵝', src: 'assets/puzzle/penguin.jpg', word: 'penguin' },
  { name: '小猴子', src: 'assets/puzzle/monkey.jpg', word: 'monkey' },
  { name: '貓頭鷹', src: 'assets/puzzle/owl.jpg', word: 'owl' },
  { name: '鯨魚', src: 'assets/puzzle/whale.jpg', word: 'whale' },
  /* 車車系列：同上，滿版場景（馬路、工地、農場…） */
  { name: '消防車', src: 'assets/puzzle/fire-truck.jpg', word: 'fire truck' },
  { name: '警車', src: 'assets/puzzle/police-car.jpg', word: 'police car' },
  { name: '救護車', src: 'assets/puzzle/ambulance.jpg', word: 'ambulance' },
  { name: '公車', src: 'assets/puzzle/bus.jpg', word: 'bus' },
  { name: '垃圾車', src: 'assets/puzzle/garbage-truck.jpg', word: 'garbage truck' },
  { name: '怪手', src: 'assets/puzzle/excavator.jpg', word: 'excavator' },
  { name: '水泥攪拌車', src: 'assets/puzzle/cement-mixer.jpg', word: 'cement mixer' },
  { name: '小火車', src: 'assets/puzzle/train.jpg', word: 'train' },
  { name: '賽車', src: 'assets/puzzle/race-car.jpg', word: 'race car' },
  { name: '冰淇淋車', src: 'assets/puzzle/ice-cream-truck.jpg', word: 'ice cream truck' },
  { name: '拖拉機', src: 'assets/puzzle/tractor.jpg', word: 'tractor' },
  { name: '砂石車', src: 'assets/puzzle/dump-truck.jpg', word: 'dump truck' }
];
