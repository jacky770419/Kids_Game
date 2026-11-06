/* 小小遊樂園的 service worker——讓整個網站在完全沒網路時照樣能玩。

   為什麼要做到「全部預先快取」而不是隨用隨存：使用者是五歲小孩，
   場合常常是車上、飛機上、長輩家。她不會「先連著網路把每一頁都逛一遍暖快取」，
   所以第一次載入時就要把所有頁面、程式、圖片、音樂一次收好（約 4.5 MB）。
   音樂也在清單裡——離線沒有背景音樂，對她來說就是壞掉了。

   放在 repo 根目錄是必要的：service worker 的 scope 不能超過自己的所在目錄，
   放在根目錄才能同時涵蓋 index / coloring / puzzle / words / stickers / cake 六頁。

   汰舊方式：改動任何被快取的檔案時，把 CACHE_VERSION 往上加一號。
   activate 會刪掉所有 kids- 開頭但版本不符的 cache，不會留下舊檔混用。 */

const CACHE_VERSION = 'v18';
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
  'cake.html',
  'manifest.json',
  'css/style.css',
  // 程式
  'js/cake-data.js',
  'js/cake-draw.js',
  'js/cake-shapes.js',
  'js/cake-state.js',
  'js/cake-toppings.js',
  'js/cake.js',
  'js/coloring.js',
  'js/kiosk.js',
  'js/lineart-animals.js',
  'js/lineart-data.js',
  'js/lineart-fantasy.js',
  'js/lineart-food.js',
  'js/lineart-vehicles.js',
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
  // 點陣著色線稿：動物 15 隻＋獨角獸、公主與城堡 14 張、場景 8 張
  'assets/lineart/bear.png',
  'assets/lineart/castle-cloud.png',
  'assets/lineart/castle-lollipop.png',
  'assets/lineart/castle-star.png',
  'assets/lineart/crown.png',
  'assets/lineart/little-princess-castle.png',
  'assets/lineart/mermaid.png',
  'assets/lineart/princess-braid.png',
  'assets/lineart/princess-castle.png',
  'assets/lineart/princess-curly.png',
  'assets/lineart/princess-flower.png',
  'assets/lineart/princess-front-castle.png',
  'assets/lineart/princess-puppy.png',
  'assets/lineart/princess-smile.png',
  'assets/lineart/pumpkin-carriage.png',
  'assets/lineart/butterfly.png',
  'assets/lineart/cat.png',
  'assets/lineart/duck.png',
  'assets/lineart/elephant.png',
  'assets/lineart/fish.png',
  'assets/lineart/frog.png',
  'assets/lineart/giraffe.png',
  'assets/lineart/monkey.png',
  'assets/lineart/owl.png',
  'assets/lineart/panda.png',
  'assets/lineart/penguin.png',
  'assets/lineart/pig.png',
  'assets/lineart/rabbit.png',
  'assets/lineart/unicorn.png',
  'assets/lineart/whale.png',
  'assets/lineart/animal-teaparty.png',
  'assets/lineart/elephant-bird.png',
  'assets/lineart/fruit-basket.png',
  'assets/lineart/icecream-cupcake.png',
  'assets/lineart/panda-bamboo.png',
  'assets/lineart/princess-dog.png',
  'assets/lineart/squirrel-tree.png',
  'assets/lineart/sunflowers.png',
  'assets/lineart/ambulance.png',
  'assets/lineart/bus.png',
  'assets/lineart/cement-mixer.png',
  'assets/lineart/dump-truck.png',
  'assets/lineart/excavator.png',
  'assets/lineart/fire-truck.png',
  'assets/lineart/garbage-truck.png',
  'assets/lineart/ice-cream-truck.png',
  'assets/lineart/police-car.png',
  'assets/lineart/race-car.png',
  'assets/lineart/tractor.png',
  'assets/lineart/train.png',
  // 拼圖與單字卡圖片
  'assets/pictures/bear.svg',
  'assets/pictures/castle.png',
  'assets/pictures/house.svg',
  'assets/pictures/mermaid.png',
  'assets/pictures/princess-braid.png',
  'assets/pictures/princess.png',
  'assets/pictures/rocket.svg',
  'assets/pictures/sea.svg',
  'assets/pictures/animals/bear.png',
  'assets/pictures/animals/duck.png',
  'assets/pictures/animals/elephant.png',
  'assets/pictures/animals/frog.png',
  'assets/pictures/animals/giraffe.png',
  'assets/pictures/animals/monkey.png',
  'assets/pictures/animals/owl.png',
  'assets/pictures/animals/panda.png',
  'assets/pictures/animals/penguin.png',
  'assets/pictures/animals/pig.png',
  'assets/pictures/animals/rabbit.png',
  'assets/pictures/animals/whale.png',
  'assets/pictures/fruits/apple.svg',
  'assets/pictures/fruits/banana.svg',
  'assets/pictures/fruits/grapes.svg',
  'assets/pictures/fruits/pineapple.svg',
  'assets/pictures/fruits/strawberry.svg',
  'assets/pictures/fruits/watermelon.svg',
  'assets/pictures/vehicles/ambulance.png',
  'assets/pictures/vehicles/bus.png',
  'assets/pictures/vehicles/cement-mixer.png',
  'assets/pictures/vehicles/dump-truck.png',
  'assets/pictures/vehicles/excavator.png',
  'assets/pictures/vehicles/fire-truck.png',
  'assets/pictures/vehicles/garbage-truck.png',
  'assets/pictures/vehicles/ice-cream-truck.png',
  'assets/pictures/vehicles/police-car.png',
  'assets/pictures/vehicles/race-car.png',
  'assets/pictures/vehicles/tractor.png',
  'assets/pictures/vehicles/train.png',
  // 貼紙場景的背景與貼紙
  'assets/backgrounds/beach.svg',
  'assets/backgrounds/castle.svg',
  'assets/backgrounds/forest.svg',
  'assets/stickers/apple.svg',
  'assets/stickers/banana.svg',
  'assets/stickers/bear.png',
  'assets/stickers/cake.svg',
  'assets/stickers/cupcake.svg',
  'assets/stickers/donut.svg',
  'assets/stickers/duck.png',
  'assets/stickers/elephant.png',
  'assets/stickers/frog.png',
  'assets/stickers/giraffe.png',
  'assets/stickers/grapes.svg',
  'assets/stickers/icecream.svg',
  'assets/stickers/mermaid.png',
  'assets/stickers/monkey.png',
  'assets/stickers/owl.png',
  'assets/stickers/panda.png',
  'assets/stickers/penguin.png',
  'assets/stickers/pig.png',
  'assets/stickers/pineapple.svg',
  'assets/stickers/princess-braid.png',
  'assets/stickers/princess.png',
  'assets/stickers/rabbit.png',
  'assets/stickers/rainbow.svg',
  'assets/stickers/strawberry.svg',
  'assets/stickers/unicorn.png',
  'assets/stickers/watermelon.svg',
  'assets/stickers/whale.png',
  'assets/stickers/ambulance.png',
  'assets/stickers/bus.png',
  'assets/stickers/cement-mixer.png',
  'assets/stickers/dump-truck.png',
  'assets/stickers/excavator.png',
  'assets/stickers/fire-truck.png',
  'assets/stickers/garbage-truck.png',
  'assets/stickers/ice-cream-truck.png',
  'assets/stickers/police-car.png',
  'assets/stickers/race-car.png',
  'assets/stickers/tractor.png',
  'assets/stickers/train.png',
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

/* install：把整份清單抓下來，全部到齊才 skipWaiting 換新版。
   - 每筆都用 cache:'reload' 抓：預設會走瀏覽器的 HTTP 快取，升版時會把「上一版」的檔案
     原封不動搬進新 cache（2026-09-03 實測踩到：kids-v2 裡的 words.js 還是舊檔）。
   - 可續傳：離線包長到約 13 MB，iPad 上要下載一兩分鐘，App 一被切走 install 就被砍；
     以前用 addAll 是「全有全無」，每次重開都從零開始，平板可能永遠換不了新版
     （2026-11-06 車車上線時遇到）。改成逐筆 put，本版 cache 裡已經有的就跳過，
     下次打開只補缺的。同一版號的檔案內容不會變（改檔就升版），所以留下來的半套是可以信任的。
   - 仍然要全部到齊才算 install 成功：缺任何一筆就丟錯、這版 SW 不啟用，
     寧可維持舊版，也不要裝上「半殘」的快取讓小孩離線時點開才發現圖是破的。
   - 每抓完一筆就廣播進度，首頁右下角的版本號會顯示「下載中 N%」。 */
const INSTALL_WORKERS = 4;

function broadcast(msg) {
  if (!self.clients || !self.clients.matchAll) return Promise.resolve();
  return self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then((list) => list.forEach((c) => c.postMessage(msg)))
    .catch(() => {});
}

function precacheAll(cache) {
  return cache.keys().then((reqs) => {
    const have = new Set(reqs.map((r) => new URL(r.url).pathname));
    const todo = PRECACHE.filter((u) => !have.has(new URL(u, self.location.href).pathname));
    const total = PRECACHE.length;
    let done = total - todo.length;
    let next = 0;
    const worker = () => {
      if (next >= todo.length) return Promise.resolve();
      const url = todo[next++];
      return fetch(new Request(url, { cache: 'reload' })).then((res) => {
        if (!res || !res.ok) throw new Error('預快取失敗：' + url + '（' + (res && res.status) + '）');
        return cache.put(url, res);
      }).then(() => {
        done++;
        broadcast({ type: 'sw-progress', version: CACHE_VERSION, done: done, total: total });
        return worker();
      });
    };
    const ws = [];
    for (let i = 0; i < INSTALL_WORKERS; i++) ws.push(worker());
    return Promise.all(ws);
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(precacheAll)
      .then(() => self.skipWaiting())
  );
});

/* 首頁問「你是哪一版」：版本號要顯示「正在用的」SW，不能看 cache 名稱——
   新版一開始下載就會建出空的 kids-vN，看名字會在還沒換好時就以為是新版。 */
self.addEventListener('message', (event) => {
  if (event.data === 'version' && event.ports && event.ports[0]) {
    event.ports[0].postMessage(CACHE_VERSION);
  }
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
