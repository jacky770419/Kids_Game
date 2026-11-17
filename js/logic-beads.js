/* 動動腦小屋：公主串項鍊（找規律、接下去）。對應故事《小美的串珠項鍊》（mei-beads）。

   故事裡是小美串項鍊送奶奶；遊戲把主角換成孩子自己——「今天你是公主，要自己串項鍊」。
   原因：她喜歡公主，而且要當動手解謎的主角（不是去幫別人的忙，也不是公主等人來幫）。
   所以台詞裡沒有小美和奶奶，畫面上站在旁邊的公主就是她自己：每串完一條，公主開心跳一下。
   配色照她的喜好：粉、藍為主，板面是很淡的藍，珠子盒是粉色的珠寶盒。

   練的是「照一樣的順序排下去」。試讀時 5 歲孩子卡在「一口氣念七顆顏色，只用聽的記不住」，
   所以整條項鍊一直擺在畫面上讓她用看的；小熊不逐顆念顏色，改成每一種珠子一個音高，
   答錯時項鍊從頭一顆一顆亮起來、一顆一個音，讓她「聽」出節奏。

   六小關（前五關每關連做 3 條才過關，題目由程式隨機出）：
     1 兩色交替 ABAB（給 6 接 2）　2 AAB 或 ABB（給 6 接 3）　3 同色大小珠：大小交替、大小小、大大小（給 6 接 3）
     4 三色 ABC（給 6 接 3）　5 找少掉的那一顆（故事裡奶奶的舊項鍊；遊戲裡只說「這條項鍊掉了一顆」）
     6 換你出題：自己串，考大人，不驗對錯
   第 1、2 關的第一條固定用粉＋藍（她最喜歡的兩色），其他的隨機。
   放錯不扣分：珠子滑回盒子、項鍊從頭亮一遍。同一個空位錯第 2 次，盒子裡多的錯珠子變淡
   （本來只有兩種就讓對的發亮）；錯第 3 次，對的那顆發亮。 */
(() => {
  'use strict';
  if (!window.Logic) return;

  Logic.lines({
    'beads.name': { zh: '公主串項鍊', en: 'Princess Necklaces' },
    'beads.intro1': { zh: '今天你是公主，要自己串項鍊。', en: 'Today you are the princess! You get to make the necklaces all by yourself.' },
    'beads.intro2': { zh: '珠子照順序排隊，你來接下去！', en: 'The beads line up in a pattern. You keep it going!' },
    'beads.ask1': { zh: '下一顆是什麼顏色？把它串上去。', en: 'What color comes next? Put it on the string.' },
    'beads.ask3': { zh: '下一顆是大的，還是小的？', en: 'What comes next? A big one, or a small one?' },
    'beads.ask5': { zh: '這條項鍊掉了一顆。掉的是什麼顏色？把它放回去。', en: 'This necklace lost a bead. What color is missing? Put it back.' },
    'beads.ask6': { zh: '換你出題！串一條你自己的項鍊，串好按綠色按鈕。', en: 'Your turn! Make a necklace of your own. Then press the green button.' },
    'beads.done6': { zh: '串好了！請大人猜猜看，下一顆是什麼。', en: 'All done! Ask a grown-up to guess what comes next.' },
    'beads.hint': { zh: '從頭看一遍，聽聽看。', en: 'Let\'s look from the start. Listen!' },
    'beads.hint2': { zh: '再聽一次。珠子是怎麼排隊的？', en: 'Listen again. How do the beads line up?' },
    'beads.hint3': { zh: '試試看發亮的這一顆。', en: 'Try the one that is glowing.' },
    'beads.next': { zh: '串好了，真漂亮！再來一條。', en: 'You finished it, and it is so pretty! Here comes another one.' }
  });
  Logic.zy({
    chars: { '串': 'ㄔㄨㄢˋ', '珠': 'ㄓㄨ', '順': 'ㄕㄨㄣˋ', '序': 'ㄒㄩˋ', '隊': 'ㄉㄨㄟˋ', '遍': 'ㄅㄧㄢˋ' }
  });

  const INK = '#33274F';
  const BOARD = '#EEF7FF';          // 板面的底色（css 的 .lg-beads 也是這一色）；空位用它，才不會被看成一顆白珠子
  /* 珠子只用這六色：粉、藍為主，不用紅、橘、綠（綠色留給「好了」的按鈕） */
  const COLORS = { pink: '#FF7FB0', blue: '#4AA8EE', purple: '#9A7BF5', yellow: '#FFD84D', cyan: '#22C3B6', white: '#FFFFFF' };
  const NAMES = Object.keys(COLORS);
  /* 同一條項鍊不同時出現的顏色：小孩在螢幕上容易看成同一色 */
  const CLASH = [['blue', 'cyan']];
  const FAVE = ['pink', 'blue'];    // 第 1、2 關的第一條用這兩色
  const ROUNDS = 3;                 // 每一小關連做幾條
  const FREE = 5;                   // 第 6 小關：換你出題
  const FREE_MAX = 8, FREE_MIN = 4;

  /* ---------- 純邏輯（不碰畫面，test() 也用這一段） ---------- */

  const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  const clash = (a, b) => CLASH.some((c) => (c[0] === a && c[1] === b) || (c[0] === b && c[1] === a));
  const colorKey = (kinds) => Array.from(new Set(kinds.map((k) => k.color))).sort().join('+');

  /* 挑 n 個互相不會看錯的顏色；not 是上一條用過的那一組（連著兩條不要長一樣） */
  function pickColors(n, rnd, not) {
    for (let t = 0; t < 200; t++) {
      const c = shuffle(NAMES, rnd).slice(0, n);
      const ok = c.every((a, i) => c.every((b, j) => i >= j || !clash(a, b)));
      if (ok && c.slice().sort().join('+') !== not) return c;
    }
    return ['blue', 'yellow', 'purple'].slice(0, n);
  }

  /* 一小關的三條各用哪一段規律。數字是「第幾種珠子」；大小關的 0＝大、1＝小。 */
  function planUnits(level, rnd) {
    const AB = [0, 1], AAB = [0, 0, 1], ABB = [0, 1, 1], ABC = [0, 1, 2];
    if (level === 0) return [AB, AB, AB];
    if (level === 1) return shuffle([AAB, ABB], rnd).concat([pick([AAB, ABB], rnd)]);
    if (level === 2) return [AB, ABB, pick([[1, 0], AAB, ABB], rnd)];     // 大小、大小小（故事裡阿福那條）、再一條隨機
    if (level === 3) return [ABC, ABC, ABC];
    return [AB, pick([AB, ABC], rnd), ABC];                                // 找少掉的那一顆
  }

  /* 出一條項鍊：
       kinds  這一題有哪幾種珠子 [{ color, size: 'L'|'S' }]
       unit   重複的那一段（kinds 的編號）
       seq    整條項鍊每一顆是哪一種
       blanks 要孩子放的位置（由前到後）
       box    盒子裡從左到右擺哪幾種 */
  function makePuzzle(level, unit, rnd, not, colors) {
    const sized = level === 2;
    const missing = level === 4;
    let kinds;
    if (sized) {
      const c = pickColors(1, rnd, not)[0];
      kinds = [{ color: c, size: 'L' }, { color: c, size: 'S' }];
    } else {
      const used = Math.max.apply(null, unit) + 1;
      kinds = (colors || pickColors(missing ? 3 : used, rnd, not)).map((c) => ({ color: c, size: 'L' }));   // 第 5 關盒子一律三種，多的那種是陪襯
    }
    const total = missing ? (unit.length === 2 ? 8 : 9) : 6 + (level === 0 ? 2 : 3);
    const seq = Array.from({ length: total }, (_, i) => unit[i % unit.length]);
    const blanks = [];
    if (missing) blanks.push(1 + Math.floor(rnd() * (total - 2)));          // 不在頭、不在尾
    else for (let i = 6; i < total; i++) blanks.push(i);
    return { level: level, sized: sized, missing: missing, kinds: kinds, unit: unit.slice(), seq: seq, blanks: blanks, box: shuffle(kinds.map((_, i) => i), rnd) };
  }

  function makeSet(level, rnd) {
    let not = '';
    return planUnits(level, rnd).map((unit, i) => {
      const fave = (i === 0 && level < 2) ? shuffle(FAVE, rnd) : null;      // 哪一色排前面隨機
      const p = makePuzzle(level, unit, rnd, not, fave);
      not = colorKey(p.kinds);
      return p;
    });
  }

  function makeFree(rnd) {
    const kinds = pickColors(3, rnd, '').map((c) => ({ color: c, size: 'L' }));
    return { level: FREE, free: true, kinds: kinds, unit: [], seq: new Array(FREE_MAX).fill(-1), blanks: Array.from({ length: FREE_MAX }, (_, i) => i), box: [0, 1, 2] };
  }

  /* 每一種珠子一個音：do、mi、sol；大小關是大的低、小的高 */
  function noteOf(p, k) {
    return p.sized ? [392.0, 659.25][k] : [523.25, 659.25, 783.99][k];
  }

  /* 一串珠子是不是「每 n 顆重複一次」；看得出來的規律至少要完整出現兩輪 */
  const periodic = (a, n) => a.every((v, i) => i < n || v === a[i - n]);
  function periods(a) {
    const out = [];
    for (let n = 1; n * 2 <= a.length; n++) if (periodic(a, n)) out.push(n);
    return out;
  }

  /* 驗一題：回傳錯誤訊息（沒有錯就是空陣列） */
  function checkPuzzle(p) {
    const errs = [];
    const tag = '第 ' + (p.level + 1) + ' 關［' + p.seq.join('') + '｜空 ' + p.blanks.join(',') + '］';
    const bad = (m) => errs.push(tag + m);
    p.kinds.forEach((k, i) => {
      if (!COLORS[k.color]) bad('用了不在表上的顏色 ' + k.color);
      p.kinds.forEach((o, j) => {
        if (i < j && k.color === o.color && k.size === o.size) bad('盒子裡有兩種一模一樣的珠子');
        if (i < j && clash(k.color, o.color)) bad('同一條有容易看錯的兩色 ' + k.color + '／' + o.color);
      });
    });
    if (p.box.slice().sort().join() !== p.kinds.map((_, i) => i).join()) bad('盒子和珠子種類對不起來');
    p.blanks.forEach((i) => { if (p.box.indexOf(p.seq[i]) < 0) bad('盒子裡沒有第 ' + (i + 1) + ' 顆要的珠子'); });

    if (p.missing) {
      const g = p.blanks[0];
      if (p.blanks.length !== 1 || !(g > 0 && g < p.seq.length - 1)) bad('空位要剛好一個，而且不在頭尾');
      // 盒子裡每一種都補補看：只有一種補完整條說得通（照某個長度重複）
      const fits = p.box.filter((k) => { const a = p.seq.slice(); a[g] = k; return periods(a).length > 0; });
      if (fits.length !== 1 || fits[0] !== p.seq[g]) bad('空位說得通的補法不是剛好一種：' + fits.join(','));
      // 沒被空位打斷的完整一輪至少兩輪
      let whole = 0;
      for (let s = 0; s + p.unit.length <= p.seq.length; s += p.unit.length) if (g < s || g >= s + p.unit.length) whole++;
      if (whole < 2) bad('完整的規律不到兩輪');
      return errs;
    }

    const given = p.seq.slice(0, p.blanks[0]);
    if (p.blanks.some((b, n) => b !== given.length + n) || given.length + p.blanks.length !== p.seq.length) bad('要接的位置應該連在最後面');
    if (given.length < p.unit.length * 2) bad('已經給的珠子不到兩輪');
    const ps = periods(given);
    if (!ps.length) bad('已經給的珠子看不出規律');
    else if (ps[0] !== p.unit.length) bad('看起來的規律長度是 ' + ps[0] + '，不是 ' + p.unit.length);
    // 已經給的珠子不管照哪一種說得通的長度接下去，答案都要一樣
    ps.forEach((n) => {
      const a = given.slice();
      p.blanks.forEach((i) => { a[i] = a[i - n]; });
      if (a.join() !== p.seq.join()) bad('照每 ' + n + ' 顆重複會接出別的答案');
    });
    return errs;
  }

  function test() {
    const errs = [];
    if (NAMES.join() !== 'pink,blue,purple,yellow,cyan,white') errs.push('珠子的顏色應該是粉、藍、紫、黃、青、白');
    CLASH.concat([FAVE]).forEach((c) => c.forEach((n) => { if (!COLORS[n]) errs.push('規則裡有不在表上的顏色 ' + n); }));
    if (clash(FAVE[0], FAVE[1])) errs.push('第一條要用的兩色不能是容易看錯的一對');
    let seed = 20240607;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    for (let level = 0; level < FREE; level++) {
      for (let t = 0; t < 400; t++) {
        const set = makeSet(level, rnd);
        if (set.length !== ROUNDS) errs.push('第 ' + (level + 1) + ' 關不是 ' + ROUNDS + ' 條');
        set.forEach((p, i) => {
          checkPuzzle(p).forEach((e) => errs.push(e));
          if (i && colorKey(p.kinds) === colorKey(set[i - 1].kinds)) errs.push('第 ' + (level + 1) + ' 關連著兩條顏色一樣');
          if (!i && level < 2 && colorKey(p.kinds) !== FAVE.slice().sort().join('+')) errs.push('第 ' + (level + 1) + ' 關的第一條應該是粉＋藍');
          if (p.kinds.some((_, k) => !(noteOf(p, k) > 0))) errs.push('第 ' + (level + 1) + ' 關有珠子沒有音');
          const want = level === 0 ? 2 : level === 4 ? 1 : 3;
          if (p.blanks.length !== want) errs.push('第 ' + (level + 1) + ' 關要接 ' + want + ' 顆，出了 ' + p.blanks.length + ' 顆');
          if (level < 4 && p.blanks[0] !== 6) errs.push('第 ' + (level + 1) + ' 關應該先給 6 顆');
          if (level === 2 && !(p.kinds.length === 2 && p.kinds[0].color === p.kinds[1].color && p.kinds[0].size !== p.kinds[1].size)) errs.push('大小關要同色的大珠小珠');
        });
      }
    }
    for (let t = 0; t < 100; t++) {
      const f = makeFree(rnd);
      if (f.kinds.length !== 3 || f.kinds.some((k, i) => !COLORS[k.color] || f.kinds.some((o, j) => i < j && (o.color === k.color || clash(o.color, k.color))))) errs.push('出題關的三種珠子有問題');
    }
    return Array.from(new Set(errs)).slice(0, 12);
  }

  /* ---------- 畫 ---------- */

  const svg = (inner) => '<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g></svg>';

  /* 【可換圖】珠子。項鍊上、珠寶盒裡、選單卡片上的珠子都從這一個函式來。
     現在是程式畫的：圓、粗墨線、左上一點白色高光、右下一道淡淡的影子；大珠小珠只差半徑。
     白珠子沒有顏色可以靠，所以影子畫深一點、寬一點（高光在白底上看不見，就不畫）。
     之後換圖：這裡改成回傳 '<img src="assets/logic/bead-' + kind.color + '.png" alt="">' 就好
     （正方形、去背、珠子佔滿約 88%；小珠是同一張圖縮成 61%，可以在 img 上加 style="scale:.61"）。
     外框是正方形 9.6cqw（卡片上是卡片寬的 21%）。 */
  function beadArt(kind) {
    const r = kind.size === 'S' ? 27 : 44;
    const white = kind.color === 'white';
    const hx = 50 - r * 0.4, hy = 50 - r * 0.42;
    const q = r * (white ? 0.66 : 0.7);
    return svg(
      '<circle cx="50" cy="50" r="' + r + '" fill="' + COLORS[kind.color] + '"/>' +
      '<path d="M' + (50 + q).toFixed(1) + ' ' + (50 - q * 0.25).toFixed(1) + 'A' + q.toFixed(1) + ' ' + q.toFixed(1) + ' 0 0 1 ' + (50 - q * 0.25).toFixed(1) + ' ' + (50 + q).toFixed(1) + '" fill="none" stroke-opacity="' + (white ? '.2' : '.16') + '" stroke-width="' + (r * (white ? 0.24 : 0.16)).toFixed(1) + '"/>' +
      (white ? '' : '<ellipse cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" rx="' + (r * 0.24).toFixed(1) + '" ry="' + (r * 0.15).toFixed(1) + '" fill="#fff" stroke="none" transform="rotate(-38 ' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ')"/>'));
  }
  /* 空位：虛線圈，裡面是板面的底色（不用白色：白色現在是一種珠子） */
  const EMPTY = svg('<circle cx="50" cy="50" r="40" fill="' + BOARD + '" stroke-width="3.6" stroke-dasharray="9 10"/>');

  /* 【可換圖】珠寶盒（裝珠子的盒子，平的、不能按）。只在 start() 裡用一次，鋪在一格一格的珠子後面。
     現在是 css 畫的粉色圓角盒（.beads-box）加前面一顆愛心扣。
     之後換圖：這裡改成回傳 '<img class="beads-box" src="assets/logic/jewel-box.png" alt="">'，
     圖會被拉成盒子的大小——三種珠子時 57.2×18.8cqw（約 3:1）、兩種時 39×18.8cqw（約 2:1），
     所以要嘛畫成可以橫向拉伸的樣子，要嘛兩種寬度各一張。格子（.beads-cell，17×15cqw）的淡粉底要不要留看圖決定。 */
  function boxArt() {
    return '<div class="beads-box"><svg class="beads-clasp" viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M50 88C22 66 8 49 8 31C8 17 18 8 30 8C39 8 46 13 50 21C54 13 61 8 70 8C82 8 92 17 92 31C92 49 78 66 50 88Z" fill="#FFD84D" stroke="' + INK + '" stroke-width="8" stroke-linejoin="round"/></svg></div>';
  }

  /* 公主（就是孩子自己）：畫好的圖「捧著粉藍項鍊的公主」（348×512，直的、去背，跟貼紙 princess.png 是同一位）。
     只在 mount() 裡用一次，站在板面右下角，串完一條會跳一下。
     外框 .beads-princess 高 23cqw、寬約 15.7cqw，圖在框裡等比縮放、貼齊底邊。 */
  function princessArt() {
    return '<img src="assets/logic/princess-necklace.png" alt="">';
  }

  /* 項鍊是一條往下垂的弧線。單位是 cqw（板面寬 100、高 75）。 */
  const PITCH = 10.2, TOP = 20, SAG = 12;
  const yAt = (x) => TOP + SAG * (1 - Math.pow((x - 50) / 50, 2));
  const STRING = (() => {
    let d = '';
    for (let x = -2; x <= 102; x += 4) d += (d ? 'L' : 'M') + x + ' ' + yAt(x).toFixed(2);
    return '<svg class="beads-string" viewBox="0 0 100 75" aria-hidden="true"><path d="' + d + '" fill="none" stroke="#2B82C9" stroke-width=".7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  })();

  function mount(stage, api, level) {
    const el = api.el;
    const free = level === FREE;
    const set = free ? [makeFree(Math.random)] : makeSet(level, Math.random);
    let round = 0;
    let p = null;                   // 現在這一條
    let lace = null, slots = [], filled = [], srcs = [];
    let at = 0;                     // 輪到 p.blanks 的第幾個空位
    let busy = false;               // 演出中（整條亮一遍、換下一條）先不收珠子
    let token = 0;                  // 「從頭亮一遍」演到一半又有新動作，舊的就停
    let tapK = -1, tapT = 0;        // 上一次點進去的是哪一種、什麼時候

    /* 第幾條／共 3 條：三顆小圓點（平的，不能按） */
    const dots = [];
    if (!free) {
      const box = el('div', 'beads-dots');
      for (let i = 0; i < ROUNDS; i++) { const d = el('span', 'beads-dot', window.UI ? UI.icon('check') : ''); dots.push(d); box.appendChild(d); }
      stage.appendChild(box);
    }
    /* 拖到項鍊附近就算數（小手指對不準那一格），算放在「下一個空位」 */
    const band = el('div', 'beads-band');
    const tray = el('div', 'beads-tray');
    const princess = el('div', 'beads-princess', princessArt());
    stage.appendChild(band);
    stage.appendChild(princess);
    stage.appendChild(tray);

    let goBtn = null;
    if (free) {
      goBtn = el('button', 'btn go lg-go', '<i data-ic="check"></i>');
      goBtn.type = 'button';
      goBtn.setAttribute('aria-label', '串好了');
      goBtn.disabled = true;
      goBtn.addEventListener('click', () => {
        if (busy || at < FREE_MIN) return;
        busy = true;
        token++;
        markFront();
        srcs.forEach((s) => s.el.classList.add('lg-locked'));
        goBtn.disabled = true;
        api.sfx('click');
        playAll(170, () => { api.anim(princess, 'beads-joy2'); api.win({ line: 'beads.done6', delay: 4400 }); });
      });
      stage.appendChild(goBtn);
    }

    const note = (k) => noteOf(p, k);
    const frontIdx = () => (at < p.blanks.length ? p.blanks[at] : -1);

    function setSlot(i, k) {
      filled[i] = k;
      slots[i].innerHTML = k < 0 ? EMPTY : beadArt(p.kinds[k]);
      slots[i].classList.toggle('empty', k < 0);
    }

    /* 標出「下一個空位」。出題關另外標出最後一顆（點它可以拿掉）。 */
    function markFront() {
      const f = busy ? -1 : frontIdx();
      slots.forEach((s, i) => {
        s.classList.toggle('now', i === f);
        if (i === f && !free) s.dataset.want = p.seq[i]; else delete s.dataset.want;   // 給自動測試找答案用
        const last = free && !busy && at > 0 && i === p.blanks[at - 1];
        if (last !== s.classList.contains('last')) {
          s.classList.toggle('last', last);
          const x = s.querySelector('.beads-x');
          if (x) x.remove();
          if (last && window.UI) s.appendChild(el('b', 'beads-x', UI.icon('close')));
        }
      });
      dots.forEach((d, i) => { d.classList.toggle('now', i === round); d.classList.toggle('ok', i < round); });
      if (goBtn) goBtn.disabled = busy || at < FREE_MIN;
    }

    function clearHints() {
      srcs.forEach((s) => s.el.classList.remove('lg-glow', 'beads-off', 'lg-locked'));
    }

    function ping(i) {
      api.anim(slots[i], 'beads-ping');
      api.tone(note(filled[i]), 0.32);
    }

    /* 整條從頭亮一遍（做完一條、出題關按「好了」） */
    function playAll(step, then) {
      const my = token;
      slots.forEach((s, i) => {
        if (filled[i] < 0) return;
        api.after(i * step, () => { if (my === token) ping(i); });
      });
      api.after(slots.length * step + 300, () => { if (my === token) then(); });
    }

    /* 答錯：從頭一顆一顆亮到空位，空位自己跳一下（第 5 關跳過空位再亮完後面的） */
    function replay() {
      const my = ++token;
      const f = frontIdx();
      let t = 650;
      for (let i = 0; i < slots.length; i++) {
        if (filled[i] < 0 && i !== f) break;
        const idx = i;
        api.after(t, () => {
          if (my !== token) return;
          if (filled[idx] >= 0) ping(idx); else api.anim(slots[idx], 'beads-ask');
        });
        t += 380;
      }
    }

    function wrong(k, i, src, tapped) {
      const n = api.miss(round + ':' + i);
      if (tapped) api.anim(src, 'lg-shake');
      const right = p.seq[i];
      const wrongs = p.box.filter((x) => x !== right);
      const srcOf = (x) => srcs.find((s) => s.k === x).el;
      let line = 'beads.hint';
      if (n >= 3 || (n === 2 && wrongs.length < 2)) {
        srcOf(right).classList.add('lg-glow');
        line = 'beads.hint3';
      } else if (n === 2) {
        // 只留對的和一顆錯的：留規律裡有的那一種，兩種都有就留她剛才沒選的
        const inUnit = wrongs.filter((x) => p.unit.indexOf(x) >= 0);
        const keep = inUnit.find((x) => x !== k) !== undefined ? inUnit.find((x) => x !== k) : (inUnit.length ? inUnit[0] : wrongs[0]);
        wrongs.forEach((x) => { if (x !== keep) srcOf(x).classList.add('beads-off', 'lg-locked'); });
        line = 'beads.hint2';
      }
      // 先把提示念完，再從頭一顆一顆亮：同時來的話語音會蓋住要她聽的音高
      api.say(line).then(() => replay());
    }

    /* 把第 k 種珠子放到下一個空位。回傳 true＝收下。 */
    function place(k, src, tapped) {
      if (busy) return false;
      const i = frontIdx();
      if (i < 0) { if (goBtn) api.anim(goBtn, 'lg-pop'); return false; }      // 出題關串滿了
      if (!free && p.seq[i] !== k) { wrong(k, i, src, tapped); return false; }
      token++;
      setSlot(i, k);
      api.sfx('snap');
      api.tone(note(k), 0.36);
      api.anim(slots[i], 'lg-pop');
      api.anim(src.firstChild, 'lg-pop');       // 盒子裡馬上又冒出一顆：拿不完
      at++;
      clearHints();
      if (!free && at === p.blanks.length) finish(); else markFront();
      return true;
    }

    function finish() {
      busy = true;
      markFront();
      api.after(520, () => {
        playAll(150, () => {
          api.anim(lace, 'lg-nod');             // 整條跳一下：串好了
          api.anim(princess, round + 1 >= ROUNDS ? 'beads-joy2' : 'beads-joy');   // 公主開心跳一下（整關過關跳兩下）
          if (round + 1 >= ROUNDS) {
            dots[round].classList.add('ok');
            dots[round].classList.remove('now');
            api.win();
            return;
          }
          round++;
          markFront();
          api.say('beads.next');
          api.after(900, () => {
            const old = lace;
            old.classList.add('beads-out');
            api.after(380, () => { old.remove(); start(); });
          });
        });
      });
    }

    function start() {
      p = set[round];
      at = 0;
      filled = [];
      lace = el('div', 'beads-lace' + (p.sized ? ' beads-sized' : ''), STRING);
      const n = p.seq.length;
      slots = p.seq.map((k, i) => {
        const x = 50 + (i - (n - 1) / 2) * PITCH;
        const s = el('div', 'beads-slot');
        s.style.left = x.toFixed(2) + '%';
        s.style.top = (yAt(x) / 0.75).toFixed(2) + '%';
        if (free) {
          // 出題關：點最後一顆＝拿掉
          s.addEventListener('click', () => {
            if (busy || at < 1 || i !== p.blanks[at - 1]) return;
            token++;
            setSlot(i, -1);
            at--;
            api.sfx('pop');
            markFront();
          });
        }
        lace.appendChild(s);
        return s;
      });
      p.seq.forEach((k, i) => setSlot(i, p.blanks.indexOf(i) >= 0 ? -1 : k));
      stage.insertBefore(lace, band);
      if (round > 0) api.anim(lace, 'beads-in');

      tray.innerHTML = '';
      srcs = p.box.map((k) => {
        const cell = el('div', 'beads-cell');
        const src = el('div', 'beads-src', '<div class="beads-art">' + beadArt(p.kinds[k]) + '</div>');
        src.dataset.kind = k;
        cell.appendChild(src);
        tray.appendChild(cell);
        api.drag(src, {
          zones: () => {
            const f = frontIdx();
            const z = [];
            if (f >= 0) z.push({ el: slots[f], front: true });
            slots.forEach((s, i) => { if (filled[i] < 0 && i !== f) z.push({ el: s, front: false }); });
            z.push({ el: band, front: true });
            return z;
          },
          onTap: () => {
            // 小手指常常連點兩下：剛放上去的同一種，緊接著的第二下不算
            const now = Date.now();
            if (k === tapK && now - tapT < 280) return;
            if (place(k, src, true)) { tapK = k; tapT = now; }
          },
          onDrop: (zone) => {
            if (!zone || busy) return false;
            // 放到後面的空位：不算錯，讓「下一個空位」跳一下告訴她先放這裡
            if (!zone.front) { const f = frontIdx(); if (f >= 0) api.anim(slots[f], 'beads-ask'); return false; }
            return place(k, src, false);
          }
        });
        return { k: k, el: src };
      });
      tray.insertAdjacentHTML('beforeend', boxArt());
      busy = false;
      markFront();
    }

    start();
    api.ask(free ? 'beads.ask6' : level === 2 ? 'beads.ask3' : level === 4 ? 'beads.ask5' : 'beads.ask1');
    return null;
  }

  Logic.addHouse({
    id: 'beads',
    name: 'beads.name',
    levels: 6,
    intro: ['beads.intro1', 'beads.intro2'],
    card: (pic) => {
      const cs = ['pink', 'blue', 'pink', 'blue', 'pink'];
      pic.innerHTML =
        '<svg class="beads-card-line" viewBox="0 0 100 100" aria-hidden="true"><path d="M-2 28Q50 84 102 28" fill="none" stroke="#2B82C9" stroke-width="2.4" stroke-linecap="round"/></svg>' +
        cs.map((c, i) => {
          const x = 14 + i * 18, t = (x + 2) / 104;
          const y = 28 + 112 * t * (1 - t);
          return '<span class="beads-card-bead" style="left:' + (x - 10.5) + '%;top:' + (y - 10.5).toFixed(1) + '%">' + beadArt({ color: c, size: 'L' }) + '</span>';
        }).join('');
    },
    mount: mount,
    test: test
  });
})();
