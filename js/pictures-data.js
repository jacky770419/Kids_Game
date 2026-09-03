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
  { name: '夢幻城堡', src: 'assets/pictures/castle.svg', word: 'castle' },
  { name: '小公主', src: 'assets/pictures/princess.svg', word: 'princess' },
  { name: '辮子公主', src: 'assets/pictures/princess-braid.svg', word: 'princess' },
  { name: '美人魚公主', src: 'assets/pictures/mermaid.svg', word: 'mermaid' },
  /* 動物系列：Kenney「Animal Pack Redux」round (outline)，CC0 授權 */
  { name: '棕熊', src: 'assets/pictures/animals/bear.svg', word: 'bear' },
  { name: '貓熊', src: 'assets/pictures/animals/panda.svg', word: 'panda' },
  { name: '小兔子', src: 'assets/pictures/animals/rabbit.svg', word: 'rabbit' },
  { name: '小豬', src: 'assets/pictures/animals/pig.svg', word: 'pig' },
  { name: '青蛙', src: 'assets/pictures/animals/frog.svg', word: 'frog' },
  { name: '小鴨', src: 'assets/pictures/animals/duck.svg', word: 'duck' },
  { name: '大象', src: 'assets/pictures/animals/elephant.svg', word: 'elephant' },
  { name: '長頸鹿', src: 'assets/pictures/animals/giraffe.svg', word: 'giraffe' },
  { name: '企鵝', src: 'assets/pictures/animals/penguin.svg', word: 'penguin' },
  { name: '小猴子', src: 'assets/pictures/animals/monkey.svg', word: 'monkey' },
  { name: '貓頭鷹', src: 'assets/pictures/animals/owl.svg', word: 'owl' },
  { name: '鯨魚', src: 'assets/pictures/animals/whale.svg', word: 'whale' }
];
