/* 蛋糕店的資料表：蛋糕顏色、奶油顏色、裝飾、來點餐的動物客人。

   為什麼獨立一支：跟 stickers-data.js 同一個理由——資料表與程式／磁碟容易走鐘
   （客人圖檔路徑打錯就是破圖，唸的英文打錯不會報錯），切成純資料檔，
   tools/check_cake.js 才能 require 進來對帳。

   蛋糕與裝飾的圖不是圖檔，是 js/cake-draw.js 用顏色現場畫出來的 SVG：
   一層蛋糕要能換六種顏色、疊一到三層、上面再淋奶油，做成圖檔是 6×3×6 種組合。

   欄位：
     id    唯一代號，也是進度存檔裡的值
     word  唸出來的英文（點餐句子也用它）
     fill / top / dark  畫圖用的三個色階：側面、頂面（亮一階）、陰影線（暗一階）
     plural  裝飾的複數（點餐句子「two cherries」用）

   蛋糕用顏色字（pink / yellow…）而不是口味：她在迪士尼美語學過顏色，
   點餐句子「I want a pink cake」她聽得懂；「strawberry cake」要先知道粉紅色＝草莓。
   咖啡色例外唸 chocolate——「chocolate cake」是她本來就會說的字。 */
(function (global) {
  'use strict';

  var FLAVORS = [
    { id: 'pink', word: 'pink', fill: '#FF9EC4', top: '#FFC4DC', dark: '#E07AA3' },
    { id: 'yellow', word: 'yellow', fill: '#FFD93D', top: '#FFE98A', dark: '#E0B520' },
    { id: 'chocolate', word: 'chocolate', fill: '#A0643C', top: '#C08458', dark: '#7A4726' },
    { id: 'purple', word: 'purple', fill: '#B79CFF', top: '#D3C2FF', dark: '#9273E6' },
    { id: 'blue', word: 'blue', fill: '#7CC8F5', top: '#ABDDFA', dark: '#4FA6DB' },
    { id: 'green', word: 'green', fill: '#8EDB8A', top: '#B6EBB3', dark: '#62BC5D' }
  ];

  /* 奶油淋在每一層的頂上。say 是點下去時唸的（「white cream」比單唸 white 清楚是在選奶油） */
  var CREAMS = [
    { id: 'white', word: 'white', fill: '#FFFFFF', say: 'white cream' },
    { id: 'pink', word: 'pink', fill: '#FFB3D1', say: 'pink cream' },
    { id: 'chocolate', word: 'chocolate', fill: '#6B3E22', say: 'chocolate cream' },
    { id: 'yellow', word: 'yellow', fill: '#FFF0A0', say: 'yellow cream' },
    { id: 'blue', word: 'blue', fill: '#BFE6FF', say: 'blue cream' }
  ];

  var TOPPINGS = [
    { id: 'strawberry', word: 'strawberry', plural: 'strawberries' },
    { id: 'cherry', word: 'cherry', plural: 'cherries' },
    { id: 'blueberry', word: 'blueberry', plural: 'blueberries' },
    { id: 'star', word: 'star', plural: 'stars' },
    { id: 'heart', word: 'heart', plural: 'hearts' },
    { id: 'flower', word: 'flower', plural: 'flowers' },
    { id: 'candle', word: 'candle', plural: 'candles' }
  ];

  /* 點餐的客人：沿用貼紙的動物圖（已在 sw.js 預先快取）。
     src 寫成完整字面而不是拼字串，tools/check_precache.js 才掃得到。 */
  var CUSTOMERS = [
    { id: 'bear', word: 'bear', src: 'assets/stickers/bear.svg' },
    { id: 'rabbit', word: 'rabbit', src: 'assets/stickers/rabbit.svg' },
    { id: 'panda', word: 'panda', src: 'assets/stickers/panda.svg' },
    { id: 'pig', word: 'pig', src: 'assets/stickers/pig.svg' },
    { id: 'penguin', word: 'penguin', src: 'assets/stickers/penguin.svg' },
    { id: 'elephant', word: 'elephant', src: 'assets/stickers/elephant.svg' },
    { id: 'monkey', word: 'monkey', src: 'assets/stickers/monkey.svg' },
    { id: 'frog', word: 'frog', src: 'assets/stickers/frog.svg' },
    { id: 'duck', word: 'duck', src: 'assets/stickers/duck.svg' },
    { id: 'unicorn', word: 'unicorn', src: 'assets/stickers/unicorn.svg' }
  ];

  /* 放裝飾時會數出來（「two cherries」），頂上最多七個，所以要到 seven。
     點餐只出到 four（CakeState.MAX_COUNT）：四顆以內一眼看得出數對了沒。 */
  var NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  var CakeData = {
    FLAVORS: FLAVORS,
    CREAMS: CREAMS,
    TOPPINGS: TOPPINGS,
    CUSTOMERS: CUSTOMERS,
    NUMBERS: NUMBERS,
    flavor: function (id) { return find(FLAVORS, id); },
    cream: function (id) { return find(CREAMS, id); },
    topping: function (id) { return find(TOPPINGS, id); },
    customer: function (id) { return find(CUSTOMERS, id); }
  };

  global.CakeData = CakeData;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeData;
})(typeof window !== 'undefined' ? window : globalThis);
