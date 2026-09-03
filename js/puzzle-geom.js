/* 拼圖榫頭幾何：純函式、不碰 DOM。
   為什麼獨立一支：這些是唯一「看畫面驗不出來」的部分——相鄰兩片的凹凸必須成對，
   凸的那半要落在 canvas 的邊距內。抽成無 DOM 的模組，Node 才能直接 require 來測。
   瀏覽器端當成一般 classic script 載入（掛 window.PuzzleGeom），不需要打包工具。 */
(function (global) {
  'use strict';

  /* 榫頭高度占一片邊長的比例。canvas 的四周要各留這麼多邊距，
     凸出去的那半才不會被裁掉；tracePiece 的控制點也刻意不超過這個距離。 */
  var TAB = 0.22;

  /* 產生整盤的榫頭方向表。
     h[r][c]：第 r 列與第 r+1 列之間、第 c 欄那條橫邊，+1 代表上面那片凸出（下面那片凹）。
     v[r][c]：第 r 列、第 c 欄與第 c+1 欄之間那條直邊，+1 代表左邊那片凸出（右邊那片凹）。
     rand 可注入的理由：測試要能重播，不能吃 Math.random。 */
  function edgeMap(n, rand) {
    var r = rand || Math.random;
    var h = [];
    var v = [];
    var i, j, row;
    for (i = 0; i < n - 1; i++) {
      row = [];
      for (j = 0; j < n; j++) row.push(r() < 0.5 ? -1 : 1);
      h.push(row);
    }
    for (i = 0; i < n; i++) {
      row = [];
      for (j = 0; j < n - 1; j++) row.push(r() < 0.5 ? -1 : 1);
      v.push(row);
    }
    return { h: h, v: v };
  }

  /* 取出單一片的四邊方向：+1 凸、-1 凹、0 直線（外框）。
     核心不變量在這裡成立：某片的 bottom 直接取 h[r][c]，
     它下面那片的 top 取 -h[r][c]，兩者必然互為相反數，左右同理。
     只用一份表、靠取負來配對，就不可能出現「兩片都凸」的錯位。 */
  function edgesOf(map, n, r, c) {
    return {
      top: r === 0 ? 0 : -map.h[r - 1][c],
      right: c === n - 1 ? 0 : map.v[r][c],
      bottom: r === n - 1 ? 0 : map.h[r][c],
      left: c === 0 ? 0 : -map.v[r][c - 1]
    };
  }

  /* 吸附半徑占一片邊長的比例：片數愈多、每片愈小，小小手指愈難放準，
     所以比例反而要放大。上限 0.6 是因為超過 0.5 就可能同時落在兩個格位的判定範圍，
     0.6 已經是「還能靠最近者取勝」的邊界。 */
  var SNAP = { 2: 0.35, 3: 0.40, 4: 0.45, 5: 0.50, 6: 0.55 };
  function snapFraction(n) {
    if (SNAP[n] !== undefined) return SNAP[n];
    return n < 2 ? SNAP[2] : SNAP[6];
  }

  /* 一條邊上的榫頭剖面，以 (t, u) 表示：
     t 沿著邊 0..1，u 是往外的垂直距離（單位：榫頭高 H）。
     刻意讓所有控制點的 u 都不超過 1.0——超過就會畫到 canvas 邊距外被裁掉。
     形狀是經典三段 bezier：細頸出去、圓頭、細頸回來，頸寬約 0.2 個邊長。 */
  var PROFILE = [
    { type: 'line', p: [0.35, 0] },
    { type: 'bezier', p: [0.45, 0, 0.38, 0.55, 0.38, 0.75] },
    { type: 'bezier', p: [0.38, 1.00, 0.62, 1.00, 0.62, 0.75] },
    { type: 'bezier', p: [0.62, 0.55, 0.55, 0, 0.65, 0] },
    { type: 'line', p: [1, 0] }
  ];

  /* 四條邊各自的起點與方向，順時針：上→右→下→左。
     ox/oy 是這條邊的起點（用邊長的倍數表示，之後乘 size 再加邊距），
     dx/dy 是沿邊方向，px/py 是「往片外」的垂直方向。 */
  var SIDES = [
    { key: 'top', ox: 0, oy: 0, dx: 1, dy: 0, px: 0, py: -1 },
    { key: 'right', ox: 1, oy: 0, dx: 0, dy: 1, px: 1, py: 0 },
    { key: 'bottom', ox: 1, oy: 1, dx: -1, dy: 0, px: 0, py: 1 },
    { key: 'left', ox: 0, oy: 1, dx: 0, dy: -1, px: -1, py: 0 }
  ];

  /* 在 ctx 上描出一片的外形。座標原點＝含邊距的 canvas 左上角，邊距＝size*tab。
     只 beginPath/closePath，不 fill 不 stroke——呼叫端要先 clip 貼圖、再用同一條路徑描墨線，
     兩次用途不同，所以決定權留給呼叫端。 */
  function tracePiece(ctx, size, edges, tab) {
    var t = (tab === undefined ? TAB : tab);
    var m = size * t;      // 邊距
    var H = size * t;      // 榫頭高（與邊距等值，凸出去剛好貼齊 canvas 邊界）

    ctx.beginPath();
    ctx.moveTo(m, m);

    for (var s = 0; s < SIDES.length; s++) {
      var side = SIDES[s];
      var sign = edges[side.key] || 0;
      // 這條邊在絕對座標的起點
      var ax = m + side.ox * size;
      var ay = m + side.oy * size;

      // 把 (t, u) 換算成絕對座標；u 乘上 sign 決定凸或凹
      var pt = function (tt, uu) {
        var along = tt * size;
        var out = uu * H * sign;
        return [ax + side.dx * along + side.px * out, ay + side.dy * along + side.py * out];
      };

      if (sign === 0) {
        // 外框邊：直線走到下一個角
        var end = pt(1, 0);
        ctx.lineTo(end[0], end[1]);
        continue;
      }

      for (var i = 0; i < PROFILE.length; i++) {
        var seg = PROFILE[i];
        var p = seg.p;
        if (seg.type === 'line') {
          var lp = pt(p[0], p[1]);
          ctx.lineTo(lp[0], lp[1]);
        } else {
          var c1 = pt(p[0], p[1]);
          var c2 = pt(p[2], p[3]);
          var e = pt(p[4], p[5]);
          ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
        }
      }
    }

    ctx.closePath();
  }

  var PuzzleGeom = {
    TAB: TAB,
    edgeMap: edgeMap,
    edgesOf: edgesOf,
    snapFraction: snapFraction,
    tracePiece: tracePiece
  };

  global.PuzzleGeom = PuzzleGeom;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = PuzzleGeom;
})(typeof window !== 'undefined' ? window : globalThis);
