#!/usr/bin/env node
/* 甜點店的資料、純邏輯、畫圖驗證（零依賴，Node 直跑）。

   為什麼要這支：甜點店有三類「看畫面看不出來」的失敗方式——

     1. 對答案寫鬆。數量判斷寫成 >=，放五顆櫻桃也上菜，她就學不到「兩顆」；
        顏色只看最上層，夾一層黃的也算「粉紅色蛋糕」。畫面上一切正常，只是教錯。
     2. 上限沒擋。第四層蛋糕會疊出板面頂端、配料放到遮雨棚上或板面外，點不到也拿不掉。
     3. 資料表與畫圖走鐘。資料表多一種配料、畫圖那邊沒有對應的圖，那格就是空白；
        新增一種甜點卻沒排位置表，配料全部疊在一起；客人圖檔路徑打錯就是破圖——都不會報錯。

   檢查項目：
     A. js/cake-data.js 資料表（id 不重複、英文字、七種甜點的設定、客人圖檔存在）
     B. js/cake-state.js 的純函式（上限、不就地修改、拖放範圍、存檔過濾與舊存檔、對答案、點餐句子、出題）
     C. js/cake-draw.js／cake-shapes.js／cake-toppings.js
        （每種配料、甜點、容器都畫得出來，每種狀態的位置表夠多又不出板面，互動標記、存圖尺寸）
     D. cake.html 骨架與 script 載入順序，首頁有入口

   跑法：node tools/check_cake.js  → 全綠 exit 0，任一項失敗 exit 1。 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const problems = [];
function ok(cond, msg) { if (!cond) problems.push(msg); }
function abs(rel) { return path.join(ROOT, rel); }
function exists(rel) { try { return fs.statSync(abs(rel)).isFile(); } catch (e) { return false; } }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }

const Data = require(abs('js/cake-data.js'));
const St = require(abs('js/cake-state.js'));
const Draw = require(abs('js/cake-draw.js'));
const Shapes = require(abs('js/cake-shapes.js'));
const Art = require(abs('js/cake-toppings.js'));

// ---------- A. 資料表 ----------

for (const [name, list] of [['FLAVORS', Data.FLAVORS], ['CREAMS', Data.CREAMS], ['TOPPINGS', Data.TOPPINGS], ['CUSTOMERS', Data.CUSTOMERS]]) {
  ok(Array.isArray(list) && list.length >= 4, name + ' 至少要四筆');
  const ids = new Set();
  list.forEach((it, i) => {
    ok(it && typeof it.id === 'string' && it.id, name + '[' + i + '] 沒有 id');
    ok(!ids.has(it.id), name + ' 的 id 重複：' + it.id);
    ids.add(it.id);
    ok(/^[a-z]+$/.test(it.word || ''), name + ' ' + it.id + ' 的 word 要是純小寫英文字，實得 ' + JSON.stringify(it.word));
  });
}
Data.FLAVORS.forEach((f) => {
  ['fill', 'top', 'dark'].forEach((k) => ok(/^#[0-9A-F]{6}$/i.test(f[k] || ''), 'FLAVORS ' + f.id + ' 的 ' + k + ' 不是 #RRGGBB'));
});
Data.CREAMS.forEach((c) => ok(/^#[0-9A-F]{6}$/i.test(c.fill || ''), 'CREAMS ' + c.id + ' 的 fill 不是 #RRGGBB'));
Data.TOPPINGS.forEach((t) => {
  if (t.mass) ok(t.noOrder, '數不出來的配料 ' + t.id + ' 不能出題');
  else ok(/^[a-z]+$/.test(t.plural || '') && t.plural !== t.word, 'TOPPINGS ' + t.id + ' 的 plural 不對：' + t.plural);
  ok(Data.TOPPING_GROUPS.some((g) => g.id === t.group), 'TOPPINGS ' + t.id + ' 的 group 不存在：' + t.group);
});
Data.TOPPING_GROUPS.forEach((g) => ok(Data.TOPPINGS.some((t) => t.group === g.id), '頁籤 ' + g.id + ' 沒有配料'));
ok(Data.TOPPINGS.filter((t) => !t.noOrder).length >= 8, '能出題的配料太少');

ok(Data.DESSERTS.length === 7, '應有七種甜點，實得 ' + Data.DESSERTS.length);
{
  const ids = new Set();
  Data.DESSERTS.forEach((d) => {
    ok(!ids.has(d.id), 'DESSERTS 的 id 重複：' + d.id);
    ids.add(d.id);
    ok(/^[a-z ]+$/.test(d.word || ''), 'DESSERTS ' + d.id + ' 的 word 不對：' + d.word);
    ok(d.name, 'DESSERTS ' + d.id + ' 沒有中文名');
    ok(d.maxTiers >= 1, 'DESSERTS ' + d.id + ' 的 maxTiers 不對');
    ok(/^#[0-9A-F]{6}$/i.test(d.color || ''), 'DESSERTS ' + d.id + ' 的 color 不是 #RRGGBB');
    ok(d.creamWord, 'DESSERTS ' + d.id + ' 沒有 creamWord');
    ok(d.tabs && d.tabs.base && d.tabs.cream, 'DESSERTS ' + d.id + ' 的頁籤圖示不齊');
    d.flavors.forEach((id) => ok(Data.flavor(id), 'DESSERTS ' + d.id + ' 的顏色不存在：' + id));
    if (d.holders) {
      ok(d.tabs.holder, 'DESSERTS ' + d.id + ' 有容器卻沒有頁籤圖示');
      ok(Data.holder(d.id, d.holder), 'DESSERTS ' + d.id + ' 的預設容器不在清單裡：' + d.holder);
      d.holders.forEach((h) => ok(typeof h.say === 'string' && h.say, 'DESSERTS ' + d.id + ' 容器 ' + h.id + ' 沒有 say'));
    } else {
      ok(d.holder === null, 'DESSERTS ' + d.id + ' 沒有容器清單，預設值應為 null');
    }
    ok(Shapes.SHAPES[d.id], 'DESSERTS ' + d.id + ' 在 cake-shapes.js 沒有畫法');
    const demo = St.deserialize(d.demo, d.id);
    ok(demo.tiers.length === d.demo.tiers.length && demo.toppings.length === d.demo.toppings.length, 'DESSERTS ' + d.id + ' 的示意圖有不存在的 id');
  });
}
// 餅乾的壓模形狀：資料表與畫法對得上，餅乾不會點「兩片餅乾」當配料
Data.COOKIE_CUTTERS.forEach((h) => ok(Draw.iconHolder('cookie', h.id).indexOf('stroke-dasharray') < 0 && /^<svg/.test(Draw.iconHolder('cookie', h.id)), '餅乾形狀 ' + h.id + ' 的小圖畫不出來'));
ok(St.empty('cookie').holder === 'heart', '餅乾一開始應是愛心形狀');
ok(Data.creamSay('icecream', 'chocolate') === 'chocolate sauce', 'creamSay 不對：' + Data.creamSay('icecream', 'chocolate'));
Data.CUSTOMERS.forEach((c) => ok(exists(c.src), '客人 ' + c.id + ' 的圖檔不存在：' + c.src));
ok(Data.NUMBERS.length - 1 >= St.MAX_TOPPINGS, 'NUMBERS 要數得到配料上限 ' + St.MAX_TOPPINGS);
ok(Data.NUMBERS[2] === 'two', 'NUMBERS[2] 應為 two');
ok(Data.NUMBERS[13] === 'thirteen', 'NUMBERS[13] 應為 thirteen');

// ---------- B. 純邏輯 ----------

{
  const e = St.empty();
  ok(St.isEmpty(e), 'empty() 應該是空的');
  ok(e.kind === 'cake' && e.holder === 'white', 'empty() 預設應是白盤子上的蛋糕');
  ok(St.empty('icecream').holder === 'waffle', '冰淇淋一開始應是甜筒');
  ok(St.empty('sundae').holder === null, '聖代沒有容器可換');

  // 加層：不就地修改、到上限、滿了改成換最上層
  const a = St.addTier(e, 'pink');
  ok(e.tiers.length === 0, 'addTier 就地修改了原狀態（↩️ 會壞掉）');
  let s = St.addTier(St.addTier(a, 'yellow'), 'blue');
  ok(s.tiers.join() === 'pink,yellow,blue', '疊三層的順序不對：' + s.tiers.join());
  s = St.addTier(s, 'green');
  ok(s.tiers.length === 3 && s.tiers[2] === 'green', '滿三層時應換掉最上層，實得 ' + s.tiers.join());
  ok(St.removeTopTier(s).tiers.join() === 'pink,yellow', 'removeTopTier 不對');
  Data.DESSERTS.forEach((d) => {
    let x = St.empty(d.id);
    for (let i = 0; i < d.maxTiers + 2; i++) x = St.addTier(x, d.flavors[i % d.flavors.length]);
    ok(x.tiers.length === d.maxTiers, d.id + ' 應疊到 ' + d.maxTiers + ' 層，實得 ' + x.tiers.length);
  });

  // 奶油：同一種再點一次＝拿掉
  const c1 = St.setCream(e, 'white');
  ok(c1.cream === 'white', 'setCream 沒放上去');
  ok(St.setCream(c1, 'white').cream === null, '同一種奶油再點一次應該拿掉');
  ok(St.setCream(c1, 'pink').cream === 'pink', '換另一種奶油應該直接換');

  // 容器
  const h = St.setHolder(e, 'pink');
  ok(h.holder === 'pink' && e.holder === 'white', 'setHolder 不對或就地修改');
  ok(St.isEmpty(h), '只換盤子不算有做東西（🎉 不該慶祝）');

  // 配料：上限、滿了回傳同一個物件（呼叫端靠 === 判斷）
  let t = e;
  for (let i = 0; i < St.MAX_TOPPINGS; i++) t = St.addTopping(t, 'cherry');
  ok(t.toppings.length === St.MAX_TOPPINGS, '放不滿 ' + St.MAX_TOPPINGS + ' 個配料');
  ok(St.addTopping(t, 'star') === t, '放滿了 addTopping 應回傳原物件');
  ok(St.addTopping(t, 'star', 100, 200) === t, '放滿了拖放也不該再加');
  const r = St.removeToppingAt(St.addTopping(St.addTopping(e, 'star'), 'heart'), 0);
  ok(r.toppings.map((x) => x.id).join() === 'heart', 'removeToppingAt(0) 應拿掉第一個');
  ok(St.removeToppingAt(r, 5) === r, 'removeToppingAt 越界應回傳原物件');

  // 拖放：存座標、限制在板面內、搬動不就地修改
  const d1 = St.addTopping(e, 'star', 123.4, 321.6);
  ok(d1.toppings[0].x === 123 && d1.toppings[0].y === 322, '拖放的座標沒存好：' + JSON.stringify(d1.toppings[0]));
  const d2 = St.addTopping(e, 'star', -50, 9999);
  ok(d2.toppings[0].x === St.DROP_BOX.x0 && d2.toppings[0].y === St.DROP_BOX.y1, '拖放超出板面應夾回來：' + JSON.stringify(d2.toppings[0]));
  const d3 = St.addTopping(e, 'star', 400, -10);
  ok(d3.toppings[0].y === St.DROP_BOX.y0, '拖放不該頂到遮雨棚：' + JSON.stringify(d3.toppings[0]));
  const auto = St.addTopping(e, 'heart');
  ok(auto.toppings[0].x === undefined, '點一下放的配料不該有座標');
  const moved = St.moveTopping(auto, 0, 300, 300);
  ok(moved.toppings[0].x === 300 && moved.toppings[0].id === 'heart', 'moveTopping 不對');
  ok(auto.toppings[0].x === undefined, 'moveTopping 就地修改了原狀態（↩️ 會壞掉）');
  ok(St.moveTopping(auto, 9, 1, 1) === auto, 'moveTopping 越界應回傳原物件');

  // 存檔：往返一致、壞資料過濾、上限截掉
  const full = { kind: 'cake', holder: 'pink', tiers: ['pink', 'blue'], cream: 'white', toppings: [{ id: 'cherry' }, { id: 'star', x: 100, y: 200 }] };
  ok(JSON.stringify(St.deserialize(JSON.parse(JSON.stringify(St.serialize(full))))) === JSON.stringify(full), '存檔往返不一致');
  const bad = St.deserialize({ tiers: ['pink', 'rainbow', 3, 'blue', 'green', 'yellow'], cream: 'mud', holder: 'gold', toppings: ['cherry', null, 'rock', { id: 'star', x: 'a', y: 2 }] });
  ok(bad.tiers.join() === 'pink,blue,green', '存檔還原應過濾掉不認得的顏色並截到三層，實得 ' + bad.tiers.join());
  ok(bad.cream === null, '不認得的奶油應還原成 null');
  ok(bad.holder === 'white', '不認得的容器應還原成預設');
  ok(bad.toppings.map((x) => x.id).join() === 'cherry,star', '不認得的配料應過濾掉，實得 ' + JSON.stringify(bad.toppings));
  ok(bad.toppings[1].x === undefined, '壞掉的座標應當成點一下放的');
  ok(St.isEmpty(St.deserialize(null)) && St.isEmpty(St.deserialize('x')), '壞掉的存檔應還原成空的');
  // 升級前的舊存檔長這樣，k:free 要接得回來
  const legacy = St.deserialize({ tiers: ['pink', 'yellow'], cream: 'white', toppings: ['cherry', 'star'] });
  ok(legacy.kind === 'cake' && legacy.holder === 'white' && legacy.tiers.length === 2, '舊存檔還原不對：' + JSON.stringify(legacy));
  ok(legacy.toppings.map((x) => x.id).join() === 'cherry,star', '舊存檔的配料字串要接得住：' + JSON.stringify(legacy.toppings));
  ok(St.saveKey('cake') === 'k:free', '蛋糕的進度 key 要維持 k:free，舊存檔才找得到');
  ok(St.saveKey('donut') !== St.saveKey('pancake'), '每種甜點的進度 key 要不同');
  const cold = St.deserialize({ tiers: ['golden', 'pink'], holder: 'waffle' }, 'icecream');
  ok(cold.tiers.join() === 'pink', '這種甜點沒有的顏色應過濾掉：' + cold.tiers.join());
  ok(St.deserialize({ holder: 'blue' }, 'sundae').holder === null, '聖代不該還原出容器');

  // 對答案
  const order = { customer: 'bear', dessert: 'cake', flavor: 'pink', topping: 'cherry', count: 2 };
  const mk = (tiers, toppings) => ({ kind: 'cake', holder: 'white', tiers: tiers, cream: null, toppings: toppings.map((id) => ({ id: id })) });
  ok(St.check(mk(['pink'], ['cherry', 'cherry']), order).done, '一層粉紅＋兩顆櫻桃應該算對');
  ok(St.check(mk(['pink', 'pink'], ['cherry', 'star', 'cherry']), order).done, '兩層都粉紅、多一顆星星應該算對（其他配料不管）');
  ok(!St.check(mk(['pink'], ['cherry', 'cherry', 'cherry']), order).done, '三顆櫻桃不該算對（數量要剛好）');
  ok(!St.check(mk(['pink'], ['cherry']), order).topping, '一顆櫻桃不該算對');
  ok(!St.check(mk(['pink', 'yellow'], ['cherry', 'cherry']), order).flavor, '夾一層黃色不該算粉紅色蛋糕');
  ok(!St.check(mk([], ['cherry', 'cherry']), order).flavor, '沒有蛋糕不該算對');
  ok(St.check(mk(['pink'], ['cherry', 'cherry', 'cherry']), order).count === 3, 'check 回報的數量不對');
  const placed = St.addTopping(St.addTopping(mk(['pink'], []), 'cherry', 100, 500), 'cherry');
  ok(St.check(placed, order).done, '拖到盤子上的櫻桃也要算一顆');

  // 點餐句子
  ok(St.sentence(order) === 'I want a pink cake with two cherries.', '點餐句子不對：' + St.sentence(order));
  const say = (o) => St.sentence(Object.assign({ customer: 'pig', count: 1 }, o));
  ok(say({ dessert: 'cake', flavor: 'chocolate', topping: 'star' }) === 'I want a chocolate cake with one star.', '單數的點餐句子不對');
  ok(say({ dessert: 'icecream', flavor: 'orange', topping: 'cherry' }) === 'I want an orange ice cream with one cherry.', 'an＋冰淇淋的句子不對：' + say({ dessert: 'icecream', flavor: 'orange', topping: 'cherry' }));
  ok(say({ dessert: 'donut', flavor: 'golden', topping: 'heart', count: 3 }) === 'I want a golden donut with three hearts.', '甜甜圈的句子不對');

  // 數出來
  const cnt = St.addTopping(St.addTopping(e, 'cherry'), 'cherry');
  ok(St.countPhrase(cnt, 'cherry') === 'two cherries', 'countPhrase 不對：' + St.countPhrase(cnt, 'cherry'));
  ok(St.countPhrase(St.addTopping(e, 'butter'), 'butter') === 'butter', '數不出來的配料只唸名字');
  ok(St.countPhrase(e, 'cherry') === '', '沒有放不用唸');

  // 出題：用固定序列的 rng 跑很多次，範圍都要對、不出高的配料、連續兩題不一樣
  let seed = 12345;
  const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  let prev = null;
  const counts = new Set();
  const kinds = new Set();
  for (let i = 0; i < 800; i++) {
    const o = St.makeOrder(rng, prev);
    const d = Data.dessert(o.dessert);
    ok(Data.customer(o.customer) && d && Data.topping(o.topping), '出題出現不存在的 id：' + JSON.stringify(o));
    ok(d && d.flavors.indexOf(o.flavor) >= 0, '出題的顏色這種甜點沒有：' + JSON.stringify(o));
    ok(!Data.topping(o.topping).noOrder, '出題不該出 ' + o.topping);
    ok(o.count >= 1 && o.count <= St.MAX_COUNT, '數量超出 1..' + St.MAX_COUNT + '：' + o.count);
    if (prev) ok(o.customer !== prev.customer, '連續兩題是同一位客人');
    ok(o.topping !== o.dessert, '配料跟甜點同名（' + o.dessert + '）不該出題');
    counts.add(o.count);
    kinds.add(o.dessert);
    prev = o;
  }
  ok(counts.size === St.MAX_COUNT, '出題的數量沒有涵蓋 1..' + St.MAX_COUNT + '：' + [...counts].join());
  ok(kinds.size === Data.DESSERTS.length, '出題沒有涵蓋所有甜點：' + [...kinds].join());
  // rng 回傳 1（邊界）也不能越界
  const edge = St.makeOrder(() => 0.9999999, null);
  ok(edge.count <= St.MAX_COUNT && Data.customer(edge.customer) && Data.dessert(edge.dessert), 'rng 接近 1 時出題越界：' + JSON.stringify(edge));
}

// ---------- C. 畫圖 ----------

{
  Data.TOPPINGS.forEach((t) => ok(Draw.TOPPING_IDS.indexOf(t.id) >= 0, '配料 ' + t.id + ' 在 cake-toppings.js 沒有圖'));
  Draw.TOPPING_IDS.forEach((id) => ok(Data.topping(id), 'cake-toppings.js 的 ' + id + ' 在資料表裡沒有'));
  Data.TOPPINGS.forEach((t) => ok(/^<svg[\s\S]*<\/svg>$/.test(Draw.iconTopping(t.id)), '配料小圖不是完整的 svg：' + t.id));
  Data.CREAMS.forEach((c) => ok(Draw.iconCream(c.id).indexOf(c.fill) >= 0, '奶油小圖沒用到 ' + c.id + ' 的顏色'));

  const TOPPING_TOP = Math.max.apply(null, Object.keys(Art.TALL).map((id) => Art.TALL[id]));

  Data.DESSERTS.forEach((d) => {
    const shape = Shapes.get(d.id);
    d.flavors.forEach((id) => ok(Draw.iconBase(d.id, id).indexOf(Data.flavor(id).fill) >= 0, d.id + ' 的小圖沒用到 ' + id + ' 的顏色'));
    (d.holders || []).forEach((h) => ok(/^<svg/.test(Draw.iconHolder(d.id, h.id)), d.id + ' 的容器小圖畫不出來：' + h.id));

    // 每種層數、有沒有奶油、每個容器、每個位置，最高的配料都要留在板面裡
    for (let n = 0; n <= d.maxTiers; n++) {
      for (const cream of [null, 'white']) {
        for (const holder of (d.holders || [{ id: null }])) {
          const tiers = [];
          for (let i = 0; i < n; i++) tiers.push(d.flavors[i % d.flavors.length]);
          const s = { kind: d.id, holder: holder.id, tiers: tiers, cream: cream, toppings: [] };
          const tag = d.id + ' ' + n + ' 層' + (cream ? '有奶油' : '') + (holder.id ? '、' + holder.id : '');
          for (const cx of [400, 530]) {
            const spots = shape.spots(s, cx);
            ok(spots.length >= St.MAX_TOPPINGS, tag + ' 的位置只有 ' + spots.length + ' 個，要 ' + St.MAX_TOPPINGS + ' 個');
            const seen = new Set();
            spots.slice(0, St.MAX_TOPPINGS).forEach((p, i) => {
              const top = p.y - TOPPING_TOP * p.k;
              const half = 50 * p.k;
              ok(isFinite(p.x) && isFinite(p.y) && p.k > 0, tag + ' 第 ' + i + ' 個位置不是數字');
              ok(top >= 60, tag + ' 第 ' + i + ' 個位置頂到遮雨棚（y=' + top.toFixed(1) + '）');
              ok(p.y <= Draw.H, tag + ' 第 ' + i + ' 個位置超出下緣');
              ok(p.x - half >= 0 && p.x + half <= Draw.W, tag + '、cx=' + cx + ' 第 ' + i + ' 個位置超出左右邊');
              ok(!seen.has(p.x + ',' + p.y), tag + ' 第 ' + i + ' 個位置跟別人重疊');
              seen.add(p.x + ',' + p.y);
            });
          }
          const svg = Draw.scene(s);
          ok(svg.indexOf('NaN') < 0 && svg.indexOf('undefined') < 0, tag + ' 的 scene 出現 NaN／undefined');
          ok((svg.match(/<g[\s>]/g) || []).length === (svg.match(/<\/g>/g) || []).length, tag + ' 的 <g> 沒有成對關閉');
          if (n) ok(svg.indexOf(Data.flavor(tiers[0]).fill) >= 0 || svg.indexOf(Data.flavor(tiers[0]).top) >= 0, tag + ' 沒畫出顏色');
        }
      }
    }
  });

  // 放的時候：點一下的依序用位置表、拖放的留在原地、拖放不佔位置
  {
    const e = St.addTier(St.empty(), 'pink');
    const spots = Shapes.get('cake').spots(e, 400);
    let s = St.addTopping(e, 'star');
    s = St.addTopping(s, 'heart', 111, 222);
    s = St.addTopping(s, 'cherry');
    const p = Draw.placements(s, 400);
    ok(p[0].x === spots[0].x && p[0].y === spots[0].y, '第一個點一下放的應在位置表第一格');
    ok(p[1].x === 111 && p[1].y === 222 && p[1].k === Draw.DROP_K, '拖放的應留在放的地方');
    ok(p[2].x === spots[1].x && p[2].y === spots[1].y, '拖放不該佔掉位置表的格子');
  }

  const s = { kind: 'cake', holder: 'white', tiers: ['pink', 'chocolate'], cream: 'white', toppings: [{ id: 'cherry' }, { id: 'candle' }, { id: 'star', x: 200, y: 300 }] };
  const svg = Draw.scene(s, { interactive: true });
  ok(svg.indexOf('<svg') === 0 && svg.slice(-6) === '</svg>', 'scene 不是完整的 svg');
  ok(/viewBox="0 0 800 600"/.test(svg), 'scene 的 viewBox 應為 0 0 800 600');
  ok((svg.match(/class="tp"/g) || []).length === 3, 'interactive 時每個配料都要有 class="tp"');
  ok(['0', '1', '2'].every((i) => svg.indexOf('data-i="' + i + '"') >= 0), 'interactive 時 data-i 要對應放的順序');
  ok(Draw.scene(s).indexOf('class="tp"') < 0, '非 interactive 時不該有命中區');
  ok(/<svg[^>]* width="1600" height="1200"/.test(Draw.scene(s, { size: [1600, 1200] })), '存圖用的 scene 根標籤要有 width/height');
  ok(svg.indexOf('NaN') < 0 && svg.indexOf('undefined') < 0, 'scene 裡出現 NaN／undefined');
  ok(Draw.scene(St.empty()).indexOf('NaN') < 0, '空盤子的 scene 出現 NaN');
  // 標籤配對（粗略的良構檢查：<g 與 </g> 數量一致）
  ok((svg.match(/<g[\s>]/g) || []).length === (svg.match(/<\/g>/g) || []).length, 'scene 的 <g> 沒有成對關閉');
}

// ---------- D. HTML ----------

{
  ok(exists('cake.html'), 'cake.html 不存在');
  const html = read('cake.html');
  ['selectScreen', 'dessertScreen', 'dessertGrid', 'gameScreen', 'board', 'cakeSvg', 'customer', 'bubble', 'nextBtn', 'fx', 'tray', 'catTabs', 'trayScroll', 'ghost',
    'backBtn', 'undoBtn', 'clearBtn', 'saveBtn', 'freeCard', 'orderCard',
    'freeDemo', 'orderDemo', 'saveOverlay', 'saveImg'].forEach((id) => {
    ok(html.indexOf('id="' + id + '"') >= 0, 'cake.html 少了 #' + id);
  });
  /* 新版設計：音樂／唸英文／只聽不看的開關收進首頁的大人專區，這一頁不該再有；
     慶祝（partyBtn）併進綠色完成鈕（saveBtn），完成畫面（saveOverlay）不再有「關閉」鈕。 */
  ['musicBtn', 'speechBtn', 'listenBtn', 'partyBtn'].forEach((id) => {
    ok(html.indexOf('id="' + id + '"') < 0, 'cake.html 不該再有 #' + id + '（新版收進大人專區／併進完成鈕）');
  });
  ok(/class="[^"]*home-hold[^"]*"/.test(html), 'cake.html 的回家鈕要用 home-hold（長按才回首頁）');
  ok(html.indexOf('href="css/base.css"') >= 0 && html.indexOf('href="css/cake.css"') >= 0, 'cake.html 要載入 css/base.css 與 css/cake.css');
  ok(html.indexOf('css/style.css') < 0, 'cake.html 不該再載入舊的 css/style.css');
  ok(html.indexOf('src="js/ui.js"') >= 0 && html.indexOf('src="js/ui.js"') < html.indexOf('src="js/cake.js"'), 'cake.html 要在 cake.js 之前載入 js/ui.js');
  const order = ['js/kiosk.js', 'js/sound.js', 'js/speech.js', 'js/storage.js', 'js/cake-data.js', 'js/cake-state.js', 'js/cake-toppings.js', 'js/cake-shapes.js', 'js/cake-draw.js', 'js/cake.js'];
  const pos = order.map((src) => html.indexOf('src="' + src + '"'));
  pos.forEach((p, i) => ok(p >= 0, 'cake.html 沒有載入 ' + order[i]));
  for (let i = 1; i < pos.length; i++) ok(pos[i] > pos[i - 1], 'cake.html 的 script 順序不對：' + order[i - 1] + ' 要在 ' + order[i] + ' 前面');
  ok(read('index.html').indexOf('href="cake.html"') >= 0, '首頁沒有甜點店的入口');
  // cake.js 要有 DOM 才能跑、這裡 require 不進來，至少確認語法沒壞（壞了整頁空白，其他檢查都看不出來）
  try { new (require('vm').Script)(read('js/cake.js')); } catch (err) { ok(false, 'js/cake.js 語法錯誤：' + err.message); }
}

if (problems.length) {
  console.error('甜點店檢查失敗，共 ' + problems.length + ' 項：');
  problems.slice(0, 40).forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
  if (problems.length > 40) console.error('  …還有 ' + (problems.length - 40) + ' 項');
  process.exit(1);
}
console.log('甜點店檢查全綠：資料表 / 純邏輯（上限、拖放、存檔、對答案、出題）/ 畫圖（七種甜點的位置、互動、尺寸）/ HTML 骨架。');
