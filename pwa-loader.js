// --- 1. 定義 ---

// GitHub Pagesのパス
const REPO_PATH = '/personality-test/';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyAQnHBsjvhSKiJP6pq5Ac5317tweEU8Kk8",
  authDomain: "pwa-shindan-app.firebaseapp.com",
  projectId: "pwa-shindan-app",
  storageBucket: "pwa-shindan-app.firebasestorage.app",
  messagingSenderId: "680889712921",
  appId: "1:680889712921:web:4528445084a2d76ff44588",
  measurementId: "G-5Q243BKXZL"
};

// Firebaseを初期化 (HTML側で 'firebase' SDKが先に読み込まれています)
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// サービスワーカーの「登録Promise」をグローバルに用意
let swRegistrationPromise = null;

if ('serviceWorker' in navigator) {
    // 'load' イベントを待たずに、すぐに登録を開始
    swRegistrationPromise = navigator.serviceWorker.register(REPO_PATH + 'sw.js', { scope: REPO_PATH })
        .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            return registration; // 登録情報をPromiseの結果として返す
        })
        .catch(err => {
            console.error('ServiceWorker registration failed: ', err);
            return null; // 失敗
        });
}

// --- 2. 関数定義 ---

// 通知の許可をリクエストする関数
function requestNotificationPermission() {
    console.log('通知の許可をリクエストします...');
    // ブラウザ標準のNotification APIで許可を求める
    Notification.requestPermission() 
        .then((permission) => {
            if (permission === 'granted') {
                console.log('通知の許可が得られました。');
                // 許可されたらトークン取得を実行
                getFcmToken();
            } else {
                console.log('通知の許可が得られませんでした。');
            }
        })
        .catch((err) => {
            console.log('通知の許可リクエスト中にエラーが発生しました。', err);
        });
}

// 宛先ID（トークン）を取得する関数 (非同期 'async' 関数)
async function getFcmToken() {
    // VAPIDキー (Firebaseコンソールから取得したもの)
    const VAPID_KEY = "BC3eV001Pt3fT11KqKJQVGo95jq5DAuU64mJUtcR4Xa-oRhT6gaExcA_eri4AMc9IWvYicPLVcImAF4fU4MCwhk";

    if (!swRegistrationPromise) {
        console.error("サービスワーカーがサポートされていないか、登録が開始されていません。");
        return;
    }

    try {
        // 1. SW登録Promiseが完了するのを「待つ」
        const registration = await swRegistrationPromise; 

        if (!registration) {
            console.error('サービスワーカーの登録に失敗しているため、トークンを取得できません。');
            return;
        }

        console.log('Service Worker 登録情報を取得:', registration);

        // 2. 取得した登録情報を明示的に指定してトークンを要求 (awaitで待つ)
        const currentToken = await messaging.getToken({ 
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration 
        });

        if (currentToken) {
            console.log('FCM 宛先ID (トークン): ', currentToken);
            // トークンをユーザーに表示（よくないけど、テスト用）
            prompt("以下のトークンをコピーしてPCに送ってください:", currentToken);
        } else {
            console.log('トークンが取得できませんでした。');
        }
    } catch (err) {
        console.error('トークンの取得中にエラーが発生しました。詳細:', err);
    }
}

// --- 3. 実行 ---

// ページのDOM読み込み完了時に、スタートボタンにイベントリスナーを追加
// (script.js の 'DOMContentLoaded' とは別に、PWA用のリスナーを設定)
document.addEventListener('DOMContentLoaded', () => {
    
    const startBtn = document.getElementById('start-btn');
    if(startBtn) {
         // スタートボタンが押されたら、通知の許可もリクエストする
         startBtn.addEventListener('click', () => {
            // (script.js側で画面遷移が行われる)
            
            // 通知の許可をリクエスト
            requestNotificationPermission();
        });
    }
});