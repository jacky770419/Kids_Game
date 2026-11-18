/* 動動腦——邏輯小遊戲的外殼（window.Logic）。

   一間「小屋」＝一本邏輯故事的謎題。這支只管每間小屋都一樣的事：
     選小屋 → 進小關 → 小熊念題目 → 過關／下一關，還有拖曳、提示次數、進度、彩帶。
   每間小屋自己一支檔（js/logic-<id>.js），用 Logic.addHouse() 掛進來，畫面只畫在 #lgStage 裡。

   為什麼這樣設計（都來自 31 本邏輯故事的試讀報告）：
   * 五歲小聽眾卡住多半是「記不住」而不是「想不通」，所以要用到的東西一直擺在畫面上，
     題目隨時可以點小熊再聽一次。
   * 沒有計時、沒有扣分、沒有失敗畫面。答錯只會演出後果、退回去，再給多一點提示。
   * 她不識字、看注音：題目一律用念的，泡泡裡是國字＋注音（英文模式是英文）。

   念題目只有一個出口：speak()。有錄音檔就播錄音（js/logic-audio.js 列出已經錄好的檔），
   沒有就退回系統語音——錄音還沒好之前照樣能玩，錄好只要重新產生那份清單。
   語言在首頁大人專區選（localStorage kidsLogicLang）：zh 中文／en 英文／both 中文念完接英文。 */
(() => {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const $ = (id) => document.getElementById(id);
  const houses = [];
  const LINES = {};                 // id → { zh, en }
  const ZY_X = {};                  // 故事書注音表沒有的字
  const ZYP_X = {};                 // 這裡才有的詞（破音字、輕聲）

  /* ---------- 設定與進度 ---------- */

  const LANG_KEY = 'kidsLogicLang';
  const SAVE_KEY = 'kidsLogic';
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* 存不了只影響這一次 */ } };

  function lang() {
    const q = new URLSearchParams(location.search).get('lang');
    const v = q || get(LANG_KEY);
    return (v === 'en' || v === 'both') ? v : 'zh';
  }

  /* 進度：{ 小屋id: { done: 過了幾關 } } */
  function loadSave() {
    try {
      const s = JSON.parse(get(SAVE_KEY) || '{}');
      return (s && typeof s === 'object') ? s : {};
    } catch (e) { return {}; }
  }
  let save = loadSave();
  function houseSave(id) {
    if (!save[id] || typeof save[id] !== 'object') save[id] = { done: 0 };
    return save[id];
  }
  function persist() { set(SAVE_KEY, JSON.stringify(save)); }

  /* ---------- 注音 ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* 一句話 → 每個字的注音（標點是 null）。整詞的讀音優先（長的詞蓋過短的），其餘一字一查。
     注音表用故事書那一份（教育部讀音，全站只有一份），這裡只補它沒有的。 */
  function zhuyinOf(text) {
    const D = window.StoryData || { ZY: {}, ZY_PHRASES: {} };
    const out = new Array(text.length).fill(undefined);
    const phrases = Object.assign({}, D.ZY_PHRASES, ZYP_X);
    Object.keys(phrases).sort((a, b) => a.length - b.length).forEach((w) => {
      let i = text.indexOf(w);
      while (i >= 0) {
        phrases[w].forEach((z, k) => { out[i + k] = z; });
        i = text.indexOf(w, i + w.length);
      }
    });
    for (let i = 0; i < text.length; i++) {
      if (out[i] === undefined) out[i] = ZY_X[text[i]] || D.ZY[text[i]] || null;
    }
    return out;
  }

  const TONES = 'ˊˇˋ';
  function zyHtml(text) {
    const z = zhuyinOf(text);
    return Array.from({ length: text.length }, (_, i) => {
      const han = text[i];
      let ph = z[i];
      if (!ph) return '<span class="zy-plain">' + esc(han) + '</span>';
      let tone = '';
      if (TONES.indexOf(ph.slice(-1)) >= 0) { tone = ph.slice(-1); ph = ph.slice(0, -1); }
      return '<span class="zy">' + esc(han) + '<i>' + esc(ph) + (tone ? '<u>' + tone + '</u>' : '') + '</i></span>';
    }).join('');
  }

  /* 泡泡裡要放的字：中文是注音、英文是一般字 */
  function lineHtml(id, which) {
    const l = LINES[id];
    if (!l) return '';
    if (which === 'en') return '<span class="lg-en">' + esc(l.en || '') + '</span>';
    return zyHtml(l.zh || '');
  }

  /* ---------- 念題目：唯一的出口 ---------- */

  const audioHave = new Set(Array.isArray(window.LogicAudio) ? window.LogicAudio : []);
  const audioPath = (id, l) => 'assets/logic/audio/' + l + '/' + id + '.mp3';
  let player = null;                // 整頁共用一個 <audio>：iOS 要在手勢裡先碰過它，之後才能自己播
  let speakToken = 0;

  function unlockAudio() {
    if (player) return;
    player = new Audio();
    player.preload = 'auto';
    try {
      // 一小段無聲的 wav：在第一次觸控時播一下，之後這個元素換 src 就能直接出聲
      player.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
      const p = player.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* 沒聲音也能玩 */ }
  }
  document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

  function stopSpeech() {
    speakToken++;
    try { if (player) { player.pause(); } } catch (e) { /* 略過 */ }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* 略過 */ }
  }

  /* 念一種語言的一句；念完（或念不出來）就 resolve */
  function speakOne(id, l, token) {
    return new Promise((resolve) => {
      const line = LINES[id];
      const text = line && line[l];
      if (!text || token !== speakToken) return resolve();
      let finished = false;
      const done = () => { if (!finished) { finished = true; resolve(); } };
      const file = audioPath(id, l);
      if (audioHave.has(file)) {
        if (!player) player = new Audio();
        player.onended = done;
        player.onerror = done;
        player.src = file;
        const p = player.play();
        if (p && p.catch) p.catch(done);
        setTimeout(done, 15000);
        return;
      }
      // 還沒錄音：系統語音頂著
      try {
        const s = window.speechSynthesis;
        if (!s || typeof SpeechSynthesisUtterance !== 'function') return done();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = l === 'en' ? 'en-US' : 'zh-TW';
        u.rate = 0.9;
        u.onend = done;
        u.onerror = done;
        s.speak(u);
        setTimeout(done, 1200 + text.length * (l === 'en' ? 110 : 420));
      } catch (e) { done(); }
    });
  }

  /* 念一句（both 模式是中文接英文）。新的一句會蓋掉還沒念完的舊句。 */
  function speak(id) {
    stopSpeech();
    const token = speakToken;
    const order = lang() === 'both' ? ['zh', 'en'] : [lang()];
    let chain = Promise.resolve();
    order.forEach((l) => { chain = chain.then(() => speakOne(id, l, token)); });
    return chain.then(() => token === speakToken);   // true＝完整念完，沒有被打斷
  }

  /* ---------- 小熊泡泡 ---------- */

  let bubbleTxt = null, bubbleBtn = null;
  let promptId = '';                // 現在這一關的題目（點小熊重聽的是它）
  let shownId = '';

  function buildGuide() {
    const host = $('lgGuide');
    host.innerHTML =
      '<img class="guide-bear" src="assets/story/chars/bear-point.png" alt="">' +
      '<button type="button" class="bubble" aria-label="再聽一次">' +
      '<span class="bubble-txt"></span><span class="bubble-say">' + UI.icon('speaker') + '</span></button>';
    bubbleTxt = host.querySelector('.bubble-txt');
    bubbleBtn = host.querySelector('.bubble');
    bubbleBtn.addEventListener('click', () => {
      if (!promptId) return;
      show(promptId);
      speak(promptId);
    });
  }

  function show(id) {
    shownId = id;
    const l = lang();
    bubbleTxt.innerHTML = lineHtml(id, l === 'en' ? 'en' : 'zh');
    bubbleBtn.classList.toggle('lg-long', bubbleTxt.textContent.length > (l === 'en' ? 34 : 15));
    bubbleBtn.classList.remove('talk');
    void bubbleBtn.offsetWidth;
    bubbleBtn.classList.add('talk');
  }

  /* 出題：泡泡停在這一句，點小熊重聽的也是這一句。before 是要先念的句子（開場用）。 */
  function ask(id, before) {
    promptId = id;
    const seq = (before || []).concat([id]);
    let i = 0;
    const next = () => {
      show(seq[i]);
      return speak(seq[i]).then((ok) => {
        if (!ok) { if (shownId !== promptId && seq.indexOf(shownId) >= 0) show(promptId); return; }
        i++;
        if (i < seq.length) return next();
      });
    };
    return next();
  }

  /* 說一句旁白（提示、答對答錯的反應）：念完泡泡回到題目 */
  function say(id) {
    show(id);
    return speak(id).then((ok) => {
      if (ok && promptId && shownId === id) show(promptId);
      return ok;
    });
  }

  /* ---------- 小音效 ---------- */

  let actx = null;
  function tone(freq, dur, type, vol) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t0 = actx.currentTime;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type || 'triangle';
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol || 0.16, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + (dur || 0.2));
      o.connect(g).connect(actx.destination);
      o.start(t0);
      o.stop(t0 + (dur || 0.2) + 0.05);
    } catch (e) { /* 沒聲音也能玩 */ }
  }
  function sfx(name) {
    if (name === 'no') { tone(220, 0.16, 'sine', 0.14); return; }   // 答錯：低低軟軟的一聲，不嚇人
    if (window.Sound && typeof Sound[name] === 'function') Sound[name]();
  }

  /* ---------- 彩帶 ---------- */

  function confetti() {
    const canvas = $('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#FF5C5C', '#FFD84D', '#22C3B6', '#9A7BF5', '#FFA228', '#4AA8EE', '#FF7FB0'];
    const parts = [];
    for (let i = 0; i < 110; i++) {
      parts.push({
        x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.5,
        w: 8 + Math.random() * 8, h: 6 + Math.random() * 6,
        vy: 2 + Math.random() * 3.5, vx: (Math.random() - 0.5) * 2,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    const start = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (t - start < 3000) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })(start);
  }

  /* ---------- 拖曳 ----------
     el 用 transform 跟著手指走（所以 el 自己不要另外用 transform 排版）。
     opts.zones()  回傳可以放的地方 [{ el, ... }]；命中範圍比看到的大一圈，遷就小手指
     opts.onDrop(zone|null, el)  回傳 true＝收下（位置由小屋自己擺），其他＝滑回原位
     opts.onTap(el)  沒拖就放開＝點一下
     opts.onStart(el)  開始拖 */
  function drag(el, opts) {
    const o = opts || {};
    let id = null, sx = 0, sy = 0, moved = false;
    el.classList.add('lg-draggable');
    el.addEventListener('pointerdown', (e) => {
      if (id !== null || (typeof e.button === 'number' && e.button > 0)) return;
      if (el.classList.contains('lg-locked')) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
      try { el.setPointerCapture(id); } catch (err) { /* 略過 */ }
      el.style.transition = 'none';
      e.preventDefault();
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 10) return;
      if (!moved) {
        moved = true;
        el.classList.add('lg-drag');
        if (o.onStart) o.onStart(el);
      }
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.08)';
    });
    const finish = (e, cancelled) => {
      if (e.pointerId !== id) return;
      id = null;
      const wasMoved = moved;
      moved = false;
      el.classList.remove('lg-drag');
      if (!wasMoved) {
        el.style.transition = '';
        if (!cancelled && o.onTap) o.onTap(el);
        return;
      }
      let hit = null;
      if (!cancelled && o.zones) {
        const r0 = el.getBoundingClientRect();
        const cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
        // 命中範圍預設往外多算 28px；緊鄰別的東西的 zone 可以自己給 pad（例如 0）
        const inside = (z, x, y) => {
          const r = z.el.getBoundingClientRect();
          const pad = typeof z.pad === 'number' ? z.pad : 28;
          return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
        };
        const zones = o.zones() || [];
        // 先看手指的位置，再看東西的中心（小孩常抓著邊邊拖）
        hit = zones.find((z) => inside(z, e.clientX, e.clientY)) ||
              zones.find((z) => inside(z, cx, cy)) || null;
      }
      const taken = !cancelled && o.onDrop ? o.onDrop(hit, el) === true : false;
      if (taken) {
        el.style.transition = 'none';
        el.style.transform = '';
        void el.offsetWidth;
        el.style.transition = '';
      } else {
        el.style.transition = 'transform .28s cubic-bezier(.3,1.4,.5,1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 300);
      }
    };
    el.addEventListener('pointerup', (e) => finish(e, false));
    el.addEventListener('pointercancel', (e) => finish(e, true));
  }

  /* ---------- 畫面切換 ---------- */

  let cur = null;                   // { house, level, timers, misses, ctl }
  /* 這次打開網頁已經念過開場的小屋。不存起來：每次打開、第一次進那間小屋都會再念一次開場
     （「今天你是公主」「你來當偵探」是讓她知道自己是主角的話，只在第一天聽到一次太可惜）。 */
  const introSaid = new Set();

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  /* 重新觸發一段 CSS 動畫（.lg-shake 搖頭、.lg-pop 跳一下、.lg-nod 點頭） */
  function anim(node, cls) {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    const off = () => { node.classList.remove(cls); node.removeEventListener('animationend', off); };
    node.addEventListener('animationend', off);
  }

  function leaveLevel() {
    stopSpeech();
    if (!cur) return;
    cur.timers.forEach((t) => clearTimeout(t));
    if (cur.ctl && typeof cur.ctl.destroy === 'function') { try { cur.ctl.destroy(); } catch (e) { /* 略過 */ } }
    cur = null;
    $('lgStage').innerHTML = '';
    $('lgStage').className = 'lg-stage';
    $('lgWin').hidden = true;
  }

  function makeApi(h, level) {
    const mine = cur;
    const alive = () => cur === mine;
    return {
      level: level,
      house: h.id,
      lang: lang,
      el: el,
      anim: anim,
      sfx: sfx,
      tone: tone,
      drag: drag,
      zy: zyHtml,
      text: (id) => lineHtml(id, lang() === 'en' ? 'en' : 'zh'),
      /* 出題。opts.before 是出題前要先念的句子（例如剛找到的線索）；第一次進這間小屋會再往前加開場 */
      ask: (id, opts) => {
        if (!alive()) return Promise.resolve();
        let before = (opts && opts.before) || [];
        if (!introSaid.has(h.id) && h.intro && h.intro.length) { before = h.intro.concat(before); introSaid.add(h.id); }
        return ask(id, before);
      },
      say: (id) => (alive() ? say(id) : Promise.resolve(false)),
      /* 計時器：離開這一關就全部取消，免得動畫演到一半才跳出來 */
      after: (ms, fn) => {
        const t = setTimeout(() => { if (alive()) fn(); }, ms);
        mine.timers.push(t);
        return t;
      },
      /* 記一次答錯，回傳這個 key 一共錯了幾次（小屋照次數給越來越多的提示） */
      miss: (key) => {
        const k = key || '_';
        mine.misses[k] = (mine.misses[k] || 0) + 1;
        sfx('no');
        return mine.misses[k];
      },
      win: (opts) => { if (alive()) win(h, level, opts || {}); }
    };
  }

  function openLevel(h, level) {
    leaveLevel();
    $('lgSelect').hidden = true;
    $('lgLevels').hidden = true;
    $('lgPlay').hidden = false;
    $('backBtn').hidden = false;
    document.body.dataset.house = h.id;
    cur = { house: h, level: level, timers: [], misses: {}, ctl: null };
    promptId = '';
    drawDots(h, level);
    const stage = $('lgStage');
    stage.classList.add('lg-' + h.id);
    cur.ctl = h.mount(stage, makeApi(h, level), level) || null;
    UI.hydrate(stage);
  }

  /* 積木疊：第 i 關疊 i+1 塊（越高越難），最後一關（換她出題）是一支筆。選關磚和右邊的小圓點用同一套。
     她常玩積木，「疊越高越難」比數字好懂（她還不太會用數字比大小）。 */
  const BLOCK_COLORS = ['#FF7FB0', '#4AA8EE', '#FFC83D', '#9A7BF5', '#22C3B6'];
  function levelArt(h, i) {
    if (i === h.levels - 1) return '<span class="lg-lv-pen">' + UI.icon('pencil') + '</span>';
    let s = '';
    for (let k = 0; k <= i; k++) s += '<b style="background:' + BLOCK_COLORS[k % BLOCK_COLORS.length] + '"></b>';
    return '<span class="lg-lv-stack">' + s + '</span>';
  }

  /* 右邊的小關圓點：每一關都能點（想換簡單一點、難一點都可以）；玩過的有綠勾、現在這關框起來 */
  function drawDots(h, level) {
    const box = $('lgDots');
    box.innerHTML = '';
    const done = houseSave(h.id).done;
    for (let i = 0; i < h.levels; i++) {
      const b = el('button', 'lg-dot' + (i === level ? ' now' : '') + (i < done ? ' ok' : ''));
      b.type = 'button';
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 關');
      b.innerHTML = levelArt(h, i) + (i < done ? '<i class="lg-lv-ok">' + UI.icon('check') + '</i>' : '');
      if (i !== level) b.addEventListener('click', () => { sfx('click'); openLevel(h, i); });
      box.appendChild(b);
    }
  }

  /* 選關：點小屋先到這裡，一關一塊大磚。下一關（還沒玩過的第一關）會發光，玩完全部就都不發光、隨她挑。 */
  function showLevels(h) {
    leaveLevel();
    document.body.dataset.house = h.id;
    $('lgSelect').hidden = true;
    $('lgPlay').hidden = true;
    $('lgLevels').hidden = false;
    $('backBtn').hidden = false;
    const grid = $('lgLevelGrid');
    grid.innerHTML = '';
    grid.style.setProperty('--n', h.levels);
    const done = houseSave(h.id).done;
    for (let i = 0; i < h.levels; i++) {
      const b = el('button', 'lg-lv' + (i < done ? ' ok' : '') + (i === done ? ' next' : '') + (i === h.levels - 1 ? ' pen' : ''));
      b.type = 'button';
      b.dataset.level = i;
      b.setAttribute('aria-label', i === h.levels - 1 ? '換你出題' : '第 ' + (i + 1) + ' 關');
      b.innerHTML = levelArt(h, i) + (i < done ? '<i class="lg-lv-ok">' + UI.icon('check') + '</i>' : '');
      b.addEventListener('click', () => { sfx('click'); openLevel(h, i); });
      grid.appendChild(b);
    }
    promptId = 'sys.level';
    show('sys.level');
    speak('sys.level');
  }

  const PRAISE = ['sys.good1', 'sys.good2', 'sys.good3'];
  function win(h, level, opts) {
    const hs = houseSave(h.id);
    if (level + 1 > hs.done) { hs.done = Math.min(h.levels, level + 1); persist(); }
    drawDots(h, level);
    sfx('win');
    confetti();
    promptId = '';
    const praise = opts.line || PRAISE[Math.floor(Math.random() * PRAISE.length)];
    show(praise);
    const mine = cur;
    /* 過關面板等「話念完」和「動畫演完（delay）」兩個都到了才出來。
       以前只等固定秒數：錄音比預估長、或選「都念」（中文念完還要接英文）時，面板先跳出來，
       她一按下一關，話就被切斷了。念不出聲（被擋、檔案壞掉）speak 也會結束，最多再等 15 秒保底。 */
    let said = false, waited = false, shown = false;
    const reveal = () => {
      if (cur !== mine || !said || !waited || shown) return;
      shown = true;
      const last = level + 1 >= h.levels;
      $('lgNext').hidden = last;
      $('lgHouses').classList.toggle('go', last);
      $('lgWin').hidden = false;
    };
    speak(praise).then(() => { said = true; reveal(); });
    mine.timers.push(setTimeout(() => { waited = true; reveal(); }, opts.delay === undefined ? 1300 : opts.delay));
    mine.timers.push(setTimeout(() => { said = true; waited = true; reveal(); }, 15000));
  }

  function showSelect() {
    leaveLevel();
    delete document.body.dataset.house;
    $('lgPlay').hidden = true;
    $('lgLevels').hidden = true;
    $('lgSelect').hidden = false;
    $('backBtn').hidden = true;
    const grid = $('lgGrid');
    grid.innerHTML = '';
    houses.forEach((h) => {
      const done = houseSave(h.id).done;
      const card = el('button', 'lg-card');
      card.type = 'button';
      card.dataset.house = h.id;
      card.setAttribute('aria-label', (LINES[h.name] || {}).zh || h.id);
      const pic = el('span', 'lg-card-pic');
      if (typeof h.card === 'function') h.card(pic); else pic.innerHTML = h.card || '';
      const name = el('span', 'lg-card-name', zyHtml((LINES[h.name] || {}).zh || ''));
      let stars = '';
      for (let i = 0; i < h.levels; i++) stars += '<b class="' + (i < done ? 'on' : '') + '"></b>';
      card.appendChild(pic);
      card.appendChild(name);
      card.appendChild(el('span', 'lg-card-stars', stars));
      card.addEventListener('click', () => { sfx('click'); showLevels(h); });
      grid.appendChild(card);
    });
    promptId = 'sys.pick';
    show('sys.pick');
  }

  /* ---------- 開機 ---------- */


  function boot() {
    buildGuide();
    // 上一層：玩的時候回選關，選關回選小屋
    $('backBtn').addEventListener('click', () => {
      sfx('click');
      if (cur) showLevels(cur.house); else showSelect();
    });
    $('lgAgain').addEventListener('click', () => { sfx('click'); if (cur) openLevel(cur.house, cur.level); });
    $('lgNext').addEventListener('click', () => { sfx('click'); if (cur) openLevel(cur.house, cur.level + 1); });
    $('lgHouses').addEventListener('click', () => { sfx('click'); if (cur) showLevels(cur.house); else showSelect(); });
    const q = new URLSearchParams(location.search);
    // 測試用：logic.html?h=tidy&l=2 直接開那間小屋的第 3 小關
    const h = houses.find((x) => x.id === q.get('h'));
    if (h) {
      introSaid.add(h.id);
      openLevel(h, Math.max(0, Math.min(h.levels - 1, parseInt(q.get('l') || '0', 10) || 0)));
    } else {
      showSelect();
    }
  }

  window.Logic = {
    /* def: { id, name: 台詞id, levels: 小關數, intro: [台詞id…]（第一次進來先念）,
              card(el)：畫選單上那張卡的圖, mount(stage, api, level)：畫這一關，回傳 { destroy() } 可省略 } */
    addHouse: (def) => { houses.push(def); },
    /* 台詞：{ 'tidy.ask1': { zh: '把玩具放進籃子。', en: 'Put the toys in the baskets.' } } */
    lines: (map) => { Object.assign(LINES, map); },
    /* 補注音：chars 是故事書注音表沒有的字，phrases 是整詞的讀音（破音字、輕聲） */
    zy: (def) => { Object.assign(ZY_X, (def && def.chars) || {}); Object.assign(ZYP_X, (def && def.phrases) || {}); },
    _lines: LINES, _zy: ZY_X, _zyp: ZYP_X, _houses: houses, _zhuyinOf: zhuyinOf
  };

  /* 故事書注音表沒有、而好幾間小屋都會用到的字（教育部讀音）。只有一間用到的，寫在那間小屋自己的檔裡。 */
  window.Logic.zy({
    chars: {
      '具': 'ㄐㄩˋ', '圖': 'ㄊㄨˊ', '分': 'ㄈㄣ', '題': 'ㄊㄧˊ', '同': 'ㄊㄨㄥˊ', '顏': 'ㄧㄢˊ',
      '布': 'ㄅㄨˋ', '汽': 'ㄑㄧˋ', '黃': 'ㄏㄨㄤˊ', '鴨': 'ㄧㄚ', '喇': 'ㄌㄚˇ', '叭': '˙ㄅㄚ', '粉': 'ㄈㄣˇ', '積': 'ㄐㄧ'
    },
    phrases: {
      '滿地': ['ㄇㄢˇ', 'ㄉㄧˋ'],       // 注音表的「地」是「慢慢地」的輕聲
      '看看': ['ㄎㄢˋ', '˙ㄎㄢ'],       // 「猜猜看、試試看」的「看」不受影響
      '哎呀': ['ㄞ', 'ㄧㄚ']            // 注音表的「呀」是句尾的輕聲
    }
  });

  /* 外殼自己的台詞 */
  window.Logic.lines({
    'sys.pick': { zh: '今天玩哪一個？', en: 'Which one do you want to play today?' },
    'sys.level': { zh: '選一關。積木越高，越難喔！', en: 'Pick a level. The taller the blocks, the harder it gets!' },
    'sys.good1': { zh: '哇，你好棒！', en: 'Wow, great job!' },
    'sys.good2': { zh: '你想到了！', en: 'You figured it out!' },
    'sys.good3': { zh: '你做到了，好厲害！', en: 'You did it! Way to go!' }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);       // 等後面的小屋檔都載完
})();
