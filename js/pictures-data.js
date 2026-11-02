/* 拼圖圖片清單。
   想加女兒的照片：把照片（jpg/png 都可以）放進 assets/pictures/，
   然後在下面照格式加一行即可，例如：
   { name: '我們的合照', src: 'assets/pictures/family.jpg', word: 'family' },

   word 欄是拼完之後語音要唸的英文字（全小寫）——拼圖拼完的那一刻是她注意力最集中的時候，
   順便把圖的英文名唸一次，等於免費多一次單字輸入。 */
const PICTURES = [
  { name: '彩虹小屋', src: 'assets/pictures/house.svg', word: 'house' },
  { name: '海底世界', src: 'assets/pictures/sea.svg', word: 'sea' },
  { name: '小熊', src: 'assets/pictures/bear.svg', word: 'bear' },
  { name: '小火箭', src: 'assets/pictures/rocket.svg', word: 'rocket' },
  { name: '夢幻城堡', src: 'assets/pictures/castle.png', word: 'castle' },
  { name: '小公主', src: 'assets/pictures/princess.png', word: 'princess' },
  { name: '辮子公主', src: 'assets/pictures/princess-braid.png', word: 'princess' },
  { name: '美人魚公主', src: 'assets/pictures/mermaid.png', word: 'mermaid' },
  /* 動物系列：著色頁的動物線稿由 Codex 上色、tools/make_color_art.py 疊上淡色底框（2026-11 換掉 Kenney 頭像） */
  { name: '棕熊', src: 'assets/pictures/animals/bear.png', word: 'bear' },
  { name: '貓熊', src: 'assets/pictures/animals/panda.png', word: 'panda' },
  { name: '小兔子', src: 'assets/pictures/animals/rabbit.png', word: 'rabbit' },
  { name: '小豬', src: 'assets/pictures/animals/pig.png', word: 'pig' },
  { name: '青蛙', src: 'assets/pictures/animals/frog.png', word: 'frog' },
  { name: '小鴨', src: 'assets/pictures/animals/duck.png', word: 'duck' },
  { name: '大象', src: 'assets/pictures/animals/elephant.png', word: 'elephant' },
  { name: '長頸鹿', src: 'assets/pictures/animals/giraffe.png', word: 'giraffe' },
  { name: '企鵝', src: 'assets/pictures/animals/penguin.png', word: 'penguin' },
  { name: '小猴子', src: 'assets/pictures/animals/monkey.png', word: 'monkey' },
  { name: '貓頭鷹', src: 'assets/pictures/animals/owl.png', word: 'owl' },
  { name: '鯨魚', src: 'assets/pictures/animals/whale.png', word: 'whale' }
];
