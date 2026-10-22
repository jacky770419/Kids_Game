/* 蛋糕店：兩種玩法共用同一個蛋糕板面與材料匣。
     做蛋糕  自由疊一到三層、淋奶油、放裝飾，🎉 慶祝、📷 存進「我的作品」，做到一半離開會記住
     客人點餐  動物客人說「I want a pink cake with two cherries.」，照著做出來就上菜

   設計上的幾個硬規則（跟其他頁一致，不要改）：
   - 沒有計時、沒有分數、沒有失敗判定，也沒有確認對話框（五歲小孩不會讀確認文字）。
     點餐做錯只是泡泡那一格不打勾，客人不會生氣、也沒有「錯了」的音效。
   - 主要按鈕不放畫面下緣：抱著平板時手腕會壓在下緣。工具全在頂列右側，材料匣在右側。
   - 用「點一下」放材料而不是拖曳：裝飾位置由程式排好（cake-draw.js 的 SLOTS），
     一排一排放，她數「兩顆」時才數得清楚；拖曳會疊成一團。
   - 出聲一定在使用者手勢的事件處理函式裡呼叫（iOS 規定），所以 Speech.say
     只出現在 click 裡，不放進 setTimeout 或 Promise 的回呼。 */
(() => {
  'use strict';

  const Data = window.CakeData;
  const St = window.CakeState;
  const Draw = window.CakeDraw;

  const selectScreen = document.getElementById('selectScreen');
  const gameScreen = document.getElementById('gameScreen');
  const board = document.getElementById('board');
  const cakeSvg = document.getElementById('cakeSvg');
  const customerImg = document.getElementById('customer');
  const bubble = document.getElementById('bubble');
  const nextBtn = document.getElementById('nextBtn');
  const fx = document.getElementById('fx');
  const catTabs = document.getElementById('catTabs');
  const trayScroll = document.getElementById('trayScroll');

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

  const ARTWORK_MAX = 24;          // 跟著色頁同一個上限，兩頁共用同一個 store
  const HISTORY_MAX = 40;
  const FREE_KEY = 'k:free';       // 進度 key：'k:' 前綴，跟著色 'v:'／'r:'、貼紙 's:' 不會撞
  const LISTEN_KEY = 'kidsCakeListen';
  /* 點餐模式蛋糕往右放，左邊讓給客人與泡泡 */
  const CAKE_CX = { free: 400, order: 530 };

  const CATEGORIES = [
    { id: 'flavor', name: '蛋糕', emoji: '🍰' },
    { id: 'cream', name: '奶油', emoji: '🍦' },
    { id: 'topping', name: '裝飾', emoji: '🍓' }
  ];

  let mode = null;                 // 'free' | 'order'
  let cake = St.empty();
  let history = [];                // 舊的 cake 物件（狀態從不就地修改，直接放回去就是復原）
  let currentCat = 'flavor';
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

  /* ===== 存檔（只有做蛋糕模式存；點餐每位客人都從空盤開始） =====
     ⚠ updatedAt 一定要寫：著色頁的 trimProgress 會照 updatedAt 刪最舊的。 */
  function save() {
    if (mode !== 'free' || !window.KidsStore) return;
    KidsStore.put('progress', { key: FREE_KEY, updatedAt: Date.now(), cake: St.serialize(cake) });
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
      + part(r.flavor, '<span class="order-icon">' + Draw.iconFlavor(order.flavor) + '</span>')
      + part(r.topping, tops);
  }

  /* 改蛋糕的唯一入口：記歷史、重畫、存檔，點餐模式順便對答案。
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

  /* 數出來：「two cherries」。同一種放了幾個就唸幾個，順便練數數。 */
  function countPhrase(toppingId, state) {
    const t = Data.topping(toppingId);
    let n = 0;
    state.toppings.forEach((id) => { if (id === toppingId) n++; });
    if (!t || n === 0) return '';
    return Data.NUMBERS[n] + ' ' + (n === 1 ? t.word : t.plural);
  }

  function say(text, force) {
    if (text && window.Speech) Speech.say(text, force ? { force: true } : undefined);
  }

  /* ===== 材料匣 ===== */
  function buildTray() {
    catTabs.innerHTML = '';
    CATEGORIES.forEach((c) => {
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
    trayScroll.innerHTML = '';
    if (currentCat === 'flavor') {
      Data.FLAVORS.forEach((f) => trayButton(Draw.iconFlavor(f.id), f.word, () => {
        Sound.pop();
        if (!commit(St.addTier(cake, f.id))) say(f.word);
        else say('Yummy! Thank you!');
      }));
    } else if (currentCat === 'cream') {
      Data.CREAMS.forEach((c) => trayButton(Draw.iconCream(c.id), c.say, () => {
        Sound.pop();
        const next = St.setCream(cake, c.id);
        commit(next);
        if (next.cream) say(c.say);
      }));
    } else {
      Data.TOPPINGS.forEach((t) => {
        const btn = trayButton(Draw.iconTopping(t.id), t.word, () => {
          const next = St.addTopping(cake, t.id);
          if (next === cake) {
            // 頂上滿了：晃一下就好，不出「錯誤」音效
            Sound.click();
            wiggle(btn);
            return;
          }
          Sound.pop();
          if (commit(next)) say('Yummy! Thank you!');
          else say(countPhrase(t.id, cake));
        });
      });
    }
  }

  function wiggle(el) {
    el.classList.remove('wiggle');
    void el.offsetWidth;   // 重新觸發動畫
    el.classList.add('wiggle');
  }

  /* 點蛋糕上的裝飾＝拿掉它（點餐放太多顆時用）。拿掉之後唸剩幾個。 */
  cakeSvg.addEventListener('click', (e) => {
    const g = e.target && e.target.closest ? e.target.closest('.tp') : null;
    if (!g) return;
    const i = parseInt(g.getAttribute('data-i'), 10);
    if (!isFinite(i)) return;
    const id = cake.toppings[i];
    Sound.click();
    if (commit(St.removeToppingAt(cake, i))) say('Yummy! Thank you!');
    else say(countPhrase(id, cake));
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
  function showSelect() {
    mode = null;
    selectScreen.hidden = false;
    gameScreen.hidden = true;
    ALL_TOOLS.forEach((b) => { b.hidden = true; });
    if (window.Speech) Speech.cancel();
  }

  function enter(m) {
    mode = m;
    history = [];
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    ALL_TOOLS.forEach((b) => { b.hidden = TOOLS[m].indexOf(b) < 0; });
    board.classList.toggle('ordering', m === 'order');
    customerImg.hidden = m !== 'order';
    bubble.hidden = m !== 'order';
    nextBtn.hidden = true;
    fx.innerHTML = '';
    currentCat = 'flavor';
    buildTray();
  }

  function startFree() {
    enter('free');
    cake = St.empty();
    render();
    // 還原上次做到一半的蛋糕。讀不到就是空盤子，不擋畫面。
    if (window.KidsStore) {
      KidsStore.get('progress', FREE_KEY).then((rec) => {
        if (!rec || mode !== 'free' || history.length) return;   // 讀回來前她已經動手了就不蓋掉
        cake = St.deserialize(rec.cake);
        render();
      });
    }
  }

  /* 換下一位客人：空盤子、新的單，在 click 裡直接唸出點餐句子 */
  function newOrder() {
    order = St.makeOrder(Math.random, order);
    served = false;
    history = [];
    cake = St.empty();
    const c = Data.customer(order.customer);
    customerImg.src = c ? c.src : '';
    customerImg.classList.remove('happy');
    nextBtn.hidden = true;
    currentCat = 'flavor';
    buildTray();
    render();
    say(St.sentence(order));
  }

  document.getElementById('freeCard').addEventListener('click', () => { Sound.click(); startFree(); });
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
  backBtn.addEventListener('click', () => { Sound.click(); showSelect(); });

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
    commit(St.empty());
  });

  partyBtn.addEventListener('click', () => {
    if (St.isEmpty(cake)) { Sound.click(); return; }
    Sound.win();
    const candles = cake.toppings.indexOf('candle') >= 0;
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
      im.onerror = () => reject(new Error('蛋糕圖載入失敗'));
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
      name: '蛋糕', png: dataUrl, w: OUT_W, h: OUT_H, createdAt: Date.now()
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

  /* ===== 選模式畫面的示意圖 ===== */
  document.getElementById('freeDemo').innerHTML = Draw.scene(
    { tiers: ['pink', 'yellow'], cream: 'white', toppings: ['cherry', 'strawberry', 'strawberry'] });
  document.getElementById('orderDemo').innerHTML =
    '<span class="order-icon">' + Draw.iconTopping('cherry') + '</span><span class="order-icon">' + Draw.iconTopping('cherry') + '</span>';

  syncListenBtn();
  showSelect();
})();
