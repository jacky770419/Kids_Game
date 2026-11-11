/* 甜點店：兩種玩法共用同一個板面與材料匣。
     做甜點  選一種甜點（蛋糕、冰淇淋、杯子蛋糕、甜甜圈、鬆餅、聖代、餅乾），自由疊層、淋奶油、放配料，
             🎉 慶祝、📷 存進「我的作品」，每種甜點各自記住做到一半的進度
     客人點餐  動物客人說「I want a pink cake with two cherries.」，照著做出來就上菜

   設計上的幾個硬規則（跟其他頁一致，不要改）：
   - 沒有計時、沒有分數、沒有失敗判定，也沒有確認對話框（五歲小孩不會讀確認文字）。
     點餐做錯只是泡泡那一格不打勾，客人不會生氣、也沒有「錯了」的音效。
   - 主要按鈕不放畫面下緣：抱著平板時手腕會壓在下緣。工具全在頂列右側，材料匣在右側。
   - 配料兩種放法並存：點一下由程式排好位置（cake-shapes.js 的 spots），一排一排放，
     她數「兩顆」時才數得清楚；想放哪裡就從材料匣往左拖出來，放在哪裡就在哪裡。
     材料匣要能上下捲（配料很多），所以只有橫向拖出去才算拖曳。
     板面上的配料：點一下拿掉、拖一下搬位置、拖出板面也是拿掉。
   - 出聲一定在使用者手勢的事件處理函式裡呼叫（iOS 規定），所以 Speech.say
     只出現在 pointerup 與 click 裡，不放進 setTimeout 或 Promise 的回呼。 */
(() => {
  'use strict';

  const Data = window.CakeData;
  const St = window.CakeState;
  const Draw = window.CakeDraw;

  const selectScreen = document.getElementById('selectScreen');
  const dessertScreen = document.getElementById('dessertScreen');
  const dessertGrid = document.getElementById('dessertGrid');
  const gameScreen = document.getElementById('gameScreen');
  const board = document.getElementById('board');
  const cakeSvg = document.getElementById('cakeSvg');
  const customerImg = document.getElementById('customer');
  const bubble = document.getElementById('bubble');
  const nextBtn = document.getElementById('nextBtn');
  const fx = document.getElementById('fx');
  const catTabs = document.getElementById('catTabs');
  const trayScroll = document.getElementById('trayScroll');
  const ghost = document.getElementById('ghost');

  const backBtn = document.getElementById('backBtn');
  const listenBtn = document.getElementById('listenBtn');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const partyBtn = document.getElementById('partyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const saveOverlay = document.getElementById('saveOverlay');
  const saveImg = document.getElementById('saveImg');

  /* 每個模式各自要顯示的頂列工具 */
  const TOOLS = {
    free: [backBtn, undoBtn, clearBtn, partyBtn, saveBtn],
    order: [backBtn, listenBtn, undoBtn, clearBtn]
  };
  const ALL_TOOLS = [backBtn, listenBtn, undoBtn, clearBtn, partyBtn, saveBtn];

  const ARTWORK_MAX = 60;          // 跟著色頁同一個上限，兩頁共用同一個 store
  const HISTORY_MAX = 40;
  const TAP_SLOP = 10;             // 手指移動超過這麼多 px 才算拖曳，五歲的手點一下也會抖
  const LISTEN_KEY = 'kidsCakeListen';
  /* 點餐模式甜點往右放，左邊讓給客人與泡泡 */
  const CAKE_CX = { free: 400, order: 530 };

  let mode = null;                 // 'free' | 'order'
  let cake = St.empty();
  let history = [];                // 舊的 cake 物件（狀態從不就地修改，直接放回去就是復原）
  let currentCat = 'base';
  let trayDragged = false;         // 剛剛是拖出去的，接下來那個 click 不算點一下
  let order = null;
  let served = false;              // 這一張單上過菜了沒（做對之後再亂加，不會重複慶祝）

  /* ===== 只聽不看（點餐模式） =====
     開著時泡泡裡的圖換成「？」，要靠聽的；做對的那一格才把圖翻出來。存 localStorage，存不了就當關著。 */
  function listenOn() {
    try { return localStorage.getItem(LISTEN_KEY) === '1'; } catch (e) { return false; }
  }
  function setListen(v) {
    try { localStorage.setItem(LISTEN_KEY, v ? '1' : '0'); } catch (e) { /* 只影響這一次 */ }
  }
  function syncListenBtn() { listenBtn.classList.toggle('on', listenOn()); }

  /* ===== 存檔（只有做甜點模式存，每種甜點一筆；點餐每位客人都從空盤開始） =====
     進度 key 的 'k:' 前綴跟著色 'v:'／'r:'、貼紙 's:' 不會撞。
     ⚠ updatedAt 一定要寫：著色頁的 trimProgress 會照 updatedAt 刪最舊的。 */
  function save() {
    if (mode !== 'free' || !window.KidsStore) return;
    KidsStore.put('progress', { key: St.saveKey(cake.kind), updatedAt: Date.now(), cake: St.serialize(cake) });
  }

  /* ===== 畫面 ===== */
  function render() {
    cakeSvg.innerHTML = Draw.scene(cake, { cx: CAKE_CX[mode] || 400, interactive: true });
    undoBtn.classList.toggle('dim', history.length === 0);
    if (mode === 'order') renderBubble();
  }

  function renderBubble() {
    if (!order) return;
    // 上過菜之後就定格成兩格都打勾：她做對之後常常會再多放幾顆，
    // 這時候勾勾消失、旁邊又亮著「下一位」，會看不懂到底對了沒
    const r = served ? { flavor: true, topping: true } : St.check(cake, order);
    const hide = listenOn();
    const part = (ok, html) => '<span class="order-part' + (ok ? ' ok' : '') + '">'
      + ((hide && !ok) ? '<span class="order-q">?</span>' : html) + '</span>';
    let tops = '';
    for (let i = 0; i < order.count; i++) tops += '<span class="order-icon">' + Draw.iconTopping(order.topping) + '</span>';
    bubble.innerHTML = '<span class="order-ear">🔊</span>'
      + part(r.flavor, '<span class="order-icon">' + Draw.iconBase(order.dessert, order.flavor) + '</span>')
      + part(r.topping, tops);
  }

  /* 改甜點的唯一入口：記歷史、重畫、存檔，點餐模式順便對答案。
     回傳 true＝這一下剛好把單做對了（呼叫端決定要唸什麼） */
  function commit(next) {
    if (next === cake) return false;
    history.push(cake);
    if (history.length > HISTORY_MAX) history.shift();
    cake = next;
    render();
    save();
    if (mode === 'order' && order && !served && St.check(cake, order).done) {
      served = true;
      celebrate(['💖', '✨', '😋']);
      customerImg.classList.add('happy');
      nextBtn.hidden = false;
      Sound.win();
      return true;
    }
    return false;
  }

  function say(text, force) {
    if (text && window.Speech) Speech.say(text, force ? { force: true } : undefined);
  }

  /* ===== 材料匣 =====
     頁籤跟著甜點走：顏色、容器（聖代沒有）、淋的東西，加上三個配料頁籤。 */
  function categories() {
    const d = Data.dessert(cake.kind);
    const out = [{ id: 'base', name: d.name, emoji: d.tabs.base }];
    if (d.holders) out.push({ id: 'holder', name: d.holderName || '容器', emoji: d.tabs.holder });
    out.push({ id: 'cream', name: '奶油', emoji: d.tabs.cream });
    return out.concat(Data.TOPPING_GROUPS);
  }

  function buildTray() {
    catTabs.innerHTML = '';
    categories().forEach((c) => {
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

  function trayButton(svg, title, onTap) {
    const b = document.createElement('button');
    b.className = 'tray-item';
    b.title = title;
    b.innerHTML = svg;
    b.addEventListener('click', onTap);
    trayScroll.appendChild(b);
    return b;
  }

  function buildTrayItems() {
    trayScroll.scrollTop = 0;
    trayScroll.innerHTML = '';
    const d = Data.dessert(cake.kind);
    if (currentCat === 'base') {
      d.flavors.forEach((id) => {
        const f = Data.flavor(id);
        trayButton(Draw.iconBase(d.id, id), f.word, () => {
          Sound.pop();
          if (!commit(St.addTier(cake, id))) say(f.word);
          else say('Yummy! Thank you!');
        });
      });
    } else if (currentCat === 'holder') {
      d.holders.forEach((h) => trayButton(Draw.iconHolder(d.id, h.id), h.say, () => {
        Sound.pop();
        commit(St.setHolder(cake, h.id));
        say(h.say);
      }));
    } else if (currentCat === 'cream') {
      Data.CREAMS.forEach((c) => {
        const word = Data.creamSay(d.id, c.id);
        trayButton(Draw.iconCream(c.id), word, () => {
          Sound.pop();
          const next = St.setCream(cake, c.id);
          commit(next);
          if (next.cream) say(word);
        });
      });
    } else {
      Data.TOPPINGS.filter((t) => t.group === currentCat).forEach((t) => {
        const btn = trayButton(Draw.iconTopping(t.id), t.word, () => {
          if (trayDragged) { trayDragged = false; return; }
          placeTopping(t.id, undefined, undefined, btn);
        });
        watchTrayDrag(btn, t.id);
      });
    }
  }

  /* 放一個配料：不給 x／y＝點一下（程式排位置），給了＝拖到那裡 */
  function placeTopping(id, x, y, btn) {
    const next = St.addTopping(cake, id, x, y);
    if (next === cake) {
      // 放滿了：晃一下就好，不出「錯誤」音效
      Sound.click();
      if (btn) wiggle(btn);
      return;
    }
    Sound.pop();
    if (commit(next)) say('Yummy! Thank you!');
    else say(St.countPhrase(cake, id));
  }

  function wiggle(el) {
    el.classList.remove('wiggle');
    void el.offsetWidth;   // 重新觸發動畫
    el.classList.add('wiggle');
  }

  /* 手指在板面上的位置（800×600 座標）。y 往下補半個配料高：手指按著配料中間，
     存的是配料底部中心，放開時配料才會留在手指底下。 */
  function boardPoint(ev) {
    const r = cakeSvg.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) / r.width * Draw.W,
      y: (ev.clientY - r.top) / r.height * Draw.H + 50 * Draw.DROP_K,
      inside: ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom
    };
  }

  /* ===== 從材料匣拖出來 =====
     直向的滑動留給瀏覽器捲材料匣（CSS 的 touch-action: pan-y），橫向才接手。
     用 window 接事件：滑鼠一拖就離開按鈕了，手指則是系統自動鎖在按鈕上，兩種都收得到。 */
  function watchTrayDrag(btn, id) {
    btn.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      trayDragged = false;
      const startX = e.clientX;
      const startY = e.clientY;
      let dragging = false;

      const move = (ev) => {
        if (!dragging) {
          // 斜斜往下拖也要算（她的手不會走水平線），比這更直的手指滑動瀏覽器會拿去捲匣子
          const dx = Math.abs(ev.clientX - startX);
          if (dx < TAP_SLOP || dx * 2 < Math.abs(ev.clientY - startY)) return;
          dragging = true;
          showGhost(id);
        }
        ghost.style.left = ev.clientX + 'px';
        ghost.style.top = ev.clientY + 'px';
      };
      const end = (ev) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        if (!dragging) return;
        trayDragged = true;
        ghost.hidden = true;
        if (ev.type === 'pointercancel') return;
        const p = boardPoint(ev);
        if (p.inside) placeTopping(id, p.x, p.y, btn);   // 放在板子外＝取消，什麼都不發生
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
  }

  /* 跟手的影像：尺寸換算成放到板面上的大小，拖到一半就看得出放上去會多大 */
  function showGhost(id) {
    const art = 100 * Draw.DROP_K / 0.78;   // 小圖裡配料縮 0.78 倍，板面上縮 DROP_K 倍
    const size = cakeSvg.getBoundingClientRect().width * art / Draw.W;
    ghost.innerHTML = Draw.iconTopping(id);
    ghost.style.width = size + 'px';
    ghost.style.height = size + 'px';
    ghost.hidden = false;
  }

  /* ===== 板面上的配料：點一下拿掉（拿掉之後唸剩幾個）、拖一下搬位置、拖出板面也是拿掉 =====
     拖動中只改那一個 <g> 的 transform，放開才 commit：
     commit 會重畫整個板面，拖到一半重畫，手指底下的元素就不見了。 */
  cakeSvg.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    const g = e.target && e.target.closest ? e.target.closest('.tp') : null;
    if (!g) return;
    const i = parseInt(g.getAttribute('data-i'), 10);
    if (!isFinite(i)) return;
    e.preventDefault();
    try { cakeSvg.setPointerCapture(e.pointerId); } catch (err) { /* 舊瀏覽器沒有就算了 */ }
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    const move = (ev) => {
      if (!moved) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < TAP_SLOP) return;
        moved = true;
        g.parentNode.appendChild(g);   // 拖動中的配料浮到最上面
      }
      const b = boardPoint(ev);
      const p = St.clampDrop(b.x, b.y);
      g.setAttribute('transform', Draw.toppingTransform(p.x, p.y, Draw.DROP_K));
    };
    const end = (ev) => {
      cakeSvg.removeEventListener('pointermove', move);
      cakeSvg.removeEventListener('pointerup', end);
      cakeSvg.removeEventListener('pointercancel', end);
      if (ev.type === 'pointercancel') { render(); return; }
      const id = cake.toppings[i].id;
      const p = boardPoint(ev);
      if (moved && p.inside) {
        Sound.pop();
        commit(St.moveTopping(cake, i, p.x, p.y));
        return;
      }
      Sound.click();
      if (commit(St.removeToppingAt(cake, i))) say('Yummy! Thank you!');
      else say(St.countPhrase(cake, id));
    };
    cakeSvg.addEventListener('pointermove', move);
    cakeSvg.addEventListener('pointerup', end);
    cakeSvg.addEventListener('pointercancel', end);
  });

  /* ===== 慶祝的小特效：一把 emoji 往上飄，一秒半後自己清掉 ===== */
  function celebrate(chars) {
    fx.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.className = 'fx-bit';
      s.textContent = chars[i % chars.length];
      s.style.left = (8 + Math.random() * 84) + '%';
      s.style.animationDelay = (Math.random() * 0.4) + 's';
      s.style.fontSize = (28 + Math.random() * 26) + 'px';
      fx.appendChild(s);
    }
    setTimeout(() => { fx.innerHTML = ''; }, 2000);
  }

  /* ===== 模式切換 ===== */
  function hideTools() {
    ALL_TOOLS.forEach((b) => { b.hidden = true; });
    if (window.Speech) Speech.cancel();
  }

  function showSelect() {
    mode = null;
    selectScreen.hidden = false;
    dessertScreen.hidden = true;
    gameScreen.hidden = true;
    hideTools();
  }

  function showDessertPick() {
    mode = null;
    selectScreen.hidden = true;
    dessertScreen.hidden = false;
    gameScreen.hidden = true;
    hideTools();
    backBtn.hidden = false;
  }

  function enter(m) {
    mode = m;
    history = [];
    selectScreen.hidden = true;
    dessertScreen.hidden = true;
    gameScreen.hidden = false;
    ALL_TOOLS.forEach((b) => { b.hidden = TOOLS[m].indexOf(b) < 0; });
    board.classList.toggle('ordering', m === 'order');
    customerImg.hidden = m !== 'order';
    bubble.hidden = m !== 'order';
    nextBtn.hidden = true;
    fx.innerHTML = '';
    currentCat = 'base';
  }

  function startFree(kind) {
    cake = St.empty(kind);
    enter('free');
    buildTray();
    render();
    // 還原上次做到一半的甜點。讀不到就是空盤子，不擋畫面。
    if (window.KidsStore) {
      KidsStore.get('progress', St.saveKey(kind)).then((rec) => {
        // 讀回來前她已經動手或換了甜點就不蓋掉
        if (!rec || mode !== 'free' || cake.kind !== kind || history.length) return;
        cake = St.deserialize(rec.cake, kind);
        render();
      });
    }
  }

  /* 換下一位客人：空盤子、新的單，在 click 裡直接唸出點餐句子 */
  function newOrder() {
    order = St.makeOrder(Math.random, order);
    served = false;
    history = [];
    cake = St.empty(order.dessert);
    const c = Data.customer(order.customer);
    customerImg.src = c ? c.src : '';
    customerImg.classList.remove('happy');
    nextBtn.hidden = true;
    currentCat = 'base';
    buildTray();
    render();
    say(St.sentence(order));
  }

  document.getElementById('freeCard').addEventListener('click', () => { Sound.click(); showDessertPick(); });
  document.getElementById('orderCard').addEventListener('click', () => {
    Sound.click();
    enter('order');
    order = null;
    newOrder();
  });

  nextBtn.addEventListener('click', () => { Sound.click(); newOrder(); });

  // 點客人或泡泡＝再聽一次。這是她主動要聽，唸英文開關關著也照唸（跟單字頁的 🔊 一樣）
  const repeatOrder = () => { if (order) say(St.sentence(order), true); };
  bubble.addEventListener('click', repeatOrder);
  customerImg.addEventListener('click', repeatOrder);

  /* ===== 頂列工具 ===== */
  // 做甜點退回選甜點，其他（點餐、選甜點畫面）退回最前面
  backBtn.addEventListener('click', () => {
    Sound.click();
    if (mode === 'free') showDessertPick();
    else showSelect();
  });

  listenBtn.addEventListener('click', () => {
    Sound.click();
    setListen(!listenOn());
    syncListenBtn();
    renderBubble();
  });

  undoBtn.addEventListener('click', () => {
    Sound.click();
    if (!history.length) return;
    cake = history.pop();
    render();
    save();
  });

  clearBtn.addEventListener('click', () => {
    // 不問「真的要刪嗎」：她讀不懂確認文字，而且清掉之後 ↩️ 還拿得回來
    Sound.click();
    if (St.isEmpty(cake)) return;
    commit(St.empty(cake.kind));
  });

  partyBtn.addEventListener('click', () => {
    if (St.isEmpty(cake)) { Sound.click(); return; }
    Sound.win();
    const candles = St.hasTopping(cake, 'candle');
    celebrate(candles ? ['🎉', '🎈', '✨'] : ['💖', '✨', '😋']);
    say(candles ? 'Happy birthday!' : 'Yummy!');
  });

  document.getElementById('closeSave').addEventListener('click', () => {
    Sound.click();
    saveOverlay.hidden = true;
  });

  /* ===== 合成 PNG =====
     板面本來就是 SVG 字串，存圖時重畫一份「根標籤帶 width/height」的版本包成 blob：
     ⚠ iPad Safari 的 drawImage 對沒有尺寸的 SVG 常常畫出空白（同 stickers.js 的說明）。
     畫完一定要 revoke，否則每存一次就漏一份記憶體。 */
  const OUT_W = 1600;
  const OUT_H = 1200;

  function compose() {
    const svg = Draw.scene(cake, { cx: CAKE_CX.free, size: [OUT_W, OUT_H] });
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('甜點圖載入失敗'));
      im.src = url;
    }).then((im) => {
      const canvas = document.createElement('canvas');
      canvas.width = OUT_W;
      canvas.height = OUT_H;
      const g = canvas.getContext('2d');
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, 0, OUT_W, OUT_H);
      g.drawImage(im, 0, 0, OUT_W, OUT_H);
      return canvas.toDataURL('image/png');
    }).finally(() => URL.revokeObjectURL(url));
  }

  /* 收一張完成的作品。記錄形狀必須跟著色頁一模一樣（js/coloring.js 的 addArtwork），
     著色頁的「我的作品」列會直接讀到這裡存的東西，多一個欄位或少一個都會出問題。 */
  function addArtwork(dataUrl) {
    if (!window.KidsStore) return Promise.resolve();
    return KidsStore.estimate().then((est) => {
      if (!est || !est.quota || !(est.usage / est.quota > 0.8)) return;
      const keep = Math.max(1, ARTWORK_MAX - 5);
      return KidsStore.all('artworks').then((list) => Promise.all(
        sortArtworks(list).slice(keep).map((a) => KidsStore.del('artworks', a.id))
      ));
    }).then(() => KidsStore.put('artworks', {
      name: Data.dessert(cake.kind).name, png: dataUrl, w: OUT_W, h: OUT_H, createdAt: Date.now()
    })).then(() => KidsStore.all('artworks')).then((list) => {
      sortArtworks(list).slice(ARTWORK_MAX).forEach((a) => KidsStore.del('artworks', a.id));
    });
  }

  function sortArtworks(list) {
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || (b.id || 0) - (a.id || 0));
  }

  saveBtn.addEventListener('click', () => {
    Sound.click();
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

  /* ===== 選模式、選甜點畫面的示意圖 ===== */
  const demoOf = (d) => Draw.scene(St.deserialize(d.demo, d.id), { view: Draw.DEMO_VIEW });
  document.getElementById('freeDemo').innerHTML = demoOf(Data.dessert('cake'));
  document.getElementById('orderDemo').innerHTML =
    '<span class="order-icon">' + Draw.iconTopping('cherry') + '</span><span class="order-icon">' + Draw.iconTopping('cherry') + '</span>';

  Data.DESSERTS.forEach((d, i) => {
    const b = document.createElement('button');
    b.className = 'dessert-card';
    b.style.background = d.color;
    b.style.setProperty('--rot', (i % 2 ? 1.5 : -1.5) + 'deg');
    b.title = d.name;
    b.innerHTML = '<span class="dessert-pic">' + demoOf(d) + '</span><span class="dessert-label">' + d.name + '</span>';
    b.addEventListener('click', () => {
      Sound.click();
      startFree(d.id);
      say(d.word);
    });
    dessertGrid.appendChild(b);
  });

  syncListenBtn();
  showSelect();
})();
