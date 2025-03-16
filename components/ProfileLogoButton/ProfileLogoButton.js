import { loadPage } from "../../scripts/app.js";
import { API_BASE_URL } from "../../config.js";

export function renderProfileLogoButton() {
    loadProfileStyles();

    return `
        <div class="profile-container">
            <button id="profile-button">
                <img id="profile-img" src="" alt="프로필">
            </button>
            <div id="profile-menu" class="hidden">
                <ul>
                    <li id="edit-profile">회원정보 수정</li>
                    <li id="change-password">비밀번호 수정</li>
                    <li id="logout">로그아웃</li>
                </ul>
            </div>
        </div>
    `;
}

export function setupProfileButton() {
    const profileImage = localStorage.getItem("profileImage") || {};
    
    // user.profileImage 가 있으면 API_BASE_URL + profileImage 경로,
    // 없으면 기본 프로필 이미지
    const profilePic = profileImage
        ? `${API_BASE_URL}${profileImage}`
        : "../../assets/default-profile.png";

    const profileImg = document.getElementById("profile-img");
    const profileButton = document.getElementById("profile-button");
    const profileMenu = document.getElementById("profile-menu");
    const editProfileBtn = document.getElementById("edit-profile");
    const editPassword = document.getElementById("change-password");
    const logoutBtn = document.getElementById("logout");

    if (profileImg) {
        profileImg.src = profilePic;
    }

    profileButton.addEventListener("click", (event) => {
        event.stopPropagation();
        profileMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
        if (!profileButton.contains(event.target) && !profileMenu.contains(event.target)) {
            profileMenu.classList.add("hidden");
        }
    });

    // 회원정보 수정 페이지로 이동
    editProfileBtn.addEventListener("click", () => {
        loadPage("../pages/user/editProfile.js");
    });

    // 비밀번호 수정 페이지로 이동
    editPassword.addEventListener("click", () => {
        loadPage("../pages/user/editPassword.js");
    });

    // 로그아웃 처리
    logoutBtn.addEventListener("click", async () => {
        await logoutUser();
    });
}

/**
 * 서버에 로그아웃 요청 (Access Token & Refresh Token 삭제)
 */
async function logoutUser() {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        alert("이미 로그아웃되었습니다.");
        loadPage("../pages/auth/login.js");
        return;
    }

    try {
        // 실제 서버 주소로 변경
        const response = await fetch(`${API_BASE_URL}/users/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            console.log("✅ 로그아웃 성공");
            handleLogout();
        } else if (response.status === 400) {
            const errorData = await response.json();
            console.error("⛔ 잘못된 Access Token:", errorData.error);
            alert("잘못된 접근입니다. 다시 로그인해주세요.");
            handleLogout();
        } else if (response.status === 403) {
            console.error("⛔ Access Token 만료");
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            handleLogout();
        } else {
            console.error("⛔ 서버 오류 발생");
            alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
        }
    } catch (error) {
        console.error("⛔ 네트워크 오류:", error);
        alert("네트워크 오류가 발생했습니다.");
    }
}

/**
 * 로그아웃 처리 (로컬 스토리지 정리 및 로그인 페이지 이동)
 */
function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    alert("로그아웃 되었습니다.");
    loadPage("../pages/auth/login.js");
}

/**
 * CSS 동적 로드
 */
function loadProfileStyles() {
    if (!document.getElementById("profile-css")) {
        const link = document.createElement("link");
        link.id = "profile-css";
        link.rel = "stylesheet";
        link.href = "../components/ProfileLogoButton/ProfileLogoButton.css";
        document.head.appendChild(link);
    }
}
