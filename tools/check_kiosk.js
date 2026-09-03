#!/usr/bin/env node
/* js/kiosk.js 的單元驗證（零依賴，Node 直跑）。

   為什麼要用假 DOM 而不是開瀏覽器：防誤觸這件事的失敗方式很安靜——
   單指 touchmove 被誤攔，著色頁的工具面板就捲不動，但畫面看起來完全正常；
   長按門檻寫錯，孩子手掌掃過 🏠 就整張畫掉回首頁，而開發機上用滑鼠點永遠重現不了。
   所以用 Node 造最小的 document／window，把「攔了什麼、沒攔什麼、幾毫秒才導頁」
   直接斷言成機器可驗的條件，不靠人眼在 iPad 上試。

   檢查項目：
     A. gesturestart／gesturechange／contextmenu／touchmove／dblclick 都有註冊，
        且 touchmove 是 { passive: false }（passive 的 handler 呼叫 preventDefault 無效）
     B. 兩指 touchmove 被 preventDefault，一指一律放行（面板要能捲）
     C. 長按未滿門檻放開 → 不導頁、holding class 被移除、什麼都不發生
     D. 長按超過門檻 → 導頁，且只導一次
     E. 🏠 的 click 預設導頁被攔掉（否則短點一下就跳走，長按就沒意義了）

   跑法：node tools/check_kiosk.js  → 全綠 exit 0，任一項失敗 exit 1。 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'js', 'kiosk.js');

const problems = [];
function fail(msg) { problems.push(msg); }
function ok(cond, msg) { if (!cond) fail(msg); }

function done() {
  if (problems.length) {
    console.error('kiosk.js 單元驗證失敗，共 ' + problems.length + ' 項：');
    problems.forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
    process.exit(1);
  }
  console.log('kiosk.js 單元驗證通過：五種手勢事件皆已註冊（touchmove passive:false）、'
    + '兩指 touchmove 被攔而單指放行、長按 300ms 放開不導頁且清掉 holding、'
    + '長按滿 ' + HOLD_EXPECT + 'ms 只導頁一次、🏠 的 click 預設行為被攔。');
}

const HOLD_EXPECT = 700;

if (!fs.existsSync(SRC)) {
  fail('js/kiosk.js 不存在（防誤觸與長按回首頁完全沒有實作）');
  done();
}

// ---------- 最小 DOM mock ----------

/* 造一個假元素：只實作 kiosk.js 會用到的介面，並把註冊的 handler 記下來，
   讓測試可以用 _fire() 手動送事件。 */
function makeEl() {
  const listeners = {};
  const el = {
    tagName: 'A',
    _attrs: { href: 'index.html', class: 'icon-btn home-hold' },
    _captured: null,
    classList: {
      _s: new Set(['icon-btn', 'home-hold']),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    style: {
      _p: {},
      setProperty(k, v) { this._p[k] = v; },
      removeProperty(k) { delete this._p[k]; }
    },
    getAttribute(n) { return n in el._attrs ? el._attrs[n] : null; },
    setAttribute(n, v) { el._attrs[n] = v; },
    hasPointerCapture() { return el._captured !== null; },
    setPointerCapture(id) { el._captured = id; },
    releasePointerCapture() { el._captured = null; },
    focus() {},
    addEventListener(t, fn, o) { (listeners[t] = listeners[t] || []).push({ fn: fn, o: o }); },
    removeEventListener(t, fn) {
      if (!listeners[t]) return;
      listeners[t] = listeners[t].filter(l => l.fn !== fn);
    },
    _listeners: listeners,
    _has(t) { return !!(listeners[t] && listeners[t].length); },
    _fire(type, extra) {
      const ev = Object.assign({ type: type, target: el, currentTarget: el, pointerId: 1 }, extra || {});
      ev.defaultPrevented = false;
      ev.preventDefault = function () { ev.defaultPrevented = true; };
      ev.stopPropagation = function () {};
      (listeners[type] || []).slice().forEach(l => l.fn.call(el, ev));
      return ev;
    }
  };
  return el;
}

const homeBtn = makeEl();

const docListeners = {};
const documentMock = {
  readyState: 'complete',
  documentElement: makeEl(),
  body: makeEl(),
  addEventListener(t, fn, o) { (docListeners[t] = docListeners[t] || []).push({ fn: fn, o: o }); },
  removeEventListener() {},
  /* 只要選擇器提到首頁或 home-hold，就當作選到那顆假 🏠 */
  querySelectorAll(sel) {
    return (/index\.html|home-hold/.test(sel)) ? [homeBtn] : [];
  },
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
};

function fireDoc(type, extra) {
  const ev = Object.assign({ type: type }, extra || {});
  ev.defaultPrevented = false;
  ev.preventDefault = function () { ev.defaultPrevented = true; };
  (docListeners[type] || []).slice().forEach(l => l.fn.call(documentMock, ev));
  return ev;
}
function docOpts(type) {
  const l = (docListeners[type] || [])[0];
  return l ? l.o : undefined;
}

// 導頁次數用 setter 記下來：只導一次是硬性條件（導兩次代表計時器沒清乾淨）
let navCount = 0;
let navTo = null;
const locationMock = { assign(u) { navCount++; navTo = u; }, replace(u) { navCount++; navTo = u; } };
Object.defineProperty(locationMock, 'href', {
  get() { return navTo === null ? 'coloring.html' : navTo; },
  set(v) { navCount++; navTo = v; }
});

const windowMock = {
  location: locationMock,
  addEventListener(t, fn, o) { (docListeners['win:' + t] = docListeners['win:' + t] || []).push({ fn: fn, o: o }); },
  removeEventListener() {},
  /* rAF 在測試裡不真的跑：進度環只是視覺，計時的責任在 setTimeout。
     回傳固定 id 讓 cancelAnimationFrame 有東西可取消。 */
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  navigator: { userAgent: 'node' }
};
windowMock.window = windowMock;
windowMock.document = documentMock;

const sandbox = {
  window: windowMock,
  document: documentMock,
  location: locationMock,
  navigator: windowMock.navigator,
  requestAnimationFrame: windowMock.requestAnimationFrame,
  cancelAnimationFrame: windowMock.cancelAnimationFrame,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Date: Date,
  Math: Math,
  performance: { now: () => Date.now() },
  console: console
};

try {
  vm.runInNewContext(fs.readFileSync(SRC, 'utf8'), sandbox, { filename: 'js/kiosk.js' });
} catch (e) {
  fail('載入 js/kiosk.js 就丟例外：' + e.message);
  done();
}

const Kiosk = windowMock.Kiosk;
ok(Kiosk && typeof Kiosk === 'object', 'js/kiosk.js 沒有掛出 window.Kiosk');
if (Kiosk) {
  ok(Kiosk.HOLD_MS === HOLD_EXPECT, 'Kiosk.HOLD_MS 應為 ' + HOLD_EXPECT + '，實際 ' + Kiosk.HOLD_MS);
  ok(typeof Kiosk.attachHold === 'function', 'Kiosk.attachHold 不是函式');
  ok(typeof Kiosk.install === 'function', 'Kiosk.install 不是函式');
}

// ---------- A. 五種手勢事件都有註冊 ----------

for (const t of ['gesturestart', 'gesturechange', 'contextmenu', 'touchmove', 'dblclick']) {
  ok(!!(docListeners[t] && docListeners[t].length), 'document 上沒有註冊 ' + t + ' handler');
}
{
  const o = docOpts('touchmove');
  ok(o && o.passive === false,
    'touchmove 必須用 { passive: false } 註冊，否則 preventDefault 會被瀏覽器忽略（實際：' + JSON.stringify(o) + '）');
}

// contextmenu / gesturestart 要真的擋掉
ok(fireDoc('contextmenu').defaultPrevented, 'contextmenu 沒有被 preventDefault（長按會跳出系統選單）');
ok(fireDoc('gesturestart').defaultPrevented, 'gesturestart 沒有被 preventDefault（Safari 兩指縮放）');
ok(fireDoc('dblclick').defaultPrevented, 'dblclick 沒有被 preventDefault（iOS 雙擊縮放）');

// ---------- B. 多指才攔，單指放行 ----------

ok(fireDoc('touchmove', { touches: [{}, {}] }).defaultPrevented,
  '兩指 touchmove 沒有被攔（會觸發縮放／整頁捲動）');
ok(!fireDoc('touchmove', { touches: [{}] }).defaultPrevented,
  '單指 touchmove 被攔了——著色頁的工具面板就捲不動了，這是硬性禁止');
ok(fireDoc('touchmove', { touches: [{}, {}, {}] }).defaultPrevented,
  '三指 touchmove 也應該被攔');

// ---------- E. click 預設導頁被攔 ----------

ok(homeBtn._has('click'), '🏠 上沒有註冊 click handler（install 沒接管到按鈕）');
ok(homeBtn._fire('click').defaultPrevented,
  '🏠 的 click 沒有被 preventDefault（短點一下就會跳走，長按門檻等於沒有）');

// ---------- C / D. 長按門檻 ----------

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async function main() {
  // C：按 300ms 放開 → 不導頁、holding 清掉
  ok(homeBtn._has('pointerdown'), '🏠 上沒有註冊 pointerdown handler');
  homeBtn._fire('pointerdown', { pointerId: 7, button: 0, isPrimary: true });
  ok(homeBtn.classList.contains('holding'), 'pointerdown 後沒有加上 holding class（沒有進度環回饋）');
  ok(homeBtn._captured === 7, 'pointerdown 沒有 setPointerCapture（手指微動就會掉出按鈕，長按會被中斷）');
  await sleep(300);
  homeBtn._fire('pointerup', { pointerId: 7 });
  ok(!homeBtn.classList.contains('holding'), '放開後 holding class 沒有移除');
  await sleep(500);   // 等過原本的 700ms 門檻，確認計時器真的被取消
  ok(navCount === 0, '長按只有 300ms 就放開，卻導頁了（navCount=' + navCount + '，去了 ' + navTo + '）');

  // D：按滿 750ms → 導頁一次
  homeBtn._fire('pointerdown', { pointerId: 8, button: 0, isPrimary: true });
  await sleep(750);
  ok(navCount === 1, '長按滿門檻應導頁剛好一次，實際 navCount=' + navCount);
  ok(/index\.html/.test(String(navTo)), '導頁目的地應為 index.html，實際 ' + navTo);
  homeBtn._fire('pointerup', { pointerId: 8 });
  await sleep(200);
  ok(navCount === 1, '放開後又導了一次頁（navCount=' + navCount + '）');
  ok(!homeBtn.classList.contains('holding'), '導頁後 holding class 沒有清掉');

  done();
})();
