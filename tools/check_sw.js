#!/usr/bin/env node
/* sw.js 的最小離線單元驗證（零依賴，Node 直跑）。
   service worker 沒辦法在 Node 裡真的跑起來，但它最容易寫錯、
   又最難在瀏覽器裡肉眼看出來的兩段邏輯是純函式性的，值得單獨鎖住：

     1. activate 的版本汰舊——舊版 cache 要刪、本版 cache 要留。
        寫錯的話使用者會一直吃到舊資產，而且改版後完全沒有徵兆。
     2. Range 切片——iOS Safari 的 <audio> 會帶 Range 標頭，
        回整包 200 會讓背景音樂拒播。這裡驗 bytes=0-99 要回 206、body 剛好 100 bytes。

   作法：用 vm 建一個假的 worker 全域環境（self / caches / addEventListener），
   把 sw.js 載進去，再手動觸發對應的事件。

   跑法：node tools/check_sw.js  → 全綠 exit 0。 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const failures = [];
function check(ok, msg) { if (!ok) failures.push(msg); }

// ---------- 假的 worker 環境 ----------

const deleted = [];                       // 記錄 caches.delete 被呼叫時刪了誰
/* 本版 cache 名稱從 sw.js 裡的 CACHE_VERSION 讀出來，不要寫死。
   為什麼：只要改動被快取的檔案就得升版（本 repo 的規則），
   版本號寫死的話每升一次版這支測試就會假紅一次。 */
const SW_SRC = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const versionMatch = SW_SRC.match(/const\s+CACHE_VERSION\s*=\s*'([^']+)'/);
if (!versionMatch) {
  console.error('sw.js 裡找不到 CACHE_VERSION');
  process.exit(1);
}
const CURRENT_CACHE = 'kids-' + versionMatch[1];
const cacheNames = ['kids-v0', CURRENT_CACHE, 'other-cache'];
let claimed = false;

// 一份假的快取回應：200 bytes 的可預期內容
const BODY = Buffer.alloc(200);
for (let i = 0; i < BODY.length; i++) BODY[i] = i % 256;

function makeCachedResponse() {
  return new Response(BODY, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
}

const listeners = {};
/* sw.js 裡 new Request('js/words.js') 是相對於 SW 所在位置；Node 的 Request 只吃絕對網址，
   所以包一層把相對路徑補上 origin，行為才跟瀏覽器一致。 */
class SwRequest extends Request {
  constructor(input, init) {
    if (typeof input === 'string' && !/^https?:/.test(input)) input = 'https://example.test/' + input.replace(/^\.\//, '');
    super(input, init);
  }
}
/* install 用的假網路與假 cache：fetched 記下 install 抓了哪些 Request，
   putKeys 記下寫進本版 cache 的網址；preHave 模擬「上次下載到一半」已經在 cache 裡的檔。 */
const fetched = [];
const putKeys = [];
const preHave = ['index.html', 'js/coloring.js'];
let failUrl = null;     // 設了就讓這一筆回 404，測「缺一筆就不能裝好」
let skipped = false;
const fakeFetch = (req) => {
  fetched.push(req);
  const ok = !(failUrl && req.url.endsWith('/' + failUrl));
  return Promise.resolve(new Response('x', { status: ok ? 200 : 404 }));
};
const sandbox = {
  console,
  Response, Headers, Request: SwRequest, URL, fetch: fakeFetch, Set, Error,
  Promise, Math, parseInt, isFinite, String, Number, Array, Object, JSON,
  setTimeout, clearTimeout,
  caches: {
    open: () => Promise.resolve({
      keys: () => Promise.resolve(preHave.map((u) => new Request('https://example.test/' + u))),
      put: (u) => { putKeys.push(String(u)); return Promise.resolve(); }
    }),
    keys: () => Promise.resolve(cacheNames.slice()),
    delete: (n) => { deleted.push(n); return Promise.resolve(true); },
    match: () => Promise.resolve(makeCachedResponse())
  }
};
sandbox.self = sandbox;
sandbox.location = { origin: 'https://example.test', href: 'https://example.test/sw.js' };
sandbox.addEventListener = (type, fn) => { listeners[type] = fn; };
sandbox.skipWaiting = () => { skipped = true; return Promise.resolve(); };
sandbox.clients = { claim: () => { claimed = true; return Promise.resolve(); }, matchAll: () => Promise.resolve([]) };

vm.createContext(sandbox);
vm.runInContext(SW_SRC, sandbox, { filename: 'sw.js' });

check(typeof listeners.install === 'function', 'sw.js 沒有註冊 install 事件');

check(typeof listeners.activate === 'function', 'sw.js 沒有註冊 activate 事件');
check(typeof listeners.fetch === 'function', 'sw.js 沒有註冊 fetch 事件');

// ---------- 測試 0：install 可續傳、每筆 cache:'reload'、缺一筆就不啟用 ----------
/* 為什麼：
   - cache:'reload'：預設走 HTTP 快取，升版時會把上一版的檔案搬進新 cache（2026-09-03 實測：kids-v2 裡的 words.js 還是舊檔）。
   - 續傳：離線包約 13 MB，iPad 上 App 一切走 install 就被砍；本版 cache 已有的不能重抓，否則永遠下載不完（2026-11-06）。
   - 缺一筆就不能 skipWaiting：寧可留舊版，也不要半殘快取。 */
const PRECACHE_LIST = vm.runInContext('PRECACHE', sandbox);
function runInstall() {
  let installed = null;
  listeners.install({ waitUntil: (p) => { installed = p; } });
  return Promise.resolve(installed);
}
function testInstall() {
  return runInstall().then(() => {
    const want = PRECACHE_LIST.filter((u) => preHave.indexOf(u) < 0);
    check(fetched.length === want.length, 'install 應該只抓 cache 裡還沒有的 ' + want.length + ' 筆，實際抓了 ' + fetched.length + ' 筆');
    check(!fetched.some((r) => preHave.some((u) => r.url.endsWith('/' + u))), 'install 重抓了 cache 裡已經有的檔（不能續傳）');
    const bad = fetched.filter((r) => !(r instanceof Request) || r.cache !== 'reload');
    check(bad.length === 0, 'install 有 ' + bad.length + ' 筆不是 cache:reload 的 Request（會從 HTTP 快取搬到舊檔）');
    check(putKeys.length === want.length, '抓到的檔沒有全部寫進 cache（' + putKeys.length + '/' + want.length + '）');
    check(skipped, '全部到齊後沒有 skipWaiting');
    // 缺一筆：install 必須失敗、不能 skipWaiting
    skipped = false; fetched.length = 0; putKeys.length = 0;
    failUrl = PRECACHE_LIST[PRECACHE_LIST.length - 1];
    return runInstall().then(
      () => check(false, '有一筆 404 時 install 卻成功了（會裝上半殘快取）'),
      () => check(!skipped, '有一筆 404 時仍然 skipWaiting 了')
    ).then(() => { failUrl = null; });
  });
}

// ---------- 測試 1：activate 的版本汰舊 ----------

function testActivate() {
  let waited = null;
  listeners.activate({ waitUntil: (p) => { waited = p; } });
  return Promise.resolve(waited).then(() => {
    check(deleted.includes('kids-v0'), 'activate 沒有刪掉舊版 cache kids-v0');
    check(!deleted.includes(CURRENT_CACHE), 'activate 誤刪了本版 cache ' + CURRENT_CACHE);
    check(!deleted.includes('other-cache'), 'activate 刪到了不屬於本站的 cache other-cache');
    check(claimed, 'activate 沒有呼叫 clients.claim()');
  });
}

// ---------- 測試 2：Range 切片 ----------

function testRange() {
  const req = new Request('https://example.test/assets/music/childrens-march.mp3', {
    headers: { Range: 'bytes=0-99' }
  });
  let responded = null;
  listeners.fetch({ request: req, respondWith: (p) => { responded = p; } });
  check(responded !== null, 'fetch handler 沒有接手帶 Range 的同源 GET');
  return Promise.resolve(responded).then((res) => {
    check(res.status === 206, '帶 Range 的請求應回 206，實際回 ' + res.status);
    check(res.headers.get('Content-Range') === 'bytes 0-99/200',
      'Content-Range 應為 bytes 0-99/200，實際為 ' + res.headers.get('Content-Range'));
    check(res.headers.get('Accept-Ranges') === 'bytes', '缺少 Accept-Ranges: bytes');
    check(res.headers.get('Content-Length') === '100',
      'Content-Length 應為 100，實際為 ' + res.headers.get('Content-Length'));
    return res.arrayBuffer().then((buf) => {
      check(buf.byteLength === 100, 'body 應為 100 bytes，實際為 ' + buf.byteLength);
      const view = new Uint8Array(buf);
      check(view[0] === 0 && view[99] === 99, 'body 內容不是原檔的前 100 bytes');
    });
  });
}

// ---------- 測試 3：非同源／非 GET 不插手 ----------

function testPassThrough() {
  let responded = false;
  listeners.fetch({
    request: new Request('https://other.test/x.png'),
    respondWith: () => { responded = true; }
  });
  check(!responded, '跨網域請求不應該被 service worker 接手');

  responded = false;
  listeners.fetch({
    request: new Request('https://example.test/x', { method: 'POST' }),
    respondWith: () => { responded = true; }
  });
  check(!responded, 'POST 請求不應該被 service worker 接手');
  return Promise.resolve();
}

testInstall().then(testActivate).then(testRange).then(testPassThrough).then(() => {
  if (failures.length) {
    console.error('sw.js 單元驗證失敗，共 ' + failures.length + ' 項：');
    failures.forEach((f, i) => console.error('  ' + (i + 1) + '. ' + f));
    process.exit(1);
  }
  console.log('sw.js 單元驗證通過：install 可續傳且全部 cache:reload、缺一筆不啟用、版本汰舊只刪 kids-v0、Range bytes=0-99 回 206 且 body 100 bytes、跨網域與 POST 皆不插手。');
});
