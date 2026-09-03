/* 小小遊樂園的 service worker——讓整個網站在完全沒網路時照樣能玩。

   為什麼要做到「全部預先快取」而不是隨用隨存：使用者是五歲小孩，
   場合常常是車上、飛機上、長輩家。她不會「先連著網路把每一頁都逛一遍暖快取」，
   所以第一次載入時就要把所有頁面、程式、圖片、音樂一次收好（約 4.5 MB）。
   音樂也在清單裡——離線沒有背景音樂，對她來說就是壞掉了。

   放在 repo 根目錄是必要的：service worker 的 scope 不能超過自己的所在目錄，
   放在根目錄才能同時涵蓋 index / coloring / puzzle / words / stickers 五頁。

   汰舊方式：改動任何被快取的檔案時，把 CACHE_VERSION 往上加一號。
   activate 會刪掉所有 kids- 開頭但版本不符的 cache，不會留下舊檔混用。 */

const CACHE_VERSION = 'v7';
const CACHE_NAME = 'kids-' + CACHE_VERSION;

/* 預先快取清單。每一筆都由 tools/check_precache.js 與實際程式碼雙向對帳，
   少列（離線會缺資產）或多列（列了不存在的檔會讓 install 整個失敗）都會被測出來。 */
const PRECACHE = [
  './',
  'index.html',
  'coloring.html',
  'puzzle.html',
  'words.html',
  'stickers.html',
  'manifest.json',
  'css/style.css',
  // 程式
  'js/coloring.js',
  'js/kiosk.js',
  'js/lineart-animals.js',
  'js/lineart-data.js',
  'js/lineart-fantasy.js',
  'js/lineart-food.js',
  'js/lineart-scenes.js',
  'js/music.js',
  'js/patterns-data.js',
  'js/photo-tool.js',
  'js/undo-rect.js',
  'js/pictures-data.js',
  'js/puzzle-geom.js',
  'js/puzzle.js',
  'js/sound.js',
  'js/speech.js',
  'js/stamps-data.js',
  'js/stickers-data.js',
  'js/stickers-state.js',
  'js/stickers.js',
  'js/storage.js',
  'js/words.js',
  // 字型與圖示
  'assets/fonts/lilita-one-latin.woff2',
  'assets/icon-192.png',
  'assets/icon-512.png',
  // 單字資料
  'assets/data/words.json',
  // 場景線稿（著色）
  'assets/lineart/animal-teaparty.png',
  'assets/lineart/elephant-bird.png',
  'assets/lineart/fruit-basket.png',
  'assets/lineart/icecream-cupcake.png',
  'assets/lineart/panda-bamboo.png',
  'assets/lineart/princess-dog.png',
  'assets/lineart/squirrel-tree.png',
  'assets/lineart/sunflowers.png',
  // 拼圖與單字卡圖片
  'assets/pictures/bear.svg',
  'assets/pictures/castle.svg',
  'assets/pictures/house.svg',
  'assets/pictures/mermaid.svg',
  'assets/pictures/princess-braid.svg',
  'assets/pictures/princess.svg',
  'assets/pictures/rocket.svg',
  'assets/pictures/sea.svg',
  'assets/pictures/animals/bear.svg',
  'assets/pictures/animals/duck.svg',
  'assets/pictures/animals/elephant.svg',
  'assets/pictures/animals/frog.svg',
  'assets/pictures/animals/giraffe.svg',
  'assets/pictures/animals/monkey.svg',
  'assets/pictures/animals/owl.svg',
  'assets/pictures/animals/panda.svg',
  'assets/pictures/animals/penguin.svg',
  'assets/pictures/animals/pig.svg',
  'assets/pictures/animals/rabbit.svg',
  'assets/pictures/animals/whale.svg',
  'assets/pictures/fruits/apple.svg',
  'assets/pictures/fruits/banana.svg',
  'assets/pictures/fruits/grapes.svg',
  'assets/pictures/fruits/pineapple.svg',
  'assets/pictures/fruits/strawberry.svg',
  'assets/pictures/fruits/watermelon.svg',
  // 貼紙場景的背景與貼紙
  'assets/backgrounds/beach.svg',
  'assets/backgrounds/castle.svg',
  'assets/backgrounds/forest.svg',
  'assets/stickers/apple.svg',
  'assets/stickers/banana.svg',
  'assets/stickers/bear.svg',
  'assets/stickers/cake.svg',
  'assets/stickers/cupcake.svg',
  'assets/stickers/donut.svg',
  'assets/stickers/duck.svg',
  'assets/stickers/elephant.svg',
  'assets/stickers/frog.svg',
  'assets/stickers/giraffe.svg',
  'assets/stickers/grapes.svg',
  'assets/stickers/icecream.svg',
  'assets/stickers/mermaid.svg',
  'assets/stickers/monkey.svg',
  'assets/stickers/owl.svg',
  'assets/stickers/panda.svg',
  'assets/stickers/penguin.svg',
  'assets/stickers/pig.svg',
  'assets/stickers/pineapple.svg',
  'assets/stickers/princess-braid.svg',
  'assets/stickers/princess.svg',
  'assets/stickers/rabbit.svg',
  'assets/stickers/rainbow.svg',
  'assets/stickers/strawberry.svg',
  'assets/stickers/unicorn.svg',
  'assets/stickers/watermelon.svg',
  'assets/stickers/whale.svg',
  // 背景音樂
  'assets/music/childrens-march.mp3',
  'assets/music/fluffing-a-duck.mp3',
  'assets/music/monkeys-spinning-monkeys.mp3',
  // 音效
  'assets/sfx/click.m4a',
  'assets/sfx/pop.m4a',
  'assets/sfx/snap.m4a',
  'assets/sfx/win.m4a'
];

/* install：把整份清單抓下來。用 addAll 是刻意的——只要有一筆失敗，
   整個 install 就失敗、這版 SW 不會啟用。寧可維持舊版（或完全沒有離線能力），
   也不要裝上一個「半殘」的快取，讓小孩在飛機上點開才發現某張圖是破的。
   每筆都用 cache:'reload' 抓：addAll 預設會走瀏覽器的 HTTP 快取，升版時
   會把「上一版」的檔案原封不動搬進新 cache（2026-09-03 實測踩到：
   kids-v2 裡的 words.js 是舊的 13648 bytes，伺服器上已經是 18332 bytes）。 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

/* activate：刪掉所有 kids- 開頭但版本不符的舊 cache，避免舊資產愈積愈多，
   然後 clients.claim() 讓已經開著的分頁立刻換由新版 SW 接管。 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((n) => n.startsWith('kids-') && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* 從一份完整的快取回應切出 Range 要求的片段。
   為什麼一定要做：iOS Safari 的 <audio> 播媒體時會帶 Range 標頭，
   如果直接把整包 200 回給它，Safari 會拒播或播到一半停掉——
   背景音樂就這樣悄悄壞掉。這裡自己切 bytes 並回 206。 */
function rangeResponse(cached, rangeHeader) {
  return cached.arrayBuffer().then((buf) => {
    const total = buf.byteLength;
    const m = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHeader).trim());
    if (!m) return cached;

    let start, end;
    if (m[1] === '') {
      // 「bytes=-500」＝最後 500 bytes
      const suffix = parseInt(m[2], 10);
      if (!isFinite(suffix) || suffix <= 0) return cached;
      start = Math.max(0, total - suffix);
      end = total - 1;
    } else {
      start = parseInt(m[1], 10);
      end = m[2] === '' ? total - 1 : parseInt(m[2], 10);
    }
    if (!isFinite(start) || start >= total || start < 0) {
      // 範圍越界，照規範回 416
      return new Response(null, {
        status: 416,
        statusText: 'Range Not Satisfiable',
        headers: { 'Content-Range': 'bytes */' + total }
      });
    }
    if (!isFinite(end) || end >= total) end = total - 1;

    const slice = buf.slice(start, end + 1);
    const headers = new Headers();
    const type = cached.headers.get('Content-Type');
    if (type) headers.set('Content-Type', type);
    headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + total);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', String(slice.byteLength));
    return new Response(slice, { status: 206, statusText: 'Partial Content', headers });
  });
}

/* fetch：cache-first。
   只管同源的 GET——外部請求與 POST 一律不插手，直接讓瀏覽器自己處理。
   ignoreSearch: true 是因為圖片／音檔有時會被加上快取破壞用的 query，
   忽略 query 才能命中同一份檔案。 */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true, cacheName: CACHE_NAME }).then((cached) => {
      if (cached) {
        const range = req.headers.get('range');
        return range ? rangeResponse(cached.clone(), range) : cached;
      }

      return fetch(req).then((res) => {
        // 只把成功的同源基本回應寫回快取；opaque／錯誤回應存了只會毒化快取
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        /* 離線且沒命中。若是換頁（navigation），退回對應的 HTML；
           連那頁都沒有就退回首頁，至少不會看到瀏覽器的恐龍錯誤頁。 */
        if (req.mode === 'navigate') {
          const page = url.pathname.split('/').pop() || 'index.html';
          return caches.match(page, { cacheName: CACHE_NAME })
            .then((hit) => hit || caches.match('index.html', { cacheName: CACHE_NAME }))
            .then((hit) => hit || Response.error());
        }
        return Response.error();
      });
    })
  );
});
