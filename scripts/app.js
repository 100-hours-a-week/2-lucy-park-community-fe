// scripts/app.js
import { renderHeader, setupHeader } from "../components/Header/Header.js";

document.addEventListener("DOMContentLoaded", () => {
  const appElement = document.getElementById("app");
  
  if (!appElement) {
    console.error("'app' 요소를 찾을 수 없습니다!");
    return;
  }

  //  로그인 상태 확인
  const storedUser = JSON.parse(localStorage.getItem("user"));
  
  // 로그인 된 상태라면 헤더를 렌더링하고, 게시글 페이지를 로드
  if (storedUser && storedUser.userStatus) {
    appElement.innerHTML = renderHeader();
    setupHeader();
    loadPage("../pages/posts/posts.js");
  } else {
    // 로그인되지 않은 상태면 헤더를 숨기고 로그인 페이지를 로드
    appElement.innerHTML = "";
    loadPage("../pages/auth/login.js");
  }
});

/** loadPage 수정: params를 추가하여 데이터 전달 */
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

// nav-link 클릭 시 data-page 경로로 이동
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("nav-link")) {
    event.preventDefault();
    const page = event.target.getAttribute("data-page");
    loadPage(page);
  }
});
