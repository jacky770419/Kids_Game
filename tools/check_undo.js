#!/usr/bin/env node
/* 復原（undo）快照範圍的驗證（零依賴，Node 直跑）。

   為什麼要這支：舊做法是「每筆動作前存整張 ImageData」，在畫面上完全看不出問題，
   但記憶體是線性堆的——iPad 直向 paintLayer 是 800x1600，一筆快照 5.12 MB，
   HISTORY_MAX=25 就是 128 MB，Safari 會直接把分頁殺掉。改成「只存這次動作的外接矩形」
   之後，錯誤方式有三種而且都不會報錯：

     1. 矩形算太小 → 復原之後畫面上留下擦不掉的殘影（矩形外的像素沒還原）。
     2. 矩形算太大（例如夾限寫錯變成整張）→ 記憶體白改一場，測不出來。
     3. putImageData 忘了帶 x/y → 整筆畫的內容被貼到左上角，畫面直接壞掉。

   檢查項目：
     A. UndoRect.toRect / addCircle / addSegment 的邊界與取整
     B. UndoRect.maskExtent 的外接矩形與 pad
     C. js/coloring.js / coloring.html 的靜態斷言（IIFE 綁 DOM，Node 沒法直接跑）
     D. 記憶體上界的數學斷言（鎖住 toRect 不會亂膨脹）

   跑法：node tools/check_undo.js  → 全綠 exit 0，任一項失敗 exit 1。 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const problems = [];
function fail(msg) { problems.push(msg); }
function ok(cond, msg) { if (!cond) fail(msg); }

function abs(rel) { return path.join(ROOT, rel); }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }
function exists(rel) {
  try { return fs.statSync(abs(rel)).isFile(); } catch (e) { return false; }
}

function eq(actual, expect, what) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expect);
  if (a !== b) fail(what + '：預期 ' + b + '，實際 ' + a);
}

function done() {
  if (problems.length) {
    console.error('復原範圍檢查失敗，共 ' + problems.length + ' 項：');
    problems.forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
    process.exit(1);
  }
  console.log('復原範圍檢查全綠：toRect 取整與夾限 / maskExtent / coloring 靜態斷言 / 記憶體上界。');
}

// ---------- 先確認檔案在不在 ----------
if (!exists('js/undo-rect.js')) {
  fail('缺少 js/undo-rect.js');
  done();
}

const UndoRect = require(abs('js/undo-rect.js'));

// ---------- A. toRect / addCircle / addSegment ----------
(function checkRect() {
  ok(typeof UndoRect.create === 'function', 'UndoRect.create 不是函式');
  ok(typeof UndoRect.addCircle === 'function', 'UndoRect.addCircle 不是函式');
  ok(typeof UndoRect.addSegment === 'function', 'UndoRect.addSegment 不是函式');
  ok(typeof UndoRect.toRect === 'function', 'UndoRect.toRect 不是函式');
  if (problems.length) return;

  // 空的累積器沒有任何範圍
  eq(UndoRect.toRect(UndoRect.create(), 100, 100), null, 'A1 空累積器');

  // 單點取整：x 7.9..12.9 → floor 7 / ceil 13 → w 6；y 8.1..13.1 → floor 8 / ceil 14 → h 6
  const a = UndoRect.create();
  UndoRect.addCircle(a, 10.4, 10.6, 2.5);
  eq(UndoRect.toRect(a, 100, 100), { x: 7, y: 8, w: 6, h: 6 }, 'A2 單點外接矩形');

  // 超出畫布要夾到邊界，不能出現負數或超過畫布
  const b = UndoRect.create();
  UndoRect.addCircle(b, 2, 2, 20);
  eq(UndoRect.toRect(b, 100, 100), { x: 0, y: 0, w: 22, h: 22 }, 'A3 左上越界夾限');

  const c = UndoRect.create();
  UndoRect.addCircle(c, 98, 98, 20);
  eq(UndoRect.toRect(c, 100, 100), { x: 78, y: 78, w: 22, h: 22 }, 'A4 右下越界夾限');

  // 完全在畫布外 → 沒有可存的像素
  const d = UndoRect.create();
  UndoRect.addCircle(d, -50, -50, 10);
  eq(UndoRect.toRect(d, 100, 100), null, 'A5 完全在畫布外');

  // 線段要包住兩端（各自加半徑）
  const e = UndoRect.create();
  UndoRect.addSegment(e, { x: 20, y: 30 }, { x: 60, y: 40 }, 5);
  eq(UndoRect.toRect(e, 100, 100), { x: 15, y: 25, w: 50, h: 20 }, 'A6 線段外接矩形');

  // 多次累加取聯集
  const f = UndoRect.create();
  UndoRect.addCircle(f, 10, 10, 2);
  UndoRect.addCircle(f, 50, 60, 3);
  eq(UndoRect.toRect(f, 100, 100), { x: 8, y: 8, w: 45, h: 55 }, 'A7 多次累加的聯集');

  // 寬高至少 1（半徑 0 的點也要能存回去）
  const g = UndoRect.create();
  UndoRect.addCircle(g, 40, 40, 0);
  const r = UndoRect.toRect(g, 100, 100);
  ok(r && r.w >= 1 && r.h >= 1, 'A8 半徑 0 的點寬高要 >= 1，實際 ' + JSON.stringify(r));
})();

// ---------- B. maskExtent ----------
(function checkMaskExtent() {
  ok(typeof UndoRect.maskExtent === 'function', 'UndoRect.maskExtent 不是函式');
  if (problems.length) return;

  eq(UndoRect.maskExtent(new Uint8Array(20 * 20), 20, 20, 0), null, 'B1 全 0 遮罩');

  const m = new Uint8Array(20 * 20);
  m[7 * 20 + 5] = 1;   // (x=5, y=7)
  eq(UndoRect.maskExtent(m, 20, 20, 0), { x: 5, y: 7, w: 1, h: 1 }, 'B2 單像素 pad 0');
  eq(UndoRect.maskExtent(m, 20, 20, 2), { x: 3, y: 5, w: 5, h: 5 }, 'B3 單像素 pad 2');

  const c = new Uint8Array(20 * 20);
  c[0] = 1;            // (0,0) 貼邊
  eq(UndoRect.maskExtent(c, 20, 20, 2), { x: 0, y: 0, w: 3, h: 3 }, 'B4 貼邊像素 pad 2');

  const two = new Uint8Array(20 * 20);
  two[2 * 20 + 3] = 1;
  two[9 * 20 + 15] = 1;
  eq(UndoRect.maskExtent(two, 20, 20, 0), { x: 3, y: 2, w: 13, h: 8 }, 'B5 兩點外接矩形');
})();

// ---------- C. coloring.js / coloring.html 的靜態斷言 ----------
(function checkColoringSource() {
  const src = read('js/coloring.js');

  // C1 不能再有「整張畫布快照」——getImageData(0, 0, 某canvas.width, ...)
  const wholeCanvas = src.match(/getImageData\(\s*0\s*,\s*0\s*,\s*[A-Za-z_$][\w$]*\.width/g);
  ok(!wholeCanvas, 'C1 coloring.js 還有整張畫布快照：' + (wholeCanvas || []).join(' / '));
  ok(!/function\s+snapshotCanvas\s*\(/.test(src),
    'C1b coloring.js 還留著 snapshotCanvas()（整張快照的舊路徑）');

  // C2 undo() 的 putImageData 要帶三個引數，第 2、3 個是 entry.x / entry.y
  const undoBody = fnBody(src, 'undo');
  if (!undoBody) fail('C2 找不到 undo() 函式本體');
  else {
    const put = undoBody.match(/putImageData\(([^)]*)\)/);
    if (!put) fail('C2 undo() 裡沒有 putImageData 呼叫');
    else {
      const args = put[1].split(',').map(s => s.trim());
      ok(args.length === 3, 'C2 undo() 的 putImageData 要三個引數，實際 ' + args.length + ' 個：' + put[1]);
      ok(/\.x$/.test(args[1] || '') && /\.y$/.test(args[2] || ''),
        'C2 undo() 的 putImageData 第 2、3 個引數要是 entry.x / entry.y，實際 ' + put[1]);
    }
  }

  // C3 四支繪圖函式都要把自己的影響範圍加進累積器
  ['drawSegment', 'splat', 'stampAt', 'sprinkleGlitter'].forEach((name) => {
    const body = fnBody(src, name);
    if (!body) { fail('C3 找不到 ' + name + '() 函式本體'); return; }
    ok(/UndoRect\.add/.test(body), 'C3 ' + name + '() 沒有呼叫 UndoRect.add*（這筆的影響範圍會漏算）');
  });

  // C4 coloring.html 要在 coloring.js 之前載入 undo-rect.js
  const html = read('coloring.html');
  const srcs = [];
  for (const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) srcs.push(m[1]);
  const iu = srcs.indexOf('js/undo-rect.js');
  const ic = srcs.indexOf('js/coloring.js');
  ok(iu >= 0, 'C4 coloring.html 沒有引入 js/undo-rect.js');
  ok(ic >= 0, 'C4 coloring.html 沒有引入 js/coloring.js');
  if (iu >= 0 && ic >= 0) ok(iu < ic, 'C4 js/undo-rect.js 必須排在 js/coloring.js 之前');
})();

/* 從原始碼裡切出某個 function 的本體（含大括號），用括號配對而不是正則吃到底，
   免得遇到函式裡的字串／註解就切錯。找不到回 null。 */
function fnBody(src, name) {
  const at = src.indexOf('function ' + name + '(');
  if (at < 0) return null;
  const open = src.indexOf('{', at);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  return null;
}

// ---------- D. 記憶體上界 ----------
(function checkMemoryBound() {
  if (typeof UndoRect.toRect !== 'function') return;
  /* iPad 直向 paintLayer = 800x1600。舊做法一筆快照 800*1600*4 = 5.12 MB，
     25 筆 = 128 MB。新做法：一筆 60px 粗、橫跨整張紙的線，矩形應該只有 800x62 上下。 */
  const acc = UndoRect.create();
  UndoRect.addSegment(acc, { x: 0, y: 800 }, { x: 800, y: 800 }, 31);   // 60/2 + 1（抗鋸齒）
  const r = UndoRect.toRect(acc, 800, 1600);
  ok(!!r, 'D1 橫線算不出矩形');
  if (!r) return;
  const bytes = r.w * r.h * 4;
  ok(bytes < 250 * 1024,
    'D1 一筆橫貫全紙的粗線快照應 < 250 KB，實際 ' + Math.round(bytes / 1024) + ' KB（矩形 ' +
    r.w + 'x' + r.h + '）');

  // 最壞情況（整張塗滿）也不該超過整張畫布
  const full = UndoRect.create();
  UndoRect.addCircle(full, 400, 800, 5000);
  const fr = UndoRect.toRect(full, 800, 1600);
  eq(fr, { x: 0, y: 0, w: 800, h: 1600 }, 'D2 最壞情況剛好是整張畫布，不能溢出');
})();

done();
