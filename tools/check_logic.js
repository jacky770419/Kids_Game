#!/usr/bin/env node
/* 動動腦（邏輯小遊戲）的檢查（零依賴，Node 直跑）。

   為什麼要這支：孩子不識字，題目全靠念的和注音。少一個字的注音、台詞編號打錯、
   關卡其實解不開，在開發機上都不容易看出來，所以用機器驗：
     A. 每一句台詞中英文都有；中文每個字都查得到注音；沒有用到 TTS 容易念錯的字
     B. 小屋程式裡用到的台詞編號都存在（打錯字會變成不出聲）；沒人用的台詞列出來提醒
     C. 每間小屋自己的邏輯驗算（addHouse 的 test()）：關卡解得開、答案只有一個
     D. 語音清單（js/logic-audio.js）列的檔都在磁碟上

   跑法：node tools/check_logic.js          → 全綠 exit 0，有錯 exit 1
         node tools/check_logic.js --print  → 另外把每一句的注音印出來（破音字要用眼睛看一遍） */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PRINT = process.argv.includes('--print');

const problems = [];
const warns = [];
const fail = (m) => problems.push(m);

/* 在 Node 裡把外殼和小屋載進來：給最小的假 window／document，小屋檔載入時不可以碰畫面 */
global.window = global;
global.document = { addEventListener() {}, readyState: 'loading', getElementById() { return null; } };
global.location = { search: '' };
global.StoryData = require(path.join(ROOT, 'js/story-data.js'));
global.LogicAudio = [];
try { require(path.join(ROOT, 'js/logic-audio.js')); } catch (e) { fail('js/logic-audio.js 載入失敗：' + e.message); }
require(path.join(ROOT, 'js/logic.js'));
const Logic = global.Logic;
if (!Logic) { console.error('js/logic.js 沒有建立 window.Logic'); process.exit(1); }

const houseFiles = fs.readdirSync(path.join(ROOT, 'js'))
  .filter((f) => /^logic-.+\.js$/.test(f) && f !== 'logic-audio.js');
for (const f of houseFiles) {
  try { require(path.join(ROOT, 'js', f)); } catch (e) { fail('js/' + f + ' 載入失敗（載入時不可以碰 document）：' + e.message); }
}

const LINES = Logic._lines;
const ids = Object.keys(LINES);

// ---------- A. 台詞 ----------
/* TTS 念錯過、或這個專案說好不用的字詞（記在寫稿規則裡的那幾個） */
const BAN = ['捂', '摀', '呃', '溜', '艘', '星期', '消息', '嘿咻', '暖和', '嘩', '呱', '卵', '傍晚'];
const ZH_MAX = 30, EN_MAX = 110;
const isHan = (ch) => /[一-鿿]/.test(ch);

for (const id of ids) {
  const l = LINES[id] || {};
  if (!l.zh) fail('台詞 ' + id + ' 沒有中文');
  if (!l.en) fail('台詞 ' + id + ' 沒有英文');
  const zh = l.zh || '';
  const zy = Logic._zhuyinOf(zh);
  const missing = [];
  for (let i = 0; i < zh.length; i++) if (isHan(zh[i]) && !zy[i]) missing.push(zh[i]);
  if (missing.length) fail('台詞 ' + id + ' 有字查不到注音（用 Logic.zy 補）：' + Array.from(new Set(missing)).join(''));
  if (zh.length > ZH_MAX) fail('台詞 ' + id + ' 中文 ' + zh.length + ' 字，超過 ' + ZH_MAX + '（泡泡放不下、孩子也記不住）');
  if ((l.en || '').length > EN_MAX) fail('台詞 ' + id + ' 英文 ' + l.en.length + ' 字元，超過 ' + EN_MAX);
  BAN.forEach((w) => { if (zh.includes(w)) fail('台詞 ' + id + ' 用了容易念錯的「' + w + '」'); });
  if (/[A-Za-z]/.test(zh)) fail('台詞 ' + id + ' 的中文裡有英文字母');
  if (PRINT) {
    const shown = Array.from(zh).map((ch, i) => (zy[i] ? ch + zy[i] : ch)).join(' ');
    console.log(id.padEnd(22) + shown + '\n' + ''.padEnd(22) + (l.en || ''));
  }
}

// ---------- B. 台詞編號對帳 ----------
const used = new Set();
const prefixes = new Set(ids.map((id) => id.split('.')[0]));
for (const f of ['logic.js'].concat(houseFiles)) {
  const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  for (const m of src.matchAll(/['"`]([a-z]+\.[A-Za-z0-9_.]+)['"`]/g)) {
    const id = m[1];
    if (!prefixes.has(id.split('.')[0])) continue;
    used.add(id);
    // 以 . 結尾的是拿來接字串的前綴（'tidy.t.' + id），不是完整編號
    if (id.endsWith('.')) continue;
    if (!LINES[id]) fail('js/' + f + ' 用到不存在的台詞：' + id);
  }
}
for (const id of ids) {
  const viaPrefix = Array.from(used).some((u) => u.endsWith('.') && id.startsWith(u));
  if (!used.has(id) && !viaPrefix) warns.push('台詞 ' + id + ' 沒有地方用到');
}

// ---------- C. 小屋 ----------
const houses = Logic._houses;
if (!houses.length) fail('一間小屋都沒有');
for (const h of houses) {
  if (!h.id || !LINES[h.name]) fail('小屋 ' + h.id + ' 的名字台詞不存在：' + h.name);
  (h.intro || []).forEach((id) => { if (!LINES[id]) fail('小屋 ' + h.id + ' 的開場台詞不存在：' + id); });
  if (!(h.levels >= 1)) fail('小屋 ' + h.id + ' 沒有小關');
  if (typeof h.mount !== 'function') fail('小屋 ' + h.id + ' 沒有 mount()');
  if (typeof h.test === 'function') {
    let errs = [];
    try { errs = h.test() || []; } catch (e) { errs = ['test() 丟出例外：' + e.message]; }
    errs.forEach((e) => fail('小屋 ' + h.id + ' 邏輯驗算：' + e));
  }
}

// ---------- D. 語音清單 ----------
const audio = Array.isArray(global.LogicAudio) ? global.LogicAudio : [];
for (const p of audio) {
  if (!fs.existsSync(path.join(ROOT, p))) fail('語音清單列了但磁碟上沒有：' + p);
}
const have = new Set(audio);
const noZh = ids.filter((id) => !have.has('assets/logic/audio/zh/' + id + '.mp3')).length;
const noEn = ids.filter((id) => !have.has('assets/logic/audio/en/' + id + '.mp3')).length;

// ---------- 結果 ----------
warns.forEach((w) => console.log('提醒：' + w));
if (problems.length) {
  console.error('動動腦檢查失敗，共 ' + problems.length + ' 項：');
  problems.forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
  process.exit(1);
}
const zhChars = ids.reduce((n, id) => n + LINES[id].zh.length, 0);
const enChars = ids.reduce((n, id) => n + LINES[id].en.length, 0);
console.log('動動腦檢查通過：小屋 ' + houses.length + ' 間（' + houses.map((h) => h.id + ' ' + h.levels + ' 關').join('、') + '），台詞 ' + ids.length +
  ' 句（中文 ' + zhChars + ' 字、英文 ' + enChars + ' 字元）；還沒有錄音的：中文 ' + noZh + ' 句、英文 ' + noEn + ' 句（會用系統語音）。');
