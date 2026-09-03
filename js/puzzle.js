/* 拼圖遊戲 */
(() => {
  const selectScreen = document.getElementById('selectScreen');
  const gameScreen = document.getElementById('gameScreen');
  const board = document.getElementById('board');
  const picGrid = document.getElementById('picGrid');
  const winOverlay = document.getElementById('winOverlay');
  const backBtn = document.getElementById('backBtn');

  let gridN = 2;           // 難度：每邊幾片
  let currentPic = null;   // 目前的圖
  let lockedCount = 0;
  let totalPieces = 0;
  let startSeq = 0;        // 開局序號：圖片載入是非同步的，回來時要確認自己還是最新那一局

  /* 圖片先載入完成才能畫進 canvas。
     為什麼要快取：切難度會重開同一張圖，每次重新解碼 SVG 會讓小孩看到閃一下。
     為什麼指定 1200×1200：這些圖是只有 viewBox、沒有 width/height 的 SVG，
     Safari 對「沒有內建尺寸」的 SVG 做 drawImage 會畫不出來；
     在 Image 建構時給定尺寸就等於給它內建尺寸，順便拿到夠高的解析度來縮。 */
  const imgCache = new Map();
  function loadPicture(src) {
    if (imgCache.has(src)) return Promise.resolve(imgCache.get(src));
    return new Promise((resolve, reject) => {
      const img = new Image(1200, 1200);
      img.onload = () => { imgCache.set(src, img); resolve(img); };
      img.onerror = () => reject(new Error('圖片載入失敗：' + src));
      img.src = src;
    });
  }

  /* --- 難度切換 --- */
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Sound.click();
      gridN = parseInt(btn.dataset.n, 10);
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // 遊戲中切難度就用同一張圖重開
      if (!gameScreen.hidden && currentPic) startGame(currentPic);
    });
  });

  /* --- 選圖畫面 --- */
  PICTURES.forEach(pic => {
    const btn = document.createElement('button');
    btn.className = 'pic-thumb';
    btn.innerHTML = `<img src="${pic.src}" alt="${pic.name}">`;
    btn.addEventListener('click', () => { Sound.click(); startGame(pic); });
    picGrid.appendChild(btn);
  });

  backBtn.addEventListener('click', () => { Sound.click(); showSelect(); });
  document.getElementById('againBtn').addEventListener('click', () => {
    Sound.click(); winOverlay.hidden = true; startGame(currentPic);
  });
  document.getElementById('newPicBtn').addEventListener('click', () => {
    Sound.click(); winOverlay.hidden = true; showSelect();
  });

  function showSelect() {
    gameScreen.hidden = true;
    selectScreen.hidden = false;
    backBtn.hidden = true;
    clearPieces();
  }

  function clearPieces() {
    gameScreen.querySelectorAll('.piece').forEach(p => p.remove());
    board.innerHTML = '';
  }

  /* --- 開始遊戲 --- */
  function startGame(pic) {
    currentPic = pic;
    selectScreen.hidden = true;
    gameScreen.hidden = false;
    backBtn.hidden = false;
    clearPieces();
    lockedCount = 0;
    totalPieces = gridN * gridN;

    // 這一局的序號。載入回來時若已經不是最新的一局（小孩連按了難度或換圖），
    // 就整個放棄，不然會把上一局的拼片畫進新的一局。
    const seq = ++startSeq;
    loadPicture(pic.src).then((img) => {
      if (seq === startSeq) buildBoard(pic, img);
    }).catch(() => { /* 圖載不進來就維持空板，不要丟例外嚇到使用者 */ });
  }

  function buildBoard(pic, img) {
    const TAB = PuzzleGeom.TAB;
    const areaW = gameScreen.clientWidth;
    const areaH = gameScreen.clientHeight;

    // 拼圖板尺寸：留下方空間放拼圖片
    const side = Math.floor(Math.min(areaW * 0.92, areaH * 0.58));
    const boardX = Math.floor((areaW - side) / 2);
    const boardY = 10;

    board.style.left = boardX + 'px';
    board.style.top = boardY + 'px';
    board.style.width = side + 'px';
    board.style.height = side + 'px';

    // 半透明底圖提示
    const ghost = document.createElement('img');
    ghost.className = 'ghost';
    ghost.src = pic.src;
    board.appendChild(ghost);

    const pieceSize = side / gridN;
    const margin = pieceSize * TAB;                 // 榫頭凸出去要占的邊距
    const ink = Math.max(3, pieceSize * 0.03);      // 墨線寬度
    /* 墨線是畫在路徑正中央的，凸榫的尖端剛好貼在 margin 的邊界上，
       不多留半條線寬就會被 canvas 邊界切掉一小片，看起來像削平的榫頭。 */
    const pad = Math.ceil(ink);
    const elemSize = pieceSize * (1 + 2 * TAB) + 2 * pad;

    // 格線改用「不畫」：榫頭是曲線，方格虛線跟拼片外形對不起來，反而誤導。
    // 放置提示靠 #board .ghost 那張半透明底圖。

    const dpr = window.devicePixelRatio || 1;
    const edges = PuzzleGeom.edgeMap(gridN, Math.random);

    // 產生拼圖片，隨機散在下方
    const trayTop = boardY + side + 14;
    const trayH = Math.max(areaH - trayTop - 10, elemSize + 10);

    for (let r = 0; r < gridN; r++) {
      for (let c = 0; c < gridN; c++) {
        const piece = document.createElement('canvas');
        piece.className = 'piece';
        // CSS 尺寸維持邏輯像素，實際像素乘 dpr，Retina 上的墨線才不會糊
        piece.width = Math.round(elemSize * dpr);
        piece.height = Math.round(elemSize * dpr);
        piece.style.width = elemSize + 'px';
        piece.style.height = elemSize + 'px';

        const g = piece.getContext('2d');
        g.scale(dpr, dpr);
        g.translate(pad, pad);   // 之後所有幾何都以「含邊距的拼片框」為原點

        const e = PuzzleGeom.edgesOf(edges, gridN, r, c);

        // 先用外形當裁切遮罩貼圖，再用同一條路徑描墨線
        g.save();
        PuzzleGeom.tracePiece(g, pieceSize, e, TAB);
        g.clip();
        // 整張圖照這一片的位置偏移畫入：圖上的 (c*pieceSize, r*pieceSize)
        // 要落在拼片框內側的左上角 (margin, margin)
        g.drawImage(img, margin - c * pieceSize, margin - r * pieceSize, side, side);
        g.restore();

        PuzzleGeom.tracePiece(g, pieceSize, e, TAB);
        g.lineWidth = ink;
        g.strokeStyle = '#2b2b2b';
        g.lineJoin = 'round';
        g.stroke();

        // 正確位置（相對 gameScreen）：canvas 元素的左上角＝格位置再減去邊距與留白
        piece.dataset.tx = boardX + c * pieceSize - margin - pad;
        piece.dataset.ty = boardY + r * pieceSize - margin - pad;

        const x = Math.random() * Math.max(areaW - elemSize - 20, 1) + 10;
        const y = trayTop + Math.random() * Math.max(trayH - elemSize, 1);
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';

        enableDrag(piece, elemSize, pieceSize);
        gameScreen.appendChild(piece);
      }
    }
  }

  /* --- 拖曳 --- */
  function enableDrag(piece, elemSize, pieceSize) {
    let offsetX = 0, offsetY = 0;

    piece.addEventListener('pointerdown', (e) => {
      if (piece.classList.contains('locked')) return;
      e.preventDefault();
      piece.setPointerCapture(e.pointerId);
      piece.classList.add('dragging');
      const rect = piece.getBoundingClientRect();
      const areaRect = gameScreen.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      const move = (ev) => {
        let x = ev.clientX - areaRect.left - offsetX;
        let y = ev.clientY - areaRect.top - offsetY;
        // 夾限用含邊距的元素尺寸算，拼片才不會有一半被拖出畫面外抓不回來
        x = Math.max(-elemSize * 0.3, Math.min(x, areaRect.width - elemSize * 0.7));
        y = Math.max(-elemSize * 0.3, Math.min(y, areaRect.height - elemSize * 0.7));
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';
      };

      const up = () => {
        piece.classList.remove('dragging');
        piece.removeEventListener('pointermove', move);
        piece.removeEventListener('pointerup', up);
        piece.removeEventListener('pointercancel', up);
        trySnap(piece, pieceSize);
      };

      piece.addEventListener('pointermove', move);
      piece.addEventListener('pointerup', up);
      piece.addEventListener('pointercancel', up);
    });
  }

  /* --- 吸附判定：範圍放大，遷就小小手指 --- */
  function trySnap(piece, pieceSize) {
    const tx = parseFloat(piece.dataset.tx);
    const ty = parseFloat(piece.dataset.ty);
    const x = parseFloat(piece.style.left);
    const y = parseFloat(piece.style.top);
    // 吸附半徑隨難度放大：片數愈多、每片愈小，放準愈難
    const threshold = pieceSize * PuzzleGeom.snapFraction(gridN);

    if (Math.abs(x - tx) < threshold && Math.abs(y - ty) < threshold) {
      piece.style.left = tx + 'px';
      piece.style.top = ty + 'px';
      piece.classList.add('locked');
      Sound.snap();
      lockedCount++;
      if (lockedCount === totalPieces) setTimeout(win, 350);
    }
  }

  /* --- 過關 --- */
  function win() {
    Sound.win();
    launchConfetti();
    winOverlay.hidden = false;
    // 拼完唸一次這張圖的英文名。等 600ms 是為了讓過關音效先響完——
    // 音效與語音同時出來會互相蓋住，小孩兩個都聽不清楚。
    if (currentPic && currentPic.word && window.Speech) {
      setTimeout(() => Speech.say(currentPic.word), 600);
    }
  }

  /* --- 彩帶 --- */
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');

  function launchConfetti() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#A78BFA', '#7BE495', '#5DADE2', '#FF8FA3']; // 貼紙書主色
    const parts = [];
    for (let i = 0; i < 130; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        // 貼紙書風格：每片碎紙都描一圈墨線
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2b2b2b';
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (t - start < 3500) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(frame);
  }
})();
