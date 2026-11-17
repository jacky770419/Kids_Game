#!/usr/bin/env node
/* 把動動腦要錄音的台詞印成 JSON（給 el_logic.py 用）：[{ id, zh, en }, …]
   台詞的唯一來源是 js/logic.js 和 js/logic-<小屋>.js 裡的 Logic.lines()，這裡不另外抄一份。
   小屋名字（*.name）只畫在選單卡片上、程式不會念，所以不錄。 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

global.window = global;
global.document = { addEventListener() {}, readyState: 'loading', getElementById() { return null; } };
global.location = { search: '' };
global.StoryData = require(path.join(ROOT, 'js/story-data.js'));
global.LogicAudio = [];
require(path.join(ROOT, 'js/logic.js'));
fs.readdirSync(path.join(ROOT, 'js'))
  .filter((f) => /^logic-.+\.js$/.test(f) && f !== 'logic-audio.js')
  .forEach((f) => require(path.join(ROOT, 'js', f)));

const lines = global.Logic._lines;
const out = Object.keys(lines)
  .filter((id) => !/\.name$/.test(id))
  .map((id) => ({ id: id, zh: lines[id].zh, en: lines[id].en }));
process.stdout.write(JSON.stringify(out));
