/* 動動腦小屋：小熊收玩具（分一分）。對應故事《小熊收玩具》（bear-tidy）。

   練的是「同一堆東西可以有很多種分法」。六樣玩具、三種分法，每樣都只進得了一籃：
     會滾（球、小汽車）／會出聲音（小鴨、魔法棒）／布做的（小魚、小雞）
     粉紅（球、魔法棒）／藍（汽車、魚）／黃（鴨、雞）
     動物（鴨、魚、雞）／不是動物（球、汽車、魔法棒）
   跟故事不一樣的地方（照她的喜好換的：她喜歡粉色、藍色和公主）：故事裡的球和小喇叭是紅色的，
   這裡球改成粉紅色、紅色小喇叭換成粉紅色的魔法棒（一搖就響，一樣是「會出聲音」那一籃）。分法和答案都沒變。
   四小關：1 照籃子上的圖分　2 媽媽分好了，猜她照什麼分（顏色）　3 動物和不是動物　4 自己分，考大人。

   試讀時孩子在「小汽車也會叭叭叫」猶豫過，所以每樣玩具只演一種特徵（小汽車只會滾）。
   放錯不扣分：玩具彈回去、自己演一次特徵；同一樣錯兩次，對的籃子會亮起來。

   六樣玩具是畫好的圖（assets/logic/toy-*.png，TOYS 的 art）；熊媽媽用 assets/logic/mama.png。
   【可換圖】還是程式畫的：籃子上的圖示（BADGE）、籃子（css/logic-tidy.css 的 .tidy-basket）。換的時候只改各自那一處。 */
(() => {
  'use strict';
  if (!window.Logic) return;

  Logic.lines({
    'tidy.name': { zh: '小熊收玩具', en: 'Bear Tidies Up' },
    'tidy.intro1': { zh: '小熊的玩具丟了滿地。', en: 'Little Bear\'s toys are all over the floor.' },
    'tidy.intro2': { zh: '你來幫他收進籃子裡！', en: 'Come help him put them in the baskets!' },
    'tidy.ask1': { zh: '看籃子上的圖，把玩具放進去。', en: 'Look at the picture on each basket. Put the toys in.' },
    'tidy.ask2': { zh: '媽媽分好了。你猜媽媽是照什麼分的？點一張圖。', en: 'Mama sorted them. Can you guess how? Tap a card.' },
    'tidy.ask3': { zh: '這次分兩籃。一籃放動物，一籃放不是動物的。', en: 'This time there are two baskets. One for animals, and one for things that are not animals.' },
    'tidy.ask4': { zh: '換你出題！你想怎麼分都可以，分好按綠色按鈕。', en: 'Your turn! Sort them any way you like. Then press the green button.' },
    'tidy.done4': { zh: '分好了！請大人猜猜看，你是怎麼分的。', en: 'All sorted! Ask a grown-up to guess how you did it.' },
    'tidy.hint2': { zh: '看看同一籃的玩具，哪裡一樣？', en: 'Look at the toys in one basket. What is the same?' },
    'tidy.yes2': { zh: '答對了！媽媽是照顏色分的。', en: 'Yes! Mama sorted them by color.' },
    'tidy.hint3': { zh: '想一想，它是不是動物？', en: 'Let\'s think. Is it an animal?' },
    'tidy.b.roll': { zh: '會滾的放這裡。', en: 'Things that roll go here.' },
    'tidy.b.sound': { zh: '會出聲音的放這裡。', en: 'Things that make a sound go here.' },
    'tidy.b.cloth': { zh: '布做的放這裡。', en: 'Things made of cloth go here.' },
    'tidy.b.animal': { zh: '動物放這裡。', en: 'Animals go here.' },
    'tidy.b.other': { zh: '不是動物的放這裡。', en: 'Things that are not animals go here.' },
    'tidy.t.ball': { zh: '粉紅色的球，會滾。', en: 'The pink ball rolls.' },
    'tidy.t.car': { zh: '藍色的小汽車，有輪子，會滾。', en: 'The blue car has wheels. It rolls.' },
    'tidy.t.duck': { zh: '黃色的小鴨，一捏就叫。', en: 'The yellow duck squeaks when you squeeze it.' },
    'tidy.t.wand': { zh: '粉紅色的魔法棒，一搖就有聲音。', en: 'The pink magic wand makes a sound when you shake it.' },
    'tidy.t.fish': { zh: '藍色的小魚，是布做的。', en: 'The blue fish is made of cloth.' },
    'tidy.t.chick': { zh: '黃色的小雞，是布做的。', en: 'The yellow chick is made of cloth.' }
  });

  const INK = '#33274F';
  const C = { pink: '#FF7FB0', blue: '#4AA8EE', yellow: '#FFD84D' };
  const svg = (inner) => '<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g></svg>';
  const STITCH = 'fill="none" stroke-width="2.4" stroke-dasharray="4 5"';

  /* 六樣玩具：畫好的圖（去背 PNG、粗黑線平塗，跟貼紙同一套）。六張比例都不一樣（球接近正方、小汽車是橫的、
     小雞和魔法棒是直的），一律放進正方形的框 .tidy-art 裡等比縮放、置中（css 的 .tidy-art img）：
     地上 13cqw 見方、籃子裡 11cqw（兩籃那關 12.5cqw）。選單卡片上的三樣也是用這裡的 art。
     魔法棒整支是粉紅色（星星也是），只有一顆很小的淡金色鈴鐺，照顏色分的時候還是粉紅色那一籃。 */
  const TOYS = [
    { id: 'ball', color: 'pink', kind: 'roll', animal: false, art: '<img src="assets/logic/toy-ball.png" alt="">' },
    { id: 'car', color: 'blue', kind: 'roll', animal: false, art: '<img src="assets/logic/toy-car.png" alt="">' },
    { id: 'duck', color: 'yellow', kind: 'sound', animal: true, art: '<img src="assets/logic/toy-duck.png" alt="">' },
    { id: 'wand', color: 'pink', kind: 'sound', animal: false, art: '<img src="assets/logic/toy-wand.png" alt="">' },
    { id: 'fish', color: 'blue', kind: 'cloth', animal: true, art: '<img src="assets/logic/toy-fish.png" alt="">' },
    { id: 'chick', color: 'yellow', kind: 'cloth', animal: true, art: '<img src="assets/logic/toy-chick.png" alt="">' }
  ];

  /* 【可換圖】籃子上的圖：會滾＝輪子在滾、會出聲音＝音符、布做的＝補丁、顏色＝一坨顏料、動物＝腳印、不是動物＝腳印打叉 */
  const PAW = '<ellipse cx="50" cy="62" rx="20" ry="16" fill="' + INK + '" stroke="none"/><circle cx="26" cy="40" r="8" fill="' + INK + '" stroke="none"/><circle cx="43" cy="28" r="8" fill="' + INK + '" stroke="none"/><circle cx="60" cy="28" r="8" fill="' + INK + '" stroke="none"/><circle cx="76" cy="40" r="8" fill="' + INK + '" stroke="none"/>';
  const blob = (c) => svg('<path d="M50 14c18 0 34 12 34 30 0 10-8 12-8 20 0 12-12 22-28 22S16 74 16 56c0-22 14-42 34-42z" fill="' + C[c] + '"/>');
  const BADGE = {
    roll: svg('<circle cx="56" cy="52" r="28" fill="#fff"/><circle cx="56" cy="52" r="7" fill="' + INK + '"/><path d="M56 24v56M28 52h56" fill="none" stroke-width="3"/><path d="M8 38h14M4 52h16M8 66h14" fill="none"/>'),
    sound: svg('<path d="M38 70V26l36-8v44" fill="none" stroke-width="6"/><ellipse cx="28" cy="72" rx="12" ry="9" fill="' + INK + '"/><ellipse cx="64" cy="64" rx="12" ry="9" fill="' + INK + '"/>'),
    cloth: svg('<rect x="18" y="20" width="64" height="60" rx="8" fill="#FFB3C7"/><rect x="27" y="29" width="46" height="42" rx="4" ' + STITCH + '/><path d="M40 42l20 16M60 42L40 58" fill="none" stroke-width="3.4"/>'),
    pink: blob('pink'), blue: blob('blue'), yellow: blob('yellow'),
    animal: svg(PAW),
    other: svg('<g opacity=".35">' + PAW + '</g><path d="M18 18l64 64M82 18L18 82" fill="none" stroke="#FF7FB0" stroke-width="9"/>')
  };

  /* 每一關：籃子的 key，跟「這樣玩具該進哪一籃」 */
  const LEVELS = [
    { baskets: ['roll', 'sound', 'cloth'], of: (t) => t.kind, ask: 'tidy.ask1' },
    { baskets: ['pink', 'blue', 'yellow'], of: (t) => t.color, ask: 'tidy.ask2', guess: true },
    { baskets: ['animal', 'other'], of: (t) => (t.animal ? 'animal' : 'other'), ask: 'tidy.ask3' },
    { baskets: ['a', 'b', 'c'], of: null, ask: 'tidy.ask4', free: true }
  ];
  const DEMO = { roll: 'tidy-roll', sound: 'tidy-squeak', cloth: 'tidy-soft' };
  const DEMO_OF = { wand: 'tidy-wave' };      // 魔法棒是用搖的，不是捏的

  function mount(stage, api, level) {
    const L = LEVELS[level];
    const el = api.el;
    const floor = el('div', 'tidy-floor');
    const row = el('div', 'tidy-baskets n' + L.baskets.length);
    stage.appendChild(floor);
    stage.appendChild(row);

    const baskets = L.baskets.map((key) => {
      const b = el('div', 'tidy-basket');
      b.dataset.key = key;
      const slots = el('div', 'tidy-slots');
      b.appendChild(slots);
      if (BADGE[key] && !L.guess) {
        const badge = el('button', 'tidy-badge', BADGE[key]);
        badge.type = 'button';
        badge.addEventListener('click', () => { api.sfx('click'); api.anim(badge, 'lg-pop'); api.say('tidy.b.' + key); });
        b.appendChild(badge);
      }
      row.appendChild(b);
      return { key: key, el: b, slots: slots };
    });

    // 玩具
    const order = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
    const placed = {};                       // 玩具 id → 籃子 key
    const toys = order.map((idx, n) => {
      const t = TOYS[idx];
      const node = el('div', 'tidy-toy');
      node.dataset.toy = t.id;
      node.appendChild(el('div', 'tidy-art', t.art));
      node.style.setProperty('--tilt', ((n % 2 ? 1 : -1) * (4 + (n * 3) % 7)) + 'deg');
      return { t: t, el: node, art: node.firstChild };
    });

    const demo = (toy) => {
      api.anim(toy.art, DEMO_OF[toy.t.id] || DEMO[toy.t.kind]);
      // 魔法棒搖一搖有聲音：三個往上的音
      if (toy.t.id === 'wand') [1047, 1319, 1568].forEach((f, i) => api.after(120 + i * 130, () => api.tone(f, 0.22)));
    };

    function put(toy, basket) {
      placed[toy.t.id] = basket.key;
      basket.slots.appendChild(toy.el);
      api.anim(toy.el, 'lg-pop');
    }

    function check() {
      if (L.free || Object.keys(placed).length < TOYS.length) return;
      api.win();
    }

    if (L.guess) {
      /* 第 2 關：媽媽已經照顏色分好，孩子從三張圖卡裡選「照什麼分的」 */
      stage.classList.add('tidy-guess');
      toys.forEach((toy) => {
        put(toy, baskets.find((b) => b.key === L.of(toy.t)));
        toy.el.addEventListener('click', () => { demo(toy); api.sfx('pop'); });
      });
      const mama = el('img', 'tidy-mama');
      mama.src = 'assets/logic/mama.png';
      mama.alt = '';
      floor.appendChild(mama);
      const cards = el('div', 'tidy-cards');
      floor.appendChild(cards);
      const RULES = [
        { key: 'color', art: '<i>' + BADGE.pink + '</i><i>' + BADGE.blue + '</i><i>' + BADGE.yellow + '</i>' },
        { key: 'kind', art: '<i>' + BADGE.roll + '</i><i>' + BADGE.sound + '</i><i>' + BADGE.cloth + '</i>' },
        { key: 'animal', art: '<i>' + BADGE.animal + '</i><i>' + BADGE.other + '</i>' }
      ].sort(() => Math.random() - 0.5);
      let solved = false;
      RULES.forEach((r) => {
        const c = el('button', 'tidy-card btn', r.art);
        c.type = 'button';
        c.dataset.rule = r.key;
        c.addEventListener('click', () => {
          if (solved) return;
          if (r.key === 'color') {
            solved = true;
            api.sfx('snap');
            c.classList.add('selected');
            baskets.forEach((b) => { b.el.classList.add('tint-' + b.key); });
            api.win({ line: 'tidy.yes2', delay: 2600 });
            return;
          }
          const n = api.miss('guess');
          api.anim(c, 'lg-shake');
          api.say('tidy.hint2');
          // 錯兩次：一籃一籃染上顏色給她看；錯三次：對的那張卡亮起來
          if (n >= 2) baskets.forEach((b, i) => api.after(500 + i * 700, () => { b.el.classList.add('tint-' + b.key); api.anim(b.el, 'lg-pop'); }));
          if (n >= 3) cards.querySelector('[data-rule="color"]').classList.add('lg-glow');
        });
        cards.appendChild(c);
      });
      api.ask(L.ask);
      return null;
    }

    toys.forEach((toy) => {
      floor.appendChild(toy.el);
      api.drag(toy.el, {
        zones: () => baskets.map((b) => ({ el: b.el, basket: b })),
        onTap: () => {
          demo(toy);
          api.sfx('pop');
          if (!L.free) api.say('tidy.t.' + toy.t.id);
        },
        onDrop: (zone) => {
          if (!zone) {
            // 自己分的那一關：拖回地上＝拿出來
            if (L.free && placed[toy.t.id]) { delete placed[toy.t.id]; floor.appendChild(toy.el); refreshDone(); return true; }
            return false;
          }
          const b = zone.basket;
          if (L.free) {
            api.sfx('snap');
            put(toy, b);
            refreshDone();
            return true;
          }
          if (L.of(toy.t) === b.key) {
            api.sfx('snap');
            put(toy, b);
            toy.el.classList.add('lg-locked');
            baskets.forEach((x) => x.el.classList.remove('lg-glow'));
            check();
            return true;
          }
          // 放錯：彈回去，自己演一次特徵；同一樣錯兩次，對的籃子亮起來
          const n = api.miss(toy.t.id);
          api.anim(b.el, 'lg-shake');
          api.after(320, () => demo(toy));
          api.say(level === 2 ? 'tidy.hint3' : 'tidy.t.' + toy.t.id);
          if (n >= 2) baskets.find((x) => x.key === L.of(toy.t)).el.classList.add('lg-glow');
          return false;
        }
      });
    });

    let doneBtn = null;
    function refreshDone() {
      if (!doneBtn) return;
      doneBtn.disabled = Object.keys(placed).length < TOYS.length;
    }
    if (L.free) {
      doneBtn = el('button', 'btn go lg-go', '<i data-ic="check"></i>');
      doneBtn.type = 'button';
      doneBtn.setAttribute('aria-label', '分好了');
      doneBtn.disabled = true;
      doneBtn.addEventListener('click', () => { api.win({ line: 'tidy.done4', delay: 4200 }); });
      stage.appendChild(doneBtn);
    }

    api.ask(L.ask);
    return null;
  }

  Logic.addHouse({
    id: 'tidy',
    name: 'tidy.name',
    levels: LEVELS.length,
    intro: ['tidy.intro1', 'tidy.intro2'],
    card: (pic) => {
      pic.innerHTML =
        '<span class="tidy-card-toy" style="left:6%;top:8%;width:38%">' + TOYS[0].art + '</span>' +
        '<span class="tidy-card-toy" style="right:4%;top:13%;width:46%">' + TOYS[1].art + '</span>' +
        '<span class="tidy-card-toy" style="left:27%;bottom:3%;width:48%">' + TOYS[2].art + '</span>';
    },
    mount: mount
  });
})();
