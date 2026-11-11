/* 甜點店的畫圖：把甜點狀態畫成 SVG 字串（板面、材料匣的小圖、點餐泡泡的小圖共用）。

   為什麼現場畫而不是用圖檔：一層蛋糕有十種顏色、疊一到三層、再淋九種奶油，
   做成圖檔是幾千種組合；用 SVG 字串畫，顏色只是一個參數。
   板面是 800×600 的 SVG（跟貼紙背景同一個比例），📷 存圖時直接把同一份字串
   轉成 blob 畫進 canvas，畫面與存出來的圖保證一模一樣。

   這支負責店面背景、配料的擺放與整個板面；七種甜點本體在 js/cake-shapes.js，
   配料的圖在 js/cake-toppings.js。

   畫風跟全站的「貼紙書」一致：墨線 #2b2b2b、粗外框、平塗色。
   純字串進、字串出，不碰 DOM——tools/check_cake.js 才能在 Node 裡斷言。 */
(function (global) {
  'use strict';

  var req = typeof require === 'function' ? require : null;
  var Data = global.CakeData || (req && req('./cake-data.js'));
  var Shapes = global.CakeShapes || (req && req('./cake-shapes.js'));
  var Art = global.CakeToppings || (req && req('./cake-toppings.js'));

  var INK = '#2b2b2b';
  var W = 800;
  var H = 600;
  var CENTER_X = 400;
  var DROP_K = 0.5;     // 拖放的配料一律這個大小：夠大好拿，放在哪一層都不會比蛋糕還大

  function n1(v) { return Math.round(v * 10) / 10; }

  /* ===== 店面背景：粉紅條紋牆＋兩側層架＋紅白遮雨棚＋木頭櫃台 =====
     層架放在左右兩邊（x < 150、x > 650），甜點中間那一塊留白，配料才看得清楚。
     點餐模式左邊會被客人和泡泡蓋住，沒關係，那只是背景。 */
  var LINE5 = ' stroke="' + INK + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';

  function shelf(x0, x1, y) {
    return '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="14" rx="4" fill="#E8A85C"' + LINE5 + '/>'
      + '<path d="M' + (x0 + 16) + ',' + (y + 14) + ' L' + (x0 + 16) + ',' + (y + 34) + ' L' + (x0 + 34) + ',' + (y + 14)
      + ' M' + (x1 - 16) + ',' + (y + 14) + ' L' + (x1 - 16) + ',' + (y + 34) + ' L' + (x1 - 34) + ',' + (y + 14) + '" fill="none"' + LINE5 + '/>';
  }

  /* 糖果罐：玻璃罐裡一顆一顆彩色糖 */
  function candyJar(x, y) {
    var out = '<rect x="' + (x - 30) + '" y="' + (y - 74) + '" width="60" height="74" rx="16" fill="#EAF7FF"' + LINE5 + '/>';
    var balls = [[-14, -14, '#FF6B9A'], [6, -16, '#FFD93D'], [18, -30, '#4ECDC4'], [-6, -32, '#B79CFF'], [-16, -46, '#FFB05C'], [10, -48, '#8EDB8A']];
    balls.forEach(function (b) { out += '<circle cx="' + (x + b[0]) + '" cy="' + (y + b[1]) + '" r="10" fill="' + b[2] + '" stroke="' + INK + '" stroke-width="3"/>'; });
    return out + '<rect x="' + (x - 24) + '" y="' + (y - 86) + '" width="48" height="16" rx="6" fill="#FF6B6B"' + LINE5 + '/>'
      + '<path d="M' + (x - 20) + ',' + (y - 60) + ' L' + (x - 20) + ',' + (y - 22) + '" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.9"/>';
  }

  /* 小盆栽 */
  function plant(x, y) {
    return '<g fill="#8EDB8A"' + LINE5 + '><ellipse cx="' + (x - 12) + '" cy="' + (y - 52) + '" rx="12" ry="18" transform="rotate(-25 ' + (x - 12) + ' ' + (y - 52) + ')"/>'
      + '<ellipse cx="' + (x + 12) + '" cy="' + (y - 52) + '" rx="12" ry="18" transform="rotate(25 ' + (x + 12) + ' ' + (y - 52) + ')"/>'
      + '<ellipse cx="' + x + '" cy="' + (y - 62) + '" rx="11" ry="19"/></g>'
      + '<path d="M' + (x - 20) + ',' + (y - 34) + ' L' + (x + 20) + ',' + (y - 34) + ' L' + (x + 14) + ',' + y + ' L' + (x - 14) + ',' + y + ' Z" fill="#FF9F6B"' + LINE5 + '/>';
  }

  /* 一疊馬卡龍 */
  function macarons(x, y) {
    var out = '';
    [['#B79CFF', 0], ['#FF9EC4', 26], ['#8EDB8A', 52]].forEach(function (m) {
      var yy = y - 13 - m[1];
      out += '<rect x="' + (x - 26) + '" y="' + (yy - 12) + '" width="52" height="24" rx="12" fill="' + m[0] + '"' + LINE5 + '/>'
        + '<path d="M' + (x - 22) + ',' + yy + ' L' + (x + 22) + ',' + yy + '" stroke="#FFF4DF" stroke-width="5" stroke-linecap="round"/>';
    });
    return out;
  }

  /* 牛奶瓶 */
  function milk(x, y) {
    return '<path d="M' + (x - 12) + ',' + (y - 80) + ' L' + (x + 12) + ',' + (y - 80) + ' L' + (x + 12) + ',' + (y - 62) + ' Q' + (x + 22) + ',' + (y - 54) + ' ' + (x + 22) + ',' + (y - 40)
      + ' L' + (x + 22) + ',' + y + ' L' + (x - 22) + ',' + y + ' L' + (x - 22) + ',' + (y - 40) + ' Q' + (x - 22) + ',' + (y - 54) + ' ' + (x - 12) + ',' + (y - 62) + ' Z" fill="#FFFFFF"' + LINE5 + '/>'
      + '<rect x="' + (x - 14) + '" y="' + (y - 90) + '" width="28" height="12" rx="4" fill="#4ECDC4"' + LINE5 + '/>'
      + '<rect x="' + (x - 22) + '" y="' + (y - 34) + '" width="44" height="16" fill="#7CC8F5"' + LINE5 + '/>';
  }

  function background() {
    var out = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#FFF1F5"/>';
    for (var x = 40; x < W; x += 80) out += '<rect x="' + x + '" y="0" width="40" height="' + H + '" fill="#FFE0EB"/>';
    // 牆上錯開排的小白點
    var dots = '';
    for (var r = 0, y = 130; y < 450; y += 64, r++) {
      for (var dx = (r % 2) ? 60 : 20; dx < W; dx += 80) dots += '<circle cx="' + dx + '" cy="' + y + '" r="5"/>';
    }
    out += '<g fill="#FFFFFF" opacity="0.8">' + dots + '</g>';
    // 兩邊的層架和小擺設
    out += shelf(14, 150, 300) + candyJar(56, 300) + plant(116, 300);
    out += shelf(650, 786, 300) + macarons(690, 300) + milk(750, 300);
    // 櫃台：檯面＋前面一片一片的木板
    out += '<rect x="-10" y="470" width="' + (W + 20) + '" height="140" fill="#F7C98B" stroke="' + INK + '" stroke-width="6"/>';
    var planks = '';
    for (var px = 100; px < W; px += 100) planks += 'M' + px + ',486 L' + px + ',600 ';
    out += '<path d="' + planks + '" stroke="#E3AE6A" stroke-width="5"/>';
    out += '<rect x="-10" y="458" width="' + (W + 20) + '" height="22" fill="#E8A85C" stroke="' + INK + '" stroke-width="6"/>';
    out += '<path d="M0,464 L' + W + ',464" stroke="#F7C98B" stroke-width="4"/>';
    // 遮雨棚：一片一片的半圓垂邊，紅白相間；紅的那幾片底下暗一階
    for (var i = 0; i * 80 < W; i++) {
      var x0 = i * 80;
      var red = !(i % 2);
      out += '<path d="M' + x0 + ',-6 L' + x0 + ',40 A40,40 0 0 0 ' + (x0 + 80) + ',40 L' + (x0 + 80) + ',-6 Z" fill="'
        + (red ? '#FF6B6B' : '#FFFFFF') + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'
        + '<path d="M' + (x0 + 10) + ',46 A30,30 0 0 0 ' + (x0 + 70) + ',46" fill="none" stroke="' + (red ? '#E04848' : '#F2E3E8') + '" stroke-width="7" stroke-linecap="round"/>';
    }
    return out;
  }

  function toppingAt(id, x, y, k, idx) {
    var body = Art.SVG[id];
    if (!body) return '';
    var attrs = idx === undefined ? '' : ' class="tp" data-i="' + idx + '"';
    // 透明的大圓是給手指點的命中區（五歲的手指比一顆藍莓大很多）；
    // fill="transparent" 而不是 none：none 不吃 pointer 事件
    var hit = idx === undefined ? '' : '<circle cx="0" cy="-50" r="62" fill="transparent"/>';
    return '<g' + attrs + ' transform="' + toppingTransform(x, y, k) + '">' + hit + body + '</g>';
  }

  function toppingTransform(x, y, k) {
    return 'translate(' + n1(x) + ',' + n1(y) + ') scale(' + n1(k * 100) / 100 + ')';
  }

  /* 每個配料畫在哪裡。點一下放的依序用掉位置表（前面拿掉一個，後面的會遞補，
     跟層數一樣由程式排好）；拖放的留在她放的那個點，不佔位置表。 */
  function placements(state, cx) {
    var c = cx === undefined ? CENTER_X : cx;
    var spots = Shapes.get(state.kind).spots(state, c);
    var auto = 0;
    return state.toppings.map(function (t, i) {
      if (t.x !== undefined) return { id: t.id, i: i, x: t.x, y: t.y, k: DROP_K };
      var p = spots[auto++ % spots.length];
      return { id: t.id, i: i, x: p.x, y: p.y, k: p.k };
    });
  }

  /* ===== 整個板面 =====
     opts.cx           甜點中心 x（點餐模式往右讓出左邊給客人）
     opts.interactive  true 時每個配料帶 data-i，讓 cake.js 點了能拿掉、拖了能移動
     opts.size         [w, h]：在根標籤寫上 width/height（存圖用，iPad Safari 沒有尺寸的 SVG 畫進 canvas 會空白）
     opts.view         [x, y, w, h]：只看板面的一塊（選甜點卡片的示意圖放大甜點用），維持 4:3 */
  function scene(state, opts) {
    var o = opts || {};
    var cx = o.cx === undefined ? CENTER_X : o.cx;
    var size = o.size ? ' width="' + o.size[0] + '" height="' + o.size[1] + '"' : '';
    var view = o.view ? o.view.join(' ') : '0 0 ' + W + ' ' + H;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + view + '"' + size + '>';
    out += background();
    out += Shapes.get(state.kind).draw(state, cx);

    // 畫面上越下面的越靠前，後面的先畫才不會蓋住前面；同一排照放的順序
    placements(state, cx)
      .sort(function (a, b) { return (a.y - b.y) || (a.i - b.i); })
      .forEach(function (p) { out += toppingAt(p.id, p.x, p.y, p.k, o.interactive ? p.i : undefined); });

    return out + '</svg>';
  }

  /* ===== 材料匣／點餐泡泡用的小圖（100×100） ===== */
  function iconBase(kind, flavorId) {
    var f = Data.flavor(flavorId);
    return f ? Shapes.get(kind).iconBase(f) : '';
  }

  function iconHolder(kind, holderId) {
    var h = Data.holder(kind, holderId);
    return h ? Shapes.get(kind).iconHolder(h) : '';
  }

  /* 奶油小圖不分甜點：一灘往下流的奶油 */
  function iconCream(id) {
    var c = Data.cream(id);
    if (!c) return '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
      + '<path d="M10,40 A40,12 0 0 1 90,40 C90,62 78,64 74,52 C70,74 52,76 48,56 C44,84 26,82 24,58 C18,66 10,60 10,40 Z" fill="' + c.fill
      + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/></svg>';
  }

  function iconTopping(id) {
    if (!Art.SVG[id]) return '';
    // 高的配料往下挪、縮小一點才放得進同一個框
    var tall = Art.TALL[id];
    var k = tall ? 88 / tall : 0.78;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
      + toppingAt(id, 50, tall ? 96 : 92, k) + '</svg>';
  }

  var CakeDraw = {
    W: W,
    H: H,
    DEMO_VIEW: [80, 100, 640, 480],
    DROP_K: DROP_K,
    scene: scene,
    placements: placements,
    toppingTransform: toppingTransform,
    iconBase: iconBase,
    iconHolder: iconHolder,
    iconCream: iconCream,
    iconTopping: iconTopping,
    TOPPING_IDS: Object.keys(Art.SVG)
  };

  global.CakeDraw = CakeDraw;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeDraw;
})(typeof window !== 'undefined' ? window : globalThis);
