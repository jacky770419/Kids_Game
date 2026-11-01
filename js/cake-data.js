/* 甜點店的資料表：六種甜點、顏色、奶油、容器、配料、來點餐的動物客人。

   為什麼獨立一支：跟 stickers-data.js 同一個理由——資料表與程式／磁碟容易走鐘
   （客人圖檔路徑打錯就是破圖，唸的英文打錯不會報錯），切成純資料檔，
   tools/check_cake.js 才能 require 進來對帳。

   甜點與配料的圖不是圖檔，是 js/cake-shapes.js、js/cake-toppings.js 用顏色現場畫出來的 SVG：
   一層蛋糕要能換十種顏色、疊一到三層、上面再淋奶油，做成圖檔是幾千種組合。

   欄位：
     id    唯一代號，也是進度存檔裡的值
     word  唸出來的英文（點餐句子也用它）
     say   點下去時唸的（容器才有，「waffle cone」比單唸一個字清楚）
     fill / top / dark  畫圖用的三個色階：側面、頂面（亮一階）、陰影線（暗一階）
     plural  配料的複數（點餐句子「two cherries」用）
     mass    數不出來的配料（butter、sprinkles）：只唸一個字，不能出題
     group   配料放在哪個頁籤（TOPPING_GROUPS）
     noOrder 這種配料不出題（理由見 TOPPINGS 上面的註解）

   顏色用字（pink / yellow…）而不是口味：她在迪士尼美語學過顏色，
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
    { id: 'green', word: 'green', fill: '#8EDB8A', top: '#B6EBB3', dark: '#62BC5D' },
    { id: 'white', word: 'white', fill: '#FFF4DF', top: '#FFFFFF', dark: '#E6D3B3' },
    { id: 'orange', word: 'orange', fill: '#FFB05C', top: '#FFCE96', dark: '#E58A2E' },
    { id: 'red', word: 'red', fill: '#F4686E', top: '#FA9A9E', dark: '#CF4248' },
    // 烤出來的金黃色：鬆餅、甜甜圈最像樣的顏色，冰淇淋和聖代不用（見 DESSERTS）
    { id: 'golden', word: 'golden', fill: '#EDB95E', top: '#F7D692', dark: '#C98F35' }
  ];

  var ALL_FLAVORS = FLAVORS.map(function (f) { return f.id; });
  var COLD_FLAVORS = ALL_FLAVORS.filter(function (id) { return id !== 'golden'; });

  /* 淋在上面的東西。各甜點叫法不同（奶油／淋醬／糖霜），由 DESSERTS 的 creamWord 接在顏色後面唸 */
  var CREAMS = [
    { id: 'white', word: 'white', fill: '#FFFFFF' },
    { id: 'pink', word: 'pink', fill: '#FFB3D1' },
    { id: 'chocolate', word: 'chocolate', fill: '#6B3E22' },
    { id: 'yellow', word: 'yellow', fill: '#FFF0A0' },
    { id: 'blue', word: 'blue', fill: '#BFE6FF' },
    { id: 'purple', word: 'purple', fill: '#D9C8FF' },
    { id: 'green', word: 'green', fill: '#C4F0B8' },
    { id: 'orange', word: 'orange', fill: '#FFC98A' },
    { id: 'red', word: 'red', fill: '#E5484D' }
  ];

  /* 容器。shape 決定怎麼畫，顏色只是參數 */
  var PLATES = [
    { id: 'white', say: 'white plate', fill: '#FFFFFF', rim: '#E6DED2' },
    { id: 'pink', say: 'pink plate', fill: '#FFD5E5', rim: '#FF9EC4' },
    { id: 'blue', say: 'blue plate', fill: '#CDEBFF', rim: '#7CC8F5' },
    { id: 'yellow', say: 'yellow plate', fill: '#FFF2B8', rim: '#FFD93D' },
    { id: 'green', say: 'green plate', fill: '#D5F2D2', rim: '#8EDB8A' }
  ];
  var CONES = [
    { id: 'waffle', say: 'waffle cone', shape: 'cone', fill: '#E8B866', dark: '#B9812F' },
    { id: 'chocolate', say: 'chocolate cone', shape: 'cone', fill: '#8B5A36', dark: '#5E3A20' },
    { id: 'pink', say: 'pink cone', shape: 'cone', fill: '#FFB3D1', dark: '#E07AA3' },
    { id: 'blue', say: 'blue cone', shape: 'cone', fill: '#ABDDFA', dark: '#4FA6DB' },
    { id: 'pinkcup', say: 'pink cup', shape: 'cup', fill: '#FFC4DC', dark: '#FF6B9A' },
    { id: 'bluecup', say: 'blue cup', shape: 'cup', fill: '#CDEBFF', dark: '#4FA6DB' }
  ];
  var WRAPPERS = [
    { id: 'pink', say: 'pink cup', fill: '#FF9EC4', dark: '#E07AA3' },
    { id: 'blue', say: 'blue cup', fill: '#7CC8F5', dark: '#4FA6DB' },
    { id: 'yellow', say: 'yellow cup', fill: '#FFD93D', dark: '#E0B520' },
    { id: 'green', say: 'green cup', fill: '#8EDB8A', dark: '#62BC5D' },
    { id: 'purple', say: 'purple cup', fill: '#B79CFF', dark: '#9273E6' }
  ];

  /* 六種甜點。
       word      點餐句子裡的名字（「I want a pink ice cream…」）
       maxTiers  疊幾層：冰淇淋三球、鬆餅五片、聖代杯四層；杯子蛋糕與甜甜圈只有一個，再點＝換顏色
       flavors   有哪些顏色可選
       holders   容器清單（沒有就不出現容器頁籤）；holder 是一開始的預設值
       creamWord 接在奶油顏色後面唸（「chocolate sauce」）
       tabs      材料匣頁籤的圖示
       color     選甜點畫面的卡片底色
       demo      選甜點畫面的示意圖 */
  var DESSERTS = [
    {
      id: 'cake', word: 'cake', name: '蛋糕', maxTiers: 3, flavors: ALL_FLAVORS,
      holders: PLATES, holder: 'white', creamWord: 'cream',
      tabs: { base: '🍰', holder: '🍽️', cream: '🍦' }, color: '#FF9EC4',
      demo: { tiers: ['pink', 'yellow'], cream: 'white', toppings: ['cherry', 'strawberry', 'strawberry'] }
    },
    {
      id: 'icecream', word: 'ice cream', name: '冰淇淋', maxTiers: 3, flavors: COLD_FLAVORS,
      holders: CONES, holder: 'waffle', creamWord: 'sauce',
      tabs: { base: '🍨', holder: '🍦', cream: '🍫' }, color: '#7CC8F5',
      demo: { tiers: ['green', 'pink'], cream: 'chocolate', toppings: ['cherry'] }
    },
    {
      id: 'cupcake', word: 'cupcake', name: '杯子蛋糕', maxTiers: 1, flavors: ALL_FLAVORS,
      holders: WRAPPERS, holder: 'pink', creamWord: 'cream',
      tabs: { base: '🧁', holder: '🎀', cream: '🍦' }, color: '#FFD93D',
      demo: { tiers: ['chocolate'], cream: 'pink', toppings: ['star'] }
    },
    {
      id: 'donut', word: 'donut', name: '甜甜圈', maxTiers: 1, flavors: ALL_FLAVORS,
      holders: PLATES, holder: 'blue', creamWord: 'icing',
      tabs: { base: '🍩', holder: '🍽️', cream: '🍫' }, color: '#B79CFF',
      demo: { tiers: ['golden'], cream: 'pink', toppings: ['sprinkles', 'sprinkles', 'sprinkles', 'heart'] }
    },
    {
      id: 'pancake', word: 'pancake', name: '鬆餅', maxTiers: 5, flavors: ALL_FLAVORS,
      holders: PLATES, holder: 'yellow', creamWord: 'syrup',
      tabs: { base: '🥞', holder: '🍽️', cream: '🍯' }, color: '#FFB05C',
      demo: { tiers: ['golden', 'golden', 'golden'], cream: 'chocolate', toppings: ['butter', 'blueberry', 'strawberry'] }
    },
    {
      id: 'sundae', word: 'sundae', name: '聖代', maxTiers: 4, flavors: COLD_FLAVORS,
      holders: null, holder: null, creamWord: 'cream',
      tabs: { base: '🍧', cream: '🍦' }, color: '#8EDB8A',
      demo: { tiers: ['pink', 'white', 'purple'], cream: 'white', toppings: ['cherry', 'wafer'] }
    }
  ];

  var TOPPING_GROUPS = [
    { id: 'fruit', name: '水果', emoji: '🍓' },
    { id: 'sweet', name: '糖果', emoji: '🍬' },
    { id: 'deco', name: '裝飾', emoji: '⭐' }
  ];

  /* noOrder 的是不適合出題的：高高的（蠟燭、棒棒糖、餅乾棒、小傘）放四根會擋住甜點顏色，
     看不出來做對了沒；數不出來的（mass）更不用說。 */
  var TOPPINGS = [
    { id: 'strawberry', word: 'strawberry', plural: 'strawberries', group: 'fruit' },
    { id: 'cherry', word: 'cherry', plural: 'cherries', group: 'fruit' },
    { id: 'blueberry', word: 'blueberry', plural: 'blueberries', group: 'fruit' },
    { id: 'banana', word: 'banana', plural: 'bananas', group: 'fruit' },
    { id: 'orange', word: 'orange', plural: 'oranges', group: 'fruit' },
    { id: 'kiwi', word: 'kiwi', plural: 'kiwis', group: 'fruit' },
    { id: 'grape', word: 'grape', plural: 'grapes', group: 'fruit' },
    { id: 'pineapple', word: 'pineapple', plural: 'pineapples', group: 'fruit' },
    { id: 'watermelon', word: 'watermelon', plural: 'watermelons', group: 'fruit' },

    { id: 'cookie', word: 'cookie', plural: 'cookies', group: 'sweet' },
    { id: 'chocolate', word: 'chocolate', plural: 'chocolates', group: 'sweet' },
    { id: 'candy', word: 'candy', plural: 'candies', group: 'sweet' },
    { id: 'marshmallow', word: 'marshmallow', plural: 'marshmallows', group: 'sweet' },
    { id: 'macaron', word: 'macaron', plural: 'macarons', group: 'sweet' },
    { id: 'lollipop', word: 'lollipop', plural: 'lollipops', group: 'sweet', noOrder: true },
    { id: 'wafer', word: 'wafer', plural: 'wafers', group: 'sweet', noOrder: true },
    { id: 'sprinkles', word: 'sprinkles', mass: true, group: 'sweet', noOrder: true },
    { id: 'butter', word: 'butter', mass: true, group: 'sweet', noOrder: true },

    { id: 'star', word: 'star', plural: 'stars', group: 'deco' },
    { id: 'heart', word: 'heart', plural: 'hearts', group: 'deco' },
    { id: 'flower', word: 'flower', plural: 'flowers', group: 'deco' },
    { id: 'crown', word: 'crown', plural: 'crowns', group: 'deco' },
    { id: 'butterfly', word: 'butterfly', plural: 'butterflies', group: 'deco' },
    { id: 'rainbow', word: 'rainbow', plural: 'rainbows', group: 'deco' },
    { id: 'bow', word: 'bow', plural: 'bows', group: 'deco' },
    { id: 'leaf', word: 'leaf', plural: 'leaves', group: 'deco' },
    { id: 'candle', word: 'candle', plural: 'candles', group: 'deco', noOrder: true },
    { id: 'umbrella', word: 'umbrella', plural: 'umbrellas', group: 'deco', noOrder: true }
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

  /* 放配料時會數出來（「two cherries」），要數到 CakeState.MAX_TOPPINGS。
     點餐只出到 four（CakeState.MAX_COUNT）：四顆以內一眼看得出數對了沒。 */
  var NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  var CakeData = {
    FLAVORS: FLAVORS,
    CREAMS: CREAMS,
    PLATES: PLATES,
    CONES: CONES,
    WRAPPERS: WRAPPERS,
    DESSERTS: DESSERTS,
    TOPPING_GROUPS: TOPPING_GROUPS,
    TOPPINGS: TOPPINGS,
    CUSTOMERS: CUSTOMERS,
    NUMBERS: NUMBERS,
    dessert: function (id) { return find(DESSERTS, id); },
    flavor: function (id) { return find(FLAVORS, id); },
    cream: function (id) { return find(CREAMS, id); },
    topping: function (id) { return find(TOPPINGS, id); },
    customer: function (id) { return find(CUSTOMERS, id); },
    holder: function (kind, id) {
      var d = find(DESSERTS, kind);
      return d && d.holders ? find(d.holders, id) : null;
    },
    /* 「chocolate sauce」 */
    creamSay: function (kind, creamId) {
      var d = find(DESSERTS, kind);
      var c = find(CREAMS, creamId);
      return c && d ? c.word + ' ' + d.creamWord : '';
    }
  };

  global.CakeData = CakeData;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeData;
})(typeof window !== 'undefined' ? window : globalThis);
