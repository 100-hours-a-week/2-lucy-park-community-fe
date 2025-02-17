import { renderProfileLogoButton, setupProfileButton } from "../ProfileLogoButton/ProfileLogoButton.js";

export function renderHeader() {
    loadHeaderStyles();
    return `
        <header class="header-container">
            <h1 class="header-title">아무 말 대잔치</h1>
            <div class="profile-btn">
                ${renderProfileLogoButton()}
            </div>
        </header>
    `;
}

export function setupHeader() {
    setupProfileButton();
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
