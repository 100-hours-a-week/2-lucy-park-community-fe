import { loadPage } from "../../scripts/app.js";
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
          <label for="edit-password-input">새 비밀번호</label>
          <input 
            type="password" 
            id="edit-password-input" 
            placeholder="새 비밀번호를 입력하세요" 
            required 
          />
          <p id="edit-password-helper" class="edit-password-helper hidden">
            비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.
          </p>
        </div>

        <div class="input-group">
          <label for="edit-confirm-input">비밀번호 확인</label>
          <input 
            type="password" 
            id="edit-confirm-input" 
            placeholder="새 비밀번호를 다시 입력하세요" 
            required 
          />
          <p id="edit-confirm-helper" class="edit-password-helper hidden">
            비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <button type="submit" id="edit-update-btn" disabled>수정하기</button>
      </form>
    </section>
  `;
}


/**
 * 페이지 초기 설정 함수
 */
export function setup() {
  loadStyles();
  setupEventListeners();
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
  // input 이벤트마다 각 필드의 유효성 검사를 실행
  form.addEventListener("input", validateForm);
  form.addEventListener("submit", handlePasswordUpdate);
}

/**
 * 전체 폼 유효성 검사
 */
function validateForm() {
  const passwordValid = validatePasswordField();
  const confirmPasswordValid = validateConfirmPasswordField();

  document.getElementById("edit-update-btn").disabled = !(passwordValid && confirmPasswordValid);
}

/**
 * 새 비밀번호 필드 검증 및 헬퍼 텍스트 처리
 */
function validatePasswordField() {
  const value = document.getElementById("edit-password-input").value.trim();
  const passwordHelper = document.getElementById("edit-password-helper");

  if (!value) {
    console.log("*비밀번호를 입력해주세요.");
    passwordHelper.textContent = "*비밀번호를 입력해주세요.";
    passwordHelper.classList.remove("hidden");
    return false;
  } else if (!validatePassword(value)) {
    console.log("*비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.");
    passwordHelper.textContent = "*비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.";
    passwordHelper.classList.remove("hidden");
    return false;
  } else {
    passwordHelper.classList.add("hidden");
    return true;
  }
}

/**
 * 비밀번호 확인 필드 검증 및 헬퍼 텍스트 처리
 */
function validateConfirmPasswordField() {
  const passwordValue = document.getElementById("edit-password-input").value.trim();
  const confirmPasswordValue = document.getElementById("edit-confirm-input").value.trim();
  const confirmPasswordHelper = document.getElementById("edit-confirm-helper");

  if (!confirmPasswordValue) {
    confirmPasswordHelper.textContent = "*비밀번호 확인을 입력해주세요.";
    confirmPasswordHelper.classList.remove("hidden");
    return false;
  } else if (passwordValue !== confirmPasswordValue) {
    confirmPasswordHelper.textContent = "*비밀번호가 일치하지 않습니다.";
    confirmPasswordHelper.classList.remove("hidden");
    return false;
  } else {
    confirmPasswordHelper.classList.add("hidden");
    return true;
  }
}

/**
 * 비밀번호 유효성 검사 (8~20자, 대소문자, 숫자, 특수문자 포함)
 */
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return regex.test(password);
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("id");
      localStorage.removeItem("email");
      localStorage.removeItem("nickname");
      localStorage.removeItem("profileImage");
      location.reload();
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

function handlePasswordUpdate(event) {
  event.preventDefault();

  if (!validatePasswordField() || !validateConfirmPasswordField()) {
    alert("비밀번호를 올바르게 입력해주세요.");
    return;
  }

  const newPassword = document.getElementById("edit-password-input").value.trim();
  updatePassword(newPassword);
}
