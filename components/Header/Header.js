import { renderProfileLogoButton, setupProfileButton } from "../ProfileLogoButton/ProfileLogoButton.js";
import { loadPage } from "../../scripts/app.js"; 
import { BackButton, setupBackButton } from "../BackButton/BackButton.js";

/**
 * 헤더 렌더링 함수
 * @param {string|object} backButtonTarget - 뒤로가기 버튼 대상
 *     문자열이면 단순 경로, 객체면 { url: "경로", data: { ... } } 형태
 * @param {boolean} showBackButton - 뒤로가기 버튼을 보일지 여부
 */
export function renderHeader(backButtonTarget = "../pages/posts/posts.js", showBackButton = true) {
    loadHeaderStyles();
    return `
        <header class="header-container">
            <div class="back-button ${showBackButton ? "" : "invisible"}">
                ${BackButton(backButtonTarget, "post-back-btn")}
            </div>
            <h1 id="header-title" class="header-title">아무 말 대잔치</h1>
            <div class="profile-btn">
                ${renderProfileLogoButton()}
            </div>
        </header>
    `;
}

/**
 * 헤더 이벤트 설정 함수
 * @param {string|object} backButtonTarget - 뒤로가기 버튼 대상
 * @param {boolean} showBackButton - 뒤로가기 버튼을 보일지 여부
 */
export function setupHeader(backButtonTarget = "../pages/posts/posts.js", showBackButton = true) {
    setupProfileButton();
    // showBackButton가 true일 때만 백 버튼 이벤트 설정
    if (showBackButton) {
        setupBackButton(backButtonTarget, "post-back-btn");
    }

    // 헤더 타이틀 클릭 시 게시글 페이지로 이동
    const headerTitle = document.getElementById("header-title");
    if (headerTitle) {
        headerTitle.addEventListener("click", (e) => {
            e.stopPropagation(); // 이벤트 버블링 방지
            loadPage("../pages/posts/posts.js");
        });
    }
}

function loadHeaderStyles() {
    if (!document.getElementById("header-css")) {
        const link = document.createElement("link");
        link.id = "header-css";
        link.rel = "stylesheet";
        link.href = "../components/Header/Header.css"; 
        document.head.appendChild(link);
    }
}
