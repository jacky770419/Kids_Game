/* 有聲故事書：一頁一個舞台，背景上疊去背的角色紙偶，跟著錄音的時間表動；
   下面是注音字幕，念到哪個字亮到哪個字。

   三份資料：
     STORY_SCRIPT（js/story-script.js，錄音產生）  文字、誰說、每句與每個字的秒數
     StoryData（js/story-data.js，手寫）          注音、角色的圖、每頁分鏡
     音檔 assets/story/audio/<id>-<頁>.mp3

   中英文切換：每個故事兩種語言各錄一份（文字、時間、音檔都分開），分鏡共用——
   分鏡是照「第幾句開始後幾秒」寫的，兩種語言句數一樣，英文那句比較長就照比例拉長。

   沒有自動翻頁：一頁念完右邊的「下一頁」變綠色跳一下，她可以先點角色玩，自己決定什麼時候翻。
   翻頁一定是她按的，所以每頁的 audio.play() 都在手勢裡，iPad 不會擋。

   畫面（新版「浮起來的才能按」，樣式在 css/story.css，共用的在 css/base.css、js/ui.js）：
     舞台、字幕板是平的；按鈕都在左右兩側（回家、換故事、上一頁｜這一頁再聽一次、下一頁）。
     語言不在這一頁切：首頁的大人專區寫 localStorage kidsStoryLang，這裡載入時讀。 */
(() => {
  'use strict';
  const SCRIPT = window.STORY_SCRIPT;
  const Data = window.StoryData;
  const BOOKS = window.STORY_BOOKS || [];   // 新書的書單（js/story-books.js）：書名、封面、要下載的檔
  const Sync = window.BookSync || null;     // 新書背景下載（js/book-sync.js）
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
  const endCover = $('endCover');
  const guideEl = $('guide');
  const guide = (guideEl && guideEl.__uiGuide) || { set() {} };
  const icon = (name) => (window.UI ? window.UI.icon(name) : '');

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
  let shownLine = null;   // …以及它是哪一句的（轉向、改視窗大小時要重排）
  let lastT = 0;          // 畫面目前推進到第幾秒
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
  /* 畫面上給她看的字只有這兩句（按鈕都是圖示）。中文一律注音，寫法見 js/ui.js。 */
  const LINE_PICK = '選ㄒㄩㄢˇ 一ㄧˊ 個˙ㄍㄜ 故ㄍㄨˋ 事ㄕˋ';
  const TEXT = {
    zh: { end: '說ㄕㄨㄛ 完ㄨㄢˊ 了˙ㄌㄜ' },
    en: { end: 'The end' }
  };

  /* 聽完過的故事：選故事畫面右上角給一顆星星。只記故事 id，存不了就算了（星星不影響聽故事）。 */
  const DONE_KEY = 'kidsStoryDone';
  let doneSet = new Set();
  try { doneSet = new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]')); } catch (e) { /* 存檔壞了就當沒聽過 */ }
  const cards = new Map();
  /* 星星用 base.css 的 .badge-star（一個小 span），卡片本身的 class 叫 heard 不叫 done：
     base.css 的 .done 是「完成畫面」（position: fixed 蓋滿整個畫面），卡片掛上 done 會整張變成全螢幕。 */
  function addStar(card) {
    if (!card || card.classList.contains('heard')) return;
    card.classList.add('heard');
    const star = document.createElement('span');
    star.className = 'badge-star';
    star.setAttribute('aria-hidden', 'true');
    card.appendChild(star);
  }
  function markDone(id) {
    doneSet.add(id);
    try { localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(doneSet))); } catch (e) { /* 略過 */ }
    addStar(cards.get(id));
  }

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

  /* 一個字＝國字＋右邊直排的注音，跟全站同一個結構（css/base.css 的 .zy、js/ui.js 的 UI.zy）：
     <span class="zy">那<i>ㄋㄚ<u>ˋ</u></i></span>。二三四聲的調號放注音右側中間，輕聲的 ˙ 留在最上面。 */
  function zyCell(han, z) {
    const el = document.createElement('span');
    el.className = 'zy ch';
    let ph = z;
    let tone = '';
    if ('ˊˇˋ'.indexOf(ph[ph.length - 1]) >= 0) { tone = ph[ph.length - 1]; ph = ph.slice(0, -1); }
    el.appendChild(document.createTextNode(han));
    const col = document.createElement('i');
    col.textContent = ph;
    if (tone) {
      const t = document.createElement('u');
      t.textContent = tone;
      col.appendChild(t);
    }
    el.appendChild(col);
    return el;
  }

  // 把一句切成一段一段顯示（逗號、句號處切，太短的併起來），每段記得第一個字是全句的第幾個字
  const CH_W = 1.6;      // 一個帶注音的字有多寬（標點算 1；只用來比長短，實際放不放得下是量出來的）
  const LINE_CAP = 16;   // 一段最多多少單位（字幕板放得下兩行，一段大約十個字）
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

  // 回傳每一格 { el, i, pu }：i＝這一格的第一個字元在這一段裡是第幾個（亮字時拿去查時間）；pu＝標點
  function renderText(target, text, zy, from) {
    const cells = [];
    for (let i = 0; i < text.length; i++) {
      const z = zy[from + i];
      let cell;
      if (z) cell = zyCell(text[i], z);
      else {
        cell = document.createElement('span');
        cell.className = 'pu';
        cell.textContent = text[i];
      }
      target.appendChild(cell);
      cells.push({ el: cell, i: i, pu: !z });
    }
    return cells;
  }

  /* 英文字幕：一個字一格，念到那個字整個字亮起來。
     分段先照標點切、短的併起來（併到一行的量 EN_CAP 為止）。一段在字幕板上排成一行或兩行（見 showChunk），
     所以沒有標點的長句只要兩行放得下（EN_TWO）就整句一起出來；再長才從最靠近中間的空白對半切。 */
  const EN_CAP = 34;
  const EN_TWO = 58;
  function splitLong(text, from, out) {
    if (text.trim().length <= EN_TWO) { out.push({ text: text, from: from }); return; }
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

  const ONE_LINE_MIN = 0.86;   // 字幕只要縮一點點（到 86%）就放得下，就不為了它多折一行

  /* 一段太長、要排成兩行時從哪裡斷（回傳第二行第一個字元的位置，沒有合適的地方回傳 -1）。
     不能折出孤字：兩行都至少兩個字（英文至少六個字元）。
     中文沒有空白，斷在哪裡要自己挑，每個位置算一個分數，挑最低的：
       標點後面最好（0 分）；詞和詞之間其次（Intl.Segmenter 分的詞，1 分）；詞的中間最差（3 分）；
       角色的名字、輕聲詞、「木頭屋」這種不能拆（再加 6 分）；
       「的、了、裡、邊」這種黏著前面的字不放行首，「在、把、一、很」這種黏著後面的字不放行尾（各加 3 分）；
       比較長的那一行超過 cap（一行放得下的量）要縮字：縮一點點沒關係，要縮很多就罰得很重。 */
  const seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('zh-Hant', { granularity: 'word' }) : null;
  const TAIL = /[的得地了著過們子呢吧嗎啊呀囉喔邊裡上下中不]/;
  const HEAD = /[在把和一好很也都就還小大要沒]/;
  // 新書打開時會補 voices 和 ZY_PHRASES，所以每次開書重算一次
  let KEEP = [];
  function refreshKeep() {
    KEEP = Object.keys(Data.VOICES).concat(Object.keys((staging && staging.voices) || {}))
      .filter((w) => w !== '旁白')
      .concat(Object.keys(Data.ZY_PHRASES), ['稻草屋', '木頭屋', '磚塊屋']);
  }
  refreshKeep();
  // 說話的人：新書可以有自己的 voices（不同本的「小老鼠」是不同角色），沒寫的再查共用表
  const voiceOf = (who) => (staging && staging.voices && staging.voices[who]) || Data.VOICES[who] || null;
  function insideWord(text) {
    const inside = new Set();
    KEEP.forEach((w) => {
      let i = text.indexOf(w);
      while (i >= 0) {
        for (let k = 1; k < w.length; k++) inside.add(i + k);
        i = text.indexOf(w, i + w.length);
      }
    });
    return inside;
  }
  function breakAt(text, en, cap) {
    const size = en ? (t) => t.trim().length : widthOf;
    const body = en ? (t) => t.trim().length >= 6 : (t) => [...t].filter((c) => !PUNCT.test(c)).length >= 2;
    const edges = new Set();
    if (!en && seg) { for (const p of seg.segment(text)) edges.add(p.index); }
    const inside = en ? null : insideWord(text);
    const total = size(text);
    let best = -1;
    let bestCost = Infinity;
    for (let i = 1; i < text.length; i++) {
      const prev = text[i - 1];
      if (en ? prev !== ' ' : PUNCT.test(text[i])) continue;       // 英文只在空白後面斷；中文的標點不放行首
      const a = text.slice(0, i);
      const b = text.slice(i);
      if (!body(a) || !body(b)) continue;
      let pen = 0;
      if (en) {
        // 標點後面最好；不要把 the、to 這種字留在行尾
        pen = /[,.!?…—]\s*$/.test(a) ? 0 : total * (/\b(a|an|the|to|of|and|in|on|at|is)\s*$/i.test(a) ? 0.2 : 0.08);
      }
      else if (!PUNCT.test(prev)) {
        pen = (edges.has(i) ? 1 : 3) + (inside.has(i) ? 6 : 0) + (TAIL.test(text[i]) ? 3 : 0) + (HEAD.test(prev) ? 3 : 0);
      }
      const longer = Math.max(size(a), size(b));
      const cost = Math.max(0, longer - cap) * 0.6 + Math.max(0, longer - cap / ONE_LINE_MIN) * 3 +
        pen + Math.abs(size(a) - total / 2) * 0.1;
      if (cost < bestCost) { bestCost = cost; best = i; }
    }
    return best;
  }

  /* 把字幕縮到剛好放進字幕板：先用原本的字級排，量出來太寬或太高就整段等比例縮小（--k）。
     回傳用了多少倍。字幕不可以超出字幕板，也不可以被切掉。 */
  function fitCaption() {
    const box = captionEl.querySelector('.cap-text');
    const lines = captionEl.querySelector('.cap-lines');
    if (!box || !lines) return 1;
    lines.style.setProperty('--k', '1');
    const need = lines.getBoundingClientRect();
    const room = box.getBoundingClientRect();
    if (!need.width || !need.height || !room.width || !room.height) return 1;
    const k = Math.min(1, room.width / need.width * 0.985, room.height / need.height * 0.985);
    lines.style.setProperty('--k', k.toFixed(3));
    return k;
  }

  // 把一段排進 lines：cut＜0＝一行；否則第二行從第 cut 個字元開始
  function fillLines(lines, ln, chunk, cut) {
    const en = pageLang === 'en';
    const parts = cut > 0 ? [[0, cut], [cut, chunk.text.length]] : [[0, chunk.text.length]];
    const cells = [];
    lines.innerHTML = '';
    parts.forEach(([a, b]) => {
      const row = document.createElement('span');
      row.className = 'cap-line';
      const text = chunk.text.slice(a, b);
      const got = en ? renderWords(row, text) : renderText(row, text, ln.zy, chunk.from + a);
      got.forEach((c) => { c.i += a; cells.push(c); });
      lines.appendChild(row);
    });
    return cells;
  }

  function showChunk(ln, chunk) {
    shownChunk = chunk;
    shownLine = ln;
    captionEl.innerHTML = '';
    const en = pageLang === 'en';
    const voice = voiceOf(ln.who) || {};
    captionEl.style.setProperty('--who', voice.color || '#FFD84D');
    // 誰在說話：圓框裡放那個角色的臉；旁白是一本書（線條圖示）
    const face = document.createElement('span');
    face.className = 'cap-face';
    const sprite = voice.actor && Data.SPRITES[voice.actor];
    if (voice.actor === 'star') face.innerHTML = starSvg();
    else if (sprite) {
      const first = sprite[Object.keys(sprite)[0]];
      face.innerHTML = '<img alt="" draggable="false" src="' + first.src + '">';
    } else {
      face.classList.add('narr');
      face.innerHTML = icon('book');
    }
    captionEl.appendChild(face);
    const box = document.createElement('span');
    box.className = 'cap-text';
    const lines = document.createElement('span');
    lines.className = 'cap-lines' + (en ? ' en' : '');
    box.appendChild(lines);
    captionEl.appendChild(box);

    // 先排成一行；要縮很多才放得下就改成兩行（兩行還是太長才縮字）
    chunk.cells = fillLines(lines, ln, chunk, -1);
    const k1 = fitCaption();
    if (k1 < ONE_LINE_MIN) {
      const size = en ? chunk.text.trim().length : widthOf(chunk.text);
      const cut = breakAt(chunk.text, en, size * k1);
      if (cut > 0) {
        chunk.cells = fillLines(lines, ln, chunk, cut);
        if (fitCaption() < k1) { chunk.cells = fillLines(lines, ln, chunk, -1); fitCaption(); }
      }
    }
  }

  /* 念到哪個字：念過的字是深色（.on），還沒念到的淡一點，正在念的那個字底色變黃（.now）。 */
  function updateCaption(t) {
    let ln = null;
    for (let i = 0; i < page.lines.length; i++) if (t >= page.lines[i].s - 0.05) ln = page.lines[i];
    if (!ln) return null;
    let chunk = ln.chunks[0];
    ln.chunks.forEach((c) => { if (t >= c.s - 0.05) chunk = c; });
    if (chunk !== shownChunk) showChunk(ln, chunk);
    let now = null;
    chunk.cells.forEach((cell) => {
      const at = ln.t[chunk.from + cell.i];
      const on = at !== undefined && t >= at - 0.03;
      cell.el.classList.toggle('on', on);
      if (on && !cell.pu) now = cell;
    });
    const speaking = t < ln.e + 0.12 && !audio.ended;   // 這一句念完（或整頁念完）黃色就收起來
    chunk.cells.forEach((cell) => { cell.el.classList.toggle('now', speaking && cell === now); });
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
    const voice = ln && t < ln.e ? voiceOf(ln.who) : null;
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
    lastT = t;
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
    // 念完了：「下一頁」從白色變綠色、小跳一下（綠色＝可以往下走了；沒念完也能按，只是不提示）
    stNext.classList.add('go', 'ready');
  }

  /* ---------- 翻頁 ---------- */

  /* 算舞台多大（3:2），並把 --u（舞台寬的 1%）設在 <html> 上——舞台裡的東西、字幕板、字幕字級都用它當單位。
     橫向：左右各一排按鈕，舞台在中間、字幕板（高＝舞台寬的 1/4）在舞台下面，兩個一起要放得下。
     直向：舞台整排寬；翻頁鈕在字幕板的左右兩邊，但不能低於畫面高度的 70%（下面是手腕會壓到的地方），
           所以舞台的高度要讓出位置。 */
  const CAP_K = 0.25;
  function layout() {
    const cs = getComputedStyle(playScreen);
    const px = (v) => parseFloat(v) || 0;
    const colGap = px(cs.columnGap);
    const rowGap = px(cs.rowGap);
    const w = playScreen.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight);
    const h = playScreen.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom);
    if (w <= 0 || h <= 0) return;
    const btnH = stPrev.offsetHeight + 8;   // 按鈕＋下面那條底邊
    let sw;
    if (window.matchMedia('(orientation: portrait)').matches) {
      const top = playScreen.getBoundingClientRect().top + px(cs.paddingTop);
      const maxH = Math.min(window.innerHeight * 0.7 - top - rowGap - btnH, h - rowGap - Math.max(btnH, 136));
      sw = Math.min(w, maxH * 1.5);
    } else {
      sw = Math.min(w - 2 * (stPrev.offsetWidth + colGap), (h - rowGap) / (1 / 1.5 + CAP_K));
    }
    sw = Math.floor(Math.max(sw, 240));
    stage.style.width = sw + 'px';
    stage.style.height = Math.floor(sw / 1.5) + 'px';
    document.documentElement.style.setProperty('--u', (sw / 100) + 'px');
    // 字幕板的寬度跟著變了：目前這一段重新排一次
    if (page && shownChunk && shownLine) {
      showChunk(shownLine, shownChunk);
      updateCaption(lastT);
    }
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
    shownLine = null;
    lastT = 0;
    talking = null;
    bgEl.style.backgroundImage = 'url("' + plan.bg + '")';
    setTint(plan.tint);
    buildDecor();
    plan.actors.forEach(makeActor);
    buildWaves();

    cues = (plan.cues || []).map((c) => Object.assign({}, c, { time: cueTime(c) })).sort((a, b) => a.time - b.time);
    cueAt = 0;

    [...dotsEl.children].forEach((d, k) => d.classList.toggle('on', k === i));
    dotsEl.setAttribute('aria-label', '第 ' + (i + 1) + ' 頁，共 ' + story.pages.length + ' 頁');
    stPrev.disabled = i === 0;                 // 第一頁沒有上一頁：灰的、平的
    stNext.classList.remove('go', 'ready');    // 還沒念完：白色
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
      // 被瀏覽器擋下來（沒有手勢）：讓「再聽一次」變黃色跳，按了就會開始
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

  /* 新書第一次打開：把那本的兩個檔叫進來（有下載好就是從快取拿，沒有就走網路）。
     同一本再開就不用再載。 */
  const loading = new Map();
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => { el.remove(); reject(new Error(src)); };
      document.body.appendChild(el);
    });
  }
  function loadBook(id) {
    if (Data.STAGING[id] && Data.BOOK_SCRIPTS[id]) return Promise.resolve();
    if (!loading.has(id)) {
      const p = loadScript('js/books/' + id + '-script.js').then(() => loadScript('js/books/' + id + '.js'));
      p.catch(() => loading.delete(id));   // 失敗了（離線又還沒下載）下次再試
      loading.set(id, p);
    }
    return loading.get(id);
  }

  let opening = '';
  function openStory(id, shot) {
    // 截圖模式可以直接開還沒上架（書單裡還沒有）的新書：調分鏡時用
    const meta = BOOKS.find((b) => b.id === id) || (shot && !SCRIPT.stories.some((s) => s.id === id));
    if (meta && !(Data.STAGING[id] && Data.BOOK_SCRIPTS[id])) {
      if (opening) return Promise.resolve();
      opening = id;
      const card = cards.get(id);
      if (card) card.classList.add('opening');
      return loadBook(id)
        .then(() => { opening = ''; if (card) card.classList.remove('opening'); if (selectScreen.hidden === false || shot) openStory(id, shot); })
        .catch(() => { opening = ''; if (card) { card.classList.remove('opening'); refreshCard(id); } });
    }
    story = SCRIPT.stories.find((s) => s.id === id) || Data.BOOK_SCRIPTS[id];
    staging = Data.STAGING[id];
    if (!story || !staging) return Promise.resolve();
    refreshKeep();
    if (window.Speech) window.Speech.cancel();   // 小熊泡泡還在念就停下來，不要跟故事疊在一起
    selectScreen.hidden = true;
    playScreen.hidden = false;
    backBtn.hidden = false;
    replayBtn.hidden = false;
    endOverlay.hidden = true;
    document.body.classList.add('playing');     // 回家／換故事變成左邊一直排、小熊收起來（css/story.css）
    dotsEl.innerHTML = story.pages.map(() => '<i></i>').join('');
    layout();
    if (shot) return Promise.resolve();
    preload(staging.pages[0]);
    showPage(0);
    return Promise.resolve();
  }

  function showSelect() {
    cancelAnimationFrame(raf);
    raf = 0;
    audio.pause();
    story = null;
    page = null;
    playScreen.hidden = true;
    selectScreen.hidden = false;
    backBtn.hidden = true;
    replayBtn.hidden = true;
    endOverlay.hidden = true;
    document.body.classList.remove('playing');
    guide.set(LINE_PICK);
  }

  // 說完了：封面當主角，記一顆星星
  function showEnd() {
    audio.pause();
    endCover.style.backgroundImage = 'url("' + staging.cover.bg + '")';
    endCover.innerHTML = coverArt(staging.cover);
    markDone(story.id);
    endOverlay.hidden = false;
    if (window.Sound) Sound.win();
  }

  stNext.addEventListener('click', () => {
    click();
    if (pageIdx + 1 < story.pages.length) showPage(pageIdx + 1);
    else showEnd();
  });
  stPrev.addEventListener('click', () => { if (pageIdx > 0) { click(); showPage(pageIdx - 1); } });
  replayBtn.addEventListener('click', () => { click(); showPage(pageIdx); });
  backBtn.addEventListener('click', () => { click(); showSelect(); });
  $('againBtn').addEventListener('click', () => { click(); endOverlay.hidden = true; showPage(0); });
  $('otherBtn').addEventListener('click', () => { click(); showSelect(); });

  // 切到別的 App、螢幕關掉：故事停下來；回來按「再聽一次」從這一頁重聽
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && story) { audio.pause(); replayBtn.classList.add('pulse'); }
  });
  window.addEventListener('resize', () => { if (story) layout(); });
  // 字型（粉圓、Andika）比較晚才載好的話字寬會變：載好了把目前這一段字幕重新量一次，才不會超出字幕板
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', () => { if (story) layout(); });
  }

  /* ---------- 選故事 ---------- */

  /* 截圖模式（調分鏡與 tools/check 用，不是給小孩的）：story.html?shot=bear-hug,2,7.5 或 …,7.5,en
     直接擺出「第 2 頁第 7.5 秒」的畫面，不出聲、不播過場，無頭瀏覽器截圖才截得到固定的一格。 */
  function showShot(spec) {
    const [id, pg, sec, lg] = spec.split(',');
    if (lg === 'en' || lg === 'zh') { lang = lg; applyLang(); }
    openStory(id, true).then(() => {
      if (!story) return;
      instant = true;
      showPage(Math.max(0, (parseInt(pg, 10) || 1) - 1), true);
      done = true;   // 不要因為時間到了就讓「下一頁」變綠色
      step(parseFloat(sec) || 0);
      document.body.dataset.shot = 'ready';   // 無頭瀏覽器截圖等這個
    });
  }

  // 封面：那本故事的背景＋主角（公主那本手上多一顆小星星）。選故事的卡片和「說完了」共用
  // cover＝分鏡裡的 { bg, actor, pose, star }，或新書書單裡的 { bg, hero（圖的路徑） }
  function coverArt(cover) {
    const src = cover.hero || Data.SPRITES[cover.actor][cover.pose].src;
    return '<span class="cover-hero"><img alt="" draggable="false" src="' + src + '">' +
      (cover.star ? '<span class="cover-star a-art tw-star s-bright">' + starSvg() + '</span>' : '') + '</span>';
  }

  /* 卡片＝浮起來的白色大按鈕（base.css 的 .pic-thumb）：上面封面、下面書名（中文是注音，英文是英文）。
     聽完過的右上角有一顆星星。 */
  const titles = [];
  const shelf = SCRIPT.stories.filter((s) => Data.STAGING[s.id])
    .map((s) => ({ id: s.id, title: s.title, cover: Data.STAGING[s.id].cover }))
    .concat(BOOKS.map((b) => ({ id: b.id, title: b.title, cover: b.cover, zy: b.zy, book: true })));
  shelf.forEach((s) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'pic-thumb story-card';
    const pic = document.createElement('span');
    pic.className = 'story-cover';
    pic.style.backgroundImage = 'url("' + s.cover.bg + '")';
    pic.innerHTML = coverArt(s.cover);
    const title = document.createElement('span');
    title.className = 'story-title';
    titles.push({ el: title, story: s, card: card });
    card.appendChild(pic);
    card.appendChild(title);
    if (doneSet.has(s.id)) addStar(card);
    card.addEventListener('click', () => {
      // 新書還沒下載好、又沒網路：打不開，卡片搖一下就好
      if (card.classList.contains('pending')) { pop(); card.classList.remove('nope'); void card.offsetWidth; card.classList.add('nope'); return; }
      click();
      openStory(s.id);
    });
    cards.set(s.id, card);
    storyRow.appendChild(card);
    if (s.book) refreshCard(s.id);
  });

  /* 新書的卡片：有網路就能開（邊播邊下載）；沒網路時要整本都下載好才能開，還沒好的變灰、角落一個下載箭頭。 */
  function refreshCard(id) {
    const card = cards.get(id);
    if (!card) return;
    const ok = navigator.onLine !== false || (Sync && Sync.isReady(id));
    card.classList.toggle('pending', !ok);
    if (!ok && !card.querySelector('.badge-dl')) {
      const b = document.createElement('span');
      b.className = 'badge-dl';
      b.setAttribute('aria-hidden', 'true');
      b.innerHTML = icon('download');
      card.appendChild(b);
    }
  }
  const refreshCards = () => BOOKS.forEach((b) => refreshCard(b.id));
  window.addEventListener('online', refreshCards);
  window.addEventListener('offline', refreshCards);
  window.addEventListener('book-sync', refreshCards);

  /* 語言：在首頁的大人專區切換（js/home.js 寫 localStorage kidsStoryLang），這一頁只讀。
     這裡把書名和「說完了」那句換成目前的語言。 */
  function applyLang() {
    titles.forEach((t) => {
      const en = lang === 'en' && t.story.title.en;
      t.el.innerHTML = '';
      t.el.classList.toggle('en', !!en);
      if (en) t.el.textContent = t.story.title.en;
      // 新書的書名注音寫在書單裡（那本的注音表要打開才會載入）
      else renderText(t.el, t.story.title.zh, t.story.zy || zhuyinOf(t.story.title.zh), 0);
      t.card.setAttribute('aria-label', en ? t.story.title.en : t.story.title.zh);
    });
    const endTitle = $('endTitle');
    endTitle.classList.toggle('en', lang === 'en');
    if (lang === 'en') endTitle.textContent = TEXT.en.end;
    else if (window.UI) endTitle.innerHTML = window.UI.zy(TEXT.zh.end);
  }
  applyLang();

  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) showShot(shot);
})();
