/* 貼紙場景的純邏輯：座標夾限、尺寸循環、狀態序列化、匣子命中判定。

   為什麼要從 stickers.js 切出來：這幾件事全都是「錯了畫面看起來還是正常」的類型——
   座標沒夾住，貼紙會被拖到板子外面再也點不到；序列化沒過濾，
   刪掉一張貼紙圖之後舊存檔會讓那格永遠破圖；尺寸循環寫錯只是「點了沒反應」。
   切成純函式才能在 Node 裡直接斷言（tools/check_stickers.js D 項）。

   座標一律用 0..1 的比例（貼紙中心點相對於板面），不是像素：
   同一份存檔要能在直向、橫向、不同裝置上還原到「同一個位置」。 */
(function (global) {
  'use strict';

  /* 三段尺寸＝貼紙寬度佔板面寬的比例。s→m→l 循環，點一下換一段。
     上限 0.26：再大就會蓋掉半張背景，畫面變成一張貼紙獨大。 */
  var SIZES = { s: 0.12, m: 0.18, l: 0.26 };
  var ORDER = ['s', 'm', 'l'];
  var DEFAULT_SIZE = 'm';

  // 夾到 0..1；非數字（NaN、字串、undefined）一律當 0，絕不讓 NaN 流進座標
  function clamp01(v) {
    var n = typeof v === 'number' ? v : NaN;
    if (!isFinite(n)) return 0;
    return n < 0 ? 0 : (n > 1 ? 1 : n);
  }

  // s → m → l → s；不認得的尺寸退回 m（存檔壞掉也不會卡住）
  function cycleSize(size) {
    var i = ORDER.indexOf(size);
    if (i < 0) return DEFAULT_SIZE;
    return ORDER[(i + 1) % ORDER.length];
  }

  function isSize(size) { return ORDER.indexOf(size) >= 0; }

  /* 存檔用的最小形狀：只留 id / x / y / size，其餘（DOM 節點、時間戳）不寫進 DB。
     座標留到小數點後四位就夠——1600px 寬的合成圖上是 0.16px，看不出來，
     但可以讓存檔小很多、也讓往返比對是穩定的。 */
  function serialize(list) {
    if (!Array.isArray(list)) return [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (!it || typeof it.id !== 'string') continue;
      out.push({
        id: it.id,
        x: round4(clamp01(it.x)),
        y: round4(clamp01(it.y)),
        size: isSize(it.size) ? it.size : DEFAULT_SIZE
      });
    }
    return out;
  }

  function round4(n) { return Math.round(n * 10000) / 10000; }

  /* 從存檔還原。validIds 是「目前真的有圖檔的貼紙 id」集合（Set 或陣列）。
     兩種資料一律整筆丟掉而不是修補：
       - id 不在清單裡：那張圖已經不存在，還原出來就是破圖
       - 座標越界：存檔本身壞了，夾回去只是把壞掉的東西留在畫面上
     尺寸壞掉則退回 m——尺寸錯不會讓貼紙消失，沒必要丟整筆。 */
  function deserialize(raw, validIds) {
    if (!Array.isArray(raw)) return [];
    var has;
    if (validIds && typeof validIds.has === 'function') has = function (id) { return validIds.has(id); };
    else if (Array.isArray(validIds)) has = function (id) { return validIds.indexOf(id) >= 0; };
    else has = function () { return true; };

    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var it = raw[i];
      if (!it || typeof it !== 'object') continue;
      if (typeof it.id !== 'string' || !has(it.id)) continue;
      if (typeof it.x !== 'number' || !isFinite(it.x) || it.x < 0 || it.x > 1) continue;
      if (typeof it.y !== 'number' || !isFinite(it.y) || it.y < 0 || it.y > 1) continue;
      out.push({
        id: it.id,
        x: round4(it.x),
        y: round4(it.y),
        size: isSize(it.size) ? it.size : DEFAULT_SIZE
      });
    }
    return out;
  }

  /* 點是否落在貼紙匣裡（放開時用來判斷「拖回匣子＝刪掉」）。
     邊界含等於：五歲小孩的手指常常剛好停在邊上，判 false 會讓「拖回去刪掉」
     偶爾失效，而她不會知道為什麼——寧可寬鬆。 */
  function hitTray(point, rect) {
    if (!point || !rect) return false;
    var x = point.x, y = point.y;
    if (typeof x !== 'number' || typeof y !== 'number') return false;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  var StickersState = {
    SIZES: SIZES,
    ORDER: ORDER,
    DEFAULT_SIZE: DEFAULT_SIZE,
    clamp01: clamp01,
    cycleSize: cycleSize,
    isSize: isSize,
    serialize: serialize,
    deserialize: deserialize,
    hitTray: hitTray
  };

  global.StickersState = StickersState;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = StickersState;
})(typeof window !== 'undefined' ? window : globalThis);
