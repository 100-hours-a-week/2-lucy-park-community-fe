// components/ProfileLogoButton/ProfileLogoButton.js
import { loadPage } from "../../scripts/app.js";

export function renderProfileLogoButton() {
    loadProfileStyles();

    return `
        <div class="profile-container">
            <button id="profile-button">
                <img id="profile-img" src="" alt="프로필">
            </button>
            <div id="profile-menu" class="hidden">
                <ul>
                    <li id="edit-profile">회원정보수정</li>
                    <li id="change-password">비밀번호수정</li>
                    <li id="logout">로그아웃</li>
                </ul>
            </div>
        </div>
    `;
}

export function setupProfileButton() {
    let user = JSON.parse(localStorage.getItem("user")) || {};
    let profilePic = user.profilePic || "../../assets/default-profile.png";

    const profileImg = document.getElementById("profile-img");
    const profileButton = document.getElementById("profile-button");
    const profileMenu = document.getElementById("profile-menu");
    const editProfileBtn = document.getElementById("edit-profile");
    const editPassword = document.getElementById("change-password");
    const logoutBtn = document.getElementById("logout");

    if (profileImg) profileImg.src = profilePic;

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

    // 로그아웃: 로컬 스토리지 초기화 후, alert 후 페이지 새로고침하여 깔끔하게 로그아웃 처리
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        alert("로그아웃 되었습니다.");
        location.reload();
    });
}

function loadProfileStyles() {
    if (!document.getElementById("profile-css")) {
        const link = document.createElement("link");
        link.id = "profile-css";
        link.rel = "stylesheet";
        link.href = "../components/ProfileLogoButton/ProfileLogoButton.css";
        document.head.appendChild(link);
    }
}
