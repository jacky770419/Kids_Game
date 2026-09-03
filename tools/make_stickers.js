#!/usr/bin/env node
/* 從既有的圖庫 SVG 產生「去底貼紙」——assets/pictures/ 底下的圖都是為了
   拼圖與單字卡畫的，每張都有整面底色方框；直接拿來當貼紙貼到場景上，
   會是一塊白方塊蓋住城堡。這支把底色剝掉，只留主體，輸出到 assets/stickers/。

   為什麼用字串／正則而不是 DOM 套件：本 repo 零依賴，Node 沒有內建 DOM。
   來源檔都是我們自己手寫或整理過的、格式一致（屬性用雙引號、rect 自閉合），
   正則在這個受控範圍內是夠的，而且 tools/check_stickers.js 會用
   「不得有寬或高 ≥ viewBox 75% 的 rect」把去底結果鎖住——剝漏了會紅燈。

   剝掉三種東西：
     1. 底色矩形：寬或高 ≥ viewBox 75% 的 <rect>（整面底色、內框、地面色帶）
     2. 只被它們引用的 <linearGradient>（底色剝掉後就成了孤兒，留著只是雜訊）
     3. EXTRA_STRIP 列出的背景裝飾：公主／人魚圖裡的星星、雲、氣泡，
        以及蘋果圖左上角的小花——它們原本是「畫面裡的背景」，底色一去掉
        就變成飄在主角旁邊的碎片。這份表是刻意寫死的：規則化的幾何判準
        （例如「離主體很遠的小圖形」）在這 21 張上只會誤殺，寫明反而好審。

   冪等：輸出只由來源檔決定，重跑不會有差異（check_stickers.js E 項實測比對雜湊）。
   不刪 assets/stickers/ 裡的其他檔案——手繪的六張貼紙也住在那裡。

   跑法：node tools/make_stickers.js */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'stickers');

/* 來源清單：[來源相對路徑, 輸出 id]。
   id 就是 assets/stickers/<id>.svg，也是 js/stickers-data.js 裡的 id。 */
const SOURCES = [
  // 動物（Kenney Animal Pack Redux, CC0）
  ['assets/pictures/animals/bear.svg', 'bear'],
  ['assets/pictures/animals/duck.svg', 'duck'],
  ['assets/pictures/animals/elephant.svg', 'elephant'],
  ['assets/pictures/animals/frog.svg', 'frog'],
  ['assets/pictures/animals/giraffe.svg', 'giraffe'],
  ['assets/pictures/animals/monkey.svg', 'monkey'],
  ['assets/pictures/animals/owl.svg', 'owl'],
  ['assets/pictures/animals/panda.svg', 'panda'],
  ['assets/pictures/animals/penguin.svg', 'penguin'],
  ['assets/pictures/animals/pig.svg', 'pig'],
  ['assets/pictures/animals/rabbit.svg', 'rabbit'],
  ['assets/pictures/animals/whale.svg', 'whale'],
  // 水果
  ['assets/pictures/fruits/apple.svg', 'apple'],
  ['assets/pictures/fruits/banana.svg', 'banana'],
  ['assets/pictures/fruits/grapes.svg', 'grapes'],
  ['assets/pictures/fruits/pineapple.svg', 'pineapple'],
  ['assets/pictures/fruits/strawberry.svg', 'strawberry'],
  ['assets/pictures/fruits/watermelon.svg', 'watermelon'],
  // 公主與人魚
  ['assets/pictures/princess.svg', 'princess'],
  ['assets/pictures/princess-braid.svg', 'princess-braid'],
  ['assets/pictures/mermaid.svg', 'mermaid']
];

/* 背景裝飾的額外剝除規則（來源相對路徑 → 一組正則）。
   每一條都附上剝的是什麼，改動來源圖時要一起看。 */
const EXTRA_STRIP = {
  // 天空裡的黃色星星群與白色雲朵群
  'assets/pictures/princess.svg': [
    /^[ \t]*<g fill="#(?:FFD166|fff)" opacity="[\d.]+">[\s\S]*?<\/g>\r?\n/gm
  ],
  'assets/pictures/princess-braid.svg': [
    /^[ \t]*<g fill="#(?:FFD166|fff)" opacity="[\d.]+">[\s\S]*?<\/g>\r?\n/gm
  ],
  // 海水裡的白色氣泡群
  'assets/pictures/mermaid.svg': [
    /^[ \t]*<g fill="#fff" opacity="[\d.]+">[\s\S]*?<\/g>\r?\n/gm
  ],
  // 左上角的裝飾小花（五片花瓣 + 花心），不是蘋果的一部分
  'assets/pictures/fruits/apple.svg': [
    /^[ \t]*<ellipse class="c" fill="#FFB7C5"[^>]*\/>\r?\n/gm,
    /^[ \t]*<circle class="c" fill="#FFE083"[^>]*cx="68"[^>]*\/>\r?\n/gm
  ]
};

// ---------- 工具 ----------

function viewBoxOf(src) {
  const m = src.match(/viewBox\s*=\s*"\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)\s*"/);
  if (!m) throw new Error('找不到 viewBox');
  return { w: parseFloat(m[3]), h: parseFloat(m[4]) };
}

/* 剝掉底色矩形：寬或高 ≥ viewBox 的 75%。
   為什麼用「或」不是「且」：princess.svg 的地面色帶是 600×60，
   只有寬達標，但它一樣是背景。主體很少用到這麼大的方塊，誤殺風險低。 */
function stripBackgroundRects(src, vb) {
  return src.replace(/^[ \t]*<rect\b[^>]*\/>[ \t]*\r?\n/gm, (line) => {
    const num = (name) => {
      const m = line.match(new RegExp(name + '\\s*=\\s*"([-\\d.]+)"'));
      return m ? parseFloat(m[1]) : NaN;
    };
    const w = num('width');
    const h = num('height');
    const big = (isFinite(w) && w >= vb.w * 0.75) || (isFinite(h) && h >= vb.h * 0.75);
    return big ? '' : line;
  });
}

/* 剝掉沒人引用的漸層；<defs> 被清空就整個拿掉。 */
function stripOrphanGradients(src) {
  let out = src;
  const gradRe = /^[ \t]*<(linearGradient|radialGradient)\b[^>]*\bid="([^"]+)"[\s\S]*?<\/\1>\r?\n/gm;
  const orphans = [];
  let m;
  while ((m = gradRe.exec(out)) !== null) {
    const id = m[2];
    // 引用只會出現在 url(#id)；把這段漸層本身排除後再找
    const rest = out.slice(0, m.index) + out.slice(m.index + m[0].length);
    if (rest.indexOf('url(#' + id + ')') < 0) orphans.push(m[0]);
  }
  orphans.forEach((block) => { out = out.replace(block, ''); });
  // 空的 <defs>（只剩空白）整段移除
  out = out.replace(/^[ \t]*<defs>\s*<\/defs>\r?\n/gm, '');
  return out;
}

/* 收尾：連續空行壓成一行，避免剝除後留下一大片空白。 */
function tidy(src) {
  return src.replace(/(\r?\n)[ \t]*(\r?\n)[ \t]*(?=\r?\n)/g, '$1').replace(/\n{3,}/g, '\n\n');
}

/* 在開頭的 <svg ...> 標籤後插一行來源註記，之後有人打開檔案才知道不該手改。 */
function stampOrigin(src, from) {
  return src.replace(/(<svg\b[^>]*>)\r?\n?/, '$1\n  <!-- 由 tools/make_stickers.js 從 ' + from
    + ' 去底產生，請勿手改；要改請改來源圖後重跑 -->\n');
}

// ---------- 主流程 ----------

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let written = 0;
  let unchanged = 0;

  SOURCES.forEach(([rel, id]) => {
    const srcPath = path.join(ROOT, rel);
    let src = fs.readFileSync(srcPath, 'utf8').replace(/\r\n/g, '\n');
    const vb = viewBoxOf(src);

    src = stripBackgroundRects(src, vb);
    (EXTRA_STRIP[rel] || []).forEach((re) => { src = src.replace(re, ''); });
    src = stripOrphanGradients(src);
    src = tidy(src);
    src = stampOrigin(src, rel);

    const outPath = path.join(OUT_DIR, id + '.svg');
    const prev = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : null;
    if (prev === src) { unchanged++; return; }
    fs.writeFileSync(outPath, src, 'utf8');
    written++;
  });

  console.log('貼紙去底完成：來源 ' + SOURCES.length + ' 張，寫入 ' + written
    + ' 張，內容相同略過 ' + unchanged + ' 張 → assets/stickers/');
}

main();
