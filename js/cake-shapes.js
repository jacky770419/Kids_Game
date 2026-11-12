/* 甜點店的七種甜點：每種一組 { draw, spots, iconBase, iconHolder }。

     draw(state, cx)      畫出甜點本體（不含背景與配料），回傳 SVG 字串
     spots(state, cx)     點一下放配料時的位置表，由先放的排到後放的，每筆 { x, y, k }：
                          (x, y)＝配料底部中心、k＝縮放。層數變了位置會跟著走。
                          ⚠ 任何狀態都要排得出至少 CakeState.MAX_TOPPINGS 個（check_cake.js 對帳）
     iconBase(flavor)     材料匣／點餐泡泡的顏色小圖（100×100）
     iconHolder(holder)   材料匣的容器小圖（100×100）

   位置表的排法：先排最上面（第一顆放在正中間看起來最像蛋糕，一排一排填，
   數「兩顆」「三顆」時一眼看得出來），放滿了才往下排到邊緣、側面、盤子、櫃台。

   座標是 800×600 的板面，櫃台面約在 y=470，遮雨棚下緣約在 y=80。
   純字串進、字串出，不碰 DOM——tools/check_cake.js 才能在 Node 裡斷言。 */
(function (global) {
  'use strict';

  var Data = global.CakeData || (typeof require === 'function' ? require('./cake-data.js') : null);

  var INK = '#33274F';
  var LINE = ' stroke="' + INK + '" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
  var PLATE_Y = 516;            // 盤子中心＝最下層的底

  /* 頂面的七個位置（相對於頂面橢圓的 rx / ry）。
     放的順序：先前排正中間、再前排左右，然後後排。 */
  var TOP_SLOTS = [
    [0, 0.4], [-0.42, 0.4], [0.42, 0.4],
    [-0.21, -0.3], [0.21, -0.3], [-0.62, -0.25], [0.62, -0.25]
  ];

  function n1(v) { return Math.round(v * 10) / 10; }

  function spot(x, y, k) { return { x: n1(x), y: n1(y), k: k }; }

  /* 橢圓上的 (u, v) 位置 */
  function uvs(cx, cy, rx, ry, list, k) {
    return list.map(function (p) { return spot(cx + p[0] * rx, cy + p[1] * ry, k); });
  }

  /* 離中心線 dx、板面高度 y 的位置 */
  function offsets(cx, list, k) {
    return list.map(function (p) { return spot(cx + p[0], p[1], k); });
  }

  /* 橢圓周上的角度（度）：0＝右、90＝正前方、180＝左 */
  function arc(cx, cy, rx, ry, degs, k) {
    return degs.map(function (d) {
      var a = d * Math.PI / 180;
      return spot(cx + rx * Math.cos(a), cy + ry * Math.sin(a), k);
    });
  }

  /* 櫃台最前面一排：別的位置都放滿了才會用到 */
  function counter(cx) {
    return [60, -60, 120, -120, 180, -180, 240, -240].map(function (dx) { return spot(cx + dx, 592, 0.36); });
  }

  /* 沒有東西的盤子：配料直接放盤子上 */
  function emptyPlateSpots(cx) {
    return uvs(cx, PLATE_Y + 2, 200, 24, TOP_SLOTS, 0.6)
      .concat(uvs(cx, PLATE_Y + 2, 200, 24, [[-0.82, 0.5], [0.82, 0.5], [0, -0.8]], 0.45))
      .concat(arc(cx, PLATE_Y + 4, 238, 30, [180, 0], 0.4))
      .concat(counter(cx));
  }

  function svg100(body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + body + '</svg>';
  }

  /* ===== 共用的小零件 ===== */

  /* 立體感三件套（2026-11 起）：落在櫃台上的影子、背光那側的暗面、迎光那側的白色亮線。
     都用半透明的平塗色，不用漸層：漸層要 id，同一頁有好幾張 SVG（選甜點的卡片、材料匣）會撞 id，
     而且定義漸層的那張 SVG 被藏起來（display:none）時，別張引用到的漸層會畫不出來。 */
  function shadow(cx, cy, rx, ry) {
    return '<ellipse cx="' + n1(cx + 10) + '" cy="' + n1(cy + 9) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '" fill="#8A4B2A" opacity="0.18"/>';
  }

  function gloss(d, w, op) {
    return '<path d="' + d + '" fill="none" stroke="#FFFFFF" stroke-width="' + (w || 9) + '" stroke-linecap="round" opacity="' + (op || 0.7) + '"/>';
  }

  function plate(cx, id) {
    var p = Data.holder('cake', id) || Data.PLATES[0];
    var y = PLATE_Y + 4;
    return shadow(cx, y, 262, 36)
      + '<ellipse cx="' + cx + '" cy="' + y + '" rx="262" ry="36" fill="' + p.fill + '"' + LINE + '/>'
      + '<ellipse cx="' + cx + '" cy="' + (PLATE_Y + 2) + '" rx="214" ry="25" fill="none" stroke="' + p.rim + '" stroke-width="5"/>'
      // 盤緣左前方一道反光
      + gloss('M' + n1(cx - 228) + ',' + n1(y + 12) + ' A244,30 0 0 0 ' + n1(cx - 120) + ',' + n1(y + 27), 6, 0.8);
  }

  function iconPlate(p) {
    return svg100('<ellipse cx="50" cy="56" rx="42" ry="20" fill="' + p.fill + '" stroke="' + INK + '" stroke-width="5"/>'
      + '<ellipse cx="50" cy="54" rx="29" ry="11" fill="none" stroke="' + p.rim + '" stroke-width="5"/>');
  }

  // 頂面橢圓前緣在 x 處的 y（奶油往下流的起點）
  function frontY(b, x) {
    var t = (x - b.cx) / b.rx;
    return b.yTop + b.ry * Math.sqrt(Math.max(0, 1 - t * t));
  }

  function tierSide(b, fill) {
    var x0 = n1(b.cx - b.rx), x1 = n1(b.cx + b.rx);
    // 側面＝兩條直邊＋下緣的半個橢圓（sweep 0 是往下彎的那半）
    return '<path d="M' + x0 + ',' + b.yTop + ' L' + x0 + ',' + b.yBot + ' A' + b.rx + ',' + b.ry + ' 0 0 0 ' + x1 + ',' + b.yBot
      + ' L' + x1 + ',' + b.yTop + ' Z" fill="' + fill + '"' + LINE + '/>';
  }

  /* 圓柱右側的暗面：從側面 u＝0.52 的地方垂直切下去，沿下緣彎到右邊（光從左上來） */
  function sideShade(b, color, op) {
    var u = 0.52;
    var xs = n1(b.cx + u * b.rx), x1 = n1(b.cx + b.rx);
    var ys = n1(b.yBot + b.ry * Math.sqrt(1 - u * u));
    return '<path d="M' + xs + ',' + b.yTop + ' L' + xs + ',' + ys + ' A' + b.rx + ',' + b.ry + ' 0 0 0 ' + x1 + ',' + b.yBot
      + ' L' + x1 + ',' + b.yTop + ' Z" fill="' + color + '" opacity="' + op + '"/>';
  }

  function tier(b, f) {
    var x0 = n1(b.cx - b.rx), x1 = n1(b.cx + b.rx);
    var ym = n1(b.yTop + b.h * 0.55);
    var xl = n1(b.cx - b.rx * 0.8);
    var yl = n1(b.yBot + b.ry * 0.6 - 10);
    return tierSide(b, f.fill)
      + sideShade(b, f.dark, 0.45)
      // 腰上一條暗一階的夾心，跟著下緣一樣彎，看起來才是圓的
      + '<path d="M' + n1(x0 + 3) + ',' + ym + ' A' + b.rx + ',' + b.ry + ' 0 0 0 ' + n1(x1 - 3) + ',' + ym
      + '" fill="none" stroke="' + f.dark + '" stroke-width="10" stroke-linecap="round"/>'
      // 左側一道直的亮線（暗面蓋掉了右邊的墨線一半，外框再描一次）
      + gloss('M' + xl + ',' + n1(b.yTop + b.ry + 8) + ' L' + xl + ',' + yl, Math.max(5, n1(b.rx * 0.05)), 0.55)
      + tierSide(b, 'none')
      + '<ellipse cx="' + b.cx + '" cy="' + b.yTop + '" rx="' + b.rx + '" ry="' + b.ry + '" fill="' + f.top + '"' + LINE + '/>'
      + '<ellipse cx="' + n1(b.cx - b.rx * 0.42) + '" cy="' + n1(b.yTop - b.ry * 0.25) + '" rx="' + n1(b.rx * 0.22) + '" ry="' + n1(b.ry * 0.28)
      + '" fill="#FFFFFF" opacity="0.5"/>';
  }

  /* 奶油擠成一圈珍珠邊：沿著每一層的下緣（看得到的前半圈） */
  function pearls(b, c) {
    var out = '';
    var r = n1(Math.max(7, b.h * 0.09));
    var n = Math.max(7, Math.round(b.rx * 2 / (r * 2.3)));
    for (var i = 0; i <= n; i++) {
      var u = -0.97 + 1.94 * i / n;
      var x = b.cx + u * b.rx;
      var y = b.yBot + b.ry * Math.sqrt(1 - u * u);
      out += '<circle cx="' + n1(x) + '" cy="' + n1(y - 2) + '" r="' + r + '"/>';
    }
    return '<g fill="' + c.fill + '" stroke="' + INK + '" stroke-width="4">' + out + '</g>';
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
    return '<path d="' + d + '" fill="' + c.fill + '"' + LINE + '/>'
      + '<ellipse cx="' + n1(b.cx - b.rx * 0.42) + '" cy="' + n1(b.yTop - b.ry * 0.2) + '" rx="' + n1(b.rx * 0.2) + '" ry="' + n1(b.ry * 0.26)
      + '" fill="#FFFFFF" opacity="0.55"/>';
  }

  /* 擠花：一圈一圈往上縮，頂端拉出一個尖（杯子蛋糕、聖代） */
  function swirl(cx, yBase, rx, c) {
    var out = '';
    var h = rx * 0.4;
    var rings = 3;
    for (var i = 0; i < rings; i++) {
      var r = rx * (1 - i * 0.27);
      var y = yBase - i * h * 1.05;
      out += '<ellipse cx="' + cx + '" cy="' + n1(y) + '" rx="' + n1(r) + '" ry="' + n1(h * 0.78) + '" fill="' + c.fill + '"' + LINE + '/>'
        + gloss('M' + n1(cx - r * 0.72) + ',' + n1(y - h * 0.18) + ' Q' + n1(cx - r * 0.55) + ',' + n1(y - h * 0.5) + ' ' + n1(cx - r * 0.25) + ',' + n1(y - h * 0.58),
          n1(Math.max(5, rx * 0.05)), 0.6);
    }
    var r2 = rx * 0.3;
    var yTip = yBase - (rings - 1) * h * 1.05 - h * 0.5;
    out += '<path d="M' + n1(cx - r2) + ',' + n1(yTip) + ' C' + n1(cx - r2 * 0.5) + ',' + n1(yTip - h * 0.7) + ' ' + n1(cx + r2 * 0.1) + ',' + n1(yTip - h * 1.1)
      + ' ' + n1(cx + r2 * 0.2) + ',' + n1(yTip - h * 1.5) + ' C' + n1(cx + r2 * 0.5) + ',' + n1(yTip - h * 1.0) + ' ' + n1(cx + r2) + ',' + n1(yTip - h * 0.5)
      + ' ' + n1(cx + r2) + ',' + n1(yTip) + ' Z" fill="' + c.fill + '"' + LINE + '/>';
    return out;
  }

  /* 擠花上的配料位置（跟 swirl 同一組比例） */
  function swirlSpots(cx, yBase, rx, k) {
    var h = rx * 0.4;
    return [
      spot(cx, yBase - h * 1.75, k),
      spot(cx - rx * 0.33, yBase - h * 0.95, k), spot(cx + rx * 0.33, yBase - h * 0.95, k),
      spot(cx, yBase + h * 0.1, k), spot(cx - rx * 0.55, yBase + h * 0.1, k), spot(cx + rx * 0.55, yBase + h * 0.1, k),
      spot(cx, yBase - h * 0.85, k)
    ];
  }

  /* ===== 蛋糕 ===== */
  var TIER_W = [420, 320, 230]; // 由下往上每層的寬

  /* 每一層的幾何：由下往上疊。三層時每層壓矮一點，最上面的配料才不會頂到遮雨棚。 */
  function tierBoxes(tiers, cx) {
    var h = tiers.length >= 3 ? 92 : 105;
    var yBot = PLATE_Y;
    return tiers.map(function (id, i) {
      var w = TIER_W[Math.min(i, TIER_W.length - 1)];
      var b = { cx: cx, rx: w / 2, ry: n1(w * 0.1), yTop: yBot - h, yBot: yBot, h: h, id: id };
      yBot -= h;
      return b;
    });
  }

  var cake = {
    draw: function (s, cx) {
      var out = plate(cx, s.holder);
      var c = s.cream ? Data.cream(s.cream) : null;
      tierBoxes(s.tiers, cx).forEach(function (b) {
        var f = Data.flavor(b.id);
        if (!f) return;
        out += tier(b, f);
        if (c) out += cream(b, c) + pearls(b, c);
      });
      return out;
    },
    spots: function (s, cx) {
      var b = tierBoxes(s.tiers, cx);
      if (!b.length) return emptyPlateSpots(cx);
      var t = b[b.length - 1];
      var k = Math.min(0.7, t.rx * 0.0042);
      var out = uvs(cx, t.yTop, t.rx, t.ry, TOP_SLOTS, k)
        .concat(arc(cx, t.yTop, t.rx * 0.86, t.ry * 0.7, [180, 0], k * 0.8));
      // 下面幾層露出來的平台
      for (var i = b.length - 2; i >= 0; i--) {
        var lo = b[i], up = b[i + 1];
        out = out.concat(arc(cx, lo.yTop, (lo.rx + up.rx) / 2, (lo.ry + up.ry) / 2, [180, 0, 140, 40, 90], 0.34));
      }
      // 每一層的側面：跟著圓弧往下彎，才像貼在蛋糕上
      for (var j = b.length - 1; j >= 0; j--) {
        var x = b[j];
        [0, -0.38, 0.38, -0.74, 0.74].forEach(function (u) {
          out.push(spot(cx + u * x.rx, x.yTop + x.h * 0.72 + x.ry * Math.sqrt(1 - u * u), 0.34));
        });
      }
      return out.concat(arc(cx, PLATE_Y + 4, 238, 30, [180, 0], 0.4)).concat(counter(cx));
    },
    iconBase: function (f) {
      return svg100(tier({ cx: 50, rx: 40, ry: 10, yTop: 34, yBot: 82, h: 48 }, f).replace(/stroke-width="6"/g, 'stroke-width="5"'));
    },
    iconHolder: iconPlate
  };

  /* ===== 冰淇淋 ===== */
  var CONE = { top: 392, tip: 562, hw: 84 };
  var SCOOP_R = [84, 74, 64];

  function scoopBoxes(tiers, cx) {
    var cy = CONE.top - 40;
    return tiers.map(function (id, i) {
      var r = SCOOP_R[Math.min(i, SCOOP_R.length - 1)];
      var b = { cx: cx, cy: cy, r: r, id: id };
      cy -= r * 0.93;
      return b;
    });
  }

  /* 一球：上面是圓頂，下緣一圈荷葉邊 */
  function scoop(cx, cy, r, f) {
    var y = cy + r * 0.3;
    var n = 5;
    var step = 2 * r / n;
    var sc = n1(step * 0.54);
    var d = 'M' + n1(cx - r) + ',' + n1(y) + ' A' + r + ',' + r + ' 0 1 1 ' + n1(cx + r) + ',' + n1(y);
    for (var i = 0; i < n; i++) d += ' a' + sc + ',' + sc + ' 0 0 1 ' + n1(-step) + ',0';
    // 右下的暗面：外圈一段弧，內圈用大一點的半徑往回彎，切出一片月牙
    var a0 = -40 * Math.PI / 180, a1 = Math.asin(0.3);
    var p0 = n1(cx + r * Math.cos(a0)) + ',' + n1(cy + r * Math.sin(a0));
    var p1 = n1(cx + r * Math.cos(a1)) + ',' + n1(y);
    var shade = '<path d="M' + p0 + ' A' + r + ',' + r + ' 0 0 1 ' + p1 + ' L' + n1(cx + r * 0.25) + ',' + n1(y)
      + ' Q' + n1(cx + r * 0.72) + ',' + n1(cy - r * 0.05) + ' ' + p0 + ' Z" fill="' + f.dark + '" opacity="0.4"/>';
    return '<path d="' + d + ' Z" fill="' + f.fill + '"' + LINE + '/>'
      + shade + '<path d="' + d + ' Z" fill="none"' + LINE + '/>'
      + '<ellipse cx="' + n1(cx - r * 0.38) + '" cy="' + n1(cy - r * 0.46) + '" rx="' + n1(r * 0.22) + '" ry="' + n1(r * 0.13)
      + '" fill="' + f.top + '" transform="rotate(-32 ' + n1(cx - r * 0.38) + ' ' + n1(cy - r * 0.46) + ')"/>';
  }

  /* 淋醬：蓋住最上面那球的上半部，往下流成一條一條 */
  function scoopSauce(cx, cy, r, c) {
    var x0 = cx - r * 0.93, x1 = cx + r * 0.93, y = cy - r * 0.32;
    var n = 5;
    var step = (x1 - x0) / n;
    var d = 'M' + n1(x0) + ',' + n1(y) + ' A' + n1(r * 0.98) + ',' + n1(r * 0.98) + ' 0 0 1 ' + n1(x1) + ',' + n1(y);
    for (var i = 0; i < n; i++) {
      var xa = x1 - i * step, xb = xa - step;
      var drop = (i % 2 ? 0.26 : 0.52) * r;
      d += ' C' + n1(xa - step * 0.02) + ',' + n1(y + drop) + ' ' + n1(xb + step * 0.02) + ',' + n1(y + drop) + ' ' + n1(xb) + ',' + n1(y);
    }
    return '<path d="' + d + ' Z" fill="' + c.fill + '"' + LINE + '/>';
  }

  function cone(cx, h) {
    var t = CONE.top, H = CONE.tip - t, w = CONE.hw;
    var out = shadow(cx, CONE.tip + 2, 56, 13)
      + '<ellipse cx="' + cx + '" cy="' + (CONE.tip + 2) + '" rx="56" ry="13" fill="#FFFFFF"' + LINE + '/>'
      + '<path d="M' + (cx - w) + ',' + t + ' L' + cx + ',' + CONE.tip + ' L' + (cx + w) + ',' + t + ' Z" fill="' + h.fill + '"' + LINE + '/>';
    // 格紋：從上緣出發、平行兩側的斜線，碰到另一邊就停
    var d = '';
    [-0.5, 0, 0.5].forEach(function (a) {
      var p = (1 - a) / 2;
      d += 'M' + n1(cx + a * w) + ',' + t + ' L' + n1(cx + (a + p) * w) + ',' + n1(t + p * H) + ' ';
      d += 'M' + n1(cx - a * w) + ',' + t + ' L' + n1(cx - (a + p) * w) + ',' + n1(t + p * H) + ' ';
    });
    // 右半邊暗一階、甜筒口一圈捲邊
    return out + '<path d="M' + cx + ',' + t + ' L' + cx + ',' + CONE.tip + ' L' + (cx + w) + ',' + t + ' Z" fill="' + h.dark + '" opacity="0.3"/>'
      + '<path d="' + d + '" fill="none" stroke="' + h.dark + '" stroke-width="5" stroke-linecap="round"/>'
      + '<path d="M' + (cx - w) + ',' + t + ' L' + cx + ',' + CONE.tip + ' L' + (cx + w) + ',' + t + ' Z" fill="none"' + LINE + '/>'
      + '<rect x="' + (cx - w - 8) + '" y="' + (t - 6) + '" width="' + (2 * w + 16) + '" height="22" rx="11" fill="' + h.fill + '"' + LINE + '/>'
      + gloss('M' + (cx - w + 6) + ',' + (t + 5) + ' L' + (cx - w * 0.3) + ',' + (t + 5), 5, 0.75);
  }

  function cup(cx, h) {
    var t = CONE.top, b = 536;
    var out = shadow(cx, b + 6, 86, 14) + '<path d="M' + (cx - 104) + ',' + t + ' L' + (cx - 74) + ',' + b + ' Q' + cx + ',' + (b + 18) + ' ' + (cx + 74) + ',' + b
      + ' L' + (cx + 104) + ',' + t + ' Z" fill="' + h.fill + '"' + LINE + '/>';
    [-0.6, -0.2, 0.2, 0.6].forEach(function (u) {
      out += '<path d="M' + n1(cx + u * 94) + ',' + (t + 8) + ' L' + n1(cx + u * 68) + ',' + (b + 4) + '" stroke="' + h.dark + '" stroke-width="10" stroke-linecap="round"/>';
    });
    return out + '<rect x="' + (cx - 112) + '" y="' + (t - 6) + '" width="224" height="22" rx="11" fill="' + h.fill + '"' + LINE + '/>';
  }

  var icecream = {
    draw: function (s, cx) {
      var h = Data.holder('icecream', s.holder) || Data.CONES[0];
      var out = h.shape === 'cup' ? cup(cx, h) : cone(cx, h);
      var boxes = scoopBoxes(s.tiers, cx);
      boxes.forEach(function (b) {
        var f = Data.flavor(b.id);
        if (f) out += scoop(b.cx, b.cy, b.r, f);
      });
      var c = s.cream ? Data.cream(s.cream) : null;
      if (c && boxes.length) {
        var t = boxes[boxes.length - 1];
        out += scoopSauce(t.cx, t.cy, t.r, c);
      }
      return out;
    },
    spots: function (s, cx) {
      var out = [];
      var boxes = scoopBoxes(s.tiers, cx);
      if (boxes.length) {
        var t = boxes[boxes.length - 1];
        out = uvs(cx, t.cy, t.r, t.r, [[0, -0.62], [-0.48, -0.38], [0.48, -0.38], [0, -0.1], [-0.62, 0.08], [0.62, 0.08], [-0.28, 0.42], [0.28, 0.42]], 0.42);
        for (var i = boxes.length - 2; i >= 0; i--) {
          var b = boxes[i];
          out = out.concat(uvs(cx, b.cy, b.r, b.r, [[-0.78, 0.2], [0.78, 0.2], [-0.42, 0.5], [0.42, 0.5], [0, 0.56]], 0.36));
        }
      } else {
        // 空甜筒：配料放在甜筒口
        out = uvs(cx, CONE.top + 14, CONE.hw, 1, [[0, 0], [-0.55, 0], [0.55, 0]], 0.5);
      }
      out = out.concat(offsets(cx, [[0, 452], [-34, 442], [34, 442], [0, 502], [-16, 488], [16, 488]], 0.32));
      // 甜筒旁邊的櫃台
      out = out.concat(offsets(cx, [[-130, 520], [130, 520], [-190, 520], [190, 520], [-235, 520], [235, 520]], 0.42));
      return out.concat(counter(cx));
    },
    iconBase: function (f) {
      return svg100(scoop(50, 46, 36, f).replace(/stroke-width="6"/g, 'stroke-width="5"'));
    },
    iconHolder: function (h) {
      if (h.shape === 'cup') {
        return svg100('<path d="M22,30 L33,84 Q50,90 67,84 L78,30 Z" fill="' + h.fill + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'
          + '<path d="M38,36 L43,82 M62,36 L57,82" stroke="' + h.dark + '" stroke-width="6" stroke-linecap="round"/>');
      }
      return svg100('<path d="M22,26 L50,92 L78,26 Z" fill="' + h.fill + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'
        + '<path d="M36,28 L60,66 M64,28 L40,66 M50,28 L68,48 M50,28 L32,48" stroke="' + h.dark + '" stroke-width="4" stroke-linecap="round"/>');
    }
  };

  /* ===== 杯子蛋糕 ===== */
  var CUP = { top: 372, bot: 532, hwTop: 150, hwBot: 108 };

  function wrapper(cx, h) {
    var out = shadow(cx, CUP.bot, CUP.hwBot + 20, 14) + '<path d="M' + (cx - CUP.hwTop) + ',' + CUP.top + ' L' + (cx - CUP.hwBot) + ',' + CUP.bot + ' L' + (cx + CUP.hwBot) + ',' + CUP.bot
      + ' L' + (cx + CUP.hwTop) + ',' + CUP.top + ' Z" fill="' + h.fill + '"' + LINE + '/>';
    [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].forEach(function (u) {
      out += '<path d="M' + n1(cx + u * CUP.hwTop) + ',' + (CUP.top + 6) + ' L' + n1(cx + u * CUP.hwBot) + ',' + (CUP.bot - 6)
        + '" stroke="' + h.dark + '" stroke-width="7" stroke-linecap="round"/>';
    });
    return out + '<path d="M' + n1(cx + CUP.hwTop * 0.45) + ',' + CUP.top + ' L' + n1(cx + CUP.hwBot * 0.45) + ',' + CUP.bot + ' L' + (cx + CUP.hwBot) + ',' + CUP.bot
      + ' L' + (cx + CUP.hwTop) + ',' + CUP.top + ' Z" fill="' + h.dark + '" opacity="0.3"/>'
      + '<path d="M' + (cx - CUP.hwTop) + ',' + CUP.top + ' L' + (cx - CUP.hwBot) + ',' + CUP.bot + ' L' + (cx + CUP.hwBot) + ',' + CUP.bot
      + ' L' + (cx + CUP.hwTop) + ',' + CUP.top + ' Z" fill="none"' + LINE + '/>';
  }

  var cupcake = {
    draw: function (s, cx) {
      var h = Data.holder('cupcake', s.holder) || Data.WRAPPERS[0];
      var f = s.tiers.length ? Data.flavor(s.tiers[0]) : null;
      var c = s.cream ? Data.cream(s.cream) : null;
      // 空的紙杯：先畫杯口的洞，才看得出是杯子不是一塊板子
      var out = '<ellipse cx="' + cx + '" cy="' + CUP.top + '" rx="' + CUP.hwTop + '" ry="22" fill="#FFF4DF"' + LINE + '/>';
      if (f) {
        out += '<path d="M' + (cx - CUP.hwTop - 6) + ',' + (CUP.top + 4) + ' C' + (cx - CUP.hwTop) + ',' + (CUP.top - 104) + ' ' + (cx + CUP.hwTop) + ',' + (CUP.top - 104)
          + ' ' + (cx + CUP.hwTop + 6) + ',' + (CUP.top + 4) + ' Z" fill="' + f.fill + '"' + LINE + '/>'
          + '<ellipse cx="' + (cx - 66) + '" cy="' + (CUP.top - 44) + '" rx="26" ry="11" fill="' + f.top + '" transform="rotate(-20 ' + (cx - 66) + ' ' + (CUP.top - 44) + ')"/>';
      }
      out += wrapper(cx, h);
      if (c) out += swirl(cx, CUP.top - 10, 158, c);
      return out;
    },
    spots: function (s, cx) {
      var out;
      if (s.cream) out = swirlSpots(cx, CUP.top - 10, 158, 0.46);
      else if (s.tiers.length) out = uvs(cx, CUP.top, 150, 80, [[0, -0.86], [-0.4, -0.7], [0.4, -0.7], [-0.72, -0.34], [0.72, -0.34], [-0.26, -0.28], [0.26, -0.28]], 0.46);
      else out = uvs(cx, CUP.top, 150, 22, TOP_SLOTS, 0.46);
      out = out.concat(offsets(cx, [[0, 450], [-62, 450], [62, 450], [-112, 450], [112, 450], [-30, 516], [30, 516], [-84, 516], [84, 516]], 0.34));
      out = out.concat(offsets(cx, [[-170, 524], [170, 524], [-230, 524], [230, 524]], 0.42));
      return out.concat(counter(cx));
    },
    iconBase: function (f) {
      return svg100('<path d="M12,62 C14,14 86,14 88,62 Z" fill="' + f.fill + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'
        + '<path d="M18,62 L28,90 L72,90 L82,62 Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>');
    },
    iconHolder: function (h) {
      return svg100('<path d="M14,34 L28,86 L72,86 L86,34 Z" fill="' + h.fill + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'
        + '<path d="M34,40 L40,80 M50,40 L50,80 M66,40 L60,80" stroke="' + h.dark + '" stroke-width="5" stroke-linecap="round"/>');
    }
  };

  /* ===== 甜甜圈 ===== */
  var DONUT = { cy: 372, rx: 228, ry: 118, holeRx: 70, holeRy: 34, thick: 30 };

  /* 波浪邊的橢圓（糖霜的內外緣）：取樣成折線，粗墨線蓋過去看起來就是圓滑的 */
  function wavy(cx, cy, rx, ry, waves, amp) {
    var d = '';
    var n = waves * 8;
    for (var i = 0; i < n; i++) {
      var a = i * 2 * Math.PI / n;
      var m = 1 + amp * Math.sin(a * waves);
      d += (i ? 'L' : 'M') + n1(cx + rx * m * Math.cos(a)) + ',' + n1(cy + ry * m * Math.sin(a)) + ' ';
    }
    return d + 'Z ';
  }

  var donut = {
    draw: function (s, cx) {
      var out = plate(cx, s.holder);
      var f = s.tiers.length ? Data.flavor(s.tiers[0]) : null;
      if (!f) return out;
      var h = Data.holder('donut', s.holder) || Data.PLATES[0];
      var d = DONUT;
      out += '<ellipse cx="' + cx + '" cy="' + (d.cy + d.thick) + '" rx="' + d.rx + '" ry="' + d.ry + '" fill="' + f.dark + '"' + LINE + '/>'
        + '<ellipse cx="' + cx + '" cy="' + d.cy + '" rx="' + d.rx + '" ry="' + d.ry + '" fill="' + f.fill + '"' + LINE + '/>'
        // 中間的洞：底下看到盤子，洞的上緣露出一圈內壁
        + '<ellipse cx="' + cx + '" cy="' + d.cy + '" rx="' + d.holeRx + '" ry="' + d.holeRy + '" fill="' + f.dark + '"' + LINE + '/>'
        + '<ellipse cx="' + cx + '" cy="' + (d.cy + 12) + '" rx="' + (d.holeRx - 5) + '" ry="' + (d.holeRy - 8) + '" fill="' + h.fill + '"/>';
      var c = s.cream ? Data.cream(s.cream) : null;
      if (c) {
        out += '<path fill-rule="evenodd" d="' + wavy(cx, d.cy, d.rx * 0.93, d.ry * 0.91, 9, 0.05)
          + wavy(cx, d.cy, d.holeRx * 1.28, d.holeRy * 1.36, 6, 0.05) + '" fill="' + c.fill + '"' + LINE + '/>';
      }
      return out + gloss('M' + n1(cx - d.rx * 0.78) + ',' + n1(d.cy - d.ry * 0.12) + ' Q' + n1(cx - d.rx * 0.7) + ',' + n1(d.cy - d.ry * 0.6)
        + ' ' + n1(cx - d.rx * 0.3) + ',' + n1(d.cy - d.ry * 0.78), 10, 0.6);
    },
    spots: function (s, cx) {
      if (!s.tiers.length) return emptyPlateSpots(cx);
      var d = DONUT;
      // 配料底部中心比圓環低一點，看起來才是坐在環的正中間
      return arc(cx, d.cy + 34, 150, 78, [90, 150, 30, 210, 330, 270], 0.46)
        .concat(arc(cx, d.cy + 34, 150, 78, [120, 60, 180, 0, 240, 300], 0.4))
        .concat(arc(cx, d.cy + 24, 196, 100, [90, 135, 45, 225, 315, 270], 0.34))
        .concat(arc(cx, PLATE_Y + 8, 244, 24, [180, 0], 0.4))
        .concat(counter(cx));
    },
    iconBase: function (f) {
      return svg100('<circle cx="50" cy="52" r="40" fill="' + f.fill + '" stroke="' + INK + '" stroke-width="5"/>'
        + '<circle cx="50" cy="52" r="13" fill="#FFF9E8" stroke="' + INK + '" stroke-width="5"/>');
    },
    iconHolder: iconPlate
  };

  /* ===== 鬆餅 ===== */
  var PANCAKE_W = [384, 368, 354, 340, 326];
  var PANCAKE_SHIFT = [0, -9, 8, -6, 6];  // 每片歪一點，疊起來才像手煎的
  var PANCAKE_H = 44;

  function pancakeBoxes(tiers, cx) {
    var yBot = PLATE_Y - 2;
    return tiers.map(function (id, i) {
      var w = PANCAKE_W[Math.min(i, PANCAKE_W.length - 1)];
      var b = { cx: cx + PANCAKE_SHIFT[i % PANCAKE_SHIFT.length], rx: w / 2, ry: n1(w * 0.085), yTop: yBot - PANCAKE_H, yBot: yBot, h: PANCAKE_H, id: id };
      yBot -= PANCAKE_H;
      return b;
    });
  }

  /* 一片：邊緣淡、表面深，跟真的鬆餅一樣 */
  function pancakeLayer(b, f) {
    return tierSide(b, f.top) + sideShade(b, f.dark, 0.35) + tierSide(b, 'none')
      + '<ellipse cx="' + b.cx + '" cy="' + b.yTop + '" rx="' + b.rx + '" ry="' + b.ry + '" fill="' + f.fill + '"' + LINE + '/>'
      + '<ellipse cx="' + b.cx + '" cy="' + b.yTop + '" rx="' + n1(b.rx * 0.78) + '" ry="' + n1(b.ry * 0.74) + '" fill="' + f.dark + '" opacity="0.45"/>';
  }

  var pancake = {
    draw: function (s, cx) {
      var out = plate(cx, s.holder);
      var boxes = pancakeBoxes(s.tiers, cx);
      boxes.forEach(function (b) {
        var f = Data.flavor(b.id);
        if (f) out += pancakeLayer(b, f);
      });
      var c = s.cream ? Data.cream(s.cream) : null;
      if (c && boxes.length) {
        var t = boxes[boxes.length - 1];
        // 糖漿流得比奶油長：鬆餅很薄，算下垂量時借一個比較厚的高度
        out += cream({ cx: t.cx, rx: t.rx, ry: t.ry, yTop: t.yTop, h: 92 }, c);
      }
      return out;
    },
    spots: function (s, cx) {
      var b = pancakeBoxes(s.tiers, cx);
      if (!b.length) return emptyPlateSpots(cx);
      var t = b[b.length - 1];
      var out = uvs(t.cx, t.yTop, t.rx, t.ry, TOP_SLOTS, 0.56)
        .concat(arc(t.cx, t.yTop, t.rx * 0.86, t.ry * 0.7, [180, 0], 0.46));
      for (var i = b.length - 1; i >= 0; i--) {
        var x = b[i];
        [0, -0.5, 0.5].forEach(function (u) {
          out.push(spot(x.cx + u * x.rx, x.yBot + x.ry * Math.sqrt(1 - u * u) - 4, 0.3));
        });
      }
      return out.concat(arc(cx, PLATE_Y + 4, 238, 30, [180, 0], 0.4)).concat(counter(cx));
    },
    iconBase: function (f) {
      return svg100(pancakeLayer({ cx: 50, rx: 42, ry: 14, yTop: 42, yBot: 62, h: 20 }, f).replace(/stroke-width="6"/g, 'stroke-width="5"'));
    },
    iconHolder: iconPlate
  };

  /* ===== 聖代：高腳玻璃杯，裡面一層一層 ===== */
  var GLASS = { top: 214, bot: 472, band: 56 };

  function glassHW(y) {
    var t = (GLASS.bot - y) / (GLASS.bot - GLASS.top);
    return 56 + 84 * Math.pow(Math.max(0, t), 0.75);
  }

  /* 杯子在 y0（上）到 y1（下）之間的輪廓點 */
  function glassPoints(cx, y0, y1) {
    var left = [], right = [];
    for (var i = 0; i <= 8; i++) {
      var y = y1 + (y0 - y1) * i / 8;
      var w = glassHW(y);
      left.push(n1(cx - w) + ',' + n1(y));
      right.unshift(n1(cx + w) + ',' + n1(y));
    }
    return left.concat(right);
  }

  /* 內容物的表面高度 */
  function sundaeSurface(s) { return GLASS.bot - 8 - s.tiers.length * GLASS.band; }

  var sundae = {
    draw: function (s, cx) {
      var g = GLASS;
      var out = shadow(cx, 548, 84, 15) + '<ellipse cx="' + cx + '" cy="548" rx="84" ry="15" fill="#E8F6FF"' + LINE + '/>'
        + '<rect x="' + (cx - 11) + '" y="' + (g.bot - 2) + '" width="22" height="78" fill="#E8F6FF"' + LINE + '/>'
        + '<polygon points="' + glassPoints(cx, g.top, g.bot).join(' ') + '" fill="#FFFFFF" fill-opacity="0.6"/>';
      s.tiers.forEach(function (id, i) {
        var f = Data.flavor(id);
        if (!f) return;
        var y1 = g.bot - 8 - i * g.band, y0 = y1 - g.band;
        out += '<polygon points="' + glassPoints(cx, y0, y1).join(' ') + '" fill="' + f.fill + '"/>'
          + '<path d="M' + n1(cx - glassHW(y0)) + ',' + y0 + ' L' + n1(cx + glassHW(y0)) + ',' + y0 + '" stroke="' + f.dark + '" stroke-width="6"/>';
      });
      var c = s.cream ? Data.cream(s.cream) : null;
      if (c) {
        var y = sundaeSurface(s);
        out += swirl(cx, y - 16, Math.min(112, glassHW(y) * 0.92), c);
      }
      // 杯子的外框最後畫，內容物才會被框在裡面
      return out + '<polygon points="' + glassPoints(cx, g.top, g.bot).join(' ') + '" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>'
        + '<path d="M' + n1(cx - glassHW(g.top + 40) + 18) + ',' + (g.top + 34) + ' L' + n1(cx - glassHW(g.top + 150) + 16) + ',' + (g.top + 150)
        + '" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" opacity="0.8"/>';
    },
    spots: function (s, cx) {
      var y = sundaeSurface(s);
      var out = s.cream
        ? swirlSpots(cx, y - 16, Math.min(112, glassHW(y) * 0.92), 0.42)
        : uvs(cx, y + 6, glassHW(y) * 0.92, 16, TOP_SLOTS, 0.44);
      // 杯身前面（貼在玻璃上）與杯腳旁邊
      out = out.concat(offsets(cx, [[0, 330], [-70, 330], [70, 330], [0, 400], [-46, 400], [46, 400], [0, 462], [-34, 462], [34, 462]], 0.3));
      out = out.concat(offsets(cx, [[-130, 546], [130, 546], [-190, 546], [190, 546]], 0.42));
      return out.concat(counter(cx));
    },
    iconBase: icecream.iconBase
  };

  /* ===== 餅乾：正面朝前立在盤子上，像一張貼紙 =====
     「容器」頁籤換成壓模形狀（圓、愛心、星星、花、小熊、薑餅人），所以形狀存在 state.holder：
     存檔、復原、換甜點都不用另外加欄位。
     餅乾畫兩次：先往下錯開 thick 畫一片暗色（餅乾的厚度），再畫正面；糖霜是同一個形狀縮小一圈。
     每個形狀的座標都是「單位半徑」，乘上 R 才是板面的像素。 */
  var COOKIE = { cy: 336, R: 168, thick: 16, k: 0.55 };

  function pt(x, y) { return n1(x) + ',' + n1(y); }
  function circ(x, y, r) {
    return 'M' + pt(x - r, y) + ' A' + n1(r) + ',' + n1(r) + ' 0 1 1 ' + pt(x + r, y) + ' A' + n1(r) + ',' + n1(r) + ' 0 1 1 ' + pt(x - r, y) + ' Z';
  }

  /* 每個形狀：
       parts(R)   正面的輪廓（陣列：小熊是兩個耳朵＋頭，各自描邊，耳朵壓在頭後面）
       icing(R)   糖霜的輪廓
       face       有臉的形狀（小熊、薑餅人）畫在糖霜上面
       spots      點一下放配料的位置（單位座標，配料底部中心），避開臉
       shine      糖霜上的亮線（單位座標，二次曲線三點） */
  var COOKIE_SHAPES = {
    circle: {
      parts: function (R) { return [circ(0, 0, R)]; },
      icing: function (R) { return [circ(0, 0, R * 0.82)]; },
      spots: [[0, 0.42], [-0.42, 0.38], [0.42, 0.38], [-0.22, -0.1], [0.22, -0.1], [-0.64, 0], [0.64, 0], [0, -0.46], [-0.42, -0.42], [0.42, -0.42]],
      shine: [[-0.66, -0.12], [-0.6, -0.46], [-0.3, -0.64]]
    },
    heart: {
      parts: function (R) { return [heartPath(R)]; },
      icing: function (R) { return [heartPath(R * 0.8)]; },
      spots: [[0, 0.45], [-0.38, 0.15], [0.38, 0.15], [-0.26, -0.22], [0.26, -0.22], [-0.62, -0.32], [0.62, -0.32], [0, 0.1], [0, 0.74]],
      shine: [[-0.72, -0.28], [-0.7, -0.56], [-0.44, -0.66]]
    },
    star: {
      parts: function (R) { return [starPath(R)]; },
      icing: function (R) { return [starPath(R * 0.78)]; },
      spots: [[0, 0.32], [-0.26, 0.1], [0.26, 0.1], [0, -0.42], [-0.6, -0.1], [0.6, -0.1], [-0.36, 0.62], [0.36, 0.62], [0, -0.1]],
      shine: [[-0.12, -0.42], [-0.08, -0.6], [-0.03, -0.72]]
    },
    flower: {
      parts: function (R) { return [flowerPath(R)]; },
      icing: function (R) { return [flowerPath(R * 0.8)]; },
      spots: [[0, 0.18], [-0.54, -0.18], [0.54, -0.18], [0, -0.5], [-0.54, 0.45], [0.54, 0.45], [0, 0.78], [-0.3, 0.08], [0.3, 0.08]],
      shine: [[-0.72, -0.2], [-0.68, -0.42], [-0.5, -0.52]]
    },
    bear: {
      parts: function (R) { return [circ(-0.6 * R, -0.55 * R, 0.33 * R), circ(0.6 * R, -0.55 * R, 0.33 * R), circ(0, 0.15 * R, 0.8 * R)]; },
      icing: function (R) { return [circ(0, 0.15 * R, 0.64 * R)]; },
      face: function (R, L) {
        return '<g fill="' + INK + '"><circle cx="' + n1(-0.28 * R) + '" cy="' + n1(0.04 * R) + '" r="' + n1(0.075 * R) + '"/><circle cx="' + n1(0.28 * R) + '" cy="' + n1(0.04 * R) + '" r="' + n1(0.075 * R) + '"/></g>'
          + '<ellipse cx="0" cy="' + n1(0.4 * R) + '" rx="' + n1(0.3 * R) + '" ry="' + n1(0.22 * R) + '" fill="#FFF4DF"' + L + '/>'
          + '<ellipse cx="0" cy="' + n1(0.32 * R) + '" rx="' + n1(0.1 * R) + '" ry="' + n1(0.07 * R) + '" fill="' + INK + '"/>'
          + '<path d="M' + pt(-0.1 * R, 0.46 * R) + ' Q' + pt(0, 0.54 * R) + ' ' + pt(0.1 * R, 0.46 * R) + '" fill="none"' + L + '/>';
      },
      cheeks: [[-0.52, 0.3], [0.52, 0.3]],
      spots: [[0, -0.22], [-0.6, -0.4], [0.6, -0.4], [-0.34, -0.12], [0.34, -0.12], [-0.56, 0.54], [0.56, 0.54], [0, 0.9], [-0.7, 0.18], [0.7, 0.18]],
      shine: [[-0.52, -0.02], [-0.46, -0.26], [-0.24, -0.36]]
    },
    man: {
      parts: function (R) { return [manPath(R)]; },
      // 手腳很細，整個形狀等比縮小會讓頭的糖霜往下掉；改成沿著輪廓往內留一樣寬的邊（見 cookieBody）
      insetIcing: true,
      face: function (R, L) {
        return '<g fill="' + INK + '"><circle cx="' + n1(-0.12 * R) + '" cy="' + n1(-0.66 * R) + '" r="' + n1(0.05 * R) + '"/><circle cx="' + n1(0.12 * R) + '" cy="' + n1(-0.66 * R) + '" r="' + n1(0.05 * R) + '"/></g>'
          + '<path d="M' + pt(-0.12 * R, -0.53 * R) + ' Q' + pt(0, -0.44 * R) + ' ' + pt(0.12 * R, -0.53 * R) + '" fill="none"' + L + '/>';
      },
      cheeks: [[-0.22, -0.54], [0.22, -0.54]],
      // 先排肚子上的一排扣子（數「三顆」最清楚），再排手、腳
      spots: [[0, -0.02], [0, 0.24], [0, 0.5], [-0.62, -0.08], [0.62, -0.08], [-0.44, 0.88], [0.44, 0.88], [-0.22, 0.14], [0.22, 0.14]],
      shine: [[-0.17, -0.12], [-0.19, 0.04], [-0.17, 0.2]]
    }
  };

  function heartPath(R) {
    var p = function (x, y) { return pt(x * R, y * R); };
    return 'M' + p(0, 0.95) + ' C' + p(-0.55, 0.55) + ' ' + p(-1.05, 0.15) + ' ' + p(-1, -0.35)
      + ' C' + p(-0.95, -0.85) + ' ' + p(-0.3, -1) + ' ' + p(0, -0.55)
      + ' C' + p(0.3, -1) + ' ' + p(0.95, -0.85) + ' ' + p(1, -0.35)
      + ' C' + p(1.05, 0.15) + ' ' + p(0.55, 0.55) + ' ' + p(0, 0.95) + ' Z';
  }

  /* 五角星，尖端用二次曲線磨圓（餅乾壓出來的尖角本來就是圓的）。往下挪 0.08，看起來才置中 */
  function starPath(R) {
    var O = [], I = [];
    for (var k = 0; k < 5; k++) {
      var a = (-90 + 72 * k) * Math.PI / 180, b = a + 36 * Math.PI / 180;
      O.push([1.08 * R * Math.cos(a), 1.08 * R * Math.sin(a) + 0.08 * R]);
      I.push([0.56 * R * Math.cos(b), 0.56 * R * Math.sin(b) + 0.08 * R]);
    }
    var lerp = function (p, q, t) { return pt(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t); };
    var d = 'M' + pt(I[4][0], I[4][1]);
    for (var j = 0; j < 5; j++) {
      var prev = j ? I[j - 1] : I[4];
      d += ' L' + lerp(prev, O[j], 0.8) + ' Q' + pt(O[j][0], O[j][1]) + ' ' + lerp(O[j], I[j], 0.2) + ' L' + pt(I[j][0], I[j][1]);
    }
    return d + ' Z';
  }

  /* 六片花瓣：每片是半徑 0.42 的圓、圓心離中心 0.62，相鄰兩片的外交點在半徑 0.82 上 */
  function flowerPath(R) {
    var r = n1(0.42 * R), t = 0.82 * R;
    var q = function (k) { var a = (-60 + 60 * k) * Math.PI / 180; return pt(t * Math.cos(a), t * Math.sin(a)); };
    var d = 'M' + q(-1);
    for (var k = 0; k < 6; k++) d += ' A' + r + ',' + r + ' 0 1 1 ' + q(k);
    return d + ' Z';
  }

  /* 薑餅人：頭、張開的手、兩條腿，一筆畫完（順時針） */
  function manPath(R) {
    var p = function (x, y) { return pt(x * R, y * R); };
    var a = function (r, x, y) { return ' A' + n1(r * R) + ',' + n1(r * R) + ' 0 0 1 ' + p(x, y); };
    return 'M' + p(0.16, -0.3) + ' L' + p(0.72, -0.34) + a(0.15, 0.74, -0.04) + ' L' + p(0.36, -0.02)
      + ' L' + p(0.4, 0.38) + ' L' + p(0.58, 0.82) + a(0.17, 0.28, 0.95) + ' L' + p(0.08, 0.55)
      + ' Q' + p(0, 0.47) + ' ' + p(-0.08, 0.55) + ' L' + p(-0.28, 0.95) + a(0.17, -0.58, 0.82)
      + ' L' + p(-0.4, 0.38) + ' L' + p(-0.36, -0.02) + ' L' + p(-0.74, -0.04) + a(0.15, -0.72, -0.34)
      + ' L' + p(-0.16, -0.3) + ' A' + n1(0.36 * R) + ',' + n1(0.36 * R) + ' 0 1 1 ' + p(0.16, -0.3) + ' Z';
  }

  function cookieShape(id) { return COOKIE_SHAPES[id] || COOKIE_SHAPES.circle; }

  /* 畫一片餅乾（以 (0,0) 為中心，外面再平移）。f 沒給＝還沒放麵糰，只畫虛線的壓模輪廓 */
  function cookieBody(shape, R, thick, f, c, line) {
    var L = line || LINE;
    var out = '';
    if (!f) {
      shape.parts(R).forEach(function (d) {
        out += '<path d="' + d + '" fill="#FFFFFF" fill-opacity="0.6" stroke="#B5B9C4" stroke-width="6" stroke-dasharray="14 12" stroke-linecap="round"/>';
      });
      return out;
    }
    out += '<g transform="translate(0,' + thick + ')">';
    shape.parts(R).forEach(function (d) { out += '<path d="' + d + '" fill="' + f.dark + '"' + L + '/>'; });
    out += '</g>';
    shape.parts(R).forEach(function (d) { out += '<path d="' + d + '" fill="' + f.fill + '"' + L + '/>'; });
    // 小熊的耳朵裡面暗一圈，頭再蓋一次，暗圈才不會跑到臉上
    if (shape === COOKIE_SHAPES.bear) {
      out += '<g fill="' + f.dark + '" opacity="0.55"><circle cx="' + n1(-0.6 * R) + '" cy="' + n1(-0.55 * R) + '" r="' + n1(0.17 * R) + '"/>'
        + '<circle cx="' + n1(0.6 * R) + '" cy="' + n1(-0.55 * R) + '" r="' + n1(0.17 * R) + '"/></g>'
        + '<path d="' + circ(0, 0.15 * R, 0.8 * R) + '" fill="' + f.fill + '"' + L + '/>';
    }
    if (c && shape.insetIcing) {
      // 等寬內縮：糖霜填滿整片、描一圈很粗的墨線，再用麵糰色蓋掉墨線外側，最後補回外框，
      // 留下「一圈麵糰邊＋細墨線＋糖霜」，什麼形狀都一樣寬
      var ins = n1(R * 0.1);
      shape.parts(R).forEach(function (d) {
        out += '<path d="' + d + '" fill="' + c.fill + '" stroke="' + INK + '" stroke-width="' + n1(ins * 2 + 8) + '" stroke-linejoin="round"/>'
          + '<path d="' + d + '" fill="none" stroke="' + f.fill + '" stroke-width="' + n1(ins * 2) + '" stroke-linejoin="round"/>'
          + '<path d="' + d + '" fill="none"' + L + '/>';
      });
    } else if (c) {
      shape.icing(R).forEach(function (d) { out += '<path d="' + d + '" fill="' + c.fill + '"' + L + '/>'; });
    }
    if (c) {
      var s = shape.shine;
      out += gloss('M' + pt(s[0][0] * R, s[0][1] * R) + ' Q' + pt(s[1][0] * R, s[1][1] * R) + ' ' + pt(s[2][0] * R, s[2][1] * R), n1(Math.max(4, R * 0.05)), 0.75);
    } else {
      // 沒有糖霜：表面撒幾顆烤出來的小點（用配料位置表後半段，避開臉）
      var dots = '';
      shape.spots.slice(3, 9).forEach(function (p, i) {
        dots += '<ellipse cx="' + n1((p[0] + (i % 2 ? 0.08 : -0.08)) * R) + '" cy="' + n1((p[1] - 0.14) * R) + '" rx="' + n1(0.04 * R) + '" ry="' + n1(0.03 * R) + '"/>';
      });
      out += '<g fill="' + f.dark + '" opacity="0.7">' + dots + '</g>';
    }
    if (shape.face) {
      if (shape.cheeks) {
        out += '<g fill="#FF7A9C" opacity="0.45">' + shape.cheeks.map(function (p) {
          return '<ellipse cx="' + n1(p[0] * R) + '" cy="' + n1(p[1] * R) + '" rx="' + n1(0.09 * R) + '" ry="' + n1(0.06 * R) + '"/>';
        }).join('') + '</g>';
      }
      out += shape.face(R, L);
    }
    return out;
  }

  var cookie = {
    draw: function (s, cx) {
      var f = s.tiers.length ? Data.flavor(s.tiers[0]) : null;
      var c = s.cream ? Data.cream(s.cream) : null;
      return plate(cx, 'white')
        + '<g transform="translate(' + cx + ',' + COOKIE.cy + ')">' + cookieBody(cookieShape(s.holder), COOKIE.R, COOKIE.thick, f, c) + '</g>';
    },
    spots: function (s, cx) {
      if (!s.tiers.length) return emptyPlateSpots(cx);
      var out = cookieShape(s.holder).spots.map(function (p) { return spot(cx + p[0] * COOKIE.R, COOKIE.cy + p[1] * COOKIE.R, COOKIE.k); });
      // 餅乾兩旁的盤子
      out = out.concat(offsets(cx, [[-212, 522], [212, 522], [-160, 540], [160, 540]], 0.4));
      return out.concat(arc(cx, PLATE_Y + 4, 238, 30, [180, 0], 0.4)).concat(counter(cx));
    },
    iconBase: function (f) {
      return svg100('<g transform="translate(50,48)">' + cookieBody(COOKIE_SHAPES.circle, 38, 5, f, null, ' stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"') + '</g>');
    },
    iconHolder: function (h) {
      var f = Data.flavor('golden');
      return svg100('<g transform="translate(50,46)">' + cookieBody(cookieShape(h.id), 38, 5, f, null, ' stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"') + '</g>');
    }
  };

  var SHAPES = { cake: cake, icecream: icecream, cupcake: cupcake, donut: donut, pancake: pancake, sundae: sundae, cookie: cookie };

  var CakeShapes = {
    SHAPES: SHAPES,
    TOP_SLOTS: TOP_SLOTS,
    get: function (kind) { return SHAPES[kind] || cake; }
  };

  global.CakeShapes = CakeShapes;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeShapes;
})(typeof window !== 'undefined' ? window : globalThis);
