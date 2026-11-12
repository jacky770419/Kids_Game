/* 全站共用的畫面小工具（window.UI）——新版設計「浮起來的才能按」用的。

   這支只做四件事，都跟遊戲邏輯無關：
   1. 圖示：畫面上不再用 emoji 當按鈕（每台裝置長得不一樣、也沒辦法跟著按鈕變色），
      改用同一套線條圖示。HTML 寫 <i data-ic="home"></i>，載入時換成 SVG。
   2. 注音：小孩看的字一律「國字＋直排注音」。HTML 寫 data-zy="拼ㄆㄧㄣ 圖ㄊㄨˊ"
      （一個字接它的注音，字跟字用空白隔開），載入時排成直排。
   3. 小熊泡泡：每一頁左上的小熊把「現在要做什麼」唸出來，點泡泡再聽一次。
   4. 按住才生效：大人專區的鎖、全部擦掉這類「不小心點到會很糟」的按鈕。

   每一頁在自己的 JS 之前載入。要加圖示不用改這支：在自己的 JS 裡寫
   UI.icons.myIcon = '<path d="…"/>' 就可以用 UI.icon('myIcon')。 */
(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  /* 字型（粉圓、Andika、Fredoka）目前還是從 Google Fonts 拉——還沒裁成小檔收進 assets/fonts。
     用 JS 插 <link> 而不是在 base.css 寫 @import：@import 會擋住畫面，
     在訊號很差的地方（車上）整頁要等到連線逾時才出得來；這樣插的不擋畫面，
     連不上就維持系統字型，連上了再換。離線時沒有這三套字，注音還是看得到。
     TODO：字型收進 assets/fonts 之後整段刪掉，改成 base.css 的 @font-face
     （tools/check_precache.js 會因為這個外連亮紅燈，是故意留著提醒的）。 */
  try {
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Andika:wght@400;700&family=Huninn&display=swap';
    document.head.appendChild(fonts);
  } catch (e) { /* 沒字型不影響玩 */ }

  /* viewBox 0 0 24 24、線寬 2.6、圓頭——樣式寫在 css/base.css 的 .ic */
  const icons = {
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    back: '<path d="M11 5l-7 7 7 7M4 12h16"/>',
    next: '<path d="M13 5l7 7-7 7M20 12H4"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    up: '<path d="M5 15l7-7 7 7"/>',
    down: '<path d="M5 9l7 7 7-7"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    replay: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
    speaker: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18.3 6.5a7.5 7.5 0 0 1 0 11"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    sparkle: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/>',
    bucket: '<path d="M4.5 11.5l7-7 7.5 7.5-6 6a2 2 0 0 1-2.8 0z"/><path d="M9 7L6.5 4.5"/><path d="M19.8 15.5s1.5 2 1.5 3.2a1.5 1.5 0 0 1-3 0c0-1.2 1.5-3.2 1.5-3.2z"/>',
    brush: '<path d="M19.5 4.5l-9 9"/><path d="M10.5 13.5c-2.5 0-4 1.5-4 3.5 0 1.5-1 2.5-2.5 2.5 3.5 1.5 8 .5 8-3.5"/>',
    pencil: '<path d="M5 19l1-4L16.5 4.5l3 3L9 18z"/><path d="M14.5 6.5l3 3"/>',
    stamp: '<path d="M9 13c0-2 1-2.5 1-4.5a2.5 2.5 0 1 1 4 0c0 2 1 2.5 1 4.5"/><path d="M6 13h12v4H6zM5 20h14"/>',
    eraser: '<path d="M8.5 19.5l-5-5L13 5l6.5 6.5-8 8z"/><path d="M8.5 19.5H20M9 9l6.5 6.5"/>',
    camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>',
    image: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M3.5 16l5-5 4 4 2.5-2.5 5.5 5.5"/><circle cx="15.5" cy="9.5" r="1.3"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    book: '<path d="M4 5.5c2.5-1 5.5-1 8 1 2.5-2 5.5-2 8-1v13c-2.5-1-5.5-1-8 1-2.5-2-5.5-2-8-1z"/><path d="M12 6.5v13"/>',
    ear: '<path d="M7 10a5 5 0 0 1 10 0c0 3-3 3.5-3 6.5a3 3 0 0 1-5.5 1.5"/><path d="M10 11a2 2 0 0 1 4 0c0 1-1 1.5-1.5 2"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    pause: '<path d="M8 5.5v13M16 5.5v13"/>',
    cards: '<rect x="3.5" y="6" width="9" height="12" rx="2"/><rect x="11.5" y="6" width="9" height="12" rx="2"/>',
    help: '<path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><path d="M12 16.8v.2"/>'
  };

  function icon(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' +
      (icons[name] || '') + '</svg>';
  }

  /* 「拼ㄆㄧㄣ 圖ㄊㄨˊ」→ 直排注音的 HTML。
     每個 token 第一個字是國字，後面是它的注音；沒有注音的 token（標點、英文、數字）原樣輸出。
     二三四聲的調號放在注音右側中間（<u>），輕聲的 ˙ 留在最上面——跟課本的排法一樣。 */
  const TONES = 'ˊˇˋ';
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function zy(str) {
    return String(str || '').trim().split(/\s+/).map((tok) => {
      const chars = Array.from(tok);
      const han = chars[0];
      let ph = chars.slice(1).join('');
      if (!ph || !/[ㄅ-ㄩ˙ˊˇˋ]/.test(ph)) return '<span class="zy-plain">' + esc(tok) + '</span>';
      let tone = '';
      if (TONES.indexOf(ph.slice(-1)) >= 0) { tone = ph.slice(-1); ph = ph.slice(0, -1); }
      return '<span class="zy">' + esc(han) + '<i>' + esc(ph) + (tone ? '<u>' + tone + '</u>' : '') + '</i></span>';
    }).join('');
  }
  /* 同一個字串拿掉注音，就是要唸的那句話 */
  function plain(str) {
    return String(str || '').trim().split(/\s+/).map((tok) => {
      const chars = Array.from(tok);
      return /[ㄅ-ㄩ˙ˊˇˋ]/.test(chars.slice(1).join('')) ? chars[0] : tok;
    }).join('');
  }

  /* 唸中文。之後要換成錄好的旁白，只要改這一個函式。
     iOS 規定出聲要在使用者手勢裡，所以一進頁面那一次可能沒聲音——點泡泡一定有。 */
  function say(text) {
    if (!text) return;
    if (window.Speech && typeof window.Speech.say === 'function') {
      window.Speech.say(text, { lang: 'zh-TW', rate: 0.9, force: true });
      return;
    }
    try {
      const s = window.speechSynthesis;
      if (!s || typeof SpeechSynthesisUtterance !== 'function') return;
      s.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'zh-TW';
      u.rate = 0.9;
      s.speak(u);
    } catch (e) { /* 沒有語音就安靜 */ }
  }

  /* 小熊泡泡。host 是一個空的容器；回傳 { set(zyStr, speakNow) } 給換畫面時改台詞用。 */
  function guide(host, zyStr) {
    if (!host) return { set() {} };
    host.classList.add('guide');
    host.innerHTML =
      '<img class="guide-bear" src="assets/story/chars/bear-point.png" alt="">' +
      '<button type="button" class="bubble" aria-label="再聽一次">' +
      '<span class="bubble-txt"></span><span class="bubble-say">' + icon('speaker') + '</span></button>';
    const txt = host.querySelector('.bubble-txt');
    const btn = host.querySelector('.bubble');
    let line = '';
    function set(s, speakNow) {
      line = s || '';
      txt.innerHTML = zy(line);
      btn.setAttribute('aria-label', plain(line) + '（再聽一次）');
      if (speakNow) say(plain(line));
    }
    btn.addEventListener('click', () => {
      say(plain(line));
      btn.classList.remove('talk');
      void btn.offsetWidth;          // 重新觸發小跳一下的動畫
      btn.classList.add('talk');
    });
    set(zyStr || host.getAttribute('data-guide') || '');
    return { set: set };
  }

  /* 按住 ms 毫秒才執行 cb；外圈轉滿才算（樣式是 base.css 的 .hold）。
     未滿就放開什麼都不發生。鍵盤 Enter／空白鍵直接執行——誤觸是手掌的問題，鍵盤沒有。 */
  function hold(el, ms, cb) {
    if (!el || el.__uiHold) return;
    el.__uiHold = true;
    el.classList.add('hold');
    let timer = null, raf = null, startAt = 0, active = null;
    function paint() {
      const p = Math.min(1, (Date.now() - startAt) / ms);
      el.style.setProperty('--hold', String(p));
      if (p < 1) raf = requestAnimationFrame(paint);
    }
    function reset() {
      if (timer !== null) { clearTimeout(timer); timer = null; }
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      active = null;
      el.classList.remove('holding');
      el.style.setProperty('--hold', '0');
    }
    el.addEventListener('pointerdown', (e) => {
      if (active !== null || (typeof e.button === 'number' && e.button > 0)) return;
      active = e.pointerId;
      startAt = Date.now();
      el.classList.add('holding');
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* 不支援就算了 */ }
      raf = requestAnimationFrame(paint);
      timer = setTimeout(() => { reset(); cb(); }, ms);
    });
    const cancel = (e) => { if (active === null || e.pointerId === active) reset(); };
    el.addEventListener('pointerup', cancel);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('pointerleave', cancel);
    el.addEventListener('click', (e) => { e.preventDefault(); });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cb(); }
    });
  }

  /* 把 root 底下的 data-ic／data-zy／data-guide 換成真正的內容。
     JS 動態產生的畫面可以再呼叫一次（已經換過的不會重做）。 */
  function hydrate(root) {
    const r = root || document;
    r.querySelectorAll('[data-ic]').forEach((el) => {
      if (el.__uiIc === el.dataset.ic) return;
      el.__uiIc = el.dataset.ic;
      el.innerHTML = icon(el.dataset.ic);
    });
    r.querySelectorAll('[data-zy]').forEach((el) => {
      if (el.__uiZy === el.dataset.zy) return;
      el.__uiZy = el.dataset.zy;
      el.innerHTML = zy(el.dataset.zy);
      if (!el.hasAttribute('aria-label') && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
        el.setAttribute('aria-label', plain(el.dataset.zy));
      }
    });
    r.querySelectorAll('[data-guide]').forEach((el) => {
      if (el.__uiGuide) return;
      el.__uiGuide = guide(el, el.dataset.guide);
    });
  }

  window.UI = { icons, icon, zy, plain, say, guide, hold, hydrate };

  /* 這支放在 body 結尾，上面的 HTML 都已經在了：馬上換一次，畫面才不會先閃一下空按鈕。
     DOMContentLoaded 再補一次，接住後面的 JS 在載入時產生的東西。 */
  hydrate();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => hydrate());
  }
})();
