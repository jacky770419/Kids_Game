// 紅燈測試：疊桶填色的膨脹演算法 growIntoEdges（Node 零依賴）
// 驗證：填色遮罩只往「線條像素」膨脹，絕不滲入隔壁可填區域。
'use strict';
const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'photo-tool.js'), 'utf8');
// photo-tool.js 是 IIFE，掛在 window.PhotoTool 上；瀏覽器沒有的 document 用不到
// （process()/maskFromStencil() 需要 document，但這裡只測不需要 canvas 的函式）。
const fakeWindow = {};
const fn = new Function('window', 'document', code + '; return window.PhotoTool || PhotoTool;');
const PhotoTool = fn(fakeWindow, undefined);

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL: ' + msg);
    failed++;
  } else {
    console.log('ok: ' + msg);
  }
}

// ---- 建 20x20 合成 edgeMask：中央一條直線把畫布分成左右兩區 ----
function buildMask(w, h, lineWidth) {
  const mask = new Uint8Array(w * h);
  const lineStart = Math.floor(w / 2) - Math.floor(lineWidth / 2);
  for (let y = 0; y < h; y++) {
    for (let x = lineStart; x < lineStart + lineWidth; x++) {
      mask[y * w + x] = 1;
    }
  }
  return { mask, lineStart };
}

const W = 20, H = 20;

// (a) 寬 1 px 線，從左區 floodFill
{
  const { mask, lineStart } = buildMask(W, H, 1);
  const filled = PhotoTool.floodFillMask(mask, W, H, 2, 2);
  assert(filled !== null, '(a) 左區 floodFill 有回傳');
  let ok = true, anyLeft = false;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (filled[i]) {
        anyLeft = true;
        if (x >= lineStart) ok = false; // 不該跑到線或右邊
      }
    }
  }
  assert(ok && anyLeft, '(a) 左區 floodFill 結果全部落在左區、不含線像素');
}

// (b) 寬 1 px 線，growIntoEdges 2 步：線像素全納入、右區零像素
{
  const { mask, lineStart } = buildMask(W, H, 1);
  const filled = PhotoTool.floodFillMask(mask, W, H, 2, 2);
  assert(typeof PhotoTool.growIntoEdges === 'function', 'growIntoEdges 存在');
  const grown = PhotoTool.growIntoEdges(filled, mask, W, H, 2);

  let lineAllIn = true;
  for (let y = 0; y < H; y++) {
    const i = y * W + lineStart;
    if (!grown[i]) lineAllIn = false;
  }
  assert(lineAllIn, '(b) 線寬1、2步後：線像素全部被納入');

  let rightZero = true;
  for (let y = 0; y < H; y++) {
    for (let x = lineStart + 1; x < W; x++) {
      if (grown[y * W + x]) rightZero = false;
    }
  }
  assert(rightZero, '(b) 線寬1、2步後：右區沒有任何像素被納入（核心防滲色斷言）');
}

// (c) 寬 3 px 線，2 步後：右區仍零像素；線像素只有靠左 2 欄被納入
{
  const { mask, lineStart } = buildMask(W, H, 3);
  const filled = PhotoTool.floodFillMask(mask, W, H, 2, 2);
  const grown = PhotoTool.growIntoEdges(filled, mask, W, H, 2);

  let rightZero = true;
  for (let y = 0; y < H; y++) {
    for (let x = lineStart + 3; x < W; x++) {
      if (grown[y * W + x]) rightZero = false;
    }
  }
  assert(rightZero, '(c) 線寬3、2步後：右區仍零像素');

  let leftTwoIn = true, thirdColOut = true;
  for (let y = 0; y < H; y++) {
    if (!grown[y * W + lineStart]) leftTwoIn = false;
    if (!grown[y * W + lineStart + 1]) leftTwoIn = false;
    if (grown[y * W + lineStart + 2]) thirdColOut = false; // 線的第3欄（靠右）2步走不到
  }
  assert(leftTwoIn, '(c) 線寬3、2步後：線的靠左2欄被納入');
  assert(thirdColOut, '(c) 線寬3、2步後：線的第3欄（靠右）2步走不到，未被納入');
}

// (d) 輸入陣列未被改動
{
  const { mask } = buildMask(W, H, 1);
  const filled = PhotoTool.floodFillMask(mask, W, H, 2, 2);
  const filledCopy = filled.slice();
  const maskCopy = mask.slice();
  PhotoTool.growIntoEdges(filled, mask, W, H, 2);
  let unchanged = true;
  for (let i = 0; i < filled.length; i++) {
    if (filled[i] !== filledCopy[i]) unchanged = false;
    if (mask[i] !== maskCopy[i]) unchanged = false;
  }
  assert(unchanged, '(d) growIntoEdges 不改動輸入 filled / edgeMask');
}

// (e) 效能：800x800 隨機線圖，2 步 < 200ms
{
  const N = 800;
  const mask = new Uint8Array(N * N);
  // 隨機灑一些「線」像素模擬真實遮罩密度（約 15%）
  let seed = 12345;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  for (let i = 0; i < mask.length; i++) mask[i] = rnd() < 0.15 ? 1 : 0;
  const filled = PhotoTool.floodFillMask(mask, N, N, 0, 0) || new Uint8Array(N * N);
  const t0 = Date.now();
  PhotoTool.growIntoEdges(filled, mask, N, N, 2);
  const ms = Date.now() - t0;
  console.log('(e) 800x800 2步 growIntoEdges 耗時 ' + ms + ' ms');
  assert(ms < 200, '(e) 效能 < 200ms（實測 ' + ms + 'ms）');
}

if (failed > 0) {
  console.error('\n' + failed + ' 項失敗');
  process.exit(1);
} else {
  console.log('\n全部通過');
}
