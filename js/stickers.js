/* 貼紙場景：選一張背景，從右側匣子把貼紙拖上去，可再拖動、拖回匣子刪掉，
   點一下換大小，📷 存成圖片並收進「我的作品」。

   設計上的幾個硬規則（跟其他頁一致，不要改）：
   - 沒有計時、沒有分數、沒有失敗判定，也沒有確認對話框（五歲小孩不會讀確認文字）。
   - 主要按鈕不放畫面下緣：抱著平板時手腕會壓在下緣。工具全在頂列右側，貼紙匣在右側。
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
  const saveBtn = document.getElementById('saveBtn');
  const saveOverlay = document.getElementById('saveOverlay');
  const saveImg = document.getElementById('saveImg');

  const TOOL_BTNS = [backBtn, undoBtn, clearBtn, saveBtn];

  const ARTWORK_MAX = 24;          // 跟著色頁同一個上限，兩頁共用同一個 store
  const TAP_SLOP = 8;              // 位移小於這個距離就算「點一下」而不是拖曳
  const VALID_IDS = new Set(Data.STICKERS.map((s) => s.id));

  let bg = null;                   // 目前的背景（Data.BACKGROUNDS 的一筆）
  let placed = [];                 // [{id, x, y, size, el}]，順序＝貼上的先後（↩️ 從尾巴收）
  let currentCat = Data.CATEGORIES[0].id;

  /* ===== 進度存檔 =====
     key 用 's:' 前綴，跟著色頁的 'v:'／'r:' 不會撞。
     貼紙資料很小（十幾筆座標），每次變動就存一次，不做 debounce——
     小孩隨時會直接把 App 滑掉，晚存就是沒存到。
     ⚠ updatedAt 一定要寫：著色頁的 trimProgress 在 progress 超過 40 筆時
     會照 updatedAt 排序刪最舊的，沒有這個欄位就會被當成最舊的先刪。 */
  function progressKey() { return 's:' + (bg ? bg.id : ''); }

  function save() {
    if (!bg || !window.KidsStore) return;
    KidsStore.put('progress', {
      key: progressKey(),
      updatedAt: Date.now(),
      stickers: St.serialize(placed)
    });
  }

  /* ===== 選背景畫面 ===== */
  function buildSelect() {
    bgGrid.innerHTML = '';
    Data.BACKGROUNDS.forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'pic-thumb bg-thumb';
      btn.title = b.name;
      const img = document.createElement('img');
      img.src = b.src;
      img.alt = b.name;
      img.draggable = false;
      const label = document.createElement('span');
      label.className = 'bg-label';
      label.textContent = b.name;
      btn.appendChild(img);
      btn.appendChild(label);
      btn.addEventListener('click', () => { Sound.click(); openBackground(b); });
      bgGrid.appendChild(btn);
    });
  }

  function showSelect() {
    selectScreen.hidden = false;
    gameScreen.hidden = true;
    TOOL_BTNS.forEach((b) => { b.hidden = true; });
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
    TOOL_BTNS.forEach((btn) => { btn.hidden = false; });
    buildTray();

    // 還原上次貼到一半的畫面。存檔壞掉／IndexedDB 開不起來就當作空白，不擋畫面。
    if (window.KidsStore) {
      KidsStore.get('progress', progressKey()).then((rec) => {
        if (!rec || bg !== b) return;   // 讀回來時使用者可能已經換背景了
        St.deserialize(rec.stickers, VALID_IDS).forEach((s) => addSticker(s.id, s.x, s.y, s.size, false));
      });
    }
  }

  /* ===== 貼紙匣 ===== */
  function buildTray() {
    catTabs.innerHTML = '';
    Data.CATEGORIES.forEach((c) => {
      const t = document.createElement('button');
      t.className = 'cat-tab' + (c.id === currentCat ? ' on' : '');
      t.dataset.cat = c.id;
      t.title = c.name;
      const e = document.createElement('span');
      e.className = 'cat-emoji';
      e.textContent = c.emoji;
      t.appendChild(e);
      t.addEventListener('click', () => {
        Sound.click();
        currentCat = c.id;
        catTabs.querySelectorAll('.cat-tab').forEach((x) => x.classList.toggle('on', x.dataset.cat === c.id));
        buildTrayItems();
      });
      catTabs.appendChild(t);
    });
    buildTrayItems();
  }

  function buildTrayItems() {
    trayScroll.innerHTML = '';
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

  /* ===== 從匣子拖出來 ===== */
  function startFromTray(e, def) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const cell = e.currentTarget;
    try { cell.setPointerCapture(e.pointerId); } catch (err) { /* 舊瀏覽器沒有就算了 */ }

    // 跟手的浮動影像：尺寸用「板面上的預設大小」，拖到一半就看得出貼上去會多大
    const size = board.getBoundingClientRect().width * St.SIZES[St.DEFAULT_SIZE];
    ghost.src = def.src;
    ghost.style.width = size + 'px';
    ghost.hidden = false;
    moveGhost(e.clientX, e.clientY);

    const move = (ev) => moveGhost(ev.clientX, ev.clientY);
    const up = (ev) => {
      cell.removeEventListener('pointermove', move);
      cell.removeEventListener('pointerup', up);
      cell.removeEventListener('pointercancel', up);
      ghost.hidden = true;
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

    const move = (ev) => {
      const r = board.getBoundingClientRect();
      moved = Math.max(moved, Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY));
      item.x = St.clamp01((ev.clientX - r.left) / r.width);
      item.y = St.clamp01((ev.clientY - r.top) / r.height);
      applyStyle(item);
    };

    const up = (ev) => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.classList.remove('dragging');

      if (moved < TAP_SLOP) {
        // 點一下＝換尺寸，並再唸一次英文
        item.size = St.cycleSize(item.size);
        applyStyle(item);
        Sound.click();
        speakFor(item.id);
        save();
        return;
      }

      // 放開時貼紙中心落在匣子裡＝收回去（刪掉）
      const c = el.getBoundingClientRect();
      const center = { x: c.left + c.width / 2, y: c.top + c.height / 2 };
      if (St.hitTray(center, tray.getBoundingClientRect())) {
        removeSticker(item);
        Sound.click();
      }
      save();
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  /* ===== 頂列工具 ===== */
  backBtn.addEventListener('click', () => { Sound.click(); showSelect(); });

  undoBtn.addEventListener('click', () => {
    Sound.click();
    if (!placed.length) return;
    removeSticker(placed[placed.length - 1]);
    save();
  });

  clearBtn.addEventListener('click', () => {
    // 不問「真的要刪嗎」：她讀不懂確認文字，而清空的代價只是再貼一次
    Sound.click();
    placed = [];
    layer.innerHTML = '';
    save();
  });

  document.getElementById('closeSave').addEventListener('click', () => {
    Sound.click();
    saveOverlay.hidden = true;
  });

  /* ===== 合成 PNG =====
     ⚠ iPad Safari 的 canvas.drawImage 對「沒有 width/height 屬性的 SVG」
     常常畫出空白（它拿不到內在尺寸就當成 0×0）。所以不直接 img.src = 'x.svg'，
     而是先把 SVG 文字抓下來、在根標籤補上 width/height（＝viewBox 的尺寸），
     再包成 blob URL 給 Image。畫完一定要 revoke，否則每存一次就漏一份記憶體。 */
  function loadSvgForCanvas(url) {
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

  saveBtn.addEventListener('click', () => {
    Sound.click();
    if (!bg) return;
    compose().then((dataUrl) => {
      saveImg.src = dataUrl;
      saveOverlay.hidden = false;
      return addArtwork(dataUrl);
    }).catch(() => { /* 合成失敗就當作沒按過，不要跳錯誤訊息嚇到小孩 */ });
  });

  /* 切到背景／鎖螢幕時再存一次：iOS 常常不會給我們 unload。 */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });

  buildSelect();
  showSelect();
})();
