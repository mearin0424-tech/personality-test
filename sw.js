if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker 登録成功:', registration);
    })
    .catch(error => {
      console.log('Service Worker 登録失敗:', error);
    });
}
