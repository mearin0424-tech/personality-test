// キャッシュのバージョン。中身を変えたらここも変える
const CACHE_NAME = 'personality-test-cache-v1';

// GitHub Pagesのリポジトリパス（重要）
const REPO_PATH = '/personality-test/';

// キャッシュするファイルのリスト
const urlsToCache = [
  REPO_PATH + 'personality-test.html',
  REPO_PATH + 'styles.css',
  REPO_PATH + 'manifest.json',
  REPO_PATH + 'icons/icon-192x192.png',
  REPO_PATH + 'icons/icon-512x512.png'
];

// --- 1. インストール処理 (install イベント) ---
// ファイルをキャッシュする
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// --- 2. 通信傍受処理 (fetch イベント) ---
// キャッシュがあればキャッシュから、なければネットから取得
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュに存在する場合
        if (response) {
          return response; // キャッシュから返す
        }
        // キャッシュに存在しない場合
        return fetch(event.request); // 通常通りネットワークから取得
      })
  );
});
