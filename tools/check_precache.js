#!/usr/bin/env node
/* 離線可玩性的對帳測試（零依賴，Node 直跑）。
   為什麼要這支：service worker 的 PRECACHE 是一份「手抄的清單」，
   而真正會被載入的資產散在四個 HTML、幾支資料檔與 JSON 裡。
   兩邊只要有一邊改了、另一邊忘了跟，離線就會缺圖缺音，而且在有網路的
   開發機上完全看不出來——所以用機器做雙向對帳，不靠人眼。

   檢查項目：
     A. PRECACHE 裡的每個路徑，磁碟上都要真的存在
     B. 掃描到的每個執行期資產，都要在 PRECACHE 裡
     C. 四個 HTML 不得再外連 fonts.googleapis.com（外連＝離線就沒字型）
     D. 四個 HTML 都要註冊 service worker

   跑法：node tools/check_precache.js  → 全綠 exit 0，任一項失敗 exit 1。 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML_PAGES = ['index.html', 'coloring.html', 'puzzle.html', 'words.html'];

const problems = [];   // 逐筆缺漏，最後一次印出
function fail(msg) { problems.push(msg); }

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  try { return fs.statSync(path.join(ROOT, rel)).isFile(); } catch (e) { return false; }
}

/* 把 JS/CSS 的註解剝掉再抽路徑。
   為什麼：pictures-data.js 的檔頭註解裡就有一個範例路徑
   assets/pictures/family.jpg，那個檔並不存在；不剝註解會製造假紅燈。 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')          // 區塊註解
    .replace(/(^|[\s;{}])\/\/[^\n]*/g, '$1');  // 行註解（前面要求空白或標點，避免砍到 https://）
}

/* 把相對於某個檔案的路徑，正規化成相對於 repo 根目錄的路徑 */
function resolveFrom(baseDir, href) {
  const abs = path.resolve(ROOT, baseDir, href);
  return path.relative(ROOT, abs).split(path.sep).join('/');
}

// ---------- 1. 抽出 sw.js 的 PRECACHE ----------

let precache = null;
if (!exists('sw.js')) {
  fail('sw.js 不存在（service worker 還沒建立，離線完全不成立）');
} else {
  const swSrc = readFile('sw.js');
  const m = swSrc.match(/const\s+PRECACHE\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!m) {
    fail('sw.js 裡找不到 `const PRECACHE = [ ... ];` 陣列');
  } else {
    const body = stripComments(m[1]);
    precache = (body.match(/['"]([^'"]+)['"]/g) || []).map(s => s.slice(1, -1));
    if (precache.length === 0) fail('sw.js 的 PRECACHE 是空陣列');
  }
}

// ---------- 2. 掃描真正會被載入的資產 ----------

const needed = new Map();   // 路徑 → 是誰要用它（出問題時好回溯）
function need(p, why) {
  if (!p || /^(https?:)?\/\//.test(p) || p.startsWith('data:')) return;
  const clean = p.split('#')[0].split('?')[0];
  if (!clean) return;
  if (!needed.has(clean)) needed.set(clean, why);
}

// 2a. 四個 HTML 本身，以及它們的 <script src> 與本地 <link href>
for (const page of HTML_PAGES) {
  need(page, 'HTML 頁面本身');
  const html = readFile(page);
  for (const mm of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) need(mm[1], page + ' 的 <script>');
  for (const mm of html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)) need(mm[1], page + ' 的 <link>');
}

// 2b. 拼圖與場景線稿的資料檔
for (const [file, why] of [['js/pictures-data.js', '拼圖圖片'], ['js/lineart-scenes.js', '場景線稿']]) {
  const src = stripComments(readFile(file));
  for (const mm of src.matchAll(/src\s*:\s*['"]([^'"]+)['"]/g)) need(mm[1], why);
}

// 2c. words.json 的單字圖
{
  const words = JSON.parse(readFile('assets/data/words.json'));
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      if (typeof node.image === 'string') need(node.image, '單字卡圖片');
      Object.values(node).forEach(walk);
    }
  };
  walk(words);
}

// 2d. 背景音樂與音效（都是執行期才 fetch／new Audio，靜態掃描抓不到，靠路徑字面）
{
  const music = stripComments(readFile('js/music.js'));
  for (const mm of music.matchAll(/['"](assets\/music\/[^'"]+)['"]/g)) need(mm[1], '背景音樂');
  const sound = stripComments(readFile('js/sound.js'));
  for (const mm of sound.matchAll(/['"](assets\/sfx\/[^'"]+)['"]/g)) need(mm[1], '音效');
}

// 2e. manifest 的圖示（manifest 自己也要進快取）
{
  need('manifest.json', 'PWA manifest');
  const mf = JSON.parse(readFile('manifest.json'));
  (mf.icons || []).forEach(i => need(i.src, 'manifest 圖示'));
}

// 2f. CSS 裡的 url(...)（字型就是走這裡進來的）
{
  const css = readFile('css/style.css');
  for (const mm of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    need(resolveFrom('css', mm[1]), 'css/style.css 的 url()');
  }
}

// 2g. words.js 用 fetch 抓的 JSON
{
  const wjs = stripComments(readFile('js/words.js'));
  for (const mm of wjs.matchAll(/['"](assets\/data\/[^'"]+)['"]/g)) need(mm[1], 'words.js 的 fetch');
}

// ---------- 3. 雙向對帳 ----------

if (precache) {
  // A：清單裡的路徑，磁碟上要存在（'./' 代表首頁的 navigation，不對應實體檔）
  for (const p of precache) {
    if (p === './' || p === '.' || p === '/') continue;
    if (!exists(p)) fail('PRECACHE 列了但磁碟上沒有：' + p);
  }
  // B：掃到的資產都要在清單裡
  const set = new Set(precache);
  for (const [p, why] of needed) {
    if (!set.has(p)) fail('離線會缺這個資產（' + why + '）：' + p);
  }
}

// 磁碟檢查獨立於 sw.js 是否存在，掃到的路徑本身就該存在
for (const [p, why] of needed) {
  if (!exists(p)) fail('程式碼引用了不存在的檔案（' + why + '）：' + p);
}

// ---------- 4. HTML 的外連與 SW 註冊 ----------

for (const page of HTML_PAGES) {
  const html = readFile(page);
  if (html.includes('fonts.googleapis.com')) {
    fail(page + ' 還在外連 fonts.googleapis.com（離線就沒字型，字型要改成本地 woff2）');
  }
  if (!/serviceWorker\s*\.\s*register/.test(html)) {
    fail(page + ' 沒有註冊 service worker');
  }
}

// ---------- 5. 結果 ----------

if (problems.length) {
  console.error('離線對帳失敗，共 ' + problems.length + ' 項：');
  problems.forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
  process.exit(1);
}

console.log('離線對帳通過：PRECACHE ' + precache.length + ' 筆，掃描到的執行期資產 ' + needed.size + ' 筆，四個 HTML 皆已本地化字型並註冊 service worker。');
