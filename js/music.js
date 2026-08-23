/* 背景音樂：輪流播放 assets/music/ 底下三首 MP3。
   純靜態、離線可播，不需要建置流程。

   曲目與授權：
   - Children's March Theme — Cleyton Kauffman，CC0（公眾領域貢獻）
   - Fluffing a Duck — Kevin MacLeod (incompetech.com)，CC BY 4.0
   - Monkeys Spinning Monkeys — Kevin MacLeod (incompetech.com)，CC BY 4.0
   完整標註（含作者連結與授權條款網址）寫在 assets/CREDITS.md。

   音樂不是必要功能：檔案載不到就安靜，不做合成備援。 */
const Music = (() => {
  const STORAGE_KEY = 'kidsMusicOn';    // '0' 表示關，其他（含沒存過）都視為開
  const TRACK_KEY = 'kidsMusicTrack';   // 目前播到第幾首（TRACKS 的索引）
  const POS_KEY = 'kidsMusicPos';       // 目前這首播到第幾秒，換頁時接著播

  const TRACKS = [
    'assets/music/childrens-march.mp3',
    'assets/music/fluffing-a-duck.mp3',
    'assets/music/monkeys-spinning-monkeys.mp3'
  ];

  let audio = null;
  let playing = false;
  let index = 0;
  let failCount = 0;      // 連續載入失敗的首數，三首都失敗就徹底放棄
  let lastSaved = -99;    // 上次寫入 POS_KEY 時的秒數，用來節流
  let retryPending = false;

  function getNum(key, fallback) {
    try {
      const v = parseFloat(localStorage.getItem(key));
      return isFinite(v) ? v : fallback;
    } catch (e) { return fallback; }
  }

  function setItem(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) { /* 存不了就算了，不影響播放 */ }
  }

  // 記住「第幾首、第幾秒」，讓 index → puzzle → coloring 換頁時不會從頭播
  function savePos(force) {
    if (!audio) return;
    const t = audio.currentTime;
    if (!force && Math.abs(t - lastSaved) < 2) return; // 節流：每 2 秒才寫一次
    lastSaved = t;
    setItem(TRACK_KEY, index);
    setItem(POS_KEY, t);
  }

  // 換下一首（循環），一律從頭播
  function next() {
    index = (index + 1) % TRACKS.length;
    setItem(TRACK_KEY, index);
    setItem(POS_KEY, 0);
    lastSaved = 0;
    if (!audio) return;
    audio.src = TRACKS[index];
    try { audio.currentTime = 0; } catch (e) { /* 換 src 後還沒 load 好，忽略 */ }
    if (playing) start(0, true);
  }

  function el() {
    if (audio) return audio;
    index = Math.min(TRACKS.length - 1, Math.max(0, Math.round(getNum(TRACK_KEY, 0))));
    audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.5;
    audio.loop = false;
    audio.src = TRACKS[index];

    audio.addEventListener('ended', () => { failCount = 0; next(); });

    audio.addEventListener('error', () => {
      failCount++;
      if (failCount >= TRACKS.length) { playing = false; return; } // 三首都載不到就安靜收工
      next();
    });

    audio.addEventListener('timeupdate', () => { failCount = 0; savePos(false); });

    return audio;
  }

  // 真正呼叫 play()。iOS 沒解鎖時 Promise 會被拒絕，吞掉錯誤並等下一次使用者互動再試
  function start(seekTo, skipSeek) {
    const a = el();
    if (!skipSeek && typeof seekTo === 'number' && seekTo > 0) {
      try { a.currentTime = seekTo; } catch (e) { /* metadata 還沒好就算了，從頭播 */ }
    }
    const p = a.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        playing = false;
        armRetry();
      });
    }
  }

  // iOS 要求出聲必須發生在使用者手勢裡。第一次被擋下來時，掛一個一次性的
  // pointerdown，讓下一次觸控自動再試（不 stopPropagation，不影響其他頁面邏輯）
  function armRetry() {
    if (retryPending || !isOn()) return;
    retryPending = true;
    const again = () => {
      retryPending = false;
      if (isOn() && !playing) play();
    };
    document.addEventListener('pointerdown', again, { once: true });
  }

  function play() {
    if (playing) return;
    playing = true;
    failCount = 0;
    const a = el();
    // 同一首才接著播；換過首就從頭
    const savedTrack = Math.round(getNum(TRACK_KEY, 0));
    const pos = savedTrack === index ? getNum(POS_KEY, 0) : 0;
    lastSaved = pos;
    start(pos, false);
    setItem(STORAGE_KEY, '1');
    return a;
  }

  function stop() {
    playing = false;
    if (audio) {
      savePos(true);
      audio.pause(); // 只暫停，保留播放位置
    }
    setItem(STORAGE_KEY, '0');
  }

  function toggle() {
    if (playing) stop(); else play();
  }

  function isOn() {
    try { return localStorage.getItem(STORAGE_KEY) !== '0'; } catch (e) { return true; }
  }

  // 偏好是「開」的話先把音檔預載起來，等使用者一碰螢幕就能立刻出聲
  if (isOn()) { try { el(); } catch (e) {} }

  return { play, stop, toggle, isOn, get playing() { return playing; } };
})();

/* 自動接上頁面上的 🎵 按鈕（如果有的話）。手機瀏覽器規定要有使用者互動才能出聲，
   所以如果偏好是「開」，就借用使用者在頁面上的第一次點擊悄悄把音樂啟動。 */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('musicBtn');
  if (!btn) return;

  const sync = () => { btn.textContent = Music.playing ? '🎵' : '🔇'; };
  btn.textContent = Music.isOn() ? '🎵' : '🔇';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    Music.toggle();
    sync();
  });

  if (Music.isOn()) {
    const startOnce = (e) => {
      if (e.target.closest && e.target.closest('#musicBtn')) return; // 按鈕自己的點擊交給上面處理，避免同一下觸控被算兩次
      Music.play();
      sync();
      document.removeEventListener('pointerdown', startOnce);
    };
    document.addEventListener('pointerdown', startOnce, { once: true });
  }
});
