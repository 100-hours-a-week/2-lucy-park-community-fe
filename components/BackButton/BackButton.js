import { loadPage } from "../../scripts/app.js"; // ✅ loadPage 가져오기

export function BackButton(targetPage = "pages/auth/login.js") { // ✅ 로그인 페이지 경로 수정
  return `
    <button id="back-btn" class="back-button">←</button>
  `;
}

export function setupBackButton(targetPage = "pages/auth/login.js") { // ✅ 경로 수정
  document.getElementById("back-btn").addEventListener("click", () => {
    loadPage(targetPage); // ✅ 뒤로 가기 버튼 클릭 시 특정 페이지 로드
  });
}
