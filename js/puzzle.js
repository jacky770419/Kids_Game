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

    // 格線
    for (let r = 0; r < gridN; r++) {
      for (let c = 0; c < gridN; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.left = (c * pieceSize) + 'px';
        cell.style.top = (r * pieceSize) + 'px';
        cell.style.width = pieceSize + 'px';
        cell.style.height = pieceSize + 'px';
        board.appendChild(cell);
      }
    }

    // 產生拼圖片，隨機散在下方
    const trayTop = boardY + side + 14;
    const trayH = Math.max(areaH - trayTop - 10, pieceSize + 10);

    for (let r = 0; r < gridN; r++) {
      for (let c = 0; c < gridN; c++) {
        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.style.width = pieceSize + 'px';
        piece.style.height = pieceSize + 'px';
        piece.style.backgroundImage = `url("${pic.src}")`;
        piece.style.backgroundSize = `${side}px ${side}px`;
        piece.style.backgroundPosition = `${-c * pieceSize}px ${-r * pieceSize}px`;

        // 正確位置（相對 gameScreen）
        piece.dataset.tx = boardX + c * pieceSize;
        piece.dataset.ty = boardY + r * pieceSize;

        const x = Math.random() * Math.max(areaW - pieceSize - 20, 1) + 10;
        const y = trayTop + Math.random() * Math.max(trayH - pieceSize, 1);
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';

        enableDrag(piece, pieceSize);
        gameScreen.appendChild(piece);
      }
    }
  }

  /* --- 拖曳 --- */
  function enableDrag(piece, pieceSize) {
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
        x = Math.max(-pieceSize * 0.3, Math.min(x, areaRect.width - pieceSize * 0.7));
        y = Math.max(-pieceSize * 0.3, Math.min(y, areaRect.height - pieceSize * 0.7));
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
    const threshold = pieceSize * 0.42;

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
