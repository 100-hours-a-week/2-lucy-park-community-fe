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
 * 프로필 이미지 업로드 함수
 */
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("imageFile", file);
  formData.append("type", "profile");

  try {
    const response = await fetch("https://example.com/api/upload", {
      method: "POST",
      body: formData
    });

    if (response.status === 201) {
      const data = await response.json();
      console.log("✅ 이미지 업로드 성공:", data.imageUrl);
      return data.imageUrl;
    } else {
      console.error("⛔ 이미지 업로드 실패:", response.status);
      alert("이미지 업로드에 실패했습니다.");
      return null;
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
    return null;
  }
}

/**
 * 서버에 프로필 이미지 업데이트 요청
 */
async function updateProfileImage(imageUrl) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }

  try {
    const response = await fetch("https://example.com/users/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ imageUrl })
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log("✅ 프로필 이미지 업데이트 성공:", data.updatedImageUrl);
      user.profilePic = data.updatedImageUrl;
      localStorage.setItem("user", JSON.stringify(user));
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
async function updateNickname(newNickname) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }

  try {
    const response = await fetch("https://example.com/users/nickname", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ nickname: newNickname })
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log("✅ 닉네임 업데이트 성공:", data.updatedNickname);
      user.nickname = data.updatedNickname;
      localStorage.setItem("user", JSON.stringify(user));
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
        <input type="file" id="profilePicInput" accept="image/*" style="display: none;">
      </div>

      <!-- 이메일 (수정 불가) -->
      <label class="edit-label" for="email">이메일</label>
      <input type="email" id="email" value="${user.email}" disabled class="edit-input" />

      <!-- 닉네임 (수정 가능) -->
      <label class="edit-label" for="nickname">닉네임</label>
      <input type="text" id="nickname" value="${user.nickname}" placeholder="닉네임을 입력해주세요" class="edit-input" />
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
  const profileImage = document.getElementById("profile-image");

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
      profileImage.src = imageUrl;
      await updateProfileImage(imageUrl);
    }
  });

  updateProfileBtn.addEventListener("click", async () => {
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

    await updateNickname(newNickname);
  });

  deleteAccountBtn.addEventListener("click", () => {
    confirmModal.classList.remove("hidden");
  });

  setupConfirmPopup("confirm-modal", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("posts");
    localStorage.removeItem("comments");
    alert("회원탈퇴가 완료되었습니다.");
    loadPage("../pages/auth/login.js");
  });
}

/** 닉네임 유효성 검사 */
function validateNickname(nickname) {
  if (!nickname) return "닉네임을 입력해주세요.";
  if (nickname === user.nickname) return "현재 사용 중인 닉네임 입니다.";
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
