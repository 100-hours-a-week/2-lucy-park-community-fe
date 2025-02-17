// BackButton.js
import { loadPage } from "../../scripts/app.js";

/**
  @param {string} targetPage - 버튼 클릭 시 이동할 페이지 (기본값)
 @param {string} btnId - 버튼 ID (기본값은 "back-btn")
 */
export function BackButton(targetPage = "pages/auth/login.js", btnId = "back-btn") {
  return `
    <button id="${btnId}" class="back-button">←</button>
  `;
}

export function setupBackButton(targetPage = "pages/auth/login.js", btnId = "back-btn") {
  const backBtn = document.getElementById(btnId);
  if (!backBtn) {
    console.warn(`Back button with ID "${btnId}" not found.`);
    return;
  }
  backBtn.addEventListener("click", () => {
    loadPage(targetPage);
  });
}
