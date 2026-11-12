/* 甜點店的配料圖：每種配料一段 SVG 字串。

   每個都畫在「底部中心＝(0,0)、往上約 100 單位高、左右約 ±50」的座標裡，
   放的時候再由 cake-draw.js 平移縮放；畫風：墨線（全站的 --ink）、粗外框、平塗色。
   比 100 單位高出一截的列在 TALL（小圖要縮小才放得進格子，check_cake.js 也用它算頂到遮雨棚沒有）。
   純字串，不碰 DOM。 */
(function (global) {
  'use strict';

  var INK = '#33274F';
  var SW = 'stroke="' + INK + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"';
  var THIN = 'stroke="' + INK + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';

  /* 水果切片的放射線與種子 */
  function spokes(n, cy, r0, r1, color, width) {
    var d = '';
    for (var i = 0; i < n; i++) {
      var a = i * 2 * Math.PI / n;
      var c = Math.cos(a), s = Math.sin(a);
      d += 'M' + (c * r0).toFixed(1) + ',' + (cy + s * r0).toFixed(1) + ' L' + (c * r1).toFixed(1) + ',' + (cy + s * r1).toFixed(1) + ' ';
    }
    return '<path d="' + d + '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round" fill="none"/>';
  }

  function seeds(n, cy, r) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var a = i * 2 * Math.PI / n;
      out += '<circle cx="' + (Math.cos(a) * r).toFixed(1) + '" cy="' + (cy + Math.sin(a) * r).toFixed(1) + '" r="3.2" fill="' + INK + '"/>';
    }
    return out;
  }

  var SVG = {
    /* ===== 水果 ===== */
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
    banana:
      '<path d="M-44,-62 C-38,-18 14,-2 46,-30 L40,-46 C14,-26 -14,-38 -30,-70 Z" fill="#FFE066" ' + SW + '/>'
      + '<path d="M-30,-70 L-36,-82 L-50,-76 L-44,-62 Z" fill="#B8862D" ' + SW + '/>'
      + '<path d="M-26,-46 C-14,-28 8,-20 28,-28" fill="none" stroke="#E0B520" stroke-width="5" stroke-linecap="round"/>',
    orange:
      '<circle cx="0" cy="-42" r="40" fill="#FF9F1C" ' + SW + '/>'
      + '<circle cx="0" cy="-42" r="29" fill="#FFD27A"/>'
      + spokes(8, -42, 5, 28, '#FF9F1C', 5),
    kiwi:
      '<circle cx="0" cy="-42" r="40" fill="#8B5E34" ' + SW + '/>'
      + '<circle cx="0" cy="-42" r="31" fill="#9BD14B"/>'
      + '<circle cx="0" cy="-42" r="10" fill="#F4F9D8"/>'
      + seeds(10, -42, 18),
    grape:
      '<path d="M0,-74 L4,-92" fill="none" ' + SW + '/>'
      + '<path d="M4,-86 Q24,-98 34,-82 Q18,-72 4,-86 Z" fill="#5CC15A" ' + SW + '/>'
      + '<g fill="#9B5DE5" ' + THIN + '>'
      + '<circle cx="-24" cy="-62" r="15"/><circle cx="4" cy="-64" r="15"/><circle cx="28" cy="-58" r="14"/>'
      + '<circle cx="-14" cy="-38" r="15"/><circle cx="14" cy="-38" r="15"/><circle cx="0" cy="-15" r="14"/></g>',
    pineapple:
      '<path d="M-16,-70 L-30,-104 L-8,-88 L0,-118 L8,-88 L30,-104 L16,-70 Z" fill="#5CC15A" ' + SW + '/>'
      + '<ellipse cx="0" cy="-37" rx="31" ry="36" fill="#FFC93C" ' + SW + '/>'
      + '<path d="M-20,-58 L18,-16 M-2,-70 L28,-36 M-28,-36 L-2,-6 M20,-58 L-18,-16 M2,-70 L-28,-36 M28,-36 L2,-6" stroke="#E0A020" stroke-width="4" stroke-linecap="round" fill="none"/>',
    watermelon:
      '<path d="M-48,-70 A48,60 0 0 0 48,-70 Z" fill="#5CC15A" ' + SW + '/>'
      + '<path d="M-38,-70 A38,48 0 0 0 38,-70 Z" fill="#FF5C74"/>'
      + '<g fill="' + INK + '"><ellipse cx="-18" cy="-54" rx="3.5" ry="5.5"/><ellipse cx="0" cy="-42" rx="3.5" ry="5.5"/><ellipse cx="18" cy="-54" rx="3.5" ry="5.5"/></g>',

    /* ===== 糖果 ===== */
    cookie:
      '<circle cx="0" cy="-42" r="40" fill="#E2B071" ' + SW + '/>'
      + '<g fill="#6B3E22"><circle cx="-14" cy="-54" r="6.5"/><circle cx="14" cy="-58" r="5.5"/><circle cx="-4" cy="-34" r="6"/>'
      + '<circle cx="20" cy="-30" r="6.5"/><circle cx="-22" cy="-24" r="4.5"/></g>',
    chocolate:
      '<rect x="-34" y="-84" width="68" height="84" rx="8" fill="#7A4726" ' + SW + '/>'
      + '<path d="M-34,-56 L34,-56 M-34,-28 L34,-28 M0,-84 L0,0" stroke="#5E3A20" stroke-width="6" fill="none"/>'
      + '<path d="M-26,-76 L-10,-76" stroke="#C08458" stroke-width="5" stroke-linecap="round"/>',
    candy:
      '<path d="M-22,-42 L-50,-62 L-50,-22 Z" fill="#FF9EC4" ' + SW + '/>'
      + '<path d="M22,-42 L50,-62 L50,-22 Z" fill="#FF9EC4" ' + SW + '/>'
      + '<ellipse cx="0" cy="-42" rx="28" ry="24" fill="#FF6B9A" ' + SW + '/>'
      + '<path d="M-12,-58 Q6,-42 -10,-24 M8,-62 Q24,-44 8,-26" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" fill="none"/>',
    marshmallow:
      '<path d="M-34,-20 L-34,-58 A34,14 0 0 1 34,-58 L34,-20 A34,14 0 0 1 -34,-20 Z" fill="#FFD5E5" ' + SW + '/>'
      + '<ellipse cx="0" cy="-58" rx="34" ry="14" fill="#FFFFFF" ' + SW + '/>',
    macaron:
      '<path d="M-42,-46 C-42,-74 42,-74 42,-46 Z" fill="#B79CFF" ' + SW + '/>'
      + '<rect x="-38" y="-46" width="76" height="14" rx="7" fill="#FFF4DF" ' + SW + '/>'
      + '<path d="M-42,-32 C-42,-2 42,-2 42,-32 Z" fill="#B79CFF" ' + SW + '/>',
    lollipop:
      '<path d="M0,-3 L0,-72" stroke="' + INK + '" stroke-width="17" stroke-linecap="round"/>'
      + '<path d="M0,-3 L0,-72" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>'
      + '<circle cx="0" cy="-104" r="38" fill="#FF6B9A" ' + SW + '/>'
      + '<path d="M0,-104 C8,-116 24,-104 12,-92 C-6,-78 -28,-94 -22,-114 C-14,-136 22,-138 28,-104" fill="none" stroke="#FFD93D" stroke-width="7" stroke-linecap="round"/>',
    wafer:
      '<g transform="rotate(10)">'
      + '<rect x="-13" y="-132" width="26" height="132" rx="8" fill="#EDB95E" ' + SW + '/>'
      + '<path d="M-11,-108 L11,-120 M-11,-82 L11,-94 M-11,-56 L11,-68 M-11,-30 L11,-42" stroke="#7A4726" stroke-width="6" stroke-linecap="round"/></g>',
    sprinkles:
      '<g stroke-width="11" stroke-linecap="round">'
      + '<path d="M-36,-20 L-26,-30" stroke="#FF6B9A"/><path d="M-10,-14 L4,-14" stroke="#7CC8F5"/>'
      + '<path d="M24,-30 L34,-20" stroke="#FFD93D"/><path d="M-30,-52 L-32,-66" stroke="#8EDB8A"/>'
      + '<path d="M-8,-42 L4,-50" stroke="#FFB05C"/><path d="M20,-54 L34,-58" stroke="#B79CFF"/>'
      + '<path d="M-12,-78 L0,-72" stroke="#F4686E"/><path d="M14,-86 L18,-74" stroke="#7CC8F5"/></g>',
    butter:
      '<path d="M-44,-34 L-16,-54 L44,-44 L44,-14 L16,-2 L-44,-8 Z" fill="#FFE98A" ' + SW + '/>'
      + '<path d="M-44,-34 L16,-26 L44,-44 M16,-26 L16,-2" fill="none" ' + SW + '/>',

    /* ===== 裝飾 ===== */
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
    crown:
      '<path d="M-44,-8 L-48,-70 L-22,-44 L0,-82 L22,-44 L48,-70 L44,-8 Z" fill="#FFD93D" ' + SW + '/>'
      + '<rect x="-44" y="-20" width="88" height="14" rx="4" fill="#FFB300" ' + SW + '/>'
      + '<g fill="#FF6B9A" ' + THIN + '><circle cx="-48" cy="-74" r="6"/><circle cx="0" cy="-86" r="6"/><circle cx="48" cy="-74" r="6"/></g>',
    butterfly:
      '<path d="M-3,-46 C-22,-90 -60,-84 -52,-52 C-48,-38 -22,-36 -3,-46 Z" fill="#7CC8F5" ' + SW + '/>'
      + '<path d="M3,-46 C22,-90 60,-84 52,-52 C48,-38 22,-36 3,-46 Z" fill="#7CC8F5" ' + SW + '/>'
      + '<path d="M-3,-42 C-20,-40 -40,-22 -30,-10 C-20,0 -6,-16 -3,-42 Z" fill="#FF9EC4" ' + SW + '/>'
      + '<path d="M3,-42 C20,-40 40,-22 30,-10 C20,0 6,-16 3,-42 Z" fill="#FF9EC4" ' + SW + '/>'
      + '<path d="M0,-66 L0,-12" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/>'
      + '<path d="M0,-66 Q-6,-82 -14,-86 M0,-66 Q6,-82 14,-86" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>',
    rainbow:
      '<g fill="none" stroke-linecap="butt">'
      + '<path d="M-48,-16 A48,48 0 0 1 48,-16" stroke="' + INK + '" stroke-width="34"/>'
      + '<path d="M-48,-16 A48,48 0 0 1 48,-16" stroke="#FF6B6B" stroke-width="12"/>'
      + '<path d="M-37,-16 A37,37 0 0 1 37,-16" stroke="#FFD93D" stroke-width="11"/>'
      + '<path d="M-26,-16 A26,26 0 0 1 26,-16" stroke="#7CC8F5" stroke-width="11"/></g>'
      + '<g fill="#FFFFFF" ' + THIN + '><ellipse cx="-44" cy="-12" rx="20" ry="12"/><ellipse cx="44" cy="-12" rx="20" ry="12"/></g>',
    bow:
      '<path d="M-6,-44 L-48,-70 L-48,-16 Z" fill="#FF6B9A" ' + SW + '/>'
      + '<path d="M6,-44 L48,-70 L48,-16 Z" fill="#FF6B9A" ' + SW + '/>'
      + '<circle cx="0" cy="-44" r="12" fill="#FFB3D1" ' + SW + '/>',
    leaf:
      '<path d="M0,-2 C-46,-22 -34,-76 0,-96 C34,-76 46,-22 0,-2 Z" fill="#6FD08C" ' + SW + '/>'
      + '<path d="M0,-12 L0,-76 M0,-34 L-16,-48 M0,-34 L16,-48 M0,-54 L-12,-66 M0,-54 L12,-66" fill="none" stroke="#3FA45F" stroke-width="4" stroke-linecap="round"/>',
    candle:
      '<rect x="-12" y="-118" width="24" height="118" rx="5" fill="#FFFFFF" ' + SW + '/>'
      + '<path d="M-10,-96 L10,-108 M-10,-66 L10,-78 M-10,-36 L10,-48 M-10,-8 L10,-20" stroke="#FF6B9A" stroke-width="8" stroke-linecap="round"/>'
      + '<path d="M0,-118 L0,-128" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>'
      // 火焰另外包一層 class，甜點頁的 CSS 讓它晃（prefers-reduced-motion 時不晃）
      + '<g class="flame"><path d="M0,-170 C14,-150 18,-136 0,-126 C-18,-136 -14,-150 0,-170 Z" fill="#FFB300" ' + SW + '/>'
      + '<path d="M0,-152 C6,-144 7,-137 0,-133 C-7,-137 -6,-144 0,-152 Z" fill="#FFF3B0"/></g>',
    umbrella:
      '<path d="M0,0 L0,-96" fill="none" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>'
      + '<path d="M-54,-94 C-46,-132 46,-132 54,-94 C42,-104 30,-104 18,-94 C8,-104 -8,-104 -18,-94 C-30,-104 -42,-104 -54,-94 Z" fill="#FF6B6B" ' + SW + '/>'
      + '<path d="M-18,-94 C-16,-112 -8,-124 0,-126 C8,-124 16,-112 18,-94 C8,-104 -8,-104 -18,-94 Z" fill="#FFD93D" ' + SW + '/>'
  };

  /* 比 100 單位高出一截的配料：小圖要縮小，值是畫出來的實際高度 */
  var TALL = { candle: 170, lollipop: 142, wafer: 132, umbrella: 128, pineapple: 118 };

  var CakeToppings = { SVG: SVG, TALL: TALL };

  global.CakeToppings = CakeToppings;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = CakeToppings;
})(typeof window !== 'undefined' ? window : globalThis);
