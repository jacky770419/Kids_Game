/* 英文單字遊戲：配對 + 翻牌記憶。
   資料在 assets/data/words.json，進度存在 localStorage（key: kidsWords）。
   沒有計時、沒有分數、沒有失敗畫面——答錯就再試一次。 */
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
  const wordText = document.getElementById('wordText');
  const wordZh = document.getElementById('wordZh');
  const progress = document.getElementById('progress');
  const winOverlay = document.getElementById('winOverlay');
  const dataError = document.getElementById('dataError');
  const matchResume = document.getElementById('matchResume');
  const memoryResume = document.getElementById('memoryResume');
  const wordTextCol = document.querySelector('#matchArea .word-text-col');
  const caseBtn = document.getElementById('caseBtn');
  const listenBtn = document.getElementById('listenBtn');

  let WORDS = [];           // 全部單字
  const byId = {};          // id → 單字
  let mode = null;          // 'match' | 'memory'
  // choices／lower／listenOnly 是家長可調的三個顯示設定，跟進度一起存
  let save = { match: null, memory: null, pairs: 3, choices: CHOICES, lower: true, listenOnly: false };
  let locked = false;       // 判定期間鎖住點擊
  let flipped = [];         // 翻牌模式目前翻開、還沒判定的卡

  /* ---------- 小工具 ---------- */

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
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
  function speak(item) {
    if (!item) return;
    try {
      if (item.audio) {
        const a = new Audio(item.audio);
        const p = a.play();
        if (p && typeof p.catch === 'function') p.catch(() => speakTTS(item));
        return;
      }
    } catch (e) { /* 落到 TTS */ }
    speakTTS(item);
  }

  function speakTTS(item) {
    // 有共用的 Speech（js/speech.js）就交給它——它會挑一顆英文母語音，
    // 免得裝置設成中文時把 bear 唸成中文腔。沒載到才退回這裡的土法。
    if (window.Speech) { Speech.say(item.word.toLowerCase()); return; }
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
  // 家裡教材用哪種字形是量測過才知道的，所以做成開關而不是寫死。
  function wordFace(item) {
    return save.lower ? item.word.toLowerCase() : item.word.toUpperCase();
  }

  // 兩顆設定鈕的外觀跟目前狀態同步
  function syncSettingBtns() {
    if (caseBtn) caseBtn.textContent = save.lower ? 'Aa' : 'AA';
    if (listenBtn) listenBtn.classList.toggle('on', !!save.listenOnly);
    document.querySelectorAll('#choicesRow .diff-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.choices, 10) === save.choices);
    });
  }

  // 切換後只重畫「字面」，不重抽題目，也不重播動畫
  function refreshFaces() {
    if (mode === 'match') {
      const item = currentItem();
      if (item) {
        wordText.textContent = wordFace(item);
        wordZh.textContent = item.bpmf || item.zh;
        if (wordTextCol) wordTextCol.hidden = !!save.listenOnly;
      }
    } else if (mode === 'memory') {
      memoryGrid.querySelectorAll('.mcard').forEach(btn => {
        if (btn.dataset.kind !== 'word') return;
        const front = btn.querySelector('.mcard-front');
        if (front) front.textContent = wordFace(byId[btn.dataset.id]);
      });
    }
  }

  /* ---------- 畫面切換 ---------- */

  function showSelect() {
    mode = null;
    gameScreen.hidden = true;
    selectScreen.hidden = false;
    winOverlay.hidden = true;
    refreshResumeBadges();
  }

  function showGame() {
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    winOverlay.hidden = true;
  }

  function refreshResumeBadges() {
    matchResume.hidden = !(save.match && save.match.idx < ROUND);
    memoryResume.hidden = !(save.memory && save.memory.matched.length < save.memory.pairs);
  }

  /* ---------- 配對模式 ---------- */

  function newMatchRound() {
    // 每輪開始時才鎖定選項數：玩到一半改設定不會打斷這一輪
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
    mode = 'match';
    if (listenBtn) listenBtn.hidden = false;   // 只聽不看字只對配對的字卡有意義
    if (!resume || !save.match || save.match.idx >= ROUND) newMatchRound();
    matchArea.hidden = false;
    memoryArea.hidden = true;
    showGame();
    renderMatchProgress();
    renderQuestion();
  }

  function renderMatchProgress() {
    progress.innerHTML = '';
    for (let i = 0; i < ROUND; i++) {
      const s = document.createElement('span');
      s.className = 'star' + (i < save.match.idx ? ' on' : '');
      s.textContent = '⭐';
      progress.appendChild(s);
    }
  }

  function currentItem() {
    if (!save.match) return null;
    return byId[save.match.queue[save.match.idx]];
  }

  function renderQuestion() {
    const item = currentItem();
    if (!item) return;
    wordText.textContent = wordFace(item);
    // 中文提示用注音：使用者五歲、幾乎不識漢字但認得注音符號，漢字對她沒有意義
    wordZh.textContent = item.bpmf || item.zh;
    // 只聽不看字：把整欄文字藏起來，只留 🔊。進題照樣自動唸（見下面的 speak）
    if (wordTextCol) wordTextCol.hidden = !!save.listenOnly;
    choicesBox.innerHTML = '';
    // 四個選項時卡片要縮小才塞得下（直向 iPad），交給 CSS 的 #choices.four 規則
    choicesBox.classList.toggle('four', save.match.choices[save.match.idx].length >= 4);
    save.match.choices[save.match.idx].forEach(id => {
      const w = byId[id];
      const btn = document.createElement('button');
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
      // 答錯：卡片變淡＋晃一下，題目留著，可以再選別張
      btn.classList.remove('wrong');
      void btn.offsetWidth;   // 重新觸發動畫
      btn.classList.add('wrong');
      Sound.pop();
      speak(item);
      return;
    }
    locked = true;
    btn.classList.add('correct');
    Sound.snap();
    save.match.idx++;
    writeSave();
    renderMatchProgress();
    setTimeout(() => {
      if (save.match && save.match.idx >= ROUND) {
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
    mode = 'memory';
    if (listenBtn) listenBtn.hidden = true;    // 翻牌藏了字卡就沒得玩，這顆鈕在這裡沒作用，收起來
    if (!resume || !save.memory || save.memory.matched.length >= save.memory.pairs) {
      newMemoryRound(save.pairs);
    } else {
      save.pairs = save.memory.pairs;
    }
    matchArea.hidden = true;
    memoryArea.hidden = false;
    showGame();
    renderMemoryProgress();
    renderMemory();
  }

  // 遊戲中的難度切換（家長用）：按下就用新難度重開
  function renderMemoryProgress() {
    progress.innerHTML = '';
    [3, 6, 8].forEach(n => {
      const b = document.createElement('button');
      b.className = 'diff-btn' + (n === save.pairs ? ' selected' : '');
      b.dataset.pairs = n;
      b.textContent = n + ' 對 ' + '⭐'.repeat(n === 3 ? 1 : (n === 6 ? 2 : 3));
      b.addEventListener('click', () => {
        Sound.click();
        setPairs(n);
        newMemoryRound(n);
        renderMemoryProgress();
        renderMemory();
      });
      progress.appendChild(b);
    });
  }

  // 欄數：橫向 3 對→3 欄、6/8 對→4 欄；直向 3 對→2 欄、6 對→3 欄、8 對→4 欄
  function gridShape(pairs) {
    const portrait = window.innerHeight > window.innerWidth;
    const cols = portrait
      ? (pairs === 3 ? 2 : (pairs === 6 ? 3 : 4))
      : (pairs === 3 ? 3 : 4);
    return { cols: cols, rows: Math.ceil(pairs * 2 / cols) };
  }

  function applyGridShape() {
    if (!save.memory) return;
    const shape = gridShape(save.memory.pairs);
    memoryGrid.style.setProperty('--cols', shape.cols);
    memoryGrid.style.setProperty('--rows', shape.rows);
  }

  function renderMemory() {
    flipped = [];
    locked = false;
    memoryGrid.innerHTML = '';
    applyGridShape();
    save.memory.cards.forEach((card, i) => {
      const w = byId[card.id];
      const btn = document.createElement('button');
      btn.className = 'mcard';
      btn.dataset.id = card.id;
      btn.dataset.kind = card.kind;
      btn.dataset.i = i;
      // 字卡的字級按單字長度縮放（0.62em 是粗體英文字母的大約寬度），長字才不會爆版
      const fs = card.kind === 'word'
        ? ' style="--fs: min(calc(var(--mcard) * 0.28), calc((var(--mcard) - 24px) * 1.4 / ' + w.word.length + '))"'
        : '';
      const face = card.kind === 'pic'
        ? '<img src="' + w.image + '" alt="' + w.word + '">'
        : wordFace(w);
      btn.innerHTML = '<span class="mcard-inner">' +
        '<span class="mcard-back">?</span>' +
        '<span class="mcard-front"' + fs + '>' + face + '</span></span>';
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
    if (a.card.id === b.card.id) {
      a.btn.classList.add('matched');
      b.btn.classList.add('matched');
      Sound.snap();
      save.memory.matched.push(a.card.id);
      writeSave();
      flipped = [];
      locked = false;
      if (save.memory.matched.length >= save.memory.pairs) {
        save.memory = null;
        writeSave();
        setTimeout(win, 350);
      }
      return;
    }
    // 配錯：黃框提示一下再蓋回去
    a.btn.classList.add('wrong');
    b.btn.classList.add('wrong');
    Sound.pop();
    setTimeout(() => {
      [a, b].forEach(x => {
        x.btn.classList.remove('wrong');
        x.btn.classList.remove('flipped');
      });
      flipped = [];
      locked = false;
    }, 900);
  }

  /* ---------- 難度按鈕（模式選擇畫面） ---------- */

  function setPairs(n) {
    save.pairs = n;
    writeSave();
    document.querySelectorAll('#pairsRow .diff-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.pairs, 10) === n);
    });
  }

  /* ---------- 過關 ---------- */

  function win() {
    Sound.win();
    launchConfetti();
    winOverlay.hidden = false;
    refreshResumeBadges();
  }

  /* ---------- 事件 ---------- */

  document.getElementById('matchCard').addEventListener('click', () => {
    Sound.click();
    startMatch(!matchResume.hidden);
  });

  document.getElementById('memoryCard').addEventListener('click', () => {
    Sound.click();
    startMemory(!memoryResume.hidden);
  });

  document.querySelectorAll('#pairsRow .diff-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      Sound.click();
      setPairs(parseInt(b.dataset.pairs, 10));
      save.memory = null;   // 換難度就放棄舊的翻牌進度
      writeSave();
      refreshResumeBadges();
    });
  });

  document.getElementById('speakBtn').addEventListener('click', () => {
    if (mode === 'match') speak(currentItem());
  });

  // 選項數（3／4）：只影響「下一輪」抽題，不打斷正在玩的這一輪
  document.querySelectorAll('#choicesRow .diff-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      Sound.click();
      save.choices = parseInt(b.dataset.choices, 10);
      writeSave();
      syncSettingBtns();
    });
  });

  if (caseBtn) caseBtn.addEventListener('click', () => {
    Sound.click();
    save.lower = !save.lower;
    writeSave();
    syncSettingBtns();
    refreshFaces();
  });

  if (listenBtn) listenBtn.addEventListener('click', () => {
    Sound.click();
    save.listenOnly = !save.listenOnly;
    writeSave();
    syncSettingBtns();
    refreshFaces();
    // 剛切成「只聽不看字」時再唸一次，不然畫面上就只剩圖了
    if (save.listenOnly && mode === 'match') speak(currentItem());
  });

  document.getElementById('backBtn').addEventListener('click', () => { Sound.click(); showSelect(); });

  document.getElementById('againBtn').addEventListener('click', () => {
    Sound.click();
    winOverlay.hidden = true;
    if (mode === 'match') startMatch(false); else startMemory(false);
  });

  document.getElementById('menuBtn').addEventListener('click', () => { Sound.click(); showSelect(); });

  window.addEventListener('resize', () => { if (mode === 'memory') applyGridShape(); });

  /* ---------- 啟動 ---------- */

  loadSave();
  setPairs(save.pairs);
  syncSettingBtns();

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
    const colors = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#A78BFA', '#7BE495', '#5DADE2', '#FF8FA3']; // 貼紙書主色
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
        // 貼紙書風格：每片碎紙都描一圈墨線
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2b2b2b';
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
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
