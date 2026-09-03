/* 復原（undo）快照的「外接矩形」計算——純邏輯，沒有 DOM 也沒有 canvas，可以在 Node 裡直接測。

   為什麼要這東西：著色頁本來是「每筆動作前存整張 ImageData」。paintLayer 在 iPad 直向是
   800x1600，一張快照就是 800*1600*4 = 5.12 MB，復原上限 25 筆 → 128 MB 全部壓在 JS 堆積上，
   Safari 會直接把分頁殺掉。實際上一筆畫只動到畫面的一小塊，所以改成：作畫時把每次繪圖呼叫
   的影響範圍累積起來，收筆時只把那塊矩形的「下筆前內容」存下來。

   累積器只是四個數字（minX/minY/maxX/maxY），加範圍的時候一律用「圓」來描述——
   線段就是兩端各一個圓（圓頭筆觸本來就是這樣畫的），散點就是把偏移量算進半徑。
   寧可算大一點也不能算小：矩形算小了，復原之後會留下擦不掉的殘影。 */

(function (global) {
  'use strict';

  // 空的累積器。用 null 當「還沒有任何範圍」的旗標，不用 Infinity 免得算術上出怪值。
  function create() {
    return { minX: null, minY: null, maxX: null, maxY: null };
  }

  // 把一個圓（圓心 x,y 半徑 r）納入範圍
  function addCircle(acc, x, y, r) {
    if (!acc) return acc;
    if (!isFinite(x) || !isFinite(y)) return acc;
    const rad = isFinite(r) ? Math.abs(r) : 0;
    const x0 = x - rad, x1 = x + rad;
    const y0 = y - rad, y1 = y + rad;
    if (acc.minX === null) {
      acc.minX = x0; acc.maxX = x1;
      acc.minY = y0; acc.maxY = y1;
    } else {
      if (x0 < acc.minX) acc.minX = x0;
      if (x1 > acc.maxX) acc.maxX = x1;
      if (y0 < acc.minY) acc.minY = y0;
      if (y1 > acc.maxY) acc.maxY = y1;
    }
    return acc;
  }

  // 圓頭線段＝兩端各一個圓（中段一定被兩端的外接矩形聯集包住）
  function addSegment(acc, from, to, r) {
    if (!acc || !from || !to) return acc;
    addCircle(acc, from.x, from.y, r);
    addCircle(acc, to.x, to.y, r);
    return acc;
  }

  /* 收筆：把累積範圍夾限到畫布並向外取整（floor/ceil），回 {x,y,w,h}。
     完全沒有範圍、或整段都落在畫布外 → null（呼叫端就不推這筆歷史）。
     寬高保證 >= 1：半徑 0 的點取整後可能是 0 寬，getImageData(0 寬) 會丟例外。 */
  function toRect(acc, w, h) {
    if (!acc || acc.minX === null) return null;
    if (!(w > 0) || !(h > 0)) return null;
    let x0 = Math.floor(acc.minX);
    let y0 = Math.floor(acc.minY);
    let x1 = Math.ceil(acc.maxX);
    let y1 = Math.ceil(acc.maxY);
    if (x1 <= 0 || y1 <= 0 || x0 >= w || y0 >= h) return null;   // 整段在畫布外
    if (x0 < 0) x0 = 0;
    if (y0 < 0) y0 = 0;
    if (x1 > w) x1 = w;
    if (y1 > h) y1 = h;
    let rw = x1 - x0;
    let rh = y1 - y0;
    if (rw < 1) { rw = 1; if (x0 + rw > w) x0 = w - rw; }
    if (rh < 1) { rh = 1; if (y0 + rh > h) y0 = h - rh; }
    return { x: x0, y: y0, w: rw, h: rh };
  }

  /* 疊桶填色用：掃 Uint8Array 遮罩（1 = 這個像素會被改），回外接矩形，
     各方向外擴 pad 再夾限。全 0 回 null。
     640k 個元素的單層迴圈在手機上也是幾毫秒，不需要為此做分列最佳化。 */
  function maskExtent(mask, w, h, pad) {
    if (!mask || !(w > 0) || !(h > 0)) return null;
    const p = (isFinite(pad) && pad > 0) ? Math.ceil(pad) : 0;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        if (!mask[row + x]) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return null;
    let x0 = minX - p, y0 = minY - p;
    let x1 = maxX + p + 1, y1 = maxY + p + 1;   // +1：外接矩形是半開區間
    if (x0 < 0) x0 = 0;
    if (y0 < 0) y0 = 0;
    if (x1 > w) x1 = w;
    if (y1 > h) y1 = h;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  const UndoRect = {
    create: create,
    addCircle: addCircle,
    addSegment: addSegment,
    toRect: toRect,
    maskExtent: maskExtent
  };

  global.UndoRect = UndoRect;
  // Node 測試用；瀏覽器沒有 module，這行會被跳過
  if (typeof module !== 'undefined' && module.exports) module.exports = UndoRect;
})(typeof window !== 'undefined' ? window : globalThis);
