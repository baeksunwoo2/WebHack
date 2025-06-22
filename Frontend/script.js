const loginSection = document.getElementById('loginSection');
const textCounterSection = document.getElementById('textCounterSection');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const deleteForm = document.getElementById('deleteForm');
const logoutButton = document.getElementById('logoutButton');
const textArea = document.getElementById('textArea');

const charCountSpan = document.getElementById('charCount');
const charCountWithSpaceSpan = document.getElementById('charCountWithSpace');
const wordCountSpan = document.getElementById('wordCount');
const lineCountSpan = document.getElementById('lineCount');
const byteCountUtf8Span = document.getElementById('byteCountUtf8');
const byteCountEucKrSpan = document.getElementById('byteCountEucKr');

// 화면전환
function showSection(sectionId) {
    loginSection.style.display = 'none';
    textCounterSection.style.display = 'none';

    if (sectionId === 'login') {
        loginSection.style.display = 'block';
    } else if (sectionId === 'textCounter') {
        textCounterSection.style.display = 'block';
        updateTextCountsAndBytes(); 
    }
}

// 헬퍼 함수: 서버 응답 처리 및 메시지 표시
async function handleServerResponse(response, messageDiv, successCallback = null) {
    const data = await response.json();
    if (response.ok) {
        messageDiv.textContent = data.message;
        messageDiv.classList.remove('error-message');
        messageDiv.classList.add('success-message');
        if (successCallback) {
            successCallback();
        }
    } else {
        messageDiv.textContent = data.message;
        messageDiv.classList.remove('success-message');
        messageDiv.classList.add('error-message');
    }
}

// 텍스트 카운트 및 바이트 수 계산 로직 (백엔드 요청 추가)
async function updateTextCountsAndBytes() {
    const text = textArea.value;

    // 1. 순수 텍스트 카운트 (프론트엔드에서 계산)
    const chars = text.replace(/\s/g, ''); // 정규 표현식(Regular Expression), \s: 모든 공백 문자, /g: text 내에서 모든 일치하는 패턴
    charCountSpan.textContent = chars.length; // html span 영역에 값 표시
    charCountWithSpaceSpan.textContent = text.length;
    const words = text.match(/\S+/g); // \S: 공백 문자를 제외한 모든 문자
    wordCountSpan.textContent = words ? words.length : 0; // 삼항 연산자, 유효한 값이면, 단어 수 출력 아니면 0 return
    const lines = text.split(/\r\n|\r|\n/);
    lineCountSpan.textContent = text ? lines.length : 0;

    // 2. 바이트 수 계산 (백엔드에 요청)
    try {
        const response = await fetch('http://localhost:5000/get_byte_counts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }) // 입력된 텍스트를 백엔드로 보냄
        });
        const data = await response.json();

        if (response.ok) {
            byteCountUtf8Span.textContent = data.utf8_bytes;
            byteCountEucKrSpan.textContent = data.euc_kr_bytes;
        } else {
            console.error('Failed to get byte counts from backend:', data.message);
            byteCountUtf8Span.textContent = '오류';
            byteCountEucKrSpan.textContent = '오류';
        }
    } catch (error) {
        console.error('Error fetching byte counts:', error);
        byteCountUtf8Span.textContent = '연결 오류';
        byteCountEucKrSpan.textContent = '연결 오류';
    }
}



// 로그인 폼 제출
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');

    messageDiv.textContent = '';
    messageDiv.classList.remove('error-message', 'success-message');

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        await handleServerResponse(response, messageDiv, () => {
            showSection('textCounter');
            textArea.value = ''; // 텍스트 영역 초기화
            updateTextCountsAndBytes(); // 카운트 초기화 및 바이트 수 업데이트
        });
    } catch (error) {
        console.error('Login Fetch error:', error);
        messageDiv.textContent = '로그인 서버에 연결할 수 없습니다.';
        messageDiv.classList.add('error-message');
    }
});

// 회원가입 폼 제출
signupForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const messageDiv = document.getElementById('signupMessage');

    messageDiv.textContent = '';
    messageDiv.classList.remove('error-message', 'success-message');

    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        await handleServerResponse(response, messageDiv, () => {
            document.getElementById('signupUsername').value = '';
            document.getElementById('signupPassword').value = '';
        });
    } catch (error) {
        console.error('Signup Fetch error:', error);
        messageDiv.textContent = '회원가입 서버에 연결할 수 없습니다.';
        messageDiv.classList.add('error-message');
    }
});

// 회원 탈퇴 폼 제출
deleteForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('deleteUsername').value;
    const password = document.getElementById('deletePassword').value;
    const messageDiv = document.getElementById('deleteMessage');

    messageDiv.textContent = '';
    messageDiv.classList.remove('error-message', 'success-message');

    try {
        const response = await fetch('http://localhost:5000/delete_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        await handleServerResponse(response, messageDiv, () => {
            document.getElementById('deleteUsername').value = '';
            document.getElementById('deletePassword').value = '';
        });
    } catch (error) {
        console.error('Delete User Fetch error:', error);
        messageDiv.textContent = '회원 탈퇴 서버에 연결할 수 없습니다.';
        messageDiv.classList.add('error-message');
    }
});

// 텍스트 영역 입력 감지 (input 이벤트 사용)
// 텍스트가 변경될 때마다 백엔드에 요청하여 바이트 수를 업데이트
textArea.addEventListener('input', updateTextCountsAndBytes);

// 로그아웃 버튼 클릭
logoutButton.addEventListener('click', function() {
    showSection('login');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('loginMessage').classList.remove('error-message', 'success-message');
});

// 페이지 로드 시 초기 섹션 설정
document.addEventListener('DOMContentLoaded', () => {
    showSection('login');
});