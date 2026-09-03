#!/usr/bin/env node
/*
 * check_speech.js — js/speech.js 的離線單元驗證（Node 直跑、零依賴）。
 *
 * 為什麼要有這支：speech.js 的重點不是「會不會出聲」，而是「挑到哪一顆語音」。
 * 挑錯語音（例如裝置設中文時抓到中文語音去唸 bear）在開發機上完全看不出來——
 * 沒有錯誤、沒有例外，只有小孩聽到錯的發音。挑選邏輯是純資料判斷，
 * 用假的 speechSynthesis 就能在 Node 裡驗完，不必開瀏覽器。
 *
 * 驗三件事：
 *   1. 語音清單裡有 Samantha 時要挑 Samantha（不是排在前面的 Google／日文語音）
 *   2. say() 出去的 utterance 是 lang='en-US'、rate=0.85，而且 speak 之前先 cancel 過
 *   3. 首次 getVoices() 回空陣列（iOS 的常態）時不能把「沒有語音」記成結論，
 *      voiceschanged 事件來了之後要重算並挑到 Samantha
 *
 * 跑法：node tools/check_speech.js  → 全綠 exit 0，任一項失敗 exit 1。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'speech.js'), 'utf8');

const failures = [];
function check(ok, msg) {
  console.log((ok ? '✔ ' : '✘ ') + msg);
  if (!ok) failures.push(msg);
}

/* 建一個假瀏覽器環境跑 speech.js。
   makeVoices 是一個函式而不是固定陣列，這樣才模擬得出「第一次回空、之後才有東西」。 */
function makeEnv(makeVoices) {
  const calls = [];              // 依序記錄 cancel / speak，用來驗證順序
  const spoken = [];             // 每次 speak 的 utterance
  const listeners = {};

  function SpeechSynthesisUtterance(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.voice = null;
  }

  const speechSynthesis = {
    getVoices: makeVoices,
    cancel: function () { calls.push('cancel'); },
    speak: function (u) { calls.push('speak'); spoken.push(u); },
    addEventListener: function (type, fn) {
      (listeners[type] = listeners[type] || []).push(fn);
    }
  };

  const window = { speechSynthesis: speechSynthesis, SpeechSynthesisUtterance: SpeechSynthesisUtterance };
  const sandbox = { window: window, SpeechSynthesisUtterance: SpeechSynthesisUtterance, console: console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox, { filename: 'js/speech.js' });

  return {
    Speech: window.Speech,
    calls: calls,
    spoken: spoken,
    fire: function (type) { (listeners[type] || []).forEach(fn => fn()); },
    listeners: listeners
  };
}

const VOICES = [
  { name: 'Kyoko', lang: 'ja-JP' },
  { name: 'Google US English', lang: 'en-US' },
  { name: 'Samantha', lang: 'en-US' },
  { name: 'Daniel', lang: 'en-GB' }
];

console.log('== js/speech.js 單元驗證 ==\n');

// ---------- 情境 1：語音清單一開始就有 ----------
{
  const env = makeEnv(() => VOICES);
  check(!!env.Speech && typeof env.Speech.say === 'function', '情境1：window.Speech.say 存在');
  check(typeof env.Speech.cancel === 'function', '情境1：window.Speech.cancel 存在');

  env.Speech.say('bear');
  check(env.spoken.length === 1, '情境1：say() 送出一個 utterance');
  const u = env.spoken[0];
  check(!!u && u.voice && u.voice.name === 'Samantha',
    '情境1：挑到 Samantha（實際＝' + (u && u.voice ? u.voice.name : '無') + '）');
  check(!!u && u.lang === 'en-US', '情境1：lang＝en-US（實際＝' + (u ? u.lang : '無') + '）');
  check(!!u && u.rate === 0.85, '情境1：rate＝0.85（實際＝' + (u ? u.rate : '無') + '）');
  check(!!u && u.text === 'bear', '情境1：唸的字是 bear');
  check(env.calls.join(',') === 'cancel,speak',
    '情境1：speak 之前先 cancel（實際順序＝' + env.calls.join(',') + '）');

  // 連點兩次：每一次都要先 cancel，語音才不會排隊
  env.Speech.say('duck');
  check(env.calls.join(',') === 'cancel,speak,cancel,speak',
    '情境1：連續呼叫每次都先 cancel（實際＝' + env.calls.join(',') + '）');

  // 沒有文字就什麼都不做
  const before = env.calls.length;
  env.Speech.say('');
  check(env.calls.length === before, '情境1：空字串不出聲');
}

// ---------- 情境 2：首次 getVoices() 回空陣列，voiceschanged 之後才有 ----------
{
  let ready = false;
  const env = makeEnv(() => (ready ? VOICES : []));
  check(!!env.listeners['voiceschanged'] && env.listeners['voiceschanged'].length > 0,
    '情境2：有掛上 voiceschanged 監聽器');

  env.Speech.say('bear');
  const u1 = env.spoken[0];
  check(!!u1 && !u1.voice, '情境2：清單還空的時候不指定 voice（交給系統猜），但照樣出聲');
  check(!!u1 && u1.lang === 'en-US', '情境2：清單空的時候 lang 仍是 en-US');

  ready = true;
  env.fire('voiceschanged');
  env.Speech.say('bear');
  const u2 = env.spoken[1];
  check(!!u2 && u2.voice && u2.voice.name === 'Samantha',
    '情境2：voiceschanged 後重算並挑到 Samantha（實際＝' + (u2 && u2.voice ? u2.voice.name : '無') + '）');
}

// ---------- 情境 3：只有非英文語音時不亂抓 ----------
{
  const env = makeEnv(() => [{ name: 'Kyoko', lang: 'ja-JP' }, { name: 'Mei-Jia', lang: 'zh-TW' }]);
  env.Speech.say('bear');
  const u = env.spoken[0];
  check(!!u && !u.voice,
    '情境3：一顆英文語音都沒有時不指定 voice（不能抓中文／日文語音去唸英文）');
}

// ---------- 情境 4：opts.lang 覆寫成中文時不套英文語音 ----------
{
  const env = makeEnv(() => VOICES);
  env.Speech.say('ㄒㄩㄥˊ', { lang: 'zh-TW' });
  const u = env.spoken[0];
  check(!!u && u.lang === 'zh-TW', '情境4：opts.lang 覆寫生效（實際＝' + (u ? u.lang : '無') + '）');
  check(!!u && !u.voice, '情境4：非英文時不套英文語音');
}

// ---------- 情境 5：沒有 speechSynthesis 的環境要安靜略過 ----------
{
  const window = {};
  const sandbox = { window: window, console: console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  let threw = null;
  try {
    vm.runInContext(SRC, sandbox, { filename: 'js/speech.js' });
    window.Speech.say('bear');
    window.Speech.cancel();
  } catch (e) { threw = e; }
  check(threw === null, '情境5：沒有 speechSynthesis 時不丟例外（實際＝' + (threw ? threw.message : '無') + '）');
}

console.log('\n== 總結：' + (failures.length === 0 ? '全部通過' : failures.length + ' 項失敗') + ' ==');
if (failures.length) process.exit(1);
