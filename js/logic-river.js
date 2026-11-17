/* 動動腦小屋：一次只能載一個（過河）。對應故事《一次只能載一個》（wolf-goat-cabbage）。

   老爺爺划一條小船，要把大野狼、小羊、白菜送到對岸，船上一次只能多載一樣。
   老爺爺不在的那一岸：大野狼會捉弄小羊（扮鬼臉，不吃）、小羊會偷吃白菜。
   練的是「先後順序、先想再做」。

   試讀時五歲孩子卡在三個地方，畫面就照這三點擺：
   1. 只記得「小羊會吃白菜」，忘了大野狼會捉弄小羊 → 兩張規則卡一直貼在左上角，點了會念。
   2. 想不到要把小羊「載回來」→ 提示算出下一步，是載小羊回來時多念一句。
   3. 兩岸各有誰，用聽的記不住 → 三樣東西各有固定的位置，一直看得到在哪一岸。

   四小關：1 只有小羊和白菜，學上船和划船　2 三樣都來，老爺爺提醒第一步、提示給得快
           3 三樣都來，不提醒　4 換大人來，完全沒有提示。
   出事不扣分：船划到一半，岸上演一次後果，船自己退回去，狀態回到按槳之前。

   狀態是純資料 { boat: 0|1, at: { wolf: 0|1, … } }（0＝這邊、1＝對岸）。
   判定、下一步、最短解（BFS）都是不碰畫面的純函式，提示就用同一個 BFS，test() 也驗它。 */
(() => {
  'use strict';
  if (!window.Logic) return;

  Logic.lines({
    'river.name': { zh: '老爺爺過河', en: 'Across the River' },     // 卡片上放不下七個字的書名，取五個字
    'river.intro1': { zh: '老爺爺要划船到對岸。', en: 'The old boatman is rowing across the river.' },
    'river.intro2': { zh: '船很小，一次只能載一個。', en: 'His boat is small. He can take only one across at a time.' },
    'river.ask1': { zh: '把小羊跟白菜送到對岸。點一下就上船，再按綠色按鈕開船。', en: 'Take Little Goat and the cabbage across. Tap one to put it in the boat, then press the green button to go.' },
    'river.ask3': { zh: '把大野狼、小羊、白菜都送到對岸。', en: 'Take the wolf, Little Goat, and the cabbage across the river.' },
    'river.ask4': { zh: '換大人來試試看！你來當老師，看他划幾趟。', en: 'Now let a grown-up try! You be the teacher. Count how many trips it takes.' },
    'river.first': { zh: '先載小羊。大野狼不吃白菜，他們在一起沒事。', en: 'Take Little Goat first. The wolf doesn\'t eat cabbage, so those two are fine together.' },
    'river.r.wolf': { zh: '老爺爺不在，大野狼就會捉弄小羊。', en: 'When the boatman is away, the wolf teases Little Goat.' },
    'river.r.goat': { zh: '老爺爺不在，小羊就會偷吃白菜。', en: 'When the boatman is away, Little Goat nibbles the cabbage.' },
    'river.think': { zh: '想一想，誰跟誰在一起沒事？', en: 'Let\'s think. Which two are fine together?' },
    'river.back': { zh: '小羊可以再坐船回來喔。', en: 'Little Goat can ride back in the boat, you know.' },
    'river.win': { zh: '全部都到對岸了！白菜也沒事。', en: 'Everyone made it across! And the cabbage is safe too.' },
    'river.win4': { zh: '最少要划七趟。大人划了幾趟呢？', en: 'Seven trips is the fewest. How many did the grown-up take?' }
  });

  /* 故事書注音表沒有的字；破音字用整詞補，免得蓋到別間小屋的讀音 */
  Logic.zy({
    chars: { '載': 'ㄗㄞˋ', '趟': 'ㄊㄤˋ', '槳': 'ㄐㄧㄤˇ', '船': 'ㄔㄨㄢˊ', '捉': 'ㄓㄨㄛ', '按': 'ㄢˋ', '師': 'ㄕ', '鈕': 'ㄋㄧㄡˇ' },
    phrases: {
      '只能': ['ㄓˇ', 'ㄋㄥˊ'],
      '捉弄': ['ㄓㄨㄛ', 'ㄋㄨㄥˋ'],
      '當老師': ['ㄉㄤ', 'ㄌㄠˇ', 'ㄕ'],
      '最少': ['ㄗㄨㄟˋ', 'ㄕㄠˇ']
    }
  });

  /* ---------- 純邏輯（不碰畫面） ---------- */

  const ALL = ['wolf', 'goat', 'cabbage'];
  /* needCargo：第 1 關在這邊的岸不能空船出發——一開始空船划走，岸上就剩小羊和白菜，
     這一關只學怎麼上船、怎麼划，不讓它出事（槳在船上沒東西時是灰的）。 */
  const LEVELS = [
    { items: ['goat', 'cabbage'], ask: 'river.ask1', min: 3, needCargo: true },
    { items: ALL, ask: 'river.ask3', min: 7, first: true },
    { items: ALL, ask: 'river.ask3', min: 7 },
    { items: ALL, ask: 'river.ask4', min: 7, adult: true }
  ];

  function startState(items) {
    const at = {};
    items.forEach((id) => { at[id] = 0; });
    return { boat: 0, at: at };
  }
  const keyOf = (s) => s.boat + '|' + Object.keys(s.at).sort().map((k) => k + s.at[k]).join(',');
  const isDone = (s) => Object.keys(s.at).every((k) => s.at[k] === 1);

  /* 老爺爺不在的那一岸出了什麼事：'wolf'＝大野狼捉弄小羊、'goat'＝小羊偷吃白菜、null＝沒事。
     三樣都在的時候先演大野狼（小羊忙著發抖，還來不及吃）。 */
  function clash(s) {
    const side = 1 - s.boat;
    const here = (id) => s.at[id] === side;
    if (here('wolf') && here('goat')) return 'wolf';
    if (here('goat') && here('cabbage')) return 'goat';
    return null;
  }

  /* 划一趟：carry 是船上載的那一樣（null＝空船）。載不到（不在船這一岸）回傳 null。 */
  function step(s, carry) {
    if (carry && s.at[carry] !== s.boat) return null;
    const at = Object.assign({}, s.at);
    if (carry) at[carry] = 1 - s.boat;
    return { boat: 1 - s.boat, at: at };
  }

  /* 這個狀態可以怎麼划（不管會不會出事） */
  function movesOf(s, L) {
    const list = Object.keys(s.at).filter((k) => s.at[k] === s.boat);
    if (!(L && L.needCargo && s.boat === 0)) list.unshift(null);
    return list;
  }

  /* BFS：從 s 到「全部在對岸」最少的划法（一路都不出事）。回傳 [carry, …]；到不了回傳 null。 */
  function solve(s, L) {
    if (isDone(s)) return [];
    const seen = new Set([keyOf(s)]);
    let layer = [{ s: s, path: [] }];
    while (layer.length) {
      const next = [];
      for (const node of layer) {
        for (const carry of movesOf(node.s, L)) {
          const t = step(node.s, carry);
          if (!t || clash(t) || seen.has(keyOf(t))) continue;
          const path = node.path.concat([carry]);
          if (isDone(t)) return path;
          seen.add(keyOf(t));
          next.push({ s: t, path: path });
        }
      }
      layer = next;
    }
    return null;
  }

  /* 提示：最短解的下一步。{ carry, back }；back＝這一步是把小羊從對岸載回來。 */
  function nextStep(s, L) {
    const p = solve(s, L);
    if (!p || !p.length) return null;
    return { carry: p[0], back: p[0] === 'goat' && s.boat === 1 };
  }

  function test() {
    const errs = [];
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    // 判定
    const mk = (boat, w, g, c) => ({ boat: boat, at: { wolf: w, goat: g, cabbage: c } });
    if (clash(mk(1, 0, 0, 1)) !== 'wolf') errs.push('大野狼和小羊單獨在一起，應該判成捉弄');
    if (clash(mk(1, 1, 0, 0)) !== 'goat') errs.push('小羊和白菜單獨在一起，應該判成偷吃');
    if (clash(mk(1, 0, 1, 0)) !== null) errs.push('大野狼和白菜在一起應該沒事');
    if (clash(mk(0, 0, 0, 1)) !== null) errs.push('老爺爺在的那一岸不應該出事');
    if (clash(mk(1, 0, 0, 0)) !== 'wolf') errs.push('三樣都在、老爺爺不在，應該先演大野狼');
    if (step(mk(0, 0, 1, 0), 'goat') !== null) errs.push('不在船這一岸的東西不應該載得到');

    LEVELS.forEach((L, i) => {
      const name = '第 ' + (i + 1) + ' 關';
      const s0 = startState(L.items);
      const best = solve(s0, L);
      if (!best) { errs.push(name + '解不開'); return; }
      if (best.length !== L.min) errs.push(name + '最短解是 ' + best.length + ' 趟，應該是 ' + L.min + ' 趟');
      // 照最短解走一遍：每一步都合法、不出事，最後全部在對岸
      let s = s0;
      best.forEach((carry) => { s = s && step(s, carry); if (s && clash(s)) errs.push(name + '的最短解中途出事'); });
      if (!s || !isDone(s)) errs.push(name + '的最短解走完沒有全部到對岸');
      if (L.items.length === 3) {
        if (best[0] !== 'goat') errs.push(name + '第一趟應該載小羊');
        if (!same([best[1], best[3], best[5], best[6]], [null, 'goat', null, 'goat'])) errs.push(name + '的最短解不是「小羊去、空船回、…、小羊回、…、空船回、小羊去」');
        const h = nextStep(step(step(step(s0, 'goat'), null), 'wolf'), L);
        if (!h || h.carry !== 'goat' || !h.back) errs.push(name + '載了大野狼過去之後，提示應該是把小羊載回來');
      }

      // 每一個「不出事又到得了」的狀態：都解得開，提示的下一步讓它剛好近一趟
      const seen = new Map([[keyOf(s0), s0]]);
      const queue = [s0];
      while (queue.length) {
        const cur = queue.shift();
        if (isDone(cur)) continue;
        const sol = solve(cur, L);
        if (!sol) { errs.push(name + '有到得了卻解不開的狀態：' + keyOf(cur)); continue; }
        const h = nextStep(cur, L);
        const t = h && step(cur, h.carry);
        if (!t || clash(t)) errs.push(name + '的提示會出事：' + keyOf(cur));
        else {
          const rest = solve(t, L);
          if (!rest || rest.length !== sol.length - 1) errs.push(name + '的提示沒有更接近終點：' + keyOf(cur));
        }
        movesOf(cur, L).forEach((carry) => {
          const n = step(cur, carry);
          if (!n) { errs.push(name + '列出載不到的走法：' + keyOf(cur)); return; }
          if (clash(n)) {
            if (L.needCargo) errs.push(name + '不應該有會出事的走法：' + keyOf(cur) + ' 載 ' + carry);
            return;
          }
          if (!seen.has(keyOf(n))) { seen.set(keyOf(n), n); queue.push(n); }
        });
      }
      if (L.items.length === 3 && seen.size !== 10) errs.push(name + '不出事的狀態應該有 10 個，算出 ' + seen.size + ' 個');

      // 亂划一陣子（出事就退回去），再照提示走：一定在最短解的趟數內過關
      let seed = 12345 + i;
      const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
      for (let run = 0; run < 300; run++) {
        let cur = s0;
        for (let k = 0; k < 15 && !isDone(cur); k++) {
          const ms = movesOf(cur, L);
          const n = step(cur, ms[Math.floor(rnd() * ms.length)]);
          if (n && !clash(n)) cur = n;
        }
        let left = L.min;
        while (!isDone(cur) && left-- > 0) cur = step(cur, nextStep(cur, L).carry);
        if (!isDone(cur)) { errs.push(name + '照提示走了 ' + L.min + ' 趟還沒過關'); break; }
      }
    });
    return errs;
  }

  /* ---------- 圖 ---------- */

  const INK = '#33274F';
  const svg = (inner) => '<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g></svg>';
  const LEAF = '#CDE9A0';
  const STALK = '<path d="M38 91c-3-20 2-38 12-50 10 12 15 30 12 50z" fill="#FFFDF2" stroke-width="3.4"/>' +
    '<path d="M50 52v36M44 68l6 7M56 68l-6 7" fill="none" stroke-width="2.6"/>';
  /* 白菜：淡綠的葉子、白色的菜梗。咬過的那張右上缺一角（三口牙印）、旁邊掉兩片碎葉。 */
  const CABBAGE = svg(
    '<path d="M50 9C30 9 15 28 15 52c0 24 14 40 35 40s35-16 35-40C85 28 70 9 50 9z" fill="' + LEAF + '"/>' +
    '<path d="M27 31c6 8 9 18 9 29M73 31c-6 8-9 18-9 29M50 9v14" fill="none" stroke-width="3"/>' + STALK);
  const CABBAGE_BIT = svg(
    '<path d="M50 9C30 9 15 28 15 52c0 24 14 40 35 40s35-16 35-40c0-2-.2-4-.5-6a11 11 0 0 1-15-6a11 11 0 0 1-6-15a11 11 0 0 1-9-14C53 9.2 51.5 9 50 9z" fill="' + LEAF + '"/>' +
    '<path d="M27 31c6 8 9 18 9 29M66 51c-1.4 3.4-2 6-2 9M50 9v14" fill="none" stroke-width="3"/>' + STALK +
    '<path d="M73 10l8 2-5 6zM84 23l7 4-8 4zM92 38l6 5-8 2z" fill="' + LEAF + '" stroke-width="2"/>');

  /* 背景：兩邊是沙色的岸，中間是河；對岸下面有市集的小旗子，兩邊各一小段木頭碼頭 */
  const BG =
    '<svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">' +
    '<rect x="-4" y="-4" width="408" height="308" fill="#FBE7A8"/>' +
    '<path d="M96-6C104 30 88 60 96 96c8 34-6 74 0 108 6 36-4 66 2 102h206c-6-36 4-66-2-102-6-34 8-74 0-108-8-36 8-66 0-102z" fill="#9ADBF8" stroke="' + INK + '" stroke-width="2"/>' +
    '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">' +
    '<path d="M128 66q7-6 14 0t14 0M236 84q7-6 14 0t14 0M176 108q7-6 14 0t14 0M124 228q7-6 14 0t14 0M232 246q7-6 14 0t14 0M250 150q6-5 12 0M130 150q6-5 12 0"/></g>' +
    '<g stroke="' + INK + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M84 186h26v16H84zM290 186h26v16h-26z" fill="#C98A4B"/><path d="M93 186v16M101 186v16M299 186v16M307 186v16" fill="none" stroke-width="1.4"/>' +
    '<path d="M330 292v-34M392 292v-40" fill="none" stroke-width="2.4"/><path d="M330 260q31 12 62-6" fill="none" stroke-width="1.4"/>' +
    '<path d="M336 262l10 3-7 11z" fill="#FF5C5C"/><path d="M351 265l11 0-5 12z" fill="#FFD84D"/><path d="M367 264l10-3-3 13z" fill="#9A7BF5"/><path d="M381 260l9-5-1 13z" fill="#FF7FB0"/>' +
    '</g>' +
    '<g fill="#EFCF80"><ellipse cx="22" cy="268" rx="9" ry="4"/><ellipse cx="60" cy="284" rx="6" ry="3"/><ellipse cx="70" cy="52" rx="6" ry="3"/><ellipse cx="344" cy="56" rx="7" ry="3"/><ellipse cx="322" cy="226" rx="6" ry="3"/><ellipse cx="14" cy="130" rx="5" ry="2.6"/><ellipse cx="386" cy="200" rx="5" ry="2.6"/></g>' +
    '</svg>';

  /* 船分兩層：後面那層（船的內側＋空位的虛線圈）在乘客後面，前面那層（船身＋槳）蓋住乘客的腳 */
  const BOAT_BACK =
    '<svg viewBox="0 0 260 210" aria-hidden="true">' +
    '<path d="M20 104h220l14 18H6z" fill="#9C6232" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
    '<circle class="river-seat" cx="187" cy="62" r="56" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="5" stroke-dasharray="10 11" stroke-linecap="round"/>' +
    '</svg>';
  const hull = (paddle) =>
    '<svg viewBox="0 0 260 100" aria-hidden="true"><g stroke="' + INK + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M6 12h248c-4 40-26 72-58 72H64C32 84 10 52 6 12z" fill="#D99A56"/>' +
    '<path d="M17 38h226" fill="none" stroke-width="3"/>' +
    (paddle ? '<g class="river-paddle"><path d="M112-26L82 74" fill="none" stroke-width="10"/><path d="M112-26L82 74" fill="none" stroke="#B9783A" stroke-width="4.5"/>' +
      '<path d="M88 56c9 3 13 11 10 22s-12 21-21 18-12-11-9-22 11-21 20-18z" fill="#EDBE7C" stroke-width="4"/></g>' : '') +
    '</g></svg>';

  const RED_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="#FF5C5C" stroke-width="5.5" stroke-linecap="round"/></svg>';
  const OAR_IC = '<svg class="river-oar-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.6 19.4L13.6 10.4M2.8 17.6l3.6 3.6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>' +
    '<path d="M12.4 8.6c1.4-3.8 4.8-6 8.8-5.8.2 4-2 7.4-5.8 8.8z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const ARROW_IC = '<svg class="river-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5.5l6.5 6.5-6.5 6.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const ART = {
    wolf: '<img class="river-w1" src="assets/story/chars/wolf-stand.png" alt=""><img class="river-w2" src="assets/story/chars/wolf-blow.png" alt="">',
    goat: '<img src="assets/logic/goat.png" alt="">',
    cabbage: '<span class="river-c1">' + CABBAGE + '</span><span class="river-c2">' + CABBAGE_BIT + '</span>'
  };
  const MINI = {
    wolf: '<img src="assets/story/chars/wolf-stand.png" alt="">',
    goat: '<img src="assets/logic/goat.png" alt="">',
    cabbage: CABBAGE
  };

  /* 位置（單位 cqw）：每樣東西在兩岸各有一個固定的位子，孩子一眼看得出誰在哪一岸 */
  const SIZE = 15;
  const ROW = { wolf: 15, goat: 31.5, cabbage: 48 };
  const COL = { wolf: 2.5, goat: 7, cabbage: 2.5 };       // 這邊的岸；對岸左右對稱
  const BOAT_X = [25, 46];
  const SEAT = { x: 13.4, y: 27.8 };

  /* ---------- 畫面 ---------- */

  function mount(stage, api, level) {
    const L = LEVELS[level];
    const el = api.el;
    let state = startState(L.items);
    let cargo = null;                 // 船上載的那一樣（還沒划走時，它算在船這一岸）
    const history = [];               // 成功划過的每一趟：{ state: 划之前, carry }
    let busy = false, over = false;
    let hintOn = false;               // 現在有沒有亮出「下一步」
    let talked = false;               // 念過別的旁白了（第 2 關開頭的提醒就不再插進來）

    stage.appendChild(el('div', 'river-bg', BG));
    const banks = [el('div', 'river-bank l'), el('div', 'river-bank r')];
    banks.forEach((b) => stage.appendChild(b));

    // 規則卡（左上角，一直在）：誰不能跟誰單獨在一起
    const cards = {};
    const RULES = { wolf: ['wolf', 'goat'], goat: ['goat', 'cabbage'] };
    (L.items.length === 3 ? ['wolf', 'goat'] : ['goat']).forEach((k, i) => {
      const c = el('button', 'btn river-rule', '<i>' + MINI[RULES[k][0]] + '</i><b>' + RED_X + '</b><i>' + MINI[RULES[k][1]] + '</i>');
      c.type = 'button';
      c.dataset.rule = k;
      c.style.left = (2 + i * 17.7) + 'cqw';
      c.addEventListener('click', () => { api.sfx('click'); api.anim(c, 'lg-pop'); talked = true; api.say('river.r.' + k); });
      stage.appendChild(c);
      cards[k] = c;
    });

    // 綠色的槳（上方中間）、上一步（右上）、划了幾趟（下面中間，不能按）
    const oar = el('button', 'btn go river-oar', OAR_IC + ARROW_IC);
    oar.type = 'button';
    oar.setAttribute('aria-label', '划船');
    stage.appendChild(oar);
    const undoBtn = el('button', 'btn river-undo', '<i data-ic="undo"></i>');
    undoBtn.type = 'button';
    undoBtn.setAttribute('aria-label', '上一步');
    stage.appendChild(undoBtn);
    const trips = el('div', 'river-trips');
    stage.appendChild(trips);

    // 船：老爺爺固定坐在左邊，右邊一個空位
    const boat = el('div', 'river-boat', BOAT_BACK + '<span class="river-gp"><img src="assets/story/chars/grandpa-cheer.png" alt=""></span>');
    stage.appendChild(boat);
    const nodes = {};
    L.items.forEach((id) => {
      const n = el('div', 'river-item', '<div class="river-art">' + ART[id] + '</div>');
      n.dataset.item = id;
      stage.appendChild(n);
      nodes[id] = { el: n, art: n.firstChild };
    });
    const hullEl = el('div', 'river-hull', hull(true));
    stage.appendChild(hullEl);

    /* 照狀態把每樣東西擺到位子上。boatX 可以另外給（出事時船只划到河中間）。 */
    function place(boatX) {
      const bx = boatX === undefined ? BOAT_X[state.boat] : boatX;
      boat.style.left = bx + 'cqw';
      hullEl.style.left = bx + 'cqw';
      L.items.forEach((id) => {
        const n = nodes[id].el;
        const on = cargo === id;
        const side = state.at[id];
        n.style.left = (on ? bx + SEAT.x : (side ? 100 - SIZE - COL[id] : COL[id])) + 'cqw';
        n.style.top = (on ? SEAT.y : ROW[id]) + 'cqw';
        n.classList.toggle('river-aboard', on);
      });
      boat.classList.toggle('full', !!cargo);
    }

    function drawTrips() {
      const n = history.length;
      const total = Math.min(22, Math.max(L.min, n));
      let html = '';
      for (let i = 0; i < total; i++) html += '<b class="' + (i < n ? 'on' : '') + '"></b>';
      trips.innerHTML = html;
    }

    function refresh() {
      oar.classList.toggle('back', state.boat === 1);
      oar.disabled = !!(L.needCargo && state.boat === 0 && !cargo);
      undoBtn.disabled = history.length === 0;
      drawTrips();
      glow();
    }

    function lock(on) {
      busy = on;
      L.items.forEach((id) => nodes[id].el.classList.toggle('lg-locked', on));
    }

    /* 亮出下一步：該上船的那一樣發亮；已經在船上（或下一步是空船）就換槳發亮 */
    function glow() {
      oar.classList.remove('lg-glow');
      L.items.forEach((id) => nodes[id].el.classList.remove('lg-glow'));
      if (!hintOn || over) return;
      const h = nextStep(state, L);
      if (!h) return;
      const target = h.carry === cargo ? oar : nodes[h.carry || cargo].el;   // 下一步是空船但船上有東西：先請它下來
      target.classList.add('lg-glow');
    }
    function showHint() {
      hintOn = true;
      glow();
      const h = nextStep(state, L);
      return !!(h && h.back);
    }

    /* 依序念幾句；中途被別的話打斷就停 */
    function sayAll(ids) {
      talked = true;
      return ids.reduce((p, id) => p.then((ok) => (ok && !over ? api.say(id) : false)), Promise.resolve(true));
    }

    /* 點一下：在船這一岸的上船（船上已經有一樣就互換），船上的下船 */
    function toggle(id) {
      if (busy || over) return false;
      if (cargo === id) {
        cargo = null;
        api.sfx('pop');
      } else if (state.at[id] === state.boat) {
        cargo = id;
        api.sfx('snap');
      } else {
        api.sfx('click');
        api.anim(nodes[id].art, 'lg-shake');     // 在另一岸，船載不到
        return false;
      }
      place();
      refresh();
      return true;
    }

    L.items.forEach((id) => {
      api.drag(nodes[id].el, {
        zones: () => {
          if (busy || over) return [];
          if (cargo === id) return [{ el: banks[state.boat] }];
          if (state.at[id] === state.boat) return [{ el: boat }];
          return [];
        },
        onTap: () => { toggle(id); },
        onDrop: (zone) => (zone ? toggle(id) : false)
      });
    });

    /* 按槳：先用純函式算出划過去之後的狀態，出事就演後果、退回來 */
    function row() {
      if (busy || over) return;
      const next = step(state, cargo);
      if (!next) return;
      const bad = clash(next);
      lock(true);
      api.sfx('click');
      stage.classList.add('river-rowing');
      if (bad) { trouble(bad); return; }
      history.push({ state: state, carry: cargo });
      state = next;
      hintOn = false;
      glow();
      stage.style.setProperty('--row', '1.3s');
      place();
      api.after(1380, () => {
        stage.classList.remove('river-rowing');
        if (cargo) { cargo = null; api.sfx('pop'); }      // 到了，乘客自己下船
        place();
        refresh();
        if (isDone(state)) { finish(); return; }
        lock(false);
        afterTrip();
      });
    }

    /* 划成功一趟之後：走回頭路（連著兩趟載同一樣或都空船）或划了超過 12 趟，就亮出下一步 */
    function afterTrip() {
      if (L.adult) return;
      const n = history.length;
      const loop = n >= 2 && history[n - 1].carry === history[n - 2].carry;
      if (loop || n > 12) {
        if (showHint()) sayAll(['river.back']);
      }
    }

    /* 出事：船划到河中間，岸上演一次，再退回來。提示照累計次數一階一階給。 */
    function trouble(bad) {
      const side = state.boat;                    // 船離開的那一岸
      const actor = nodes[bad === 'wolf' ? 'wolf' : 'goat'].el;
      const victim = nodes[bad === 'wolf' ? 'goat' : 'cabbage'].el;
      const toward = (bad === 'wolf' ? 1 : -1) * (side === 0 ? 1 : -1);   // 演的那個往另一個靠過去的方向
      stage.style.setProperty('--row', '.8s');
      place((BOAT_X[0] + BOAT_X[1]) / 2);
      api.after(620, () => {
        const n = api.miss('row');
        actor.style.setProperty('--dx', toward);
        actor.classList.add(bad === 'wolf' ? 'river-tease' : 'river-nibble');
        victim.classList.add(bad === 'wolf' ? 'river-shiver' : 'river-bitten');
        if (cards[bad]) api.anim(cards[bad], 'river-flash');
        const rule = sayAll(['river.r.' + bad]);    // 那條規則（跟規則卡被點時是同一句）
        api.after(2300, () => {
          actor.classList.remove('river-tease', 'river-nibble');
          victim.classList.remove('river-shiver', 'river-bitten');
          place();
          api.after(820, () => {
            stage.classList.remove('river-rowing');
            lock(false);
            if (L.adult) return;
            // 提示階梯：第 3 關——1 次只念規則、2 次加思考提示、3 次起亮出下一步；第 2 關從第 1 次就亮
            const more = [];
            if (n === 2) more.push('river.think');
            if ((L.first || n >= 3) && showHint()) more.push('river.back');
            const mark = history.length;
            // 規則念完才接著念；孩子已經又划了一趟（或話被打斷）就不念了
            rule.then((ok) => { if (ok && history.length === mark) sayAll(more); });
          });
        });
      });
    }

    function finish() {
      over = true;
      lock(true);
      glow();
      L.items.forEach((id, i) => api.after(i * 160, () => api.anim(nodes[id].art, 'lg-nod')));
      if (L.adult) api.win({ line: 'river.win4', delay: 4600 });
      else if (level === 0) api.win({ delay: 1800 });
      else api.win({ line: 'river.win', delay: 3600 });
    }

    /* 上一步：退回上一趟之前（東西回到岸上、船划回去） */
    function undo() {
      if (busy || over || !history.length) return;
      api.sfx('click');
      state = history.pop().state;
      cargo = null;
      hintOn = false;                 // 剛才亮的是退回去之前那一步
      lock(true);
      stage.style.setProperty('--row', '.6s');
      stage.classList.add('river-rowing');
      place();
      refresh();
      api.after(640, () => { stage.classList.remove('river-rowing'); lock(false); });
    }

    oar.addEventListener('click', row);
    undoBtn.addEventListener('click', undo);

    place();
    refresh();

    api.ask(L.ask).then(() => {
      if (over || history.length || talked) return;
      if (L.first) { talked = true; api.say('river.first'); }
      // 第 1 關：題目念完好一陣子都還沒讓誰上船，就讓小羊亮起來
      if (level === 0) api.after(6000, () => { if (!history.length && !cargo && !over) { hintOn = true; glow(); } });
    });
    if (L.first) { hintOn = true; glow(); }       // 第 2 關：一開始小羊就亮著
    return null;
  }

  Logic.addHouse({
    id: 'river',
    name: 'river.name',
    levels: LEVELS.length,
    intro: ['river.intro1', 'river.intro2'],
    card: (pic) => {
      pic.innerHTML =
        '<span class="river-card-water"></span>' +
        '<img src="assets/story/chars/grandpa-cheer.png" alt="" style="left:9%;top:17%;width:38%">' +
        '<img src="assets/logic/goat.png" alt="" style="left:45%;top:27%;width:44%">' +
        '<span class="river-card-hull">' + hull(false) + '</span>';
    },
    mount: mount,
    test: test
  });
})();
