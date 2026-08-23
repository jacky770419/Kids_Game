/* 用 Web Audio 合成音效，不需要音檔 */
const Sound = (() => {
  let ctx = null;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, startDelay, dur, type = 'sine', vol = 0.18) {
    try {
      const c = ac();
      const t0 = c.currentTime + startDelay;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (e) { /* 音效失敗不影響遊戲 */ }
  }

  return {
    // 著色時的「啵」
    pop() {
      tone(660, 0, 0.12, 'triangle', 0.22);
      tone(990, 0.03, 0.1, 'sine', 0.12);
    },
    // 拼圖吸附
    snap() {
      tone(440, 0, 0.08, 'square', 0.08);
      tone(880, 0.05, 0.15, 'triangle', 0.18);
    },
    // 過關小旋律
    win() {
      const notes = [523, 659, 784, 1047, 784, 1047];
      notes.forEach((f, i) => tone(f, i * 0.14, 0.3, 'triangle', 0.2));
    },
    // 按鈕點擊
    click() {
      tone(520, 0, 0.07, 'sine', 0.12);
    }
  };
})();
