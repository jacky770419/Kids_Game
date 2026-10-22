#!/usr/bin/env node
/* 蛋糕店的資料、純邏輯、畫圖驗證（零依賴，Node 直跑）。

   為什麼要這支：蛋糕店有三類「看畫面看不出來」的失敗方式——

     1. 對答案寫鬆。數量判斷寫成 >=，放五顆櫻桃也上菜，她就學不到「兩顆」；
        顏色只看最上層，夾一層黃的也算「粉紅色蛋糕」。畫面上一切正常，只是教錯。
     2. 上限沒擋。第四層蛋糕或第八個裝飾會疊出板面頂端，點不到也拿不掉。
     3. 資料表與畫圖走鐘。資料表多一種裝飾、畫圖那邊沒有對應的圖，那格就是空白；
        客人圖檔路徑打錯就是破圖——兩種都不會報錯。

   檢查項目：
     A. js/cake-data.js 資料表（id 不重複、英文字、客人圖檔存在）
     B. js/cake-state.js 的純函式（上限、不就地修改、存檔過濾、對答案、點餐句子、出題）
     C. js/cake-draw.js（每種裝飾都畫得出來、裝飾位置不出板面、互動標記、存圖尺寸）
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
Data.CREAMS.forEach((c) => {
  ok(/^#[0-9A-F]{6}$/i.test(c.fill || ''), 'CREAMS ' + c.id + ' 的 fill 不是 #RRGGBB');
  ok(typeof c.say === 'string' && c.say.indexOf(c.word) >= 0, 'CREAMS ' + c.id + ' 的 say 要包含 word');
});
Data.TOPPINGS.forEach((t) => ok(/^[a-z]+$/.test(t.plural || '') && t.plural !== t.word, 'TOPPINGS ' + t.id + ' 的 plural 不對：' + t.plural));
Data.CUSTOMERS.forEach((c) => ok(exists(c.src), '客人 ' + c.id + ' 的圖檔不存在：' + c.src));
ok(Data.NUMBERS.length - 1 >= St.MAX_TOPPINGS, 'NUMBERS 要數得到頂上的上限 ' + St.MAX_TOPPINGS);
ok(Data.NUMBERS[2] === 'two', 'NUMBERS[2] 應為 two');

// ---------- B. 純邏輯 ----------

{
  const e = St.empty();
  ok(St.isEmpty(e), 'empty() 應該是空的');

  // 加層：不就地修改、三層上限、滿了改成換最上層
  const a = St.addTier(e, 'pink');
  ok(e.tiers.length === 0, 'addTier 就地修改了原狀態（↩️ 會壞掉）');
  let s = St.addTier(St.addTier(a, 'yellow'), 'blue');
  ok(s.tiers.join() === 'pink,yellow,blue', '疊三層的順序不對：' + s.tiers.join());
  s = St.addTier(s, 'green');
  ok(s.tiers.length === St.MAX_TIERS && s.tiers[2] === 'green', '滿三層時應換掉最上層，實得 ' + s.tiers.join());
  ok(St.removeTopTier(s).tiers.join() === 'pink,yellow', 'removeTopTier 不對');

  // 奶油：同一種再點一次＝拿掉
  const c1 = St.setCream(e, 'white');
  ok(c1.cream === 'white', 'setCream 沒放上去');
  ok(St.setCream(c1, 'white').cream === null, '同一種奶油再點一次應該拿掉');
  ok(St.setCream(c1, 'pink').cream === 'pink', '換另一種奶油應該直接換');

  // 裝飾：上限、滿了回傳同一個物件（呼叫端靠 === 判斷）
  let t = e;
  for (let i = 0; i < St.MAX_TOPPINGS; i++) t = St.addTopping(t, 'cherry');
  ok(t.toppings.length === St.MAX_TOPPINGS, '放不滿 ' + St.MAX_TOPPINGS + ' 個裝飾');
  ok(St.addTopping(t, 'star') === t, '頂上滿了 addTopping 應回傳原物件');
  const r = St.removeToppingAt(St.addTopping(St.addTopping(e, 'star'), 'heart'), 0);
  ok(r.toppings.join() === 'heart', 'removeToppingAt(0) 應拿掉第一個，實得 ' + r.toppings.join());
  ok(St.removeToppingAt(r, 5) === r, 'removeToppingAt 越界應回傳原物件');

  // 存檔：往返一致、壞資料過濾、上限截掉
  const full = { tiers: ['pink', 'blue'], cream: 'white', toppings: ['cherry', 'star'] };
  ok(JSON.stringify(St.deserialize(JSON.parse(JSON.stringify(St.serialize(full))))) === JSON.stringify(full), '存檔往返不一致');
  const bad = St.deserialize({ tiers: ['pink', 'rainbow', 3, 'blue', 'green', 'yellow'], cream: 'mud', toppings: ['cherry', null, 'rock'] });
  ok(bad.tiers.join() === 'pink,blue,green', '存檔還原應過濾掉不認得的顏色並截到三層，實得 ' + bad.tiers.join());
  ok(bad.cream === null, '不認得的奶油應還原成 null');
  ok(bad.toppings.join() === 'cherry', '不認得的裝飾應過濾掉，實得 ' + bad.toppings.join());
  ok(St.isEmpty(St.deserialize(null)) && St.isEmpty(St.deserialize('x')), '壞掉的存檔應還原成空蛋糕');

  // 對答案
  const order = { customer: 'bear', flavor: 'pink', topping: 'cherry', count: 2 };
  const mk = (tiers, toppings) => ({ tiers: tiers, cream: null, toppings: toppings });
  ok(St.check(mk(['pink'], ['cherry', 'cherry']), order).done, '一層粉紅＋兩顆櫻桃應該算對');
  ok(St.check(mk(['pink', 'pink'], ['cherry', 'star', 'cherry']), order).done, '兩層都粉紅、多一顆星星應該算對（其他裝飾不管）');
  ok(!St.check(mk(['pink'], ['cherry', 'cherry', 'cherry']), order).done, '三顆櫻桃不該算對（數量要剛好）');
  ok(!St.check(mk(['pink'], ['cherry']), order).topping, '一顆櫻桃不該算對');
  ok(!St.check(mk(['pink', 'yellow'], ['cherry', 'cherry']), order).flavor, '夾一層黃色不該算粉紅色蛋糕');
  ok(!St.check(mk([], ['cherry', 'cherry']), order).flavor, '沒有蛋糕不該算對');
  ok(St.check(mk(['pink'], ['cherry', 'cherry', 'cherry']), order).count === 3, 'check 回報的數量不對');

  // 點餐句子
  ok(St.sentence(order) === 'I want a pink cake with two cherries.', '點餐句子不對：' + St.sentence(order));
  ok(St.sentence({ customer: 'pig', flavor: 'chocolate', topping: 'star', count: 1 }) === 'I want a chocolate cake with one star.',
    '單數的點餐句子不對：' + St.sentence({ customer: 'pig', flavor: 'chocolate', topping: 'star', count: 1 }));

  // 出題：用固定序列的 rng 跑很多次，範圍都要對、不出蠟燭、連續兩題不一樣
  let seed = 12345;
  const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  let prev = null;
  const counts = new Set();
  for (let i = 0; i < 400; i++) {
    const o = St.makeOrder(rng, prev);
    ok(Data.customer(o.customer) && Data.flavor(o.flavor) && Data.topping(o.topping), '出題出現不存在的 id：' + JSON.stringify(o));
    ok(o.topping !== 'candle', '出題不該出蠟燭');
    ok(o.count >= 1 && o.count <= St.MAX_COUNT, '數量超出 1..' + St.MAX_COUNT + '：' + o.count);
    if (prev) ok(o.customer !== prev.customer, '連續兩題是同一位客人');
    counts.add(o.count);
    prev = o;
  }
  ok(counts.size === St.MAX_COUNT, '出題的數量沒有涵蓋 1..' + St.MAX_COUNT + '：' + [...counts].join());
  // rng 回傳 1（邊界）也不能越界
  const edge = St.makeOrder(() => 0.9999999, null);
  ok(edge.count <= St.MAX_COUNT && Data.customer(edge.customer), 'rng 接近 1 時出題越界：' + JSON.stringify(edge));
}

// ---------- C. 畫圖 ----------

{
  Data.TOPPINGS.forEach((t) => ok(Draw.TOPPING_IDS.indexOf(t.id) >= 0, '裝飾 ' + t.id + ' 在 cake-draw.js 沒有圖'));
  Data.FLAVORS.forEach((f) => ok(Draw.iconFlavor(f.id).indexOf(f.fill) >= 0, '蛋糕小圖沒用到 ' + f.id + ' 的顏色'));
  Data.CREAMS.forEach((c) => ok(Draw.iconCream(c.id).indexOf(c.fill) >= 0, '奶油小圖沒用到 ' + c.id + ' 的顏色'));
  Data.TOPPINGS.forEach((t) => ok(/^<svg[\s\S]*<\/svg>$/.test(Draw.iconTopping(t.id)), '裝飾小圖不是完整的 svg：' + t.id));

  ok(Draw.SLOTS.length === St.MAX_TOPPINGS, 'SLOTS 數量要等於裝飾上限');

  // 每種層數、每個位置、最高的裝飾（蠟燭含火焰約 170 單位）都要留在板面裡
  for (let n = 0; n <= St.MAX_TIERS; n++) {
    const tiers = ['pink', 'yellow', 'blue'].slice(0, n);
    for (const cx of [400, 530]) {
      for (let i = 0; i < St.MAX_TOPPINGS; i++) {
        const p = Draw.toppingPlacement(tiers, i, cx);
        const top = p.y - 170 * p.k;
        const half = 50 * p.k;
        ok(top >= 60, n + ' 層、第 ' + i + ' 個裝飾頂到遮雨棚（y=' + top.toFixed(1) + '）');
        ok(p.x - half >= 0 && p.x + half <= Draw.W, n + ' 層、cx=' + cx + '、第 ' + i + ' 個裝飾超出左右邊');
      }
    }
  }

  const s = { tiers: ['pink', 'chocolate'], cream: 'white', toppings: ['cherry', 'candle', 'star'] };
  const svg = Draw.scene(s, { interactive: true });
  ok(svg.indexOf('<svg') === 0 && svg.slice(-6) === '</svg>', 'scene 不是完整的 svg');
  ok(/viewBox="0 0 800 600"/.test(svg), 'scene 的 viewBox 應為 0 0 800 600');
  ok((svg.match(/class="tp"/g) || []).length === 3, 'interactive 時每個裝飾都要有 class="tp"');
  ok(['0', '1', '2'].every((i) => svg.indexOf('data-i="' + i + '"') >= 0), 'interactive 時 data-i 要對應放的順序');
  ok(Draw.scene(s).indexOf('class="tp"') < 0, '非 interactive 時不該有命中區');
  ok(/<svg[^>]* width="1600" height="1200"/.test(Draw.scene(s, { size: [1600, 1200] })), '存圖用的 scene 根標籤要有 width/height');
  ok(svg.indexOf('NaN') < 0 && svg.indexOf('undefined') < 0, 'scene 裡出現 NaN／undefined');
  ok(Draw.scene(St.empty()).indexOf('NaN') < 0, '空蛋糕的 scene 出現 NaN');
  // 標籤配對（粗略的良構檢查：<g 與 </g> 數量一致）
  ok((svg.match(/<g[\s>]/g) || []).length === (svg.match(/<\/g>/g) || []).length, 'scene 的 <g> 沒有成對關閉');
}

// ---------- D. HTML ----------

{
  ok(exists('cake.html'), 'cake.html 不存在');
  const html = read('cake.html');
  ['selectScreen', 'gameScreen', 'board', 'cakeSvg', 'customer', 'bubble', 'nextBtn', 'fx', 'tray', 'catTabs', 'trayScroll',
    'backBtn', 'listenBtn', 'undoBtn', 'clearBtn', 'partyBtn', 'saveBtn', 'speechBtn', 'musicBtn', 'freeCard', 'orderCard',
    'freeDemo', 'orderDemo', 'saveOverlay', 'saveImg', 'closeSave'].forEach((id) => {
    ok(html.indexOf('id="' + id + '"') >= 0, 'cake.html 少了 #' + id);
  });
  ok(/class="icon-btn home-hold"/.test(html), 'cake.html 的 🏠 要用 home-hold（長按才回首頁）');
  const order = ['js/kiosk.js', 'js/sound.js', 'js/speech.js', 'js/storage.js', 'js/cake-data.js', 'js/cake-state.js', 'js/cake-draw.js', 'js/cake.js'];
  const pos = order.map((src) => html.indexOf('src="' + src + '"'));
  pos.forEach((p, i) => ok(p >= 0, 'cake.html 沒有載入 ' + order[i]));
  for (let i = 1; i < pos.length; i++) ok(pos[i] > pos[i - 1], 'cake.html 的 script 順序不對：' + order[i - 1] + ' 要在 ' + order[i] + ' 前面');
  ok(read('index.html').indexOf('href="cake.html"') >= 0, '首頁沒有蛋糕店的入口');
}

if (problems.length) {
  console.error('蛋糕店檢查失敗，共 ' + problems.length + ' 項：');
  problems.forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
  process.exit(1);
}
console.log('蛋糕店檢查全綠：資料表 / 純邏輯（上限、存檔、對答案、出題）/ 畫圖（位置、互動、尺寸）/ HTML 骨架。');
