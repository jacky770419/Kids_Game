/* 場景系列：點陣線稿（黑線透明底的 800×800 PNG），走跟「上傳照片」一樣的疊桶填色引擎。
   原圖放 assets/lineart-src/，用 tools 腳本轉成 assets/lineart/ 底下的 stencil。
   一整個場景上百個封閉區，適合用 Apple Pencil 之類的筆點小區塊。 */
const LINEART_SCENES = [
  { name: '公主與柴犬在草地', src: 'assets/lineart/princess-dog.png' },
  { name: '熊貓吃竹子', src: 'assets/lineart/panda-bamboo.png' },
  { name: '冰淇淋與杯子蛋糕', src: 'assets/lineart/icecream-cupcake.png' },
  { name: '動物們的下午茶', src: 'assets/lineart/animal-teaparty.png' },
  { name: '三朵向日葵', src: 'assets/lineart/sunflowers.png' },
  { name: '小象與小鳥', src: 'assets/lineart/elephant-bird.png' },
  { name: '水果籃', src: 'assets/lineart/fruit-basket.png' },
  { name: '樹上的小松鼠', src: 'assets/lineart/squirrel-tree.png' }
];
window.LINEART_SCENES = LINEART_SCENES;
