// pages/auth/login.js
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";

// render()는 로그인 화면의 HTML을 반환합니다.
export function render() {
  return `
    <section class="login-container">
      <h2>로그인</h2>
      <form id="login-form">
        <div class="input-group">
          <label for="username">이메일</label>
          <input type="text" id="username" placeholder="이메일을 입력하세요" required />
          <p id="email-helper" class="helper-text hidden">
            *올바른 이메일 주소를 입력하세요 (예: example@example.com)
          </p>
        </div>
        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" placeholder="비밀번호를 입력하세요" required />
          <p id="password-helper" class="helper-text hidden">
            *비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.
          </p>
        </div>
        <button type="submit" id="login-btn" class="validation-button" disabled>
          로그인
        </button>
      </form>
      <button id="signup-btn" class="signup-btn">회원가입</button>
    </section>
  `;
}

// setup()은 render 후 CSS 로드 및 이벤트 바인딩을 수행합니다.
export function setup() {
  loadStyles();
  setupEventListeners();
}

// CSS 동적 로드
function loadStyles() {
  // index.html 기준으로 경로 지정: styles 폴더에 login.css
  if (!document.getElementById("login-css")) {
    const loginLink = document.createElement("link");
    loginLink.id = "login-css";
    loginLink.rel = "stylesheet";
    loginLink.href = "styles/login.css"; 
    document.head.appendChild(loginLink);
  }

  // ValidationButton CSS: index.html 기준으로 components 폴더 내 경로
  if (!document.getElementById("validation-button-css")) {
    const validationLink = document.createElement("link");
    validationLink.id = "validation-button-css";
    validationLink.rel = "stylesheet";
    validationLink.href = "components/ValidationButton/ValidationButton.css";
    document.head.appendChild(validationLink);
  }
}

// 이벤트 리스너 등록
function setupEventListeners() {
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // ValidationButton 인스턴스 생성
  const loginButton = new ValidationButton("login-btn");

  // 입력값 변경 시 유효성 검사
  usernameInput.addEventListener("input", () => validateInputs(loginButton));
  passwordInput.addEventListener("input", () => validateInputs(loginButton));

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
}

// 이메일 유효성 검사
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 비밀번호 유효성 검사
function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return passwordRegex.test(password);
}

// 입력값에 따른 유효성 검사 및 helper 텍스트 업데이트
function validateInputs(validationButton) {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const emailHelper = document.getElementById("email-helper");
  const passwordHelper = document.getElementById("password-helper");

  let isValid = true;

  // 이메일 검사
  if (!username) {
    emailHelper.textContent = "*이메일을 입력해주세요.";
    emailHelper.classList.remove("hidden");
    isValid = false;
  } else if (!validateEmail(username)) {
    emailHelper.textContent = "*올바른 이메일 주소를 입력하세요 (예: example@example.com)";
    emailHelper.classList.remove("hidden");
    isValid = false;
  } else {
    emailHelper.classList.add("hidden");
  }

  // 비밀번호 검사
  if (!password) {
    passwordHelper.textContent = "*비밀번호를 입력해주세요.";
    passwordHelper.classList.remove("hidden");
    isValid = false;
  } else if (!validatePassword(password)) {
    passwordHelper.textContent = "*비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.";
    passwordHelper.classList.remove("hidden");
    isValid = false;
  } else {
    passwordHelper.classList.add("hidden");
  }

  // 버튼 활성화/비활성 업데이트
  validationButton.updateValidationState(isValid);
}

// 로그인 처리 (더미 API)
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fakeLoginAPI(username, password);
    if (response.success) {
      alert("로그인 성공!");
      window.location.href = "#home";
    } else {
      alert("아이디 또는 비밀번호를 확인해주세요.");
    }
  } catch (error) {
    console.error("로그인 오류:", error);
  }
}

// 더미 로그인 API (실제 API로 대체 가능)
async function fakeLoginAPI(username, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: username === "test@example.com" && password === "Test1234!"
      });
    }, 500);
  });
}
