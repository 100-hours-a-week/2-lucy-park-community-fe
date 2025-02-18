// editProfile.js
import { loadPage } from "../../scripts/app.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";

/**
 * 로컬 스토리지의 현재 사용자 정보 (없으면 기본값)
 */
let user = JSON.parse(localStorage.getItem("user")) || {
  email: "",
  nickname: "",
  profilePic: "../../assets/default-profile.png",
};

/**
 * 이미 가입된 닉네임 목록 (예시)
 * 실제 환경에서는 서버나 localStorage의 "users" 배열 등에서 가져와야 합니다.
 * 여기서는 본인의 닉네임은 검사에서 제외하기 위해 그대로 사용합니다.
 */
const existingNicknames = ["admin", "testnick", "hello"]; // 예시
// 본인의 닉네임 제외한 목록
const filteredNicknames = existingNicknames.filter(name => name !== user.nickname);

/** editProfile 페이지 초기화 */
export async function init() {
  loadEditProfileStyles();

  const html = `
    <section class="edit-profile-container">
      <h2 class="edit-profile-title">회원정보 수정</h2>
      
      <!-- 프로필 섹션 (이미지 + 오버레이) -->
      <div class="profile-section">
        <div class="profile-wrapper" id="profile-wrapper">
          <img 
            src="${user.profilePic}" 
            alt="프로필 이미지" 
            class="profile-image" 
            id="profile-image"
          >
          <div class="profile-overlay">변경</div>
        </div>
        <!-- 숨김 파일 인풋: 프로필 이미지 수정 -->
        <input type="file" id="profilePicInput" accept="image/*" style="display: none;">
      </div>

      <!-- 이메일 (수정 불가) -->
      <label class="edit-label" for="email">이메일</label>
      <input 
        type="email" 
        id="email" 
        value="${user.email}" 
        disabled 
        class="edit-input"
      />

      <!-- 닉네임 (수정 가능) -->
      <label class="edit-label" for="nickname">닉네임</label>
      <input 
        type="text" 
        id="nickname" 
        value="${user.nickname}" 
        placeholder="닉네임을 입력해주세요" 
        class="edit-input"
      />
      <p id="nickname-helper" class="helper-text hidden"></p>

      <!-- 수정하기 버튼 -->
      <button id="update-profile-btn" class="primary-btn">수정하기</button>

      <!-- 회원 탈퇴 버튼 -->
      <button id="delete-account-btn" class="danger-btn">회원 탈퇴</button>

      ${ConfirmPopup(
        "confirm-modal",
        "회원 탈퇴 확인",
        "작성된 게시글과 댓글은 삭제됩니다.",
        "확인"
      )}
    </section>
  `;

  setTimeout(setupEditProfile, 0);
  return html;
}

/** 이벤트 및 유효성 검사 설정 */
export function setupEditProfile() {
  const profileWrapper = document.getElementById("profile-wrapper");
  const profilePicInput = document.getElementById("profilePicInput");
  const profileImage = document.getElementById("profile-image");

  const nicknameInput = document.getElementById("nickname");
  const nicknameHelper = document.getElementById("nickname-helper");

  const updateProfileBtn = document.getElementById("update-profile-btn");
  const deleteAccountBtn = document.getElementById("delete-account-btn");
  const confirmModal = document.getElementById("confirm-modal");

  // [1] 프로필 이미지 클릭 -> 파일 선택창 열기
  profileWrapper.addEventListener("click", () => {
    profilePicInput.click();
  });

  // [2] 파일 선택 -> 이미지 미리보기 및 즉시 로컬 스토리지에 저장
  profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      profileImage.src = event.target.result;
      user.profilePic = event.target.result;
      localStorage.setItem("user", JSON.stringify(user));
    };
    reader.readAsDataURL(file);
  });

  // [3] 수정하기 버튼 클릭 시 닉네임 유효성 검사 후 업데이트
  updateProfileBtn.addEventListener("click", () => {
    const newNickname = nicknameInput.value.trim();
    const errorMsg = validateNickname(newNickname);
    
    if (errorMsg) {
      nicknameHelper.textContent = `* ${errorMsg}`;
      nicknameHelper.classList.remove("hidden");
      nicknameInput.focus();
      return;
    } else {
      nicknameHelper.classList.add("hidden");
    }

    // 유효한 경우에만 업데이트 (기존 localStorage 내용은 그대로 유지)
    user.nickname = newNickname;
    localStorage.setItem("user", JSON.stringify(user));
    showToastMessage("수정이 완료되었습니다.");
  });

  // [4] 회원 탈퇴 버튼 클릭 -> 모달 표시
  deleteAccountBtn.addEventListener("click", () => {
    confirmModal.classList.remove("hidden");
  });

  // [5] ConfirmPopup -> 확인 클릭 시 회원 탈퇴 처리
  setupConfirmPopup("confirm-modal", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("posts");
    localStorage.removeItem("comments");
    alert("회원탈퇴가 완료되었습니다.");
    loadPage("../pages/auth/login.js");
  });
}

/**
 * 닉네임 유효성 검사 함수
 * @param {string} nickname - 새로 입력한 닉네임
 * @returns {string} 에러 메시지 (정상인 경우 빈 문자열)
 */
function validateNickname(nickname) {
  // 1) 빈 값 검사
  if (!nickname) {
    return "닉네임을 입력해주세요.";
  }
  // 2) 변경 전과 동일하면 업데이트할 필요 없음
  if (nickname === user.nickname) {
    return "현재 사용 중인 닉네임 입니다.";
  }
  // 3) 중복 검사 (본인 닉네임은 제외한 목록 사용)
  if (filteredNicknames.includes(nickname)) {
    return "중복된 닉네임 입니다.";
  }
  // 4) 길이 검사 (최대 10자)
  if (nickname.length > 10) {
    return "닉네임은 최대 10자까지 작성 가능합니다.";
  }
  return "";
}

/** 토스트 메시지 표시 함수 */
function showToastMessage(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

/** CSS 동적 로드 함수 */
async function loadEditProfileStyles() {
  if (!document.getElementById("edit-profile-css")) {
    const link = document.createElement("link");
    link.id = "edit-profile-css";
    link.rel = "stylesheet";
    link.href = "../../styles/user/editProfile.css"; // 경로에 맞게 조정
    document.head.appendChild(link);
  }
  if (!document.getElementById("confirm-popup-css")) {
    const link2 = document.createElement("link");
    link2.id = "confirm-popup-css";
    link2.rel = "stylesheet";
    link2.href = "../../components/ConfirmPopup/ConfirmPopup.css"; // 경로에 맞게 조정
    document.head.appendChild(link2);
  }
}
