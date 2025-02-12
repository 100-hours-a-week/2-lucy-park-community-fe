// login.js

export function render() {
    loadLoginCSS();
    return `
        <section class="login-container">
            <h2>로그인</h2>
            <form id="login-form">
                <div class="input-group">
                    <label for="username">이메일</label>
                    <input type="text" id="username" placeholder="이메일을 입력하세요" required>
                    <p id="email-helper" class="helper-text hidden">올바른 이메일 주소를 입력하세요 (예: example@example.com)</p>
                </div>
                <div class="input-group">
                    <label for="password">비밀번호</label>
                    <input type="password" id="password" placeholder="비밀번호를 입력하세요" required>
                    <p id="password-helper" class="helper-text hidden">
                        비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.
                    </p>
                </div>
                <button type="submit" id="login-btn" class="login-btn" disabled>로그인</button>
            </form>
            <button id="signup-btn" class="signup-btn">회원가입</button>
        </section>
    `;
}

// CSS 파일을 동적으로 로드하는 함수
function loadLoginCSS() {
    const existingLink = document.getElementById("login-css");
    if (!existingLink) {
        const link = document.createElement("link");
        link.id = "login-css";
        link.rel = "stylesheet";
        link.href = "styles/login.css"; // CSS 파일 경로 맞게 설정!
        document.head.appendChild(link);
    }
}

// 로그인 페이지의 이벤트 핸들러 설정
export function setupEventListeners() {
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    // 입력값 변경 시 helper text & 유효성 검사 실행
    usernameInput.addEventListener("input", validateInputs);
    passwordInput.addEventListener("input", validateInputs);

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
}

// 이메일 & 비밀번호 유효성 검사 (실시간 반영)
function validateInputs() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const emailHelper = document.getElementById("email-helper");
    const passwordHelper = document.getElementById("password-helper");
    const loginButton = document.getElementById("login-btn");

    let isValid = true;

    // 이메일 유효성 검사
    if (!validateEmail(username)) {
        emailHelper.classList.remove("hidden"); // helper text 표시
        isValid = false;
    } else {
        emailHelper.classList.add("hidden"); // 조건 충족 시 숨김
    }

    // 비밀번호 유효성 검사
    if (!validatePassword(password)) {
        passwordHelper.classList.remove("hidden"); // helper text 표시
        isValid = false;
    } else {
        passwordHelper.classList.add("hidden"); // 조건 충족 시 숨김
    }

    // 모든 조건을 만족하면 로그인 버튼 활성화 & 색상 변경
    if (isValid) {
        loginButton.disabled = false;
        loginButton.style.backgroundColor = "#7F6AEE"; // 활성화 시 색상 변경
    } else {
        loginButton.disabled = true;
        loginButton.style.backgroundColor = "#ACA0EB"; // 비활성화 상태 유지
    }
}

// 이메일 형식 검사 함수
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 비밀번호 형식 검사 함수 (8~20자, 대소문자, 숫자, 특수문자 포함)
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}

// 로그인 처리 함수
async function handleLogin(event) {
    event.preventDefault(); // 기본 제출 이벤트 방지

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fakeLoginAPI(username, password);

        if (response.success) {
            alert("로그인 성공!");
            window.location.href = "#home"; // 홈으로 이동 (SPA 구조)
        } else {
            alert("아이디 또는 비밀번호를 확인해주세요.");
        }
    } catch (error) {
        console.error("로그인 오류:", error);
    }
}

// 더미 로그인 API (테스트용)
async function fakeLoginAPI(username, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: username === "test@example.com" && password === "Test1234!" });
        }, 1000);
    });
}
