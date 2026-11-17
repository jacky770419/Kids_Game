#!/usr/bin/env node
/* 動動腦的自動操作＋截圖工具（零依賴：Node 22 以上內建 fetch／WebSocket，瀏覽器用本機的 Edge 無頭模式）。

   為什麼要有：邏輯小遊戲幾乎都是「拖過去、看反應」，只截一張靜態圖驗不出來。
   這支用瀏覽器的除錯通道真的按、真的拖，再截圖，順便把頁面上的錯誤印出來。

   用法：
     node tools/logic_drive.js <步驟檔.json> [--port 8091] [--size 1180x820] [--out 資料夾]
   伺服器自己先開（不要送 sw.js，免得吃到舊快取）：
     python .claude/serve_nosw.py . 8091
   步驟檔是一個陣列，每一步是下面其中一種：
     { "open": "logic.html?h=tidy&l=0" }      開頁面（相對於伺服器根目錄）
     { "wait": 500 }                           等幾毫秒
     { "tap": ".lg-card" }                     點某個元素的中心（CSS 選擇器；也可以給 [x, y]）
     { "drag": [".toy.ball", ".basket.roll"] } 從 A 的中心拖到 B 的中心（也可以給 [x, y]）
     { "eval": "document.title" }              在頁面裡跑一段 JS，印出結果
     { "shot": "tidy-1.png" }                  截圖存到 --out 資料夾
     { "expect": "JS 運算式", "why": "說明" }  運算式要是 true，不然記一筆失敗
   全部跑完：有頁面錯誤或 expect 失敗就 exit 1。只會結束自己開的那個 Edge（用 PID），不會動到別人的。 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const stepsFile = args[0];
if (!stepsFile) { console.error('用法：node tools/logic_drive.js <步驟檔.json> [--port 8091] [--size 1180x820] [--out 資料夾]'); process.exit(2); }
const port = parseInt(opt('port', '8091'), 10);
const [W, H] = opt('size', '1180x820').split('x').map((n) => parseInt(n, 10));
const outDir = path.resolve(opt('out', path.dirname(stepsFile)));
const steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8'));
const EDGE = process.env.EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'logic-drive-'));
  const dbgPort = 9300 + Math.floor(Math.random() * 600);
  const edge = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--no-first-run',
    '--user-data-dir=' + prof, '--remote-debugging-port=' + dbgPort,
    '--window-size=' + W + ',' + H, 'about:blank'
  ], { stdio: 'ignore' });
  const problems = [];
  let ws = null;
  try {
    let target = null;
    for (let i = 0; i < 40 && !target; i++) {
      await sleep(250);
      try {
        const list = await (await fetch('http://127.0.0.1:' + dbgPort + '/json')).json();
        target = list.find((t) => t.type === 'page');
      } catch (e) { /* 還沒起來 */ }
    }
    if (!target) throw new Error('Edge 沒有起來');
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let seq = 0;
    const waiting = new Map();
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); return; }
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        problems.push('頁面錯誤：' + ((d.exception && d.exception.description) || d.text));
      }
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        problems.push('console.error：' + m.params.args.map((a) => a.value || a.description || '').join(' '));
      }
      if (m.method === 'Network.loadingFailed' || (m.method === 'Network.responseReceived' && m.params.response.status >= 400)) {
        const u = m.method === 'Network.loadingFailed' ? m.params.requestId : m.params.response.url;
        if (!/favicon|sw\.js/.test(String(u)) && m.method !== 'Network.loadingFailed') problems.push('載不到：' + u + '（' + m.params.response.status + '）');
      }
    };
    const send = (method, params) => new Promise((res) => {
      const id = ++seq;
      waiting.set(id, res);
      ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });

    const evalJs = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result && r.result.exceptionDetails) throw new Error('eval 失敗：' + expr + ' → ' + JSON.stringify(r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description));
      return r.result && r.result.result ? r.result.result.value : undefined;
    };
    const point = async (p) => {
      if (Array.isArray(p)) return p;
      const v = await evalJs('(() => { const e = document.querySelector(' + JSON.stringify(p) + '); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()');
      if (!v) throw new Error('找不到元素：' + p);
      return v;
    };
    const mouse = (type, x, y, extra) => send('Input.dispatchMouseEvent', Object.assign({ type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 }, extra || {}));

    for (const s of steps) {
      if (s.open !== undefined) {
        // 本機伺服器忙的時候會漏接檔案（頁面變成半套）：確認外殼和圖都載到了，不然重載，最多 4 次
        let ready = false;
        for (let n = 0; n < 4 && !ready; n++) {
          await send('Page.navigate', { url: 'http://127.0.0.1:' + port + '/' + s.open });
          await sleep(s.settle || 1200);
          ready = await evalJs("document.readyState === 'complete' && (!/logic\.html/.test(location.pathname) || (!!window.Logic && !!window.UI && Logic._houses.length >= 1 && Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0)))").catch(() => false);
          if (!ready) { problems.length = 0; await sleep(600); }
        }
        if (!ready) problems.push('頁面一直載不完整：' + s.open);
      } else if (s.wait !== undefined) {
        await sleep(s.wait);
      } else if (s.tap !== undefined) {
        const [x, y] = await point(s.tap);
        await mouse('mousePressed', x, y);
        await sleep(40);
        await mouse('mouseReleased', x, y);
        await sleep(s.settle || 250);
      } else if (s.drag !== undefined) {
        const [x1, y1] = await point(s.drag[0]);
        const [x2, y2] = await point(s.drag[1]);
        await mouse('mousePressed', x1, y1);
        for (let i = 1; i <= 8; i++) {
          await mouse('mouseMoved', x1 + (x2 - x1) * i / 8, y1 + (y2 - y1) * i / 8);
          await sleep(20);
        }
        await mouse('mouseReleased', x2, y2);
        await sleep(s.settle || 450);
      } else if (s.eval !== undefined) {
        console.log('eval ' + s.eval + ' → ' + JSON.stringify(await evalJs(s.eval)));
      } else if (s.expect !== undefined) {
        const ok = await evalJs('!!(' + s.expect + ')');
        if (!ok) problems.push('不符預期：' + (s.why || s.expect));
        else console.log('OK  ' + (s.why || s.expect));
      } else if (s.shot !== undefined) {
        const r = await send('Page.captureScreenshot', { format: 'png' });
        const file = path.join(outDir, s.shot);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
        console.log('截圖 ' + file);
      }
    }
  } catch (e) {
    problems.push(String(e && e.message || e));
  } finally {
    try { if (ws) ws.close(); } catch (e) { /* 略過 */ }
    try { process.kill(edge.pid); } catch (e) { /* 已經關了 */ }
    await sleep(400);
    try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) { /* 設定檔還被占著就留給系統清 */ }
  }
  if (problems.length) {
    console.error('有 ' + problems.length + ' 個問題：');
    problems.forEach((p, i) => console.error('  ' + (i + 1) + '. ' + p));
    process.exit(1);
  }
  console.log('全部通過');
})();
