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
const cacheNames = ['kids-v0', 'kids-v1', 'other-cache'];
let claimed = false;

// 一份假的快取回應：200 bytes 的可預期內容
const BODY = Buffer.alloc(200);
for (let i = 0; i < BODY.length; i++) BODY[i] = i % 256;

function makeCachedResponse() {
  return new Response(BODY, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
}

const listeners = {};
const sandbox = {
  console,
  Response, Headers, Request, URL, fetch,
  Promise, Math, parseInt, isFinite, String, Number, Array, Object, JSON,
  setTimeout, clearTimeout,
  caches: {
    open: () => Promise.resolve({ addAll: () => Promise.resolve(), put: () => Promise.resolve() }),
    keys: () => Promise.resolve(cacheNames.slice()),
    delete: (n) => { deleted.push(n); return Promise.resolve(true); },
    match: () => Promise.resolve(makeCachedResponse())
  }
};
sandbox.self = sandbox;
sandbox.location = { origin: 'https://example.test' };
sandbox.addEventListener = (type, fn) => { listeners[type] = fn; };
sandbox.skipWaiting = () => Promise.resolve();
sandbox.clients = { claim: () => { claimed = true; return Promise.resolve(); } };

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), sandbox, { filename: 'sw.js' });

check(typeof listeners.install === 'function', 'sw.js 沒有註冊 install 事件');
check(typeof listeners.activate === 'function', 'sw.js 沒有註冊 activate 事件');
check(typeof listeners.fetch === 'function', 'sw.js 沒有註冊 fetch 事件');

// ---------- 測試 1：activate 的版本汰舊 ----------

function testActivate() {
  let waited = null;
  listeners.activate({ waitUntil: (p) => { waited = p; } });
  return Promise.resolve(waited).then(() => {
    check(deleted.includes('kids-v0'), 'activate 沒有刪掉舊版 cache kids-v0');
    check(!deleted.includes('kids-v1'), 'activate 誤刪了本版 cache kids-v1');
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

testActivate().then(testRange).then(testPassThrough).then(() => {
  if (failures.length) {
    console.error('sw.js 單元驗證失敗，共 ' + failures.length + ' 項：');
    failures.forEach((f, i) => console.error('  ' + (i + 1) + '. ' + f));
    process.exit(1);
  }
  console.log('sw.js 單元驗證通過：版本汰舊只刪 kids-v0、Range bytes=0-99 回 206 且 body 100 bytes、跨網域與 POST 皆不插手。');
});
