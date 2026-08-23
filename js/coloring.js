/* 著色遊戲：
   選圖畫面（縮圖牆）→ 遊戲畫面（左邊白色畫布 + 右邊木紋直立工具列）。
   工具列上的「工具」「顏色」兩顆大圓鈕會在左側彈出面板；
   另外支援橡皮擦、復原（undo）與上傳自己的照片自動變成線條畫稿。 */
(() => {
  /* ===== 56 色色盤：8 欄 x 7 列，整體照彩虹順序排 ===== */
  const COLORS = [
    // 第 1 列：純色
    '#FF0000', '#FFA500', '#FFFF00', '#228B22', '#00BFFF', '#0000FF', '#7B2FBE', '#555555',
    // 第 2 列：深色版
    '#B71C1C', '#C25E00', '#C9A227', '#145A14', '#0077A8', '#00008B', '#4B1D75', '#2B2B2B',
    // 第 3 列：淺色版
    '#FF6B6B', '#FFC04D', '#FFF176', '#66BB6A', '#7FDFFF', '#6C7BFF', '#A96FD8', '#8A8A8A',
    // 第 4 列：粉彩版
    '#FFC9C9', '#FFE0B2', '#FFF9C4', '#C8E6C9', '#C4EFFF', '#C5CAE9', '#E1BEE7', '#D6D6D6',
    // 第 5 列：粉紅 / 棕 / 黃綠 延伸
    '#FF69B4', '#FF1493', '#C71585', '#8B4513', '#A0522D', '#D2A679', '#9ACD32', '#6B8E23',
    // 第 6 列：青 / 藍綠 / 靛 / 紫羅蘭 延伸
    '#00CED1', '#20B2AA', '#008080', '#4682B4', '#4169E1', '#6A5ACD', '#8A2BE2', '#DA70D6',
    // 第 7 列：淺色雜項 + 灰階 + 深棕
    '#FFFFFF', '#F0E68C', '#FFDAB9', '#E0C097', '#A9A9A9', '#777777', '#5C2E0E', '#333333'
  ];

  /* ===== 畫圖工具 ===== */
  const TOOLS = [
    { id: 'fill',    emoji: '🪣',  name: '填滿' },
    { id: 'marker',  emoji: '🖍️', name: '粗筆',   width: 34 },
    { id: 'pencil',  emoji: '✏️', name: '細筆',   width: 12 },
    { id: 'water',   emoji: '🖌️', name: '水彩',   width: 40, alpha: 0.35 },
    { id: 'spray',   emoji: '💦', name: '潑墨' },
    { id: 'glitter', emoji: '✨', name: '亮粉筆', width: 26 }
  ];

  const CANVAS_SIZE = 800;   // 畫布內部解析度，跟 photo-tool.js 的 SIZE 一致
  const CUSTOM_KEY = 'kidsCustomPics';
  const MAX_CUSTOM = 12;     // 本機最多保留幾張自己上傳的照片
  const HISTORY_MAX = 25;    // 復原步數上限

  const selectScreen = document.getElementById('selectScreen');
  const gameScreen = document.getElementById('gameScreen');
  const picGrid = document.getElementById('picGrid');
  const holder = document.getElementById('svgHolder');
  const artWrap = document.getElementById('artWrap');
  const toolbar = document.getElementById('toolbar');
  const toolBtn = document.getElementById('toolBtn');
  const toolBtnIcon = document.getElementById('toolBtnIcon');
  const colorBtn = document.getElementById('colorBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const doneBtn = document.getElementById('doneBtn');
  const toolPanel = document.getElementById('toolPanel');
  const colorPanel = document.getElementById('colorPanel');
  const toolList = document.getElementById('toolList');
  const colorGrid = document.getElementById('colorGrid');
  const patternRow = document.getElementById('patternRow');
  const processingOverlay = document.getElementById('processingOverlay');

  let galleryIndex = 0;
  let customPics = loadCustomPics();  // [{type:'raster', id, name, dataUrl}]
  let mode = 'fill';                                // TOOLS 裡的 id
  let eraser = false;                               // 橡皮擦開關（獨立於顏色）
  let paint = { type: 'color', value: COLORS[0] };  // 或 { type:'pattern', id }
  let paintCanvas = null;
  let ctx = null;
  let fillCanvas = null, fillCtx = null;   // 只有上傳照片模式會用到
  let rasterEdgeMask = null;               // 目前這張照片的線條遮罩（填色用）
  let history = [];                        // 復原用的快照堆疊
  let openedPanel = null;                  // null | 'tool' | 'color'
  let swallowStroke = false;               // 這一下點擊只用來關面板，不作畫

  function gallery() {
    return [
      ...[...LINEART, ...(window.LINEART_ANIMALS || [])]
        .map(x => ({ type: 'vector', name: x.name, svg: x.svg })),
      ...customPics
    ];
  }

  function currentTool() {
    return TOOLS.find(t => t.id === mode) || TOOLS[0];
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
    return eraser;
  }

  /* ===== 復原（undo）：每次動作「開始前」先推一筆快照 ===== */
  function pushHistory(entry) {
    history.push(entry);
    if (history.length > HISTORY_MAX) history.shift();
    updateButtons();
  }

  // canvas 快照：整張 ImageData，還原時直接 putImageData 蓋回去
  function snapshotCanvas(targetCtx) {
    if (!targetCtx) return null;
    return { kind: 'canvas', ctx: targetCtx, data: targetCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE) };
  }

  function undo() {
    const entry = history.pop();
    if (!entry) return;
    if (entry.kind === 'fill') {
      if (entry.prev === null) entry.el.removeAttribute('fill');
      else entry.el.setAttribute('fill', entry.prev);
    } else if (entry.kind === 'canvas') {
      entry.ctx.putImageData(entry.data, 0, 0);
    }
    updateButtons();
  }

  function clearHistory() {
    history = [];
    updateButtons();
  }

  // history 空 = 沒東西可以復原，也代表這張還沒被畫過
  function updateButtons() {
    const empty = history.length === 0;
    undoBtn.disabled = empty;
    clearBtn.disabled = empty;
  }

  /* ===== 彈出面板 ===== */
  function buildToolPanel() {
    toolList.innerHTML = '';
    TOOLS.forEach(t => {
      const b = document.createElement('button');
      b.className = 'tool-item' + (t.id === mode ? ' selected' : '');
      b.dataset.tool = t.id;
      b.innerHTML = `<span class="tool-emoji">${t.emoji}</span><span>${t.name}</span>`;
      b.addEventListener('click', () => selectTool(t.id));
      toolList.appendChild(b);
    });
  }

  function buildColorPanel() {
    colorGrid.innerHTML = '';
    COLORS.forEach(color => {
      const b = document.createElement('button');
      b.className = 'color-cell';
      b.dataset.color = color;
      b.style.background = color;
      b.addEventListener('click', () => selectPaint({ type: 'color', value: color }));
      colorGrid.appendChild(b);
    });

    patternRow.innerHTML = '';
    PATTERNS.forEach(p => {
      const b = document.createElement('button');
      b.className = 'pattern-cell';
      b.dataset.pattern = p.id;
      b.title = p.name;
      b.innerHTML = `<svg viewBox="0 0 40 40">${p.tile}</svg>`;
      b.addEventListener('click', () => selectPaint({ type: 'pattern', id: p.id }));
      patternRow.appendChild(b);
    });
  }

  function markPaintSelection() {
    colorGrid.querySelectorAll('.color-cell').forEach(c =>
      c.classList.toggle('selected', paint.type === 'color' && c.dataset.color === paint.value));
    patternRow.querySelectorAll('.pattern-cell').forEach(c =>
      c.classList.toggle('selected', paint.type === 'pattern' && c.dataset.pattern === paint.id));
  }

  // 顏色鈕外觀跟目前顏料同步
  function syncColorBtn() {
    if (paint.type === 'color') {
      colorBtn.innerHTML = '';
      colorBtn.style.background = paint.value;
    } else {
      const p = PATTERNS.find(x => x.id === paint.id);
      colorBtn.style.background = '#fff';
      colorBtn.innerHTML = p
        ? `<svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice">${p.tile}</svg>`
        : '';
    }
  }

  function syncEraserBtn() {
    eraserBtn.classList.toggle('eraser-on', eraser);
  }

  function positionPanel(panel, trigger) {
    // 先歸零，量到的尺寸才不會被上一次的位置影響
    panel.style.left = '0px';
    panel.style.top = '0px';
    const tRect = trigger.getBoundingClientRect();
    const bRect = toolbar.getBoundingClientRect();
    const pRect = panel.getBoundingClientRect();

    // 貼在工具列左邊
    let left = bRect.left - pRect.width - 16;
    if (left < 8) left = 8;

    // 垂直對齊觸發鈕中心，超出視窗就貼邊
    let top = tRect.top + tRect.height / 2 - pRect.height / 2;
    const maxTop = window.innerHeight - pRect.height - 8;
    if (top > maxTop) top = maxTop;
    if (top < 8) top = 8;

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';

    // 箭頭跟著觸發鈕中心走
    const arrow = panel.querySelector('.panel-arrow');
    if (arrow) {
      let ay = tRect.top + tRect.height / 2 - top - 12;
      ay = Math.max(14, Math.min(pRect.height - 38, ay));
      arrow.style.top = ay + 'px';
    }
  }

  function openPanel(which) {
    closePanels();
    const panel = which === 'tool' ? toolPanel : colorPanel;
    const trigger = which === 'tool' ? toolBtn : colorBtn;
    panel.hidden = false;
    positionPanel(panel, trigger);   // 要先顯示才量得到尺寸
    openedPanel = which;
  }

  function closePanels() {
    toolPanel.hidden = true;
    colorPanel.hidden = true;
    openedPanel = null;
  }

  /* 面板開著時，點面板與觸發鈕以外的地方就關掉。
     用 capture 階段先攔到，但不做 stopPropagation（會連帶擋掉 music.js 掛在
     document 上的「第一次觸控自動播放」），改用 swallowStroke 旗標讓畫布這一下不作畫。 */
  document.addEventListener('pointerdown', (e) => {
    if (!openedPanel) return;
    if (e.target.closest && e.target.closest('#toolPanel, #colorPanel, #toolBtn, #colorBtn')) return;
    closePanels();
    swallowStroke = true;
  }, true);

  const releaseSwallow = () => { swallowStroke = false; };
  document.addEventListener('pointerup', releaseSwallow, true);
  document.addEventListener('pointercancel', releaseSwallow, true);

  /* ===== 選工具 / 選顏色 / 橡皮擦 ===== */
  function selectTool(id) {
    mode = id;
    const t = currentTool();
    toolBtnIcon.textContent = t.emoji;
    toolList.querySelectorAll('.tool-item').forEach(b =>
      b.classList.toggle('selected', b.dataset.tool === id));
    if (paintCanvas) paintCanvas.style.pointerEvents = (mode === 'fill') ? 'none' : 'auto';
    Sound.click();
    closePanels();
  }

  function selectPaint(newPaint) {
    paint = newPaint;
    eraser = false;            // 選了任何顏色／花紋就自動關掉橡皮擦
    syncEraserBtn();
    markPaintSelection();
    syncColorBtn();
    Sound.click();
    closePanels();
  }

  toolBtn.addEventListener('click', () => {
    Sound.click();
    if (openedPanel === 'tool') closePanels(); else openPanel('tool');
  });

  colorBtn.addEventListener('click', () => {
    Sound.click();
    if (openedPanel === 'color') closePanels(); else openPanel('color');
  });

  eraserBtn.addEventListener('click', () => {
    eraser = !eraser;
    syncEraserBtn();
    Sound.click();
  });

  undoBtn.addEventListener('click', () => {
    if (undoBtn.disabled) return;
    Sound.click();
    undo();
  });

  clearBtn.addEventListener('click', () => {
    if (clearBtn.disabled) return;
    Sound.click();
    artWrap.querySelectorAll('svg.art-base .c').forEach(el => el.setAttribute('fill', '#fff'));
    if (fillCtx) fillCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (ctx) ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    clearHistory();
  });

  /* ===== 選圖畫面 ===== */
  function buildPicGrid() {
    picGrid.innerHTML = '';
    gallery().forEach((item, idx) => {
      const cell = document.createElement('div');
      cell.className = 'pic-cell';

      const b = document.createElement('button');
      b.className = 'pic-thumb';
      b.title = item.name;
      if (item.type === 'vector') {
        b.innerHTML = `<div class="thumb-svg">${item.svg}</div>`;
      } else {
        const im = document.createElement('img');
        im.src = item.dataUrl;
        im.alt = item.name;
        b.appendChild(im);
      }
      b.addEventListener('click', () => { Sound.click(); openPic(idx); });
      cell.appendChild(b);

      // 自訂照片：右上角一顆刪除鈕
      if (item.type === 'raster') {
        const del = document.createElement('button');
        del.className = 'pic-del';
        del.title = '刪除這張照片';
        del.textContent = '🗑️';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          Sound.click();
          customPics = customPics.filter(p => p.id !== item.id);
          saveCustomPics();
          buildPicGrid();
        });
        cell.appendChild(del);
      }

      picGrid.appendChild(cell);
    });

    // 最後一格：上傳照片
    const up = document.createElement('button');
    up.className = 'pic-thumb pic-upload';
    up.innerHTML = '<span>🖼️</span><span class="pic-upload-txt">上傳照片</span>';
    up.addEventListener('click', () => { Sound.click(); fileInput.click(); });
    picGrid.appendChild(up);
  }

  function openPic(idx) {
    galleryIndex = idx;
    closePanels();
    showCurrent();
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    requestAnimationFrame(sizeArt);
  }

  function backToSelect() {
    closePanels();
    gameScreen.hidden = true;
    selectScreen.hidden = false;
    buildPicGrid();   // 自訂照片可能增減，回來時重建
  }

  doneBtn.addEventListener('click', () => { Sound.click(); backToSelect(); });

  /* ===== 顯示目前這張（依類型分流） ===== */
  function showCurrent() {
    const list = gallery();
    if (!list.length) return;
    galleryIndex = (galleryIndex + list.length) % list.length;
    const item = list[galleryIndex];
    artWrap.innerHTML = '';
    fillCanvas = fillCtx = rasterEdgeMask = null;
    clearHistory();   // 換圖就不能再復原上一張的筆畫

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
    // clientWidth/Height 含 padding，要扣掉才是真正能放畫布的空間（直式時左右 padding 會壓到寬度）
    const cs = getComputedStyle(holder);
    const w = holder.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = holder.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const side = Math.floor(Math.min(w, h));
    if (side < 50) return;   // 遊戲畫面還沒顯示時量到 0，先跳過
    artWrap.style.width = side + 'px';
    artWrap.style.height = side + 'px';
  }
  window.addEventListener('resize', () => {
    sizeArt();
    closePanels();
    setTimeout(sizeArt, 120); // iPad 轉向時 resize 有時早於版面更新，晚一點再校正一次
  });

  /* ===== 填滿工具（點一下整區上色） ===== */
  artWrap.addEventListener('pointerdown', (e) => {
    if (mode !== 'fill') return;
    if (swallowStroke) return;   // 這一下是用來關面板的
    const item = gallery()[galleryIndex];

    if (item.type === 'vector') {
      const region = e.target.closest('.c');
      if (!region) return;
      pushHistory({ kind: 'fill', el: region, prev: region.getAttribute('fill') });
      // 橡皮擦：把這一區填回白色
      region.setAttribute('fill',
        eraser ? '#fff'
        : (paint.type === 'color' ? paint.value : `url(#${paint.id})`));
      Sound.pop();
      return;
    }

    if (item.type === 'raster' && fillCanvas && rasterEdgeMask) {
      const rect = fillCanvas.getBoundingClientRect();
      const px = Math.floor((e.clientX - rect.left) / rect.width * CANVAS_SIZE);
      const py = Math.floor((e.clientY - rect.top) / rect.height * CANVAS_SIZE);
      const filled = PhotoTool.floodFillMask(rasterEdgeMask, CANVAS_SIZE, CANVAS_SIZE, px, py);
      if (!filled) return; // 點到線條上，不處理
      pushHistory(snapshotCanvas(fillCtx));
      applyFloodFill(filled);
      Sound.pop();
    }
  });

  // 把目前選的顏色/花紋蓋到這次疊桶填色算出來的範圍裡（橡皮擦時改成挖掉）
  function applyFloodFill(filledMask) {
    const tmp = document.createElement('canvas');
    tmp.width = CANVAS_SIZE;
    tmp.height = CANVAS_SIZE;
    const tctx = tmp.getContext('2d');
    tctx.fillStyle = eraser ? '#000' : paintStyle();
    tctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const imgData = tctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let i = 0; i < filledMask.length; i++) {
      if (!filledMask[i]) imgData.data[i * 4 + 3] = 0; // 範圍外設成透明
    }
    tctx.putImageData(imgData, 0, 0);

    if (eraser) {
      fillCtx.globalCompositeOperation = 'destination-out';
      fillCtx.drawImage(tmp, 0, 0);
      fillCtx.globalCompositeOperation = 'source-over';
    } else {
      fillCtx.drawImage(tmp, 0, 0);
    }
  }

  /* ===== 畫筆 / 潑墨 / 水彩 / 亮粉筆 ===== */
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
      if (swallowStroke) return;   // 這一下是用來關面板的
      e.preventDefault();
      paintCanvas.setPointerCapture(e.pointerId);
      drawing = true;
      last = canvasPos(e);

      // 一筆＝一次復原：下筆前先把整張畫布存起來
      pushHistory(snapshotCanvas(ctx));

      const tool = currentTool();
      ctx.globalCompositeOperation = isEraser() ? 'destination-out' : 'source-over';
      // 水彩用半透明疊出來（橡皮擦時強制不透明，才擦得乾淨）
      ctx.globalAlpha = (!isEraser() && tool.alpha) ? tool.alpha : 1;

      if (mode === 'spray') {
        splat(last, true);
        sprayTimer = setInterval(() => { if (last) splat(last, false); }, 70);
      } else {
        drawSegment(last, last);
        if (mode === 'glitter' && !isEraser()) sprinkleGlitter(last, last);
      }
    });

    paintCanvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const pos = canvasPos(e);
      if (mode === 'spray') {
        splat(pos, false);
      } else {
        drawSegment(last, pos);
        if (mode === 'glitter' && !isEraser()) sprinkleGlitter(last, pos);
      }
      last = pos;
    });

    const stop = () => {
      drawing = false;
      last = null;
      if (sprayTimer) { clearInterval(sprayTimer); sprayTimer = null; }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };
    paintCanvas.addEventListener('pointerup', stop);
    paintCanvas.addEventListener('pointercancel', stop);
  }

  function drawSegment(from, to) {
    ctx.strokeStyle = paintStyle();
    ctx.lineWidth = currentTool().width || 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  // 亮粉筆：在這一段線上灑 3~5 顆白色／淡黃小點
  function sprinkleGlitter(from, to) {
    const saveAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 1;
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * 24;
      const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * 24;
      ctx.fillStyle = Math.random() < 0.5 ? '#fff' : '#fff9c4';
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = saveAlpha;
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

  /* ===== 上傳照片：本機處理，不會上傳到任何伺服器 ===== */
  const fileInput = document.getElementById('fileInput');

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
      buildPicGrid();
      openPic(gallery().length - 1);   // 傳完直接進遊戲畫面畫新圖
    } catch (err) {
      console.error('照片處理失敗', err);
    } finally {
      processingOverlay.hidden = true;
    }
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
    closePanels();
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

  /* ===== 起始 ===== */
  buildToolPanel();
  buildColorPanel();
  markPaintSelection();
  syncColorBtn();
  syncEraserBtn();
  toolBtnIcon.textContent = currentTool().emoji;
  buildPicGrid();
  updateButtons();
})();
