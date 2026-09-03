/* 全站共用的語音合成小工具（window.Speech）。

   為什麼要有這支、為什麼要自己挑語音：
   speechSynthesis 預設會照 utterance.lang 去「猜」一個語音，但在 iOS／iPadOS 上
   猜出來的常常不是英文母語音——裝置若設定成中文，系統可能拿中文語音去唸英文單字，
   唸出來是「貝爾」而不是 bear。使用者是五歲小孩、在上迪士尼美語，發音錯了比不出聲更糟，
   所以這裡明確挑一顆英文語音，挑不到才退回讓系統自己決定。

   優先順序（Samantha 排第一是因為它是 iOS/macOS 內建品質最好的美式女聲，
   而且小孩聽慣的教材配音也是女聲）：
     Samantha → 名稱含 Siri 的英文語音 → Google US English → 任一 en-US → 任一 en

   另外兩個平台細節：
   - iOS 的 getVoices() 第一次呼叫常常回空陣列（語音清單是非同步載入的），
     所以要接 voiceschanged 事件，事件來了就把快取清掉重算。
   - iOS 規定出聲必須發生在使用者手勢裡。這支不做任何規避，
     呼叫端請在 click 事件處理函式裡直接呼叫 say()。 */
(() => {
  if (typeof window === 'undefined') return;

  // 挑到的語音會快取起來（getVoices 每次呼叫都要重新掃一遍清單，選色格連點會很吃虧）
  let cachedVoice = null;
  let cacheValid = false;

  function synth() {
    try {
      return ('speechSynthesis' in window) ? window.speechSynthesis : null;
    } catch (e) {
      return null;
    }
  }

  // 依上面的優先順序從英文語音裡挑一顆；一顆英文語音都沒有就回 null（讓系統自己決定）
  function pickVoice() {
    const s = synth();
    if (!s || typeof s.getVoices !== 'function') return null;
    let voices;
    try { voices = s.getVoices() || []; } catch (e) { return null; }
    const en = voices.filter(v => v && typeof v.lang === 'string' && v.lang.toLowerCase().indexOf('en') === 0);
    if (en.length === 0) return null;
    const byName = (re) => en.find(v => typeof v.name === 'string' && re.test(v.name));
    return byName(/^Samantha\b/i)
      || byName(/Siri/i)
      || byName(/Google US English/i)
      || en.find(v => v.lang.toLowerCase() === 'en-us')
      || en[0];
  }

  function voice() {
    if (!cacheValid) {
      cachedVoice = pickVoice();
      // 清單還沒載進來時 getVoices() 回空陣列，這時不要把「沒有語音」記成結論，
      // 留著下次再算（voiceschanged 也會來清一次）
      cacheValid = cachedVoice !== null;
    }
    return cachedVoice;
  }

  // 語音清單載好／裝置語音設定變動時，重新挑一次
  try {
    const s = synth();
    if (s && typeof s.addEventListener === 'function') {
      s.addEventListener('voiceschanged', () => { cacheValid = false; cachedVoice = null; });
    }
  } catch (e) { /* 接不上就算了，voice() 每次沒挑到本來就會重試 */ }

  window.Speech = {
    /* 唸一段文字。沒有語音合成能力（舊瀏覽器、被政策擋掉）就安靜略過——
       這個網站的所有功能在沒有語音時都要照樣能玩。
       opts.lang  覆寫語系（之後注音教學會用 'zh-TW'；非英文時不套英文語音）
       opts.rate  覆寫語速（預設 0.85，比正常慢一點，五歲小孩才聽得清楚） */
    say: function (text, opts) {
      if (!text) return;
      const o = opts || {};
      try {
        const s = synth();
        if (!s || typeof SpeechSynthesisUtterance !== 'function') return;
        // 每次先取消：小孩會連點，不取消的話語音會排隊，點五下要等五次才安靜
        s.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.lang = o.lang || 'en-US';
        u.rate = typeof o.rate === 'number' ? o.rate : 0.85;
        // 只有唸英文時才套挑好的英文語音；指定別的語系就交給系統自己選
        if (!o.lang || o.lang.toLowerCase().indexOf('en') === 0) {
          const v = voice();
          if (v) u.voice = v;
        }
        s.speak(u);
      } catch (e) { /* 沒有語音就安靜 */ }
    },

    /* 中斷目前的朗讀（例如離開畫面時） */
    cancel: function () {
      try {
        const s = synth();
        if (s) s.cancel();
      } catch (e) { /* 略過 */ }
    }
  };
})();
