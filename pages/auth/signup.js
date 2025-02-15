import { loadPage } from "../../scripts/app.js"; 

export function render() {
  return `
    <section class="signup-container">
      <h2>회원가입</h2>
      <form id="signup-form">
        <div class="profile-section">
          <label for="profile-pic">프로필 사진</label>
          <input type="file" id="profile-pic" accept="image/*" />
          <p class="helper-text">* 프로필 사진을 추가해주세요.</p>
        </div>

        <div class="input-group">
          <label for="email">이메일</label>
          <input type="email" id="email" placeholder="이메일을 입력하세요" required />
          <p id="email-helper" class="helper-text hidden">
            * 올바른 이메일을 입력하세요 (예: example@example.com)
          </p>
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" placeholder="비밀번호를 입력하세요" required />
          <p id="password-helper" class="helper-text hidden">
            * 비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.
          </p>
        </div>

        <div class="input-group">
          <label for="confirm-password">비밀번호 확인</label>
          <input type="password" id="confirm-password" placeholder="비밀번호를 다시 입력하세요" required />
          <p id="confirm-password-helper" class="helper-text hidden">
            * 비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <div class="input-group">
          <label for="nickname">닉네임</label>
          <input type="text" id="nickname" placeholder="닉네임을 입력하세요" required />
          <p id="nickname-helper" class="helper-text hidden">
            * 닉네임은 2~10자 이내여야 합니다.
          </p>
        </div>

        <button type="submit" id="signup-btn" disabled>회원가입</button>
      </form>
      <button id="login-page-btn">로그인하러 가기</button>
    </section>
  `;
}

export function setup() {
  loadStyles();
  setupEventListeners();
}

function loadStyles() {
  if (!document.getElementById("signup-css")) {
    const link = document.createElement("link");
    link.id = "signup-css";
    link.rel = "stylesheet";
    link.href = "styles/signup.css";
    document.head.appendChild(link);
  }
}

function setupEventListeners() {
  document.getElementById("login-page-btn").addEventListener("click", () => {
    loadPage("../auth/login.js");
  });

  document.getElementById("signup-form").addEventListener("input", validateForm);
  document.getElementById("signup-form").addEventListener("submit", handleSignup);
}

function validateForm() {
  const emailValid = validateEmailField();
  const passwordValid = validatePasswordField();
  const confirmPasswordValid = validateConfirmPasswordField();
  const nicknameValid = validateNicknameField();
  
  document.getElementById("signup-btn").disabled = !(emailValid && passwordValid && confirmPasswordValid && nicknameValid);
}

function validateEmailField() {
  const email = document.getElementById("email").value.trim();
  const helper = document.getElementById("email-helper");
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

function validatePasswordField() {
  const password = document.getElementById("password").value.trim();
  const helper = document.getElementById("password-helper");
  const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password);
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

function validateConfirmPasswordField() {
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const helper = document.getElementById("confirm-password-helper");
  const isValid = password === confirmPassword;
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

function validateNicknameField() {
  const nickname = document.getElementById("nickname").value.trim();
  const helper = document.getElementById("nickname-helper");
  const isValid = nickname.length >= 2 && nickname.length <= 10;
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

async function handleSignup(event) {
  event.preventDefault();
  alert("회원가입 성공!");
  loadPage("../auth/login.js");
}
