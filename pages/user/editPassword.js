// editPassword.js
import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";

/**
 * 비밀번호 수정 페이지 렌더 함수
 */
export function render() {
  return `
    <section class="edit-password-container">

      <h2>비밀번호 수정</h2>
      
      <form id="edit-password-form">
        <div class="input-group">
          <label for="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            placeholder="비밀번호를 입력하세요" 
            required 
          />
          <p id="password-helper" class="helper-text">
            <!-- 초기에는 visibility: hidden 상태 (CSS) -->
            비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.
          </p>
        </div>

        <div class="input-group">
          <label for="confirm-password">비밀번호 확인</label>
          <input 
            type="password" 
            id="confirm-password" 
            placeholder="비밀번호를 다시 입력하세요" 
            required 
          />
          <p id="confirm-password-helper" class="helper-text">
            비밀번호가 일치하지 않습니다.
          </p>
        </div>

        <!-- 수정하기 버튼: 유효성 검사 통과 시 활성화 -->
        <button type="submit" id="update-password-btn" disabled>수정하기</button>
      </form>
    </section>
  `;
}

/**
 * 페이지 초기 설정 함수
 */
export function setup() {
  loadStyles();         // CSS 로드
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
    link.href = "styles/user/editPassword.css"; // 프로젝트 구조에 맞춰 경로 수정
    document.head.appendChild(link);
  }
}

/**
 * 이벤트 바인딩
 */
function setupEventListeners() {
  const form = document.getElementById("edit-password-form");
  form.addEventListener("input", validateForm);    // 폼 내부 입력값 변경 시 유효성 검사
  form.addEventListener("submit", handlePasswordUpdate); // 폼 제출 시 비밀번호 업데이트
}

/**
 * 전체 폼 유효성 검사
 */
function validateForm() {
  const passwordValid = validatePassword();
  const confirmPasswordValid = validateConfirmPassword();

  // 두 조건 모두 만족해야 버튼 활성화
  document.getElementById("update-password-btn").disabled = 
    !(passwordValid && confirmPasswordValid);
}

/**
 * 비밀번호 유효성 검사 (8~20자, 대소문자, 숫자, 특수문자 각각 최소 1개 포함)
 */
function validatePassword() {
  const password = document.getElementById("password").value.trim();
  const helper = document.getElementById("password-helper");

  // 정규식 예시: 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 최소 1개씩 포함, 8~20자
  const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/.test(password);

  // 에러가 없으면 visibility 숨기고, 있으면 보이게
  if (isValid) {
    helper.classList.remove("visible");
  } else {
    helper.classList.add("visible");
  }

  return isValid;
}

/**
 * 비밀번호 확인 유효성 검사 (동일 여부)
 */
function validateConfirmPassword() {
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const helper = document.getElementById("confirm-password-helper");

  const isValid = (password === confirmPassword) && password !== "";

  if (isValid) {
    helper.classList.remove("visible");
  } else {
    helper.classList.add("visible");
  }

  return isValid;
}

/**
 * 비밀번호 최종 업데이트 (로컬 스토리지 반영 등)
 */
function handlePasswordUpdate(event) {
  event.preventDefault();

  // 최종 유효성 검사 (혹시라도 통과 못하는 경우)
  if (!validatePassword() || !validateConfirmPassword()) {
    alert("비밀번호를 올바르게 입력해주세요.");
    return;
  }

  // 로컬 스토리지에서 현재 사용자 정보 가져오기
  const userData = JSON.parse(localStorage.getItem("user")) || null;
  if (!userData) {
    alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
    // 로그인 페이지로 이동
    loadPage("../pages/auth/login.js");
    return;
  }

  // 비밀번호 업데이트 후 저장
  const newPassword = document.getElementById("password").value.trim();
  userData.password = newPassword;
  localStorage.setItem("user", JSON.stringify(userData));

  alert("비밀번호가 수정되었습니다.");
  // 수정 완료 후, 원하는 페이지로 이동 (예: 회원정보 수정 페이지)
  loadPage("../pages/user/editProfile.js");
}
