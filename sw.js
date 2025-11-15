// ▼▼▼ Firebase SDKの読み込み (一番上) ▼▼▼
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');
// ▲▲▲

// キャッシュのバージョン。中身を変えたらここも変える
const CACHE_NAME = 'personality-test-cache-v1';

// GitHub Pagesのリポジトリパス
const REPO_PATH = '/personality-test/';

// --- オフライン動作に必要なファイルを追加 ---
const urlsToCache = [
  REPO_PATH + 'personality-test.html',
  REPO_PATH + 'style.css',
  REPO_PATH + 'manifest.json',
  REPO_PATH + 'icons/icon-192x192.png',
  REPO_PATH + 'icons/icon-512x512.png',
  
  // ▼▼▼ PWA/診断ロジックに必要なファイル ▼▼▼
  REPO_PATH + 'pwa-loader.js',       // PWAローダー
  REPO_PATH + 'script.js',           // 診断ロジック本体
  REPO_PATH + 'questions.csv',       // 質問データ
  REPO_PATH + 'results.csv',         // 結果データ
  
  // ▼▼▼ アプリで使われている画像 ▼▼▼
  REPO_PATH + 'images/top_image.png',
  REPO_PATH + 'images/kotowaza_buta_shinju.png'
];

// --- 1. インストール処理 (install イベント) ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        // リストのファイルをすべてキャッシュ
        return cache.addAll(urlsToCache);
      })
  );
});

// --- 2. 通信傍受処理 (fetch イベント) ---
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

// --- 3. Firebase (プッシュ通知) 設定 ---

// Firebase設定（HTML側と同じ）
  const firebaseConfig = {
     apiKey: "AIzaSyAQnHBsjvhSKiJP6pq5Ac5317tweEU8Kk8",
     authDomain: "pwa-shindan-app.firebaseapp.com",
     projectId: "pwa-shindan-app",
     storageBucket: "pwa-shindan-app.firebasestorage.app",
     messagingSenderId: "680889712921",
     appId: "1:680889712921:web:4528445084a2d76ff44588",
     measurementId: "G-5Q243BKXZL"
   };

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// バックグラウンドで通知を受け取ったときの処理
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] バックグラウンドで通知を受信しました: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: REPO_PATH + 'icons/icon-192x192.png'
  };

  // 通知を表示
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知がクリックされたときの処理
self.addEventListener('notificationclick', (event) => {
  console.log('[sw.js] 通知がクリックされました: ', event.notification);
  event.notification.close(); // 通知を閉じる
  
  // クリックされたらアプリ（HTML）を開く
  event.waitUntil(
    clients.openWindow(REPO_PATH + 'personality-test.html')
  );
});