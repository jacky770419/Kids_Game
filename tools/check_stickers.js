#!/usr/bin/env node
/* 貼紙場景頁的結構與純邏輯驗證（零依賴，Node 直跑）。

   為什麼要這支：貼紙頁有三類「看畫面看不出來」的失敗方式——

     1. 去底沒去乾淨。貼紙 SVG 是從「有底色方框」的圖庫圖改出來的，
        底色 rect 若留著，貼到背景上就是一塊白方塊蓋住城堡，
        但單看縮圖（縮圖本來就有白底框）完全正常。
     2. 資料表與磁碟不同步。清單裡多打一個 id，那格貼紙就是破圖；
        少引用一個檔，那張貼紙就永遠出不來——兩種都不會報錯。
     3. 座標與尺寸的純邏輯。位置存的是 0..1 比例，越界的值會把貼紙丟到
        畫面外再也抓不回來；尺寸循環寫錯只會「點了沒反應」。

   檢查項目：
     A. js/stickers-data.js 的 BACKGROUNDS / STICKERS 資料表
     B. assets/stickers/*.svg 去底成功、無 <image>、無孤兒檔
     C. assets/backgrounds/*.svg 的 viewBox 恰為 0 0 800 600
     D. js/stickers-state.js 的純函式
     E. tools/make_stickers.js 冪等（實際跑一次，比對前後的雜湊）
     F. stickers.html 的骨架與 script 載入順序

   跑法：node tools/check_stickers.js  → 全綠 exit 0，任一項失敗 exit 1。 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const problems = [];
function fail(msg) { problems.push(msg); }
function ok(cond, msg) { if (!cond) fail(msg); }

function abs(rel) { return path.join(ROOT, rel); }
function exists(rel) {
  try { return fs.statSync(abs(rel)).isFile(); } catch (e) { return false; }
}
function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }

function done() {
  if (problems.length) {
    console.error('貼紙場景檢查失敗，共 ' + problems.length + ' 項：');
    problems.forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
    process.exit(1);
  }
  console.log('貼紙場景檢查全綠：資料表 / 去底 / 背景 viewBox / 純邏輯 / make_stickers 冪等 / HTML 骨架。');
}

const CATS = ['princess', 'animals', 'fruits', 'sweets'];

// ---------- A. 資料表 ----------

let Data = null;
if (!exists('js/stickers-data.js')) {
  fail('js/stickers-data.js 不存在（背景與貼紙清單完全沒有）');
} else {
  try {
    Data = require(abs('js/stickers-data.js'));
  } catch (e) {
    fail('require js/stickers-data.js 就丟例外：' + e.message);
  }
}

if (Data) {
  const BG = Data.BACKGROUNDS;
  const ST = Data.STICKERS;

  ok(Array.isArray(BG) && BG.length === 3,
    'BACKGROUNDS 應為三筆，實得 ' + (Array.isArray(BG) ? BG.length : typeof BG));
  ok(Array.isArray(ST) && ST.length >= 27,
    'STICKERS 應至少 27 筆，實得 ' + (Array.isArray(ST) ? ST.length : typeof ST));

  if (Array.isArray(BG)) {
    const seen = new Set();
    BG.forEach((b, i) => {
      ok(b && typeof b.id === 'string' && b.id, 'BACKGROUNDS[' + i + '] 沒有 id');
      ok(b && typeof b.name === 'string' && b.name, 'BACKGROUNDS[' + i + '] 沒有中文 name');
      if (b && b.id) {
        ok(!seen.has(b.id), 'BACKGROUNDS 的 id 重複：' + b.id);
        seen.add(b.id);
      }
      ok(b && typeof b.src === 'string' && exists(b.src),
        'BACKGROUNDS[' + i + '] 的 src 檔案不存在：' + (b && b.src));
    });
  }

  if (Array.isArray(ST)) {
    const seen = new Set();
    const perCat = {};
    CATS.forEach((c) => { perCat[c] = 0; });
    ST.forEach((s, i) => {
      const at = 'STICKERS[' + i + ']' + (s && s.id ? '（' + s.id + '）' : '');
      ok(s && typeof s.id === 'string' && s.id, at + ' 沒有 id');
      if (s && s.id) {
        ok(!seen.has(s.id), 'STICKERS 的 id 重複：' + s.id);
        seen.add(s.id);
      }
      ok(s && typeof s.src === 'string' && exists(s.src), at + ' 的 src 檔案不存在：' + (s && s.src));
      ok(s && typeof s.word === 'string' && /^[a-z]+$/.test(s.word),
        at + ' 的 word 必須是純小寫英文字母，實得 ' + JSON.stringify(s && s.word));
      if (s && CATS.indexOf(s.cat) >= 0) perCat[s.cat]++;
      else fail(at + ' 的 cat 不屬於 ' + CATS.join('/') + '，實得 ' + JSON.stringify(s && s.cat));
    });
    CATS.forEach((c) => {
      ok(perCat[c] >= 3, '分類 ' + c + ' 只有 ' + perCat[c] + ' 張貼紙，至少要 3 張');
    });
  }
}

// ---------- B. 貼紙 SVG 去底 ----------

/* 「去底成功」的機器判準：SVG 裡不得有寬或高 ≥ viewBox 75% 的 <rect>。
   底色矩形一定是整面或近整面的；主體很少用這麼大的方塊，所以這條線
   既抓得到沒去乾淨的，也不會誤殺正常圖形。 */
function svgViewBox(src) {
  const m = src.match(/viewBox\s*=\s*["']\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)\s*["']/);
  if (!m) return null;
  return { x: +m[1], y: +m[2], w: +m[3], h: +m[4] };
}

function bigRects(src, vb) {
  const out = [];
  for (const m of src.matchAll(/<rect\b[^>]*>/g)) {
    const tag = m[0];
    const num = (name) => {
      const mm = tag.match(new RegExp(name + '\\s*=\\s*["\']([-\\d.]+)'));
      return mm ? parseFloat(mm[1]) : NaN;
    };
    const w = num('width');
    const h = num('height');
    if ((isFinite(w) && w >= vb.w * 0.75) || (isFinite(h) && h >= vb.h * 0.75)) out.push(tag);
  }
  return out;
}

let stickerFiles = [];
if (!fs.existsSync(abs('assets/stickers'))) {
  fail('assets/stickers/ 目錄不存在（貼紙圖檔完全沒有產出）');
} else {
  stickerFiles = fs.readdirSync(abs('assets/stickers')).filter((f) => f.endsWith('.svg')).sort();
  ok(stickerFiles.length > 0, 'assets/stickers/ 裡一張 SVG 都沒有');

  stickerFiles.forEach((f) => {
    const rel = 'assets/stickers/' + f;
    const src = read(rel);
    const vb = svgViewBox(src);
    if (!vb) { fail(rel + ' 沒有 viewBox'); return; }
    const bad = bigRects(src, vb);
    ok(bad.length === 0, rel + ' 還留著 ' + bad.length + ' 個底色 rect（去底沒成功）：' + bad[0]);
    ok(!/<image\b/.test(src), rel + ' 含有 <image>（貼紙必須是純向量，不能內嵌點陣圖）');
  });

  // 孤兒檔：磁碟上有但 STICKERS 沒引用
  if (Data && Array.isArray(Data.STICKERS)) {
    const used = new Set(Data.STICKERS.map((s) => s && s.src));
    stickerFiles.forEach((f) => {
      const rel = 'assets/stickers/' + f;
      ok(used.has(rel), rel + ' 是孤兒檔（磁碟上有，但 STICKERS 沒有引用）');
    });
  }
}

// ---------- C. 背景 SVG ----------

if (!fs.existsSync(abs('assets/backgrounds'))) {
  fail('assets/backgrounds/ 目錄不存在');
} else {
  const bgs = fs.readdirSync(abs('assets/backgrounds')).filter((f) => f.endsWith('.svg')).sort();
  ok(bgs.length === 3, 'assets/backgrounds/ 應有三張 SVG，實得 ' + bgs.length);
  bgs.forEach((f) => {
    const rel = 'assets/backgrounds/' + f;
    const vb = svgViewBox(read(rel));
    ok(vb && vb.x === 0 && vb.y === 0 && vb.w === 800 && vb.h === 600,
      rel + ' 的 viewBox 應為 0 0 800 600，實得 ' + (vb ? [vb.x, vb.y, vb.w, vb.h].join(' ') : '（沒有 viewBox）'));
  });
}

// ---------- D. 純邏輯 ----------

let State = null;
if (!exists('js/stickers-state.js')) {
  fail('js/stickers-state.js 不存在（座標夾限與狀態序列化完全沒有）');
} else {
  try {
    State = require(abs('js/stickers-state.js'));
  } catch (e) {
    fail('require js/stickers-state.js 就丟例外：' + e.message);
  }
}

if (State) {
  // clamp01
  if (typeof State.clamp01 !== 'function') fail('stickers-state 沒有 clamp01');
  else {
    ok(State.clamp01(-0.5) === 0, 'clamp01(-0.5) 應為 0，實得 ' + State.clamp01(-0.5));
    ok(State.clamp01(1.5) === 1, 'clamp01(1.5) 應為 1，實得 ' + State.clamp01(1.5));
    ok(State.clamp01(0.42) === 0.42, 'clamp01(0.42) 應原值回傳');
    ok(State.clamp01(0) === 0 && State.clamp01(1) === 1, 'clamp01 的邊界 0/1 應原值回傳');
    ok(State.clamp01(NaN) === 0, 'clamp01(NaN) 應回 0（壞值不能變成 NaN 座標）');
    ok(State.clamp01('abc') === 0, 'clamp01 對非數字應回 0');
  }

  // cycleSize
  if (typeof State.cycleSize !== 'function') fail('stickers-state 沒有 cycleSize');
  else {
    ok(State.cycleSize('s') === 'm', "cycleSize('s') 應為 'm'，實得 " + State.cycleSize('s'));
    ok(State.cycleSize('m') === 'l', "cycleSize('m') 應為 'l'，實得 " + State.cycleSize('m'));
    ok(State.cycleSize('l') === 's', "cycleSize('l') 應為 's'，實得 " + State.cycleSize('l'));
    ok(State.cycleSize('x') === 'm', "cycleSize 對未知尺寸應回退到 'm'，實得 " + State.cycleSize('x'));
  }

  // SIZES：三段寬度比例，且遞增
  if (!State.SIZES) fail('stickers-state 沒有 SIZES（三段尺寸的板面寬度比例）');
  else {
    const S = State.SIZES;
    ok(typeof S.s === 'number' && typeof S.m === 'number' && typeof S.l === 'number',
      'SIZES 必須有 s/m/l 三個數字');
    ok(S.s < S.m && S.m < S.l, 'SIZES 應該 s < m < l');
    ok(S.l <= 0.5, 'SIZES.l 不應超過板面寬的一半（大到蓋掉整張背景就沒得玩了）');
  }

  // serialize / deserialize
  if (typeof State.serialize !== 'function' || typeof State.deserialize !== 'function') {
    fail('stickers-state 沒有 serialize / deserialize');
  } else {
    const valid = new Set(['unicorn', 'bear', 'cake']);
    const list = [
      { id: 'unicorn', x: 0.5, y: 0.5, size: 'm' },
      { id: 'bear', x: 0.1, y: 0.9, size: 'l' },
      { id: 'cake', x: 0, y: 1, size: 's' }
    ];
    const round = State.deserialize(State.serialize(list), valid);
    ok(JSON.stringify(round) === JSON.stringify(list),
      'serialize/deserialize 往返不相等：\n  進 ' + JSON.stringify(list) + '\n  出 ' + JSON.stringify(round));

    // 未知 id 要被丟掉
    const dirty = State.deserialize([
      { id: 'unicorn', x: 0.2, y: 0.2, size: 'm' },
      { id: 'no-such-sticker', x: 0.3, y: 0.3, size: 'm' }
    ], valid);
    ok(dirty.length === 1 && dirty[0].id === 'unicorn',
      'deserialize 沒有丟掉未知 id，實得 ' + JSON.stringify(dirty));

    // 越界座標要被丟掉（不是夾住——存進去的越界值代表資料壞了）
    const oob = State.deserialize([
      { id: 'bear', x: 1.4, y: 0.5, size: 'm' },
      { id: 'bear', x: 0.5, y: -0.2, size: 'm' },
      { id: 'bear', x: 0.5, y: 0.5, size: 'm' }
    ], valid);
    ok(oob.length === 1, 'deserialize 應丟掉越界座標，實得 ' + JSON.stringify(oob));

    // 壞輸入不能炸
    ok(Array.isArray(State.deserialize(null, valid)), 'deserialize(null) 應回空陣列而不是丟例外');
    ok(Array.isArray(State.deserialize([null, 3, 'x'], valid)), 'deserialize 對垃圾元素應略過而不是丟例外');

    // 未知尺寸退回 m
    const badSize = State.deserialize([{ id: 'cake', x: 0.5, y: 0.5, size: 'zzz' }], valid);
    ok(badSize.length === 1 && badSize[0].size === 'm', "deserialize 對未知 size 應退回 'm'");
  }

  // hitTray：邊界含等於
  if (typeof State.hitTray !== 'function') fail('stickers-state 沒有 hitTray');
  else {
    const r = { left: 100, top: 50, right: 300, bottom: 400 };
    ok(State.hitTray({ x: 200, y: 200 }, r) === true, 'hitTray 對匣子正中的點應為 true');
    ok(State.hitTray({ x: 100, y: 50 }, r) === true, 'hitTray 的左上角邊界（含等於）應為 true');
    ok(State.hitTray({ x: 300, y: 400 }, r) === true, 'hitTray 的右下角邊界（含等於）應為 true');
    ok(State.hitTray({ x: 99.9, y: 200 }, r) === false, 'hitTray 對匣子左外側應為 false');
    ok(State.hitTray({ x: 200, y: 400.1 }, r) === false, 'hitTray 對匣子下外側應為 false');
    ok(State.hitTray({ x: 200, y: 200 }, null) === false, 'hitTray 對 null 矩形應回 false 而不是丟例外');
  }
}

// ---------- E. make_stickers.js 冪等 ----------

function hashDir(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).sort();
  const h = crypto.createHash('sha256');
  files.forEach((f) => {
    h.update(f);
    h.update(fs.readFileSync(path.join(dir, f)));
  });
  return h.digest('hex');
}

if (!exists('tools/make_stickers.js')) {
  fail('tools/make_stickers.js 不存在（貼紙去底工具還沒寫）');
} else {
  const dir = abs('assets/stickers');
  try {
    execFileSync(process.execPath, [abs('tools/make_stickers.js')], { cwd: ROOT, stdio: 'pipe' });
    const h1 = hashDir(dir);
    execFileSync(process.execPath, [abs('tools/make_stickers.js')], { cwd: ROOT, stdio: 'pipe' });
    const h2 = hashDir(dir);
    ok(h1 !== null, 'make_stickers.js 跑完之後 assets/stickers/ 還是不存在');
    ok(h1 === h2, 'make_stickers.js 不冪等：連跑兩次產出的內容不同（' + h1 + ' → ' + h2 + '）');
  } catch (e) {
    fail('執行 tools/make_stickers.js 失敗：' + (e.stderr ? String(e.stderr) : e.message));
  }
}

// ---------- F. stickers.html ----------

if (!exists('stickers.html')) {
  fail('stickers.html 不存在');
} else {
  const html = read('stickers.html');
  ok(/class=["'][^"']*home-hold/.test(html), 'stickers.html 的 🏠 沒有 home-hold class（長按回首頁不會生效）');
  ok(/id=["']musicBtn["']/.test(html), 'stickers.html 沒有 #musicBtn（music.js 找不到按鈕）');
  ok(/serviceWorker\s*\.\s*register/.test(html), 'stickers.html 沒有註冊 service worker');

  const order = ['js/kiosk.js', 'js/sound.js', 'js/speech.js', 'js/music.js',
    'js/storage.js', 'js/stickers-data.js', 'js/stickers-state.js', 'js/stickers.js'];
  const found = [];
  for (const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) found.push(m[1]);
  order.forEach((s) => { if (found.indexOf(s) < 0) fail('stickers.html 沒有引入 ' + s); });
  const idx = order.map((s) => found.indexOf(s));
  for (let i = 1; i < idx.length; i++) {
    if (idx[i - 1] >= 0 && idx[i] >= 0 && idx[i] < idx[i - 1]) {
      fail('stickers.html 的 script 順序錯了：' + order[i] + ' 出現在 ' + order[i - 1] + ' 之前');
    }
  }
}

done();
