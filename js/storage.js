/* 著色頁的本機儲存（IndexedDB 極簡包裝）
   兩個 object store：
     progress  畫到一半的進度，keyPath 'key'（'v:線稿名稱' 或 'r:照片id'）
     artworks  按下 📷 收起來的完成作品，keyPath 'id' 自動編號
   為什麼不用 localStorage：畫布 PNG 動輒數百 KB，iPad Safari 的 localStorage
   只有 ~5MB，存兩三張就 QuotaExceededError。
   隱私模式／舊瀏覽器開不了 DB 時整組降級成 no-op：方法照樣回 Promise，
   只是存不進去也讀不出來，呼叫端不用到處寫 try/catch，功能只少了「這次不保存」。 */
window.KidsStore = (() => {
  const DB_NAME = 'kidsColoring';
  const DB_VERSION = 1;

  let dbPromise = null;

  // 開 DB。任何失敗都 resolve(null) 走降級，不 reject（呼叫端不必接 catch）
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      let req;
      try {
        if (!window.indexedDB) { resolve(null); return; }
        req = window.indexedDB.open(DB_NAME, DB_VERSION);
      } catch (e) { resolve(null); return; }

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('artworks')) {
          db.createObjectStore('artworks', { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    });
    return dbPromise;
  }

  /* 所有 API 共用的交易包裝：DB 開不起來、store 不存在、交易失敗，
     一律回 fallback（不丟例外），讓畫面照常運作。 */
  function run(storeName, mode, makeRequest, fallback) {
    return openDB().then((db) => {
      if (!db) return fallback;
      return new Promise((resolve) => {
        let req;
        try {
          const t = db.transaction(storeName, mode);
          t.onabort = () => resolve(fallback);
          req = makeRequest(t.objectStore(storeName));
        } catch (e) { resolve(fallback); return; }
        req.onsuccess = () => resolve(req.result === undefined ? fallback : req.result);
        req.onerror = () => resolve(fallback);
      });
    });
  }

  return {
    // 讀一筆，沒有就回 null
    get(store, key) {
      return run(store, 'readonly', (s) => s.get(key), null);
    },
    // 寫一筆（keyPath 由 store 決定），回傳這筆的 key
    put(store, value) {
      return run(store, 'readwrite', (s) => s.put(value), null);
    },
    // 刪一筆
    del(store, key) {
      return run(store, 'readwrite', (s) => s.delete(key), null);
    },
    // 整個 store 的內容，回傳陣列（順序由 IndexedDB 的 key 決定，要排序請自己排）
    all(store) {
      return run(store, 'readonly', (s) => s.getAll(), []);
    },
    // 筆數（用來判斷要不要刪掉最舊的）
    count(store) {
      return run(store, 'readonly', (s) => s.count(), 0);
    }
  };
})();
