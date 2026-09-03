#!/usr/bin/env node
/* 拼圖榫頭幾何的測試（零依賴，Node 直跑）。

   為什麼要這支：拼圖片改成有凹凸榫頭之後，「相鄰兩片對同一條邊必須一凸一凹」
   變成一個看畫面看不出來的不變量——兩片都凸只會讓線稿多一塊、兩片都凹只會少一塊，
   在小圖上肉眼幾乎無法察覺，但拼起來就是錯的。榫頭方向表只要有一個索引寫反，
   整排邊都會壞掉，所以用機器逐邊對帳。

   另外描邊路徑的座標若超出 canvas（含榫頭邊距）範圍，畫出來就會被裁掉一角，
   同樣是「只在某些難度、某些位置才看得到」的缺陷，一併鎖住。

   檢查項目：
     A. n=2..6 的 edgeMap：每條內邊，相鄰兩片拿到的值互為相反數；外框邊為 0
     B. 同一個 rand 序列產生相同的 map（可重現，測試才有意義）
     C. snapFraction 在 2..6 單調遞增、全部 <= 0.6、n=2 為 0.35
     D. tracePiece 的路徑：四邊全 0 時只有 4 個 lineTo 沒有 bezier；
        任一邊 ±1 時該邊有 bezier；路徑閉合；所有座標落在 [0, size*(1+2*tab)]

   跑法：node tools/check_puzzle.js  → 全綠 exit 0，任一項失敗 exit 1。 */

'use strict';

const PuzzleGeom = require('../js/puzzle-geom.js');

const problems = [];
function fail(msg) { problems.push(msg); }

/* 可重現的偽亂數：測試不能用 Math.random，否則失敗無法重播。
   線性同餘（數值取自 Numerical Recipes），夠亂又完全決定性。 */
function makeRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------- A/B. edgeMap 的不變量與可重現性 ----------

for (let n = 2; n <= 6; n++) {
  const map = PuzzleGeom.edgeMap(n, makeRand(42 + n));

  // 形狀先對：h 是 (n-1)×n、v 是 n×(n-1)
  if (!Array.isArray(map.h) || map.h.length !== n - 1) {
    fail(`n=${n}：edgeMap().h 應該有 ${n - 1} 列，實得 ${map.h && map.h.length}`);
  } else if (map.h.some((row) => row.length !== n)) {
    fail(`n=${n}：edgeMap().h 每列應該有 ${n} 欄`);
  }
  if (!Array.isArray(map.v) || map.v.length !== n) {
    fail(`n=${n}：edgeMap().v 應該有 ${n} 列，實得 ${map.v && map.v.length}`);
  } else if (map.v.some((row) => row.length !== n - 1)) {
    fail(`n=${n}：edgeMap().v 每列應該有 ${n - 1} 欄`);
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const e = PuzzleGeom.edgesOf(map, n, r, c);

      // 值域：只能是 -1 / 0 / +1
      ['top', 'right', 'bottom', 'left'].forEach((k) => {
        if (e[k] !== -1 && e[k] !== 0 && e[k] !== 1) {
          fail(`n=${n} (${r},${c})：${k} 值 ${e[k]} 不是 -1/0/1`);
        }
      });

      // 外框邊必須是 0（外框是直線，不能有榫頭）
      if (r === 0 && e.top !== 0) fail(`n=${n} (${r},${c})：最上排的 top 應為 0，實得 ${e.top}`);
      if (r === n - 1 && e.bottom !== 0) fail(`n=${n} (${r},${c})：最下排的 bottom 應為 0，實得 ${e.bottom}`);
      if (c === 0 && e.left !== 0) fail(`n=${n} (${r},${c})：最左欄的 left 應為 0，實得 ${e.left}`);
      if (c === n - 1 && e.right !== 0) fail(`n=${n} (${r},${c})：最右欄的 right 應為 0，實得 ${e.right}`);

      // 內邊必須非 0（每條內邊都要有榫頭，不能是直線）
      if (r > 0 && e.top === 0) fail(`n=${n} (${r},${c})：內邊 top 不該是 0`);
      if (c > 0 && e.left === 0) fail(`n=${n} (${r},${c})：內邊 left 不該是 0`);

      // 核心不變量：與右鄰、下鄰對同一條邊互為相反數
      if (c < n - 1) {
        const right = PuzzleGeom.edgesOf(map, n, r, c + 1);
        if (e.right !== -right.left) {
          fail(`n=${n} (${r},${c}).right=${e.right} 與 (${r},${c + 1}).left=${right.left} 不是相反數`);
        }
      }
      if (r < n - 1) {
        const below = PuzzleGeom.edgesOf(map, n, r + 1, c);
        if (e.bottom !== -below.top) {
          fail(`n=${n} (${r},${c}).bottom=${e.bottom} 與 (${r + 1},${c}).top=${below.top} 不是相反數`);
        }
      }
    }
  }

  // B. 可重現：同樣的 rand 序列必須產生一模一樣的 map
  const again = PuzzleGeom.edgeMap(n, makeRand(42 + n));
  if (JSON.stringify(again) !== JSON.stringify(map)) {
    fail(`n=${n}：同一個 rand 序列產生了不同的 edgeMap（不可重現）`);
  }
}

// ---------- C. snapFraction ----------

{
  const vals = [2, 3, 4, 5, 6].map((n) => PuzzleGeom.snapFraction(n));
  if (vals[0] !== 0.35) fail(`snapFraction(2) 應為 0.35，實得 ${vals[0]}`);
  vals.forEach((v, i) => {
    if (!(v <= 0.6)) fail(`snapFraction(${i + 2})=${v} 超過 0.6`);
  });
  for (let i = 1; i < vals.length; i++) {
    if (!(vals[i] > vals[i - 1])) {
      fail(`snapFraction 不是單調遞增：n=${i + 1} → ${vals[i - 1]}，n=${i + 2} → ${vals[i]}`);
    }
  }
  // 區間外要夾住，不能給出離譜的吸附半徑
  [1, 0, 7, 12].forEach((n) => {
    const v = PuzzleGeom.snapFraction(n);
    if (!(v >= 0.35 && v <= 0.6)) fail(`snapFraction(${n})=${v} 沒有夾在 [0.35, 0.6]`);
  });
}

// ---------- D. tracePiece 的路徑 ----------

/* 假 ctx：只記錄呼叫，不畫任何東西。Node 沒有 canvas，
   而我們要驗的本來就是「路徑指令的序列與座標」而不是像素。 */
function makeFakeCtx() {
  const calls = [];
  const pts = [];
  const push = (name, args) => {
    calls.push(name);
    for (let i = 0; i + 1 < args.length; i += 2) pts.push([args[i], args[i + 1]]);
  };
  return {
    calls,
    pts,
    beginPath() { calls.push('beginPath'); },
    moveTo(...a) { push('moveTo', a); },
    lineTo(...a) { push('lineTo', a); },
    bezierCurveTo(...a) { push('bezierCurveTo', a); },
    closePath() { calls.push('closePath'); }
  };
}

const SIZE = 100;
const TAB = PuzzleGeom.TAB;
const EXTENT = SIZE * (1 + 2 * TAB);

function checkBounds(ctx, label) {
  ctx.pts.forEach(([x, y], i) => {
    if (!(x >= -1e-9 && x <= EXTENT + 1e-9 && y >= -1e-9 && y <= EXTENT + 1e-9)) {
      fail(`${label}：第 ${i} 個座標 (${x}, ${y}) 超出 [0, ${EXTENT}]`);
    }
  });
}

// 四邊全 0（角落片的極端狀況）：純方形
{
  const ctx = makeFakeCtx();
  PuzzleGeom.tracePiece(ctx, SIZE, { top: 0, right: 0, bottom: 0, left: 0 }, TAB);
  const lineTos = ctx.calls.filter((c) => c === 'lineTo').length;
  const beziers = ctx.calls.filter((c) => c === 'bezierCurveTo').length;
  if (lineTos !== 4) fail(`四邊全 0 應有 4 個 lineTo，實得 ${lineTos}`);
  if (beziers !== 0) fail(`四邊全 0 不應有 bezierCurveTo，實得 ${beziers}`);
  if (ctx.calls[0] !== 'beginPath') fail('tracePiece 應以 beginPath 開頭');
  if (ctx.calls[1] !== 'moveTo') fail('tracePiece 的第二個呼叫應是 moveTo');
  if (ctx.calls[ctx.calls.length - 1] !== 'closePath') fail('tracePiece 應以 closePath 收尾');
  checkBounds(ctx, '四邊全 0');
}

// 逐邊、逐方向：該邊要出現 bezier，且路徑閉合、座標不出界
['top', 'right', 'bottom', 'left'].forEach((side) => {
  [1, -1].forEach((sign) => {
    const edges = { top: 0, right: 0, bottom: 0, left: 0 };
    edges[side] = sign;
    const ctx = makeFakeCtx();
    PuzzleGeom.tracePiece(ctx, SIZE, edges, TAB);
    const beziers = ctx.calls.filter((c) => c === 'bezierCurveTo').length;
    if (beziers < 3) fail(`${side}=${sign}：應該畫出三段以上 bezier，實得 ${beziers}`);
    if (ctx.calls[ctx.calls.length - 1] !== 'closePath') fail(`${side}=${sign}：路徑沒有 closePath`);
    checkBounds(ctx, `${side}=${sign}`);
  });
});

// 真實情境：n=4 的每一片都描一次，確保沒有任何一片出界
{
  const n = 4;
  const map = PuzzleGeom.edgeMap(n, makeRand(7));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const ctx = makeFakeCtx();
      PuzzleGeom.tracePiece(ctx, SIZE, PuzzleGeom.edgesOf(map, n, r, c), TAB);
      checkBounds(ctx, `n=4 片(${r},${c})`);
      if (ctx.calls[ctx.calls.length - 1] !== 'closePath') fail(`n=4 片(${r},${c}) 沒有 closePath`);
    }
  }
}

// ---------- 結果 ----------

if (problems.length) {
  console.error('拼圖幾何檢查失敗，共 ' + problems.length + ' 筆：');
  problems.forEach((p) => console.error('  ✗ ' + p));
  process.exit(1);
}
console.log('✓ 拼圖幾何檢查全綠（edgeMap 不變量 / 可重現 / snapFraction / tracePiece 路徑）');
