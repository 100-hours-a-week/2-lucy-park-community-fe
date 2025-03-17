import { loadPage } from "../../scripts/app.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";
import { API_BASE_URL } from "../../config.js";
import { uploadImage } from "../../scripts/utils.js"; 

// 로컬 스토리지에서 값들을 각각 꺼내오기
let id = localStorage.getItem("id") || "";
let accessToken = localStorage.getItem("accessToken") || "";
let email = localStorage.getItem("email") || "";
let nickname = localStorage.getItem("nickname") || "";
let profileImage = localStorage.getItem("profileImage") || ""; // 없으면 빈 문자열

async function updateProfileImage(response) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }
  const imageUrl = response.imageUrl
  const requestBody = { imageUrl };

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile/image`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ 프로필 이미지 업데이트 응답:", result);
      // 서버 응답 구조 예시: { message: "update_profile_image_success", data: { imageUrl: "/uploads/thumbnail_XXX.JPG" } }
      if (result.data && result.data.imageUrl) {
        localStorage.setItem("profileImage", result.data.imageUrl);
      }
      showToastMessage("프로필 이미지가 업데이트되었습니다.");
    } else {
      console.error("⛔ 프로필 업데이트 실패:", response.status);
      alert("프로필 업데이트에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
  }
}

/**
 * 서버에 닉네임 업데이트 요청
 */
async function updateNickname(nickname) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }

  const requestBody = { nickname };

  console.log("requestBody", requestBody)

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile/nickname`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log("✅ 닉네임 업데이트 성공:", data.data.nickname);

      // 성공 시 로컬 스토리지의 nickname 값을 업데이트
      localStorage.setItem("nickname", data.data.nickname);

      showToastMessage("닉네임이 수정되었습니다.");
    } else {
      console.error("⛔ 닉네임 업데이트 실패:", response.status);
      alert("닉네임 업데이트에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
  }
}

/** editProfile 페이지 초기화 */
export async function init() {
  loadEditProfileStyles();

  // 다시 한 번 로컬 스토리지 값들을 가져와서 최신 상태를 반영
  id = localStorage.getItem("id") || "";
  accessToken = localStorage.getItem("accessToken") || "";
  email = localStorage.getItem("email") || "";
  nickname = localStorage.getItem("nickname") || "";
  profileImage = localStorage.getItem("profileImage") || "";

  const html = `
    <section class="edit-profile-container">
      <h2 class="edit-profile-title">회원정보 수정</h2>
      
      <!-- 프로필 섹션 (이미지 + 오버레이) -->
      <div class="profile-section">
        <div class="profile-wrapper" id="profile-wrapper">
          <img 
            src="${API_BASE_URL}${profileImage}" 
            alt="프로필 이미지" 
            class="profile-image" 
            id="profile-image"
          >
          <div class="profile-overlay">변경</div>
        </div>
        <input type="file" id="profilePicInput" accept="image/*" style="display: none;">
      </div>

      <!-- 이메일 (수정 불가) -->
      <label class="edit-label" for="email">이메일</label>
      <input type="email" id="email" value="${email}" disabled class="edit-input" />

      <!-- 닉네임 (수정 가능) -->
      <label class="edit-label" for="nickname">닉네임</label>
      <input type="text" id="nickname" value="${nickname}" placeholder="닉네임을 입력해주세요" class="edit-input" />
      <p id="nickname-helper" class="helper-text hidden"></p>

      <!-- 수정하기 버튼 -->
      <button id="update-profile-btn" class="primary-btn">수정하기</button>

      <!-- 회원 탈퇴 버튼 -->
      <button id="delete-account-btn" class="danger-btn">회원 탈퇴</button>

      ${ConfirmPopup("confirm-modal", "회원 탈퇴 확인", "작성된 게시글과 댓글은 삭제됩니다.", "확인")}
    </section>
  `;

  setTimeout(setupEditProfile, 0);
  return html;
}

/** 이벤트 및 유효성 검사 설정 */
export function setupEditProfile() {
  const profileWrapper = document.getElementById("profile-wrapper");
  const profilePicInput = document.getElementById("profilePicInput");
  const profileImageElem = document.getElementById("profile-image");

  const nicknameInput = document.getElementById("nickname");
  const nicknameHelper = document.getElementById("nickname-helper");

  const updateProfileBtn = document.getElementById("update-profile-btn");
  const deleteAccountBtn = document.getElementById("delete-account-btn");
  const confirmModal = document.getElementById("confirm-modal");

  profileWrapper.addEventListener("click", () => {
    profilePicInput.click();
  });

  profilePicInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      // 미리보기 갱신
      //profileImageElem.src = imageUrl;
      // 서버 반영
      await updateProfileImage(imageUrl);
    }
  });

  updateProfileBtn.addEventListener("click", async () => {
    const newNickname = nicknameInput.value;
    const errorMsg = validateNickname(newNickname);
    
    if (errorMsg) {
      nicknameHelper.textContent = `* ${errorMsg}`;
      nicknameHelper.classList.remove("hidden");
      nicknameInput.focus();
      return;
    } else {
      nicknameHelper.classList.add("hidden");
    }

    await updateNickname(newNickname);
  });

  deleteAccountBtn.addEventListener("click", () => {
    confirmModal.classList.remove("hidden");
  });

  setupConfirmPopup("confirm-modal", async () => {
    // 회원 탈퇴 로직(백)
    await requestDeleteAccount();
  });
}

/** 회원 탈퇴 요청 */
async function requestDeleteAccount() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile/session`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      // 회원탈퇴 성공 시 로컬 스토리지 초기화
      localStorage.removeItem("id");
      localStorage.removeItem("email");
      localStorage.removeItem("nickname");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("posts");
      localStorage.removeItem("comments");

      alert("회원탈퇴가 완료되었습니다.");
      loadPage("../pages/auth/login.js");
    } else {
      console.error("⛔ 회원탈퇴 실패:", response.status);
      alert("회원탈퇴에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
  }
}

/** 닉네임 유효성 검사 */
function validateNickname(nickname) {
  if (!nickname) return "닉네임을 입력해주세요.";
  if (nickname === localStorage.getItem("nickname")) return "현재 사용 중인 닉네임 입니다.";
  if (nickname.length > 10) return "닉네임은 최대 10자까지 작성 가능합니다.";
  return "";
}

/** 토스트 메시지 표시 */
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

/** CSS 로드 */
function loadEditProfileStyles() {
  // 이미 로드된 CSS를 중복 추가하지 않도록 처리
  if (!document.getElementById("edit-profile-css")) {
    const link = document.createElement("link");
    link.id = "edit-profile-css";
    link.rel = "stylesheet";
    link.href = "../styles/user/editProfile.css"; 
    document.head.appendChild(link);
  }
  if (!document.getElementById("confirm-popup-css")) {
    const link = document.createElement("link");
    link.id = "confirm-popup-css";
    link.rel = "stylesheet";
    link.href = "../../components/ConfirmPopup/confirmPopup.css";
    document.head.appendChild(link);
  }
}
