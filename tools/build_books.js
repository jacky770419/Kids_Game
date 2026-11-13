/* 產生新書書單 js/story-books.js（Node 直跑、零依賴）：node tools/build_books.js
   上架清單在 tools/tts/stories-new/_上架.json；每本要先有
     js/books/<id>-script.js（python tools/tts/build_books.py 產生）與 js/books/<id>.js（手寫分鏡）。

   書單每本記：書名（中英）、書名的注音（那本的注音表要打開才載入，選書頁先用這份）、封面、
   以及這本要下載的每個檔＋雜湊＋大小。js/book-sync.js 照雜湊判斷要不要重抓，
   所以改了哪本的哪個檔，只有那個檔會重新下載。
   書單順序＝上架清單的順序（選書頁排在舊的 6 本後面，下載也照這個順序）。

   改了新書的任何檔都要重跑這支，再跑 node tools/check_story.js；書單變了 sw.js 要升版（書單本身在預先快取裡）。 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

global.window = global;
const Data = require(path.join(root, 'js/story-data.js'));
global.StoryData = Data;
const shelf = JSON.parse(read('tools/tts/stories-new/_上架.json')).books;

function zhuyinOf(text) {
  const out = new Array(text.length).fill(undefined);
  Object.keys(Data.ZY_PHRASES).forEach((w) => {
    let i = text.indexOf(w);
    while (i >= 0) {
      Data.ZY_PHRASES[w].forEach((z, k) => { out[i + k] = z; });
      i = text.indexOf(w, i + w.length);
    }
  });
  for (let i = 0; i < text.length; i++) if (out[i] === undefined) out[i] = Data.ZY[text[i]] || null;
  return out;
}

const list = [];
let total = 0;
for (const id of shelf) {
  const sprBefore = new Set(Object.keys(Data.SPRITES));
  (0, eval)(read(`js/books/${id}-script.js`));
  (0, eval)(read(`js/books/${id}.js`));
  const script = Data.BOOK_SCRIPTS[id];
  const st = Data.STAGING[id];
  if (!script || !st) throw new Error(id + '：js/books 裡的兩個檔沒有註冊這本');
  const actors = Object.keys(Data.SPRITES).filter((a) => !sprBefore.has(a));

  const files = new Set([`js/books/${id}-script.js`, `js/books/${id}.js`]);
  script.pages.forEach((p) => ['zh', 'en'].forEach((l) => p[l] && files.add(p[l].audio)));
  actors.forEach((a) => Object.values(Data.SPRITES[a]).forEach((d) => d.src && files.add(d.src)));
  st.pages.forEach((p) => files.add(p.bg));
  files.add(st.cover.bg);
  const hero = Data.SPRITES[st.cover.actor][st.cover.pose].src;

  // 磁碟上有、但分鏡沒用到的圖：提醒一下（別把用不到的檔放進版本庫）
  const dir = `assets/books/${id}`;
  const unused = fs.readdirSync(path.join(root, dir)).map((f) => dir + '/' + f).filter((f) => !files.has(f));
  if (unused.length) console.log(`  ${id}：沒用到的檔 ${unused.length} 個：${unused.map((f) => path.basename(f)).join(' ')}`);

  let size = 0;
  const rows = [...files].sort().map((f) => {
    const buf = fs.readFileSync(path.join(root, f));
    size += buf.length;
    return [f, crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10), buf.length];
  });
  total += size;
  const zy = zhuyinOf(script.title.zh);
  list.push({ id, title: script.title, zy, cover: { bg: st.cover.bg, hero }, size, files: rows });
  console.log(`${id} ${script.title.zh}：${rows.length} 個檔、${(size / 1048576).toFixed(1)} MB`);
}
const js = '/* 由 tools/build_books.js 產生，不要手改：新書的書單（書名、封面、要下載的檔與雜湊）。\n' +
  '   js/book-sync.js 照這份在背景下載、js/story.js 照這份排選書頁。 */\n' +
  'window.STORY_BOOKS = ' + JSON.stringify(list) + ';\n';
fs.writeFileSync(path.join(root, 'js/story-books.js'), js);
console.log(`共 ${list.length} 本、${(total / 1048576).toFixed(1)} MB；js/story-books.js ${(js.length / 1024).toFixed(1)} KB`);
