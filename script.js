// --- グローバル変数 ---
let questionData = []; 
let resultData = {};   
const axisDescriptions = {
    'L': { title: 'リード型 (L)', text: '会話の主導権を握り、積極的に場を盛り上げるのが得意なタイプです。' },
    'F': { title: 'フォロワー型 (F)', text: '聞き役に徹し、お客様のペースに合わせて心地よい空間を作るのが得意なタイプです。' },
    'C': { title: '恋人型 (C)', text: '「女性らしさ」や「色気」を武器に、お客様を異性としてドキドキさせるのが得意なタイプです。' },
    'P': { title: 'パートナー型 (P)', text: '「知性」や「人間的な面白さ」を武器に、お客様と対等な関係を築くのが得意なタイプです。' },
    'I': { title: '懐（ふところ）型 (I)', text: '「人懐っこさ」や「素の自分」を見せ、短時間でお客様の懐に飛び込むのが得意なタイプです。' },
    'O': { title: '領域（テリトリー）型 (O)', text: '「プロとしての距離感」を保ち、「憧れ」や「ミステリアスさ」を演出するのが得意なタイプです。' },
    'H': { title: 'ハンター型 (H)', text: '「瞬発力」で、イベントなど短期集中的に大きな結果を出すのが得意なタイプです。' },
    // 'F'が重複していたので、4軸目の 'F' (Farmer) に修正（※元コードのままにしていますが、もしFarmer型のFならこちらを有効化）
    // 'F': { title: 'ファーマー型 (F)', text: '「マメな連絡」や「継続力」で、お客様との関係をじっくり育てるのが得意なタイプです。' }
    // 元コードのaxis4の 'F' が フォロワー型(Follower) と同じ 'F' になっていたため、FarmerのFに修正します。
    // もし4軸目がフォロワー型で正しい場合は、上の'F' (Farmer)を削除し、下の'F' (Farmer)のキーを 'Fa'などに変更してください。
    // ※診断ロジック(type.join)で 'F' が使われているため、axisDescriptionsの重複キーを修正します。
    'Fa': { title: 'ファーマー型 (F)', text: '「マメな連絡」や「継続力」で、お客様との関係をじっくり育てるのが得意なタイプです。' }
};

// --- 1. アプリの初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    // 画面要素を取得
    const startScreen = document.getElementById('start-screen');
    const shindanForm = document.getElementById('shindan-form');
    const resultScreen = document.getElementById('result');
    const startBtn = document.getElementById('start-btn');
    const backToTopBtn = document.getElementById('btn-back-to-top');

    // 念のため、JSでも初期状態をセット
    startScreen.style.display = 'block';
    shindanForm.style.display = 'none';
    resultScreen.style.display = 'none';
    backToTopBtn.style.display = 'none';

    // CSVの読み込みと質問の生成を先に行う
    loadAllData(startBtn);
    
    // スタート画面に戻る（リセットする）関数
    function resetToStart() {
        // 画面切り替え
        startScreen.style.display = 'block';
        shindanForm.style.display = 'none';
        resultScreen.style.display = 'none';
        backToTopBtn.style.display = 'none'; // トップ画面では非表示

        // フォームをリセット (選択を解除)
        shindanForm.reset();

        // 回答済みの .answered クラスをすべて削除
        const answeredQuestions = document.querySelectorAll('.question.answered');
        answeredQuestions.forEach(q => {
            q.classList.remove('answered');
        });
        
        // 既存の結果表示を念のためクリア
        document.getElementById('result-type').textContent = '';
        document.getElementById('result-title').textContent = '';
        document.getElementById('result-breakdown').innerHTML = '';
        document.getElementById('result-image').style.display = 'none';

        // 画面の先頭にスクロール
        document.getElementById('shindan-app').scrollIntoView({ behavior: 'smooth' });
    }
    
    // スタートボタンにクリックイベントを設定
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none'; // スタート画面を非表示
        shindanForm.style.display = 'block'; // 診断フォームを表示
        backToTopBtn.style.display = 'block'; // トップに戻るボタンを表示
        // 画面の先頭にスクロール
        document.getElementById('shindan-app').scrollIntoView({ behavior: 'smooth' });
    });

    // トップに戻るボタンのクリックイベント
    backToTopBtn.addEventListener('click', resetToStart);

    // 0.3秒後（少し間を置いて）アニメーションを開始
    setTimeout(() => {
        // .titleクラスを持つ要素を探して、.visibleクラスを追加
        document.querySelector('.title').classList.add('visible');
    }, 300); // 300ミリ秒 = 0.3秒
});

// --- 2. 必要なCSVファイルをすべて読み込む ---
async function loadAllData(startBtn) { // startBtnを引数で受け取る
    try {
        const [questions, results] = await Promise.all([
            loadCSV('questions.csv'),
            loadCSV('results.csv')
        ]);

        questionData = questions;
        results.forEach(row => {
            if (row.type) {
                resultData[row.type] = {
                    title: row.title,
                    description: row.description,
                    strength: row.strength
                };
            }
        });

        // 質問フォームをHTMLで生成する (まだ非表示)
        generateQuestionsHTML();

        // 質問回答時にグレーアウトするイベントリスナーを設定
        setupAnsweredListener();

        // CSV読み込み完了後、スタートボタンを有効化
        startBtn.disabled = false;
        startBtn.textContent = '診断をはじめる';

    } catch (error) {
        console.error("CSVファイルの読み込みに失敗しました:", error);
        startBtn.textContent = "エラーが発生しました";
    }
}

// --- 3. CSVファイルを読み込む関数 ---
function loadCSV(url) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true, header: true, skipEmptyLines: true, encoding: "UTF-8",
            complete: (results) => resolve(results.data),
            error: (err) => reject(err)
        });
    });
}

// --- 4. 5段階評価の質問フォームを動的に生成する ---
function generateQuestionsHTML() {
    const form = document.getElementById('shindan-form');
    const loadingEl = form.querySelector('#loading'); // form内のloadingを取得
    const submitBtn = form.querySelector('#submit-btn');
    
    let htmlContent = '';
    let questionCount = 1;

    questionData.forEach(q => {
        htmlContent += `
            <div class="question" data-axis="${q.axis}" data-id="${q.id}">
                <p>Q${questionCount}. ${q.statement}</p>
                <div class="likert-scale">
                    <label><input type="radio" name="${q.id}" value="1"> <span data-label="1"></span></label>
                    <label><input type="radio" name="${q.id}" value="2"> <span data-label="2"></span></label>
                    <label><input type="radio" name="${q.id}" value="3"> <span data-label="3"></span></label>
                    <label><input type="radio" name="${q.id}" value="4"> <span data-label="4"></span></label>
                    <label><input type="radio" name="${q.id}" value="5"> <span data-label="5"></span></label>
                </div>
                <div class="likert-labels">
                    <span>そう思わない</span>
                    <span>そう思う</span>
                </div>
            </div>
        `;
        questionCount++;
    });

    loadingEl.style.display = 'none';
    loadingEl.insertAdjacentHTML('beforebegin', htmlContent);
    submitBtn.style.display = 'block';
}

// --- 4.5.質問回答時のリスナー設定 ---
function setupAnsweredListener() {
    const form = document.getElementById('shindan-form');
    
    // フォーム全体の変更イベントを監視 (イベント委任)
    form.addEventListener('change', (event) => {
        // ラジオボタンの変更か確認
        if (event.target.type === 'radio') {
            // 変更されたラジオボタンが属する .question を探す
            const questionDiv = event.target.closest('.question');
            if (questionDiv) {
                // .answered クラスを追加
                questionDiv.classList.add('answered');
            }
        }
    });
}


// --- 5. 診断実行 (フォーム送信時の処理) ---
document.getElementById('shindan-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const formData = new FormData(event.target);
    const answers = Object.fromEntries(formData.entries());

    if (Object.keys(answers).length < questionData.length) {
        alert("すべての質問に回答してください。");
        return;
    }

    // 集計ロジック
    const scores = { 
        axis1: { A: 0, B: 0 }, axis2: { A: 0, B: 0 },
        axis3: { A: 0, B: 0 }, axis4: { A: 0, B: 0 }
    };
    questionData.forEach(q => {
        const answer = answers[q.id]; const axis = q.axis;
        switch (answer) {
            case '5': scores[axis].A += 2; break;
            case '4': scores[axis].A += 1; break;
            case '3': break;
            case '2': scores[axis].B += 1; break;
            case '1': scores[axis].B += 2; break;
        }
    });

    // タイプの決定
    const type = [
        (scores.axis1.A > scores.axis1.B) ? 'L' : 'F',
        (scores.axis2.A > scores.axis2.B) ? 'C' : 'P',
        (scores.axis3.A > scores.axis3.B) ? 'I' : 'O',
        (scores.axis4.A > scores.axis4.B) ? 'H' : 'Fa' // ★ 'F' (Farmer) -> 'Fa' に変更
    ].join('');

    // フォームを非表示にし、結果を表示
    document.getElementById('shindan-form').style.display = 'none';
    const resultEl = document.getElementById('result');
    resultEl.style.display = 'block';
    backToTopBtn.style.display = 'block'; // トップに戻るボタンを表示

    // 結果の表示
    const result = resultData[type] || resultData["DEFAULT"];
    resultEl.querySelector('#result-type').textContent = type;
    resultEl.querySelector('#result-title').textContent = result.title;
    resultEl.querySelector('#result-description').innerHTML = result.description.replace(/\n/g, '<br>');
    resultEl.querySelector('#result-strength').textContent = result.strength;

    // イラスト表示ロジック
    const resultImage = resultEl.querySelector('#result-image');
    if (result.title !== "診断不能タイプ") {

        //★WIP★　画像が用意できないので一時的にべた書き
        //resultImage.src = `images/${type}.png`;
        resultImage.src = `images/kotowaza_buta_shinju.png`;
        resultImage.alt = result.title;
        resultImage.style.display = 'block';
    } else {
        resultImage.style.display = 'none';
    }

    // 4軸の解説の動的生成
    const breakdownEl = resultEl.querySelector('#result-breakdown');
    breakdownEl.innerHTML = ''; // 既存の内容をクリア
    const typeChars = type.split('');
    
    // ★ 'F' と 'Fa' を正しく参照するように修正
    const desc1 = axisDescriptions[typeChars[0]]; // L or F
    const desc2 = axisDescriptions[typeChars[1]]; // C or P
    const desc3 = axisDescriptions[typeChars[2]]; // I or O
    const desc4 = axisDescriptions[typeChars[3]]; // H or Fa

    [desc1, desc2, desc3, desc4].forEach(desc => {
        breakdownEl.innerHTML += `
            <div class="breakdown-item">
                <span>${desc.title.match(/[A-Z]/)[0]}</span>
                <p><strong>${desc.title}</strong>${desc.text}</p>
            </div>
        `;
    });

    // シェアロジック
    const shareUrl = window.location.href; 
    const hashTag = "接客タイプ診断"; 
    const shareText = `私の接客タイプは【${result.title}（${type}）】でした！\n「${result.strength}」\nあなたも診断してみよう！\n#${hashTag}\n`;
    
    resultEl.querySelector('#share-x').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    resultEl.querySelector('#share-line').href = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + shareUrl)}`;

    // 結果表示位置にスクロール
    resultEl.scrollIntoView({ behavior: 'smooth' });
});
