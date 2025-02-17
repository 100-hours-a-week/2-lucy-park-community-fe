// scripts/app.js
import { renderHeader, setupHeader } from "../components/Header/Header.js";

document.addEventListener("DOMContentLoaded", () => {
  const appElement = document.getElementById("app");
  
  if (!appElement) {
    console.error("🚨 'app' 요소를 찾을 수 없습니다!");
    return;
  }

  appElement.innerHTML = renderHeader();
  setupHeader();

  // 🔥 로그인 상태 확인 후 페이지 결정
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser && storedUser.userStatus) {
    loadPage("../pages/posts/posts.js");
  } else {
    loadPage("../pages/auth/login.js");
  }
});


/** ✅ loadPage 수정: params를 추가하여 데이터 전달 */
export function loadPage(pageScript, params = {}) {
  import(pageScript)
    .then((module) => {
      const contentElem = document.getElementById("content");

      if (module.init) {
        module.init(params).then((html) => {
          contentElem.innerHTML = html;
        });
      } else if (module.render) {
        contentElem.innerHTML = module.render(params);
      } else {
        contentElem.innerHTML = "";
      }

      if (module.setup) {
        module.setup();
      }
    })
    .catch((error) => {
      console.error("페이지 로드 오류:", error);
    });
}


// ✅ nav-link 클릭 시 data-page 경로로 이동
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("nav-link")) {
    event.preventDefault();
    const page = event.target.getAttribute("data-page");
    loadPage(page);
  }
});
