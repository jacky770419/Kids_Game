/* 列出全站會「唸出來」的英文句子（給 TTS 預錄用），直接讀真的資料檔，不另抄一份。
   用法：node tools/tts/lines.js            → 印各組句數與字元數
         node tools/tts/lines.js --json     → 印 {組: [句子…]}
   點餐句子全組合有幾千句，所以拆成兩半錄：「I want a pink cake」＋「with two cherries.」 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
global.window = global;
for (const f of ['js/cake-data.js', 'js/cake-state.js', 'js/stickers-data.js']) (0, eval)(read(f));
const D = global.CakeData, St = global.CakeState, SD = global.StickersData;

const groups = {};
const add = (g, t) => { if (t) (groups[g] = groups[g] || new Set()).add(t); };

const words = JSON.parse(read('assets/data/words.json'));
(Array.isArray(words) ? words : words.words).forEach((x) => add('單字', x.word.toLowerCase()));

const col = read('js/coloring.js');
const from = col.indexOf('COLOR_NAMES = {');
[...col.slice(from, col.indexOf('};', from)).matchAll(/'#[0-9A-Fa-f]{6}': '([a-z ]+)'/g)].forEach((m) => add('顏色', m[1]));

SD.STICKERS.forEach((s) => add('貼紙', s.say || s.word));
[...read('js/pictures-data.js').matchAll(/word: *'([^']+)'/g)].forEach((m) => add('拼圖', m[1]));

D.FLAVORS.forEach((f) => add('甜點店單字', f.word));
D.DESSERTS.forEach((d) => {
  add('甜點店單字', d.word);
  (d.holders || []).forEach((h) => add('甜點店單字', h.say));
  D.CREAMS.forEach((c) => add('甜點店單字', D.creamSay(d.id, c.id)));
});
D.TOPPINGS.forEach((t) => add('甜點店單字', t.word));
['Yummy! Thank you!', 'Happy birthday!', 'Yummy!'].forEach((t) => add('甜點店單字', t));

// 放配料時數出來：one cherry … twenty cherries
D.TOPPINGS.filter((t) => !t.mass).forEach((t) => {
  for (let n = 1; n <= St.MAX_TOPPINGS; n++) add('數配料', D.NUMBERS[n] + ' ' + (n === 1 ? t.word : t.plural));
});
// 點餐：前半「I want a pink cake」、後半「with two cherries.」
D.DESSERTS.forEach((d) => d.flavors.forEach((fid) => {
  const c = D.flavor(fid).word;
  add('點餐前半', 'I want ' + (/^[aeiou]/i.test(c) ? 'an' : 'a') + ' ' + c + ' ' + d.word);
}));
D.TOPPINGS.filter((t) => !t.noOrder).forEach((t) => {
  for (let n = 1; n <= St.MAX_COUNT; n++) add('點餐後半', 'with ' + D.NUMBERS[n] + ' ' + (n === 1 ? t.word : t.plural) + '.');
});

const out = {};
Object.keys(groups).forEach((g) => { out[g] = [...groups[g]]; });
if (process.argv.includes('--json')) { console.log(JSON.stringify(out, null, 1)); return; }
const all = new Set();
let sum = 0;
Object.keys(out).forEach((g) => {
  const fresh = out[g].filter((t) => !all.has(t));
  fresh.forEach((t) => all.add(t));
  const chars = fresh.reduce((a, t) => a + t.length, 0);
  sum += chars;
  console.log(g.padEnd(8, '　'), String(out[g].length).padStart(4), '句（新的', String(fresh.length).padStart(4), '）', String(chars).padStart(6), '字元', '例：', out[g].slice(0, 3).join(' / '));
});
console.log('合計（去重）', all.size, '句', sum, '字元');
