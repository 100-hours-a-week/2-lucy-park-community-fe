// signup.js
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js"; 
import { loadPage } from "../../scripts/app.js"; 

export function render() {
  return `
    <section class="signup-container">
      <div class="back-button">
        ${BackButton("../pages/auth/login.js")}
      </div>
      <h2>회원가입</h2>
      <form id="signup-form">
        <div class="profile-section">
          <label for="profile-pic">프로필 사진</label>
          <div id="profile-pic-preview" class="profile-pic-preview">
            <span>+</span>
          </div>
          <input type="file" id="profile-pic" accept="image/*" hidden />
          <p id="profile-helper" class="helper-text hidden">
            * 프로필 사진을 추가해주세요.
          </p>
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
  setupBackButton("../pages/auth/login.js");
}

function loadStyles() {
  if (!document.getElementById("signup-css")) {
    const link = document.createElement("link");
    link.id = "signup-css";
    link.rel = "stylesheet";
    link.href = "styles/auth/signup.css";
    document.head.appendChild(link);
  }
}

function setupEventListeners() {
  document.getElementById("login-page-btn").addEventListener("click", () => {
    loadPage("../pages/auth/login.js");
  });

  document.getElementById("signup-form").addEventListener("input", validateForm);
  document.getElementById("signup-form").addEventListener("submit", handleSignup);

  // 📌 프로필 사진 업로드 이벤트 수정
  const profilePicInput = document.getElementById("profile-pic");
  const profilePicPreview = document.getElementById("profile-pic-preview");

  profilePicPreview.addEventListener("click", () => {
    setTimeout(() => {
      profilePicInput.click();
    }, 50);
  });

  profilePicInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePicPreview.style.backgroundImage = `url('${e.target.result}')`;
        profilePicPreview.innerHTML = "";
      };
      reader.readAsDataURL(file);
    }
  });
}

// ✅ 유효성 검사 함수
function validateForm() {
  const emailValid = validateEmail();
  const passwordValid = validatePassword();
  const confirmPasswordValid = validateConfirmPassword();
  const nicknameValid = validateNickname();

  document.getElementById("signup-btn").disabled = !(emailValid && passwordValid && confirmPasswordValid && nicknameValid);
}

function validateEmail() {
  const email = document.getElementById("email").value.trim();
  const helper = document.getElementById("email-helper");
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

function validatePassword() {
  const password = document.getElementById("password").value.trim();
  const helper = document.getElementById("password-helper");
  const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password);
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

function validateConfirmPassword() {
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const helper = document.getElementById("confirm-password-helper");
  const isValid = password === confirmPassword;
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

function validateNickname() {
  const nickname = document.getElementById("nickname").value.trim();
  const helper = document.getElementById("nickname-helper");
  const isValid = nickname.length >= 2 && nickname.length <= 10;
  helper.classList.toggle("hidden", isValid);
  return isValid;
}

// ✅ 회원가입 처리 함수 (로컬 스토리지 저장)
function handleSignup(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const nickname = document.getElementById("nickname").value.trim();
  const profilePicInput = document.getElementById("profile-pic").files[0];
  const userStatus = false;

  if (!validateConfirmPassword()) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  let profilePic = "../../assets/default-profile.png"; // 기본 이미지

  if (profilePicInput) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profilePic = e.target.result;

      const userData = { email, password, nickname, profilePic, userStatus };
      localStorage.setItem("user", JSON.stringify(userData));

      alert("회원가입 성공!");
      loadPage("../pages/auth/login.js");
    };
    reader.readAsDataURL(profilePicInput);
  } else {
    const userData = { email, password, nickname, profilePic, userStatus };
    localStorage.setItem("user", JSON.stringify(userData));

    alert("회원가입 성공!");
    loadPage("../pages/auth/login.js");
  }
}
