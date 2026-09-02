/* 上傳照片 → 線稿工具
   灰階化 → Sobel 邊緣偵測 → Otsu 自動門檻 → 加粗線條，全部在瀏覽器本機處理；
   輸入本來就是線稿（黑線白底）時跳過 Sobel，直接二值化。
   照片不會上傳到任何伺服器。也提供疊桶填色用的連通區域演算法。 */
const PhotoTool = (() => {
  const SIZE = 800; // 需跟 coloring.js 的 CANVAS_SIZE 一致

  // 把照片等比縮放置中畫進正方形畫布（留白邊，不裁切、不變形）
  function drawContain(img, canvas) {
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    const scale = Math.min(SIZE / img.width, SIZE / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    return ctx;
  }

  function toGray(imgData) {
    const { data } = imgData;
    const gray = new Float32Array(data.length / 4);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return gray;
  }

  // Sobel 邊緣強度，正規化到 0-255
  function sobelMagnitude(gray, w, h) {
    const mag = new Float32Array(w * h);
    let max = 1;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const gx =
          -gray[i - w - 1] + gray[i - w + 1] +
          -2 * gray[i - 1] + 2 * gray[i + 1] +
          -gray[i + w - 1] + gray[i + w + 1];
        const gy =
          -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] +
          gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
        const m = Math.sqrt(gx * gx + gy * gy);
        mag[i] = m;
        if (m > max) max = m;
      }
    }
    for (let i = 0; i < mag.length; i++) mag[i] = (mag[i] / max) * 255;
    return mag;
  }

  // Otsu 自動門檻：自動找出讓「線條」跟「底色」最分開的切點，不用手動調
  function otsuThreshold(mag) {
    const hist = new Array(256).fill(0);
    for (let i = 0; i < mag.length; i++) hist[Math.min(255, mag[i] | 0)]++;
    const total = mag.length;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];
    let sumB = 0, wB = 0, maxVar = 0, threshold = 40;
    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (wB === 0) continue;
      const wF = total - wB;
      if (wF === 0) break;
      sumB += t * hist[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const varBetween = wB * wF * (mB - mF) * (mB - mF);
      if (varBetween > maxVar) { maxVar = varBetween; threshold = t; }
    }
    return Math.max(threshold, 22); // 下限：避免雜訊多的照片整張都被判定成線條
  }

  // 加粗線條一次：3x3 範圍內只要有邊緣就算邊緣，線條更清楚，也讓填色時的縫隙變小
  function dilate(mask, w, h) {
    const out = new Uint8Array(mask.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (mask[i]) { out[i] = 1; continue; }
        let hit = 0;
        for (let dy = -1; dy <= 1 && !hit; dy++) {
          for (let dx = -1; dx <= 1 && !hit; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w && mask[ny * w + nx]) hit = 1;
          }
        }
        out[i] = hit;
      }
    }
    return out;
  }

  /* 判斷輸入是不是已經是線稿：灰階分佈兩極化（幾乎只有黑與白）就是。
     實測 AI 產的著色頁縮到 800 後中間灰只佔 3%，一般照片遠高於此。 */
  const LINEART_THRESHOLD = 128;
  const LINEART_MID_MAX = 0.08;   // 中間灰（64~191）佔比上限
  const LINEART_DARK_MIN = 0.01;  // 至少要有一點黑，全白的紙不算
  function isLineArt(gray) {
    let mid = 0, dark = 0;
    for (let i = 0; i < gray.length; i++) {
      const v = gray[i];
      if (v < 64) dark++;
      else if (v < 192) mid++;
    }
    const n = gray.length;
    return mid / n < LINEART_MID_MAX && dark / n > LINEART_DARK_MIN;
  }

  /* 主流程：Image -> { stencilCanvas(透明底、只有黑線), edgeMask, size } */
  function process(img) {
    const src = document.createElement('canvas');
    const ctx = drawContain(img, src);
    const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
    const gray = toGray(imgData);

    let mask = new Uint8Array(SIZE * SIZE);
    if (isLineArt(gray)) {
      // 本來就是黑線白底的線稿（AI 產圖、掃描的著色頁）：直接二值化。
      // 走 Sobel 的話每條黑線會被抽成兩條邊緣、中間空心，再加粗就變成一條粗管子。
      for (let i = 0; i < gray.length; i++) mask[i] = gray[i] < LINEART_THRESHOLD ? 1 : 0;
    } else {
      const mag = sobelMagnitude(gray, SIZE, SIZE);
      const t = otsuThreshold(mag);
      for (let i = 0; i < mag.length; i++) mask[i] = mag[i] > t ? 1 : 0;
    }
    mask = dilate(mask, SIZE, SIZE);

    const stencil = document.createElement('canvas');
    stencil.width = SIZE; stencil.height = SIZE;
    const sctx = stencil.getContext('2d');
    const out = sctx.createImageData(SIZE, SIZE);
    for (let i = 0; i < mask.length; i++) {
      const o = i * 4;
      if (mask[i]) {
        out.data[o] = 58; out.data[o + 1] = 58; out.data[o + 2] = 58; out.data[o + 3] = 255;
      } else {
        out.data[o + 3] = 0;
      }
    }
    sctx.putImageData(out, 0, 0);

    return { stencilCanvas: stencil, edgeMask: mask, size: SIZE };
  }

  // 從已存的線稿 PNG（透明底黑線）還原出 edgeMask，重新開啟舊照片時用
  function maskFromStencil(img) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    const mask = new Uint8Array(img.width * img.height);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) mask[p] = data[i + 3] > 128 ? 1 : 0;
    return mask;
  }

  // 疊桶填色：從 (startX,startY) 開始找出連通、沒被線條擋住的區域
  // 回傳跟畫布一樣大的 Uint8Array，1 = 這次要填的像素；點到線上或超出範圍回傳 null
  function floodFillMask(edgeMask, w, h, startX, startY) {
    startX |= 0; startY |= 0;
    if (startX < 0 || startX >= w || startY < 0 || startY >= h) return null;
    const startIdx = startY * w + startX;
    if (edgeMask[startIdx]) return null;

    const visited = new Uint8Array(w * h);
    const stack = new Int32Array(w * h);
    let sp = 0;
    stack[sp++] = startIdx;
    visited[startIdx] = 1;

    while (sp > 0) {
      const idx = stack[--sp];
      const x = idx % w, y = (idx / w) | 0;
      if (x > 0) { const n = idx - 1; if (!visited[n] && !edgeMask[n]) { visited[n] = 1; stack[sp++] = n; } }
      if (x < w - 1) { const n = idx + 1; if (!visited[n] && !edgeMask[n]) { visited[n] = 1; stack[sp++] = n; } }
      if (y > 0) { const n = idx - w; if (!visited[n] && !edgeMask[n]) { visited[n] = 1; stack[sp++] = n; } }
      if (y < h - 1) { const n = idx + w; if (!visited[n] && !edgeMask[n]) { visited[n] = 1; stack[sp++] = n; } }
    }
    return visited;
  }

  return { SIZE, process, maskFromStencil, floodFillMask };
})();
