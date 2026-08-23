/* 著色遊戲：填滿 / 畫筆 / 潑墨 三種模式，支援一般顏色與花紋顏料，
   也支援上傳自己的照片自動變成線條畫稿 */
(() => {
  const COLORS = [
    '#e53935', '#fb8c00', '#fdd835', '#7cb342', '#26a69a',
    '#42a5f5', '#5c6bc0', '#ab47bc', '#f06292', '#8d6e63',
    '#455a64', '#ffffff'
  ];

  const CANVAS_SIZE = 800;   // 畫布內部解析度，跟 photo-tool.js 的 SIZE 一致
  const BRUSH_WIDTH = 30;    // 畫筆粗細（畫布座標）
  const CUSTOM_KEY = 'kidsCustomPics';
  const MAX_CUSTOM = 12;     // 本機最多保留幾張自己上傳的照片

  const holder = document.getElementById('svgHolder');
  const artWrap = document.getElementById('artWrap');
  const palette = document.getElementById('palette');
  const picName = document.getElementById('picName');
  const deleteBtn = document.getElementById('deleteBtn');
  const processingOverlay = document.getElementById('processingOverlay');

  let galleryIndex = 0;
  let customPics = loadCustomPics();  // [{type:'raster', id, name, dataUrl}]
  let mode = 'fill';                                // fill | brush | spray
  let paint = { type: 'color', value: COLORS[0] };  // 或 { type:'pattern', id }
  let paintCanvas = null;
  let ctx = null;
  let fillCanvas = null, fillCtx = null;   // 只有上傳照片模式會用到
  let rasterEdgeMask = null;               // 目前這張照片的線條遮罩（填色用）

  function gallery() {
    return [
      ...LINEART.map(x => ({ type: 'vector', name: x.name, svg: x.svg })),
      ...customPics
    ];
  }

  /* ===== 本機儲存自己上傳的照片 ===== */
  function loadCustomPics() {
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveCustomPics() {
    while (customPics.length > MAX_CUSTOM) customPics.shift();
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(customPics)); }
    catch (e) { /* 容量滿了就不存，至少這次畫面上還在 */ }
  }

  /* ===== 花紋準備 ===== */
  // SVG 用的 <defs>（給填滿模式）
  function patternDefs() {
    return '<defs>' + PATTERNS.map(p =>
      `<pattern id="${p.id}" width="40" height="40" patternUnits="userSpaceOnUse">${p.tile}</pattern>`
    ).join('') + '</defs>';
  }

  // Canvas 用的 pattern（給畫筆/潑墨/照片模式），開頁時先預載
  PATTERNS.forEach(p => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 40 40">${p.tile}</svg>`;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 80; c.height = 80;
      c.getContext('2d').drawImage(img, 0, 0);
      p.canvasPattern = c;
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

  function paintStyle() {
    if (paint.type === 'color') return paint.value;
    const p = PATTERNS.find(x => x.id === paint.id);
    if (p && p.canvasPattern) {
      const pat = ctx.createPattern(p.canvasPattern, 'repeat');
      return pat || '#ccc';
    }
    return '#ccc';
  }

  function isEraser() {
    return paint.type === 'color' && paint.value === '#ffffff';
  }

  /* ===== 調色盤：一般顏色 + 花紋 ===== */
  function buildPalette() {
    COLORS.forEach((color, i) => {
      const b = document.createElement('button');
      b.className = 'swatch' + (i === 0 ? ' selected' : '');
      b.style.background = color;
      if (color === '#ffffff') b.textContent = '🧼'; // 白色兼橡皮擦
      b.addEventListener('click', () => selectPaint(b, { type: 'color', value: color }));
      palette.appendChild(b);
    });
    PATTERNS.forEach(p => {
      const b = document.createElement('button');
      b.className = 'swatch pattern-swatch';
      b.innerHTML = `<svg viewBox="0 0 40 40">${p.tile}</svg>`;
      b.addEventListener('click', () => selectPaint(b, { type: 'pattern', id: p.id }));
      palette.appendChild(b);
    });
  }

  function selectPaint(btn, newPaint) {
    paint = newPaint;
    palette.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
    btn.classList.add('selected');
    Sound.click();
  }

  /* ===== 模式切換 ===== */
  const modeBtns = { fill: 'modeFill', brush: 'modeBrush', spray: 'modeSpray' };
  Object.entries(modeBtns).forEach(([m, id]) => {
    document.getElementById(id).addEventListener('click', () => {
      mode = m;
      Object.values(modeBtns).forEach(bid =>
        document.getElementById(bid).classList.toggle('selected', bid === id));
      if (paintCanvas) paintCanvas.style.pointerEvents = (m === 'fill') ? 'none' : 'auto';
      Sound.click();
    });
  });

  /* ===== 顯示目前這張（依類型分流） ===== */
  function showCurrent() {
    const list = gallery();
    galleryIndex = (galleryIndex + list.length) % list.length;
    const item = list[galleryIndex];
    picName.textContent = item.name;
    deleteBtn.hidden = item.type !== 'raster';
    artWrap.innerHTML = '';
    fillCanvas = fillCtx = rasterEdgeMask = null;

    if (item.type === 'vector') loadVector(item);
    else loadRaster(item);
  }

  /* ===== 內建線稿：三層疊放 =====
     1. art-base    真正的線稿，fill 模式在這層上色
     2. paintLayer  畫筆 / 潑墨畫的透明畫布
     3. art-outline art-base 的複本，把可上色區域改成無填色、只留外框，
                    蓋在最上面且不接收觸控，確保外框線永遠不會被塗蓋 */
  function loadVector(item) {
    artWrap.innerHTML = item.svg;

    const baseSvg = artWrap.querySelector('svg');
    baseSvg.classList.add('art-base');
    baseSvg.insertAdjacentHTML('afterbegin', patternDefs()); // 讓填滿模式能用 url(#pat-xx)

    paintCanvas = document.createElement('canvas');
    paintCanvas.id = 'paintLayer';
    paintCanvas.width = CANVAS_SIZE;
    paintCanvas.height = CANVAS_SIZE;
    paintCanvas.style.pointerEvents = (mode === 'fill') ? 'none' : 'auto';
    artWrap.appendChild(paintCanvas);
    ctx = paintCanvas.getContext('2d');
    bindPaintEvents();

    const outlineSvg = baseSvg.cloneNode(true);
    outlineSvg.classList.remove('art-base');
    outlineSvg.classList.add('art-outline');
    outlineSvg.querySelector('defs')?.remove();
    outlineSvg.querySelectorAll('.c').forEach(el => el.setAttribute('fill', 'none'));
    artWrap.appendChild(outlineSvg);

    sizeArt();
  }

  /* ===== 上傳照片產生的畫稿：一樣三層，只是底層跟頂層改用 canvas =====
     1. fillLayer  疊桶填色圖層
     2. paintLayer 畫筆 / 潑墨畫的透明畫布
     3. lineLayer  處理好的線條（透明底、只有黑線），不可更動，蓋在最上面 */
  function loadRaster(item) {
    const img = new Image();
    img.onload = () => {
      rasterEdgeMask = PhotoTool.maskFromStencil(img);

      fillCanvas = document.createElement('canvas');
      fillCanvas.id = 'fillLayer';
      fillCanvas.width = CANVAS_SIZE;
      fillCanvas.height = CANVAS_SIZE;
      artWrap.appendChild(fillCanvas);
      fillCtx = fillCanvas.getContext('2d');

      paintCanvas = document.createElement('canvas');
      paintCanvas.id = 'paintLayer';
      paintCanvas.width = CANVAS_SIZE;
      paintCanvas.height = CANVAS_SIZE;
      paintCanvas.style.pointerEvents = (mode === 'fill') ? 'none' : 'auto';
      artWrap.appendChild(paintCanvas);
      ctx = paintCanvas.getContext('2d');
      bindPaintEvents();

      const lineCanvas = document.createElement('canvas');
      lineCanvas.id = 'lineLayer';
      lineCanvas.width = CANVAS_SIZE;
      lineCanvas.height = CANVAS_SIZE;
      lineCanvas.getContext('2d').drawImage(img, 0, 0);
      artWrap.appendChild(lineCanvas);

      sizeArt();
    };
    img.src = item.dataUrl;
  }

  // 讓作品區維持正方形、置中
  function sizeArt() {
    const side = Math.floor(Math.min(holder.clientWidth, holder.clientHeight) - 12);
    artWrap.style.width = side + 'px';
    artWrap.style.height = side + 'px';
  }
  window.addEventListener('resize', sizeArt);

  /* ===== 填滿模式（點一下整區上色） ===== */
  artWrap.addEventListener('pointerdown', (e) => {
    if (mode !== 'fill') return;
    const item = gallery()[galleryIndex];

    if (item.type === 'vector') {
      const region = e.target.closest('.c');
      if (!region) return;
      region.setAttribute('fill', paint.type === 'color' ? paint.value : `url(#${paint.id})`);
      Sound.pop();
      return;
    }

    if (item.type === 'raster' && fillCanvas && rasterEdgeMask) {
      const rect = fillCanvas.getBoundingClientRect();
      const px = Math.floor((e.clientX - rect.left) / rect.width * CANVAS_SIZE);
      const py = Math.floor((e.clientY - rect.top) / rect.height * CANVAS_SIZE);
      const filled = PhotoTool.floodFillMask(rasterEdgeMask, CANVAS_SIZE, CANVAS_SIZE, px, py);
      if (!filled) return; // 點到線條上，不處理
      applyFloodFill(filled);
      Sound.pop();
    }
  });

  // 把目前選的顏色/花紋蓋到這次疊桶填色算出來的範圍裡
  function applyFloodFill(filledMask) {
    const tmp = document.createElement('canvas');
    tmp.width = CANVAS_SIZE;
    tmp.height = CANVAS_SIZE;
    const tctx = tmp.getContext('2d');
    tctx.fillStyle = paintStyle();
    tctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const imgData = tctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let i = 0; i < filledMask.length; i++) {
      if (!filledMask[i]) imgData.data[i * 4 + 3] = 0; // 範圍外設成透明
    }
    tctx.putImageData(imgData, 0, 0);

    fillCtx.drawImage(tmp, 0, 0);
  }

  /* ===== 畫筆 / 潑墨模式 ===== */
  function canvasPos(e) {
    const r = paintCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * CANVAS_SIZE,
      y: (e.clientY - r.top) / r.height * CANVAS_SIZE
    };
  }

  function bindPaintEvents() {
    let drawing = false;
    let last = null;
    let sprayTimer = null;

    paintCanvas.addEventListener('pointerdown', (e) => {
      if (mode === 'fill') return;
      e.preventDefault();
      paintCanvas.setPointerCapture(e.pointerId);
      drawing = true;
      last = canvasPos(e);

      ctx.globalCompositeOperation = isEraser() ? 'destination-out' : 'source-over';

      if (mode === 'brush') {
        drawSegment(last, last);
      } else {
        splat(last, true);
        sprayTimer = setInterval(() => { if (last) splat(last, false); }, 70);
      }
    });

    paintCanvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const pos = canvasPos(e);
      if (mode === 'brush') {
        drawSegment(last, pos);
      } else {
        splat(pos, false);
      }
      last = pos;
    });

    const stop = () => {
      drawing = false;
      last = null;
      if (sprayTimer) { clearInterval(sprayTimer); sprayTimer = null; }
      ctx.globalCompositeOperation = 'source-over';
    };
    paintCanvas.addEventListener('pointerup', stop);
    paintCanvas.addEventListener('pointercancel', stop);
  }

  function drawSegment(from, to) {
    ctx.strokeStyle = paintStyle();
    ctx.lineWidth = BRUSH_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  // 潑墨：一團大小不一的墨點，first=true 時多加幾滴大的
  function splat(pos, first) {
    ctx.fillStyle = paintStyle();
    const drops = first ? 26 : 14;
    for (let i = 0; i < drops; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.random() * 60;
      const r = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(pos.x + Math.cos(angle) * dist, pos.y + Math.sin(angle) * dist, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (first) {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 25;
        ctx.beginPath();
        ctx.arc(pos.x + Math.cos(angle) * dist, pos.y + Math.sin(angle) * dist, 9 + Math.random() * 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* ===== 上一張 / 下一張 / 重來 ===== */
  document.getElementById('prevBtn').addEventListener('click', () => { Sound.click(); galleryIndex--; showCurrent(); });
  document.getElementById('nextBtn').addEventListener('click', () => { Sound.click(); galleryIndex++; showCurrent(); });
  document.getElementById('resetBtn').addEventListener('click', () => {
    Sound.click();
    artWrap.querySelectorAll('svg.art-base .c').forEach(el => el.setAttribute('fill', '#fff'));
    if (fillCtx) fillCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (ctx) ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  });

  /* ===== 上傳照片：本機處理，不會上傳到任何伺服器 ===== */
  const uploadBtn = document.getElementById('uploadBtn');
  const fileInput = document.getElementById('fileInput');

  uploadBtn.addEventListener('click', () => { Sound.click(); fileInput.click(); });

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // 允許重複選同一張照片
    if (!file) return;

    processingOverlay.hidden = false;
    await new Promise(r => setTimeout(r, 30)); // 先讓「處理中」畫面畫出來，避免整個卡住看起來像當機

    try {
      const img = await loadImageFromFile(file);
      const { stencilCanvas } = PhotoTool.process(img);
      const dataUrl = stencilCanvas.toDataURL('image/png');
      customPics.push({
        type: 'raster',
        id: 'p' + Date.now(),
        name: '我的照片 ' + (customPics.length + 1),
        dataUrl
      });
      saveCustomPics();
      galleryIndex = gallery().length - 1;
      showCurrent();
    } catch (err) {
      console.error('照片處理失敗', err);
    } finally {
      processingOverlay.hidden = true;
    }
  });

  deleteBtn.addEventListener('click', () => {
    const item = gallery()[galleryIndex];
    if (item.type !== 'raster') return;
    Sound.click();
    customPics = customPics.filter(p => p.id !== item.id);
    saveCustomPics();
    showCurrent();
  });

  /* ===== 存成圖片 ===== */
  const saveOverlay = document.getElementById('saveOverlay');
  const saveImg = document.getElementById('saveImg');

  function svgToImage(svgEl) {
    return new Promise((resolve) => {
      const clone = svgEl.cloneNode(true);
      clone.setAttribute('width', CANVAS_SIZE);
      clone.setAttribute('height', CANVAS_SIZE);
      const svgText = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
    });
  }

  async function composeFinalImage(item) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const c = canvas.getContext('2d');
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (item.type === 'vector') {
      const baseSvg = artWrap.querySelector('svg.art-base');
      const outlineSvg = artWrap.querySelector('svg.art-outline');
      // 疊圖順序跟畫面上一致：線稿底色 → 塗鴉畫布 → 外框複本蓋最上面
      const [baseImg, outlineImg] = await Promise.all([svgToImage(baseSvg), svgToImage(outlineSvg)]);
      c.drawImage(baseImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      c.drawImage(paintCanvas, 0, 0);
      c.drawImage(outlineImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      const lineCanvas = artWrap.querySelector('#lineLayer');
      c.drawImage(fillCanvas, 0, 0);
      c.drawImage(paintCanvas, 0, 0);
      c.drawImage(lineCanvas, 0, 0);
    }
    return canvas.toDataURL('image/png');
  }

  document.getElementById('saveBtn').addEventListener('click', async () => {
    Sound.click();
    const item = gallery()[galleryIndex];
    const dataUrl = await composeFinalImage(item);

    // iPad 上優先用系統分享（可以直接儲存到相簿）
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], item.name + '.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      } catch (e) { /* 使用者取消或不支援，改用長按儲存 */ }
    }
    saveImg.src = dataUrl;
    saveOverlay.hidden = false;
  });

  document.getElementById('closeSave').addEventListener('click', () => {
    saveOverlay.hidden = true;
  });

  buildPalette();
  showCurrent();
  requestAnimationFrame(sizeArt); // 版面完成後再校正一次尺寸
})();
