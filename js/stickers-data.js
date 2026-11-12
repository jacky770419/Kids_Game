/* 貼紙場景的資料表：三張背景 + 貼紙清單。

   為什麼獨立一支：貼紙圖檔是由 tools/make_stickers.js 產生的，
   資料表與磁碟很容易走鐘（多打一個 id 就是破圖、少引用一個檔那張貼紙就消失，
   兩種都不會報錯）。分開成純資料檔，tools/check_stickers.js 才能 require 進來對帳。

   欄位：
     id   唯一代號，也是 assets/stickers/<id>.svg 的檔名，同時是進度存檔裡的 key
     src  圖檔路徑
     word 唸出來的英文（純小寫字母，check_stickers.js A 項鎖住）
     say  可省略；語音要唸的字串跟 word 不同時才寫（例如 icecream → ice cream）
     cat  分類：princess / animals / fruits / sweets

   為什麼畫面上完全沒有中文標籤：使用者五歲、不識漢字，
   貼紙格與分類頁籤放圖就夠了，字只會佔掉手指要按的面積。 */
(function (global) {
  'use strict';

  var BACKGROUNDS = [
    { id: 'castle', name: '城堡', src: 'assets/backgrounds/castle.svg' },
    { id: 'beach', name: '海邊', src: 'assets/backgrounds/beach.svg' },
    { id: 'forest', name: '森林', src: 'assets/backgrounds/forest.svg' }
  ];

  /* 分類頁籤的顯示順序。rep＝這一類的代表貼紙 id，頁籤上只放那張圖（畫面上不放 emoji、不放字）；
     name 只給 aria-label 用（她不識漢字）。 */
  var CATEGORIES = [
    { id: 'princess', name: '公主', rep: 'princess' },
    { id: 'animals', name: '動物', rep: 'bear' },
    { id: 'fruits', name: '水果', rep: 'strawberry' },
    { id: 'sweets', name: '甜點', rep: 'cupcake' },
    { id: 'vehicles', name: '車車', rep: 'bus' }
  ];

  /* 上色點陣貼紙：Codex 依著色線稿上色、tools/make_color_art.py 去底的 PNG。
     不在這張表裡的仍是 SVG。 */
  var PNG = {
    unicorn: 1, princess: 1, 'princess-braid': 1, mermaid: 1,
    bear: 1, duck: 1, elephant: 1, frog: 1, giraffe: 1, monkey: 1,
    owl: 1, panda: 1, penguin: 1, pig: 1, rabbit: 1, whale: 1,
    'fire-truck': 1, 'police-car': 1, 'ambulance': 1, 'bus': 1, 'garbage-truck': 1, 'excavator': 1, 'cement-mixer': 1, 'train': 1, 'race-car': 1, 'ice-cream-truck': 1, 'tractor': 1, 'dump-truck': 1
  };

  function s(id, word, cat, say) {
    var o = { id: id, src: 'assets/stickers/' + id + (PNG[id] ? '.png' : '.svg'), word: word, cat: cat };
    if (say) o.say = say;
    return o;
  }

  var STICKERS = [
    // 公主（她最愛的一類，放第一個頁籤）
    s('princess', 'princess', 'princess'),
    s('princess-braid', 'princess', 'princess'),
    s('mermaid', 'mermaid', 'princess'),
    s('unicorn', 'unicorn', 'princess'),
    s('rainbow', 'rainbow', 'princess'),
    // 動物
    s('bear', 'bear', 'animals'),
    s('duck', 'duck', 'animals'),
    s('elephant', 'elephant', 'animals'),
    s('frog', 'frog', 'animals'),
    s('giraffe', 'giraffe', 'animals'),
    s('monkey', 'monkey', 'animals'),
    s('owl', 'owl', 'animals'),
    s('panda', 'panda', 'animals'),
    s('penguin', 'penguin', 'animals'),
    s('pig', 'pig', 'animals'),
    s('rabbit', 'rabbit', 'animals'),
    s('whale', 'whale', 'animals'),
    // 水果
    s('apple', 'apple', 'fruits'),
    s('banana', 'banana', 'fruits'),
    s('grapes', 'grapes', 'fruits'),
    s('pineapple', 'pineapple', 'fruits'),
    s('strawberry', 'strawberry', 'fruits'),
    s('watermelon', 'watermelon', 'fruits'),
    // 甜點
    s('cupcake', 'cupcake', 'sweets'),
    s('icecream', 'icecream', 'sweets', 'ice cream'),
    s('donut', 'donut', 'sweets'),
    s('cake', 'cake', 'sweets'),
    // 車車
    s('fire-truck', 'firetruck', 'vehicles', 'fire truck'),
    s('police-car', 'policecar', 'vehicles', 'police car'),
    s('ambulance', 'ambulance', 'vehicles'),
    s('bus', 'bus', 'vehicles'),
    s('garbage-truck', 'garbagetruck', 'vehicles', 'garbage truck'),
    s('excavator', 'excavator', 'vehicles'),
    s('cement-mixer', 'cementmixer', 'vehicles', 'cement mixer'),
    s('train', 'train', 'vehicles'),
    s('race-car', 'racecar', 'vehicles', 'race car'),
    s('ice-cream-truck', 'icecreamtruck', 'vehicles', 'ice cream truck'),
    s('tractor', 'tractor', 'vehicles'),
    s('dump-truck', 'dumptruck', 'vehicles', 'dump truck')
  ];

  var StickersData = {
    BACKGROUNDS: BACKGROUNDS,
    CATEGORIES: CATEGORIES,
    STICKERS: STICKERS,
    byId: function (id) {
      for (var i = 0; i < STICKERS.length; i++) if (STICKERS[i].id === id) return STICKERS[i];
      return null;
    },
    bgById: function (id) {
      for (var i = 0; i < BACKGROUNDS.length; i++) if (BACKGROUNDS[i].id === id) return BACKGROUNDS[i];
      return null;
    }
  };

  global.StickersData = StickersData;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = StickersData;
})(typeof window !== 'undefined' ? window : globalThis);
