/* 甜點店：兩種玩法共用同一個店面與右邊的材料盒。
     做甜點  選一種甜點（蛋糕、冰淇淋、杯子蛋糕、甜甜圈、鬆餅、聖代、餅乾），自由疊層、淋奶油、放配料，
             按盒子最下面的綠色勾勾＝做好了：慶祝、存進「我的作品」、跳完成畫面。
             每種甜點各自記住做到一半的進度
     客人點餐  動物客人說「I want a pink cake with two cherries.」，照著做出來，
             盒子最下面的綠色箭頭才浮起來（下一位）

   設計上的幾個硬規則（跟其他頁一致，不要改）：
   - 浮起來的才能按：店面（牆、櫃台、甜點、客人）是平的；能按的都有厚底邊。
     綠色只代表「往下走」：做甜點＝做好了，點餐＝下一位（還沒做對是灰的、平的、按不下去）。
   - 畫面上沒有 emoji、沒有國字：按鈕是線條圖示（js/ui.js），材料是 cake-draw.js 畫的小圖。
   - 沒有計時、沒有分數、沒有失敗判定，也沒有確認對話框（五歲小孩不會讀確認文字）。
     點餐做錯只是泡泡那一格不打勾，客人不會生氣、也沒有「錯了」的音效。
     「全部重來」不問問題，改成要按住一秒（而且清掉之後上一步還拿得回來）。
   - 材料都在右邊的盒子裡，盒子最下面永遠是 [上一步][綠色]。直向也一樣在右邊。
   - 配料兩種放法並存：點一下由程式排好位置（cake-shapes.js 的 spots），一排一排放，
     她數「兩顆」時才數得清楚；想放哪裡就從材料盒往左拖出來，放在哪裡就在哪裡。
     材料盒要能上下捲（配料很多），所以只有橫向拖出去才算拖曳。
     店面上的配料：點一下拿掉、拖一下搬位置、拖出店面也是拿掉。
   - 出聲一定在使用者手勢的事件處理函式裡呼叫（iOS 規定），所以 Speech.say
     只出現在 pointerup 與 click 裡，不放進 setTimeout 或 Promise 的回呼。
   - 音樂、唸英文、「只聽不看」的開關都搬到首頁的大人專區了（js/home.js）。
     這一頁只讀設定（listenOn），不再有開關按鈕。 */
(() => {
  'use strict';

  const Data = window.CakeData;
  const St = window.CakeState;
  const Draw = window.CakeDraw;
  const UI = window.UI;

  const selectScreen = document.getElementById('selectScreen');
  const dessertScreen = document.getElementById('dessertScreen');
  const dessertGrid = document.getElementById('dessertGrid');
  const gameScreen = document.getElementById('gameScreen');
  const board = document.getElementById('board');
  const cakeSvg = document.getElementById('cakeSvg');
  const customerImg = document.getElementById('customer');
  const bubble = document.getElementById('bubble');
  const fx = document.getElementById('fx');
  const catTabs = document.getElementById('catTabs');
  const trayScroll = document.getElementById('trayScroll');
  const ghost = document.getElementById('ghost');

  const backBtn = document.getElementById('backBtn');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');     // 做甜點的綠色：做好了
  const nextBtn = document.getElementById('nextBtn');     // 點餐的綠色：下一位
  const doneOverlay = document.getElementById('saveOverlay');
  const doneImg = document.getElementById('saveImg');

  /* 小熊泡泡的台詞（注音寫法見 js/ui.js）。做甜點／點餐中小熊收起來，
     點餐時「現在要做什麼」由客人的泡泡負責。 */
  const guideEl = document.getElementById('guide');
  const guide = (guideEl && guideEl.__uiGuide) || { set() {} };
  const LINE_MODE = '要ㄧㄠˋ 玩ㄨㄢˊ 哪ㄋㄚˇ 個˙ㄍㄜ';
  const LINE_PICK = '想ㄒㄧㄤˇ 做ㄗㄨㄛˋ 什ㄕㄣˊ 麼˙ㄇㄜ';
  let pickLineSaid = false;

  const ARTWORK_MAX = 60;          // 跟著色頁同一個上限，兩頁共用同一個 store
  const HISTORY_MAX = 40;
  const TAP_SLOP = 10;             // 手指移動超過這麼多 px 才算拖曳，五歲的手點一下也會抖
  const CLEAR_HOLD_MS = 1000;      // 全部重來要按住這麼久
  const LISTEN_KEY = 'kidsCakeListen';
  /* 點餐模式甜點往右放，左邊讓給客人與泡泡 */
  const CAKE_CX = { free: 400, order: 530 };
  /* 店面比 4:3 高的時候，多出來的高度有多少給上面的牆（其餘給下面的櫃台） */
  const EXTRA_TOP = 0.56;

  let mode = null;                 // 'free' | 'order'
  let cake = St.empty();
  let history = [];                // 舊的 cake 物件（狀態從不就地修改，直接放回去就是復原）
  let currentCat = 'base';
  let trayDragged = false;         // 剛剛是拖出去的，接下來那個 click 不算點一下
  let order = null;
  let served = false;              // 這一張單上過菜了沒（做對之後再亂加，不會重複慶祝）
  let view = [0, 0, Draw.W, Draw.H];   // 店面現在看的是板面座標的哪一塊（見 boardView）
  let ticked = { flavor: false, topping: false };   // 泡泡上一次畫的時候哪幾格已經打勾（新打的勾才跳一下）
  let composing = false;           // 正在把甜點合成圖片（防止綠色勾勾連點存好幾張）

  /* ===== 只聽不看（點餐模式） =====
     開關在首頁的大人專區（js/home.js 直接寫這個 localStorage key）。
     開著時泡泡裡的圖換成問號，要靠聽的；做對的那一格才把圖翻出來。讀不到就當關著。 */
  function listenOn() {
    try { return localStorage.getItem(LISTEN_KEY) === '1'; } catch (e) { return false; }
  }

  /* ===== 存檔（只有做甜點模式存，每種甜點一筆；點餐每位客人都從空盤開始） =====
     進度 key 的 'k:' 前綴跟著色 'v:'／'r:'、貼紙 's:' 不會撞。
     ⚠ updatedAt 一定要寫：著色頁的 trimProgress 會照 updatedAt 刪最舊的。 */
  function save() {
    if (mode !== 'free' || !window.KidsStore) return;
    KidsStore.put('progress', { key: St.saveKey(cake.kind), updatedAt: Date.now(), cake: St.serialize(cake) });
  }

  /* ===== 畫面 =====
     板面座標是 800×600（4:3），但畫面上的店面是「扣掉右邊盒子剩下的那一塊」，橫向接近正方形、
     直向是長條。不把板面縮在中間留白，而是照店面的長寬比把視窗往外擴：
     比 4:3 高＝牆往上長、櫃台往下長；比 4:3 寬＝左右多畫一點。甜點與配料的座標完全不變。 */
  function boardView() {
    const w = board.clientWidth;
    const h = board.clientHeight;
    if (!w || !h) return [0, 0, Draw.W, Draw.H];
    if (h * Draw.W >= w * Draw.H) {
      const vh = Draw.W * h / w;
      return [0, -(vh - Draw.H) * EXTRA_TOP, Draw.W, vh];
    }
    const vw = Draw.H * w / h;
    return [(Draw.W - vw) / 2, 0, vw, Draw.H];
  }

  function render() {
    view = boardView();
    cakeSvg.innerHTML = Draw.scene(cake, { cx: CAKE_CX[mode] || 400, interactive: true, view: view.map((n) => Math.round(n * 10) / 10) });
    syncFoot();
    syncTraySel();
    if (mode === 'order') renderBubble();
  }

  /* 盒子最下面那一排：沒有東西可以復原、盤子是空的、還沒做對——都是灰的、平的、按不下去 */
  function syncFoot() {
    undoBtn.disabled = history.length === 0;
    saveBtn.disabled = St.isEmpty(cake);
    nextBtn.disabled = !served;
  }

  /* 點餐泡泡：兩格圖（什麼顏色的什麼甜點、哪種配料幾個），做對的那格右上角打勾；最右邊一顆黃色喇叭。
     數量那一格把配料一顆一顆畫出來（最多四顆排成 2×2），她用數的。 */
  function renderBubble() {
    if (!order) return;
    // 上過菜之後就定格成兩格都打勾：她做對之後常常會再多放幾顆，
    // 這時候勾勾消失、旁邊「下一位」又是綠的，會看不懂到底對了沒
    const r = served ? { flavor: true, topping: true } : St.check(cake, order);
    const hide = listenOn();
    const tick = (key) => '<span class="order-ok' + (ticked[key] ? '' : ' new') + '">' + UI.icon('check') + '</span>';
    const part = (key, html, cls) => '<span class="order-part' + (cls || '') + (r[key] ? ' ok' : '') + '">'
      + ((hide && !r[key]) ? '<span class="order-q">' + UI.icon('help') + '</span>' : html) + (r[key] ? tick(key) : '') + '</span>';
    let tops = '';
    for (let i = 0; i < order.count; i++) tops += '<span class="order-icon">' + Draw.iconTopping(order.topping) + '</span>';
    bubble.innerHTML = part('flavor', '<span class="order-icon">' + Draw.iconBase(order.dessert, order.flavor) + '</span>')
      + part('topping', tops, order.count > 1 ? ' many' : '')
      + '<span class="order-say">' + UI.icon('speaker') + '</span>';
    ticked = { flavor: r.flavor, topping: r.topping };
  }

  /* 改甜點的唯一入口：記歷史、重畫、存檔，點餐模式順便對答案。
     回傳 true＝這一下剛好把單做對了（呼叫端決定要唸什麼） */
  function commit(next) {
    if (next === cake) return false;
    history.push(cake);
    if (history.length > HISTORY_MAX) history.shift();
    cake = next;
    if (mode === 'order' && order && !served && St.check(cake, order).done) {
      served = true;
      render();
      celebrate();
      restart(customerImg, 'happy');
      restart(nextBtn, 'pop');      // 綠色的「下一位」浮起來的時候跳一下，她才知道可以按了
      Sound.win();
      return true;
    }
    render();
    save();
    return false;
  }

  function say(text, force) {
    if (text && window.Speech) Speech.say(text, force ? { force: true } : undefined);
  }

  /* 重新觸發一個 CSS 動畫 */
  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ===== 材料盒 =====
     頁籤跟著甜點走：顏色、容器（聖代沒有）、淋的東西，加上三個配料頁籤。
     頁籤上不放字也不放 emoji，直接畫那一類的東西（這種甜點的一塊、它的盤子、一灘奶油、草莓…）。 */
  function categories() {
    const d = Data.dessert(cake.kind);
    const out = [{ id: 'base', name: d.name, pic: Draw.iconBase(d.id, d.flavors[0]) }];
    if (d.holders) out.push({ id: 'holder', name: d.holderName || '容器', pic: Draw.iconHolder(d.id, d.holder) });
    out.push({ id: 'cream', name: '奶油', pic: Draw.iconCream('white') });
    return out.concat(Data.TOPPING_GROUPS.map((g) => ({ id: g.id, name: g.name, pic: Draw.iconTopping(g.pic) })));
  }

  function buildTray() {
    catTabs.innerHTML = '';
    categories().forEach((c) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'btn sm cat-tab' + (c.id === currentCat ? ' sel' : '');
      t.dataset.cat = c.id;
      t.setAttribute('aria-label', c.name);
      t.innerHTML = c.pic;
      t.addEventListener('click', () => {
        Sound.click();
        currentCat = c.id;
        catTabs.querySelectorAll('.cat-tab').forEach((x) => x.classList.toggle('sel', x.dataset.cat === c.id));
        buildTrayItems();
      });
      catTabs.appendChild(t);
    });
    buildTrayItems();
  }

  function trayButton(svg, label, val, onTap) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn tray-item';
    b.dataset.val = val;
    b.setAttribute('aria-label', label);
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
        trayButton(Draw.iconBase(d.id, id), f.word, id, () => {
          Sound.pop();
          if (!commit(St.addTier(cake, id))) say(f.word);
          else say('Yummy! Thank you!');
        });
      });
    } else if (currentCat === 'holder') {
      d.holders.forEach((h) => trayButton(Draw.iconHolder(d.id, h.id), h.say, h.id, () => {
        Sound.pop();
        commit(St.setHolder(cake, h.id));
        say(h.say);
      }));
    } else if (currentCat === 'cream') {
      Data.CREAMS.forEach((c) => {
        const word = Data.creamSay(d.id, c.id);
        trayButton(Draw.iconCream(c.id), word, c.id, () => {
          Sound.pop();
          const next = St.setCream(cake, c.id);
          commit(next);
          if (next.cream) say(word);
        });
      });
    } else {
      Data.TOPPINGS.filter((t) => t.group === currentCat).forEach((t) => {
        const btn = trayButton(Draw.iconTopping(t.id), t.word, t.id, () => {
          if (trayDragged) { trayDragged = false; return; }
          placeTopping(t.id, undefined, undefined, btn);
        });
        watchTrayDrag(btn, t.id);
      });
    }
    syncTraySel();
  }

  /* 「現在用的是哪一個」：容器、奶油一次只有一個，把那一格標成選到的（房間色＋外圈）。
     只有一層的甜點（杯子蛋糕、甜甜圈、餅乾）顏色也是一次一個。配料與疊層是「加一個」，沒有選到的。 */
  function syncTraySel() {
    let cur = null;
    if (currentCat === 'holder') cur = cake.holder;
    else if (currentCat === 'cream') cur = cake.cream;
    else if (currentCat === 'base' && Data.dessert(cake.kind).maxTiers === 1) cur = cake.tiers[0] || null;
    trayScroll.querySelectorAll('.tray-item').forEach((b) => b.classList.toggle('sel', cur !== null && b.dataset.val === cur));
  }

  /* 放一個配料：不給 x／y＝點一下（程式排位置），給了＝拖到那裡 */
  function placeTopping(id, x, y, btn) {
    const next = St.addTopping(cake, id, x, y);
    if (next === cake) {
      // 放滿了：晃一下就好，不出「錯誤」音效
      Sound.click();
      if (btn) restart(btn, 'wiggle');
      return;
    }
    Sound.pop();
    if (commit(next)) say('Yummy! Thank you!');
    else say(St.countPhrase(cake, id));
  }

  /* 手指在板面上的位置（800×600 座標，店面看的是 view 那一塊）。y 往下補半個配料高：
     手指按著配料中間，存的是配料底部中心，放開時配料才會留在手指底下。 */
  function boardPoint(ev) {
    const r = cakeSvg.getBoundingClientRect();
    return {
      x: view[0] + (ev.clientX - r.left) / r.width * view[2],
      y: view[1] + (ev.clientY - r.top) / r.height * view[3] + 50 * Draw.DROP_K,
      inside: ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom
    };
  }

  /* ===== 從材料盒拖出來 =====
     直向的滑動留給瀏覽器捲材料盒（CSS 的 touch-action: pan-y），橫向才接手。
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
          // 斜斜往下拖也要算（她的手不會走水平線），比這更直的手指滑動瀏覽器會拿去捲盒子
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
        if (p.inside) placeTopping(id, p.x, p.y, btn);   // 放在店面外＝取消，什麼都不發生
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
  }

  /* 跟手的影像：尺寸換算成放到店面上的大小，拖到一半就看得出放上去會多大 */
  function showGhost(id) {
    const art = 100 * Draw.DROP_K / 0.78;   // 小圖裡配料縮 0.78 倍，板面上縮 DROP_K 倍
    const size = cakeSvg.getBoundingClientRect().width * art / view[2];
    ghost.innerHTML = Draw.iconTopping(id);
    ghost.style.width = size + 'px';
    ghost.style.height = size + 'px';
    ghost.hidden = false;
  }

  /* ===== 店面上的配料：點一下拿掉（拿掉之後唸剩幾個）、拖一下搬位置、拖出店面也是拿掉 =====
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

  /* ===== 慶祝的小特效：一把愛心、星星、亮晶晶從店面下面往上飄，兩秒後自己清掉 =====
     不用 emoji（每台裝置長得不一樣）：用 js/ui.js 的線條圖示塗滿顏色。 */
  const FX_SHAPES = ['heart', 'sparkle', 'star'];
  const FX_COLORS = ['#FF7FB0', '#FFD84D', '#9A7BF5', '#4AA8EE', '#FFA228', '#FF5C5C'];
  function celebrate() {
    let html = '';
    for (let i = 0; i < 14; i++) {
      const c = FX_COLORS[i % FX_COLORS.length];
      html += '<svg class="fx-bit" viewBox="0 0 24 24" aria-hidden="true" style="left:' + (6 + Math.random() * 84).toFixed(1)
        + '%;width:' + Math.round(30 + Math.random() * 30) + 'px;animation-delay:' + (Math.random() * 0.4).toFixed(2)
        + 's" fill="' + c + '" stroke="' + c + '" stroke-width="1.6" stroke-linejoin="round">' + UI.icons[FX_SHAPES[i % FX_SHAPES.length]] + '</svg>';
    }
    fx.innerHTML = html;
    setTimeout(() => { fx.innerHTML = ''; }, 2000);
  }

  /* ===== 完成畫面的彩色紙片（跟拼圖頁同一種：六個房間的顏色從上面飄下來） ===== */
  const confetti = document.getElementById('confettiCanvas');
  let confettiSeq = 0;
  function launchConfetti() {
    const ctx = confetti.getContext('2d');
    const seq = ++confettiSeq;
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
      ctx.clearRect(0, 0, confetti.width, confetti.height);
      if (seq !== confettiSeq || t - start >= 3500) return;   // 被新的一把蓋掉、或飄完了
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function hideDone() {
    doneOverlay.hidden = true;
    confettiSeq++;       // 紙片停掉
  }

  /* ===== 畫面切換 ===== */
  function leaveGame() {
    mode = null;
    gameScreen.hidden = true;
    hideDone();
    document.body.classList.remove('playing');
    if (window.Speech) Speech.cancel();
  }

  function showSelect() {
    leaveGame();
    selectScreen.hidden = false;
    dessertScreen.hidden = true;
    backBtn.hidden = true;
    guide.set(LINE_MODE);
    drawFreeDemo();
  }

  function showDessertPick(speak) {
    leaveGame();
    selectScreen.hidden = true;
    dessertScreen.hidden = false;
    backBtn.hidden = false;
    // 第一次進來小熊唸一次（這一下是她點卡片的手勢，iPad 才准出聲）；之後想聽再點泡泡
    guide.set(LINE_PICK, !!speak && !pickLineSaid);
    if (speak) pickLineSaid = true;
  }

  function enter(m) {
    mode = m;
    history = [];
    selectScreen.hidden = true;
    dessertScreen.hidden = true;
    gameScreen.hidden = false;
    hideDone();
    backBtn.hidden = false;
    document.body.classList.add('playing');   // 回家／上一層浮到店面左上角，小熊收起來（css/cake.css）
    board.classList.toggle('ordering', m === 'order');
    customerImg.hidden = m !== 'order';
    bubble.hidden = m !== 'order';
    saveBtn.hidden = m !== 'free';
    nextBtn.hidden = m !== 'order';
    nextBtn.classList.remove('pop');
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
    ticked = { flavor: false, topping: false };
    history = [];
    cake = St.empty(order.dessert);
    const c = Data.customer(order.customer);
    customerImg.src = c ? c.src : '';
    customerImg.classList.remove('happy');
    nextBtn.classList.remove('pop');
    currentCat = 'base';
    buildTray();
    render();
    say(St.sentence(order));
  }

  document.getElementById('freeCard').addEventListener('click', () => { Sound.click(); showDessertPick(true); });
  document.getElementById('orderCard').addEventListener('click', () => {
    Sound.click();
    enter('order');
    order = null;
    newOrder();
  });

  nextBtn.addEventListener('click', () => {
    if (!served) return;
    Sound.click();
    newOrder();
  });

  // 點泡泡（或客人）＝再聽一次。這是她主動要聽，唸英文開關關著也照唸（跟單字頁的喇叭一樣）
  const repeatOrder = () => { if (order) say(St.sentence(order), true); };
  bubble.addEventListener('click', repeatOrder);
  customerImg.addEventListener('click', repeatOrder);

  /* ===== 上一層、上一步、全部重來 ===== */
  // 做甜點（含完成畫面）退回選甜點，其他（點餐、選甜點畫面）退回最前面
  backBtn.addEventListener('click', () => {
    Sound.click();
    if (mode === 'free') showDessertPick();
    else showSelect();
  });

  undoBtn.addEventListener('click', () => {
    if (!history.length) return;
    Sound.click();
    cake = history.pop();
    render();
    save();
  });

  // 不問「真的要刪嗎」（她讀不懂確認文字）：改成要按住一秒，而且清掉之後上一步還拿得回來
  UI.hold(clearBtn, CLEAR_HOLD_MS, () => {
    Sound.click();
    if (St.isEmpty(cake)) return;
    commit(St.empty(cake.kind));
  });

  /* ===== 合成 PNG =====
     板面本來就是 SVG 字串，存圖時重畫一份「根標籤帶 width/height」的版本包成 blob：
     ⚠ iPad Safari 的 drawImage 對沒有尺寸的 SVG 常常畫出空白（同 stickers.js 的說明）。
     畫完一定要 revoke，否則每存一次就漏一份記憶體。
     存的永遠是 800×600 那一塊（4:3），不是畫面上擴出去的店面。 */
  const OUT_W = 1600;
  const OUT_H = 1200;

  function compose(state) {
    const svg = Draw.scene(state, { cx: CAKE_CX.free, size: [OUT_W, OUT_H] });
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
  function addArtwork(dataUrl, kind) {
    if (!window.KidsStore) return Promise.resolve();
    return KidsStore.estimate().then((est) => {
      if (!est || !est.quota || !(est.usage / est.quota > 0.8)) return;
      const keep = Math.max(1, ARTWORK_MAX - 5);
      return KidsStore.all('artworks').then((list) => Promise.all(
        sortArtworks(list).slice(keep).map((a) => KidsStore.del('artworks', a.id))
      ));
    }).then(() => KidsStore.put('artworks', {
      name: Data.dessert(kind).name, png: dataUrl, w: OUT_W, h: OUT_H, createdAt: Date.now()
    })).then(() => KidsStore.all('artworks')).then((list) => {
      sortArtworks(list).slice(ARTWORK_MAX).forEach((a) => KidsStore.del('artworks', a.id));
    });
  }

  function sortArtworks(list) {
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || (b.id || 0) - (a.id || 0));
  }

  /* ===== 做好了（做甜點的綠色勾勾） =====
     舊版分成「慶祝」和「存圖」兩顆，現在是同一顆：過關音效＋唸一句（有蠟燭唸 Happy birthday）、
     存進「我的作品」、跳完成畫面（她做的甜點是主角）。
     聲音要在這個 click 裡直接出（iOS 規定），不能等圖合成完。 */
  function showDone(src) {
    doneImg.src = src;
    doneOverlay.hidden = false;
    launchConfetti();
  }

  saveBtn.addEventListener('click', () => {
    if (composing || mode !== 'free' || St.isEmpty(cake)) return;
    composing = true;
    const made = cake;
    Sound.win();
    say(St.hasTopping(made, 'candle') ? 'Happy birthday!' : 'Yummy!');
    compose(made).then((dataUrl) => {
      if (mode !== 'free' || cake !== made) return;      // 合成完之前她已經離開或又動了甜點
      showDone(dataUrl);
      return addArtwork(dataUrl, made.kind);
    }, () => {
      // 合成 PNG 失敗：完成畫面照樣出現（直接顯示 SVG），只是這一張沒存進「我的作品」
      if (mode !== 'free' || cake !== made) return;
      showDone('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Draw.scene(made, { cx: CAKE_CX.free, size: [OUT_W, OUT_H] })));
    }).catch(() => { /* 存不進去就算了，不要跳錯誤訊息嚇到小孩 */ })
      .then(() => { composing = false; });
  });

  // 再做一個：同一種甜點、空盤子重新開始（剛剛那個已經存成作品了，按上一步也還拿得回來）
  document.getElementById('againBtn').addEventListener('click', () => {
    Sound.click();
    hideDone();
    commit(St.empty(cake.kind));
  });
  // 綠色：回去選別種甜點（這一種做好的樣子留著，下次進來還在）
  document.getElementById('pickBtn').addEventListener('click', () => {
    Sound.click();
    showDessertPick();
  });

  /* 切到背景／鎖螢幕時再存一次：iOS 常常不會給我們 unload。 */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });

  /* 轉向、視窗大小變了：店面的長寬比跟著變，重畫一次（view 要重算，不然配料會放歪） */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (mode) render();
      else if (!selectScreen.hidden) drawFreeDemo();
    }, 80);
  });

  /* ===== 選玩法、選甜點畫面的圖 =====
     都是真的畫出來的甜點（示意用的狀態寫在 CakeData.DESSERTS 的 demo）。 */
  const demoOf = (d) => Draw.scene(St.deserialize(d.demo, d.id), { view: Draw.DEMO_VIEW });
  /* 「做甜點」卡片上的窗不是 4:3，長寬比還會跟著畫面變：照窗的長寬比把視窗往外擴，
     蛋糕永遠完整地在正中間（背景會跟著畫滿，見 cake-draw.js）。 */
  const freeDemo = document.getElementById('freeDemo');
  function drawFreeDemo() {
    const d = Data.dessert('cake');
    const w = freeDemo.clientWidth;
    const h = freeDemo.clientHeight;
    let vw = 560;
    let vh = 440;
    if (w && h) {
      if (w * vh > h * vw) vw = vh * w / h;
      else vh = vw * h / w;
    }
    freeDemo.innerHTML = Draw.scene(St.deserialize(d.demo, d.id), { view: [400 - vw / 2, 350 - vh / 2, vw, vh].map((n) => Math.round(n)) });
  }
  document.getElementById('orderDemo').innerHTML =
    '<span class="order-icon">' + Draw.iconBase('cake', 'pink') + '</span>'
    + '<span class="order-icon">' + Draw.iconTopping('cherry') + '</span><span class="order-icon">' + Draw.iconTopping('cherry') + '</span>';

  Data.DESSERTS.forEach((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pic-thumb dessert-card';
    b.setAttribute('aria-label', d.name);
    b.innerHTML = '<span class="dessert-pic">' + demoOf(d) + '</span>';
    b.addEventListener('click', () => {
      Sound.click();
      startFree(d.id);
      say(d.word);
    });
    dessertGrid.appendChild(b);
  });

  showSelect();
})();
