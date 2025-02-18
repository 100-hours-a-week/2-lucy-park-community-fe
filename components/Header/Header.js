import { renderProfileLogoButton, setupProfileButton } from "../ProfileLogoButton/ProfileLogoButton.js";
import { loadPage } from "../../scripts/app.js"; // loadPage 함수 import

export function renderHeader() {
    loadHeaderStyles();
    return `
        <header class="header-container">
            <h1 id="header-title" class="header-title">아무 말 대잔치</h1>
            <div class="profile-btn">
                ${renderProfileLogoButton()}
            </div>
            
        </header>
        <hr/>
    `;
}

export function setupHeader() {
    setupProfileButton();

    // 헤더 타이틀만 클릭 시 게시글 페이지로 이동
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
