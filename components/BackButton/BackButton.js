import { loadPage } from "../../scripts/app.js";

/**
 * 뒤로가기 버튼 HTML 생성
 * @param {string|object} targetPage - 버튼 클릭 시 이동할 페이지
 *     문자열이면 단순 경로, 객체면 { url: "경로", data: { ... } } 형태
 * @param {string} btnId - 버튼 ID (기본값: "back-btn")
 */
export function BackButton(targetPage = "pages/auth/login.js", btnId = "back-btn") {
  return `
    <button id="${btnId}" class="back-button">←</button>
  `;
}

/**
 * 뒤로가기 버튼 이벤트 설정
 * @param {string|object} targetPage - 버튼 클릭 시 이동할 페이지 (문자열 또는 { url, data } 객체)
 * @param {string} btnId - 버튼 ID (기본값: "back-btn")
 */
export function setupBackButton(targetPage = "pages/auth/login.js", btnId = "back-btn") {
  const backBtn = document.getElementById(btnId);
  if (!backBtn) {
    console.warn(`Back button with ID "${btnId}" not found.`);
    return;
  }
  backBtn.addEventListener("click", () => {
    if (typeof targetPage === "string") {
      loadPage(targetPage);
    } else if (typeof targetPage === "object" && targetPage !== null) {
      loadPage(targetPage.url, targetPage.data);
    }
  });
}
