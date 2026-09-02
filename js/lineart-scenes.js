/* 場景系列：點陣線稿（黑線透明底的 800×800 PNG），走跟「上傳照片」一樣的疊桶填色引擎。
   原圖放 assets/lineart-src/，用 tools 腳本轉成 assets/lineart/ 底下的 stencil。
   一整個場景上百個封閉區，適合用 Apple Pencil 之類的筆點小區塊。 */
const LINEART_SCENES = [
  { name: '公主與柴犬在草地', src: 'assets/lineart/princess-dog.png' }
];
window.LINEART_SCENES = LINEART_SCENES;
