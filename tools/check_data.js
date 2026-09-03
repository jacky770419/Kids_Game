#!/usr/bin/env node
/*
 * check_data.js — 資料驗證腳本（Node 直跑、零依賴）。
 *
 * 用法：
 *   node tools/check_data.js [repo根目錄]
 *   （不給參數時，預設用「這支腳本所在目錄的上一層」當 repo 根目錄）
 *
 * 目的：這個專案的資料檔（words.json、線稿、拼圖圖片…）全部是手寫的、
 * 沒有 schema 檢查；打錯一個 id、少畫一個 fill、撞到同一個 name，
 * 都要等真的在瀏覽器裡點壞了才會發現。這支腳本在 commit 前把這類錯誤攔下來。
 *
 * 各資料檔在瀏覽器裡是用 <script> 標籤載入的全域變數（不是 ES module），
 * 所以這裡用 Function 建構子在一個「假 window」情境下執行檔案內容，
 * 執行完再從函式作用域或假 window 上把資料撈出來（詳見 loadScript）。
 *
 * 有任何一項檢查失敗，最後會印總結並以 exit code 1 結束（給 CI／pre-commit 掛勾用）。
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------- 小工具 ----------

const errors = [];   // 全域錯誤清單，每筆是一行可讀的訊息
const groups = [];   // 每個檢查群組的摘要行，最後依序印出

function fail(msg) {
  errors.push(msg);
}

function group(title, count) {
  groups.push({ title, count, ok: true });
  return groups[groups.length - 1];
}

function markGroupFailed(g) {
  g.ok = false;
}

/* 用 Function 建構子在「假 window」情境下跑一支 classic script，
   然後把指定的全域變數撈出來。
   - 大部分檔案是 `const X = [...]`，X 只存在於這個 Function 的函式作用域裡，
     所以要在同一段程式碼字串的尾巴接一行 `return X`，才拿得到值
     （分開兩次 new Function 執行的話，作用域不共用，拿不到）。
   - 有些檔案額外把值掛到 window.X（例如 lineart-animals.js 尾巴的
     `window.LINEART_ANIMALS = LINEART_ANIMALS;`），掛與不掛兩種情況都要接得住，
     所以 return 運算式寫成「函式作用域裡有就用那個，沒有就退回 window.X」。
   - stamps-data.js 用到瀏覽器的 Path2D（畫 icon 用），Node 沒有這個建構子，
     這裡給一個最陽春的假 class 頂著，反正驗證只在意資料形狀，不需要真的畫得出來。 */
function loadScript(filePath, varName) {
  const code = fs.readFileSync(filePath, 'utf8');
  class Path2D { constructor(d) { this.d = d; } }
  const fn = new Function(
    'window', 'Path2D',
    code + `\n;return (typeof ${varName} !== 'undefined') ? ${varName} : (window && window.${varName});`
  );
  return fn({}, Path2D);
}

function fileExists(root, relPath) {
  if (typeof relPath !== 'string' || !relPath) return false;
  return fs.existsSync(path.join(root, relPath));
}

function readPngSize(absPath) {
  const buf = fs.readFileSync(absPath);
  const isPng = buf.length >= 24 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a;
  if (!isPng) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// ---------- 主流程 ----------

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));

if (!fs.existsSync(root)) {
  console.error(`✘ 找不到 repo 根目錄：${root}`);
  process.exit(1);
}

console.log(`檢查資料檔（root＝${root}）\n`);

// ===== 1. words.json =====
{
  const relPath = 'assets/data/words.json';
  const absPath = path.join(root, relPath);
  let words = null;
  try {
    words = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  } catch (e) {
    fail(`words.json：無法解析為 JSON（${e.message}）`);
  }

  if (words !== null) {
    if (!Array.isArray(words)) {
      fail('words.json：頂層不是陣列');
    } else {
      const g = group('words.json', words.length);
      const seenIds = new Map(); // id -> 第幾筆（1-based）
      words.forEach((w, i) => {
        const n = i + 1;
        const tag = `words.json 第 ${n} 筆`;

        if (!w || typeof w !== 'object') {
          fail(`${tag}：不是物件`);
          return;
        }
        // id：非空、全小寫英數
        if (typeof w.id !== 'string' || !w.id) {
          fail(`${tag}：id 缺漏或非字串`);
        } else {
          if (!/^[a-z0-9]+$/.test(w.id)) {
            fail(`${tag}：id="${w.id}" 不是全小寫英數`);
          }
          if (seenIds.has(w.id)) {
            fail(`${tag}：id="${w.id}" 與第 ${seenIds.get(w.id)} 筆重複`);
          } else {
            seenIds.set(w.id, n);
          }
        }
        // word：非空
        if (typeof w.word !== 'string' || !w.word) {
          fail(`${tag}（id=${w.id}）：word 缺漏或空字串`);
        }
        // zh：非空
        if (typeof w.zh !== 'string' || !w.zh) {
          fail(`${tag}（id=${w.id}）：zh 缺漏或空字串`);
        }
        // image：檔案要存在
        if (typeof w.image !== 'string' || !w.image) {
          fail(`${tag}（id=${w.id}）：image 缺漏或空字串`);
        } else if (!fileExists(root, w.image)) {
          fail(`${tag}（id=${w.id}）：image="${w.image}" 檔案不存在`);
        }
        // tags：非空陣列
        if (!Array.isArray(w.tags) || w.tags.length === 0) {
          fail(`${tag}（id=${w.id}）：tags 不是陣列或是空陣列`);
        }
        // audio：字串，空字串合法；非空時檔案要存在
        if (typeof w.audio !== 'string') {
          fail(`${tag}（id=${w.id}）：audio 不是字串`);
        } else if (w.audio && !fileExists(root, w.audio)) {
          fail(`${tag}（id=${w.id}）：audio="${w.audio}" 檔案不存在`);
        }
      });
      if (errors.some((e) => e.startsWith('words.json'))) markGroupFailed(g);
    }
  }
}

// ===== 2. 五支線稿檔 =====
const LINEART_CATS = new Set(['animal', 'fantasy', 'food', 'scene', 'other']);

// name 要跨五個檔案全域唯一（進度存檔用 name 當 key）
const globalLineartNames = new Map(); // name -> '檔名 第N筆'

function checkVectorLineartFile(fileRel, varName) {
  const absPath = path.join(root, fileRel);
  let list;
  try {
    list = loadScript(absPath, varName);
  } catch (e) {
    fail(`${fileRel}：載入失敗（${e.message}）`);
    group(fileRel, 0);
    markGroupFailed(groups[groups.length - 1]);
    return;
  }
  if (!Array.isArray(list)) {
    fail(`${fileRel}：${varName} 不是陣列`);
    group(fileRel, 0);
    markGroupFailed(groups[groups.length - 1]);
    return;
  }
  const g = group(fileRel, list.length);
  let localFail = false;
  list.forEach((item, i) => {
    const n = i + 1;
    const tag = `${fileRel} 第 ${n} 筆`;
    if (!item || typeof item !== 'object') {
      fail(`${tag}：不是物件`); localFail = true; return;
    }
    // name：非空、跨五檔全域唯一
    if (typeof item.name !== 'string' || !item.name) {
      fail(`${tag}：name 缺漏或空字串`); localFail = true;
    } else {
      if (globalLineartNames.has(item.name)) {
        fail(`${tag}：name="${item.name}" 與 ${globalLineartNames.get(item.name)} 撞名（跨檔 name 需全域唯一，進度存檔用 name 當 key，撞名會互相覆蓋）`);
        localFail = true;
      } else {
        globalLineartNames.set(item.name, tag);
      }
    }
    // cat：若有寫，必須在合法集合裡（沒寫不算錯，由 coloring.js 用檔案預設值補）
    if (Object.prototype.hasOwnProperty.call(item, 'cat') && item.cat !== undefined) {
      if (!LINEART_CATS.has(item.cat)) {
        fail(`${tag}（name=${item.name}）：cat="${item.cat}" 不在合法集合（${[...LINEART_CATS].join('/')}）`);
        localFail = true;
      }
    }
    // svg：要有 <svg、viewBox、以 </svg> 收尾，且至少一個 class="c" 元素、每個都要有 fill=
    if (typeof item.svg !== 'string' || !item.svg) {
      fail(`${tag}（name=${item.name}）：svg 缺漏或空字串`); localFail = true;
    } else {
      const svg = item.svg.trim();
      if (svg.indexOf('<svg') === -1) {
        fail(`${tag}（name=${item.name}）：svg 沒有 <svg 開頭標籤`); localFail = true;
      }
      if (svg.indexOf('viewBox') === -1) {
        fail(`${tag}（name=${item.name}）：svg 缺 viewBox`); localFail = true;
      }
      if (!svg.endsWith('</svg>')) {
        fail(`${tag}（name=${item.name}）：svg 沒有以 </svg> 收尾（標籤可能沒對稱閉合）`); localFail = true;
      }
      // 找出每個 class="c" 的元素標籤，逐一確認有 fill=
      const classCTagRe = /<[a-zA-Z][^>]*\bclass="c"[^>]*>/g;
      const matches = svg.match(classCTagRe) || [];
      if (matches.length === 0) {
        fail(`${tag}（name=${item.name}）：svg 找不到任何 class="c" 的可上色元素`); localFail = true;
      } else {
        matches.forEach((tagStr, idx) => {
          if (!/\bfill="[^"]*"/.test(tagStr)) {
            fail(`${tag}（name=${item.name}）：第 ${idx + 1} 個 class="c" 元素缺 fill 屬性`);
            localFail = true;
          }
        });
      }
    }
  });
  if (localFail) markGroupFailed(g);
}

checkVectorLineartFile('js/lineart-data.js', 'LINEART');
checkVectorLineartFile('js/lineart-animals.js', 'LINEART_ANIMALS');
checkVectorLineartFile('js/lineart-fantasy.js', 'LINEART_FANTASY');
checkVectorLineartFile('js/lineart-food.js', 'LINEART_FOOD');

// 場景線稿（點陣 PNG stencil）
{
  const fileRel = 'js/lineart-scenes.js';
  const absPath = path.join(root, fileRel);
  let list;
  try {
    list = loadScript(absPath, 'LINEART_SCENES');
  } catch (e) {
    fail(`${fileRel}：載入失敗（${e.message}）`);
    list = null;
  }
  if (list !== null) {
    if (!Array.isArray(list)) {
      fail(`${fileRel}：LINEART_SCENES 不是陣列`);
    } else {
      const g = group(fileRel, list.length);
      let localFail = false;
      list.forEach((item, i) => {
        const n = i + 1;
        const tag = `${fileRel} 第 ${n} 筆`;
        if (!item || typeof item !== 'object') {
          fail(`${tag}：不是物件`); localFail = true; return;
        }
        if (typeof item.name !== 'string' || !item.name) {
          fail(`${tag}：name 缺漏或空字串`); localFail = true;
        } else {
          if (globalLineartNames.has(item.name)) {
            fail(`${tag}：name="${item.name}" 與 ${globalLineartNames.get(item.name)} 撞名（跨檔 name 需全域唯一）`);
            localFail = true;
          } else {
            globalLineartNames.set(item.name, tag);
          }
        }
        if (typeof item.src !== 'string' || !item.src) {
          fail(`${tag}（name=${item.name}）：src 缺漏或空字串`); localFail = true;
        } else {
          const srcAbs = path.join(root, item.src);
          if (!fs.existsSync(srcAbs)) {
            fail(`${tag}（name=${item.name}）：src="${item.src}" 檔案不存在`); localFail = true;
          } else {
            const dim = readPngSize(srcAbs);
            if (!dim) {
              fail(`${tag}（name=${item.name}）：src="${item.src}" 不是合法 PNG（magic bytes 不符）`); localFail = true;
            } else {
              if (dim.width !== dim.height) {
                fail(`${tag}（name=${item.name}）：src 不是正方形（${dim.width}x${dim.height}）`); localFail = true;
              }
              if (dim.width < 800 || dim.width > 2048) {
                fail(`${tag}（name=${item.name}）：src 邊長 ${dim.width} 不在 800～2048 之間`); localFail = true;
              }
            }
          }
        }
      });
      if (localFail) markGroupFailed(g);
    }
  } else {
    group(fileRel, 0);
    markGroupFailed(groups[groups.length - 1]);
  }
}

// ===== 3. pictures-data.js =====
{
  const fileRel = 'js/pictures-data.js';
  const absPath = path.join(root, fileRel);
  let list;
  try {
    list = loadScript(absPath, 'PICTURES');
  } catch (e) {
    fail(`${fileRel}：載入失敗（${e.message}）`);
    list = null;
  }
  if (list !== null) {
    if (!Array.isArray(list)) {
      fail(`${fileRel}：PICTURES 不是陣列`);
    } else {
      const g = group(fileRel, list.length);
      let localFail = false;
      const seenNames = new Map();
      list.forEach((item, i) => {
        const n = i + 1;
        const tag = `${fileRel} 第 ${n} 筆`;
        if (!item || typeof item !== 'object') {
          fail(`${tag}：不是物件`); localFail = true; return;
        }
        if (typeof item.name !== 'string' || !item.name) {
          fail(`${tag}：name 缺漏或空字串`); localFail = true;
        } else if (seenNames.has(item.name)) {
          fail(`${tag}：name="${item.name}" 與第 ${seenNames.get(item.name)} 筆重複`);
          localFail = true;
        } else {
          seenNames.set(item.name, n);
        }
        if (typeof item.src !== 'string' || !item.src) {
          fail(`${tag}（name=${item.name}）：src 缺漏或空字串`); localFail = true;
        } else if (!fileExists(root, item.src)) {
          fail(`${tag}（name=${item.name}）：src="${item.src}" 檔案不存在`); localFail = true;
        }
      });
      if (localFail) markGroupFailed(g);
    }
  } else {
    group(fileRel, 0);
    markGroupFailed(groups[groups.length - 1]);
  }
}

// ===== 4. stamps-data.js／patterns-data.js（最低限度檢查）=====
// stamps-data.js：window.STAMPS 是印章清單，每筆要有 id（蓋章時的識別碼，理論上要能存進
// 存檔／設定）、name（UI 顯示用）、draw（實際畫圖的函式）。這裡不驗證 draw 畫出來的圖形對不對
// （那要真的有 canvas 才能比對像素，不值得為了這支腳本引入畫布相依套件），只驗證資料形狀：
// id／name 齊全且唯一、draw 是函式。
{
  const fileRel = 'js/stamps-data.js';
  const absPath = path.join(root, fileRel);
  let list;
  try {
    list = loadScript(absPath, 'STAMPS');
  } catch (e) {
    fail(`${fileRel}：載入失敗（${e.message}）`);
    list = null;
  }
  if (list !== null) {
    if (!Array.isArray(list)) {
      fail(`${fileRel}：STAMPS 不是陣列`);
    } else {
      const g = group(fileRel, list.length);
      let localFail = false;
      const seenIds = new Map();
      list.forEach((item, i) => {
        const n = i + 1;
        const tag = `${fileRel} 第 ${n} 筆`;
        if (!item || typeof item !== 'object') {
          fail(`${tag}：不是物件`); localFail = true; return;
        }
        if (typeof item.id !== 'string' || !item.id) {
          fail(`${tag}：id 缺漏或空字串`); localFail = true;
        } else if (seenIds.has(item.id)) {
          fail(`${tag}：id="${item.id}" 與第 ${seenIds.get(item.id)} 筆重複`);
          localFail = true;
        } else {
          seenIds.set(item.id, n);
        }
        if (typeof item.name !== 'string' || !item.name) {
          fail(`${tag}（id=${item.id}）：name 缺漏或空字串`); localFail = true;
        }
        if (typeof item.draw !== 'function') {
          fail(`${tag}（id=${item.id}）：draw 不是函式`); localFail = true;
        }
      });
      if (localFail) markGroupFailed(g);
    }
  } else {
    group(fileRel, 0);
    markGroupFailed(groups[groups.length - 1]);
  }
}

// patterns-data.js：PATTERNS 是花紋顏料清單，每筆要有 id（顏料識別碼）、name（UI 顯示）、
// tile（一段 SVG 片段字串，鋪成花紋磚）。這裡只驗證形狀與 id 唯一，不驗證 tile 的 SVG
// 語法是否完整成一個標籤（tile 本身就是「一堆標籤片段」，不是獨立 <svg>…</svg>，
// 所以不套用線稿那組 <svg>/viewBox/</svg> 檢查，只驗證非空字串）。
{
  const fileRel = 'js/patterns-data.js';
  const absPath = path.join(root, fileRel);
  let list;
  try {
    list = loadScript(absPath, 'PATTERNS');
  } catch (e) {
    fail(`${fileRel}：載入失敗（${e.message}）`);
    list = null;
  }
  if (list !== null) {
    if (!Array.isArray(list)) {
      fail(`${fileRel}：PATTERNS 不是陣列`);
    } else {
      const g = group(fileRel, list.length);
      let localFail = false;
      const seenIds = new Map();
      list.forEach((item, i) => {
        const n = i + 1;
        const tag = `${fileRel} 第 ${n} 筆`;
        if (!item || typeof item !== 'object') {
          fail(`${tag}：不是物件`); localFail = true; return;
        }
        if (typeof item.id !== 'string' || !item.id) {
          fail(`${tag}：id 缺漏或空字串`); localFail = true;
        } else if (seenIds.has(item.id)) {
          fail(`${tag}：id="${item.id}" 與第 ${seenIds.get(item.id)} 筆重複`);
          localFail = true;
        } else {
          seenIds.set(item.id, n);
        }
        if (typeof item.name !== 'string' || !item.name) {
          fail(`${tag}（id=${item.id}）：name 缺漏或空字串`); localFail = true;
        }
        if (typeof item.tile !== 'string' || !item.tile.trim()) {
          fail(`${tag}（id=${item.id}）：tile 缺漏或空字串`); localFail = true;
        }
      });
      if (localFail) markGroupFailed(g);
    }
  } else {
    group(fileRel, 0);
    markGroupFailed(groups[groups.length - 1]);
  }
}

// ---------- 輸出 ----------

console.log('== 檢查結果 ==');
groups.forEach((g) => {
  if (g.ok) {
    console.log(`✔ ${g.title}（${g.count} 筆）`);
  } else {
    console.log(`✘ ${g.title}（${g.count} 筆，內含錯誤，詳見下方）`);
  }
});

if (errors.length > 0) {
  console.log('\n== 錯誤明細 ==');
  errors.forEach((e) => console.log(`✘ ${e}`));
}

// cat 統計：把四支向量線稿檔的 cat 攤平算一次，沒寫 cat 的用檔案預設值補
// （對齊 coloring.js 的規則：lineart-data.js 逐筆自帶 cat；animals 預設 animal、
// fantasy 預設 fantasy、food 預設 food；scenes 檔全部算 scene）
{
  const catCount = { animal: 0, fantasy: 0, food: 0, scene: 0, other: 0 };
  function addFromFile(fileRel, varName, defaultCat) {
    try {
      const list = loadScript(path.join(root, fileRel), varName);
      if (Array.isArray(list)) {
        list.forEach((item) => {
          const cat = (item && LINEART_CATS.has(item.cat)) ? item.cat : defaultCat;
          if (Object.prototype.hasOwnProperty.call(catCount, cat)) catCount[cat] += 1;
        });
      }
    } catch (e) {
      // 載入失敗已經在上面報過錯，這裡跳過統計即可
    }
  }
  addFromFile('js/lineart-data.js', 'LINEART', 'other');
  addFromFile('js/lineart-animals.js', 'LINEART_ANIMALS', 'animal');
  addFromFile('js/lineart-fantasy.js', 'LINEART_FANTASY', 'fantasy');
  addFromFile('js/lineart-food.js', 'LINEART_FOOD', 'food');
  try {
    const scenes = loadScript(path.join(root, 'js/lineart-scenes.js'), 'LINEART_SCENES');
    if (Array.isArray(scenes)) catCount.scene += scenes.length;
  } catch (e) { /* 已在上面報過錯 */ }

  console.log('\n== 著色線稿分類張數統計（含檔案預設值補上的 cat） ==');
  Object.keys(catCount).forEach((cat) => {
    console.log(`  ${cat}：${catCount[cat]} 張`);
  });
  const total = Object.values(catCount).reduce((a, b) => a + b, 0);
  console.log(`  總計：${total} 張`);
}

console.log(`\n== 總結：${errors.length === 0 ? '全部通過' : `${errors.length} 項錯誤`} ==`);

if (errors.length > 0) {
  process.exit(1);
}
