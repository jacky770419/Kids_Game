/* 音效：優先播 assets/sfx/ 底下的 M4A（AAC），載不到就退回原本的 Web Audio 合成音。

   用 Web Audio 的 AudioBuffer 而不是 <audio> 元素：短音效在 iOS 用 <audio>
   會有明顯延遲，而且同一個元素不能重疊播放（連點時會被截斷）。
   開頁時 fetch + decodeAudioData 先解碼放進 buffers，播放時只要接一條
   BufferSource → Gain，延遲趨近於零，也可以任意重疊。 */
const Sound = (() => {
  const FILES = {
    click: 'assets/sfx/click.m4a',
    pop: 'assets/sfx/pop.m4a',
    snap: 'assets/sfx/snap.m4a',
    win: 'assets/sfx/win.m4a'
  };

  // 每個音效的音量（0~1）
  const VOLUMES = { click: 0.5, pop: 0.7, snap: 0.7, win: 0.8 };

  const buffers = {}; // name → AudioBuffer，解碼成功才會有值
  let ctx = null;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') {
      const p = ctx.resume();
      if (p && typeof p.catch === 'function') p.catch(() => {}); // 沒有使用者手勢時會被拒絕，忽略
    }
    return ctx;
  }

  /* ---------- 退回用的合成音（原本的實作，一字不動地保留） ---------- */

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

  const synth = {
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

  /* ---------- 音檔預載 ---------- */

  // Safari 舊版的 decodeAudioData 只有 callback 版，新版才回 Promise，兩種都接
  function decode(arrayBuffer) {
    return new Promise((resolve, reject) => {
      const p = ac().decodeAudioData(arrayBuffer, resolve, reject);
      if (p && typeof p.then === 'function') p.then(resolve, reject);
    });
  }

  function preload() {
    Object.keys(FILES).forEach((name) => {
      // 任何一步失敗（fetch 非 2xx、file:// 被擋、decode 丟錯）都只是讓
      // buffers[name] 留空，播放時自動退回合成音
      fetch(FILES[name])
        .then((res) => {
          if (!res.ok) throw new Error(res.status + ' ' + FILES[name]);
          return res.arrayBuffer();
        })
        .then(decode)
        .then((buf) => { buffers[name] = buf; })
        .catch(() => { /* 靜靜退回合成音 */ });
    });
  }

  try { preload(); } catch (e) { /* 連 fetch 都沒有的環境，全程走合成音 */ }

  /* ---------- 播放 ---------- */

  function play(name) {
    const buf = buffers[name];
    if (!buf) { synth[name](); return; } // 還沒解碼好或載入失敗 → 合成音
    try {
      const c = ac();
      const src = c.createBufferSource();
      const gain = c.createGain();
      src.buffer = buf;
      gain.gain.value = VOLUMES[name];
      src.connect(gain).connect(c.destination);
      src.start(0);
    } catch (e) {
      synth[name]();
    }
  }

  return {
    pop() { play('pop'); },
    snap() { play('snap'); },
    win() { play('win'); },
    click() { play('click'); }
  };
})();
