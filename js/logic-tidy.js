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

   【可換圖】之後會補畫新圖：六樣玩具（TOYS 的 art）、籃子上的圖示（BADGE）、籃子（css/logic-tidy.css 的 .tidy-basket）。
   換的時候只改各自那一處；熊媽媽現在用 assets/logic/mama.png。 */
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

  /* 【可換圖】六樣玩具：程式畫的，粗黑線、平塗，跟貼紙同一個味道。布做的那兩樣有縫線和補丁。
     每樣都是正方形（viewBox 100×100）：地上約 13cqw 見方、籃子裡約 11cqw。換成圖檔時把 art 改成
     '<img src="assets/logic/toy-ball.png" alt="">' 這種字串就好（css 的 .tidy-art svg 那幾條要加上 img）。 */
  const TOYS = [
    { id: 'ball', color: 'pink', kind: 'roll', animal: false, art: svg(
      '<circle cx="50" cy="52" r="36" fill="' + C.pink + '"/>' +
      '<path d="M17 44c20 12 46 12 66 0" fill="none" stroke="#fff" stroke-width="7"/>' +
      '<circle cx="38" cy="32" r="6" fill="#fff" stroke="none"/>') },
    { id: 'car', color: 'blue', kind: 'roll', animal: false, art: svg(
      '<path d="M10 62V50c0-5 4-8 9-8h8l9-15h28l10 15h8c5 0 8 3 8 8v12z" fill="' + C.blue + '"/>' +
      '<path d="M33 42l6-10h10v10zM55 32h8l7 10H55z" fill="#DFF3FF" stroke-width="3"/>' +
      '<circle cx="29" cy="66" r="11" fill="#fff"/><circle cx="71" cy="66" r="11" fill="#fff"/>' +
      '<circle cx="29" cy="66" r="3" fill="' + INK + '"/><circle cx="71" cy="66" r="3" fill="' + INK + '"/>') },
    { id: 'duck', color: 'yellow', kind: 'sound', animal: true, art: svg(
      '<path d="M16 62c0-10 8-16 20-14 4-2 8-3 12-3 20 0 36 12 36 26 0 9-8 13-34 13S16 76 16 62z" fill="' + C.yellow + '"/>' +
      '<circle cx="36" cy="36" r="18" fill="' + C.yellow + '"/>' +
      '<path d="M20 36c-8 0-12 3-12 6s5 5 12 4z" fill="#FFA228"/>' +
      '<circle cx="33" cy="31" r="3.4" fill="' + INK + '" stroke="none"/>' +
      '<path d="M54 64c6 6 16 6 22-2" fill="none" stroke-width="3"/>') },
    // 魔法棒：整支都是粉紅色（棒子和星星），照顏色分的時候才不會被看成別的顏色；旁邊兩道弧線表示「搖了有聲音」
    { id: 'wand', color: 'pink', kind: 'sound', animal: false, art: svg(
      '<path d="M56 48L20 90" fill="none" stroke-width="16"/>' +
      '<path d="M56 48L20 90" fill="none" stroke="' + C.pink + '" stroke-width="9"/>' +
      '<path d="M66 6l7.3 17.7 19 1.6-14.4 12.5 4.4 18.6L66 46.3 49.700 56.4l4.4-18.6L39.700 25.300l19-1.6z" fill="' + C.pink + '"/>' +
      '<circle cx="66" cy="31" r="5" fill="#fff" stroke="none"/>' +
      '<path d="M90 50c3 4 3 9 0 13M83 55c2 2 2 5 0 7" fill="none" stroke-width="3"/>' +
      '') },
    { id: 'fish', color: 'blue', kind: 'cloth', animal: true, art: svg(
      '<path d="M8 50c12-18 30-26 46-24 10 1 18 6 24 14l16-12v44L78 60c-6 8-14 13-24 14-16 2-34-6-46-24z" fill="' + C.blue + '"/>' +
      '<path d="M16 50c10-12 24-18 36-17 8 1 15 5 20 11" ' + STITCH + '/>' +
      '<rect x="44" y="48" width="16" height="14" rx="2" fill="#FFE9A8" stroke-width="2.6"/>' +
      '<path d="M48 52l8 6M56 52l-8 6" fill="none" stroke-width="2.2"/>' +
      '<circle cx="26" cy="44" r="3.4" fill="' + INK + '" stroke="none"/>') },
    { id: 'chick', color: 'yellow', kind: 'cloth', animal: true, art: svg(
      '<ellipse cx="50" cy="60" rx="32" ry="28" fill="' + C.yellow + '"/>' +
      '<circle cx="50" cy="30" r="20" fill="' + C.yellow + '"/>' +
      '<path d="M44 34l6 8 6-8z" fill="#FFA228" stroke-width="3"/>' +
      '<circle cx="42" cy="26" r="3" fill="' + INK + '" stroke="none"/><circle cx="58" cy="26" r="3" fill="' + INK + '" stroke="none"/>' +
      '<path d="M24 62c6 14 18 20 26 20s20-6 26-20" ' + STITCH + '/>' +
      '<rect x="56" y="56" width="15" height="13" rx="2" fill="#FFB3C7" stroke-width="2.6"/>' +
      '<path d="M60 60l7 5M67 60l-7 5" fill="none" stroke-width="2.2"/>') }
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
        '<span class="tidy-card-toy" style="left:8%;top:10%;width:40%">' + TOYS[0].art + '</span>' +
        '<span class="tidy-card-toy" style="right:6%;top:14%;width:46%">' + TOYS[1].art + '</span>' +
        '<span class="tidy-card-toy" style="left:28%;bottom:4%;width:46%">' + TOYS[2].art + '</span>';
    },
    mount: mount
  });
})();
