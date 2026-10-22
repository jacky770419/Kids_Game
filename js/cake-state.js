/* 蛋糕店的純邏輯：蛋糕狀態的增減、存檔序列化、點餐的出題與對答案。

   為什麼要從 cake.js 切出來：這些都是「錯了畫面看起來還是正常」的類型——
   層數沒擋上限，第四層會疊出畫面頂端；對答案的數量判斷寫成 >=，
   放五顆櫻桃也算對，她就學不到「兩顆」；存檔沒過濾，改過資料表之後
   舊存檔會畫出破掉的顏色。切成純函式才能在 Node 裡直接斷言（tools/check_cake.js）。

   狀態一律不就地修改，每個操作都回傳新物件：↩️ 復原就是把舊物件放回去，
   不用另外寫「反向操作」。

   狀態形狀：{ tiers: ['pink', ...] 由下往上, cream: 'white' | null, toppings: ['cherry', ...] 放上去的先後 } */
(function (global) {
  'use strict';

  var Data = global.CakeData || (typeof require === 'function' ? require('./cake-data.js') : null);

  /* 三層是上限：再高就要把每層壓扁，裝飾會小到她的手指點不到 */
  var MAX_TIERS = 3;
  /* 頂上最多七個裝飾＝前排四個＋後排三個（位置見 cake-draw.js 的 SLOTS） */
  var MAX_TOPPINGS = 7;
  var MAX_COUNT = 4;   // 點餐的數量上限，跟 CakeData.NUMBERS 對齊

  function empty() { return { tiers: [], cream: null, toppings: [] }; }

  function clone(s) {
    return { tiers: s.tiers.slice(), cream: s.cream, toppings: s.toppings.slice() };
  }

  /* 加一層。滿三層時改成「換掉最上面那層的顏色」而不是沒反應：
     五歲小孩點了沒反應會一直點、以為壞掉；換色至少看得到東西在動。 */
  function addTier(s, flavorId) {
    var n = clone(s);
    if (n.tiers.length < MAX_TIERS) n.tiers.push(flavorId);
    else n.tiers[n.tiers.length - 1] = flavorId;
    return n;
  }

  function removeTopTier(s) {
    var n = clone(s);
    n.tiers.pop();
    return n;
  }

  /* 再點一次同一種奶油＝拿掉奶油。這樣不用另外做一顆「不要奶油」的按鈕。 */
  function setCream(s, creamId) {
    var n = clone(s);
    n.cream = (n.cream === creamId) ? null : creamId;
    return n;
  }

  /* 放滿七個就回傳原物件（呼叫端用 === 判斷有沒有放上去，沒放就不出聲） */
  function addTopping(s, toppingId) {
    if (s.toppings.length >= MAX_TOPPINGS) return s;
    var n = clone(s);
    n.toppings.push(toppingId);
    return n;
  }

  function removeToppingAt(s, i) {
    if (i < 0 || i >= s.toppings.length) return s;
    var n = clone(s);
    n.toppings.splice(i, 1);
    return n;
  }

  function isEmpty(s) { return !s.tiers.length && !s.cream && !s.toppings.length; }

  /* ===== 存檔 =====
     還原時一律逐筆過濾掉資料表裡沒有的 id（改過顏色清單之後的舊存檔），
     超過上限的截掉。整個形狀壞掉就回空蛋糕——畫面能開比還原進度重要。 */
  function serialize(s) {
    return { tiers: s.tiers.slice(), cream: s.cream, toppings: s.toppings.slice() };
  }

  function deserialize(raw) {
    var out = empty();
    if (!raw || typeof raw !== 'object') return out;
    if (Array.isArray(raw.tiers)) {
      out.tiers = raw.tiers.filter(function (id) { return typeof id === 'string' && Data.flavor(id); }).slice(0, MAX_TIERS);
    }
    if (typeof raw.cream === 'string' && Data.cream(raw.cream)) out.cream = raw.cream;
    if (Array.isArray(raw.toppings)) {
      out.toppings = raw.toppings.filter(function (id) { return typeof id === 'string' && Data.topping(id); }).slice(0, MAX_TOPPINGS);
    }
    return out;
  }

  /* ===== 點餐 =====
     一張單＝一位客人＋一種蛋糕顏色＋一種裝飾＋數量。
     rng 由呼叫端傳進來（Math.random），測試時可以換成固定序列。
     跟上一張單比：客人不同、「顏色＋裝飾」也不同，連續兩題才不會一模一樣。 */
  function pick(list, rng) { return list[Math.floor(rng() * list.length) % list.length]; }

  function makeOrder(rng, prev) {
    var r = rng || Math.random;
    var o;
    for (var tries = 0; tries < 20; tries++) {
      o = {
        customer: pick(Data.CUSTOMERS, r).id,
        flavor: pick(Data.FLAVORS, r).id,
        // 蠟燭不出題：點餐句子「four candles」聽起來像生日，但蠟燭很高、
        // 放四根會擋住蛋糕顏色，看不出來做對了沒
        topping: pick(Data.TOPPINGS.filter(function (t) { return t.id !== 'candle'; }), r).id,
        count: 1 + Math.floor(r() * MAX_COUNT) % MAX_COUNT
      };
      if (!prev) break;
      if (o.customer !== prev.customer && (o.flavor !== prev.flavor || o.topping !== prev.topping)) break;
    }
    return o;
  }

  /* 對答案，分兩項回報（畫面上點餐泡泡的兩格各自打勾）：
       flavor   至少一層、而且每一層都是點的顏色（「粉紅色的蛋糕」不能夾一層黃的）
       topping  點的那種裝飾「剛好」count 個——多放也不算對，這一題就是在練數數
     其他裝飾、奶油不管：多放一朵花不影響點的單，她想裝飾就讓她裝飾。 */
  function check(s, order) {
    var flavorOk = s.tiers.length > 0 && s.tiers.every(function (t) { return t === order.flavor; });
    var n = 0;
    for (var i = 0; i < s.toppings.length; i++) if (s.toppings[i] === order.topping) n++;
    var toppingOk = n === order.count;
    return { flavor: flavorOk, topping: toppingOk, count: n, done: flavorOk && toppingOk };
  }

  /* 「I want a pink cake with two cherries.」 */
  function sentence(order) {
    var f = Data.flavor(order.flavor);
    var t = Data.topping(order.topping);
    var color = f ? f.word : order.flavor;
    var article = /^[aeiou]/i.test(color) ? 'an' : 'a';
    var thing = order.count === 1 ? t.word : t.plural;
    return 'I want ' + article + ' ' + color + ' cake with ' + Data.NUMBERS[order.count] + ' ' + thing + '.';
  }

  var CakeState = {
    MAX_TIERS: MAX_TIERS,
    MAX_TOPPINGS: MAX_TOPPINGS,
    MAX_COUNT: MAX_COUNT,
    empty: empty,
    clone: clone,
    addTier: addTier,
    removeTopTier: removeTopTier,
    setCream: setCream,
    addTopping: addTopping,
    removeToppingAt: removeToppingAt,
    isEmpty: isEmpty,
    serialize: serialize,
    deserialize: deserialize,
    makeOrder: makeOrder,
    check: check,
    sentence: sentence
  };

  global.CakeState = CakeState;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeState;
})(typeof window !== 'undefined' ? window : globalThis);
