/* 甜點店的純邏輯：甜點狀態的增減、存檔序列化、點餐的出題與對答案。

   為什麼要從 cake.js 切出來：這些都是「錯了畫面看起來還是正常」的類型——
   層數沒擋上限，第四層蛋糕會疊出畫面頂端；對答案的數量判斷寫成 >=，
   放五顆櫻桃也算對，她就學不到「兩顆」；存檔沒過濾，改過資料表之後
   舊存檔會畫出破掉的顏色。切成純函式才能在 Node 裡直接斷言（tools/check_cake.js）。

   狀態一律不就地修改，每個操作都回傳新物件：↩️ 復原就是把舊物件放回去，
   不用另外寫「反向操作」。

   狀態形狀：{ kind: 'cake', holder: 'white' | null, tiers: ['pink', ...] 由下往上,
               cream: 'white' | null, toppings: [{ id: 'cherry' }, { id: 'star', x: 412, y: 230 }, ...] 放上去的先後 }
   tiers／cream 是蛋糕時代的欄位名，冰淇淋的球、聖代的層、淋醬也放在這裡：
   舊存檔不用搬家，畫圖那邊也不用為每種甜點各寫一套邏輯。
   配料沒有 x／y＝點一下放的，位置由 cake-shapes.js 依序排（層數變了會跟著走）；
   有 x／y＝她拖到那裡的，就是板面 800×600 上的那個點（配料底部中心）。 */
(function (global) {
  'use strict';

  var Data = global.CakeData || (typeof require === 'function' ? require('./cake-data.js') : null);

  /* 上限 20 個：所有甜點、所有層數，cake-shapes.js 都排得出至少這麼多個位置（check_cake.js 對帳）。 */
  var MAX_TOPPINGS = 20;
  var MAX_COUNT = 4;   // 點餐的數量上限，跟 CakeData.NUMBERS 對齊
  /* 拖放配料能放的範圍：x 不出左右、y 不頂到遮雨棚，拿不到的配料就拿不掉了 */
  var DROP_BOX = { x0: 30, x1: 770, y0: 90, y1: 596 };

  function dessertOf(kind) { return Data.dessert(kind) || Data.dessert('cake'); }

  function empty(kind) {
    var d = dessertOf(kind);
    return { kind: d.id, holder: d.holder, tiers: [], cream: null, toppings: [] };
  }

  /* 配料物件本身也從不就地修改，淺拷貝陣列就夠了 */
  function clone(s) {
    return { kind: s.kind, holder: s.holder, tiers: s.tiers.slice(), cream: s.cream, toppings: s.toppings.slice() };
  }

  /* 加一層。滿了改成「換掉最上面那層的顏色」而不是沒反應：
     五歲小孩點了沒反應會一直點、以為壞掉；換色至少看得到東西在動。 */
  function addTier(s, flavorId) {
    var n = clone(s);
    if (n.tiers.length < dessertOf(s.kind).maxTiers) n.tiers.push(flavorId);
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

  function setHolder(s, holderId) {
    var n = clone(s);
    n.holder = holderId;
    return n;
  }

  function clampDrop(x, y) {
    return {
      x: Math.round(Math.max(DROP_BOX.x0, Math.min(DROP_BOX.x1, x))),
      y: Math.round(Math.max(DROP_BOX.y0, Math.min(DROP_BOX.y1, y)))
    };
  }

  /* 不給 x／y＝點一下放的。放滿就回傳原物件（呼叫端用 === 判斷有沒有放上去，沒放就不出聲） */
  function addTopping(s, toppingId, x, y) {
    if (s.toppings.length >= MAX_TOPPINGS) return s;
    var n = clone(s);
    var item = { id: toppingId };
    if (x !== undefined) {
      var p = clampDrop(x, y);
      item.x = p.x;
      item.y = p.y;
    }
    n.toppings.push(item);
    return n;
  }

  function moveTopping(s, i, x, y) {
    if (i < 0 || i >= s.toppings.length) return s;
    var n = clone(s);
    var p = clampDrop(x, y);
    n.toppings[i] = { id: s.toppings[i].id, x: p.x, y: p.y };
    return n;
  }

  function removeToppingAt(s, i) {
    if (i < 0 || i >= s.toppings.length) return s;
    var n = clone(s);
    n.toppings.splice(i, 1);
    return n;
  }

  function countTopping(s, toppingId) {
    var n = 0;
    for (var i = 0; i < s.toppings.length; i++) if (s.toppings[i].id === toppingId) n++;
    return n;
  }

  function hasTopping(s, toppingId) { return countTopping(s, toppingId) > 0; }

  /* 換了容器不算「有做東西」：預設的盤子／甜筒本來就在板面上 */
  function isEmpty(s) { return !s.tiers.length && !s.cream && !s.toppings.length; }

  /* ===== 存檔 =====
     還原時一律逐筆過濾掉資料表裡沒有的 id（改過清單之後的舊存檔），
     超過上限的截掉。整個形狀壞掉就回空的——畫面能開比還原進度重要。

     蛋糕沿用原本的 k:free，升級前做到一半的蛋糕才接得回來；
     舊存檔的 toppings 是字串陣列、也沒有 kind／holder，這裡一併接住。 */
  function saveKey(kind) { return kind === 'cake' ? 'k:free' : 'k:free:' + kind; }

  function serialize(s) {
    return clone(s);
  }

  function restoreTopping(raw) {
    var id = typeof raw === 'string' ? raw : (raw && raw.id);
    if (typeof id !== 'string' || !Data.topping(id)) return null;
    var item = { id: id };
    if (raw && typeof raw.x === 'number' && isFinite(raw.x) && typeof raw.y === 'number' && isFinite(raw.y)) {
      var p = clampDrop(raw.x, raw.y);
      item.x = p.x;
      item.y = p.y;
    }
    return item;
  }

  function deserialize(raw, kind) {
    var out = empty(kind);
    if (!raw || typeof raw !== 'object') return out;
    var d = dessertOf(out.kind);
    if (Array.isArray(raw.tiers)) {
      out.tiers = raw.tiers.filter(function (id) { return d.flavors.indexOf(id) >= 0; }).slice(0, d.maxTiers);
    }
    if (typeof raw.cream === 'string' && Data.cream(raw.cream)) out.cream = raw.cream;
    if (Data.holder(out.kind, raw.holder)) out.holder = raw.holder;
    if (Array.isArray(raw.toppings)) {
      out.toppings = raw.toppings.map(restoreTopping).filter(Boolean).slice(0, MAX_TOPPINGS);
    }
    return out;
  }

  /* ===== 點餐 =====
     一張單＝一位客人＋一種甜點＋一種顏色＋一種配料＋數量。
     rng 由呼叫端傳進來（Math.random），測試時可以換成固定序列。
     跟上一張單比：客人不同、「甜點＋顏色＋配料」也不同，連續兩題才不會一模一樣。 */
  function pick(list, rng) { return list[Math.floor(rng() * list.length) % list.length]; }

  function makeOrder(rng, prev) {
    var r = rng || Math.random;
    var orderable = Data.TOPPINGS.filter(function (t) { return !t.noOrder; });
    var o;
    for (var tries = 0; tries < 20; tries++) {
      var d = pick(Data.DESSERTS, r);
      o = {
        customer: pick(Data.CUSTOMERS, r).id,
        dessert: d.id,
        flavor: pick(d.flavors, r),
        // 「a pink cookie with two cookies」聽起來很怪：配料跟甜點同名的不出
        topping: pick(orderable.filter(function (t) { return t.id !== d.id; }), r).id,
        count: 1 + Math.floor(r() * MAX_COUNT) % MAX_COUNT
      };
      if (!prev) break;
      if (o.customer !== prev.customer
        && (o.dessert !== prev.dessert || o.flavor !== prev.flavor || o.topping !== prev.topping)) break;
    }
    return o;
  }

  /* 對答案，分兩項回報（畫面上點餐泡泡的兩格各自打勾）：
       flavor   至少一層、而且每一層都是點的顏色（「粉紅色的蛋糕」不能夾一層黃的）
       topping  點的那種配料「剛好」count 個——多放也不算對，這一題就是在練數數
     其他配料、奶油、容器不管：多放一朵花不影響點的單，她想裝飾就讓她裝飾。
     配料放在哪裡也不管：拖到盤子上的櫻桃一樣算一顆。 */
  function check(s, order) {
    var flavorOk = s.tiers.length > 0 && s.tiers.every(function (t) { return t === order.flavor; });
    var n = countTopping(s, order.topping);
    var toppingOk = n === order.count;
    return { flavor: flavorOk, topping: toppingOk, count: n, done: flavorOk && toppingOk };
  }

  /* 「I want a pink cake with two cherries.」 */
  function sentence(order) {
    var f = Data.flavor(order.flavor);
    var t = Data.topping(order.topping);
    var d = Data.dessert(order.dessert);
    var color = f ? f.word : order.flavor;
    var article = /^[aeiou]/i.test(color) ? 'an' : 'a';
    var thing = order.count === 1 ? t.word : t.plural;
    return 'I want ' + article + ' ' + color + ' ' + d.word + ' with ' + Data.NUMBERS[order.count] + ' ' + thing + '.';
  }

  /* 數出來：「two cherries」。數不出來的（butter）只唸名字。 */
  function countPhrase(s, toppingId) {
    var t = Data.topping(toppingId);
    var n = countTopping(s, toppingId);
    if (!t || n === 0) return '';
    if (t.mass) return t.word;
    return Data.NUMBERS[n] + ' ' + (n === 1 ? t.word : t.plural);
  }

  var CakeState = {
    MAX_TOPPINGS: MAX_TOPPINGS,
    MAX_COUNT: MAX_COUNT,
    DROP_BOX: DROP_BOX,
    empty: empty,
    clone: clone,
    addTier: addTier,
    removeTopTier: removeTopTier,
    setCream: setCream,
    setHolder: setHolder,
    clampDrop: clampDrop,
    addTopping: addTopping,
    moveTopping: moveTopping,
    removeToppingAt: removeToppingAt,
    countTopping: countTopping,
    hasTopping: hasTopping,
    isEmpty: isEmpty,
    saveKey: saveKey,
    serialize: serialize,
    deserialize: deserialize,
    makeOrder: makeOrder,
    check: check,
    sentence: sentence,
    countPhrase: countPhrase
  };

  global.CakeState = CakeState;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeState;
})(typeof window !== 'undefined' ? window : globalThis);
