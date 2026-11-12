/* 英文單字遊戲：配對 + 翻牌記憶。
   資料在 assets/data/words.json，進度存在 localStorage（key: kidsWords）。
   沒有計時、沒有分數、沒有失敗畫面——答錯就再試一次。

   新版畫面（css/base.css＋css/words.css）：浮起來的才能按。
   大小寫（lower）和只聽不看字（listenOnly）兩個開關搬到首頁的大人專區了（js/home.js 直接改
   kidsWords 這包存檔），這一頁只在載入時讀，不再有按鈕。 */
(() => {
  const SAVE_KEY = 'kidsWords';
  const ROUND = 8;          // 配對一輪幾題
  const CHOICES = 3;        // 每題幾個選項

  const selectScreen = document.getElementById('selectScreen');
  const gameScreen = document.getElementById('gameScreen');
  const matchArea = document.getElementById('matchArea');
  const memoryArea = document.getElementById('memoryArea');
  const memoryGrid = document.getElementById('memoryGrid');
  const choicesBox = document.getElementById('choices');
  const wordCard = document.querySelector('#matchArea .word-card');
  const wordText = document.getElementById('wordText');
  const wordZh = document.getElementById('wordZh');
  const progress = document.getElementById('progress');
  const winOverlay = document.getElementById('winOverlay');
  const winPics = document.getElementById('winPics');
  const dataError = document.getElementById('dataError');
  const matchResume = document.getElementById('matchResume');
  const memoryResume = document.getElementById('memoryResume');
  const wordTextCol = document.querySelector('#matchArea .word-text-col');
  const backBtn = document.getElementById('backBtn');

  /* 小熊泡泡的台詞（注音寫法見 js/ui.js）。一 照課本標變調：一ㄧˋ 聽、一ㄧˊ 樣。 */
  const guideEl = document.getElementById('guide');
  const guide = (guideEl && guideEl.__uiGuide) || { set() {} };
  const LINE_PICK = '要ㄧㄠˋ 玩ㄨㄢˊ 哪ㄋㄚˇ 個˙ㄍㄜ';
  const LINE_MATCH = '聽ㄊㄧㄥ 一ㄧˋ 聽ㄊㄧㄥ ， 找ㄓㄠˇ 出ㄔㄨ 來ㄌㄞˊ';
  const LINE_MEMORY = '翻ㄈㄢ 翻ㄈㄢ 看ㄎㄢˋ ， 找ㄓㄠˇ 一ㄧˊ 樣ㄧㄤˋ 的˙ㄉㄜ';
  let memoryLineSaid = false;

  const STAR = '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/>';

  let WORDS = [];           // 全部單字
  const byId = {};          // id → 單字
  let mode = null;          // 'match' | 'memory'
  // choices／lower／listenOnly 是可調的三個顯示設定，跟進度一起存
  let save = { match: null, memory: null, pairs: 3, choices: CHOICES, lower: true, listenOnly: false };
  let locked = false;       // 判定期間鎖住點擊
  let flipped = [];         // 翻牌模式目前翻開、還沒判定的卡
  let seq = 0;              // 換畫面就加一：還在等的 setTimeout 回來時發現序號變了就不做事
  let lastRound = [];       // 剛玩完那一輪的單字 id（完成畫面要拿來拼圖）

  /* ---------- 小工具 ---------- */

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* ---------- 進度存檔 ---------- */

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          // 舊存檔沒有 choices／lower／listenOnly，一律補上預設值（不要讓舊存檔把畫面弄成空白）
          save = {
            match: s.match || null,
            memory: s.memory || null,
            pairs: s.pairs || 3,
            choices: (s.choices === 3 || s.choices === 4) ? s.choices : CHOICES,
            lower: typeof s.lower === 'boolean' ? s.lower : true,
            listenOnly: s.listenOnly === true
          };
        }
      }
    } catch (e) { /* 存檔壞了就當作沒有 */ }
  }

  function writeSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* 存不了就算了 */ }
  }

  /* ---------- 發音 ---------- */

  // 有錄音就播錄音，否則用系統語音合成；兩者都沒有就安靜略過。
  // iOS 規定出聲要在使用者手勢裡，被擋下來時不要吵。
  function speak(item, force) {
    if (!item) return;
    try {
      if (item.audio) {
        const a = new Audio(item.audio);
        const p = a.play();
        if (p && typeof p.catch === 'function') p.catch(() => speakTTS(item, force));
        return;
      }
    } catch (e) { /* 落到 TTS */ }
    speakTTS(item, force);
  }

  // force＝使用者親手按喇叭，就算家長把「唸英文」關掉也要唸
  function speakTTS(item, force) {
    // 有共用的 Speech（js/speech.js）就交給它——它會挑一顆英文母語音，
    // 免得裝置設成中文時把 bear 唸成中文腔。沒載到才退回這裡的土法。
    if (window.Speech) { Speech.say(item.word.toLowerCase(), force ? { force: true } : undefined); return; }
    try {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance !== 'function') return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(item.word.toLowerCase());
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 沒有語音就安靜 */ }
  }

  /* ---------- 顯示設定 ---------- */

  // 字卡上要顯示的字面。DWE 教材以小寫為主，但大寫也要能切——
  // 家裡教材用哪種字形是量測過才知道的，所以做成開關（在大人專區）而不是寫死。
  function wordFace(item) {
    return save.lower ? item.word.toLowerCase() : item.word.toUpperCase();
  }

  // Andika 粗體一個字母大約多寬（em）：大寫比小寫寬（25 個字實量：小寫最寬 panda 0.61、大寫 WATERMELON 0.72）。
  // CSS 用它照字數縮字級，長字才不會爆版。
  function charW() { return save.lower ? 0.62 : 0.75; }

  // 中文提示：國字＋直排注音（全站同一個寫法）。資料裡 zh 和 bpmf 是分開的兩欄，
  // 字數對得上就一字配一組注音；對不上就只顯示注音（她認注音、不識國字）。
  function zhHtml(item) {
    const chars = Array.from(item.zh || '');
    const ph = String(item.bpmf || '').trim().split(/\s+/).filter(Boolean);
    if (window.UI && chars.length && chars.length === ph.length) {
      return UI.zy(chars.map((c, i) => c + ph[i]).join(' '));
    }
    return esc(item.bpmf || item.zh || '');
  }

  // 「幾張圖選一張」那排按鈕跟存檔同步
  function syncChoiceBtns() {
    document.querySelectorAll('#choicesRow .diff-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.choices, 10) === save.choices);
    });
  }

  // 門上示意圖裡的字也跟著大小寫設定
  function paintDemoWords() {
    document.querySelectorAll('.demo-word').forEach(el => {
      el.textContent = save.lower ? 'duck' : 'DUCK';
    });
  }

  // 配對的字卡：字面、字數（給 CSS 算字級）、注音、只聽不看字
  function paintWord(item) {
    const face = wordFace(item);
    wordText.textContent = face;
    wordText.style.setProperty('--len', String(Math.max(face.length, 3)));
    wordText.style.setProperty('--cwf', String(charW()));
    // 中文提示用注音：使用者五歲、幾乎不識漢字但認得注音符號
    wordZh.innerHTML = zhHtml(item);
    // 只聽不看字：把整欄文字藏起來，只留喇叭。進題照樣自動唸（見 renderQuestion 的 speak）
    wordTextCol.hidden = !!save.listenOnly;
    wordCard.classList.toggle('listen', !!save.listenOnly);
  }

  /* ---------- 進度星星 ---------- */

  // total 顆裡亮 on 顆；pop＝剛亮起來的那一顆（跳一下）
  function renderStars(total, on, pop) {
    let html = '';
    for (let i = 0; i < total; i++) {
      html += '<svg viewBox="0 0 24 24" aria-hidden="true" class="' +
        (i < on ? 'on' : '') + (i === pop ? ' pop' : '') + '">' + STAR + '</svg>';
    }
    progress.innerHTML = html;
    // 橫向：超過四顆就排兩列（上面那一列還要放小熊泡泡）；直向：一列排完（css/words.css）
    progress.style.setProperty('--n', String(total));
    progress.style.setProperty('--half', String(total > 4 ? Math.ceil(total / 2) : total));
    progress.setAttribute('aria-label', total + ' 個裡完成了 ' + on + ' 個');
  }

  /* ---------- 畫面切換 ---------- */

  function showSelect() {
    seq++;
    mode = null;
    document.body.classList.remove('playing');
    gameScreen.hidden = true;
    selectScreen.hidden = false;
    winOverlay.hidden = true;
    backBtn.hidden = true;
    progress.hidden = true;
    guide.set(LINE_PICK);
    refreshResumeBadges();
  }

  function showGame() {
    document.body.classList.add('playing');   // 直向時上面排成兩列（css/words.css）
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    winOverlay.hidden = true;
    backBtn.hidden = false;
    progress.hidden = false;
  }

  function refreshResumeBadges() {
    matchResume.hidden = !(save.match && save.match.idx < ROUND);
    memoryResume.hidden = !(save.memory && save.memory.matched.length < save.memory.pairs);
  }

  /* ---------- 配對模式 ---------- */

  function newMatchRound() {
    // 每輪開始時才鎖定選項數
    const nChoices = (save.choices === 4) ? 4 : 3;
    const queue = shuffle(WORDS).slice(0, ROUND).map(w => w.id);
    const choices = queue.map(id => {
      const me = byId[id];
      const sameTag = WORDS.filter(w => w.id !== id && w.tags[0] === me.tags[0]);
      const others = WORDS.filter(w => w.id !== id && w.tags[0] !== me.tags[0]);
      // 干擾項先從同類挑，同類不夠再補其他類
      const pool = shuffle(sameTag).concat(shuffle(others));
      return shuffle([id].concat(pool.slice(0, nChoices - 1).map(w => w.id)));
    });
    save.match = { queue: queue, idx: 0, choices: choices };
    writeSave();
  }

  function startMatch(resume) {
    seq++;
    mode = 'match';
    if (!resume || !save.match || save.match.idx >= ROUND) newMatchRound();
    matchArea.hidden = false;
    memoryArea.hidden = true;
    showGame();
    // 這裡小熊不自動唸：進題會唸英文單字，兩個聲音會互相蓋掉。想聽說明就點泡泡。
    guide.set(LINE_MATCH);
    renderMatchProgress(-1);
    renderQuestion();
  }

  function renderMatchProgress(pop) {
    renderStars(ROUND, save.match ? save.match.idx : ROUND, pop);
  }

  function currentItem() {
    if (!save.match) return null;
    return byId[save.match.queue[save.match.idx]];
  }

  function renderQuestion() {
    const item = currentItem();
    if (!item) return;
    paintWord(item);
    choicesBox.innerHTML = '';
    choicesBox.classList.remove('answered');
    // 四個選項時卡片要縮小才塞得下（直向排成兩排），交給 CSS 的 #choices.four 規則
    choicesBox.classList.toggle('four', save.match.choices[save.match.idx].length >= 4);
    save.match.choices[save.match.idx].forEach(id => {
      const w = byId[id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice';
      btn.dataset.id = id;
      btn.innerHTML = '<img src="' + w.image + '" alt="' + w.word + '">';
      btn.addEventListener('click', () => pickChoice(btn, id));
      choicesBox.appendChild(btn);
    });
    locked = false;
    speak(item);
  }

  function pickChoice(btn, id) {
    if (locked) return;
    const item = currentItem();
    if (!item) return;
    if (id !== item.id) {
      // 答錯：那張搖一下、變淡、不能再按（沒有叉叉），題目留著，再唸一次，可以選別張
      btn.classList.add('wrong');
      btn.disabled = true;
      Sound.pop();
      speak(item);
      return;
    }
    locked = true;
    btn.classList.add('correct');
    choicesBox.classList.add('answered');   // 其他張變淡，綠框那張就是答案
    Sound.snap();
    save.match.idx++;
    writeSave();
    renderMatchProgress(save.match.idx - 1);   // 剛答對的那一顆星星跳一下
    const mySeq = seq;
    setTimeout(() => {
      if (seq !== mySeq || !save.match) return;   // 這 0.9 秒裡她已經按了上一層
      if (save.match.idx >= ROUND) {
        lastRound = save.match.queue.slice();
        save.match = null;
        writeSave();
        win();
      } else {
        renderQuestion();
      }
    }, 900);
  }

  /* ---------- 翻牌模式 ---------- */

  function newMemoryRound(pairs) {
    const picked = shuffle(WORDS).slice(0, pairs).map(w => w.id);
    const cards = [];
    picked.forEach(id => {
      cards.push({ id: id, kind: 'pic' });
      cards.push({ id: id, kind: 'word' });
    });
    save.pairs = pairs;
    save.memory = { pairs: pairs, cards: shuffle(cards), matched: [] };
    writeSave();
  }

  function startMemory(resume) {
    seq++;
    mode = 'memory';
    if (!resume || !save.memory || save.memory.matched.length >= save.memory.pairs) {
      newMemoryRound(save.pairs);
    } else {
      save.pairs = save.memory.pairs;
    }
    matchArea.hidden = true;
    memoryArea.hidden = false;
    showGame();
    // 第一次進來小熊唸一次（這一下是她點門的手勢，iPad 才准出聲）；之後想聽再點泡泡
    guide.set(LINE_MEMORY, !memoryLineSaid);
    memoryLineSaid = true;
    renderMemoryProgress(-1);
    renderMemory();
  }

  // 幾對就幾顆星星，配成一對亮一顆
  function renderMemoryProgress(pop) {
    if (!save.memory) return;
    renderStars(save.memory.pairs, save.memory.matched.length, pop);
  }

  // 欄數：橫向 3 對→3 欄、6/8 對→4 欄；直向 3 對→2 欄、6 對→3 欄、8 對→4 欄
  function gridShape(pairs) {
    const portrait = window.innerHeight > window.innerWidth;
    const cols = portrait
      ? (pairs === 3 ? 2 : (pairs === 6 ? 3 : 4))
      : (pairs === 3 ? 3 : 4);
    return { cols: cols, rows: Math.ceil(pairs * 2 / cols) };
  }

  /* 牌的大小照「玩的地方」實際多大來算（--cw 寬、--ch 高），不是寫死的正方形：
     橫向 4×4 時高度不夠，牌做成橫的，字卡上的長字（watermelon）才有地方放大。 */
  function applyGridShape() {
    if (!save.memory) return;
    const shape = gridShape(save.memory.pairs);
    const gap = 20;
    const areaW = memoryArea.clientWidth;
    const areaH = memoryArea.clientHeight - 18;   // 底邊 8＋一點餘裕
    let cw = Math.min(270, (areaW - (shape.cols - 1) * gap) / shape.cols);
    let ch = Math.min(270, (areaH - (shape.rows - 1) * gap) / shape.rows);
    if (cw > ch * 1.4) cw = ch * 1.4;
    if (ch > cw * 1.2) ch = cw * 1.2;
    memoryGrid.style.setProperty('--cols', String(shape.cols));
    memoryGrid.style.setProperty('--cw', Math.max(60, Math.floor(cw)) + 'px');
    memoryGrid.style.setProperty('--ch', Math.max(60, Math.floor(ch)) + 'px');
  }

  function renderMemory() {
    flipped = [];
    locked = false;
    memoryGrid.innerHTML = '';
    applyGridShape();
    save.memory.cards.forEach((card, i) => {
      const w = byId[card.id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mcard';
      btn.dataset.id = card.id;
      btn.dataset.kind = card.kind;
      btn.dataset.i = i;
      btn.setAttribute('aria-label', '第 ' + (i + 1) + ' 張牌');
      // 字卡的字級按單字長度縮放（--k＝這個字大約幾個 em 寬），算式在 css/words.css
      const front = card.kind === 'pic'
        ? '<span class="mcard-front"><img src="' + w.image + '" alt="' + w.word + '"></span>'
        : '<span class="mcard-front word" style="--k:' + (Math.max(w.word.length, 3) * charW()).toFixed(2) + '">' +
          esc(wordFace(w)) + '</span>';
      btn.innerHTML = '<span class="mcard-inner"><span class="mcard-back"></span>' + front + '</span>';
      if (save.memory.matched.indexOf(card.id) >= 0) {
        btn.classList.add('flipped');
        btn.classList.add('matched');
      }
      btn.addEventListener('click', () => flipCard(btn, card));
      memoryGrid.appendChild(btn);
    });
  }

  function flipCard(btn, card) {
    if (locked) return;
    if (btn.classList.contains('flipped')) return;
    btn.classList.add('flipped');
    flipped.push({ btn: btn, card: card });
    if (card.kind === 'word') speak(byId[card.id]);
    if (flipped.length < 2) return;

    locked = true;
    const a = flipped[0];
    const b = flipped[1];
    const mySeq = seq;
    if (a.card.id === b.card.id) {
      // 配成一對：綠框閃一下，然後兩張變平（css 的 .matched.just）
      [a, b].forEach(x => { x.btn.classList.add('matched'); x.btn.classList.add('just'); });
      Sound.snap();
      save.memory.matched.push(a.card.id);
      writeSave();
      renderMemoryProgress(save.memory.matched.length - 1);
      flipped = [];
      locked = false;
      if (save.memory.matched.length >= save.memory.pairs) {
        lastRound = save.memory.cards.filter(c => c.kind === 'pic').map(c => c.id);
        save.memory = null;
        writeSave();
        setTimeout(() => { if (seq === mySeq) win(); }, 700);
      }
      return;
    }
    // 配錯：兩張輕輕搖一下再蓋回去
    a.btn.classList.add('wrong');
    b.btn.classList.add('wrong');
    Sound.pop();
    setTimeout(() => {
      [a, b].forEach(x => {
        x.btn.classList.remove('wrong');
        x.btn.classList.remove('flipped');
      });
      if (seq !== mySeq) return;   // 已經換畫面或重開一局了，新的那一局不歸這個計時器管
      flipped = [];
      locked = false;
    }, 900);
  }

  /* ---------- 難度按鈕（選玩法畫面） ---------- */

  function setPairs(n) {
    save.pairs = n;
    writeSave();
    document.querySelectorAll('#pairsRow .diff-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.pairs, 10) === n);
    });
  }

  /* ---------- 過關 ---------- */

  // 完成畫面的主角：這一輪的三張圖＋一顆大星星拼成 2×2。
  // 右下角那格固定放星星：小熊（base.css 的 .done-bear）剛好站在那一格前面，放圖會被牠擋住。
  function paintWinPics() {
    const ids = lastRound.filter(id => byId[id]).slice(0, 3);
    winPics.innerHTML = ids.map(id => {
      const w = byId[id];
      return '<span class="wp"><img src="' + w.image + '" alt="' + w.word + '"><b>' + esc(wordFace(w)) + '</b></span>';
    }).join('') +
      '<span class="wp wp-star"><svg viewBox="0 0 24 24" aria-hidden="true">' + STAR + '</svg></span>';
  }

  function win() {
    Sound.win();
    launchConfetti();
    paintWinPics();
    winOverlay.hidden = false;
    refreshResumeBadges();
  }

  /* ---------- 事件 ---------- */

  document.getElementById('matchCard').addEventListener('click', () => {
    if (!WORDS.length) return;   // 單字資料還沒讀到（或讀不到）
    Sound.click();
    startMatch(!matchResume.hidden);
  });

  document.getElementById('memoryCard').addEventListener('click', () => {
    if (!WORDS.length) return;
    Sound.click();
    startMemory(!memoryResume.hidden);
  });

  document.querySelectorAll('#pairsRow .diff-btn').forEach(b => {
    b.addEventListener('click', () => {
      Sound.click();
      setPairs(parseInt(b.dataset.pairs, 10));
      save.memory = null;   // 換難度就放棄舊的翻牌進度
      writeSave();
      refreshResumeBadges();
    });
  });

  document.getElementById('speakBtn').addEventListener('click', () => {
    if (mode === 'match') speak(currentItem(), true);
  });

  /* 選項數（3／4）。以前這是家長的設定、只影響下一輪；現在是她自己按的「圖＋數字」按鈕，
     按了 4 進去卻還是三張會看不懂，所以跟翻牌的幾對一樣：玩到一半的那一輪張數不同就放棄、重新出題。
     張數一樣（按回原本那顆）就照舊可以接著玩。 */
  document.querySelectorAll('#choicesRow .diff-btn').forEach(b => {
    b.addEventListener('click', () => {
      Sound.click();
      save.choices = parseInt(b.dataset.choices, 10);
      const cur = save.match && save.match.choices && save.match.choices[save.match.idx];
      if (save.match && (!cur || cur.length !== save.choices)) save.match = null;
      writeSave();
      syncChoiceBtns();
      refreshResumeBadges();
    });
  });

  backBtn.addEventListener('click', () => { Sound.click(); showSelect(); });

  document.getElementById('againBtn').addEventListener('click', () => {
    Sound.click();
    winOverlay.hidden = true;
    if (mode === 'match') startMatch(false); else startMemory(false);
  });

  document.getElementById('menuBtn').addEventListener('click', () => { Sound.click(); showSelect(); });

  /* 轉向、分割畫面：牌的大小跟著「玩的地方」重算。看的是 #memoryArea 自己的大小（ResizeObserver），
     不只是視窗——直向時上面那一列會變兩排，玩的地方變矮但視窗沒變。 */
  const regrid = () => { if (mode === 'memory') applyGridShape(); };
  window.addEventListener('resize', regrid);
  window.addEventListener('orientationchange', regrid);
  if (typeof ResizeObserver === 'function') new ResizeObserver(regrid).observe(memoryArea);

  /* 從首頁按「上一頁」回來時瀏覽器可能直接把這頁原樣搬回來（bfcache），不會重跑上面的程式；
     大人剛在首頁改的大小寫／只聽不看字要重讀一次。 */
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    loadSave();
    syncChoiceBtns();
    paintDemoWords();
    if (mode === 'match' && currentItem()) paintWord(currentItem());
    else if (mode === 'memory' && save.memory) renderMemory();
    else if (mode === null) refreshResumeBadges();
  });

  /* ---------- 啟動 ---------- */

  loadSave();
  setPairs(save.pairs);
  syncChoiceBtns();
  paintDemoWords();

  fetch('assets/data/words.json')
    .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(list => {
      WORDS = list;
      WORDS.forEach(w => { byId[w.id] = w; });
      refreshResumeBadges();
      document.body.dataset.wordsReady = '1';
    })
    .catch(err => {
      console.warn('讀不到單字資料', err);
      dataError.hidden = false;
    });

  /* ---------- 彩帶（照 puzzle.js 複製一份） ---------- */
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');

  function launchConfetti() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#FF5C5C', '#FFD84D', '#22C3B6', '#9A7BF5', '#FFA228', '#4AA8EE', '#FF7FB0']; // 六個房間的顏色＋黃
    const parts = [];
    for (let i = 0; i < 130; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (t - start < 3500) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(frame);
  }
})();
