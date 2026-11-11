/* 有聲故事書：一頁一個舞台，背景上疊去背的角色紙偶，跟著錄音的時間表動；
   下面是注音字幕，念到哪個字亮到哪個字。

   三份資料：
     STORY_SCRIPT（js/story-script.js，錄音產生）  文字、誰說、每句與每個字的秒數
     StoryData（js/story-data.js，手寫）          注音、角色的圖、每頁分鏡
     音檔 assets/story/audio/<id>-<頁>.mp3

   中英文切換：每個故事兩種語言各錄一份（文字、時間、音檔都分開），分鏡共用——
   分鏡是照「第幾句開始後幾秒」寫的，兩種語言句數一樣，英文那句比較長就照比例拉長。

   沒有自動翻頁：一頁念完右邊的 ▶ 會跳，她可以先點角色玩，自己決定什麼時候翻。
   翻頁一定是她按的，所以每頁的 audio.play() 都在手勢裡，iPad 不會擋。 */
(() => {
  'use strict';
  const SCRIPT = window.STORY_SCRIPT;
  const Data = window.StoryData;
  const $ = (id) => document.getElementById(id);

  const selectScreen = $('storySelect');
  const playScreen = $('playScreen');
  const storyRow = $('storyRow');
  const stage = $('stage');
  const bgEl = $('bg');
  const tintEl = $('tint');
  const decorEl = $('decor');
  const actorsEl = $('actors');
  const fxEl = $('stFx');
  const captionEl = $('caption');
  const dotsEl = $('dots');
  const backBtn = $('backBtn');
  const replayBtn = $('replayBtn');
  const stPrev = $('stPrev');
  const stNext = $('stNext');
  const endOverlay = $('endOverlay');
  const langBtn = $('langBtn');

  const audio = new Audio();
  audio.preload = 'auto';

  let story = null;       // STORY_SCRIPT 的一筆
  let staging = null;     // StoryData.STAGING 對應的一筆
  let pageIdx = 0;
  let page = null;        // 目前這頁、目前語言的 { audio, dur, lines }
  let refPage = null;     // 同一頁的中文版：分鏡的秒數是照中文錄音調的，別的語言照它換算
  let plan = null;        // 目前這頁的分鏡
  let cues = [];          // 這頁的分鏡，算好絕對秒數、依時間排序
  let cueAt = 0;          // 下一筆還沒觸發的分鏡
  let raf = 0;
  let shownChunk = null;  // 字幕目前顯示的那一段
  let talking = null;     // 正在說話的角色元素
  let done = false;       // 這一頁念完了
  let pageLang = 'zh';    // 這一頁實際播的語言（選了英文但這個故事沒錄英文時是 zh）
  let instant = false;    // 截圖模式：動作一步到位，不播過場
  const actors = new Map();

  /* 語言：存在裝置上（跟音樂、唸英文開關同一套做法）。某個故事還沒錄英文就退回中文。 */
  const LANG_KEY = 'kidsStoryLang';
  let lang = 'zh';
  try { if (localStorage.getItem(LANG_KEY) === 'en') lang = 'en'; } catch (e) { /* 讀不到就用中文 */ }
  const pageOf = (s, i) => s.pages[i][lang] || s.pages[i].zh;
  const langOf = (s, i) => (s.pages[i][lang] ? lang : 'zh');
  const TEXT = {
    zh: { end: '🌙 說完了！', again: '🔁 再聽一次', other: '📚 換一個故事' },
    en: { end: '🌙 The End!', again: '🔁 Again', other: '📚 More stories' }
  };

  const click = () => { if (window.Sound) Sound.click(); };
  const pop = () => { if (window.Sound) Sound.pop(); };

  /* ---------- 注音字幕 ---------- */

  // 一句話 → 每個字的注音（標點是 null）。整詞的讀音優先，其餘一字一查
  function zhuyinOf(text) {
    const out = new Array(text.length).fill(undefined);
    Object.keys(Data.ZY_PHRASES).forEach((w) => {
      let i = text.indexOf(w);
      while (i >= 0) {
        Data.ZY_PHRASES[w].forEach((z, k) => { out[i + k] = z; });
        i = text.indexOf(w, i + w.length);
      }
    });
    for (let i = 0; i < text.length; i++) {
      if (out[i] === undefined) out[i] = Data.ZY[text[i]] || null;
    }
    return out;
  }

  // 「˙ㄉㄜ」「ㄒㄧㄥˊ」拆成：輕聲的點、符號、聲調
  function zyNode(z) {
    const el = document.createElement('span');
    el.className = 'zy';
    let s = z;
    if (s[0] === '˙') { el.classList.add('light'); s = s.slice(1); }
    let tone = '';
    if ('ˊˇˋ'.indexOf(s[s.length - 1]) >= 0) { tone = s[s.length - 1]; s = s.slice(0, -1); }
    const col = document.createElement('span');
    col.className = 'zy-col n' + s.length;
    col.textContent = s;
    el.appendChild(col);
    if (tone) {
      const t = document.createElement('span');
      t.className = 'zy-tone';
      t.textContent = tone;
      el.appendChild(t);
    }
    return el;
  }

  // 把一句切成一段一段顯示（逗號、句號處切，太短的併起來），每段記得第一個字是全句的第幾個字
  const CH_W = 1.6;      // 一個帶注音的字有多寬（以字高為單位，跟 story.css 的 .zy 寬度對應）
  const LINE_CAP = 16;   // 字幕一行放得下多少單位
  const PUNCT = /[，。！？、…—]/;
  const widthOf = (t) => [...t].reduce((n, c) => n + (PUNCT.test(c) ? 1 : CH_W), 0);
  function chunksOf(text) {
    const parts = text.match(/[^，。！？、…—]+[，。！？、…—]*/g) || [text];
    const out = [];
    let pos = 0;
    let cur = null;
    parts.forEach((p) => {
      if (cur && widthOf(cur.text + p) <= LINE_CAP) cur.text += p;
      else { cur = { text: p, from: pos }; out.push(cur); }
      pos += p.length;
    });
    return out;
  }

  // 回傳每一格 { el, i }：i＝這一格的第一個字元在這一段裡是第幾個（亮字時拿去查時間）
  function renderText(target, text, zy, from) {
    const cells = [];
    for (let i = 0; i < text.length; i++) {
      const z = zy[from + i];
      const cell = document.createElement('span');
      if (z) {
        cell.className = 'ch';
        const hz = document.createElement('span');
        hz.className = 'hz';
        hz.textContent = text[i];
        cell.appendChild(hz);
        cell.appendChild(zyNode(z));
      } else {
        cell.className = 'pu';
        cell.textContent = text[i];
      }
      target.appendChild(cell);
      cells.push({ el: cell, i: i });
    }
    return cells;
  }

  /* 英文字幕：一個字一格，念到那個字整個字亮起來。
     分段先照標點切、短的併起來；沒有標點的長句（例如 52 個字元的一整句）從最靠近中間的空白對半切，
     不然整行要縮到六成才塞得下。稍微超過一點（兩成以內）就整行縮小，不切。 */
  const EN_CAP = 34;
  function splitLong(text, from, out) {
    if (text.length <= EN_CAP * 1.2) { out.push({ text: text, from: from }); return; }
    const mid = text.length / 2;
    let cut = -1;
    for (let i = 1; i < text.length - 1; i++) {
      if (text[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
    }
    if (cut < 0) { out.push({ text: text, from: from }); return; }
    splitLong(text.slice(0, cut + 1), from, out);
    splitLong(text.slice(cut + 1), from + cut + 1, out);
  }
  function chunksOfEn(text) {
    const parts = text.match(/[^,.!?…—]+[,.!?…—]*\s*/g) || [text];
    const merged = [];
    let pos = 0;
    let cur = null;
    parts.forEach((p) => {
      if (cur && (cur.text + p).trim().length <= EN_CAP) cur.text += p;
      else { cur = { text: p, from: pos }; merged.push(cur); }
      pos += p.length;
    });
    const out = [];
    merged.forEach((c) => splitLong(c.text, c.from, out));
    return out;
  }

  function renderWords(target, text) {
    const cells = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) {
      const w = document.createElement('span');
      w.className = 'wd';
      w.textContent = m[0];
      target.appendChild(w);
      cells.push({ el: w, i: m.index });
    }
    return cells;
  }

  function prepareLines() {
    const en = pageLang === 'en';
    page.lines.forEach((ln) => {
      if (ln.chunks) return;
      if (!en) ln.zy = zhuyinOf(ln.text);
      ln.chunks = en ? chunksOfEn(ln.text) : chunksOf(ln.text);
      ln.chunks.forEach((c) => { c.s = ln.t[c.from] !== undefined ? ln.t[c.from] : ln.s; });
      ln.chunks[0].s = ln.s;
    });
  }

  function showChunk(ln, chunk) {
    shownChunk = chunk;
    captionEl.innerHTML = '';
    const voice = Data.VOICES[ln.who] || {};
    captionEl.style.setProperty('--who', voice.color || '#fff');
    const face = document.createElement('span');
    face.className = 'cap-face';
    const sprite = voice.actor && Data.SPRITES[voice.actor];
    if (voice.actor === 'star') face.innerHTML = starSvg();
    else if (sprite) {
      const first = sprite[Object.keys(sprite)[0]];
      face.innerHTML = '<img alt="" draggable="false" src="' + first.src + '">';
    } else face.textContent = '📖';
    captionEl.appendChild(face);
    const line = document.createElement('span');
    // 沒有標點可切的長句整段縮小一點，永遠只有一行，舞台才不會被字幕擠得忽大忽小
    if (pageLang === 'en') {
      line.className = 'cap-line en';
      line.style.setProperty('--k', Math.min(1, EN_CAP / chunk.text.trim().length).toFixed(3));
      chunk.cells = renderWords(line, chunk.text);
    } else {
      line.className = 'cap-line';
      line.style.setProperty('--k', Math.min(1, LINE_CAP / widthOf(chunk.text)).toFixed(3));
      chunk.cells = renderText(line, chunk.text, ln.zy, chunk.from);
    }
    captionEl.appendChild(line);
  }

  function updateCaption(t) {
    let ln = null;
    for (let i = 0; i < page.lines.length; i++) if (t >= page.lines[i].s - 0.05) ln = page.lines[i];
    if (!ln) return null;
    let chunk = ln.chunks[0];
    ln.chunks.forEach((c) => { if (t >= c.s - 0.05) chunk = c; });
    if (chunk !== shownChunk) showChunk(ln, chunk);
    chunk.cells.forEach((cell) => {
      const at = ln.t[chunk.from + cell.i];
      cell.el.classList.toggle('on', at !== undefined && t >= at - 0.03);
    });
    return ln;
  }

  /* ---------- 角色 ---------- */

  function starSvg() {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path class="star-body" d="M50 6 L62 36 L94 38 L69 59 L78 91 L50 73 L22 91 L31 59 L6 38 L38 36 Z" stroke-linejoin="round"/>' +
      '<g class="star-face"><ellipse class="eye" cx="40" cy="50" rx="4" ry="5.5"/><ellipse class="eye" cx="60" cy="50" rx="4" ry="5.5"/>' +
      '<path class="mouth happy" d="M43 62 Q50 68 57 62" fill="none" stroke-linecap="round"/>' +
      '<path class="mouth sad" d="M44 66 Q50 61 56 66" fill="none" stroke-linecap="round"/>' +
      '<circle class="blush" cx="33" cy="59" r="4"/><circle class="blush" cx="67" cy="59" r="4"/></g></svg>';
  }

  function setPose(a, pose) {
    const def = Data.SPRITES[a.id][pose];
    if (!def) return;
    a.pose = pose;
    if (def.svg) {
      a.art.className = 'a-art tw-star s-' + pose;
      return;
    }
    a.img.src = def.src;
    a.img.style.height = ((def.k || 1) * 100) + '%';
    a.faceLeft = !!def.left;
    applyFlip(a);
  }

  // flip＝要不要跟這張圖原本的方向相反
  function applyFlip(a) {
    a.art.style.transform = a.flip ? 'scaleX(-1)' : '';
  }

  function place(a, o, dur) {
    a.el.style.setProperty('--dur', (instant ? 0 : dur || 0) + 's');
    if (o.x !== undefined) a.el.style.left = o.x + '%';
    // 站得愈下面的愈靠前；小星星例外，永遠在最上層（捧在手心、舉高時不能被公主擋住）
    if (o.y !== undefined) { a.el.style.top = o.y + '%'; a.el.style.zIndex = String(a.id === 'star' ? 2000 : Math.round(o.y * 10)); }
    if (o.h !== undefined) a.el.style.height = o.h + '%';
  }

  function oneShot(a, name) {
    if (instant) return;
    a.anim.classList.remove('do-' + a.shot);
    void a.anim.offsetWidth;   // 同一個動作連做兩次也要重新播
    a.shot = name;
    a.anim.classList.add('do-' + name);
  }

  function makeActor(def) {
    const el = document.createElement('div');
    el.className = 'actor';
    const loop = document.createElement('div');
    loop.className = 'a-loop';
    const anim = document.createElement('div');
    anim.className = 'a-anim';
    const art = document.createElement('div');
    art.className = 'a-art';
    const a = { id: def.id, el, loop, anim, art, img: null, flip: !!def.flip, shot: '', moveTimer: 0 };
    if (def.id === 'star') art.innerHTML = starSvg();
    else {
      a.img = document.createElement('img');
      a.img.alt = '';
      a.img.draggable = false;
      art.appendChild(a.img);
    }
    anim.appendChild(art);
    loop.appendChild(anim);
    el.appendChild(loop);
    anim.addEventListener('animationend', () => { anim.classList.remove('do-' + a.shot); });
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); tapActor(a); });
    setPose(a, def.pose);
    place(a, def, 0);
    if (def.loop) loop.classList.add('loop-' + def.loop);
    if (def.hidden) el.classList.add('gone');
    actorsEl.appendChild(el);
    actors.set(def.id, a);
    return a;
  }

  // 點角色：跳一下、冒愛心（小星星冒星光、鯨魚噴水）。隨時都能點，不打斷故事
  function tapActor(a) {
    pop();
    const tap = (Data.TAPS && Data.TAPS[a.id]) || ['hop', 'hearts'];
    oneShot(a, tap[0]);
    fxAt(tap[1], null, null, a);
  }

  /* ---------- 特效 ---------- */

  const HEART = '<svg viewBox="0 0 32 30"><path d="M16 27 C4 18 2 12 2 8.5 C2 4.5 5 2 8.5 2 C11.5 2 14 3.6 16 6.5 C18 3.6 20.5 2 23.5 2 C27 2 30 4.5 30 8.5 C30 12 28 18 16 27 Z" fill="#FF6B8B" stroke="#2b2b2b" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  const NOTE = '<svg viewBox="0 0 30 34"><path d="M11 6 L25 3 L25 22 A5 4.4 0 1 1 21.6 18 L21.6 9 L14.4 10.6 L14.4 25 A5 4.4 0 1 1 11 21 Z" fill="#fff" stroke="#2b2b2b" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  const SPARK = '<svg viewBox="0 0 30 30"><path d="M15 2 L18.5 11.5 L28 15 L18.5 18.5 L15 28 L11.5 18.5 L2 15 L11.5 11.5 Z" fill="#FFE98A" stroke="#2b2b2b" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  const DROP = '<svg viewBox="0 0 22 30"><path d="M11 2 C16 11 20 15 20 20 A9 9 0 0 1 2 20 C2 15 6 11 11 2 Z" fill="#9BDCFF" stroke="#2b2b2b" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  const PUFF = '<svg viewBox="0 0 40 26"><path d="M10 22 A7 7 0 0 1 9 8 A8 8 0 0 1 24 5 A7 7 0 0 1 34 13 A5 5 0 0 1 32 22 Z" fill="#fff" stroke="#2b2b2b" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  const ZED = '<svg viewBox="0 0 26 26"><path d="M5 5 H21 L8 20 H21" fill="none" stroke="#2b2b2b" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 5 H21 L8 20 H21" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const FX = {
    puff: { svg: PUFF, n: 5, spread: 7, rise: 24, size: 6.5, wind: true },
    zzz: { svg: ZED, n: 3, spread: 3, rise: 16, size: 4, slow: true },
    hearts: { svg: HEART, n: 5, spread: 9, rise: 20, size: 5.2 },
    notes: { svg: NOTE, n: 3, spread: 8, rise: 18, size: 5 },
    sparkle: { svg: SPARK, n: 7, spread: 14, rise: 8, size: 4.4, burst: true },
    spout: { svg: DROP, n: 7, spread: 9, rise: 22, size: 3.6, fall: true }
  };

  // 位置：給 x、y（舞台百分比），或給角色（取頭頂）
  function fxAt(kind, x, y, a) {
    const f = FX[kind];
    if (!f) return;
    if (a) {
      const sr = stage.getBoundingClientRect();
      const r = a.art.getBoundingClientRect();
      if (!sr.width || !r.width) return;
      x = ((r.left + r.width / 2) - sr.left) / sr.width * 100;
      y = (r.top - sr.top) / sr.height * 100 + (kind === 'spout' ? 4 : 8);
      if (f.wind) { x = (r.right - sr.left) / sr.width * 100; y += 14; }
    }
    for (let i = 0; i < f.n; i++) {
      const p = document.createElement('span');
      p.className = 'fx-p' + (f.burst ? ' burst' : '') + (f.fall ? ' fall' : '');
      p.innerHTML = f.svg;
      const ang = Math.random() * Math.PI * 2;
      // wind＝往右吹（大野狼吹氣、兔子起跑的風），其他往上飄或往四周散
      let dx = f.burst ? Math.cos(ang) * f.spread : (Math.random() - 0.5) * 2 * f.spread;
      let dy = f.burst ? Math.sin(ang) * f.spread : -(f.rise * (0.6 + Math.random() * 0.6));
      if (f.wind) { dx = f.rise * (0.7 + Math.random() * 0.6); dy = (Math.random() - 0.5) * 2 * f.spread; }
      if (f.slow) { dx = (i + 1) * f.spread * 0.8; dy = -(i + 1) * f.rise / f.n; }
      p.style.left = x + '%';
      p.style.top = y + '%';
      p.style.width = (f.size * (0.75 + Math.random() * 0.5)) + '%';
      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);
      p.style.animationDelay = (i * (f.slow ? 0.45 : 0.09)) + 's';
      p.addEventListener('animationend', () => p.remove());
      fxEl.appendChild(p);
    }
  }

  /* ---------- 背景上的裝飾：星星、海浪、色調 ---------- */

  function setTint(name) {
    stage.dataset.tint = name || 'day';
  }

  let starEls = [];
  function buildDecor() {
    decorEl.innerHTML = '';
    starEls = [];
    if (plan.stars) {
      const [x0, y0, x1, y1] = plan.stars;
      // 固定的亂數：同一頁每次看到的星星位置都一樣
      let seed = 7 + pageIdx * 13;
      const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      const n = Math.round((x1 - x0) * (y1 - y0) / 110) + 6;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'sky-star' + (plan.starsLate ? ' off' : '');
        s.style.left = (x0 + rnd() * (x1 - x0)) + '%';
        s.style.top = (y0 + rnd() * (y1 - y0)) + '%';
        s.style.width = (0.7 + rnd() * 0.9) + '%';
        s.style.animationDelay = (-rnd() * 3) + 's';
        decorEl.appendChild(s);
        starEls.push(s);
      }
    }
  }

  // 海浪要蓋住鯨魚的下半身、又要在岸上的角色後面，所以放在角色層、用位置當 z-index
  function buildWaves() {
    if (!plan.waves) return;
    const w = document.createElement('div');
    w.className = 'waves';
    w.style.top = plan.waves + '%';
    w.style.zIndex = String(Math.round(plan.waves * 10) + 60);
    actorsEl.appendChild(w);
  }

  // 「一顆、兩顆、三顆」：星星一顆一顆亮
  function lightStars(n) {
    starEls.forEach((s, i) => { if (i < n) s.classList.remove('off'); });
  }

  /* ---------- 分鏡 ---------- */

  function fire(c) {
    if (c.tint) setTint(c.tint);
    if (c.stars) lightStars(c.stars);
    const a = c.id ? actors.get(c.id) : null;
    if (c.fx) { fxAt(c.fx, c.x, c.y, c.x === undefined ? a : null); return; }
    if (!a) return;
    if (c.flip !== undefined) { a.flip = !!c.flip; applyFlip(a); }
    if (c.pose) setPose(a, c.pose);
    if (c.glow) setPose(a, c.glow);
    if (c.show) a.el.classList.remove('gone');
    if (c.hide) a.el.classList.add('gone');
    if (c.loop) {
      a.loop.className = 'a-loop' + (c.loop === 'none' ? '' : ' loop-' + c.loop);
    }
    if (c.x !== undefined || c.y !== undefined || c.h !== undefined) {
      const dur = c.dur || 0.6;
      place(a, c, dur);
      if (!instant) {
        a.el.classList.add('moving');
        clearTimeout(a.moveTimer);
        a.moveTimer = setTimeout(() => a.el.classList.remove('moving'), dur * 1000);
      }
    }
    if (c.anim) oneShot(a, c.anim);
  }

  function setTalking(ln, t) {
    const voice = ln && t < ln.e ? Data.VOICES[ln.who] : null;
    const a = voice && voice.actor ? actors.get(voice.actor) : null;
    const el = a ? a.el : null;
    if (el === talking) return;
    if (talking) talking.classList.remove('talking');
    if (el) el.classList.add('talking');
    talking = el;
  }

  // 把畫面推進到第 t 秒：該觸發的分鏡、字幕、誰在說話。重複呼叫沒有副作用
  function step(t) {
    if (!page) return;
    while (cueAt < cues.length && cues[cueAt].time <= t) fire(cues[cueAt++]);
    setTalking(updateCaption(t), t);
    if (!done && (audio.ended || t >= page.dur - 0.02)) pageDone();
  }

  /* 兩個來源一起推：requestAnimationFrame（順）與 audio 的 timeupdate（一秒約四次）。
     只靠 rAF 的話，分頁被瀏覽器節流（切到背景、省電模式）時角色會整個不動；
     timeupdate 跟著聲音走，節流時動作會頓但不會漏。 */
  function tick() {
    raf = 0;
    step(audio.currentTime);
    if (!audio.paused && !done) raf = requestAnimationFrame(tick);
  }
  audio.addEventListener('timeupdate', () => { if (story) step(audio.currentTime); });

  function pageDone() {
    done = true;
    while (cueAt < cues.length) fire(cues[cueAt++]);
    setTalking(null, 0);
    stNext.classList.add('pulse');
  }

  /* ---------- 翻頁 ---------- */

  function layout() {
    const wrap = $('stageWrap');
    const cs = getComputedStyle(wrap);
    const gap = parseFloat(cs.columnGap) || 0;
    // 左右各一顆翻頁鈕＋間距＋內距，再留 14px 給舞台和按鈕的硬陰影
    const w = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      - 2 * (stPrev.offsetWidth + gap) - 14;
    // 高度：整個畫面扣掉字幕（最高 101px）與它上下的間距；舞台＋字幕一起在畫面中間，
    // 直放時字幕才會貼著舞台，不會掉到螢幕最下面
    const h = playScreen.clientHeight - 101 - 32 - 12;
    if (w <= 0 || h <= 0) return;
    const sw = Math.floor(Math.min(w, h * 1.5));
    stage.style.width = sw + 'px';
    stage.style.height = Math.floor(sw / 1.5) + 'px';
    document.documentElement.style.setProperty('--u', (sw / 100) + 'px');
  }

  /* 分鏡的 at 是照中文錄音調的「這一句開始後幾秒」。別的語言同一句長度不同，
     照兩邊那一句的長度比例換算（夾在 0.6～2.5 倍之間），動作才會落在同樣的字上。 */
  function cueTime(c) {
    const at = c.at || 0;
    if (c.l === undefined) return at * (page === refPage ? 1 : clampRatio(page.dur / refPage.dur));
    const ln = page.lines[c.l];
    const ref = refPage.lines[c.l];
    const k = page === refPage ? 1 : clampRatio((ln.e - ln.s) / Math.max(0.2, ref.e - ref.s));
    return ln.s + at * k;
  }
  const clampRatio = (k) => Math.max(0.6, Math.min(2.5, k));

  function showPage(i, silent) {
    cancelAnimationFrame(raf);
    raf = 0;
    audio.pause();
    done = false;
    pageIdx = i;
    page = pageOf(story, i);
    pageLang = langOf(story, i);
    refPage = story.pages[i].zh;
    plan = staging.pages[i];
    prepareLines();

    actors.forEach((a) => clearTimeout(a.moveTimer));
    actors.clear();
    actorsEl.innerHTML = '';
    fxEl.innerHTML = '';
    captionEl.innerHTML = '';
    shownChunk = null;
    talking = null;
    bgEl.style.backgroundImage = 'url("' + plan.bg + '")';
    setTint(plan.tint);
    buildDecor();
    plan.actors.forEach(makeActor);
    buildWaves();

    cues = (plan.cues || []).map((c) => Object.assign({}, c, { time: cueTime(c) })).sort((a, b) => a.time - b.time);
    cueAt = 0;

    [...dotsEl.children].forEach((d, k) => d.classList.toggle('on', k === i));
    stPrev.classList.toggle('dim', i === 0);
    stNext.classList.remove('pulse');
    stage.classList.remove('turn');
    if (silent) return;
    void stage.offsetWidth;
    stage.classList.add('turn');

    audio.src = page.audio;
    play();
    // 先把下一頁的音檔與圖叫進快取，翻頁才不會等
    if (story.pages[i + 1]) { fetch(pageOf(story, i + 1).audio).catch(() => {}); preload(staging.pages[i + 1]); }
  }

  function play() {
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      // 被瀏覽器擋下來（沒有手勢）：讓 🔁 跳，按了就會開始
      p.catch(() => replayBtn.classList.add('pulse'));
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  audio.addEventListener('playing', () => {
    replayBtn.classList.remove('pulse');
    if (!raf) raf = requestAnimationFrame(tick);
  });
  audio.addEventListener('ended', () => step(page ? page.dur : 0));

  function preload(pl) {
    if (!pl) return;
    const srcs = [pl.bg];
    const add = (id, pose) => {
      const d = Data.SPRITES[id] && Data.SPRITES[id][pose];
      if (d && d.src) srcs.push(d.src);
    };
    pl.actors.forEach((a) => add(a.id, a.pose));
    (pl.cues || []).forEach((c) => { if (c.id && c.pose) add(c.id, c.pose); });
    srcs.forEach((s) => { const im = new Image(); im.src = s; });
  }

  function openStory(id, shot) {
    story = SCRIPT.stories.find((s) => s.id === id);
    staging = Data.STAGING[id];
    if (!story || !staging) return;
    selectScreen.hidden = true;
    playScreen.hidden = false;
    backBtn.hidden = false;
    replayBtn.hidden = false;
    endOverlay.hidden = true;
    dotsEl.innerHTML = story.pages.map(() => '<i></i>').join('');
    dotsEl.hidden = false;
    layout();
    if (shot) return;
    preload(staging.pages[0]);
    showPage(0);
  }

  function showSelect() {
    cancelAnimationFrame(raf);
    raf = 0;
    audio.pause();
    story = null;
    playScreen.hidden = true;
    selectScreen.hidden = false;
    backBtn.hidden = true;
    replayBtn.hidden = true;
    dotsEl.hidden = true;
    endOverlay.hidden = true;
  }

  stNext.addEventListener('click', () => {
    click();
    if (pageIdx + 1 < story.pages.length) showPage(pageIdx + 1);
    else { audio.pause(); endOverlay.hidden = false; if (window.Sound) Sound.win(); }
  });
  stPrev.addEventListener('click', () => { if (pageIdx > 0) { click(); showPage(pageIdx - 1); } });
  replayBtn.addEventListener('click', () => { click(); showPage(pageIdx); });
  backBtn.addEventListener('click', () => { click(); showSelect(); });
  $('againBtn').addEventListener('click', () => { click(); endOverlay.hidden = true; showPage(0); });
  $('otherBtn').addEventListener('click', () => { click(); showSelect(); });

  // 切到別的 App、螢幕關掉：故事停下來；回來按 🔁 從這一頁重聽
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && story) { audio.pause(); replayBtn.classList.add('pulse'); }
  });
  window.addEventListener('resize', () => { if (story) layout(); });

  /* ---------- 選故事 ---------- */

  /* 截圖模式（調分鏡與 tools/check 用，不是給小孩的）：story.html?shot=bear-hug,2,7.5 或 …,7.5,en
     直接擺出「第 2 頁第 7.5 秒」的畫面，不出聲、不播過場，無頭瀏覽器截圖才截得到固定的一格。 */
  function showShot(spec) {
    const [id, pg, sec, lg] = spec.split(',');
    if (lg === 'en' || lg === 'zh') { lang = lg; applyLang(); }
    openStory(id, true);
    if (!story) return;
    instant = true;
    showPage(Math.max(0, (parseInt(pg, 10) || 1) - 1), true);
    done = true;   // 不要因為時間到了就讓 ▶ 跳
    step(parseFloat(sec) || 0);
  }

  const titles = [];
  SCRIPT.stories.forEach((s, i) => {
    const st = Data.STAGING[s.id];
    if (!st) return;
    const card = document.createElement('button');
    card.className = 'story-card';
    card.style.setProperty('--rot', (i % 2 ? 2 : -2) + 'deg');
    card.style.setProperty('--card', st.color);
    const pic = document.createElement('span');
    pic.className = 'story-cover';
    pic.style.backgroundImage = 'url("' + st.cover.bg + '")';
    const hero = Data.SPRITES[st.cover.actor][st.cover.pose];
    pic.innerHTML = '<img alt="" draggable="false" src="' + hero.src + '">' +
      (st.cover.star ? '<span class="cover-star a-art tw-star s-bright">' + starSvg() + '</span>' : '');
    const title = document.createElement('span');
    title.className = 'story-title';
    titles.push({ el: title, story: s });
    card.appendChild(pic);
    card.appendChild(title);
    card.addEventListener('click', () => { click(); openStory(s.id); });
    storyRow.appendChild(card);
  });

  /* 語言鈕：「中｜EN」兩格，亮的那格是現在的語言。選故事和聽故事時都能按；
     聽到一半按＝這一頁用另一種語言從頭念（按鈕本身就是手勢，iPad 不會擋播放）。 */
  function applyLang() {
    [...langBtn.children].forEach((sp) => sp.classList.toggle('on', sp.dataset.l === lang));
    titles.forEach((t) => {
      const en = lang === 'en' && t.story.title.en;
      t.el.innerHTML = '';
      t.el.classList.toggle('en', !!en);
      if (en) t.el.textContent = t.story.title.en;
      else renderText(t.el, t.story.title.zh, zhuyinOf(t.story.title.zh), 0);
    });
    const tx = TEXT[lang];
    $('endTitle').textContent = tx.end;
    $('againBtn').textContent = tx.again;
    $('otherBtn').textContent = tx.other;
  }
  langBtn.addEventListener('click', () => {
    click();
    lang = lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* 存不了就只影響這一次 */ }
    applyLang();
    if (story && endOverlay.hidden) showPage(pageIdx);
  });
  applyLang();

  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) showShot(shot);
})();
