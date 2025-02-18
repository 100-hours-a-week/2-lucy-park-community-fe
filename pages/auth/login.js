// login.js
import { loadPage } from "../../scripts/app.js"; 
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";

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

export function setup() {
  loadStyles();
  setupEventListeners();
}

function loadStyles() {
  if (!document.getElementById("login-css")) {
    const link = document.createElement("link");
    link.id = "login-css";
    link.rel = "stylesheet";
    link.href = "styles/auth/login.css";
    document.head.appendChild(link);
  }
  if (!document.getElementById("validation-button-css")) {
    const link = document.createElement("link");
    link.id = "validation-button-css";
    link.rel = "stylesheet";
    link.href = "components/ValidationButton/ValidationButton.css";
    document.head.appendChild(link);
  }
}

function setupEventListeners() {
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const signupButton = document.getElementById("signup-btn"); // 회원가입 버튼

  // ValidationButton
  const loginButton = new ValidationButton("login-btn");

  // 이메일 & 비밀번호 검증
  usernameInput.addEventListener("input", () => {
    loginButton.updateValidationState(
      validateEmailField() && validatePasswordField()
    );
  });
  passwordInput.addEventListener("input", () => {
    loginButton.updateValidationState(
      validateEmailField() && validatePasswordField()
    );
  });

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // 회원가입 버튼 클릭 시 회원가입 페이지로 이동
  if (signupButton) {
    signupButton.addEventListener("click", () => {
      loadPage("/pages/auth/signup.js");
    });
  }
}

function validateEmailField() {
  const value = document.getElementById("username").value.trim();
  const emailHelper = document.getElementById("email-helper");
  if (!value) {
    emailHelper.textContent = "*이메일을 입력해주세요.";
    emailHelper.classList.remove("hidden");
    return false;
  } else if (!validateEmail(value)) {
    emailHelper.textContent = "*올바른 이메일 주소를 입력하세요 (예: example@example.com)";
    emailHelper.classList.remove("hidden");
    return false;
  } else {
    emailHelper.classList.add("hidden");
    return true;
  }
}

function validatePasswordField() {
  const value = document.getElementById("password").value.trim();
  const passwordHelper = document.getElementById("password-helper");
  if (!value) {
    passwordHelper.textContent = "*비밀번호를 입력해주세요.";
    passwordHelper.classList.remove("hidden");
    return false;
  } else if (!validatePassword(value)) {
    passwordHelper.textContent = "*비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.";
    passwordHelper.classList.remove("hidden");
    return false;
  } else {
    passwordHelper.classList.add("hidden");
    return true;
  }
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return regex.test(password);
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fakeLoginAPI(username, password);
    if (response.success) {
      alert("로그인 성공!");
      location.reload();
      loadPage("../pages/posts/posts.js");
    } else {
      alert("아이디 또는 비밀번호를 확인해주세요.");
    }
  } catch (error) {
    console.error("로그인 오류:", error);
  }
}

// 더미 API
async function fakeLoginAPI(username, password) {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: username === storedUser.email && password === storedUser.password
      });
      
      // 로그인 성공 시 userStatus를 true로 설정
      storedUser.userStatus = true;

      // 변경된 storedUser를 다시 localStorage에 저장
      localStorage.setItem("user", JSON.stringify(storedUser));
    }, 300);
  });
}
