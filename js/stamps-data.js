/* 印章圖案：蓋章工具用的圖形。
   每個圖案都畫在 100x100 的座標系裡，呼叫端會先做好平移／縮放／旋轉，
   圖案本身只要照 0..100 畫就好。
   draw(ctx, main, accent)：main 是目前的顏料（可能是 CanvasPattern），
   accent 是點綴用的亮色（花心、眼睛、皇冠寶石）。橡皮擦模式下顏色不影響結果。 */
(() => {
  const P = (d) => new Path2D(d);

  function dot(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function oval(ctx, x, y, rx, ry, rotDeg) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (rotDeg || 0) * Math.PI / 180, 0, Math.PI * 2);
    ctx.fill();
  }

  // 五角星：外半徑 48、內半徑 19.2，從正上方開始
  const STAR = P('M50 2 L61.3 34.5 L95.7 35.2 L68.3 55.9 L78.2 88.8 L50 69.2 '
               + 'L21.8 88.8 L31.7 55.9 L4.3 35.2 L38.7 34.5 Z');
  const HEART = P('M50 90 C18 66 5 51 5 34 C5 19 17 9 30 9 C39 9 46 14 50 21 '
                + 'C54 14 61 9 70 9 C83 9 95 19 95 34 C95 51 82 66 50 90 Z');
  // 彎月：外緣走大圓（半徑 44）繞左邊一大圈，內緣走偏右小圓（半徑 40）切回來。
  // 兩個端點是這兩個圓的交點，換成 even-odd 兩圓相減會在右側多出一塊月牙外的殘料。
  const MOON = P('M60.6 7.3 A44 44 0 1 0 76.8 84.9 A40 40 0 0 1 60.6 7.3 Z');
  const DROP = P('M50 5 C50 5 85 45 85 62 A35 35 0 0 1 15 62 C15 45 50 5 50 5 Z');
  const SPARK = P('M50 3 C56 33 67 44 97 50 C67 56 56 67 50 97 C44 67 33 56 3 50 '
                + 'C33 44 44 33 50 3 Z');
  const CROWN = P('M9 78 L9 26 L29 45 L50 15 L71 45 L91 26 L91 78 Z');
  const TAIL = P('M74 50 L98 27 L98 73 Z');

  window.STAMPS = [
    {
      id: 'star', name: '星星',
      draw(ctx, main) { ctx.fillStyle = main; ctx.fill(STAR); }
    },
    {
      id: 'heart', name: '愛心',
      draw(ctx, main) { ctx.fillStyle = main; ctx.fill(HEART); }
    },
    {
      id: 'flower', name: '小花',
      draw(ctx, main, accent) {
        ctx.fillStyle = main;
        for (let i = 0; i < 5; i++) {
          const a = (-90 + i * 72) * Math.PI / 180;
          dot(ctx, 50 + Math.cos(a) * 27, 50 + Math.sin(a) * 27, 19);
        }
        ctx.fillStyle = accent;
        dot(ctx, 50, 50, 13);
      }
    },
    {
      id: 'butterfly', name: '蝴蝶',
      draw(ctx, main, accent) {
        ctx.fillStyle = main;
        oval(ctx, 31, 36, 21, 25, -25);           // 上翅
        oval(ctx, 69, 36, 21, 25, 25);
        oval(ctx, 36, 72, 15, 17, 15);            // 下翅
        oval(ctx, 64, 72, 15, 17, -15);
        ctx.strokeStyle = main;                   // 觸角
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(47, 20); ctx.quadraticCurveTo(38, 8, 30, 6);
        ctx.moveTo(53, 20); ctx.quadraticCurveTo(62, 8, 70, 6);
        ctx.stroke();
        ctx.fillStyle = accent;                   // 身體：亮色才分得出左右翅
        oval(ctx, 50, 54, 6, 28, 0);
        dot(ctx, 50, 22, 7);
      }
    },
    {
      id: 'sun', name: '太陽',
      draw(ctx, main) {
        ctx.fillStyle = main;
        for (let i = 0; i < 8; i++) {          // 8 道三角形光芒
          const a = i * Math.PI / 4;
          const w = 0.16;
          ctx.beginPath();
          ctx.moveTo(50 + Math.cos(a) * 49, 50 + Math.sin(a) * 49);
          ctx.lineTo(50 + Math.cos(a - w) * 30, 50 + Math.sin(a - w) * 30);
          ctx.lineTo(50 + Math.cos(a + w) * 30, 50 + Math.sin(a + w) * 30);
          ctx.closePath();
          ctx.fill();
        }
        dot(ctx, 50, 50, 31);
      }
    },
    {
      id: 'cloud', name: '雲朵',
      draw(ctx, main) {
        ctx.fillStyle = main;
        dot(ctx, 30, 55, 18);
        dot(ctx, 50, 44, 23);
        dot(ctx, 68, 54, 17);
        oval(ctx, 50, 58, 26, 14, 0);
      }
    },
    {
      id: 'moon', name: '月亮',
      draw(ctx, main) { ctx.fillStyle = main; ctx.fill(MOON); }
    },
    {
      id: 'paw', name: '腳印',
      draw(ctx, main) {
        ctx.fillStyle = main;
        oval(ctx, 50, 74, 24, 18, 0);
        dot(ctx, 21, 45, 9.5);
        dot(ctx, 38, 27, 10);
        dot(ctx, 62, 27, 10);
        dot(ctx, 79, 45, 9.5);
      }
    },
    {
      id: 'crown', name: '皇冠',
      draw(ctx, main, accent) {
        ctx.fillStyle = main;
        ctx.fill(CROWN);
        ctx.fillStyle = accent;      // 寶石要畫在冠身上，畫在尖端會落在圖外
        dot(ctx, 26, 62, 6.5);
        dot(ctx, 50, 60, 7.5);
        dot(ctx, 74, 62, 6.5);
      }
    },
    {
      id: 'fish', name: '小魚',
      draw(ctx, main, accent) {
        ctx.fillStyle = main;
        oval(ctx, 44, 50, 33, 23, 0);
        ctx.fill(TAIL);
        ctx.fillStyle = accent;
        dot(ctx, 28, 43, 6);
      }
    },
    {
      id: 'drop', name: '水滴',
      draw(ctx, main, accent) {
        ctx.fillStyle = main;
        ctx.fill(DROP);
        ctx.fillStyle = accent;
        dot(ctx, 38, 62, 7);
      }
    },
    {
      id: 'sparkle', name: '閃亮',
      draw(ctx, main) { ctx.fillStyle = main; ctx.fill(SPARK); }
    }
  ];
})();
