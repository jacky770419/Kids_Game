/* 動動腦小屋：小偵探（用線索一個一個排除）。對應故事《小熊偵探：誰吃了蜂蜜蛋糕？》（bear-detective）。
   偵探是孩子自己；小熊是出題、陪她的夥伴。

   練的是「一條線索請走一位，最後剩下的就是答案」。試讀時 5 歲孩子卡在兩個地方：
     1. 名單和線索只用聽的記不住 → 名單（嫌疑犯的卡）和找到的線索（牆上的線索列）一直擺在畫面上。
     2.「不是誰？」這種反過來的問法會聽成「是誰」→ 不問問句，改成動作：把跟線索不一樣的那一位拖到門外。

   孩子不需要動物常識，全部用看的比對。每位嫌疑犯一張卡，頭像下面一排標記：
     腳印（大／小）、身上（濕＝水滴／乾＝水滴打叉）、圍巾（粉／藍／黃）
   現場的放大鏡點一下就找到一條線索，線索的圖跟卡上的標記是同一套畫法：
     地板上的腳印是大的（小的）→ 腳印不一樣的請出去
     地板乾乾的 → 濕的請出去；地板濕濕的 → 乾的請出去
     椅子上勾到粉（藍／黃）毛線 → 圍巾不是那個顏色的請出去

   動物的替換：故事裡的名單是小兔、小青蛙、熊爸爸，可是沒有熊爸爸的現成圖，嫌疑犯一律用動物貼紙。
   第 1 案用小兔、小青蛙、大象——大象頂替熊爸爸當「腳很大」的那一位（貼紙裡他的腳最大，一看就懂）。
   貼紙裡的小熊不當嫌疑犯（他是陪孩子辦案的夥伴，也是過關畫面拍手的那一隻）；長頸鹿太瘦長、鯨魚沒有腳，也不用。
   貼紙本身就看得出來的特徵是固定的（FIX）：大象一定大腳、小兔一定小腳、青蛙（坐荷葉）和小鴨（腳邊有水）一定是濕的，
   免得卡上的標記跟圖打架。第 4 關要先選人再指派特徵，所以只用沒有固定特徵的動物。

   四小關：1 故事裡那一案（固定，線索照順序開放）　2 隨機 3 位 2 條線索　3 隨機 4 位 3 條線索
           4 換你出題：孩子偷偷選一位，程式照她選的編一案，請大人來當偵探。
   拖錯不扣分：他搖搖頭回到名單，線索的圖和他卡上那個標記一起放大閃一下；同一條線索錯第 2 次，該請出去的那位會發亮。

   配色（第二輪，照她的喜好）：牆淡粉、地板白藍格子、門窗藍、桌椅白＋粉。
   「粉色底邊＝可以動手」（嫌疑犯的卡、放大鏡點）；「看這裡」的框一律紫色。
   之後會補畫圖檔來換的東西都標了【可換圖】，每一樣只有一個地方在用。 */
(() => {
  'use strict';
  if (!window.Logic) return;

  Logic.lines({
    'detective.name': { zh: '小偵探', en: 'Little Detective' },
    'detective.intro1': { zh: '哎呀！桌上的蛋糕不見了！', en: 'Oh no! The cake on the table is gone!' },
    'detective.intro2': { zh: '你來當偵探，找出是誰吃的！', en: 'You are the detective. Find out who ate it!' },
    'detective.find': { zh: '點一下放大鏡，找線索。', en: 'Tap a magnifying glass to look for a clue.' },
    'detective.c.big': { zh: '地板上有一個很大的腳印。', en: 'There is a great big footprint on the floor.' },
    'detective.c.small': { zh: '地板上有一個很小的腳印。', en: 'There is a tiny little footprint on the floor.' },
    'detective.c.dry': { zh: '地板是乾的，一滴水都沒有。', en: 'The floor is dry. Not one drop of water.' },
    'detective.c.wet': { zh: '地板是濕的，上面有水。', en: 'The floor is wet. There is water on it.' },
    'detective.c.yarn': { zh: '椅子上有一條毛線，是圍巾掉下來的。看看是什麼顏色。', en: 'There is some yarn on the chair. It came off a scarf. Look, what color is it?' },
    'detective.out': { zh: '誰跟線索不一樣？把他拖到門外。', en: 'Who doesn\'t match the clue? Drag that friend out the door.' },
    'detective.notme': { zh: '他跟線索不一樣，所以不是他吃的。', en: 'Not the same as the clue! So this friend didn\'t eat the cake.' },
    'detective.same': { zh: '他跟線索一樣，要留下來。', en: 'Same as the clue! This friend has to stay.' },
    'detective.last': { zh: '只剩下一位了。是誰吃了蛋糕？點一下他。', en: 'Only one friend is left. Who ate the cake? Tap that friend.' },
    'detective.sorry': { zh: '找到了！蛋糕太香，他忍不住吃了。他說對不起。', en: 'You solved it! The cake smelled so good, this friend just had to eat it. Now this friend says sorry.' },
    'detective.pick': { zh: '換你出題！偷偷點一位，蛋糕就是他吃的。別讓大人看到。', en: 'Your turn! Secretly tap one friend. That friend ate the cake! Don\'t let the grown-up see.' },
    'detective.adult': { zh: '選好了！請大人來當偵探。', en: 'All set! Now ask a grown-up to be the detective.' }
  });
  Logic.zy({
    chars: { '圍': 'ㄨㄟˊ', '巾': 'ㄐㄧㄣ',
      '偵': 'ㄓㄣ', '探': 'ㄊㄢˋ', '蜂': 'ㄈㄥ', '蜜': 'ㄇㄧˋ', '線': 'ㄒㄧㄢˋ', '索': 'ㄙㄨㄛˇ',
      '印': 'ㄧㄣˋ', '濕': 'ㄕ', '勾': 'ㄍㄡ', '只': 'ㄓˇ', '忍': 'ㄖㄣˇ', '當': 'ㄉㄤ'
    }
  });

  const INK = '#33274F';
  const C = { pink: '#FF7FB0', blue: '#4AA8EE', yellow: '#FFD84D' };      // 圍巾／毛線的三種顏色
  const PINK = '#FF7FB0', PINK2 = '#DB5890', PINK_MID = '#FFC4DA';
  const BLUE = '#4AA8EE', BLUE_BG = '#DCEEFF', BLUE_MID = '#8CCBF7', SKY = '#CDEBFF';
  const PURPLE = '#9A7BF5', YELLOW = '#FFD84D', WALL = '#FFEAF2';

  /* ---------- 純邏輯（不碰畫面，test() 也用這一段） ---------- */

  const FEATS = ['foot', 'water', 'scarf'];                 // 卡上標記的順序也照這個
  const VALUES = { foot: ['big', 'small'], water: ['wet', 'dry'], scarf: ['pink', 'blue', 'yellow'] };

  /* 嫌疑犯。w／h 是貼紙的長寬，mouth 是嘴巴在圖上的位置（%）——最後道歉時蛋糕屑疊在那裡。
     fix 是貼紙本身就看得出來的特徵，出題時不可以跟它相反。 */
  const ANIMALS = {
    rabbit: { src: 'assets/stickers/rabbit.png', w: 323, h: 512, mouth: [46, 57], fix: { foot: 'small' } },
    frog: { src: 'assets/stickers/frog.png', w: 512, h: 455, mouth: [50, 33], fix: { water: 'wet' } },
    elephant: { src: 'assets/stickers/elephant.png', w: 512, h: 512, mouth: [42, 47], fix: { foot: 'big' } },
    duck: { src: 'assets/stickers/duck.png', w: 507, h: 512, mouth: [46, 45], fix: { water: 'wet' } },
    monkey: { src: 'assets/stickers/monkey.png', w: 512, h: 498, mouth: [47, 45] },
    owl: { src: 'assets/stickers/owl.png', w: 479, h: 512, mouth: [49, 47] },
    panda: { src: 'assets/stickers/panda.png', w: 430, h: 512, mouth: [48, 50] },
    penguin: { src: 'assets/stickers/penguin.png', w: 483, h: 512, mouth: [50, 32] },
    pig: { src: 'assets/stickers/pig.png', w: 512, h: 495, mouth: [31, 54] }
  };
  const POOL = Object.keys(ANIMALS);
  const FREE = POOL.filter((id) => !ANIMALS[id].fix);       // 沒有固定特徵的（第 4 關用）

  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rnd(arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* 第 1 案：故事裡那一案，線索要照順序用（大腳印那一條單獨看會同時請走小兔和小青蛙）。 */
  const CASE1 = {
    suspects: [
      { animal: 'rabbit', foot: 'small', water: 'dry' },
      { animal: 'frog', foot: 'small', water: 'wet' },
      { animal: 'elephant', foot: 'big', water: 'dry' }
    ],
    culprit: 2,
    clues: [{ feat: 'water', value: 'dry' }, { feat: 'foot', value: 'big' }],
    feats: ['foot', 'water'],
    ordered: true
  };

  /* 這條線索會請走誰：還在名單上的人（left 是 suspects 的索引）裡，那個特徵跟線索不一樣的。 */
  function excluded(c, clue, left) {
    return left.filter((i) => c.suspects[i][clue.feat] !== clue.value);
  }

  /* 編一個案子：n 位嫌疑犯、n−1 條線索。
     做法：犯人每種特徵先定一個值，其他人都跟他一樣；再讓每一位「別人」各自只在一種特徵上跟犯人不一樣。
     這樣每條線索不管先用後用都剛好請走一位、每位都不同，全部用完只剩犯人。
     opts.animals：指定哪幾隻（照這個順序）；opts.culprit：指定第幾位是犯人。 */
  function tryCase(n, o, pool) {
    const feats = shuffle(FEATS).slice(0, n - 1);
    const animals = o.animals ? o.animals.slice() : shuffle(pool).slice(0, n);
    const culprit = o.culprit === undefined ? rnd(n) : o.culprit;
    const base = {};
    feats.forEach((f) => { base[f] = pick(VALUES[f]); });
    const suspects = animals.map((a) => Object.assign({ animal: a }, base));
    const others = shuffle(animals.map((_, i) => i).filter((i) => i !== culprit));
    feats.forEach((f, k) => { suspects[others[k]][f] = pick(VALUES[f].filter((v) => v !== base[f])); });
    const clash = suspects.some((s) => {
      const fix = ANIMALS[s.animal].fix || {};
      return feats.some((f) => fix[f] && fix[f] !== s[f]);
    });
    if (clash) return null;
    return {
      suspects: suspects,
      culprit: culprit,
      clues: feats.map((f) => ({ feat: f, value: base[f] })),
      feats: FEATS.filter((f) => feats.indexOf(f) >= 0),
      ordered: false
    };
  }
  function makeCase(n, opts) {
    const o = opts || {};
    for (let i = 0; i < 400; i++) {
      // 抽到跟貼紙打架的就重抽；試了很多次還不行（幾乎不會），改成只用沒有固定特徵的動物
      const c = tryCase(n, o, i < 300 ? POOL : FREE);
      if (c) return c;
    }
    return null;
  }

  /* 線索念哪一句 */
  const clueLine = (clue) => (clue.feat === 'scarf' ? 'yarn' : clue.value);

  /* 驗一個案子，回傳錯誤訊息 */
  function checkCase(c, n, tag) {
    const errs = [];
    const bad = (m) => errs.push(tag + '：' + m);
    if (!c) return [tag + '：編不出案子'];
    const all = c.suspects.map((_, i) => i);
    if (c.suspects.length !== n) bad('人數不是 ' + n);
    if (new Set(c.suspects.map((s) => s.animal)).size !== c.suspects.length) bad('動物重複');
    if (c.clues.length !== n - 1) bad('線索不是 ' + (n - 1) + ' 條');
    if (new Set(c.clues.map((k) => k.feat)).size !== c.clues.length) bad('同一種特徵的線索超過一條');
    if (c.feats.slice().sort().join() !== c.clues.map((k) => k.feat).sort().join()) bad('卡上畫的特徵跟線索用到的不一樣');
    c.suspects.forEach((s) => {
      if (!ANIMALS[s.animal]) { bad('沒有這隻動物：' + s.animal); return; }
      const fix = ANIMALS[s.animal].fix || {};
      c.feats.forEach((f) => {
        if (VALUES[f].indexOf(s[f]) < 0) bad(s.animal + ' 的 ' + f + ' 不是合法的值');
        if (fix[f] && fix[f] !== s[f]) bad(s.animal + ' 的 ' + f + ' 跟貼紙打架');
      });
    });
    c.clues.forEach((k) => {
      if (c.suspects[c.culprit][k.feat] !== k.value) bad('犯人不符合線索 ' + k.feat);
      if (!Logic._lines['detective.c.' + clueLine(k)]) bad('線索沒有台詞：' + clueLine(k));
    });
    // 要驗的順序：固定案只驗寫好的順序，隨機案每一種順序都驗
    const ks = c.clues.map((_, i) => i);
    const orders = [];
    const perm = (head, rest) => {
      if (!rest.length) { orders.push(head); return; }
      rest.forEach((x, i) => perm(head.concat([x]), rest.slice(0, i).concat(rest.slice(i + 1))));
    };
    if (c.ordered) orders.push(ks); else perm([], ks);
    orders.forEach((order) => {
      let left = all.slice();
      order.forEach((k) => {
        const out = excluded(c, c.clues[k], left);
        if (out.length !== 1) bad('順序 ' + order.join('') + ' 的線索 ' + c.clues[k].feat + ' 請走 ' + out.length + ' 位（要剛好 1 位）');
        left = left.filter((i) => out.indexOf(i) < 0);
      });
      if (left.length !== 1 || left[0] !== c.culprit) bad('順序 ' + order.join('') + ' 用完線索，剩下的不是只有犯人');
    });
    if (!c.ordered) {
      const outs = c.clues.map((k) => excluded(c, k, all));
      if (outs.some((o) => o.length !== 1)) bad('有線索單獨看不是剛好請走 1 位');
      if (new Set(outs.map((o) => o[0])).size !== outs.length) bad('兩條線索請走同一位');
    }
    return errs;
  }

  function test() {
    let errs = checkCase(CASE1, 3, '第 1 案');
    const first = excluded(CASE1, CASE1.clues[0], [0, 1, 2]);
    const second = excluded(CASE1, CASE1.clues[1], [0, 2]);
    if (first.join() !== '1' || CASE1.suspects[1].animal !== 'frog') errs.push('第 1 案：第一條線索要請走小青蛙');
    if (second.join() !== '0' || CASE1.suspects[0].animal !== 'rabbit') errs.push('第 1 案：第二條線索要請走小兔');
    if (CASE1.suspects[CASE1.culprit].animal !== 'elephant') errs.push('第 1 案：剩下的要是大象');
    if (FREE.length < 4) errs.push('沒有固定特徵的動物不到 4 隻，第 4 關排不出來');
    // 圍巾是粉／藍／黃；每一種特徵的每一個值，卡上的標記、線索、現場的痕跡都要有圖
    if (VALUES.scarf.join() !== 'pink,blue,yellow') errs.push('圍巾的顏色要是 pink、blue、yellow');
    VALUES.scarf.forEach((v) => { if (!C[v]) errs.push('圍巾顏色沒有色碼：' + v); });
    FEATS.forEach((f) => VALUES[f].forEach((v) => {
      const k = { feat: f, value: v };
      [markName(f, v), clueName(k), traceName(k)].forEach((name) => { if (!pic(name)) errs.push('沒有這張線索圖：' + name); });
    }));
    for (let i = 0; i < 400 && errs.length < 8; i++) {
      errs = errs.concat(checkCase(makeCase(3), 3, '隨機 3 位'));
      errs = errs.concat(checkCase(makeCase(4), 4, '隨機 4 位'));
      // 第 4 關：動物先定、犯人由孩子指定
      const animals = shuffle(FREE).slice(0, 4);
      const who = i % 4;
      const c = makeCase(4, { animals: animals, culprit: who });
      errs = errs.concat(checkCase(c, 4, '出題關'));
      if (c && (c.culprit !== who || c.suspects.map((s) => s.animal).join() !== animals.join())) errs.push('出題關：沒有照指定的動物和犯人');
    }
    return Array.from(new Set(errs)).slice(0, 8);
  }

  /* ---------- 圖（程式畫的：粗黑線、平塗） ---------- */

  const art = (box, sw, inner) => '<svg viewBox="' + box + '" aria-hidden="true"><g stroke="' + INK + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g></svg>';
  const svg = (inner) => art('0 0 100 100', 4, inner);

  /* 腳印：大的佔滿、小的是同一個形狀縮小。紫色——不跟圍巾的粉／藍／黃撞色 */
  const PAW = '<ellipse cx="50" cy="65" rx="25" ry="20" fill="' + PURPLE + '"/>' +
    '<ellipse cx="19" cy="39" rx="9" ry="11" fill="' + PURPLE + '"/><ellipse cx="39" cy="22" rx="9" ry="11" fill="' + PURPLE + '"/>' +
    '<ellipse cx="61" cy="22" rx="9" ry="11" fill="' + PURPLE + '"/><ellipse cx="81" cy="39" rx="9" ry="11" fill="' + PURPLE + '"/>';
  const paw = (size) => svg(size === 'big' ? PAW : '<g transform="translate(50 52) scale(.5) translate(-50 -48)" stroke-width="6.5">' + PAW + '</g>');

  /* 水滴：濕＝三顆藍水滴；乾＝一顆灰水滴打叉 */
  const drop = (x, y, k, fill) => '<path transform="translate(' + x + ' ' + y + ') scale(' + k + ')" stroke-width="' + (4 / k) + '" ' +
    'd="M0-38C12-18 26-4 26 12a26 26 0 0 1-52 0C-26-4-12-18 0-38z" fill="' + fill + '"/>';
  const PUDDLE = '<path d="M10 78c0-9 16-14 40-14s40 5 40 14-16 13-40 13S10 87 10 78z" fill="' + BLUE + '"/>' +
    '<path d="M30 76c6-3 14-4 22-4" fill="none" stroke="#fff" stroke-width="4"/>';

  /* 圍巾（卡上的標記）和毛線（線索）：靠顏色對起來 */
  const scarf = (c) => svg(
    '<path d="M55 46l5 42h24l-9-46z" fill="' + C[c] + '"/>' +
    '<path d="M67 79l1 9M76 78l2 10" fill="none" stroke-width="3"/>' +
    '<path d="M8 24c27 13 57 13 84 0v24c-27 13-57 13-84 0z" fill="' + C[c] + '"/>');
  const YARN_D = 'M9 64C20 28 34 86 48 52S70 24 91 44';
  const yarn = (c) => svg(
    '<path d="' + YARN_D + '" fill="none" stroke-width="19"/>' +
    '<path d="' + YARN_D + '" fill="none" stroke="' + C[c] + '" stroke-width="11"/>');

  /* 【可換圖】線索圖：腳印、水滴、毛線、圍巾，全部正方形、去背。
     同一張圖會用在三個大小：卡上的標記（約 5～7cqw）、線索（放大時約 23cqw、線索列裡約 8cqw）、留在現場的痕跡（約 7cqw）。
     全部只從下面的 pic() 拿——之後換成圖檔只要改 pic() 這一行：
       return '<img src="assets/logic/detective-' + name + '.png" alt="">';
     （樣式已經同時認 svg 和 img。）圖的名字就是下面這些 key。 */
  const PICS = {
    'foot-big': paw('big'),                 // 很大的腳印
    'foot-small': paw('small'),             // 很小的腳印
    'drops': svg(drop(27, 36, .5, BLUE) + drop(73, 36, .5, BLUE) + drop(50, 72, .5, BLUE)),     // 卡上：身上是濕的
    'nodrop': svg(drop(50, 52, 1, '#E7E4F0') +                                                 // 卡上：身上是乾的；線索：地板是乾的
      '<path d="M18 20l64 64M82 20L18 84" fill="none" stroke="' + PINK2 + '" stroke-width="10"/>'),
    'wetfloor': svg(PUDDLE + drop(30, 34, .44, BLUE) + drop(70, 30, .44, BLUE) + drop(50, 50, .36, BLUE)),   // 線索：地板是濕的
    'puddle': svg(PUDDLE),                  // 現場：地板上的一灘水
    'shine': svg('<path d="M30 20l5 13 13 5-13 5-5 13-5-13-13-5 13-5zM70 46l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="' + YELLOW + '" stroke-width="3"/>')   // 現場：地板乾得發亮
  };
  Object.keys(C).forEach((c) => {
    PICS['scarf-' + c] = scarf(c);          // 卡上：圍巾（pink／blue／yellow）
    PICS['yarn-' + c] = yarn(c);            // 線索＋現場：勾在椅子上的毛線
  });
  const pic = (name) => PICS[name];

  /* 哪裡用哪一張：卡上的標記、線索（放大給她看＋線索列）、留在現場的痕跡 */
  const markName = (f, v) => (f === 'foot' ? 'foot-' + v : f === 'water' ? (v === 'wet' ? 'drops' : 'nodrop') : 'scarf-' + v);
  const clueName = (k) => (k.feat === 'foot' ? 'foot-' + k.value : k.feat === 'water' ? (k.value === 'wet' ? 'wetfloor' : 'nodrop') : 'yarn-' + k.value);
  const traceName = (k) => (k.feat === 'foot' ? 'foot-' + k.value : k.feat === 'water' ? (k.value === 'wet' ? 'puddle' : 'shine') : 'yarn-' + k.value);
  const markPic = (f, v) => pic(markName(f, v));
  const cluePic = (k) => pic(clueName(k));
  const tracePic = (k) => pic(traceName(k));

  /* 放大鏡（藍色鏡框、粉色握把）：線索列的空格、現場能按的放大鏡點、選單卡片共用。是介面的記號，不是道具。 */
  const MAG = svg(
    '<path d="M64 64l23 23" fill="none" stroke-width="16"/><path d="M65 65l22 22" fill="none" stroke="' + PINK + '" stroke-width="8"/>' +
    '<circle cx="42" cy="42" r="31" fill="' + BLUE + '"/>' +
    '<circle cx="42" cy="42" r="21" fill="#EAF7FF" stroke-width="3"/>' +
    '<path d="M30 41c1-6 5-10 11-11" fill="none" stroke="#fff" stroke-width="5"/>');

  /* 【可換圖】蛋糕屑：道歉時疊在臉上的兩團臉紅＋嘴邊的蛋糕屑（粉色的蛋糕、黃色的蛋糕體）。
     橫的長方形 2:1（8.4cqw × 4.2cqw），中心對在貼紙的嘴巴上。只有 confess() 一處在用。 */
  const OOPS = art('0 0 100 50', 2.4,
    '<ellipse cx="13" cy="16" rx="12" ry="8" fill="' + PINK + '" stroke="none" opacity=".8"/><ellipse cx="87" cy="16" rx="12" ry="8" fill="' + PINK + '" stroke="none" opacity=".8"/>' +
    '<circle cx="39" cy="33" r="5.5" fill="' + PINK + '"/><circle cx="52" cy="41" r="6" fill="' + YELLOW + '"/>' +
    '<circle cx="64" cy="32" r="5" fill="' + PINK + '"/><circle cx="51" cy="26" r="4" fill="' + YELLOW + '"/>');

  /* 【可換圖】餐廳背景（牆、地板、窗）：一整張鋪滿板面，4:3（100cqw × 75cqw），不能互動。
     淡粉的牆（很淡的圓點壁紙）、白色踢腳板、白藍格子地板、藍框的窗。牆和地板的交界在板面高度的 30.7%（y＝23）。
     只有 mount() 開頭那一處在用。換成圖檔時，椅子、桌子、門是另外疊上去的，背景圖裡不要畫。 */
  const ROOM = (() => {
    let dots = '', tiles = '';
    for (let r = 0; r < 4; r++) for (let x = (r % 2 ? 4.5 : 1.75); x < 100; x += 5.5) dots += 'M' + x + ' ' + (3 + r * 5.3) + 'h.01';
    for (let r = 0; r < 8; r++) for (let c = 0; c < 16; c++) if ((r + c) % 2 === 0) tiles += 'M' + (c * 6.5 - 2) + ' ' + (23 + r * 6.5) + 'h6.5v6.5h-6.5z';
    return art('0 0 100 75', .55,
      '<rect x="-1" y="-1" width="102" height="24" fill="' + WALL + '" stroke="none"/>' +
      '<path d="' + dots + '" fill="none" stroke="#FFD6E5" stroke-width="1"/>' +
      '<rect x="-1" y="23" width="102" height="53" fill="#EDF6FF" stroke="none"/>' +
      '<path d="' + tiles + '" fill="' + BLUE_BG + '" stroke="none"/>' +
      '<rect x="-1" y="21.2" width="102" height="1.8" fill="#fff" stroke="none"/>' +
      '<path d="M-1 21.2h102" fill="none" stroke="#F7B5CD" stroke-width=".3"/><path d="M-1 23h102" fill="none"/>' +
      '<rect x="62.4" y="3.8" width="9.8" height="12.2" rx="1.5" fill="' + BLUE + '"/>' +
      '<g stroke-width=".35" fill="' + SKY + '"><rect x="63.6" y="5" width="3.25" height="4.45" rx=".4"/><rect x="67.75" y="5" width="3.25" height="4.45" rx=".4"/>' +
      '<rect x="63.6" y="10.35" width="3.25" height="4.45" rx=".4"/><rect x="67.75" y="10.35" width="3.25" height="4.45" rx=".4"/></g>' +
      '<rect x="61.6" y="15.4" width="11.4" height="1.5" rx=".7" fill="' + BLUE_MID + '"/>');
  })();

  /* 【可換圖】椅子：白色椅子、粉色椅背板和坐墊。直的長方形 3:5（15cqw × 25cqw），椅腳踩在地板上。
     毛線的放大鏡點和毛線會疊在椅背正中間。只有 mount() 開頭那一處在用。 */
  const CHAIR = art('5.5 10 15 25', .55,
    '<rect x="7.6" y="26" width="1.9" height="8.6" fill="#fff"/><rect x="16.5" y="26" width="1.9" height="8.6" fill="#fff"/>' +
    '<rect x="7.5" y="10.5" width="11" height="13.5" rx="1.8" fill="#fff"/>' +
    '<rect x="9.5" y="12.5" width="7" height="7.6" rx="1.2" fill="' + PINK_MID + '"/>' +
    '<rect x="6" y="23" width="14" height="3.4" rx="1.4" fill="' + PINK + '"/>');

  /* 【可換圖】桌子＋盤子：白色桌子、粉色桌巾，盤子上只剩蛋糕屑和一頂掉下來的小皇冠（不見的是公主蛋糕）。
     橫的長方形 27:22（27cqw × 22cqw），桌腳踩在地板上。腳印的放大鏡點在桌子底下、兩隻桌腳中間。只有 mount() 開頭那一處在用。 */
  const TABLE = art('35.5 15 27 22', .55,
    '<rect x="39.5" y="23" width="2.2" height="13.6" fill="#fff"/><rect x="56.3" y="23" width="2.2" height="13.6" fill="#fff"/>' +
    '<rect x="36" y="19.6" width="26" height="4.4" rx="1.6" fill="#fff"/>' +
    '<path d="M41 19.6h16v6.2q-2 2.2-4 0q-2 2.2-4 0q-2 2.2-4 0q-2 2.2-4 0z" fill="' + PINK + '"/>' +
    '<ellipse cx="49" cy="19.1" rx="6.6" ry="2" fill="#fff"/><ellipse cx="49" cy="18.9" rx="3.8" ry="1" fill="none" stroke="' + PINK_MID + '" stroke-width=".35"/>' +
    '<circle cx="45.4" cy="18.9" r=".45" fill="' + PINK + '" stroke="none"/><circle cx="47.6" cy="19.5" r=".5" fill="' + YELLOW + '" stroke="none"/>' +
    '<circle cx="48.4" cy="18.5" r=".4" fill="' + PINK + '" stroke="none"/>' +
    '<path transform="rotate(16 51.6 18)" d="M50 18.9l-.5-2.2 1.2 1 .9-1.6.9 1.6 1.2-1-.5 2.2z" fill="' + YELLOW + '" stroke-width=".32"/>');

  /* 【可換圖】門：藍色門框、推開的門板、外面的天空、太陽、雲和草地。直的長方形 2:5（24cqw × 60cqw）。
     被請出去的朋友（貼紙）會疊在門洞的下半。只有 mount() 開頭那一處在用。 */
  const DOOR = art('0 0 48 120', 1.1,
    '<rect x="1" y="1" width="46" height="118" rx="8" fill="' + BLUE + '"/>' +
    '<rect x="5.5" y="5.5" width="37" height="109" rx="5" fill="' + SKY + '"/>' +
    '<circle cx="32" cy="21" r="6.5" fill="' + YELLOW + '"/>' +
    '<path d="M15 42a4 4 0 0 1 4-4 5 5 0 0 1 9-1 4.5 4.5 0 0 1 4 5z" fill="#fff" stroke-width=".8"/>' +
    '<path d="M5.5 72c8-6 15-6 21-2s11 3 16-1v40.5a5 5 0 0 1-5 5h-27a5 5 0 0 1-5-5z" fill="#CFF2EC"/>' +
    '<path d="M5.5 5.5l5.5 6v97l-5.5 6z" fill="' + BLUE_MID + '"/><circle cx="8.3" cy="62" r="1.3" fill="' + YELLOW + '" stroke-width=".6"/>');

  /* 【可換圖】公主蛋糕（不見的那一個）：粉色蛋糕、白色奶油、上面一頂小皇冠。正方形（選單卡片寬度的 64%）。
     只有選單卡片（addHouse 的 card）一處在用。 */
  const CAKE = svg(
    '<ellipse cx="50" cy="86" rx="45" ry="9" fill="#fff"/>' +
    '<path d="M16 50h68v30a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6z" fill="' + PINK + '"/>' +
    '<path d="M16 54v-8a8 8 0 0 1 8-8h52a8 8 0 0 1 8 8v8q-5.5 9-11 0q-6 9-11.5 0q-5.5 9-11.5 0q-6 9-11.5 0q-5.5 9-11 0q-5.5 9-11.5 0z" fill="#fff"/>' +
    '<path d="M35 38l-4-19 11 8 8-13 8 13 11-8-4 19z" fill="' + YELLOW + '"/>' +
    '<circle cx="50" cy="30" r="3" fill="' + PINK + '" stroke-width="2.4"/>');

  /* 放大鏡點在現場的位置（板面的 %）：腳印在桌子底下、水在椅子和桌子中間的地板、毛線在椅背 */
  const SPOT = { foot: [49, 44], water: [28, 45], scarf: [13, 23] };

  /* ---------- 畫面 ---------- */

  function mount(stage, api, level) {
    const el = api.el;
    let dead = false;
    let c = null;                 // 這一案
    let alive = [];               // 還在名單上的人
    let active = -1;              // 正在用的線索
    let phase = 'find';           // pick 出題的人在選｜find 找線索｜show 線索放大中｜clue 請人出去｜wait 等一句話念完｜last 只剩一位｜done
    const done = [];              // 第 k 條線索用完了沒
    let cards = [];
    const slots = [], spots = [], traces = [];

    // 背景一整張鋪滿板面；椅子、桌子、門各自一塊疊在上面（之後換圖也是一塊換一塊）
    stage.appendChild(el('div', 'detective-room', ROOM));
    stage.appendChild(el('div', 'detective-chair', CHAIR));
    stage.appendChild(el('div', 'detective-table', TABLE));
    const board = el('div', 'detective-clues');
    const door = el('div', 'detective-door', DOOR);
    const zone = el('div', 'detective-zone');
    const outside = el('div', 'detective-outside');
    const list = el('div', 'detective-list');
    door.appendChild(zone);
    door.appendChild(outside);
    stage.appendChild(board);
    stage.appendChild(door);
    stage.appendChild(list);

    /* 念一句，等它念完（而且至少過了 ms）才往下走——免得下一句題目把這一句切掉 */
    function gate(line, ms, fn) {
      let said = false, waited = false;
      const go = () => { if (said && waited && !dead) fn(); };
      api.say(line).then(() => { said = true; go(); });
      api.after(ms, () => { waited = true; go(); });
    }

    function buildCards(ids, nFeats) {
      list.classList.add('n' + ids.length, 'f' + nFeats);
      cards = ids.map((id, i) => {
        const a = ANIMALS[id];
        const card = el('div', 'detective-card');
        card.dataset.who = id;
        const face = el('div', 'detective-face');
        const pic = el('div', 'detective-pic', '<img src="' + a.src + '" alt="">');
        pic.style.aspectRatio = a.w + ' / ' + a.h;
        const marks = el('div', 'detective-marks');
        face.appendChild(pic);
        card.appendChild(face);
        card.appendChild(marks);
        list.appendChild(card);
        api.drag(card, {
          zones: () => [{ el: zone }],
          onTap: () => tapCard(i),
          onDrop: (hit) => dropCard(i, hit)
        });
        return { id: id, el: card, pic: pic, marks: marks };
      });
    }

    function setMarks() {
      cards.forEach((cd, i) => {
        cd.marks.innerHTML = '';
        c.feats.forEach((f) => {
          const m = el('span', 'detective-mark', markPic(f, c.suspects[i][f]));
          m.dataset.f = f;
          m.dataset.v = c.suspects[i][f];
          cd.marks.appendChild(m);
        });
      });
    }

    /* 案子定了：擺線索列的空格、現場的放大鏡點，開始找線索 */
    function begin() {
      alive = c.suspects.map((_, i) => i);
      c.clues.forEach((clue, k) => {
        done[k] = false;
        const slot = el('div', 'detective-slot', MAG);
        board.appendChild(slot);
        slots.push(slot);
        const at = SPOT[clue.feat];
        const trace = el('div', 'detective-trace t-' + clue.feat, tracePic(clue));
        const spot = el('button', 'detective-spot', MAG);
        spot.type = 'button';
        spot.dataset.clue = clue.feat;
        spot.setAttribute('aria-label', '找線索');
        [trace, spot].forEach((n) => { n.style.left = at[0] + '%'; n.style.top = at[1] + '%'; stage.appendChild(n); });
        spot.addEventListener('click', () => findClue(k));
        traces.push(trace);
        spots.push(spot);
      });
      toFind();
    }

    function showSpots(on) {
      const first = done.indexOf(false);
      spots.forEach((s, k) => s.classList.toggle('on', on && !done[k] && (!c.ordered || k === first)));
    }

    function toFind() {
      phase = 'find';
      showSpots(true);
      api.ask('detective.find');
    }

    /* 點放大鏡：線索放大給她看、小熊念一句，念完縮成小卡飛到線索列，題目換成「請出去」 */
    function findClue(k) {
      if (phase !== 'find' || done[k]) return;
      const clue = c.clues[k];
      phase = 'show';
      active = k;
      showSpots(false);
      api.sfx('pop');
      traces[k].classList.add('on');
      const big = el('div', 'detective-big', cluePic(clue));
      stage.appendChild(big);
      api.anim(big, 'lg-pop');
      gate('detective.c.' + clueLine(clue), 1600, () => {
        const sr = stage.getBoundingClientRect(), r = slots[k].getBoundingClientRect();
        big.classList.add('fly');
        big.style.left = ((r.left - sr.left) / sr.width * 100) + '%';
        big.style.top = ((r.top - sr.top) / sr.height * 100) + '%';
        big.style.width = (r.width / sr.width * 100) + '%';
        big.style.height = (r.height / sr.height * 100) + '%';
        api.after(480, () => {
          big.remove();
          slots[k].innerHTML = cluePic(clue);
          slots[k].classList.add('has', 'now');
          slots[k].dataset.feat = clue.feat;
          slots[k].dataset.value = clue.value;
          phase = 'clue';
          api.ask('detective.out');
        });
      });
    }

    /* 請出去的那位：名單上留一個空位（位置不動，免得其他卡跑來跑去），他變成門外的小頭像 */
    function sendOut(i) {
      const cd = cards[i];
      alive = alive.filter((x) => x !== i);
      cd.el.classList.add('gone', 'lg-locked');
      const o = el('div', 'detective-outie', '<img src="' + ANIMALS[cd.id].src + '" alt="">');
      o.dataset.who = cd.id;
      outside.appendChild(o);
      api.anim(o, 'detective-hop');
    }

    function afterClue() {
      if (alive.length === 1) {
        phase = 'last';
        api.anim(cards[alive[0]].el, 'lg-pop');
        api.ask('detective.last');
      } else {
        toFind();
      }
    }

    function dropCard(i, hit) {
      const cd = cards[i];
      if (!hit) return false;                       // 沒放到門上：自己滑回去，不算錯
      const shake = () => api.after(300, () => api.anim(cd.el, 'lg-shake'));
      if (phase === 'find') {
        // 還沒找線索就拖人：彈回去，放大鏡跳一下
        api.sfx('no');
        shake();
        spots.forEach((s) => { if (s.classList.contains('on')) api.anim(s, 'lg-pop'); });
        api.ask('detective.find');
        return false;
      }
      if (phase === 'last') { shake(); api.ask('detective.last'); return false; }
      if (phase !== 'clue') { shake(); return false; }

      const k = active, clue = c.clues[k];
      if (c.suspects[i][clue.feat] !== clue.value) {
        // 拖對了：他跟線索不一樣，不是他
        api.sfx('snap');
        cards.forEach((x) => x.el.classList.remove('lg-glow'));
        sendOut(i);
        if (excluded(c, clue, alive).length) { api.say('detective.notme'); return true; }   // 這條線索還能再請走別人
        done[k] = true;
        active = -1;
        phase = 'wait';
        slots[k].classList.remove('now');
        slots[k].classList.add('done');
        slots[k].appendChild(el('span', 'detective-tick', UI.icon('check')));
        gate('detective.notme', 900, afterClue);
        return true;
      }
      // 拖錯了：他的跟線索一樣。線索的圖和他卡上那個標記一起閃，讓孩子比
      const n = api.miss('clue' + k);
      api.after(300, () => {
        api.anim(cd.el, 'lg-shake');
        api.anim(slots[k], 'detective-cmp');
        api.anim(cd.marks.querySelector('[data-f="' + clue.feat + '"]'), 'detective-cmp');
      });
      api.say('detective.same');
      if (n >= 2) excluded(c, clue, alive).forEach((j) => cards[j].el.classList.add('lg-glow'));
      return false;
    }

    function tapCard(i) {
      if (phase === 'pick') { choose(i); return; }
      if (phase === 'last' && alive[0] === i) { confess(i); return; }
      api.sfx('pop');
      api.anim(cards[i].el, 'lg-pop');
      if (phase === 'clue') api.anim(door, 'lg-nod');     // 點了沒拖：門動一下，提醒是拖到這裡
    }

    /* 只剩一位，點他：臉紅、嘴邊有蛋糕屑，老實道歉 */
    function confess(i) {
      const cd = cards[i], a = ANIMALS[cd.id];
      phase = 'done';
      cd.el.classList.add('lg-locked', 'caught');
      const oops = el('div', 'detective-oops', OOPS);
      oops.style.left = a.mouth[0] + '%';
      oops.style.top = a.mouth[1] + '%';
      cd.pic.appendChild(oops);
      api.sfx('pop');
      api.anim(cd.el, 'lg-nod');
      api.win({ line: 'detective.sorry', delay: 5200 });
    }

    /* 第 4 關：出題的人選好了。照她選的編一案，每張卡同時跳一下（看不出選了誰） */
    function choose(i) {
      phase = 'wait';
      api.sfx('click');
      c = makeCase(4, { animals: cards.map((cd) => cd.id), culprit: i });
      setMarks();
      cards.forEach((cd) => api.anim(cd.el, 'lg-pop'));
      gate('detective.adult', 1400, begin);
    }

    if (level === 3) {
      buildCards(shuffle(FREE).slice(0, 4), 3);
      phase = 'pick';
      api.ask('detective.pick');
    } else {
      c = level === 0 ? CASE1 : makeCase(level === 1 ? 3 : 4);
      buildCards(c.suspects.map((s) => s.animal), c.feats.length);
      setMarks();
      begin();
    }

    return { destroy() { dead = true; } };
  }

  Logic.addHouse({
    id: 'detective',
    name: 'detective.name',
    levels: 4,
    intro: ['detective.intro1', 'detective.intro2'],
    card: (pic) => {
      pic.innerHTML =
        '<span class="detective-card-pic" style="left:5%;top:5%;width:64%">' + CAKE + '</span>' +
        '<span class="detective-card-pic" style="right:4%;bottom:4%;width:54%">' + MAG + '</span>';
    },
    mount: mount,
    test: test
  });
})();
