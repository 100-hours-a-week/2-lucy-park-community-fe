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
  const signupButton = document.getElementById("signup-btn");

  const loginButton = new ValidationButton("login-btn");

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

// 로그인 처리 함수 (실제 API 적용)
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("https://example.com/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify({ email, password }),
      credentials: "include" // HttpOnly Secure 쿠키 저장
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log("✅ 로그인 성공:", data);

      // Access Token 저장
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("expiresIn", data.data.expiresIn);
      localStorage.setItem("nickname", data.data.nickname);
      localStorage.setItem("profileImage", data.data.profileImage);

      alert("로그인 성공!");
      loadPage("../pages/posts/posts.js");
    } else if (response.status === 400) {
      const errorData = await response.json();
      console.error("⛔ 필수 항목 누락:", errorData.error);
      alert(errorData.error);
    } else if (response.status === 403) {
      console.error("⛔ 계정 정보 없음");
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else if (response.status === 500) {
      console.error("⛔ 서버 오류 발생");
      alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
  }
}
