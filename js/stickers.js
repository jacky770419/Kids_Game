/* 貼紙場景：選一個地方，從右邊盒子把貼紙點一下（或拖）到板面上，可再拖動、
   點一下換大小、拖回盒子收掉；綠色勾勾＝貼好了，合成一張圖收進「我的作品」並跳完成畫面。

   設計上的幾個硬規則（跟其他頁一致，不要改）：
   - 沒有計時、沒有分數、沒有失敗判定，也沒有確認對話框（五歲小孩不會讀確認文字）。
     唯一「做錯很糟」的是全部清掉，所以它是一顆要按住的小垃圾桶（UI.hold）。
   - 畫面下緣不放可以按的東西：抱著平板時手腕會壓在下緣。貼紙都在右邊的盒子裡，
     盒子最下面是 [上一步][綠色完成]；直向也一樣，盒子不搬到下緣。
   - 畫面上沒有 emoji、沒有國字：按鈕是線條圖示（js/ui.js），分類頁籤是那一類的代表貼紙。
   - 位置存 0..1 的比例座標而不是像素：直向／橫向／換裝置都要還原到同一個地方。
   - 出聲一定在使用者手勢的事件處理函式裡呼叫（iOS 規定），所以 Speech.say
     只出現在 pointerup 與 click 裡，不放進 setTimeout 或 Promise 的回呼。 */
(() => {
  'use strict';

  const Data = window.StickersData;
  const St = window.StickersState;

  const selectScreen = document.getElementById('selectScreen');
  const gameScreen = document.getElementById('gameScreen');
  const bgGrid = document.getElementById('bgGrid');
  const board = document.getElementById('board');
  const boardBg = document.getElementById('boardBg');
  const layer = document.getElementById('stickerLayer');
  const tray = document.getElementById('tray');
  const catTabs = document.getElementById('catTabs');
  const trayScroll = document.getElementById('trayScroll');
  const ghost = document.getElementById('ghost');

  const backBtn = document.getElementById('backBtn');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const doneBtn = document.getElementById('doneBtn');
  const doneOverlay = document.getElementById('doneOverlay');
  const donePic = document.getElementById('donePic');
  const keepBtn = document.getElementById('keepBtn');

  const ARTWORK_MAX = 60;          // 跟著色頁同一個上限，兩頁共用同一個 store
  const TAP_SLOP = 8;              // 位移小於這個距離就算「點一下」而不是拖曳
  const CLEAR_HOLD_MS = 1000;      // 全部清掉要按住這麼久
  const VALID_IDS = new Set(Data.STICKERS.map((s) => s.id));

  let bg = null;                   // 目前的背景（Data.BACKGROUNDS 的一筆）
  let placed = [];                 // [{id, x, y, size, el}]，順序＝貼上的先後（上一步從尾巴收）
  let currentCat = Data.CATEGORIES[0].id;
  let finishing = false;           // 正在合成完成圖：這段時間綠色勾勾不再收第二下
  let restored = Promise.resolve();   // 上次的貼紙還原完了沒（合成完成圖要等它，不然會少貼紙）

  /* 這一頁自己用的圖示：一張掀起一角的貼紙（完成畫面的「繼續貼這張」）。
     ui.js 載入時就把 data-ic 換完了，那時這個圖示還不存在，所以按鈕內容在這裡自己填。 */
  if (window.UI) {
    UI.icons.sticker = '<path d="M14 20.5H6.5a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3V14z"/>' +
      '<path d="M20.5 14H17a3 3 0 0 0-3 3v3.5"/>';
    keepBtn.innerHTML = UI.icon('sticker');
  }

  /* 小熊泡泡的台詞（注音寫法見 js/ui.js）。 */
  const guideEl = document.getElementById('guide');
  const guide = (guideEl && guideEl.__uiGuide) || { set() {} };
  const LINE_PICK = '選ㄒㄩㄢˇ 一ㄧˊ 個˙ㄍㄜ 地ㄉㄧˋ 方ㄈㄤ';
  const LINE_PLAY = '貼ㄊㄧㄝ 貼ㄊㄧㄝ 紙ㄓˇ';
  let playLineSaid = false;

  /* ===== 進度存檔 =====
     key 用 's:' 前綴，跟著色頁的 'v:'／'r:' 不會撞。
     貼紙資料很小（十幾筆座標），每次變動就存一次，不做 debounce——
     小孩隨時會直接把 App 滑掉，晚存就是沒存到。
     ⚠ updatedAt 一定要寫：著色頁的 trimProgress 在 progress 超過 40 筆時
     會照 updatedAt 排序刪最舊的，沒有這個欄位就會被當成最舊的先刪。 */
  function progressKey() { return 's:' + (bg ? bg.id : ''); }

  function save() {
    refreshTools();
    if (!bg || !window.KidsStore) return;
    KidsStore.put('progress', {
      key: progressKey(),
      updatedAt: Date.now(),
      stickers: St.serialize(placed)
    });
  }

  /* 沒東西可以收的時候，上一步和垃圾桶變成灰的、平的（還不能按） */
  function refreshTools() {
    const empty = placed.length === 0;
    undoBtn.disabled = empty;
    clearBtn.classList.toggle('off', empty);
  }

  /* ===== 選場景畫面 =====
     每張卡片就是那個場景，上面直接疊著「上次貼到一半的樣子」——
     她不用讀字就知道哪一張貼過、貼了什麼（比例座標，縮成卡片大小位置也對）。 */
  const thumbLayers = new Map();   // 背景 id → 卡片上那層小貼紙

  function buildSelect() {
    bgGrid.innerHTML = '';
    Data.BACKGROUNDS.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pic-thumb';
      btn.setAttribute('aria-label', b.name);
      const scene = document.createElement('span');
      scene.className = 'scene';
      const img = document.createElement('img');
      img.className = 'scene-bg';
      img.src = b.src;
      img.alt = '';
      img.draggable = false;
      const minis = document.createElement('span');
      minis.className = 'scene-minis';
      scene.appendChild(img);
      scene.appendChild(minis);
      btn.appendChild(scene);
      btn.addEventListener('click', () => { Sound.click(); openBackground(b); });
      bgGrid.appendChild(btn);
      thumbLayers.set(b.id, minis);

      if (window.KidsStore) {
        KidsStore.get('progress', 's:' + b.id).then((rec) => {
          if (rec) paintThumb(b.id, St.deserialize(rec.stickers, VALID_IDS));
        });
      }
    });
  }

  function paintThumb(bgId, list) {
    const host = thumbLayers.get(bgId);
    if (!host) return;
    host.innerHTML = '';
    list.forEach((s) => {
      const def = Data.byId(s.id);
      if (!def) return;
      const im = document.createElement('img');
      im.className = 'mini';
      im.src = def.src;
      im.alt = '';
      im.draggable = false;
      im.style.width = (St.SIZES[St.isSize(s.size) ? s.size : St.DEFAULT_SIZE] * 100) + '%';
      im.style.left = (s.x * 100) + '%';
      im.style.top = (s.y * 100) + '%';
      host.appendChild(im);
    });
  }

  function showSelect() {
    if (bg) paintThumb(bg.id, placed);   // 卡片跟著剛剛貼的樣子更新
    selectScreen.hidden = false;
    gameScreen.hidden = true;
    doneOverlay.hidden = true;
    backBtn.hidden = true;
    clearBtn.hidden = true;
    document.body.classList.remove('playing');
    guide.set(LINE_PICK);
    if (window.Speech) Speech.cancel();
  }

  function openBackground(b) {
    bg = b;
    boardBg.src = b.src;
    boardBg.alt = b.name;
    placed = [];
    layer.innerHTML = '';
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    backBtn.hidden = false;
    clearBtn.hidden = false;
    document.body.classList.add('playing');   // 版面換成「左邊板面、右邊盒子」（css/stickers.css）
    // 第一次進來小熊唸一次（這一下是她點卡片的手勢，iPad 才准出聲）；之後想聽再點泡泡
    guide.set(LINE_PLAY, !playLineSaid);
    playLineSaid = true;
    buildTray();
    refreshTools();

    // 還原上次貼到一半的畫面。存檔壞掉／IndexedDB 開不起來就當作空白，不擋畫面。
    restored = Promise.resolve();
    if (window.KidsStore) {
      restored = KidsStore.get('progress', progressKey()).then((rec) => {
        if (!rec || bg !== b) return;   // 讀回來時使用者可能已經換背景了
        St.deserialize(rec.stickers, VALID_IDS).forEach((s) => addSticker(s.id, s.x, s.y, s.size, false));
        refreshTools();
      });
    }
  }

  /* ===== 右邊的盒子：分類＋貼紙 ===== */
  function buildTray() {
    catTabs.innerHTML = '';
    Data.CATEGORIES.forEach((c) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'btn sm cat' + (c.id === currentCat ? ' sel' : '');
      t.dataset.cat = c.id;
      t.setAttribute('aria-label', c.name);
      const rep = Data.byId(c.rep);
      if (rep) {
        const im = document.createElement('img');
        im.src = rep.src;
        im.alt = '';
        im.draggable = false;
        t.appendChild(im);
      }
      t.addEventListener('click', () => {
        Sound.click();
        currentCat = c.id;
        catTabs.querySelectorAll('.cat').forEach((x) => x.classList.toggle('sel', x.dataset.cat === c.id));
        buildTrayItems();
      });
      catTabs.appendChild(t);
    });
    buildTrayItems();
  }

  function buildTrayItems() {
    trayScroll.innerHTML = '';
    trayScroll.scrollTop = 0;
    Data.STICKERS.filter((s) => s.cat === currentCat).forEach((s) => {
      const cell = document.createElement('div');
      cell.className = 'tray-item';
      cell.dataset.id = s.id;
      const img = document.createElement('img');
      img.src = s.src;
      img.alt = s.word;
      img.draggable = false;
      cell.appendChild(img);
      cell.addEventListener('pointerdown', (e) => startFromTray(e, s));
      trayScroll.appendChild(cell);
    });
  }

  /* ===== 建立一張貼在板上的貼紙 ===== */
  function addSticker(id, x, y, size, persist) {
    const def = Data.byId(id);
    if (!def) return null;
    const item = { id: id, x: St.clamp01(x), y: St.clamp01(y), size: St.isSize(size) ? size : St.DEFAULT_SIZE };
    const el = document.createElement('img');
    el.className = 'sticker';
    el.src = def.src;
    el.alt = def.word;
    el.draggable = false;
    item.el = el;
    applyStyle(item);
    el.addEventListener('pointerdown', (e) => startDrag(e, item));
    layer.appendChild(el);
    placed.push(item);
    if (persist !== false) save();
    return item;
  }

  function applyStyle(item) {
    item.el.style.width = (St.SIZES[item.size] * 100) + '%';
    item.el.style.left = (item.x * 100) + '%';
    item.el.style.top = (item.y * 100) + '%';
  }

  function speakFor(id) {
    const def = Data.byId(id);
    if (def && window.Speech) Speech.say(def.say || def.word);
  }

  function removeSticker(item) {
    const i = placed.indexOf(item);
    if (i >= 0) placed.splice(i, 1);
    if (item.el && item.el.parentNode) item.el.parentNode.removeChild(item.el);
  }

  /* 點一下貼紙格＝貼到板面中間附近。位置帶一點亂數：連點好幾張才不會全部疊在同一點、
     看起來像只貼了一張。貼上去之後她可以再拖到想要的地方。 */
  function placeFromTap(def) {
    const x = 0.28 + Math.random() * 0.44;
    const y = 0.36 + Math.random() * 0.34;
    const item = addSticker(def.id, x, y, St.DEFAULT_SIZE, true);
    if (item) popIn(item.el);
  }

  function popIn(el) {
    el.classList.add('pop');
    el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });
  }

  /* ===== 從盒子拿貼紙：點一下、或拖出來 ===== */
  function startFromTray(e, def) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const cell = e.currentTarget;
    try { cell.setPointerCapture(e.pointerId); } catch (err) { /* 舊瀏覽器沒有就算了 */ }
    cell.classList.add('pressed');

    // 跟手的浮動影像：尺寸用「板面上的預設大小」，拖到一半就看得出貼上去會多大
    const size = board.getBoundingClientRect().width * St.SIZES[St.DEFAULT_SIZE];
    ghost.src = def.src;
    ghost.style.width = size + 'px';

    /* 上下滑＝捲盒子、往旁邊拖＝拖貼紙，方向由這裡自己判斷。
       不能交給 CSS touch-action: pan-y：桌機 Chrome 會照做，但 iPad Safari 一律當成捲動、
       往左拖也送 pointercancel，貼紙就拉不出來（2026-11-06 實機）。所以格子維持 touch-action: none，
       手指先動滿 LOCK_PX 再看方向：垂直分量明顯較大就自己改 scrollTop（放手時帶一點慣性），否則開始拖。 */
    const LOCK_PX = 8;
    const x0 = e.clientX, y0 = e.clientY;
    const st0 = trayScroll.scrollTop;
    let mode = '';            // '' 還沒決定（＝點一下）、'scroll'、'drag'
    let lastY = y0, lastT = performance.now(), vel = 0;
    const move = (ev) => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!mode) {
        if (Math.abs(dx) + Math.abs(dy) < LOCK_PX) return;
        mode = Math.abs(dy) > Math.abs(dx) * 1.2 ? 'scroll' : 'drag';
        cell.classList.remove('pressed');
      }
      if (mode === 'scroll') {
        trayScroll.scrollTop = st0 - dy;
        const now = performance.now();
        if (now > lastT) vel = (ev.clientY - lastY) / (now - lastT);   // px/ms，往下為正
        lastY = ev.clientY; lastT = now;
        return;
      }
      ghost.hidden = false;
      moveGhost(ev.clientX, ev.clientY);
    };
    const up = (ev) => {
      cell.removeEventListener('pointermove', move);
      cell.removeEventListener('pointerup', up);
      cell.removeEventListener('pointercancel', up);
      cell.classList.remove('pressed');
      ghost.hidden = true;
      if (mode === 'scroll') {
        if (ev.type === 'pointerup' && performance.now() - lastT < 80) glide(vel);
        return;
      }
      if (ev.type === 'pointercancel') return;   // 被系統取消：什麼都不發生
      if (mode === '') {
        // 手指沒怎麼動就放開＝點一下：直接貼到板面上
        placeFromTap(def);
        Sound.pop();
        speakFor(def.id);
        return;
      }
      const r = board.getBoundingClientRect();
      const inBoard = ev.clientX >= r.left && ev.clientX <= r.right
        && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (!inBoard) return;   // 放在板子外＝取消，什麼都不發生（沒有錯誤提示）
      addSticker(def.id, (ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height, St.DEFAULT_SIZE, true);
      Sound.pop();
      speakFor(def.id);
    };
    cell.addEventListener('pointermove', move);
    cell.addEventListener('pointerup', up);
    cell.addEventListener('pointercancel', up);
  }

  /* 自己捲的盒子放手後滑一小段：速度每幀乘 0.94 遞減，太慢就停。手指再按下去會被新的 scrollTop 覆蓋，不用特別取消 */
  function glide(v) {
    let speed = v * 16;   // px/幀
    const step = () => {
      if (Math.abs(speed) < 0.5) return;
      const before = trayScroll.scrollTop;
      trayScroll.scrollTop = before - speed;
      if (trayScroll.scrollTop === before) return;   // 到頂或到底了
      speed *= 0.94;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function moveGhost(cx, cy) {
    ghost.style.left = cx + 'px';
    ghost.style.top = cy + 'px';
  }

  /* ===== 拖動板上的貼紙 ===== */
  function startDrag(e, item) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const el = item.el;
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* 略過 */ }
    el.classList.add('dragging');

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = 0;

    /* 「拖回盒子＝收掉」看的是手指的位置，不是貼紙的中心：
       貼紙的座標被夾在板面裡（clamp01），中心永遠到不了盒子，
       用中心判定的話這個手勢一次都不會成立。 */
    const overTray = (ev) => St.hitTray({ x: ev.clientX, y: ev.clientY }, tray.getBoundingClientRect());

    const move = (ev) => {
      const r = board.getBoundingClientRect();
      moved = Math.max(moved, Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY));
      item.x = St.clamp01((ev.clientX - r.left) / r.width);
      item.y = St.clamp01((ev.clientY - r.top) / r.height);
      applyStyle(item);
      // 手指進到盒子上：盒子亮一圈、貼紙變淡，告訴她「放手就收回去」
      const leaving = moved >= TAP_SLOP && overTray(ev);
      tray.classList.toggle('drop', leaving);
      el.classList.toggle('leaving', leaving);
    };

    const up = (ev) => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.classList.remove('dragging', 'leaving');
      tray.classList.remove('drop');

      if (moved < TAP_SLOP) {
        // 點一下＝換尺寸，並再唸一次英文
        item.size = St.cycleSize(item.size);
        applyStyle(item);
        Sound.click();
        speakFor(item.id);
        save();
        return;
      }

      // 在盒子上放手＝收回去（刪掉）
      if (ev.type === 'pointerup' && overTray(ev)) {
        removeSticker(item);
        Sound.click();
      }
      save();
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  /* ===== 工具 ===== */
  backBtn.addEventListener('click', () => { Sound.click(); showSelect(); });

  undoBtn.addEventListener('click', () => {
    Sound.click();
    if (!placed.length) return;
    removeSticker(placed[placed.length - 1]);
    save();
  });

  /* 全部清掉：不問「真的要刪嗎」（她讀不懂確認文字），改成要按住一秒——
     手掌掃到不會整張不見，真的想清掉的時候看著外圈轉滿就好。 */
  function clearAll() {
    if (!placed.length) return;
    Sound.click();
    placed = [];
    layer.innerHTML = '';
    save();
  }
  if (window.UI) UI.hold(clearBtn, CLEAR_HOLD_MS, clearAll);
  else clearBtn.addEventListener('click', clearAll);

  /* ===== 合成 PNG =====
     ⚠ iPad Safari 的 canvas.drawImage 對「沒有 width/height 屬性的 SVG」
     常常畫出空白（它拿不到內在尺寸就當成 0×0）。所以不直接 img.src = 'x.svg'，
     而是先把 SVG 文字抓下來、在根標籤補上 width/height（＝viewBox 的尺寸），
     再包成 blob URL 給 Image。畫完一定要 revoke，否則每存一次就漏一份記憶體。 */
  function loadSvgForCanvas(url) {
    // PNG 貼紙本來就有內在尺寸，直接載入
    if (!/\.svg$/i.test(url)) return loadImage(url).then((img) => ({ img: img, revoke: () => {} }));
    return fetch(url).then((r) => r.text()).then((text) => {
      const vb = text.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([-\d.]+)[\s,]+([-\d.]+)\s*["']/);
      const w = vb ? vb[1] : '400';
      const h = vb ? vb[2] : '400';
      let out = text;
      if (!/<svg[^>]*\swidth=/.test(out)) out = out.replace(/<svg\b/, '<svg width="' + w + '" height="' + h + '"');
      const blobUrl = URL.createObjectURL(new Blob([out], { type: 'image/svg+xml' }));
      return loadImage(blobUrl).then((img) => ({ img: img, revoke: () => URL.revokeObjectURL(blobUrl) }));
    }).catch(() =>
      // fetch 失敗（例如某些瀏覽器的 file:// 限制）就退回直接載入，
      // 大部分平台照樣畫得出來，畫不出來也只是少一張圖，不能讓存圖整個爆掉
      loadImage(url).then((img) => ({ img: img, revoke: () => {} }))
    );
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('載入失敗：' + src));
      im.src = src;
    });
  }

  const OUT_W = 1600;
  const OUT_H = 1200;

  function compose() {
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const g = canvas.getContext('2d');
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, OUT_W, OUT_H);

    // 貼紙照 placed 的順序畫，跟畫面上的疊法一致
    const jobs = [bg.src].concat(placed.map((s) => Data.byId(s.id).src));
    return Promise.all(jobs.map(loadSvgForCanvas)).then((loaded) => {
      try {
        g.drawImage(loaded[0].img, 0, 0, OUT_W, OUT_H);
        placed.forEach((s, i) => {
          const im = loaded[i + 1].img;
          const w = St.SIZES[s.size] * OUT_W;
          const ratio = im.naturalHeight && im.naturalWidth ? im.naturalHeight / im.naturalWidth : 1;
          const h = w * ratio;
          g.drawImage(im, s.x * OUT_W - w / 2, s.y * OUT_H - h / 2, w, h);
        });
      } finally {
        loaded.forEach((l) => l.revoke());
      }
      return canvas.toDataURL('image/png');
    });
  }

  /* 收一張完成的作品。記錄形狀必須跟著色頁一模一樣（js/coloring.js 的 addArtwork），
     著色頁的「我的作品」列會直接讀到這裡存的東西，多一個欄位或少一個都會出問題。 */
  function addArtwork(dataUrl) {
    if (!window.KidsStore) return Promise.resolve();
    const name = (bg ? bg.name : '貼紙') + '貼紙';
    return KidsStore.estimate().then((est) => {
      if (!est || !est.quota || !(est.usage / est.quota > 0.8)) return;
      const keep = Math.max(1, ARTWORK_MAX - 5);
      return KidsStore.all('artworks').then((list) => Promise.all(
        sortArtworks(list).slice(keep).map((a) => KidsStore.del('artworks', a.id))
      ));
    }).then(() => KidsStore.put('artworks', {
      name: name, png: dataUrl, w: OUT_W, h: OUT_H, createdAt: Date.now()
    })).then(() => KidsStore.all('artworks')).then((list) => {
      sortArtworks(list).slice(ARTWORK_MAX).forEach((a) => KidsStore.del('artworks', a.id));
    });
  }

  function sortArtworks(list) {
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || (b.id || 0) - (a.id || 0));
  }

  /* ===== 綠色勾勾：貼好了 =====
     把板面合成一張圖→收進「我的作品」→完成畫面的主角就是這張圖。
     合成失敗（圖載不到、canvas 被擋）也照樣給完成畫面，主角退回場景本身——
     她按了「貼好了」就該看到「好棒」，不能因為存不了就沒反應。 */
  function showDone(src) {
    donePic.src = src;
    doneOverlay.hidden = false;
    backBtn.hidden = true;      // 完成畫面左上只留回家；「繼續貼／換一個地方」是下面那兩顆
    Sound.win();
    launchConfetti();
  }

  doneBtn.addEventListener('click', () => {
    Sound.click();
    if (!bg || finishing) return;
    finishing = true;
    const scene = bg;
    restored.then(compose).then((dataUrl) => {
      if (bg !== scene || gameScreen.hidden) return;   // 合成到一半她已經離開這張了
      showDone(dataUrl);
      return addArtwork(dataUrl);
    }, () => {
      if (bg === scene && !gameScreen.hidden) showDone(scene.src);
    }).catch(() => { /* 收作品失敗不吵她 */ }).then(() => { finishing = false; });
  });

  keepBtn.addEventListener('click', () => {
    Sound.click();
    doneOverlay.hidden = true;
    backBtn.hidden = false;
  });
  document.getElementById('newSceneBtn').addEventListener('click', () => { Sound.click(); showSelect(); });

  /* --- 彩帶（跟拼圖頁同一套：六個房間的顏色＋黃） --- */
  const confetti = document.getElementById('confettiCanvas');
  const cctx = confetti.getContext('2d');

  function launchConfetti() {
    confetti.width = window.innerWidth;
    confetti.height = window.innerHeight;
    const colors = ['#FF5C5C', '#FFD84D', '#22C3B6', '#9A7BF5', '#FFA228', '#4AA8EE', '#FF7FB0'];
    const parts = [];
    for (let i = 0; i < 130; i++) {
      parts.push({
        x: Math.random() * confetti.width,
        y: -20 - Math.random() * confetti.height * 0.5,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        vy: 2 + Math.random() * 3.5,
        vx: (Math.random() - 0.5) * 2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    const start = performance.now();
    function frame(t) {
      cctx.clearRect(0, 0, confetti.width, confetti.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        cctx.save();
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot);
        cctx.fillStyle = p.color;
        cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cctx.restore();
      });
      if (t - start < 3500) requestAnimationFrame(frame);
      else cctx.clearRect(0, 0, confetti.width, confetti.height);
    }
    requestAnimationFrame(frame);
  }

  /* 切到背景／鎖螢幕時再存一次：iOS 常常不會給我們 unload。 */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });

  buildSelect();
  showSelect();
})();
