/* 故事書的資料對帳（Node 直跑、零依賴）：node tools/check_story.js
   三份資料分開維護——錄音產生的 js/story-script.js、手寫的 js/story-data.js、磁碟上的圖與音檔——
   任何一邊改了另一邊沒跟上，畫面不會報錯，只會少一個角色或某個字沒有注音，所以在這裡擋。

     A. 每個故事都有分鏡，頁數一樣
     B. 字幕裡每個漢字都查得到注音（她只認注音，缺一個就是一個讀不出來的字）
     C. 說話的人都在 VOICES，指到的角色這個故事有圖
     D. 分鏡裡的角色、姿勢都在 SPRITES；l（第幾句）沒有超過那一頁的句數
     E. 圖檔、背景、音檔都在磁碟上
     F. 每句的逐字時間跟字數一樣多、而且遞增（字幕亮字靠它） */
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(root, f));

global.window = global;
(0, eval)(read('js/story-script.js'));
const SCRIPT = global.STORY_SCRIPT;
const Data = require(path.join(root, 'js/story-data.js'));

const problems = [];
const fail = (m) => problems.push(m);
const HAN = /[一-鿿]/;

function zhuyinOf(text) {
  const out = new Array(text.length).fill(undefined);
  Object.keys(Data.ZY_PHRASES).forEach((w) => {
    if (Data.ZY_PHRASES[w].length !== w.length) fail('ZY_PHRASES「' + w + '」的注音數跟字數不一樣');
    let i = text.indexOf(w);
    while (i >= 0) {
      Data.ZY_PHRASES[w].forEach((z, k) => { out[i + k] = z; });
      i = text.indexOf(w, i + w.length);
    }
  });
  for (let i = 0; i < text.length; i++) if (out[i] === undefined) out[i] = Data.ZY[text[i]] || null;
  return out;
}

// 注音的寫法：可有可無的輕聲點＋一到三個符號＋可有可無的聲調
const ZY_OK = /^˙?[ㄅ-ㄩ]{1,3}[ˊˇˋ]?$/;
Object.keys(Data.ZY).forEach((c) => { if (!ZY_OK.test(Data.ZY[c])) fail('ZY「' + c + '」的注音寫法怪怪的：' + Data.ZY[c]); });
Object.keys(Data.ZY_PHRASES).forEach((w) => Data.ZY_PHRASES[w].forEach((z) => {
  if (!ZY_OK.test(z)) fail('ZY_PHRASES「' + w + '」的注音寫法怪怪的：' + z);
}));

function checkSprite(where, id, pose) {
  const sp = Data.SPRITES[id];
  if (!sp) { fail(where + '：沒有角色 ' + id); return; }
  if (!sp[pose]) { fail(where + '：' + id + ' 沒有姿勢 ' + pose); return; }
  if (sp[pose].src && !exists(sp[pose].src)) fail(where + '：圖檔不存在 ' + sp[pose].src);
}

let lines = 0;
SCRIPT.stories.forEach((s) => {
  const st = Data.STAGING[s.id];
  if (!st) { fail(s.id + '：沒有分鏡（StoryData.STAGING）'); return; }
  if (st.pages.length !== s.pages.length) fail(s.id + '：錄音 ' + s.pages.length + ' 頁、分鏡 ' + st.pages.length + ' 頁');
  [...s.title].forEach((c, i) => { if (HAN.test(c) && !zhuyinOf(s.title)[i]) fail(s.id + ' 標題「' + c + '」沒有注音'); });
  if (!exists(st.cover.bg)) fail(s.id + '：封面背景不存在 ' + st.cover.bg);
  checkSprite(s.id + ' 封面', st.cover.actor, st.cover.pose);

  s.pages.forEach((pg, n) => {
    const where = s.id + ' 第 ' + (n + 1) + ' 頁';
    const plan = st.pages[n];
    if (!exists(pg.audio)) fail(where + '：音檔不存在 ' + pg.audio);
    if (!plan) return;
    if (!exists(plan.bg)) fail(where + '：背景不存在 ' + plan.bg);
    const onStage = new Set(plan.actors.map((a) => a.id));
    plan.actors.forEach((a) => checkSprite(where, a.id, a.pose));
    (plan.cues || []).forEach((c) => {
      if (c.l !== undefined && !(c.l >= 0 && c.l < pg.lines.length)) fail(where + '：分鏡的 l=' + c.l + ' 超過句數 ' + pg.lines.length);
      if (c.id && !onStage.has(c.id)) fail(where + '：分鏡用到不在這一頁的角色 ' + c.id);
      if (c.id && c.pose) checkSprite(where, c.id, c.pose);
      if (c.id && c.glow) checkSprite(where, c.id, c.glow);
    });
    pg.lines.forEach((ln) => {
      lines++;
      const voice = Data.VOICES[ln.who];
      if (!voice) fail(where + '：說話的人「' + ln.who + '」不在 VOICES');
      else if (voice.actor && !Data.SPRITES[voice.actor]) fail(where + '：「' + ln.who + '」指到沒有圖的角色 ' + voice.actor);
      const zy = zhuyinOf(ln.text);
      [...ln.text].forEach((c, i) => { if (HAN.test(c) && !zy[i]) fail(where + '：「' + c + '」沒有注音（' + ln.text + '）'); });
      if (ln.t.length !== ln.text.length) fail(where + '：逐字時間 ' + ln.t.length + ' 筆、字數 ' + ln.text.length + '（' + ln.text + '）');
      for (let i = 1; i < ln.t.length; i++) if (ln.t[i] < ln.t[i - 1]) { fail(where + '：逐字時間沒有遞增（' + ln.text + '）'); break; }
      if (!(ln.e > ln.s)) fail(where + '：這句的結束時間沒有比開始晚（' + ln.text + '）');
    });
  });
});

if (problems.length) {
  console.error('故事書資料有 ' + problems.length + ' 個問題：');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log('故事書對帳通過：' + SCRIPT.stories.length + ' 個故事、' +
  SCRIPT.stories.reduce((n, s) => n + s.pages.length, 0) + ' 頁、' + lines + ' 句，注音 ' + Object.keys(Data.ZY).length + ' 字。');
