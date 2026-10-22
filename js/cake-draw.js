/* 蛋糕店的畫圖：把蛋糕狀態畫成 SVG 字串（板面、貼紙匣的小圖、點餐泡泡的小圖共用）。

   為什麼現場畫而不是用圖檔：一層蛋糕有六種顏色、疊一到三層、再淋五種奶油，
   做成圖檔是幾百種組合；用 SVG 字串畫，顏色只是一個參數。
   板面是 800×600 的 SVG（跟貼紙背景同一個比例），📷 存圖時直接把同一份字串
   轉成 blob 畫進 canvas，畫面與存出來的圖保證一模一樣。

   畫風跟全站的「貼紙書」一致：墨線 #2b2b2b、粗外框、平塗色。
   純字串進、字串出，不碰 DOM——tools/check_cake.js 才能在 Node 裡斷言。 */
(function (global) {
  'use strict';

  var Data = global.CakeData || (typeof require === 'function' ? require('./cake-data.js') : null);

  var INK = '#2b2b2b';
  var W = 800;
  var H = 600;
  var PLATE_Y = 516;            // 盤子中心＝最下層蛋糕的底
  var TIER_W = [420, 320, 230]; // 由下往上每層的寬
  var CAKE_CX = 400;

  /* 頂上的七個裝飾位置（相對於頂面橢圓的 rx / ry）。
     放的順序：先前排正中間、再前排左右，然後後排——第一顆放在正中間看起來最像蛋糕，
     而且一排一排填，數「兩顆」「三顆」時一眼看得出來。
     畫的時候後排先畫（v 小的先），前排才會疊在後排前面。 */
  var SLOTS = [
    { u: 0, v: 0.4 }, { u: -0.42, v: 0.4 }, { u: 0.42, v: 0.4 },
    { u: -0.21, v: -0.3 }, { u: 0.21, v: -0.3 }, { u: -0.62, v: -0.25 }, { u: 0.62, v: -0.25 }
  ];

  function n1(v) { return Math.round(v * 10) / 10; }

  /* ===== 店面背景：粉紅條紋牆＋紅白遮雨棚＋櫃台 ===== */
  function background() {
    var out = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#FFF1F5"/>';
    for (var x = 40; x < W; x += 80) out += '<rect x="' + x + '" y="0" width="40" height="' + H + '" fill="#FFE0EB"/>';
    // 櫃台
    out += '<rect x="-10" y="470" width="' + (W + 20) + '" height="140" fill="#F7C98B" stroke="' + INK + '" stroke-width="6"/>';
    out += '<rect x="-10" y="458" width="' + (W + 20) + '" height="22" fill="#E8A85C" stroke="' + INK + '" stroke-width="6"/>';
    // 遮雨棚：一片一片的半圓垂邊，紅白相間
    for (var i = 0; i * 80 < W; i++) {
      var x0 = i * 80;
      out += '<path d="M' + x0 + ',-6 L' + x0 + ',40 A40,40 0 0 0 ' + (x0 + 80) + ',40 L' + (x0 + 80) + ',-6 Z" fill="'
        + (i % 2 ? '#FFFFFF' : '#FF6B6B') + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    }
    return out;
  }

  function plate(cx) {
    return '<ellipse cx="' + cx + '" cy="' + (PLATE_Y + 4) + '" rx="262" ry="36" fill="#FFFFFF" stroke="' + INK + '" stroke-width="6"/>'
      + '<ellipse cx="' + cx + '" cy="' + (PLATE_Y + 2) + '" rx="214" ry="25" fill="none" stroke="#E6DED2" stroke-width="5"/>';
  }

  /* 每一層的幾何：由下往上疊。三層時每層壓矮一點，最上面的裝飾才不會頂到遮雨棚。 */
  function tierBoxes(tiers, cx) {
    var h = tiers.length >= 3 ? 92 : 105;
    var boxes = [];
    var yBot = PLATE_Y;
    for (var i = 0; i < tiers.length; i++) {
      var w = TIER_W[Math.min(i, TIER_W.length - 1)];
      var rx = w / 2;
      boxes.push({ cx: cx, rx: rx, ry: n1(w * 0.1), yTop: yBot - h, yBot: yBot, h: h, id: tiers[i] });
      yBot -= h;
    }
    return boxes;
  }

  /* 頂面：有蛋糕就是最上層的頂面橢圓，沒有就是盤子（裝飾直接放盤子上，不另做特例） */
  function topSurface(tiers, cx) {
    var b = tierBoxes(tiers, cx);
    if (b.length) { var t = b[b.length - 1]; return { cx: cx, cy: t.yTop, rx: t.rx, ry: t.ry }; }
    return { cx: cx, cy: PLATE_Y, rx: 200, ry: 24 };
  }

  // 頂面橢圓前緣在 x 處的 y（奶油往下流的起點）
  function frontY(b, x) {
    var t = (x - b.cx) / b.rx;
    return b.yTop + b.ry * Math.sqrt(Math.max(0, 1 - t * t));
  }

  function tier(b, flavor) {
    var x0 = n1(b.cx - b.rx), x1 = n1(b.cx + b.rx);
    var ym = n1(b.yTop + b.h * 0.55);
    // 側面＝兩條直邊＋下緣的半個橢圓（sweep 0 是往下彎的那半）
    return '<path d="M' + x0 + ',' + b.yTop + ' L' + x0 + ',' + b.yBot + ' A' + b.rx + ',' + b.ry + ' 0 0 0 ' + x1 + ',' + b.yBot
      + ' L' + x1 + ',' + b.yTop + ' Z" fill="' + flavor.fill + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>'
      // 腰上一條暗一階的夾心，跟著下緣一樣彎，看起來才是圓的
      + '<path d="M' + n1(x0 + 3) + ',' + ym + ' A' + b.rx + ',' + b.ry + ' 0 0 0 ' + n1(x1 - 3) + ',' + ym
      + '" fill="none" stroke="' + flavor.dark + '" stroke-width="10" stroke-linecap="round"/>'
      + '<ellipse cx="' + b.cx + '" cy="' + b.yTop + '" rx="' + b.rx + '" ry="' + b.ry + '" fill="' + flavor.top + '" stroke="' + INK + '" stroke-width="6"/>';
  }

  /* 奶油：蓋住頂面，前緣往下流成一顆一顆的圓弧 */
  function cream(b, c) {
    var x0 = b.cx - b.rx, x1 = b.cx + b.rx;
    var segs = 6;
    var step = (x1 - x0) / segs;
    var d = 'M' + n1(x0) + ',' + b.yTop;
    for (var i = 0; i < segs; i++) {
      var xa = x0 + i * step, xb = xa + step;
      var drop = (i % 2 ? 0.22 : 0.4) * b.h;
      d += ' C' + n1(xa + step * 0.05) + ',' + n1(frontY(b, xa) + drop) + ' ' + n1(xb - step * 0.05) + ',' + n1(frontY(b, xb) + drop)
        + ' ' + n1(xb) + ',' + n1(frontY(b, xb));
    }
    // 收尾走頂面的上半個橢圓回到起點（從右往左、經過上面＝sweep 0）
    d += ' A' + b.rx + ',' + b.ry + ' 0 0 0 ' + n1(x0) + ',' + b.yTop + ' Z';
    return '<path d="' + d + '" fill="' + c.fill + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>';
  }

  /* ===== 裝飾 =====
     每個都畫在「底部中心＝(0,0)、往上約 100 單位高」的座標裡，放的時候再平移縮放。 */
  var SW = 'stroke="' + INK + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"';

  var TOPPING_SVG = {
    strawberry:
      '<path d="M0,0 C-40,-10 -50,-58 -32,-72 C-16,-84 16,-84 32,-72 C50,-58 40,-10 0,0 Z" fill="#FF4D6D" ' + SW + '/>'
      + '<path d="M-28,-72 L-16,-90 L-6,-76 L0,-96 L6,-76 L16,-90 L28,-72 Z" fill="#5CC15A" ' + SW + '/>'
      + '<g fill="#FFE066"><ellipse cx="-16" cy="-50" rx="3.5" ry="5"/><ellipse cx="14" cy="-54" rx="3.5" ry="5"/>'
      + '<ellipse cx="0" cy="-34" rx="3.5" ry="5"/><ellipse cx="-12" cy="-22" rx="3" ry="4.5"/><ellipse cx="12" cy="-24" rx="3" ry="4.5"/></g>',
    cherry:
      '<path d="M2,-54 Q8,-84 30,-100" fill="none" ' + SW + '/>'
      + '<path d="M22,-94 Q40,-104 46,-86 Q30,-80 22,-94 Z" fill="#5CC15A" ' + SW + '/>'
      + '<circle cx="0" cy="-30" r="29" fill="#E5383B" ' + SW + '/>'
      + '<circle cx="-10" cy="-40" r="7" fill="#FFFFFF" opacity="0.85"/>',
    blueberry:
      '<circle cx="0" cy="-28" r="28" fill="#5468E0" ' + SW + '/>'
      + '<path d="M-9,-50 L0,-41 L9,-50" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<circle cx="-10" cy="-34" r="6" fill="#FFFFFF" opacity="0.8"/>',
    star:
      '<path d="M0,-92 L12,-60 L46,-58 L19,-37 L28,-4 L0,-23 L-28,-4 L-19,-37 L-46,-58 L-12,-60 Z" fill="#FFD93D" ' + SW + '/>',
    heart:
      '<path d="M0,-6 C-30,-28 -48,-48 -40,-70 C-32,-90 -8,-88 0,-70 C8,-88 32,-90 40,-70 C48,-48 30,-28 0,-6 Z" fill="#FF6B9A" ' + SW + '/>'
      + '<ellipse cx="-22" cy="-66" rx="6" ry="9" fill="#FFFFFF" opacity="0.8" transform="rotate(-25 -22 -66)"/>',
    flower:
      '<g fill="#FFB3D1" ' + SW + '>'
      + '<circle cx="0" cy="-70" r="18"/><circle cx="22" cy="-54" r="18"/><circle cx="14" cy="-28" r="18"/>'
      + '<circle cx="-14" cy="-28" r="18"/><circle cx="-22" cy="-54" r="18"/></g>'
      + '<circle cx="0" cy="-46" r="14" fill="#FFD93D" ' + SW + '/>',
    candle:
      '<rect x="-12" y="-118" width="24" height="118" rx="5" fill="#FFFFFF" ' + SW + '/>'
      + '<path d="M-10,-96 L10,-108 M-10,-66 L10,-78 M-10,-36 L10,-48 M-10,-8 L10,-20" stroke="#FF6B9A" stroke-width="8" stroke-linecap="round"/>'
      + '<path d="M0,-118 L0,-128" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>'
      // 火焰另外包一層 class，蛋糕頁的 CSS 讓它晃（prefers-reduced-motion 時不晃）
      + '<g class="flame"><path d="M0,-170 C14,-150 18,-136 0,-126 C-18,-136 -14,-150 0,-170 Z" fill="#FFB300" ' + SW + '/>'
      + '<path d="M0,-152 C6,-144 7,-137 0,-133 C-7,-137 -6,-144 0,-152 Z" fill="#FFF3B0"/></g>'
  };

  function toppingAt(id, x, y, k, idx) {
    var body = TOPPING_SVG[id];
    if (!body) return '';
    var attrs = idx === undefined ? '' : ' class="tp" data-i="' + idx + '"';
    // 透明的大圓是給手指點的命中區（五歲的手指比一顆藍莓大很多）；
    // fill="transparent" 而不是 none：none 不吃 pointer 事件
    var hit = idx === undefined ? '' : '<circle cx="0" cy="-50" r="62" fill="transparent"/>';
    return '<g' + attrs + ' transform="translate(' + n1(x) + ',' + n1(y) + ') scale(' + n1(k * 100) / 100 + ')">' + hit + body + '</g>';
  }

  /* 第 i 個裝飾的位置與縮放（cake.js 不需要知道，留著給測試對帳） */
  function toppingPlacement(tiers, i, cx) {
    var s = topSurface(tiers, cx === undefined ? CAKE_CX : cx);
    var slot = SLOTS[i % SLOTS.length];
    var k = Math.min(0.7, s.rx * 0.0042);
    return { x: s.cx + slot.u * s.rx, y: s.cy + slot.v * s.ry, k: k, v: slot.v };
  }

  /* ===== 整個板面 =====
     opts.cx           蛋糕中心 x（點餐模式往右讓出左邊給客人）
     opts.interactive  true 時每個裝飾帶 data-i，讓 cake.js 點了能拿掉
     opts.size         [w, h]：在根標籤寫上 width/height（存圖用，iPad Safari 沒有尺寸的 SVG 畫進 canvas 會空白） */
  function scene(state, opts) {
    var o = opts || {};
    var cx = o.cx === undefined ? CAKE_CX : o.cx;
    var size = o.size ? ' width="' + o.size[0] + '" height="' + o.size[1] + '"' : '';
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '"' + size + '>';
    out += background();
    out += plate(cx);

    var boxes = tierBoxes(state.tiers, cx);
    var c = state.cream ? Data.cream(state.cream) : null;
    boxes.forEach(function (b) {
      var f = Data.flavor(b.id);
      if (!f) return;
      out += tier(b, f);
      if (c) out += cream(b, c);
    });

    // 後排先畫、前排後畫；同一排照放的順序
    var items = state.toppings.map(function (id, i) {
      var p = toppingPlacement(state.tiers, i, cx);
      return { id: id, i: i, p: p };
    });
    items.sort(function (a, b) { return (a.p.v - b.p.v) || (a.i - b.i); });
    items.forEach(function (it) {
      out += toppingAt(it.id, it.p.x, it.p.y, it.p.k, o.interactive ? it.i : undefined);
    });

    return out + '</svg>';
  }

  /* ===== 貼紙匣／點餐泡泡用的小圖（100×100） ===== */
  function iconFlavor(id) {
    var f = Data.flavor(id);
    if (!f) return '';
    var b = { cx: 50, rx: 40, ry: 10, yTop: 34, yBot: 82, h: 48 };
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + tier(b, f).replace(/stroke-width="6"/g, 'stroke-width="5"') + '</svg>';
  }

  function iconCream(id) {
    var c = Data.cream(id);
    if (!c) return '';
    var b = { cx: 50, rx: 40, ry: 12, yTop: 40, yBot: 84, h: 70 };
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
      + cream(b, c).replace(/stroke-width="6"/g, 'stroke-width="5"') + '</svg>';
  }

  function iconTopping(id) {
    if (!TOPPING_SVG[id]) return '';
    // 蠟燭有火焰，比別人高一截，往下挪、縮小一點才放得進同一個框
    var tall = id === 'candle';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
      + toppingAt(id, 50, tall ? 96 : 92, tall ? 0.52 : 0.78) + '</svg>';
  }

  var CakeDraw = {
    W: W,
    H: H,
    SLOTS: SLOTS,
    scene: scene,
    tierBoxes: tierBoxes,
    topSurface: topSurface,
    toppingPlacement: toppingPlacement,
    iconFlavor: iconFlavor,
    iconCream: iconCream,
    iconTopping: iconTopping,
    TOPPING_IDS: Object.keys(TOPPING_SVG)
  };

  global.CakeDraw = CakeDraw;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeDraw;
})(typeof window !== 'undefined' ? window : globalThis);
