/* 背景音樂：用 Web Audio 即時合成一段五聲音階旋律循環播放，
   不需要外部音樂檔案，完全原創、沒有版權問題，也不佔儲存空間。 */
const Music = (() => {
  const STORAGE_KEY = 'kidsMusicOn';
  let ctx = null;
  let playing = false;
  let nextNoteTime = 0;
  let stepIndex = 0;
  let timerId = null;

  // C 大調五聲音階，橫跨兩個八度：音階內任意組合都不會刺耳，很適合小孩
  const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  // 手寫的輕快旋律（音階索引，-1 是休止符）+ 簡單的低音襯底，四小節一輪循環
  const MELODY = [
    0, 2, 4, 5, 4, 2, 0, -1,
    2, 4, 5, 7, 5, 4, 2, -1,
    0, 2, 4, 5, 7, 5, 4, 2,
    4, 2, 0, -1, 0, -1, -1, -1
  ];
  const BASS = [
    0, -1, -1, -1, -1, -1, -1, -1,
    3, -1, -1, -1, -1, -1, -1, -1,
    0, -1, -1, -1, -1, -1, -1, -1,
    3, -1, -1, -1, 0, -1, -1, -1
  ];
  const STEP_DUR = 0.25; // 每格時值（秒），中速、活潑但不吵

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function scheduleNote(freq, time, dur, type, vol) {
    const c = ac();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  // 提前排程接下來 0.2 秒內該出現的音符（比 setInterval 本身精準，避免拍子飄）
  function tick() {
    const c = ac();
    while (nextNoteTime < c.currentTime + 0.2) {
      const m = MELODY[stepIndex % MELODY.length];
      const b = BASS[stepIndex % BASS.length];
      if (m >= 0) scheduleNote(SCALE[m], nextNoteTime, STEP_DUR * 0.9, 'triangle', 0.05);
      if (b >= 0) scheduleNote(SCALE[b] / 2, nextNoteTime, STEP_DUR * 1.8, 'sine', 0.04);
      nextNoteTime += STEP_DUR;
      stepIndex++;
    }
  }

  function play() {
    if (playing) return;
    playing = true;
    const c = ac();
    nextNoteTime = c.currentTime + 0.1;
    stepIndex = 0;
    timerId = setInterval(tick, 100);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* 存不了就算了，不影響播放 */ }
  }

  function stop() {
    playing = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    try { localStorage.setItem(STORAGE_KEY, '0'); } catch (e) {}
  }

  function toggle() {
    if (playing) stop(); else play();
  }

  function isOn() {
    try { return localStorage.getItem(STORAGE_KEY) !== '0'; } catch (e) { return true; }
  }

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
