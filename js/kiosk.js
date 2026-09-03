/* 防誤觸（kiosk）——把 iPad 上「不小心碰到就毀掉正在做的事」的幾條路堵起來。

   為什麼要有這支：使用者是五歲小孩，握 iPad 的方式跟大人不一樣——
   她會把整隻手掌壓在螢幕下緣，手腕靠著邊框，另一隻手畫畫。
   Sesame Workshop 的平板設計指南就提到這件事：幼兒的手掌與手腕常落在螢幕邊緣，
   把導覽按鈕做成「碰到就走」等於在畫圖畫到一半時隨機把作品丟掉。
   實際踩到的三種誤觸：
     1. 兩指同時碰到畫布 → Safari 把它當縮放手勢，整頁被放大、畫布跑掉
     2. 手指停在畫面上不動一秒 → 跳出「拷貝／查詢」的系統長按選單
     3. 手掌掃過左上角的 🏠 → 一次點擊就整張畫掉、回到首頁，而且沒有存檔

   對應的處理：
     1、2 由 install() 在 document 上一次攔掉（gesturestart／gesturechange／
        contextmenu／dblclick／多指 touchmove）
     3 由 attachHold() 把 🏠 從「點一下」改成「長按 700 ms」，
        按住時畫一圈進度環當回饋。

   兩條紅線：
   * touchmove 只有在 touches.length >= 2 時才攔。單指一律放行——
     著色頁的工具列與素材面板要能單指捲動（css/style.css 的 touch-action:auto），
     攔了單指就等於把面板鎖死，而畫面看起來完全正常，很難發現。
   * 長按沒撐滿就放開＝什麼都不發生：不出聲、不跳提示、不閃紅。
     全站原則是沒有計時、沒有分數、答錯不罰；進度環是回饋，不是懲罰。

   降級：HTML 的 🏠 保留 href="index.html"，這支沒載入時就退回一般連結，
   還是能回首頁，只是沒有長按保護。 */

(function () {
  'use strict';

  var HOLD_MS = 700;          // 長按門檻。比系統長按選單（約 500ms）長，比孩子的耐心短
  var HOME_URL = 'index.html';

  /* ---------- 1. 手勢攔截 ---------- */

  function block(e) { e.preventDefault(); }

  /* 多指才攔。單指是正常的捲動與畫畫，攔了會弄壞面板捲動。 */
  function blockMultiTouch(e) {
    if (e.touches && e.touches.length >= 2) e.preventDefault();
  }

  function installGestureGuards() {
    // gesturestart／gesturechange 是 Safari 專有的雙指縮放／旋轉手勢
    document.addEventListener('gesturestart', block, { passive: false });
    document.addEventListener('gesturechange', block, { passive: false });
    // 長按叫出的系統選單（拷貝／查詢／分享）
    document.addEventListener('contextmenu', block, { passive: false });
    // iOS 的雙擊縮放：即使 viewport 寫了 user-scalable=no，某些版本仍會殘留
    document.addEventListener('dblclick', block, { passive: false });
    /* passive:false 是必要的，不是保險：touchmove 在多數瀏覽器預設 passive，
       passive 的 handler 呼叫 preventDefault 會被直接忽略（而且不會報錯）。 */
    document.addEventListener('touchmove', blockMultiTouch, { passive: false });
  }

  /* ---------- 2. 長按回首頁 ---------- */

  function attachHold(el) {
    if (!el || el.__kioskHold) return;   // 同一顆按鈕只接管一次
    el.__kioskHold = true;

    var timer = null;      // 滿門檻導頁的計時器（真正在計時的是它，不是動畫）
    var rafId = null;      // 進度環的更新迴圈
    var startAt = 0;
    var activeId = null;   // 目前按住的 pointerId，避免第二根手指插隊

    var target = el.getAttribute && el.getAttribute('href') ? el.getAttribute('href') : HOME_URL;

    function paint() {
      var p = (Date.now() - startAt) / HOLD_MS;
      if (p > 1) p = 1;
      // CSS 用 var(--hold) 去畫 conic-gradient，JS 只負責餵 0→1 的進度
      el.style.setProperty('--hold', String(p));
      if (p < 1) rafId = window.requestAnimationFrame(paint);
    }

    function reset() {
      if (timer !== null) { window.clearTimeout(timer); timer = null; }
      if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
      activeId = null;
      el.classList.remove('holding');
      el.style.setProperty('--hold', '0');
    }

    function start(e) {
      if (activeId !== null) return;                 // 已經有一根手指在按了
      if (typeof e.button === 'number' && e.button > 0) return;   // 只認左鍵／主要接觸點
      activeId = (e.pointerId === undefined) ? null : e.pointerId;
      startAt = Date.now();
      el.classList.add('holding');
      /* 捕捉指標：孩子按住時手指一定會微微移動，沒有 capture 的話一離開按鈕範圍
         就收到 pointerleave，長按永遠撐不滿。 */
      if (el.setPointerCapture && e.pointerId !== undefined) {
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* 不支援就算了，不影響計時 */ }
      }
      rafId = window.requestAnimationFrame(paint);
      timer = window.setTimeout(function () {
        reset();                                     // 先清乾淨再導頁，避免導頁後還有計時器在跑
        window.location.href = target;
      }, HOLD_MS);
    }

    function cancel(e) {
      if (activeId !== null && e && e.pointerId !== undefined && e.pointerId !== activeId) return;
      if (el.releasePointerCapture && e && e.pointerId !== undefined) {
        try { el.releasePointerCapture(e.pointerId); } catch (err) { /* 沒捕捉到就略過 */ }
      }
      reset();   // 未滿門檻放開＝什麼都不發生：不導頁、不出聲、不提示
    }

    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', cancel);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('pointerleave', cancel);

    /* click 的預設導頁一定要攔掉，否則短點一下照樣跳走，長按門檻等於沒設。 */
    el.addEventListener('click', function (e) { e.preventDefault(); });

    /* 鍵盤操作不需要長按：誤觸是手掌的問題，鍵盤沒有這個風險，
       強迫按住 Enter 700ms 反而是無障礙倒退。 */
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        window.location.href = target;
      }
    });
  }

  function attachAllHolds() {
    var list = document.querySelectorAll('a.icon-btn[href="' + HOME_URL + '"], a.home-hold');
    for (var i = 0; i < list.length; i++) attachHold(list[i]);
  }

  function install() {
    installGestureGuards();
    // 四頁的 <script> 都在 body 結尾，DOM 已就緒；仍留一手給日後被提前引入的情況
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachAllHolds);
    } else {
      attachAllHolds();
    }
  }

  window.Kiosk = { HOLD_MS: HOLD_MS, attachHold: attachHold, install: install };

  install();
})();
