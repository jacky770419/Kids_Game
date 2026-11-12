/* 首頁：大人專區。
   音樂、唸英文、故事語言、單字卡大小寫／只聽不看、甜點店只聽不看——這些以前散在各頁的
   小按鈕，小孩會亂按、大人要找又找不到。現在全部收在首頁右上那顆鎖後面（按住兩秒）。
   各頁照舊從 localStorage 讀設定，這裡只是換了一個地方改。 */
(() => {
  const $ = (id) => document.getElementById(id);
  const sheet = $('parentSheet');

  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* 存不了就只影響這一次 */ } };

  /* 單字頁的設定跟進度存在同一包 JSON（kidsWords）裡，只改其中兩個欄位，其他原樣留著 */
  const WORDS_KEY = 'kidsWords';
  function wordsSave() {
    try {
      const s = JSON.parse(get(WORDS_KEY) || '{}');
      return (s && typeof s === 'object') ? s : {};
    } catch (e) { return {}; }
  }
  function setWords(patch) {
    set(WORDS_KEY, JSON.stringify(Object.assign(wordsSave(), patch)));
  }

  function sync() {
    $('pMusic').checked = window.Music ? Music.isOn() : true;
    $('pSpeech').checked = window.Speech ? Speech.isOn() : true;
    const en = get('kidsStoryLang') === 'en';
    $('pLangEn').checked = en;
    $('pLangZh').checked = !en;
    const w = wordsSave();
    const lower = typeof w.lower === 'boolean' ? w.lower : true;
    $('pCaseLo').checked = lower;
    $('pCaseUp').checked = !lower;
    $('pListen').checked = w.listenOnly === true;
    $('pCakeListen').checked = get('kidsCakeListen') === '1';
  }

  $('pMusic').addEventListener('change', (e) => {
    if (!window.Music) return;
    if (e.target.checked) Music.play(); else Music.stop();
  });
  $('pSpeech').addEventListener('change', (e) => { if (window.Speech) Speech.setOn(e.target.checked); });
  $('pLangZh').addEventListener('change', () => set('kidsStoryLang', 'zh'));
  $('pLangEn').addEventListener('change', () => set('kidsStoryLang', 'en'));
  $('pCaseLo').addEventListener('change', () => setWords({ lower: true }));
  $('pCaseUp').addEventListener('change', () => setWords({ lower: false }));
  $('pListen').addEventListener('change', (e) => setWords({ listenOnly: e.target.checked }));
  $('pCakeListen').addEventListener('change', (e) => set('kidsCakeListen', e.target.checked ? '1' : '0'));

  function open() { sync(); sheet.hidden = false; $('parentClose').focus(); }
  function close() { sheet.hidden = true; }

  UI.hold($('parentBtn'), 2000, open);
  $('parentClose').addEventListener('click', close);
  // 點到白色卡片外面也關掉
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) close(); });
})();
