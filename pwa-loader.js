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

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// サービスワーカーの「登録Promise」をグローバルに用意
let swRegistrationPromise = null;

if ('serviceWorker' in navigator) {
    swRegistrationPromise = navigator.serviceWorker.register(REPO_PATH + 'sw.js', { scope: REPO_PATH })
        .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            return registration; 
        })
        .catch(err => {
            console.error('ServiceWorker registration failed: ', err);
            return null; 
        });
}

// --- 2. 関数定義 ---

// 通知の許可をリクエストする関数
function requestNotificationPermission() {
    console.log('通知の許可をリクエストします...');
    Notification.requestPermission() 
        .then((permission) => {
            if (permission === 'granted') {
                console.log('通知の許可が得られました。');
                // (許可が得られたら自動でトークン取得はせず、ボタン押下を待つ)
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
    // VAPIDキー
    const VAPID_KEY = "BC3eV001Pt3fT11KqKJQVGo95jq5DAuU64mJUtcR4Xa-oRhT6gaExcA_eri4AMc9IWvYicPLVcImAF4fU4MCwhk";

    if (!swRegistrationPromise) {
        console.error("サービスワーカーがサポートされていないか、登録が開始されていません。");
        return;
    }

    try {
        const registration = await swRegistrationPromise; 

        if (!registration) {
            console.error('サービスワーカーの登録に失敗しているため、トークンを取得できません。');
            return;
        }

        console.log('Service Worker 登録情報を取得:', registration);

        const currentToken = await messaging.getToken({ 
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration 
        });

        if (currentToken) {
            console.log('FCM 宛先ID (トークン): ', currentToken);
            
            // ▼▼▼ 修正 ▼▼▼
            // テキストエリアにトークンを表示
            const tokenArea = document.getElementById('token-display-area');
            const tokenInfo = document.getElementById('token-info');
            
            if (tokenArea && tokenInfo) {
                tokenArea.value = currentToken;
                tokenArea.style.display = 'block';
                tokenInfo.style.display = 'block';
            }
            // ▲▲▲ 修正 ▲▲▲

        } else {
            console.log('トークンが取得できませんでした。');
        }
    } catch (err) {
        console.error('トークンの取得中にエラーが発生しました。詳細:', err);
    }
}

// --- 3. 実行 ---

document.addEventListener('DOMContentLoaded', () => {
    
    // ▼▼▼ 修正 ▼▼▼
    // アプリ起動時に通知の許可を求める
    requestNotificationPermission();
    // ▲▲▲ 修正 ▲▲▲

    const startBtn = document.getElementById('start-btn');
    if(startBtn) {
         // (診断開始ボタンのリスナーはそのまま)
         startBtn.addEventListener('click', () => {
             // (通知許可の呼び出しはここから削除)
        });
    }

    // 通知テストボタンのリスナー
    const testBtn = document.getElementById('notification-test-btn');
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            // トークン取得を実行
            getFcmToken();
        });
    }

});