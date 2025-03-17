import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { API_BASE_URL } from "../../config.js";

/**
 * 비밀번호 수정 페이지 렌더 함수
 */
export function render() {
  return `
    <section class="edit-password-container">
      <h2>비밀번호 수정</h2>
      
      <form id="edit-password-form">
        <div class="input-group">
          <label for="password">새 비밀번호</label>
          <input 
            type="password" 
            id="password" 
            placeholder="새 비밀번호를 입력하세요" 
            required 
          />
          <p id="password-helper" class="helper-text hidden">
            비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.
          </p>
        </div>

        <div class="input-group">
          <label for="confirm-password">비밀번호 확인</label>
          <input 
            type="password" 
            id="confirm-password" 
            placeholder="새 비밀번호를 다시 입력하세요" 
            required 
          />
          <p id="confirm-password-helper" class="helper-text hidden">
            비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <button type="submit" id="update-password-btn" disabled>수정하기</button>
      </form>

      <div class="back-button">
        ${BackButton("../pages/user/editProfile.js")}
      </div>
    </section>
  `;
}

/**
 * 페이지 초기 설정 함수
 */
export function setup() {
  loadStyles();
  setupEventListeners();
  setupBackButton("../pages/user/editProfile.js");
}

/**
 * editPassword.css 동적 로드
 */
function loadStyles() {
  if (!document.getElementById("edit-password-css")) {
    const link = document.createElement("link");
    link.id = "edit-password-css";
    link.rel = "stylesheet";
    link.href = "styles/user/editPassword.css"; 
    document.head.appendChild(link);
  }
}

/**
 * 이벤트 바인딩
 */
function setupEventListeners() {
  const form = document.getElementById("edit-password-form");
  form.addEventListener("input", validateForm);
  form.addEventListener("submit", handlePasswordUpdate);
}

/**
 * 전체 폼 유효성 검사
 */
function validateForm() {
  const passwordValid = validatePassword();
  const confirmPasswordValid = validateConfirmPassword();

  document.getElementById("update-password-btn").disabled = !(passwordValid && confirmPasswordValid);
}

/**
 * 비밀번호 유효성 검사 (8~20자, 대소문자, 숫자, 특수문자 포함)
 */
function validatePassword() {
  const password = document.getElementById("password").value.trim();
  const helper = document.getElementById("password-helper");

  const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/.test(password);

  helper.classList.toggle("hidden", isValid);
  return isValid;
}

/**
 * 비밀번호 확인 유효성 검사
 */
function validateConfirmPassword() {
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const helper = document.getElementById("confirm-password-helper");

  const isValid = password === confirmPassword && password !== "";

  helper.classList.toggle("hidden", isValid);
  return isValid;
}

/**
 * 서버에 비밀번호 변경 요청
 */
async function updatePassword(password) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }
  const requestBody = { password };

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      console.log("✅ 비밀번호 변경 성공");
      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("accessToken"); // 로그아웃 처리
      loadPage("../pages/auth/login.js");
    } else if (response.status === 400) {
      const errorData = await response.json();
      console.error("⛔ 비밀번호 변경 실패:", errorData.error);
      alert(errorData.error);
    } else {
      console.error("⛔ 서버 오류 발생");
      alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
  }
}

/**
 * 비밀번호 변경 처리
 */
function handlePasswordUpdate(event) {
  event.preventDefault();

  if (!validatePassword() || !validateConfirmPassword()) {
    alert("비밀번호를 올바르게 입력해주세요.");
    return;
  }

  const newPassword = document.getElementById("password").value.trim();
  updatePassword(newPassword);
}
