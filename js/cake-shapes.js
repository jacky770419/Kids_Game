/* 甜點店的六種甜點：每種一組 { draw, spots, iconBase, iconHolder }。

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

  var INK = '#2b2b2b';
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
  function plate(cx, id) {
    var p = Data.holder('cake', id) || Data.PLATES[0];
    return '<ellipse cx="' + cx + '" cy="' + (PLATE_Y + 4) + '" rx="262" ry="36" fill="' + p.fill + '"' + LINE + '/>'
      + '<ellipse cx="' + cx + '" cy="' + (PLATE_Y + 2) + '" rx="214" ry="25" fill="none" stroke="' + p.rim + '" stroke-width="5"/>';
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

  function tier(b, f) {
    var x0 = n1(b.cx - b.rx), x1 = n1(b.cx + b.rx);
    var ym = n1(b.yTop + b.h * 0.55);
    return tierSide(b, f.fill)
      // 腰上一條暗一階的夾心，跟著下緣一樣彎，看起來才是圓的
      + '<path d="M' + n1(x0 + 3) + ',' + ym + ' A' + b.rx + ',' + b.ry + ' 0 0 0 ' + n1(x1 - 3) + ',' + ym
      + '" fill="none" stroke="' + f.dark + '" stroke-width="10" stroke-linecap="round"/>'
      + '<ellipse cx="' + b.cx + '" cy="' + b.yTop + '" rx="' + b.rx + '" ry="' + b.ry + '" fill="' + f.top + '"' + LINE + '/>';
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
    return '<path d="' + d + '" fill="' + c.fill + '"' + LINE + '/>';
  }

  /* 擠花：一圈一圈往上縮，頂端拉出一個尖（杯子蛋糕、聖代） */
  function swirl(cx, yBase, rx, c) {
    var out = '';
    var h = rx * 0.4;
    var rings = 3;
    for (var i = 0; i < rings; i++) {
      var r = rx * (1 - i * 0.27);
      var y = yBase - i * h * 1.05;
      out += '<ellipse cx="' + cx + '" cy="' + n1(y) + '" rx="' + n1(r) + '" ry="' + n1(h * 0.78) + '" fill="' + c.fill + '"' + LINE + '/>';
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
        if (c) out += cream(b, c);
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
    return '<path d="' + d + ' Z" fill="' + f.fill + '"' + LINE + '/>'
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
    var out = '<ellipse cx="' + cx + '" cy="' + (CONE.tip + 2) + '" rx="56" ry="13" fill="#FFFFFF"' + LINE + '/>'
      + '<path d="M' + (cx - w) + ',' + t + ' L' + cx + ',' + CONE.tip + ' L' + (cx + w) + ',' + t + ' Z" fill="' + h.fill + '"' + LINE + '/>';
    // 格紋：從上緣出發、平行兩側的斜線，碰到另一邊就停
    var d = '';
    [-0.5, 0, 0.5].forEach(function (a) {
      var p = (1 - a) / 2;
      d += 'M' + n1(cx + a * w) + ',' + t + ' L' + n1(cx + (a + p) * w) + ',' + n1(t + p * H) + ' ';
      d += 'M' + n1(cx - a * w) + ',' + t + ' L' + n1(cx - (a + p) * w) + ',' + n1(t + p * H) + ' ';
    });
    return out + '<path d="' + d + '" fill="none" stroke="' + h.dark + '" stroke-width="5" stroke-linecap="round"/>';
  }

  function cup(cx, h) {
    var t = CONE.top, b = 536;
    var out = '<path d="M' + (cx - 104) + ',' + t + ' L' + (cx - 74) + ',' + b + ' Q' + cx + ',' + (b + 18) + ' ' + (cx + 74) + ',' + b
      + ' L' + (cx + 104) + ',' + t + ' Z" fill="' + h.fill + '"' + LINE + '/>';
    [-0.6, -0.2, 0.2, 0.6].forEach(function (u) {
      out += '<path d="M' + n1(cx + u * 94) + ',' + (t + 8) + ' L' + n1(cx + u * 68) + ',' + (b + 4) + '" stroke="' + h.dark + '" stroke-width="10" stroke-linecap="round"/>';
    });
    return out;
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
    var out = '<path d="M' + (cx - CUP.hwTop) + ',' + CUP.top + ' L' + (cx - CUP.hwBot) + ',' + CUP.bot + ' L' + (cx + CUP.hwBot) + ',' + CUP.bot
      + ' L' + (cx + CUP.hwTop) + ',' + CUP.top + ' Z" fill="' + h.fill + '"' + LINE + '/>';
    [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].forEach(function (u) {
      out += '<path d="M' + n1(cx + u * CUP.hwTop) + ',' + (CUP.top + 6) + ' L' + n1(cx + u * CUP.hwBot) + ',' + (CUP.bot - 6)
        + '" stroke="' + h.dark + '" stroke-width="7" stroke-linecap="round"/>';
    });
    return out;
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
      return out;
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
    return tierSide(b, f.top)
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
      var out = '<ellipse cx="' + cx + '" cy="548" rx="84" ry="15" fill="#E8F6FF"' + LINE + '/>'
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

  var SHAPES = { cake: cake, icecream: icecream, cupcake: cupcake, donut: donut, pancake: pancake, sundae: sundae };

  var CakeShapes = {
    SHAPES: SHAPES,
    TOP_SLOTS: TOP_SLOTS,
    get: function (kind) { return SHAPES[kind] || cake; }
  };

  global.CakeShapes = CakeShapes;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeShapes;
})(typeof window !== 'undefined' ? window : globalThis);
