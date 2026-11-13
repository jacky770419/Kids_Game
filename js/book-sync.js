/* 新書背景下載：把 js/story-books.js 書單裡每本書的檔（分鏡、文字、音檔、圖）抓進 kids-books 快取。

   為什麼不跟其他東西一起放進 sw.js 的預先快取：
     - 預先快取是「全有全無、跟著版號整包重抓」。41 本全上架會有一百多 MB，
       每次改一個小地方 iPad 就要整包重抓，平板又常常抓不完（見 sw.js 的說明）。
     - kids-books 不跟版號走：每個檔記著書單上的雜湊（回應標頭 x-book-hash），
       改版時只重抓雜湊變了的檔；書單上沒有的檔順手刪掉。

   每一頁都載入這支：她在哪一頁玩都會在背景慢慢抓，不用停在故事頁。
   先抓所有書的封面（選書頁才不會開天窗），再照書單順序一本一本抓整本。
   同時 4 個檔一起抓；抓到一半關掉 App 沒關係，下次打開只補缺的。
   抓的時候帶 x-book-sync 標頭，sw.js 看到就不攔，直接走網路（不然會拿到快取裡的舊檔）。

   對外：window.BookSync.isReady(id)  這本整本都在快取裡了（離線也能看）
         window 事件 'book-sync'       detail = { ready: 已下載好的本數, total: 本數 }，每好一本發一次 */
(() => {
  'use strict';
  const CACHE = 'kids-books';
  const HASH = 'x-book-hash';
  const WORKERS = 4;
  const ready = new Set();
  window.BookSync = { isReady: (id) => ready.has(id) };

  function books() {
    if (window.STORY_BOOKS) return Promise.resolve(window.STORY_BOOKS);
    // 故事頁本來就載入書單；其他頁在這裡補叫一次
    return new Promise((resolve) => {
      const el = document.createElement('script');
      el.src = 'js/story-books.js';
      el.onload = () => resolve(window.STORY_BOOKS || []);
      el.onerror = () => resolve([]);
      document.head.appendChild(el);
    });
  }

  const abs = (p) => new URL(p, location.href).href;

  function emit(list) {
    window.dispatchEvent(new CustomEvent('book-sync', { detail: { ready: ready.size, total: list.length } }));
  }

  function getOne(cache, path, hash) {
    return fetch(path, { cache: 'reload', headers: { 'x-book-sync': '1' } }).then((res) => {
      if (!res.ok) throw new Error(path + ' ' + res.status);
      const type = res.headers.get('Content-Type') || '';
      return res.blob().then((blob) => cache.put(abs(path), new Response(blob, {
        headers: { 'Content-Type': type, [HASH]: hash }
      })));
    });
  }

  // 一批檔，4 個一起抓；有一個失敗就整批算失敗（下次再補）
  function getAll(cache, todo) {
    let next = 0;
    let failed = null;
    const worker = () => {
      if (failed || next >= todo.length) return Promise.resolve();
      const [path, hash] = todo[next++];
      return getOne(cache, path, hash).then(worker, (e) => { failed = e; });
    };
    const ws = [];
    for (let i = 0; i < WORKERS; i++) ws.push(worker());
    return Promise.all(ws).then(() => { if (failed) throw failed; });
  }

  let running = false;
  function run() {
    if (running || !window.caches) return;
    running = true;
    let list = [];
    let cache = null;
    const have = new Map();   // 網址 → 快取裡那份的雜湊
    books().then((l) => {
      list = l;
      return caches.open(CACHE);
    }).then((c) => {
      cache = c;
      return cache.keys();
    }).then((reqs) => Promise.all(reqs.map((r) => cache.match(r).then((res) => [r, res]))))
      .then((pairs) => {
        const want = new Map();
        list.forEach((b) => b.files.forEach(([p, h]) => want.set(abs(p), h)));
        const drops = [];
        pairs.forEach(([req, res]) => {
          if (!want.has(req.url)) drops.push(cache.delete(req));          // 下架或改名的檔
          else have.set(req.url, res && res.headers.get(HASH));
        });
        const missing = (files) => files.filter(([p, h]) => have.get(abs(p)) !== h);
        list.forEach((b) => { if (!missing(b.files).length) ready.add(b.id); });
        emit(list);
        if (navigator.onLine === false) return Promise.all(drops);
        // 先封面，再一本一本
        const covers = [];
        list.forEach((b) => b.files.forEach((f) => { if (f[0] === b.cover.bg || f[0] === b.cover.hero) covers.push(f); }));
        let chain = Promise.all(drops).then(() => getAll(cache, missing(covers)))
          .then(() => covers.forEach(([p, h]) => have.set(abs(p), h)));
        list.forEach((b) => {
          if (ready.has(b.id)) return;
          chain = chain.then(() => getAll(cache, missing(b.files))).then(() => {
            b.files.forEach(([p, h]) => have.set(abs(p), h));
            ready.add(b.id);
            emit(list);
          });
        });
        return chain;
      })
      .catch(() => { /* 斷網或空間不夠：下次打開、或網路回來時再補 */ })
      .then(() => { running = false; });
  }

  // 等頁面自己的東西先載完再開始搶頻寬
  if (document.readyState === 'complete') setTimeout(run, 1500);
  else window.addEventListener('load', () => setTimeout(run, 1500));
  window.addEventListener('online', run);
})();
