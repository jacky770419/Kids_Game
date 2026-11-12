/* 著色遊戲：
   選圖畫面（左邊縮圖牆、右邊盒子選種類）→ 著色中（左邊整塊白紙、右邊盒子）。
   盒子由上到下：四種畫具（倒顏料／畫筆／蓋章／橡皮擦，點一下就換）、
   她在學的 11 個顏色＋「更多」、最下面一定是 [上一步][綠色的畫好了]。
   畫筆種類與粗細、印章圖案、橡皮擦大小、完整色盤是從盒子左邊跳出來的面板。
   另外支援復原（undo）、接著畫、我的作品、上傳自己的照片自動變成線條畫稿。
   畫面元件（.btn／.box／.done／注音／圖示）在 css/base.css 與 js/ui.js，這一頁的樣式在 css/coloring.css。 */
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

  /* ===== 色盤的英文名：選色時唸出來 =====
     為什麼只用 11 個幼兒基本色名：使用者五歲，色盤上有四種粉紅、五種藍，
     照色票名唸「medium violet red」「steel blue」對她沒有任何意義，
     反而學不起來。同一族的顏色一律唸同一個基本色名（pink、blue…），
     她點哪一格都在重複同一個字，這才是有效的輸入。
     tools/check_data.js 會對帳 COLORS 的 56 個 hex 是否每個都有名字。 */
  const COLOR_NAMES = {
    // 第 1 列：純色
    '#FF0000': 'red', '#FFA500': 'orange', '#FFFF00': 'yellow', '#228B22': 'green',
    '#00BFFF': 'blue', '#0000FF': 'blue', '#7B2FBE': 'purple', '#555555': 'gray',
    // 第 2 列：深色版
    '#B71C1C': 'red', '#C25E00': 'orange', '#C9A227': 'yellow', '#145A14': 'green',
    '#0077A8': 'blue', '#00008B': 'blue', '#4B1D75': 'purple', '#2B2B2B': 'black',
    // 第 3 列：淺色版
    '#FF6B6B': 'red', '#FFC04D': 'orange', '#FFF176': 'yellow', '#66BB6A': 'green',
    '#7FDFFF': 'blue', '#6C7BFF': 'blue', '#A96FD8': 'purple', '#8A8A8A': 'gray',
    // 第 4 列：粉彩版
    '#FFC9C9': 'pink', '#FFE0B2': 'orange', '#FFF9C4': 'yellow', '#C8E6C9': 'green',
    '#C4EFFF': 'blue', '#C5CAE9': 'blue', '#E1BEE7': 'purple', '#D6D6D6': 'gray',
    // 第 5 列：粉紅 / 棕 / 黃綠 延伸
    '#FF69B4': 'pink', '#FF1493': 'pink', '#C71585': 'pink', '#8B4513': 'brown',
    '#A0522D': 'brown', '#D2A679': 'brown', '#9ACD32': 'green', '#6B8E23': 'green',
    // 第 6 列：青 / 藍綠 / 靛 / 紫羅蘭 延伸
    '#00CED1': 'blue', '#20B2AA': 'blue', '#008080': 'blue', '#4682B4': 'blue',
    '#4169E1': 'blue', '#6A5ACD': 'purple', '#8A2BE2': 'purple', '#DA70D6': 'pink',
    // 第 7 列：淺色雜項 + 灰階 + 深棕
    '#FFFFFF': 'white', '#F0E68C': 'yellow', '#FFDAB9': 'orange', '#E0C097': 'brown',
    '#A9A9A9': 'gray', '#777777': 'gray', '#5C2E0E': 'brown', '#333333': 'black'
  };

  /* ===== 盒子裡常駐的 11 個顏色 =====
     就是 COLOR_NAMES 會唸的那 11 個字（red／orange／yellow／green／blue／purple／pink／brown／
     black／white／gray），一個字一格、永遠攤開——她學的是這 11 個字，不用打開面板就按得到。
     每一格都是 COLORS 裡現成的那一色（不另外發明新色）：完整色盤裡選到同一色時兩邊一起亮，
     COLOR_NAMES 也不用多一份對照。第 12 格是彩虹色的「更多」，打開完整色盤與花紋。 */
  const BASIC_COLORS = [
    '#FF0000', '#FFA500', '#FFFF00',
    '#228B22', '#0000FF', '#7B2FBE',
    '#FF69B4', '#8B4513', '#2B2B2B',
    '#FFFFFF', '#8A8A8A'
  ];
  // 只給螢幕報讀用的中文名（畫面上不顯示字）
  const COLOR_ZH = {
    red: '紅色', orange: '橘色', yellow: '黃色', green: '綠色', blue: '藍色', purple: '紫色',
    pink: '粉紅色', brown: '咖啡色', black: '黑色', white: '白色', gray: '灰色'
  };

  /* ===== 畫圖工具 =====
     fill 是盒子上的「倒顏料」；其餘五支是「畫筆」那一顆底下的種類（面板裡用畫出來的筆跡表示）。
     name 只給螢幕報讀用，畫面上不顯示字。 */
  const TOOLS = [
    { id: 'fill',    name: '倒顏料' },
    { id: 'marker',  name: '粗筆',   width: 34 },
    { id: 'pencil',  name: '細筆',   width: 12 },
    { id: 'water',   name: '水彩',   width: 40, alpha: 0.35 },
    { id: 'spray',   name: '潑墨' },
    { id: 'glitter', name: '亮粉筆', width: 26 }
  ];
  const BRUSHES = TOOLS.filter(t => t.id !== 'fill');

  /* 蓋章有自己的圖案面板與按鈕，不在 TOOLS 裡，
     但 mode 會設成 'stamp'，所以 currentTool() 要認得它 */
  const STAMP_TOOL = { id: 'stamp', name: '蓋章' };
  // 印章大小：一顆印章佔紙張短邊的比例，三段可選
  const STAMP_SIZES = [
    { id: 'small', name: '小', scale: 0.11 },
    { id: 'mid',   name: '中', scale: 0.19 },
    { id: 'big',   name: '大', scale: 0.30 }
  ];
  const STAMP_ACCENT = '#FFFFFF';

  // 畫筆粗細：五段可選，scale 乘在每種工具原本的 width 上（小朋友常常想要比預設更細的筆）
  // 超細配細筆約 2px，是給 Apple Pencil 描小地方用的
  const BRUSH_SIZES = [
    { id: 'xxs', name: '超細', scale: 0.18 },
    { id: 'xs',  name: '最細', scale: 0.35 },
    { id: 'sm',  name: '細',   scale: 0.6 },
    { id: 'mid', name: '中',   scale: 1 },
    { id: 'lg',  name: '粗',   scale: 1.5 }
  ];

  // 橡皮擦大小：獨立於畫筆粗細，不管目前選的是哪支筆都用自己這組
  const ERASER_BASE_WIDTH = 34;
  const ERASER_SIZES = [
    { id: 'xs',  name: '最細', scale: 0.35 },
    { id: 'sm',  name: '細',   scale: 0.6 },
    { id: 'mid', name: '中',   scale: 1 },
    { id: 'lg',  name: '粗',   scale: 1.5 }
  ];

  /* ===== 選圖畫面的種類 =====
     六十幾張圖擠在一面縮圖牆上太難找，右邊盒子裡一顆一類，按了只留該類。
     id 要跟 gallery() 給每一筆的 cat 對得起來；'all' 是特例（不篩）。
     photo 類是自己上傳的照片，即使一張都沒有也要留著——上傳鈕在那一頁。
     她不識字，所以每一顆放的是「那一類裡的一張線稿」：pick 指定用哪一張（找不到就用該類第一張），
     全部和我的照片沒有代表圖，用線條圖示（ic）。name 只給螢幕報讀用。 */
  const CATS = [
    { id: 'all',     name: '全部',     ic: 'grid' },
    { id: 'animal',  name: '動物',     pick: '抱抱熊' },
    { id: 'fantasy', name: '公主城堡', pick: '微笑小公主' },
    { id: 'food',    name: '水果甜點', pick: '甜心草莓' },
    { id: 'vehicle', name: '車車',     pick: '嘟嘟小汽車' },
    { id: 'scene',   name: '大張場景', pick: '熊貓吃竹子' },
    { id: 'other',   name: '其他',     pick: '太陽小花' },
    { id: 'photo',   name: '我的照片', ic: 'camera' }
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
  const ARTWORK_MAX = 60;    // 「我的作品」最多保留幾張（著色／貼紙／甜點店共用；2026-11 使用者要求從 24 調高）
  const SAVE_DELAY = 800;    // 停手多久之後才寫進度（toDataURL 不便宜，不能每筆都存）

  const selectScreen = document.getElementById('selectScreen');
  const gameScreen = document.getElementById('gameScreen');
  const picGrid = document.getElementById('picGrid');
  const catTabs = document.getElementById('catTabs');
  const holder = document.getElementById('svgHolder');
  const artWrap = document.getElementById('artWrap');
  const toolbar = document.getElementById('toolbar');
  const fillBtn = document.getElementById('fillBtn');
  const brushBtn = document.getElementById('brushBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const swatches = document.getElementById('swatches');
  const backBtn = document.getElementById('backBtn');
  const pickScroll = document.querySelector('.pick-scroll');
  const doneOverlay = document.getElementById('doneOverlay');
  const donePic = document.getElementById('donePic');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const doneBtn = document.getElementById('doneBtn');
  const toolPanel = document.getElementById('toolPanel');
  const colorPanel = document.getElementById('colorPanel');
  const toolList = document.getElementById('toolList');
  const toolSizeRow = document.getElementById('toolSizeRow');
  const eraserPanel = document.getElementById('eraserPanel');
  const eraserSizeRow = document.getElementById('eraserSizeRow');
  const stampBtn = document.getElementById('stampBtn');
  const stampPanel = document.getElementById('stampPanel');
  const stampGrid = document.getElementById('stampGrid');
  const stampSizeRow = document.getElementById('stampSizeRow');
  const colorGrid = document.getElementById('colorGrid');
  const patternRow = document.getElementById('patternRow');
  const processingOverlay = document.getElementById('processingOverlay');
  const artworkSection = document.getElementById('artworkSection');
  const artworkRow = document.getElementById('artworkRow');

  let galleryIndex = 0;
  let currentCat = 'all';                           // 目前選的分類頁籤（回選圖畫面時保留）
  let customPics = loadCustomPics();  // [{type:'raster', id, name, dataUrl}]
  let mode = 'fill';                                // TOOLS 裡的 id，或 'stamp'
  let brushId = 'marker';                           // 最後選的那支筆（BRUSHES 裡的 id）：再點「畫筆」就回到它
  let moreBtn = null;                               // 第 12 格「更多顏色」（buildSwatches 建的）
  let stampId = (window.STAMPS && window.STAMPS[0].id) || 'star';  // 目前選的印章圖案
  let stampSizeId = 'mid';                                         // 目前選的印章大小
  let brushSizeId = 'mid';                                         // 目前選的畫筆粗細
  let eraserSizeId = 'mid';                                        // 目前選的橡皮擦大小（跟畫筆粗細分開存)
  let eraser = false;                               // 橡皮擦開關（獨立於顏色）
  let paint = { type: 'color', value: COLORS[0] };  // 或 { type:'pattern', id }
  let paintCanvas = null;
  let ctx = null;
  let fillCanvas = null, fillCtx = null;   // 只有上傳照片模式會用到
  let edgeCanvas = null, edgeCtx = null;   // 點陣圖：填色圖層往兩側紙面的延伸（見 syncEdgeLayer）
  let rasterEdgeMask = null;               // 目前這張照片的線條遮罩（填色用）
  let history = [];                        // 復原用的快照堆疊
  let beforePaint = null;                  // 重複使用的離屏 canvas：這一筆「下筆前」的 paintLayer
  let strokeAcc = null;                    // 這一筆的影響範圍累積器（UndoRect）
  let openedPanel = null;                  // null | 'tool' | 'color' | 'stamp' | 'eraser'
  let swallowStroke = false;               // 這一下點擊只用來關面板，不作畫
  let paperW = 0, paperH = 0;              // 上一次量到的紙張尺寸（CSS px），用來短路重複的 resize
  let hasContent = false;                  // 這張畫過東西，或剛從進度還原回來（跟 history 無關）
  let wipKeys = new Set();                 // 有存進度的圖，選圖畫面用來加「畫到一半」角標
  let saveTimer = null;                    // 進度存檔的 debounce timer
  let artworks = [];                       // 「我的作品」，由新到舊
  let changedSinceDone = true;             // 上次按「畫好了」之後有沒有再動過（沒動就不重複收一張一樣的）
  let doneBusy = false;                    // 正在合成完成圖，擋掉連點

  /* 選圖畫面的順序：內建手繪 → 城堡公主 → 動物 → 水果甜點 → 場景 → 自己上傳的照片。
     各系列的 js 檔都是 classic script，用 window.XXX 取值，缺檔時安全跳過。
     每一筆都帶 cat（分類頁籤用）：整個系列同一類的就給系列預設值，
     內建的 LINEART 是混合的，改在資料裡逐筆寫 cat，這裡只當作沒寫時的退路。
     每一筆看欄位決定引擎：有 svg 是向量線稿；有 src 是內建的點陣線稿（PNG stencil），
     跟上傳照片同一套引擎，但不能刪、進度 key 用名字。動物系列與獨角獸是點陣、跟場景同一種。 */
  function gallery() {
    const series = (list, cat) =>
      (list || []).map(x => x.src
        ? { type: 'raster', builtin: true, cat: x.cat || cat, id: 's:' + x.name, name: x.name, dataUrl: x.src }
        : { type: 'vector', cat: x.cat || cat, name: x.name, svg: x.svg });
    return [
      ...series(LINEART, 'other'),
      ...series(window.LINEART_FANTASY, 'fantasy'),
      ...series(window.LINEART_ANIMALS, 'animal'),
      ...series(window.LINEART_FOOD, 'food'),
      ...series(window.LINEART_VEHICLES, 'vehicle'),
      ...series(window.LINEART_SCENES, 'scene'),
      ...customPics.map(x => ({ ...x, cat: 'photo' }))
    ];
  }

  function currentTool() {
    if (mode === 'stamp') return STAMP_TOOL;
    return TOOLS.find(t => t.id === mode) || TOOLS[0];
  }

  function brushTool() {
    return BRUSHES.find(t => t.id === brushId) || BRUSHES[0];
  }

  function currentStamp() {
    const list = window.STAMPS || [];
    return list.find(x => x.id === stampId) || list[0] || null;
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

  /* canvas 快照只存「這次動作真正改到的那塊矩形」，不是整張畫布。
     整張的代價：paintLayer 在 iPad 直向是 800x1600 → 一筆 5.12 MB，25 筆 = 128 MB，
     Safari 會把分頁殺掉。entry 形狀 { kind:'canvas', ctx, x, y, data }，
     還原時 putImageData 貼回原本的位置。 */
  function undo() {
    const entry = history.pop();
    if (!entry) return;
    if (entry.kind === 'fill') {
      if (entry.prev === null) entry.el.removeAttribute('fill');
      else entry.el.setAttribute('fill', entry.prev);
    } else if (entry.kind === 'canvas') {
      entry.ctx.putImageData(entry.data, entry.x, entry.y);
      if (entry.ctx === fillCtx) syncEdgeLayer();
    }
    changedSinceDone = true;
    updateButtons();
    scheduleSave();   // 退回去的樣子也要存：不然退完就被系統關掉，下次打開那一筆又回來了
  }

  /* ===== 一筆畫的「延後快照」 =====
     下筆時不再讀整張 ImageData（那是 JS 堆積），改成把現況 drawImage 到一張重複使用的
     離屏 canvas（GPU 端拷貝，不佔堆積），同時開一個外接矩形累積器；
     每個繪圖函式把自己的影響範圍加進去，收筆時只從離屏 canvas 抓那塊矩形。 */
  function beginStroke() {
    const cv = paintCanvas;
    if (!cv || !window.UndoRect) return;
    if (!beforePaint) beforePaint = document.createElement('canvas');
    if (beforePaint.width !== cv.width || beforePaint.height !== cv.height) {
      beforePaint.width = cv.width;
      beforePaint.height = cv.height;
    }
    const bctx = beforePaint.getContext('2d');
    // 尺寸沒變時 canvas 不會自動清空，殘留的上一筆會被當成「下筆前」的樣子
    bctx.clearRect(0, 0, beforePaint.width, beforePaint.height);
    bctx.drawImage(cv, 0, 0);
    strokeAcc = UndoRect.create();
  }

  function commitStroke() {
    const cv = paintCanvas;
    const acc = strokeAcc;
    strokeAcc = null;
    if (!cv || !acc || !beforePaint) return;
    /* 畫到一半轉向：sizeArt() 會重建畫布並 clearHistory()，離屏拷貝的尺寸就對不上了。
       這時候推進去的 entry 復原起來會把內容貼錯位置，寧可讓這一筆不能復原。 */
    if (beforePaint.width !== cv.width || beforePaint.height !== cv.height) return;
    const rect = UndoRect.toRect(acc, cv.width, cv.height);
    if (!rect) return;   // 這一筆沒碰到畫布（全落在紙外），沒東西可以復原
    pushHistory({
      kind: 'canvas', ctx: ctx, x: rect.x, y: rect.y,
      data: beforePaint.getContext('2d').getImageData(rect.x, rect.y, rect.w, rect.h)
    });
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
    // 一筆都還沒畫就沒有「畫好了」可言（灰的、平的）：空白線稿不收進我的作品，也不放彩帶
    doneBtn.disabled = empty && !hasContent;
  }

  // 畫了東西（或還原回內容）就標記起來，讓「全部擦掉」「畫好了」可以按
  function markContent() {
    hasContent = true;
    changedSinceDone = true;
    updateButtons();
  }

  /* ===== 彈出面板 =====
     面板裡的每一格都是浮起來的小按鈕（.cell），裡面放的是「畫出來的東西」——筆跡、圓點、印章，
     不是字也不是 emoji。選到的那一格外面一圈深色（跟顏色的選法一樣）。 */
  function makeCell(selected, label) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cell' + (selected ? ' selected' : '');
    if (label) b.setAttribute('aria-label', label);
    return b;
  }

  function buildToolPanel() {
    toolList.innerHTML = '';
    BRUSHES.forEach(t => {
      const b = makeCell(false, t.name);
      b.dataset.tool = t.id;
      b.appendChild(brushPreview(t));
      b.addEventListener('click', () => selectTool(t.id));
      toolList.appendChild(b);
    });
    refreshToolSizeRow();
  }

  /* 每支筆畫一小段它真正的筆跡：粗筆粗、細筆細、水彩半透明會疊色、潑墨是一團點、亮粉筆上面有亮點。
     固定用房間的紅色畫，不跟著目前的顏色變——選到白色時整排會看不見。 */
  function brushPreview(t) {
    const S = 128;                       // 畫 2 倍解析度，CSS 縮小顯示
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    const wave = () => {
      g.beginPath();
      g.moveTo(22, 84);
      g.bezierCurveTo(46, 20, 80, 110, 106, 44);
    };
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = '#FF5C5C';
    g.fillStyle = '#FF5C5C';

    if (t.id === 'spray') {
      // 固定的亂數種子：每次開頁都長得一樣
      let seed = 7;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let i = 0; i < 46; i++) {
        const a = rnd() * Math.PI * 2;
        const d = rnd() * rnd() * 52;
        g.beginPath();
        g.arc(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 3 + rnd() * 6, 0, Math.PI * 2);
        g.fill();
      }
      g.beginPath();
      g.arc(60, 66, 15, 0, Math.PI * 2);
      g.fill();
      return c;
    }

    if (t.id === 'water') {
      g.globalAlpha = t.alpha;
      g.lineWidth = 34;
      wave();
      g.stroke();
      // 再疊一筆短的：水彩疊起來會變深
      g.beginPath();
      g.moveTo(40, 70);
      g.bezierCurveTo(56, 50, 76, 86, 92, 64);
      g.stroke();
      return c;
    }

    g.lineWidth = t.id === 'pencil' ? 7 : (t.id === 'glitter' ? 22 : 28);
    wave();
    g.stroke();
    if (t.id === 'glitter') {
      [[30, 70, 4], [44, 50, 5], [58, 62, 3.5], [70, 76, 5], [84, 70, 4], [98, 52, 5], [52, 78, 3], [90, 58, 3]]
        .forEach((p, i) => {
          g.fillStyle = i % 2 ? '#FFF9C4' : '#fff';
          g.beginPath();
          g.arc(p[0], p[1], p[2], 0, Math.PI * 2);
          g.fill();
        });
    }
    return c;
  }

  // 目前粗細的倍率，乘在每種筆原本的 width 上
  function brushScale() {
    return (BRUSH_SIZES.find(s => s.id === brushSizeId) || BRUSH_SIZES[2]).scale;
  }

  function eraserScale() {
    return (ERASER_SIZES.find(s => s.id === eraserSizeId) || ERASER_SIZES[2]).scale;
  }

  // 橡皮擦大小自成一組，跟目前選的筆完全無關——擦的時候不管換到哪支筆都用這個粗細
  function currentLineWidth() {
    if (isEraser()) return ERASER_BASE_WIDTH * eraserScale();
    return (currentTool().width || 30) * brushScale();
  }

  /* 粗細那一列：只有「有 width」的筆（粗筆／細筆／水彩／亮粉筆）才顯示，潑墨沒有線寬可調。
     看的是 brushTool() 不是 currentTool()：這列是「畫筆」的粗細，跟現在手上拿什麼無關。 */
  function refreshToolSizeRow() {
    const supportsSize = typeof brushTool().width === 'number';
    toolSizeRow.hidden = !supportsSize;
    if (!supportsSize) return;
    toolSizeRow.innerHTML = '';
    BRUSH_SIZES.forEach(sz => {
      const b = makeCell(sz.id === brushSizeId, sz.name);
      b.dataset.size = sz.id;
      b.appendChild(sizeDot(sz.scale, BRUSH_SIZES));
      b.addEventListener('click', () => selectBrushSize(sz.id));
      toolSizeRow.appendChild(b);
    });
  }

  /* 粗細用圓點表示，她看的是「哪一顆比較大」：最大那一段剛好塞滿格子，其他照比例縮。
     不照實際 px 畫——粗筆的「中」和「粗」都會頂到格子邊看不出差別，細筆的五顆又全小到分不出來。 */
  function sizeDot(scale, sizes) {
    const S = 96;                        // 畫 2 倍解析度，CSS 縮小顯示
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    const max = Math.max.apply(null, sizes.map(s => s.scale));
    const r = Math.max(4, (S / 2 - 4) * scale / max);
    g.fillStyle = '#33274F';
    g.beginPath();
    g.arc(S / 2, S / 2, r, 0, Math.PI * 2);
    g.fill();
    return c;
  }

  function selectBrushSize(id) {
    brushSizeId = id;
    // 調畫筆粗細＝想用筆畫：不管現在是蓋章還是橡皮擦，都切回最後那支筆
    eraser = false;
    mode = brushId;
    syncActiveTool();
    toolSizeRow.querySelectorAll('.cell').forEach(b =>
      b.classList.toggle('selected', b.dataset.size === id));
    Sound.click();
    // 刻意不關面板：小孩常常要連續調幾次才滿意
  }

  /* 橡皮擦大小面板：跟畫筆粗細長得一樣（同一套視覺語言），只需要建一次 */
  function buildEraserSizeRow() {
    eraserSizeRow.innerHTML = '';
    ERASER_SIZES.forEach(sz => {
      const b = makeCell(sz.id === eraserSizeId, sz.name);
      b.dataset.size = sz.id;
      b.appendChild(sizeDot(sz.scale, ERASER_SIZES));
      b.addEventListener('click', () => selectEraserSize(sz.id));
      eraserSizeRow.appendChild(b);
    });
  }

  function selectEraserSize(id) {
    eraserSizeId = id;
    eraser = true;             // 調橡皮擦大小＝想擦，順手切過去
    syncActiveTool();
    eraserSizeRow.querySelectorAll('.cell').forEach(b =>
      b.classList.toggle('selected', b.dataset.size === id));
    Sound.click();
    // 刻意不關面板：小孩常常要連續調幾次才滿意
  }

  /* 印章面板：每格用一張小 canvas 直接把圖案畫出來，
     跟畫在紙上的是同一支 draw()，不會有「預覽跟蓋出來不一樣」的問題 */
  function buildStampPanel() {
    stampGrid.innerHTML = '';
    (window.STAMPS || []).forEach(st => {
      const b = makeCell(st.id === stampId, st.name);
      b.dataset.stamp = st.id;
      b.appendChild(stampPreview(st));
      b.addEventListener('click', () => selectStamp(st.id));
      stampGrid.appendChild(b);
    });

    refreshStampSizeRow();
  }

  /* 大小那一列：用「目前選的圖案」畫成三種尺寸，小孩看得懂哪一顆比較大。
     換圖案時要重畫，預覽才跟著變 */
  function refreshStampSizeRow() {
    const big = STAMP_SIZES[STAMP_SIZES.length - 1].scale;
    stampSizeRow.innerHTML = '';
    STAMP_SIZES.forEach(sz => {
      const b = makeCell(sz.id === stampSizeId, sz.name);
      b.dataset.size = sz.id;
      b.appendChild(stampPreview(currentStamp(), 0.35 + 0.65 * (sz.scale / big)));
      b.addEventListener('click', () => selectStampSize(sz.id));
      stampSizeRow.appendChild(b);
    });
  }

  // ratio < 1 時圖案畫小一點但畫布一樣大，三顆並排才看得出大小差別
  function stampPreview(st, ratio) {
    const side = 144;                    // 畫 2 倍解析度，CSS 縮小顯示
    const k = ratio || 1;
    const c = document.createElement('canvas');
    c.width = side; c.height = side;
    const g = c.getContext('2d');
    if (!st) return c;
    g.translate(side / 2, side / 2);
    g.scale(side * 0.88 * k / 100, side * 0.88 * k / 100);
    g.translate(-50, -50);
    st.draw(g, '#FF5C5C', '#FFFFFF');
    return c;
  }

  function stampScale() {
    const sz = STAMP_SIZES.find(x => x.id === stampSizeId) || STAMP_SIZES[1];
    return sz.scale;
  }

  /* ===== 顏色 ===== */
  // 0（黑）～1（白）。夠淺的顏色上面的勾勾要換深色；接近白的還要加一圈灰邊，不然在白盒子上看不到
  function lightness(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }

  function toneClass(hex) {
    const l = lightness(hex);
    return (l > 0.62 ? ' lite' : '') + (l > 0.88 ? ' pale' : '');
  }

  /* 唸出顏色的英文名。只在「她親手點色格」時唸——程式初始化選預設色也會走 selectPaint()，
     所以不能把它放在 selectPaint 裡面，否則一進著色頁就會無故出聲。 */
  function sayColor(color) {
    if (window.Speech && COLOR_NAMES[color]) Speech.say(COLOR_NAMES[color]);
  }

  /* 盒子裡的 12 格：11 個基本色＋「更多」。選到的那一格外面一圈、裡面一個勾。
     「更多」平常是彩虹圈＋加號；目前用的是完整色盤裡的顏色或花紋時，中間換成那個顏料、外面也有一圈，
     她才看得出「現在拿的是這個」。 */
  function buildSwatches() {
    swatches.innerHTML = '';
    BASIC_COLORS.forEach(color => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sw' + toneClass(color);
      b.dataset.color = color;
      b.style.setProperty('--c', color);
      b.setAttribute('aria-label', COLOR_ZH[COLOR_NAMES[color]] || color);
      b.innerHTML = UI.icon('check');
      b.addEventListener('click', () => {
        selectPaint({ type: 'color', value: color });
        sayColor(color);
      });
      swatches.appendChild(b);
    });

    moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'sw more';
    moreBtn.setAttribute('aria-label', '更多顏色和花紋');
    moreBtn.innerHTML = '<span class="more-dot"></span>';
    moreBtn.addEventListener('click', () => {
      Sound.click();
      if (openedPanel === 'color') closePanels(); else openPanel('color');
    });
    swatches.appendChild(moreBtn);
  }

  function buildColorPanel() {
    colorGrid.innerHTML = '';
    COLORS.forEach(color => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'color-cell' + toneClass(color);
      b.dataset.color = color;
      b.style.background = color;
      b.setAttribute('aria-label', COLOR_ZH[COLOR_NAMES[color]] || color);
      b.addEventListener('click', () => {
        selectPaint({ type: 'color', value: color });
        sayColor(color);
      });
      colorGrid.appendChild(b);
    });

    patternRow.innerHTML = '';
    PATTERNS.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pattern-cell';
      b.dataset.pattern = p.id;
      b.setAttribute('aria-label', p.name);
      b.innerHTML = `<svg viewBox="0 0 40 40">${p.tile}</svg>`;
      b.addEventListener('click', () => selectPaint({ type: 'pattern', id: p.id }));
      patternRow.appendChild(b);
    });
  }

  function markPaintSelection() {
    const isColor = paint.type === 'color';
    swatches.querySelectorAll('.sw[data-color]').forEach(c => {
      const on = isColor && c.dataset.color === paint.value;
      c.classList.toggle('sel', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    colorGrid.querySelectorAll('.color-cell').forEach(c =>
      c.classList.toggle('selected', isColor && c.dataset.color === paint.value));
    patternRow.querySelectorAll('.pattern-cell').forEach(c =>
      c.classList.toggle('selected', !isColor && c.dataset.pattern === paint.id));
    syncMoreBtn();
  }

  // 「更多」那一格跟目前顏料同步（取代舊版那顆整顆變色的顏色鈕）
  function syncMoreBtn() {
    if (!moreBtn) return;
    const dot = moreBtn.querySelector('.more-dot');
    const basic = paint.type === 'color' && BASIC_COLORS.indexOf(paint.value) >= 0;
    moreBtn.classList.toggle('sel', !basic);
    dot.classList.toggle('filled', !basic);
    dot.style.background = '';
    if (basic) {
      dot.innerHTML = UI.icon('plus');
    } else if (paint.type === 'color') {
      dot.innerHTML = '';
      dot.style.background = paint.value;
    } else {
      const p = PATTERNS.find(x => x.id === paint.id);
      dot.innerHTML = p
        ? `<svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice">${p.tile}</svg>`
        : '';
    }
  }

  /* 四顆畫具同一時間只亮一顆（.sel＝房間色＋外圈），畫筆面板裡也只在用筆時標出那支筆。
     所有改 mode / eraser 的地方最後都呼叫這支，不要再各自同步按鈕。 */
  function activeToolKey() {
    if (eraser) return 'eraser';
    if (mode === 'stamp') return 'stamp';
    return mode === 'fill' ? 'fill' : 'brush';
  }

  function syncActiveTool() {
    const key = activeToolKey();
    [['fill', fillBtn], ['brush', brushBtn], ['stamp', stampBtn], ['eraser', eraserBtn]].forEach(pair => {
      const on = pair[0] === key;
      pair[1].classList.toggle('sel', on);
      pair[1].setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    toolList.querySelectorAll('.cell').forEach(b =>
      b.classList.toggle('selected', key === 'brush' && b.dataset.tool === brushId));
  }

  /* 面板貼在盒子左邊、垂直對齊觸發它的那一顆，小箭頭指著那一顆。
     position:fixed 與箭頭的 right 是 css/coloring.css 的 .panel／.panel-arrow 給的。 */
  function positionPanel(panel, trigger) {
    // 先歸零，量到的尺寸才不會被上一次的位置影響
    panel.style.left = '0px';
    panel.style.top = '0px';
    const tRect = trigger.getBoundingClientRect();
    const bRect = toolbar.getBoundingClientRect();
    const pRect = panel.getBoundingClientRect();

    // 貼在盒子左邊（留 22px 給小箭頭）
    let left = bRect.left - pRect.width - 22;
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
      let ay = tRect.top + tRect.height / 2 - top - 11;
      ay = Math.max(18, Math.min(pRect.height - 40, ay));
      arrow.style.top = ay + 'px';
    }
  }

  const PANELS = {
    tool:   () => [toolPanel, brushBtn],
    color:  () => [colorPanel, moreBtn],
    stamp:  () => [stampPanel, stampBtn],
    eraser: () => [eraserPanel, eraserBtn]
  };

  function openPanel(which) {
    closePanels();
    const [panel, trigger] = PANELS[which]();
    panel.hidden = false;
    positionPanel(panel, trigger);   // 要先顯示才量得到尺寸
    openedPanel = which;
  }

  function closePanels() {
    toolPanel.hidden = true;
    colorPanel.hidden = true;
    stampPanel.hidden = true;
    eraserPanel.hidden = true;
    openedPanel = null;
  }

  /* 面板開著時，點面板與觸發鈕以外的地方就關掉。
     用 capture 階段先攔到，但不做 stopPropagation（會連帶擋掉 music.js 掛在
     document 上的「第一次觸控自動播放」），改用 swallowStroke 旗標讓畫布這一下不作畫。 */
  document.addEventListener('pointerdown', (e) => {
    if (!openedPanel) return;
    if (e.target.closest && e.target.closest('#toolPanel, #colorPanel, #stampPanel, #eraserPanel, #brushBtn, #stampBtn, #eraserBtn, .sw.more')) return;
    closePanels();
    swallowStroke = true;
  }, true);

  const releaseSwallow = () => { swallowStroke = false; };
  document.addEventListener('pointerup', releaseSwallow, true);
  document.addEventListener('pointercancel', releaseSwallow, true);

  /* ===== 選畫具 / 選顏色 ===== */
  // 面板裡選一支筆
  function selectTool(id) {
    mode = brushId = id;
    eraser = false;            // 選了筆＝不再是擦的狀態
    syncActiveTool();
    refreshToolSizeRow();
    Sound.click();
    closePanels();
  }

  /* 選印章圖案＝同時切到蓋章模式（小孩只要點一下就開始蓋，不用先選工具再選圖案） */
  function selectStamp(id) {
    stampId = id;
    mode = 'stamp';
    eraser = false;
    syncActiveTool();
    stampGrid.querySelectorAll('.cell').forEach(b =>
      b.classList.toggle('selected', b.dataset.stamp === id));
    refreshStampSizeRow();
    Sound.pop();
    closePanels();
  }

  function selectStampSize(id) {
    stampSizeId = id;
    mode = 'stamp';                  // 調大小＝想蓋章，順手切過去
    eraser = false;
    syncActiveTool();
    stampSizeRow.querySelectorAll('.cell').forEach(b =>
      b.classList.toggle('selected', b.dataset.size === id));
    Sound.click();                   // 刻意不關面板：可以馬上再換圖案或再調一次
  }

  function selectPaint(newPaint) {
    paint = newPaint;
    eraser = false;            // 選了任何顏色／花紋就自動放下橡皮擦
    syncActiveTool();
    markPaintSelection();
    Sound.click();
    closePanels();
  }

  /* 盒子上的四顆畫具：點一下就拿起來（不跳面板——每換一次畫具都跳面板的話，
     她要多點一下把面板關掉，而且那一下不會畫）。
     已經拿在手上的那一顆再點一次，才從旁邊跳出它的選項（哪支筆、多粗、哪個印章、橡皮擦多大）；
     倒顏料沒有選項。有選項的那幾顆下面有三個小點。 */
  function pickTool(key) {
    Sound.click();
    if (activeToolKey() === key) {
      const panel = { brush: 'tool', stamp: 'stamp', eraser: 'eraser' }[key];
      if (!panel || openedPanel === panel) closePanels(); else openPanel(panel);
      return;
    }
    closePanels();
    eraser = key === 'eraser';
    if (key === 'fill') mode = 'fill';
    else if (key === 'brush') mode = brushId;
    else if (key === 'stamp') mode = 'stamp';
    // 拿橡皮擦不動 mode：選顏色放下橡皮擦之後，要回到原本拿的那一樣
    syncActiveTool();
  }

  fillBtn.addEventListener('click', () => pickTool('fill'));
  brushBtn.addEventListener('click', () => pickTool('brush'));
  stampBtn.addEventListener('click', () => pickTool('stamp'));
  eraserBtn.addEventListener('click', () => pickTool('eraser'));

  undoBtn.addEventListener('click', () => {
    if (undoBtn.disabled) return;
    Sound.click();
    closePanels();
    undo();
  });

  /* 全部擦掉：要按住一秒、外圈轉滿才算（UI.hold）。手掌掃到、好奇點一下都不會整張不見。 */
  function clearAll() {
    if (clearBtn.disabled) return;
    Sound.click();
    closePanels();
    artWrap.querySelectorAll('svg.art-base .c').forEach(el => el.setAttribute('fill', '#fff'));
    // 兩層都用各自的實際解析度清（paintLayer 是非正方的整張紙）
    if (fillCtx) fillCtx.clearRect(0, 0, fillCtx.canvas.width, fillCtx.canvas.height);
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    syncEdgeLayer();
    clearHistory();
    hasContent = false;
    changedSinceDone = true;
    updateButtons();
    scheduleSave();   // 清空也是一種狀態，下次打開要是清空的
  }
  UI.hold(clearBtn, 1000, clearAll);

  /* ===== 選圖畫面 ===== */
  /* 種類那一顆上面放什麼：那一類的一張線稿（白色小卡），或線條圖示。 */
  function catFace(cat, all) {
    if (cat.ic) return UI.icon(cat.ic);
    const list = all.filter(x => x.cat === cat.id);
    const item = list.find(x => x.name === cat.pick) || list[0];
    if (!item) return UI.icon('image');
    return item.type === 'vector'
      ? `<span class="cat-pic">${item.svg}</span>`
      : `<span class="cat-pic"><img src="${item.dataUrl}" alt=""></span>`;
  }

  /* 種類（右邊的盒子）。點了只重畫縮圖牆（不重建按鈕本身，只換 .sel），
     空的種類會直接不出現——除了「我的照片」，上傳鈕在那一頁。 */
  function buildCatTabs() {
    if (!catTabs) return;
    catTabs.innerHTML = '';
    const all = gallery();
    const counts = {};
    all.forEach(x => { counts[x.cat] = (counts[x.cat] || 0) + 1; });
    CATS.forEach(cat => {
      if (cat.id !== 'all' && cat.id !== 'photo' && !counts[cat.id]) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn cat-tab' + (cat.id === currentCat ? ' sel' : '');
      b.dataset.cat = cat.id;
      b.setAttribute('aria-label', cat.name);
      b.setAttribute('aria-pressed', cat.id === currentCat ? 'true' : 'false');
      b.innerHTML = catFace(cat, all);
      b.addEventListener('click', () => {
        if (currentCat === cat.id) return;
        Sound.click();
        currentCat = cat.id;
        catTabs.querySelectorAll('.cat-tab').forEach(t => {
          const on = t.dataset.cat === currentCat;
          t.classList.toggle('sel', on);
          t.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        buildPicGrid();
        // 已經捲到下面的話，回到縮圖牆的開頭（上面那列「我的作品」不用再看一次）
        if (pickScroll && pickScroll.scrollTop > picGrid.offsetTop) {
          pickScroll.scrollTop = Math.max(0, picGrid.offsetTop - 14);
        }
      });
      catTabs.appendChild(b);
    });
  }

  function buildPicGrid() {
    picGrid.innerHTML = '';
    // 索引一律用整份 gallery() 的位置：openPic()／進度存檔都認這個號碼，篩選不能動到它
    gallery().forEach((item, idx) => {
      if (currentCat !== 'all' && item.cat !== currentCat) return;
      const cell = document.createElement('div');
      cell.className = 'pic-cell';
      cell.dataset.key = picKey(item);   // 補「畫到一半」角標時用來對號入座

      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pic-thumb';
      b.setAttribute('aria-label', item.name);
      if (item.type === 'vector') {
        b.innerHTML = `<div class="thumb-svg">${item.svg}</div>`;
      } else {
        const im = document.createElement('img');
        im.loading = 'lazy';   // 五十幾張 1600px 的線稿，捲到了再載（要寫在 src 前面才算數）
        im.alt = '';
        im.src = item.dataUrl;
        b.appendChild(im);
      }
      b.addEventListener('click', () => { Sound.click(); openPic(idx); });
      cell.appendChild(b);

      /* 自訂照片：右上角一顆垃圾桶（內建線稿沒有）。要按住一秒才丟——
         它就疊在縮圖的角落，點縮圖時手指一偏就會碰到。 */
      if (item.type === 'raster' && !item.builtin) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn sm pic-del';
        del.setAttribute('aria-label', '丟掉這張照片（按住）');
        del.innerHTML = UI.icon('trash');
        UI.hold(del, 1000, () => {
          Sound.click();
          customPics = customPics.filter(p => p.id !== item.id);
          saveCustomPics();
          buildCatTabs();
          buildPicGrid();
        });
        cell.appendChild(del);
      }

      picGrid.appendChild(cell);
    });

    // 最後一格：用自己的照片（只放在會看照片的兩頁，別的種類看到相機格會誤導）
    if (currentCat !== 'all' && currentCat !== 'photo') { refreshWipBadges(); return; }
    const up = document.createElement('button');
    up.type = 'button';
    up.className = 'pic-thumb pic-upload';
    up.setAttribute('aria-label', '用自己的照片');
    up.innerHTML = '<span class="up-face">' + UI.icon('camera') +
      '<span class="up-plus">' + UI.icon('plus') + '</span></span>';
    up.addEventListener('click', () => { Sound.click(); fileInput.click(); });
    picGrid.appendChild(up);

    refreshWipBadges();
  }

  /* 「畫到一半」角標（右下角一支小畫筆）。buildPicGrid() 是同步的，開頁時 wipKeys 還是空的，
     等 IndexedDB 回來再呼叫一次補上角標——不為了角標把整個 buildPicGrid() 改成非同步。
     用 dataset 逐格比對而不是 querySelector：線稿名稱是中文，塞進屬性選擇器要跳脫。 */
  function refreshWipBadges() {
    picGrid.querySelectorAll('.pic-cell').forEach(cell => {
      const want = wipKeys.has(cell.dataset.key);
      const badge = cell.querySelector('.pic-wip');
      if (want && !badge) {
        const b = document.createElement('span');
        b.className = 'pic-wip';
        b.innerHTML = UI.icon('brush');
        cell.appendChild(b);
      } else if (!want && badge) {
        badge.remove();
      }
    });
  }

  /* 左上的「上一層」只有在有上一層的時候才出現：著色中（回選圖）、作品檢視與存圖提示（關掉）。 */
  function syncBack() {
    backBtn.hidden = gameScreen.hidden && artOverlay.hidden && saveOverlay.hidden;
  }

  function openPic(idx) {
    galleryIndex = idx;
    closePanels();
    // 先切畫面再建圖層：這樣 loadVector/loadRaster 裡的 sizeArt() 就量得到紙張尺寸。
    // （舊寫法用 requestAnimationFrame，分頁不可見時不會觸發，#artWrap 會卡在 0x0）
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    document.body.classList.add('playing');   // 回家／上一層浮到紙的左上角、小熊收起來（css/coloring.css）
    syncBack();
    changedSinceDone = true;
    showCurrent();
    sizeArt();
  }

  function backToSelect() {
    closePanels();
    doneOverlay.hidden = true;
    stopConfetti();
    gameScreen.hidden = true;
    selectScreen.hidden = false;
    document.body.classList.remove('playing');
    syncBack();
    buildPicGrid();   // 自訂照片可能增減，回來時重建
  }

  /* 上一層：由上往下一層一層關——存圖提示 → 作品檢視 → 著色中（完成畫面開著也一樣回選圖）。
     回選圖前立刻存一次（不等 debounce）：小孩常常按完就直接把 App 關掉。 */
  backBtn.addEventListener('click', () => {
    Sound.click();
    if (!saveOverlay.hidden) { saveOverlay.hidden = true; syncBack(); return; }
    if (!artOverlay.hidden) { closeArtwork(); return; }
    if (!gameScreen.hidden) { saveProgressNow(); backToSelect(); }
  });

  /* 綠色的「畫好了」：存進度、把這張收進「我的作品」、出現完成畫面（她畫的圖＋小熊＋彩帶）。
     完成畫面上兩個選擇：繼續畫這張（關掉完成畫面）、換一張（回選圖）。
     連按兩次、或按了「繼續畫」什麼都沒動又按一次，不會多收一張一模一樣的。 */
  doneBtn.addEventListener('click', async () => {
    if (doneBtn.disabled || doneBusy) return;
    const item = gallery()[galleryIndex];
    if (!item || !paintCanvas) return;
    doneBusy = true;
    Sound.click();
    closePanels();
    try {
      saveProgressNow();
      const w = paintCanvas.width;
      const h = paintCanvas.height;
      const dataUrl = await composeFinalImage(item);
      donePic.src = dataUrl;
      doneOverlay.hidden = false;
      Sound.win();
      launchConfetti();
      if (changedSinceDone) {
        changedSinceDone = false;
        await addArtwork(item, dataUrl, w, h);
      }
    } catch (err) {
      console.error('完成圖合成失敗', err);
    } finally {
      doneBusy = false;
    }
  });

  document.getElementById('keepBtn').addEventListener('click', () => {
    Sound.click();
    doneOverlay.hidden = true;
    stopConfetti();
  });

  document.getElementById('newPicBtn').addEventListener('click', () => {
    Sound.click();
    backToSelect();   // 進度在按「畫好了」的時候已經存過了
  });

  /* 彩帶（跟拼圖頁同一套：六個房間的顏色＋黃） */
  const confettiCanvas = document.getElementById('confettiCanvas');
  let confettiRun = 0;   // 每放一次加一號：離開完成畫面時加一號，還在飄的那一批就停下來

  function stopConfetti() {
    confettiRun++;
    if (confettiCanvas) confettiCanvas.getContext('2d').clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  function launchConfetti() {
    if (!confettiCanvas) return;
    const run = ++confettiRun;
    const cv = confettiCanvas;
    const g = cv.getContext('2d');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const colors = ['#FF5C5C', '#FFD84D', '#22C3B6', '#9A7BF5', '#FFA228', '#4AA8EE', '#FF7FB0'];
    const parts = [];
    for (let i = 0; i < 130; i++) {
      parts.push({
        x: Math.random() * cv.width,
        y: -20 - Math.random() * cv.height * 0.5,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        vy: 2 + Math.random() * 3.5,
        vx: (Math.random() - 0.5) * 2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    const start = performance.now();
    function frame(t) {
      if (run !== confettiRun) return;   // 已經離開完成畫面（stopConfetti 清過了）
      g.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.fillStyle = p.color;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      });
      if (t - start < 3500) {
        requestAnimationFrame(frame);
      } else {
        g.clearRect(0, 0, cv.width, cv.height);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ===== 顯示目前這張（依類型分流） ===== */
  function showCurrent() {
    const list = gallery();
    if (!list.length) return;
    galleryIndex = (galleryIndex + list.length) % list.length;
    const item = list[galleryIndex];
    artWrap.innerHTML = '';
    fillCanvas = fillCtx = rasterEdgeMask = null;
    edgeCanvas = edgeCtx = null;
    paintCanvas = ctx = null;   // 舊的 canvas 已經跟著 innerHTML 一起丟掉了
    hasContent = false;   // 新的一張，等進度還原回來再說（要先歸零，clearHistory 才算得對）
    clearHistory();       // 換圖就不能再復原上一張的筆畫

    if (item.type === 'vector') loadVector(item);
    else loadRaster(item);
  }

  /* ===== 內建線稿：三層疊放 =====
     1. art-base    真正的線稿，fill 模式在這層上色
     2. paintLayer  畫筆 / 潑墨畫的透明畫布
     3. art-outline art-base 的複本，蓋在最上面且不接收觸控，確保外框線永遠不會被塗蓋。
                    可上色區維持白色填色（不能改成 fill="none"）：線稿的分層是靠「後畫的白色
                    區塊蓋掉前面區塊的線」，拿掉填色會讓被遮住的線全部冒出來，看起來就跟
                    選圖縮圖不一樣。這層改用 mix-blend-mode: multiply 疊上去——白色乘算等於
                    不動，底下的塗鴉照樣看得到，只有深色線條會蓋上去。 */
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
    // 這裡刻意不動 .c 的填色，理由見上面的分層說明
    artWrap.appendChild(outlineSvg);

    // 線條一律由 outline 層負責：base 層再描一次會讓同一條線疊兩層、看起來比縮圖粗。
    // 線稿的描邊色都設在根 <svg> 上靠繼承，子元素只會自帶 stroke="none"，所以這樣改不會漏線。
    baseSvg.setAttribute('stroke', 'none');

    sizeArt();
    restoreProgress(item);   // 非同步，會比畫面晚一兩幀
  }

  /* ===== 上傳照片產生的畫稿：一樣三層，只是底層跟頂層改用 canvas =====
     0. edgeLayer  整張紙：填色圖層往兩側空白紙面的延伸（syncEdgeLayer 算出來的，不存檔）
     1. fillLayer  疊桶填色圖層
     2. paintLayer 畫筆 / 潑墨畫的透明畫布
     3. lineLayer  處理好的線條（透明底、只有黑線），不可更動，蓋在最上面 */
  function loadRaster(item) {
    const img = new Image();
    img.onload = () => {
      rasterEdgeMask = PhotoTool.maskFromStencil(img);

      edgeCanvas = document.createElement('canvas');
      edgeCanvas.id = 'edgeLayer';
      artWrap.appendChild(edgeCanvas);
      edgeCtx = edgeCanvas.getContext('2d');

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

      // 線條圖層跟著圖片的解析度走（內建場景是 1600，iPad 兩倍像素密度才不糊）；
      // CSS 尺寸還是 --sq，填色遮罩仍是 CANVAS_SIZE，兩者靠比例對位
      const lineCanvas = document.createElement('canvas');
      lineCanvas.id = 'lineLayer';
      lineCanvas.width = img.naturalWidth || CANVAS_SIZE;
      lineCanvas.height = img.naturalHeight || CANVAS_SIZE;
      lineCanvas.getContext('2d').drawImage(img, 0, 0);
      artWrap.appendChild(lineCanvas);

      sizeArt();
      syncEdgeLayer();   // sizeArt 在紙張尺寸沒變時會直接返回，這裡自己對齊一次
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
    syncEdgeLayer();   // 轉向後兩側紙面從左右換成上下，延伸要重算
    // fillLayer 永遠是 CANVAS_SIZE 正方（照片座標系），只有 CSS 尺寸跟著 --sq 變，
    // 點陣內容不受影響，所以不需要搬移。

    // 尺寸真的變了就清掉復原堆疊：舊快照的 ImageData 尺寸已經對不上了。
    // 畫的東西留著（上面剛等比重畫回去），只是不能再往回復原。
    if (sizeChanged) clearHistory();
  }

  /* 紙比正方線稿寬（橫向）或高（直向）時，兩側空白紙面不在填色圖層裡，
     填滿背景只會塗到正方範圍、兩邊一直留白。這裡把填色圖層最外圈那一排像素往外拉滿紙面：
     碰到正方邊緣的區域（背景、天空、草地）就一路延伸到紙邊，沒碰到邊的區域不受影響。
     內容完全由填色圖層推得，所以不用另外存檔或復原，填色圖層一變就重算一次。 */
  function syncEdgeLayer() {
    if (!edgeCanvas || !fillCanvas || !paintCanvas) return;
    const w = paintCanvas.width, h = paintCanvas.height;
    if (edgeCanvas.width !== w || edgeCanvas.height !== h) {
      edgeCanvas.width = w;   // 改尺寸會順便清空畫布
      edgeCanvas.height = h;
    } else {
      edgeCtx.clearRect(0, 0, w, h);
    }
    const sq = Math.min(w, h);
    const ox = Math.round((w - sq) / 2), oy = Math.round((h - sq) / 2);
    const S = CANVAS_SIZE;
    edgeCtx.imageSmoothingEnabled = false;   // 一排像素拉寬，不要跟隔壁色混出漸層
    if (ox > 0) {
      edgeCtx.drawImage(fillCanvas, 0, 0, 1, S, 0, oy, ox, sq);
      edgeCtx.drawImage(fillCanvas, S - 1, 0, 1, S, ox + sq, oy, w - ox - sq, sq);
    }
    if (oy > 0) {
      edgeCtx.drawImage(fillCanvas, 0, 0, S, 1, ox, 0, sq, oy);
      edgeCtx.drawImage(fillCanvas, 0, S - 1, S, 1, ox, oy + sq, sq, h - oy - sq);
    }
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
    /* 打開來看一眼、什麼都沒畫就按上一層：不存。存了縮圖上會多一個「畫到一半」的記號，其實是空白的。
       以前存過進度的（wipKeys 裡有）照存——她可能是把舊的全部擦掉，下次打開要是擦掉的樣子。 */
    if (!hasContent && !wipKeys.has(picKey(item))) return;
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
      if (im) { fillCtx.drawImage(im, 0, 0); syncEdgeLayer(); restored = true; }
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

  /* ===== 填滿工具（點一下整區上色） =====
     由 paintLayer 的 pointerdown 轉呼叫。paintLayer 永遠蓋在整張紙上、永遠吃觸控：
     以前填滿時把它設成 pointer-events:none 讓點擊穿到底下的 SVG，換工具再設回 auto，
     但 iPad Safari 常常沒跟著更新點擊判定，填滿過後畫筆／蓋章／橡皮擦全都點不到畫布。
     所以改成不切換，向量線稿自己用 elementsFromPoint 找出手指底下是哪一塊。 */
  function vectorRegionAt(x, y) {
    const base = artWrap.querySelector('svg.art-base');
    if (!base) return null;
    for (const el of document.elementsFromPoint(x, y)) {
      if (!base.contains(el)) continue;
      const region = el.closest('.c');
      if (region) return region;
    }
    return null;
  }

  function fillAt(e) {
    const item = gallery()[galleryIndex];
    if (!item) return;

    if (item.type === 'vector') {
      const region = vectorRegionAt(e.clientX, e.clientY);
      if (!region) return;
      pushHistory({ kind: 'fill', el: region, prev: region.getAttribute('fill') });
      region.setAttribute('fill',
        paint.type === 'color' ? paint.value : `url(#${paint.id})`);
      Sound.pop();
      markContent();
      scheduleSave();
      return;
    }

    if (item.type === 'raster' && fillCanvas && rasterEdgeMask) {
      /* fillCanvas 是置中的正方子區域，紙比它大。點到正方以外的紙面（橫向的左右、直向的上下）
         就當成點在最靠近的正方邊緣上：填到的若是碰邊的背景區，syncEdgeLayer 會把顏色延伸回點的那片紙面。
         夾在 0..CANVAS_SIZE-1 之內，floodFillMask 才不會拿到越界座標。 */
      const rect = fillCanvas.getBoundingClientRect();
      const clampPx = (v) => Math.max(0, Math.min(CANVAS_SIZE - 1, v));
      const px = clampPx(Math.floor((e.clientX - rect.left) / rect.width * CANVAS_SIZE));
      const py = clampPx(Math.floor((e.clientY - rect.top) / rect.height * CANVAS_SIZE));
      const filled = PhotoTool.floodFillMask(rasterEdgeMask, CANVAS_SIZE, CANVAS_SIZE, px, py);
      if (!filled) return; // 點到線條上，不處理
      /* 只存這次填到的範圍：applyFloodFill 會用 growIntoEdges 往線條方向膨脹 2px，
         所以外擴 2 就一定包得住真正被改的像素。算不出範圍（理論上不會）就退回整張。 */
      const ext = UndoRect.maskExtent(filled, CANVAS_SIZE, CANVAS_SIZE, 2);
      const box = ext || { x: 0, y: 0, w: CANVAS_SIZE, h: CANVAS_SIZE };
      pushHistory({
        kind: 'canvas', ctx: fillCtx, x: box.x, y: box.y,
        data: fillCtx.getImageData(box.x, box.y, box.w, box.h)
      });
      applyFloodFill(filled);
      Sound.pop();
      markContent();
      scheduleSave();
    }
  }

  // 把目前選的顏色/花紋蓋到這次疊桶填色算出來的範圍裡
  function applyFloodFill(filledMask) {
    /* 白縫成因：填色遮罩是把線稿 PNG 縮到 CANVAS_SIZE(800) 判斷 alpha 算出來的
       （PhotoTool.maskFromStencil），縮圖時線的抗鋸齒半透明邊緣被判成「不是線」而納入
       可填區；但顯示時線條圖層是疊在填色圖層最上面的原尺寸（1600/2048）PNG，它的抗鋸齒邊
       只蓋住部分像素，填色沒蓋到的地方就露出畫布底色，看起來像線條內側一圈白縫。
       解法：填色範圍只往線條像素方向膨脹 2px，讓填色被上層線條蓋住而不外溢到隔壁區域。 */
    const mask = rasterEdgeMask ? PhotoTool.growIntoEdges(filledMask, rasterEdgeMask, CANVAS_SIZE, CANVAS_SIZE, 2) : filledMask;

    const tmp = document.createElement('canvas');
    tmp.width = CANVAS_SIZE;
    tmp.height = CANVAS_SIZE;
    const tctx = tmp.getContext('2d');
    tctx.fillStyle = paintStyle();
    tctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const imgData = tctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i]) imgData.data[i * 4 + 3] = 0; // 範圍外設成透明
    }
    tctx.putImageData(imgData, 0, 0);

    fillCtx.drawImage(tmp, 0, 0);
    syncEdgeLayer();
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

  /* ===== 蓋章 =====
     一顆印章的邊長跟紙張短邊成比例，另外給一點隨機大小與角度，
     連續蓋出來才不會像複製貼上。座標系換算成 0..100 之後交給 STAMPS 的 draw()。 */
  function stampSide() {
    return Math.min(paintCanvas.width, paintCanvas.height) * stampScale();
  }

  function stampAt(pos) {
    const st = currentStamp();
    if (!st) return;
    /* 影響範圍：邊長最大 1.12 倍，旋轉後的對角線一半是 side*0.707，
       1.12*0.707 ≈ 0.79，取 0.85 再加 2px 抗鋸齒餘裕（寧可大一點也不能漏） */
    if (strokeAcc) UndoRect.addCircle(strokeAcc, pos.x, pos.y, stampSide() * 0.85 + 2);
    const side = stampSide() * (0.88 + Math.random() * 0.24);
    const rot = (Math.random() - 0.5) * 0.6;   // ±17 度左右
    const main = stampMain(side);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(rot);
    ctx.scale(side / 100, side / 100);
    ctx.translate(-50, -50);
    st.draw(ctx, main, STAMP_ACCENT);
    ctx.restore();
  }

  /* 花紋顏料要反向縮放：pattern 是照「當下的 transform」貼的，
     不補回去的話一顆印章裡只會出現一格花紋，看起來像一團色塊 */
  function stampMain(side) {
    const style = paintStyle();
    if (paint.type === 'pattern' && style && typeof style.setTransform === 'function') {
      try { style.setTransform(new DOMMatrix().scale(100 / side)); } catch (e) { /* 舊瀏覽器就算了 */ }
    }
    return style;
  }

  function bindPaintEvents() {
    let drawing = false;
    let last = null;
    let sprayTimer = null;

    paintCanvas.addEventListener('pointerdown', (e) => {
      if (swallowStroke) return;   // 這一下是用來關面板的
      e.preventDefault();
      // 橡皮擦是獨立工具，不做「整區填白」
      if (mode === 'fill' && !eraser) { fillAt(e); return; }
      paintCanvas.setPointerCapture(e.pointerId);
      drawing = true;
      last = canvasPos(e);

      // 一筆＝一次復原：下筆前把現況拷到離屏 canvas，收筆時只留真正動到的那塊矩形
      beginStroke();

      const tool = currentTool();
      ctx.globalCompositeOperation = isEraser() ? 'destination-out' : 'source-over';
      // 水彩用半透明疊出來（橡皮擦強制不透明，才擦得乾淨）
      ctx.globalAlpha = (!isEraser() && tool.alpha) ? tool.alpha : 1;

      /* 橡皮擦自成一支工具：一律圓頭筆觸、用自己的粗細，
         完全不理目前選的是填滿／潑墨／蓋章／哪支筆 */
      if (isEraser()) {
        drawSegment(last, last);
      } else if (mode === 'stamp') {
        stampAt(last);
        Sound.pop();
      } else if (mode === 'spray') {
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
      if (isEraser()) {
        drawSegment(last, pos);
        last = pos;
        return;
      }
      if (mode === 'stamp') {
        const d = Math.hypot(pos.x - last.x, pos.y - last.y);
        if (d < stampSide() * 0.95) return;   // 還沒離開上一顆，先不蓋
        stampAt(pos);
        last = pos;
        return;
      }
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
      // 一定要在 sprayTimer 清掉之後才收矩形，否則最後一滴墨會落在矩形外面
      if (wasDrawing) { commitStroke(); markContent(); scheduleSave(); }
    };
    paintCanvas.addEventListener('pointerup', stop);
    paintCanvas.addEventListener('pointercancel', stop);
  }

  function drawSegment(from, to) {
    // 擦除時不能用花紋當 strokeStyle：pattern 有透明的格子，會擦得坑坑洞洞
    ctx.strokeStyle = isEraser() ? '#000' : paintStyle();
    ctx.lineWidth = currentLineWidth();
    // 圓頭線段的影響範圍＝兩端各一個半徑 lineWidth/2 的圓（+1 給抗鋸齒）
    if (strokeAcc) UndoRect.addSegment(strokeAcc, from, to, ctx.lineWidth / 2 + 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  /* 亮粉筆：在這一段線上灑白色／淡黃小點。
     散開的範圍、顆粒大小、顆數都跟著筆的粗細走（k = 粗細倍率，中號是 1）：
     以前固定散 ±12、半徑 1.5~3，超細筆的閃粉比線本身還寬，粗筆又稀稀落落 */
  function sprinkleGlitter(from, to) {
    const width = currentLineWidth();
    const k = brushScale();
    const spread = width * 0.92;                 // 中號 26 → 24，跟舊版一樣
    const rMin = Math.max(0.5, 1.5 * k);
    const rMax = Math.max(0.8, 3 * k);
    // 影響範圍：偏移最多 spread/2、半徑最大 rMax，再加 1px 抗鋸齒
    if (strokeAcc) UndoRect.addSegment(strokeAcc, from, to, spread / 2 + rMax + 1);
    const saveAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 1;
    // 顆數用 sqrt(k)：粗筆多灑幾顆但不會一片白，細筆至少還有 1 顆
    const n = Math.max(1, Math.round((3 + Math.random() * 3) * Math.sqrt(k)));
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * spread;
      const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * spread;
      ctx.fillStyle = Math.random() < 0.5 ? '#fff' : '#fff9c4';
      ctx.beginPath();
      ctx.arc(x, y, rMin + Math.random() * (rMax - rMin), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = saveAlpha;
  }

  // 潑墨：一團大小不一的墨點，first=true 時多加幾滴大的
  function splat(pos, first) {
    // 影響範圍：墨點距離最遠 60、半徑最大 7（first 的大滴是 25+18=43）→ 半徑 70 包得住
    if (strokeAcc) UndoRect.addCircle(strokeAcc, pos.x, pos.y, 70);
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
      currentCat = 'photo';   // 不切的話新照片會被目前的分類篩掉，回選圖畫面找不到
      buildCatTabs();
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
      // 外框層跟畫面上一樣走 multiply（白色填色不遮塗鴉，只留深色線條）
      c.globalCompositeOperation = 'multiply';
      c.drawImage(outlineImg, ox, oy, sq, sq);
      c.globalCompositeOperation = 'source-over';
    } else {
      const lineCanvas = artWrap.querySelector('#lineLayer');
      if (edgeCanvas) c.drawImage(edgeCanvas, 0, 0);   // 跟 paintLayer 同解析度，原點貼上
      c.drawImage(fillCanvas, ox, oy, sq, sq);
      c.drawImage(paintCanvas, 0, 0);
      c.drawImage(lineCanvas, ox, oy, sq, sq);
    }
    return canvas.toDataURL('image/png');
  }

  /* 存到裝置：iPad 上優先用系統分享（可以直接儲存到相簿），
     不支援才顯示長按存檔畫面。只有作品檢視的「存到相簿」會走到這裡——
     著色畫面上不再有存圖鈕（綠色的「畫好了」會把圖收進我的作品）。 */
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
    syncBack();   // 存圖提示用左上的「上一層」關掉
  }

  /* ===== 我的作品：存進 IndexedDB 的完成作品，選圖畫面上方一列縮圖 ===== */
  const artOverlay = document.getElementById('artOverlay');
  const artImg = document.getElementById('artImg');
  const artActions = document.getElementById('artActions');
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
    /* 存之前先看儲存空間還剩多少。為什麼要提早汰舊：一張作品的 PNG 動輒
       數百 KB，等到配額真的滿了才處理，那次 put 已經失敗了——小孩按下「畫好了」
       卻什麼都沒收到。用量超過八成就先把最舊的清掉一些，留出餘裕再存。
       estimate() 拿不到（回 null）就當作不知道，什麼都不做，維持原本行為。 */
    return KidsStore.estimate().then(est => {
      if (!est || !est.quota || !(est.usage / est.quota > 0.8)) return;
      const keep = Math.max(1, ARTWORK_MAX - 5);
      return KidsStore.all('artworks').then(list => Promise.all(
        sortArtworks(list).slice(keep).map(a => KidsStore.del('artworks', a.id))
      ));
    }).then(() => KidsStore.put('artworks', {
      name: item.name, png: dataUrl, w, h, createdAt: Date.now()
    })).then(() => KidsStore.all('artworks')).then(list => {
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
      b.type = 'button';
      b.className = 'artwork-thumb';
      b.setAttribute('aria-label', a.name || '我的作品');
      const im = document.createElement('img');
      im.src = a.png;
      im.alt = '';
      b.appendChild(im);
      b.addEventListener('click', () => { Sound.click(); openArtwork(a); });
      artworkRow.appendChild(b);
    });
  }

  // 丟掉的第二步（「真的要丟掉嗎」＋✗／✓）開或關；開的時候原本那兩顆先收起來
  function showArtConfirm(on) {
    artConfirm.hidden = !on;
    artActions.hidden = on;
  }

  function openArtwork(a) {
    viewingArt = a;
    artImg.src = a.png;
    showArtConfirm(false);   // 每次打開都收起刪除確認
    artOverlay.hidden = false;
    syncBack();              // 用左上的「上一層」關掉
  }

  function closeArtwork() {
    artOverlay.hidden = true;
    showArtConfirm(false);
    viewingArt = null;
    syncBack();
  }

  document.getElementById('artSaveBtn').addEventListener('click', () => {
    Sound.click();
    if (viewingArt) shareOrSaveImage(viewingArt.png, viewingArt.name || '我的作品');
  });

  /* 丟掉要按兩次：5 歲小孩會亂按。第一下（垃圾桶）只是問「真的要丟掉嗎」——
     字有注音，而且唸出來給她聽（她讀得慢）；✗ 是不要、✓ 才真的丟。 */
  const DEL_LINE = '真ㄓㄣ 的˙ㄉㄜ 要ㄧㄠˋ 丟ㄉㄧㄡ 掉ㄉㄧㄠˋ 嗎˙ㄇㄚ';
  document.getElementById('artDelBtn').addEventListener('click', () => {
    Sound.click();
    showArtConfirm(true);
    UI.say(UI.plain(DEL_LINE));
  });

  document.getElementById('artDelNo').addEventListener('click', () => {
    Sound.click();
    showArtConfirm(false);
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

  /* iPad 上小孩常常直接切走或關掉 App，切到背景時立刻存一次不等 debounce */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveProgressNow();
  });

  /* ===== 起始 ===== */
  buildToolPanel();
  buildSwatches();
  buildColorPanel();
  buildStampPanel();
  buildEraserSizeRow();
  markPaintSelection();
  syncActiveTool();
  buildCatTabs();
  buildPicGrid();
  updateButtons();

  // 開頁讀一次：哪幾張畫到一半（補角標）、有哪些完成的作品
  KidsStore.all('progress').then(list => {
    wipKeys = new Set(list.map(r => r.key));
    refreshWipBadges();
  });
  loadArtworks();
})();
