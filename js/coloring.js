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

  // 正方線稿／照片的座標系邊長，跟 photo-tool.js 的 SIZE 一致（不可改）
  const CANVAS_SIZE = 800;
  // paintLayer 是非正方的「整張紙」：短邊固定 800，長邊按紙張長寬比等比放大，上限 1600。
  // 刻意不乘 devicePixelRatio——iPad 上 800x1600 已經夠細，乘上去會拖慢潑墨工具。
  const PAINT_SHORT = 800;
  const PAINT_LONG_MAX = 1600;
  const CUSTOM_KEY = 'kidsCustomPics';
  const MAX_CUSTOM = 12;     // 本機最多保留幾張自己上傳的照片
  const HISTORY_MAX = 25;    // 復原步數上限
  const PROGRESS_MAX = 40;   // 最多保留幾張「畫到一半」的進度
  const ARTWORK_MAX = 24;    // 「我的作品」最多保留幾張
  const SAVE_DELAY = 800;    // 停手多久之後才寫進度（toDataURL 不便宜，不能每筆都存）

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
  const artworkSection = document.getElementById('artworkSection');
  const artworkRow = document.getElementById('artworkRow');

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
  let paperW = 0, paperH = 0;              // 上一次量到的紙張尺寸（CSS px），用來短路重複的 resize
  let hasContent = false;                  // 這張畫過東西，或剛從進度還原回來（跟 history 無關）
  let wipKeys = new Set();                 // 有存進度的圖，選圖畫面用來加「畫到一半」角標
  let saveTimer = null;                    // 進度存檔的 debounce timer
  let artworks = [];                       // 「我的作品」，由新到舊

  /* 選圖畫面的順序：內建手繪 → 城堡公主 → 動物 → 水果甜點 → 自己上傳的照片。
     各系列的 js 檔都是 classic script，用 window.XXX 取值，缺檔時安全跳過。 */
  function gallery() {
    return [
      ...[
        ...LINEART,
        ...(window.LINEART_FANTASY || []),
        ...(window.LINEART_ANIMALS || []),
        ...(window.LINEART_FOOD || [])
      ].map(x => ({ type: 'vector', name: x.name, svg: x.svg })),
      ...customPics
    ];
  }

  function currentTool() {
    return TOOLS.find(t => t.id === mode) || TOOLS[0];
  }

  /* 一張圖的識別碼（存進度用）。內建線稿的 name 全部唯一，可以安全當 key；
     自己上傳的照片用它在 localStorage 裡的 id。 */
  function picKey(item) {
    return item.type === 'vector' ? 'v:' + item.name : 'r:' + item.id;
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

  // canvas 快照：整張 ImageData，還原時直接 putImageData 蓋回去。
  // paintLayer 是動態尺寸，一律讀 canvas 實際解析度，不能寫死 CANVAS_SIZE
  function snapshotCanvas(targetCtx) {
    if (!targetCtx) return null;
    const cv = targetCtx.canvas;
    return { kind: 'canvas', ctx: targetCtx, data: targetCtx.getImageData(0, 0, cv.width, cv.height) };
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

  /* history 空 = 沒東西可以復原。
     但「全部清除」不能只看 history：從進度還原回來、或轉向後 sizeArt() 清掉快照時，
     history 是空的，畫面上卻有東西——只看 history 會讓小孩清不掉自己畫的圖。
     所以另外用 hasContent 記「這張有沒有內容」。 */
  function updateButtons() {
    const empty = history.length === 0;
    undoBtn.disabled = empty;
    clearBtn.disabled = empty && !hasContent;
  }

  // 畫了東西（或還原回內容）就標記起來，讓「全部清除」可以按
  function markContent() {
    hasContent = true;
    updateButtons();
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
    // 兩層都用各自的實際解析度清（paintLayer 是非正方的整張紙）
    if (fillCtx) fillCtx.clearRect(0, 0, fillCtx.canvas.width, fillCtx.canvas.height);
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    clearHistory();
    hasContent = false;
    updateButtons();
    scheduleSave();   // 清空也是一種狀態，下次打開要是清空的
  });

  /* ===== 選圖畫面 ===== */
  function buildPicGrid() {
    picGrid.innerHTML = '';
    gallery().forEach((item, idx) => {
      const cell = document.createElement('div');
      cell.className = 'pic-cell';
      cell.dataset.key = picKey(item);   // 補「畫到一半」角標時用來對號入座

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

    refreshWipBadges();
  }

  /* 「畫到一半」角標。buildPicGrid() 是同步的，開頁時 wipKeys 還是空的，
     等 IndexedDB 回來再呼叫一次補上角標——不為了角標把整個 buildPicGrid() 改成非同步。
     用 dataset 逐格比對而不是 querySelector：線稿名稱是中文，塞進屬性選擇器要跳脫。 */
  function refreshWipBadges() {
    picGrid.querySelectorAll('.pic-cell').forEach(cell => {
      const want = wipKeys.has(cell.dataset.key);
      const badge = cell.querySelector('.pic-wip');
      if (want && !badge) {
        const b = document.createElement('span');
        b.className = 'pic-wip';
        b.textContent = '🖍️';
        cell.appendChild(b);
      } else if (!want && badge) {
        badge.remove();
      }
    });
  }

  function openPic(idx) {
    galleryIndex = idx;
    closePanels();
    // 先切畫面再建圖層：這樣 loadVector/loadRaster 裡的 sizeArt() 就量得到紙張尺寸。
    // （舊寫法用 requestAnimationFrame，分頁不可見時不會觸發，#artWrap 會卡在 0x0）
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    showCurrent();
    sizeArt();
  }

  function backToSelect() {
    closePanels();
    gameScreen.hidden = true;
    selectScreen.hidden = false;
    buildPicGrid();   // 自訂照片可能增減，回來時重建
  }

  // 回選圖前立刻存一次（不等 debounce）：小孩常常按完就直接把 App 關掉
  doneBtn.addEventListener('click', () => { Sound.click(); saveProgressNow(); backToSelect(); });

  /* ===== 顯示目前這張（依類型分流） ===== */
  function showCurrent() {
    const list = gallery();
    if (!list.length) return;
    galleryIndex = (galleryIndex + list.length) % list.length;
    const item = list[galleryIndex];
    artWrap.innerHTML = '';
    fillCanvas = fillCtx = rasterEdgeMask = null;
    paintCanvas = ctx = null;   // 舊的 canvas 已經跟著 innerHTML 一起丟掉了
    hasContent = false;   // 新的一張，等進度還原回來再說（要先歸零，clearHistory 才算得對）
    clearHistory();       // 換圖就不能再復原上一張的筆畫

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

    paintCanvas = makePaintLayer();
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
    restoreProgress(item);   // 非同步，會比畫面晚一兩幀
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

      paintCanvas = makePaintLayer();
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
      restoreProgress(item);   // 圖層是在 onload 裡才建好的，還原要接在這裡
    };
    img.src = item.dataUrl;
  }

  /* ===== 紙張尺寸：整張 #svgHolder 都是紙，線稿是紙中央的正方子區域 ===== */

  // 量紙張可用區（clientWidth/Height 含 padding，扣掉才是真正能放畫布的空間）
  function measurePaper() {
    const cs = getComputedStyle(holder);
    const w = Math.floor(holder.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    const h = Math.floor(holder.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom));
    return { w, h, side: Math.min(w, h) };
  }

  // 依紙張長寬比算 paintLayer 的內部解析度：短邊 PAINT_SHORT，長邊等比但不超過 PAINT_LONG_MAX
  function paintResolution(w, h) {
    const short = Math.min(w, h), long = Math.max(w, h);
    if (short <= 0) return { w: PAINT_SHORT, h: PAINT_SHORT };
    const longPx = Math.min(PAINT_LONG_MAX, Math.round(PAINT_SHORT * long / short));
    return (w >= h) ? { w: longPx, h: PAINT_SHORT } : { w: PAINT_SHORT, h: longPx };
  }

  function makePaintLayer() {
    const p = measurePaper();
    const res = paintResolution(p.w, p.h);
    const cv = document.createElement('canvas');
    cv.id = 'paintLayer';
    cv.width = res.w;
    cv.height = res.h;
    cv.style.pointerEvents = (mode === 'fill') ? 'none' : 'auto';
    return cv;
  }

  /* 改 canvas 的 width/height 會清空內容，所以先畫進暫存 canvas，設完新尺寸再畫回去。
     搬移方式＝「置中對齊、不縮放」，不是整幅拉伸——因為 paintResolution() 讓短邊恆為
     PAINT_SHORT，所以中央那塊正方子區域（線稿所在）在新舊畫布裡邊長一樣。
     置中搬移能讓畫在角色身上的筆畫轉向後還黏在角色上；整幅拉伸會把它扯歪。
     代價是長邊縮短時，紙面兩端的背景筆畫會被裁掉，這是可接受的。 */
  function resizeCanvasKeepContent(canvas, w, h) {
    if (canvas.width === w && canvas.height === h) return;
    let tmp = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tmp = document.createElement('canvas');
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      tmp.getContext('2d').drawImage(canvas, 0, 0);
    }
    canvas.width = w;
    canvas.height = h;
    if (tmp) {
      canvas.getContext('2d').drawImage(tmp,
        Math.round((w - tmp.width) / 2), Math.round((h - tmp.height) / 2));
    }
  }

  function sizeArt() {
    const p = measurePaper();
    if (p.side < 50) return;   // 遊戲畫面還沒顯示時量到 0，先跳過

    const res = paintResolution(p.w, p.h);
    const sizeChanged = (p.w !== paperW || p.h !== paperH);
    // 換圖時 paintLayer 是新建的，紙張尺寸可能沒變但畫布解析度要對齊
    const canvasStale = !!paintCanvas && (paintCanvas.width !== res.w || paintCanvas.height !== res.h);
    if (!sizeChanged && !canvasStale) return;   // ResizeObserver 會高頻觸發，沒變就不重建

    paperW = p.w;
    paperH = p.h;

    artWrap.style.width = p.w + 'px';
    artWrap.style.height = p.h + 'px';
    // 正方四層（art-base / art-outline / fillLayer / lineLayer）靠這個 CSS 變數置中縮放
    artWrap.style.setProperty('--sq', p.side + 'px');

    if (paintCanvas) {
      resizeCanvasKeepContent(paintCanvas, res.w, res.h);
      ctx = paintCanvas.getContext('2d');   // 改過 width/height 之後繪圖狀態會被重設
    }
    // fillLayer 永遠是 CANVAS_SIZE 正方（照片座標系），只有 CSS 尺寸跟著 --sq 變，
    // 點陣內容不受影響，所以不需要搬移。

    // 尺寸真的變了就清掉復原堆疊：舊快照的 ImageData 尺寸已經對不上了。
    // 畫的東西留著（上面剛等比重畫回去），只是不能再往回復原。
    if (sizeChanged) clearHistory();
  }

  // 用 ResizeObserver 盯著紙張本身，比 rAF / resize 事件可靠（分頁不可見時 rAF 不會觸發）
  if (window.ResizeObserver) {
    new ResizeObserver(() => sizeArt()).observe(holder);
  }
  window.addEventListener('resize', () => {
    closePanels();
    sizeArt();
  });
  // iPad 轉向時版面更新有時晚於事件，再校正一次
  window.addEventListener('orientationchange', () => {
    closePanels();
    sizeArt();
    setTimeout(sizeArt, 200);
  });

  /* ===== 畫到一半的進度：存進 IndexedDB，下次打開接著畫 =====
     一筆進度 = { key, type, fills, paintPng, fillPng, paintW, paintH, updatedAt }
       fills    只有內建線稿用：照 DOM 順序記下每個 .c 的 fill 屬性（沒有屬性記 null）。
                線稿是寫死的字串常數，順序穩定，所以索引可以當識別。
       fillPng  只有上傳照片用：疊桶填色圖層（800x800）。
       paintPng 筆畫圖層。一定要 PNG，有透明度不能用 JPEG。
       paintW/H 存檔當下的 paintLayer 解析度，還原時要拿來算置中偏移。 */

  // 讀 dataURL 成 Image（載不起來回 null）。先載完再貼，中間可以再檢查一次有沒有換圖
  function loadDataUrl(dataUrl) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = dataUrl;
    });
  }

  // 把目前這張的狀態打包成一筆進度。圖層還沒建好（換圖換到一半）就回 null
  function collectProgress(item) {
    if (!paintCanvas) return null;
    const rec = {
      key: picKey(item),
      type: item.type,
      fills: null,
      fillPng: null,
      paintPng: paintCanvas.toDataURL('image/png'),
      paintW: paintCanvas.width,
      paintH: paintCanvas.height,
      updatedAt: Date.now()
    };
    if (item.type === 'vector') {
      const base = artWrap.querySelector('svg.art-base');
      if (!base) return null;
      rec.fills = Array.from(base.querySelectorAll('.c')).map(el => el.getAttribute('fill'));
    } else {
      if (!fillCanvas) return null;
      rec.fillPng = fillCanvas.toDataURL('image/png');
    }
    return rec;
  }

  /* 立刻存一次（不等 debounce）。toDataURL 是同步的，800x1032 PNG 大約 5~20ms，
     所以只在「停手」「按完成」「切走分頁」這幾個時機呼叫，絕不放進 pointermove。 */
  function saveProgressNow() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    if (gameScreen.hidden) return;   // 不在遊戲畫面就沒東西要存
    const item = gallery()[galleryIndex];
    if (!item) return;
    const rec = collectProgress(item);
    if (!rec) return;
    wipKeys.add(rec.key);   // 先更新角標用的集合，回選圖畫面才來得及畫出來
    KidsStore.put('progress', rec).then(trimProgress);
  }

  // 畫畫過程中頻繁觸發，等停手 SAVE_DELAY 再寫
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = null; saveProgressNow(); }, SAVE_DELAY);
  }

  // 進度筆數上限：超過就丟掉最久沒動的那幾筆
  function trimProgress() {
    return KidsStore.count('progress').then(n => {
      if (n <= PROGRESS_MAX) return null;
      return KidsStore.all('progress').then(list => {
        list.sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
        list.slice(0, list.length - PROGRESS_MAX).forEach(r => {
          wipKeys.delete(r.key);
          KidsStore.del('progress', r.key);
        });
      });
    });
  }

  /* 還原進度。IndexedDB 與圖片解碼都是非同步的，每個 await 之後都可能已經不是同一張了：
     - 使用者按完成又選了別張 → galleryIndex 變了
     - showCurrent() 把 paintCanvas 換成新的（就算又選回同一張也是新的 canvas）
     - loadRaster() 的 img.onload 可能晚到，這時 galleryIndex 早就指向別張了
     所以進來時先記住這幾個值，stale() 一成立就整筆丟棄，絕不把 A 的進度套到 B 身上。 */
  async function restoreProgress(item) {
    const myIndex = galleryIndex;
    const myPaint = paintCanvas;
    const myKey = picKey(item);
    const stale = () => {
      if (galleryIndex !== myIndex || !paintCanvas || paintCanvas !== myPaint) return true;
      const now = gallery()[galleryIndex];   // 索引沒變也可能已經不是同一張（清單有增減）
      return !now || picKey(now) !== myKey;
    };
    if (stale()) return;

    const rec = await KidsStore.get('progress', myKey);
    if (!rec || stale()) return;

    let restored = false;

    if (item.type === 'vector' && rec.type === 'vector') {
      const base = artWrap.querySelector('svg.art-base');
      const cells = base ? Array.from(base.querySelectorAll('.c')) : [];
      const fills = Array.isArray(rec.fills) ? rec.fills : [];
      // 長度對不上代表線稿改過了（日後改線稿），整筆丟棄不硬套
      if (cells.length && cells.length === fills.length) {
        cells.forEach((el, i) => {
          const f = fills[i];
          if (f === null || f === undefined) el.removeAttribute('fill');
          else el.setAttribute('fill', f);
        });
        restored = true;
      }
    } else if (item.type === 'raster' && rec.type === 'raster' && rec.fillPng) {
      const im = await loadDataUrl(rec.fillPng);
      if (stale() || !fillCtx) return;
      // fillLayer 恆為 CANVAS_SIZE 正方（照片座標系），尺寸不會變，原點貼上就好
      if (im) { fillCtx.drawImage(im, 0, 0); restored = true; }
    }

    if (rec.paintPng) {
      const im = await loadDataUrl(rec.paintPng);
      if (stale() || !ctx) return;
      if (im) {
        /* 「置中對齊、不縮放」，跟 resizeCanvasKeepContent() 同一套規則：
           paintResolution() 讓短邊恆為 PAINT_SHORT，所以中央那塊正方子區域（線稿所在）
           在舊畫布與新畫布裡邊長一樣，置中貼回去筆畫就還黏在角色上；
           整幅拉伸會把它扯歪。代價是長邊縮短時紙面兩端的背景筆畫被裁掉，可接受。 */
        const w = rec.paintW || im.width;
        const h = rec.paintH || im.height;
        ctx.drawImage(im,
          Math.round((paintCanvas.width - w) / 2),
          Math.round((paintCanvas.height - h) / 2));
        restored = true;
      }
    }

    if (!restored) return;
    clearHistory();     // 不能復原到「上一輩子」的狀態
    markContent();      // 還原回來的內容要能被「全部清除」清掉
  }

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
      markContent();
      scheduleSave();
      return;
    }

    if (item.type === 'raster' && fillCanvas && rasterEdgeMask) {
      // fillCanvas 就是那個置中的正方子區域，但紙比它大，點到正方以外要直接忽略，
      // 否則 px/py 會算出負數或超過 CANVAS_SIZE，floodFillMask 行為未定義
      const rect = fillCanvas.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX >= rect.right ||
          e.clientY < rect.top || e.clientY >= rect.bottom) return;
      const px = Math.floor((e.clientX - rect.left) / rect.width * CANVAS_SIZE);
      const py = Math.floor((e.clientY - rect.top) / rect.height * CANVAS_SIZE);
      if (px < 0 || px >= CANVAS_SIZE || py < 0 || py >= CANVAS_SIZE) return;
      const filled = PhotoTool.floodFillMask(rasterEdgeMask, CANVAS_SIZE, CANVAS_SIZE, px, py);
      if (!filled) return; // 點到線條上，不處理
      pushHistory(snapshotCanvas(fillCtx));
      applyFloodFill(filled);
      Sound.pop();
      markContent();
      scheduleSave();
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
  // paintCanvas 是非正方的整張紙，除數要用它自己的解析度
  function canvasPos(e) {
    const r = paintCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * paintCanvas.width,
      y: (e.clientY - r.top) / r.height * paintCanvas.height
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
      const wasDrawing = drawing;   // pointerup 沒在畫時也會進來，別白存一次
      drawing = false;
      last = null;
      if (sprayTimer) { clearInterval(sprayTimer); sprayTimer = null; }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      if (wasDrawing) { markContent(); scheduleSave(); }
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

  // side = 要輸出的正方邊長（線稿是紙中央的正方子區域，不再等於整張輸出畫布）
  function svgToImage(svgEl, side) {
    return new Promise((resolve) => {
      const clone = svgEl.cloneNode(true);
      clone.setAttribute('width', side);
      clone.setAttribute('height', side);
      const svgText = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
    });
  }

  // 輸出跟畫面一樣是「整張紙」的長寬比：白底 → 置中正方底層 → 全幅塗鴉 → 置中正方頂層
  async function composeFinalImage(item) {
    const outW = paintCanvas.width;
    const outH = paintCanvas.height;
    const sq = Math.min(outW, outH);              // 正方子區域邊長
    const ox = Math.round((outW - sq) / 2);       // 置中偏移
    const oy = Math.round((outH - sq) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const c = canvas.getContext('2d');
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, outW, outH);

    if (item.type === 'vector') {
      const baseSvg = artWrap.querySelector('svg.art-base');
      const outlineSvg = artWrap.querySelector('svg.art-outline');
      // 疊圖順序跟畫面上一致：線稿底色 → 塗鴉畫布 → 外框複本蓋最上面
      const [baseImg, outlineImg] = await Promise.all([
        svgToImage(baseSvg, sq), svgToImage(outlineSvg, sq)
      ]);
      c.drawImage(baseImg, ox, oy, sq, sq);
      c.drawImage(paintCanvas, 0, 0);
      c.drawImage(outlineImg, ox, oy, sq, sq);
    } else {
      const lineCanvas = artWrap.querySelector('#lineLayer');
      c.drawImage(fillCanvas, ox, oy, sq, sq);
      c.drawImage(paintCanvas, 0, 0);
      c.drawImage(lineCanvas, ox, oy, sq, sq);
    }
    return canvas.toDataURL('image/png');
  }

  /* 存到裝置：iPad 上優先用系統分享（可以直接儲存到相簿），
     不支援才顯示長按存檔畫面。作品檢視的「📷 存起來」也走這一條。 */
  async function shareOrSaveImage(dataUrl, name) {
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], name + '.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      } catch (e) { /* 使用者取消或不支援，改用長按儲存 */ }
    }
    saveImg.src = dataUrl;
    saveOverlay.hidden = false;
  }

  document.getElementById('saveBtn').addEventListener('click', async () => {
    Sound.click();
    closePanels();
    const item = gallery()[galleryIndex];
    const w = paintCanvas ? paintCanvas.width : 0;
    const h = paintCanvas ? paintCanvas.height : 0;
    const dataUrl = await composeFinalImage(item);
    // 除了存到裝置，同時收進「我的作品」，回選圖畫面就能再打開
    addArtwork(item, dataUrl, w, h);
    await shareOrSaveImage(dataUrl, item.name);
  });

  document.getElementById('closeSave').addEventListener('click', () => {
    saveOverlay.hidden = true;
  });

  /* ===== 我的作品：存進 IndexedDB 的完成作品，選圖畫面上方一列縮圖 ===== */
  const artOverlay = document.getElementById('artOverlay');
  const artImg = document.getElementById('artImg');
  const artConfirm = document.getElementById('artConfirm');
  let viewingArt = null;   // 目前在檢視 overlay 裡的那一筆

  // 由新到舊（createdAt 同毫秒時用自動編號的 id 決勝）
  function sortArtworks(list) {
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || (b.id || 0) - (a.id || 0));
  }

  function loadArtworks() {
    return KidsStore.all('artworks').then(list => {
      artworks = sortArtworks(list);
      buildArtworkRow();
    });
  }

  // 收一張完成的作品，超過上限就丟最舊的
  function addArtwork(item, dataUrl, w, h) {
    return KidsStore.put('artworks', {
      name: item.name, png: dataUrl, w, h, createdAt: Date.now()
    }).then(() => KidsStore.all('artworks')).then(list => {
      sortArtworks(list).slice(ARTWORK_MAX).forEach(a => KidsStore.del('artworks', a.id));
      artworks = list.slice(0, ARTWORK_MAX);
      buildArtworkRow();
    });
  }

  function buildArtworkRow() {
    artworkRow.innerHTML = '';
    artworkSection.hidden = artworks.length === 0;   // 一張都沒有就整區隱藏，不要留空標題
    artworks.forEach(a => {
      const b = document.createElement('button');
      b.className = 'artwork-thumb';
      b.title = a.name || '我的作品';
      const im = document.createElement('img');
      im.src = a.png;
      im.alt = a.name || '我的作品';
      b.appendChild(im);
      b.addEventListener('click', () => { Sound.click(); openArtwork(a); });
      artworkRow.appendChild(b);
    });
  }

  function openArtwork(a) {
    viewingArt = a;
    artImg.src = a.png;
    artConfirm.hidden = true;   // 每次打開都收起刪除確認
    artOverlay.hidden = false;
  }

  function closeArtwork() {
    artOverlay.hidden = true;
    artConfirm.hidden = true;
    viewingArt = null;
  }

  document.getElementById('artSaveBtn').addEventListener('click', () => {
    Sound.click();
    if (viewingArt) shareOrSaveImage(viewingArt.png, viewingArt.name || '我的作品');
  });

  // 刪除要按兩次：5 歲小孩會亂按
  document.getElementById('artDelBtn').addEventListener('click', () => {
    Sound.click();
    artConfirm.hidden = false;
  });

  document.getElementById('artDelNo').addEventListener('click', () => {
    Sound.click();
    artConfirm.hidden = true;
  });

  document.getElementById('artDelYes').addEventListener('click', () => {
    Sound.click();
    const a = viewingArt;
    if (!a) { closeArtwork(); return; }
    artworks = artworks.filter(x => x.id !== a.id);
    buildArtworkRow();
    closeArtwork();
    KidsStore.del('artworks', a.id);
  });

  document.getElementById('artCloseBtn').addEventListener('click', () => {
    Sound.click();
    closeArtwork();
  });

  /* iPad 上小孩常常直接切走或關掉 App，切到背景時立刻存一次不等 debounce */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveProgressNow();
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

  // 開頁讀一次：哪幾張畫到一半（補角標）、有哪些完成的作品
  KidsStore.all('progress').then(list => {
    wipKeys = new Set(list.map(r => r.key));
    refreshWipBadges();
  });
  loadArtworks();
})();
