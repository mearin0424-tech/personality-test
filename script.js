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
    'R': { title: 'リレーション型 (R)', text: '「マメな連絡」や「継続力」で、お客様との関係をじっくり育てるのが得意なタイプです。' } 
};

// ★追加★ 弱点の定義 (Weakness)
const weaknessData = {
    'LPIR': '頼られすぎて疲弊しやすいです。また、一歩引いて静かに待つような受け身の接客は不得意です。',
    'FCIH': '長期的な関係構築が苦手で、急な来店が減ると一気に売上も落ちる傾向があります。また、同性からの支持は得にくいかもしれません。',
    'LPOR': '完璧主義が邪魔をして、お客様の「隙」や「弱み」に共感しにくいです。高い目標を持つお客様以外には壁を感じさせてしまうことがあります。',
    'FPOR': '受け身になりすぎて会話をリードできず、お客様を退屈にさせてしまうことがあります。異性としての魅力(C)での勝負は難しいでしょう。',
    'FPOH': '感情表現が乏しく見え、冷たい印象を持たれやすいです。長期的に顧客を「育てる」作業には忍耐力が必要です。',
    'FPIR': '友達のような関係になりすぎて、色恋的な緊張感が生まれにくいです。お客様の要求を断れず、尽くしすぎる傾向があります。',
    'FPIH': '自分のペースを崩せず、マメさ(R)を求めるお客様は離れていきます。本質的に自由なので、組織的な動きは苦手かもしれません。',
    'FCOR': '敷居が高く、新規のお客様が指名しにくいです。感情的な起伏が少なく、近寄りがたい印象を与えがちです。',
    'FCOH': '連絡が来ないことに不安を感じるお客様を切り捨てがちです。感情の交流を求めてくるお客様には対応が難しいでしょう。',
    'FCIR': 'お客様のペースに合わせすぎ、自己主張ができないことがあります。尽くしすぎて、対等な関係を築くのが難しいです。',
    'LPOH': 'カリスマ性が高すぎて、お客様に「自分にはもったいない」と感じさせてしまうことがあります。親しみやすさに欠けます。',
    'LPIH': '楽しさが優先され、お客様の深い悩みや感情を汲み取るのが苦手です。勢いで売上を上げるため、安定感に欠けることがあります。',
    'LCOR': '融通が利かない印象を持たれやすいです。お客様の小さな失敗や失言を許せず、プレッシャーを与えてしまうことがあります。',
    'LCOH': '高圧的な印象を与えやすく、お客様を緊張させてしまうことがあります。マメさがなく、一度離れたお客様は戻ってきにくいです。',
    'LCIR': '押しが強く、お客様のペースを乱してしまうことがあります。甘え上手ゆえに、わがままに見えてしまうこともあります。',
    'LCIH': '楽しすぎるがゆえに、落ち着いた接客や深い話をするのが苦手です。衝動的な接客になりやすく、計画性がないです。',
    'DEFAULT': 'どのタイプにも偏らず、強みが発揮しにくい可能性があります。専門家のアドバイスを求めることをおすすめします。'
};

// --- 1. アプリの初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    // 画面要素を取得
    const startScreen = document.getElementById('start-screen');
    const shindanForm = document.getElementById('shindan-form');
    const resultScreen = document.getElementById('result');
    const startBtn = document.getElementById('start-btn');
    
    // 通知テストボタンを除外して「トップに戻る」ボタンを取得
    const backToTopBtns = document.querySelectorAll('.btn-back-to-top:not(#notification-test-btn)'); 

    // 念のため、JSでも初期状態をセット
    startScreen.style.display = 'block';
    shindanForm.style.display = 'none';
    resultScreen.style.display = 'none';
    backToTopBtns.forEach(btn => btn.style.display = 'none'); 

    // スタート画面に戻る（リセットする）関数
    function resetToStart() {
        // 画面切り替え
        startScreen.style.display = 'block';
        shindanForm.style.display = 'none';
        resultScreen.style.display = 'none';
        backToTopBtns.forEach(btn => btn.style.display = 'none'); // トップ画面では非表示

        // トークン表示UIを非表示に戻す
        const tokenArea = document.getElementById('token-display-area');
        const tokenInfo = document.getElementById('token-info');
        if (tokenArea) tokenArea.style.display = 'none';
        if (tokenInfo) tokenInfo.style.display = 'none';
        
        // フォームをリセット (選択を解除)
        shindanForm.reset();

        // 回答済みの .answered クラスをすべて削除
        const answeredQuestions = document.querySelectorAll('.question.answered');
        answeredQuestions.forEach(q => {
            q.classList.remove('answered');
        });
        
        // 既存の結果表示を念のためクリア
        // ★修正: 該当IDの要素をクリア
        document.querySelector('#result-type-title').textContent = '';
        document.querySelector('#result-strength').textContent = '';
        document.querySelector('#result-weakness').textContent = ''; // ★追加
        document.querySelector('#result-description').innerHTML = ''; // ★追加
        document.querySelector('#result-breakdown').innerHTML = '';
        document.getElementById('result-image').style.display = 'none';

        // 画面の先頭にスクロール
        document.getElementById('shindan-app').scrollIntoView({ behavior: 'smooth' });
    }
    
    // スタートボタンにクリックイベントを設定
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none'; // スタート画面を非表示
        shindanForm.style.display = 'block'; // 診断フォームを表示
        backToTopBtns.forEach(btn => btn.style.display = 'block'); // トップに戻るボタンを表示
        // 画面の先頭にスクロール
        document.getElementById('shindan-app').scrollIntoView({ behavior: 'smooth' });
    });

    // トップに戻るボタンのクリックイベント (両方のボタンに設定)
    backToTopBtns.forEach(btn => btn.addEventListener('click', resetToStart));

    // 0.3秒後（少し間を置いて）アニメーションを開始
    setTimeout(() => {
        document.querySelector('.title').classList.add('visible');
    }, 300); // 300ミリ秒 = 0.3秒

    // 最初にデータをロード
    loadAllData(startBtn);
});

// --- 2. 必要なCSVファイルをすべて読み込む ---
async function loadAllData(startBtn) { 
    try {
        const REPO_PATH = '/personality-test/'; 
        const [questions, results] = await Promise.all([
            loadCSV(REPO_PATH + 'questions.csv'),
            loadCSV(REPO_PATH + 'results.csv')
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
    const loadingEl = form.querySelector('#loading'); 
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
    const REPO_PATH = '/personality-test/'; 
    const backToTopBtns = document.querySelectorAll('.btn-back-to-top:not(#notification-test-btn)'); 

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
        (scores.axis4.A > scores.axis4.B) ? 'H' : 'R' 
    ].join('');

    // フォームを非表示にし、結果を表示
    document.getElementById('shindan-form').style.display = 'none';
    const resultEl = document.getElementById('result');
    resultEl.style.display = 'block';
    backToTopBtns.forEach(btn => btn.style.display = 'block'); 

    // 結果の取得
    const result = resultData[type] || resultData["DEFAULT"];
    const weakness = weaknessData[type] || weaknessData["DEFAULT"]; // ★弱点を取得

    // ★修正: 結果の表示ロジックを全面的に変更
    
    // 1. タイプの表示
    resultEl.querySelector('#result-type-title').innerHTML = `(${type}) ${result.title}`;
    
    // 2. 画像表示 (既存ロジックは流用)
    const resultImage = resultEl.querySelector('#result-image');
    if (result.title !== "診断不能タイプ") {
        resultImage.src = REPO_PATH + 'images/kotowaza_buta_shinju.png';
        resultImage.alt = result.title;
        resultImage.style.display = 'block';
    } else {
        resultImage.style.display = 'none';
    }
    
    // 3. 強み
    resultEl.querySelector('#result-strength').textContent = result.strength;
    
    // 4. ニガテ
    resultEl.querySelector('#result-weakness').textContent = weakness; 
    
    // 5. 詳細説明
    resultEl.querySelector('#result-description').innerHTML = result.description.replace(/\n/g, '<br>');
    
    // 4軸の解説の動的生成
    const breakdownEl = resultEl.querySelector('#result-breakdown');
    breakdownEl.innerHTML = ''; // 既存の内容をクリア
    const typeChars = type.split('');
    
    const desc1 = axisDescriptions[typeChars[0]]; 
    const desc2 = axisDescriptions[typeChars[1]]; 
    const desc3 = axisDescriptions[typeChars[2]]; 
    const desc4 = axisDescriptions[typeChars[3]]; 

    [desc1, desc2, desc3, desc4].forEach(desc => {
        if(desc) { 
            // 4軸目の軸タイトルがRの場合、表示文字をRに修正
            const axisChar = desc.title.includes('(R)') ? 'R' : desc.title.match(/[A-Z]/)[0];

            breakdownEl.innerHTML += `
                <div class="breakdown-item">
                    <span>${axisChar}</span>
                    <p><strong>${desc.title}</strong>${desc.text}</p>
                </div>
            `;
        }
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