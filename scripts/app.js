// scripts/app.js

import * as Header from "../components/Header/Header.js";

// 페이지 로드 시점에 헤더 렌더 + 기본 페이지(login.js) 로드
document.addEventListener("DOMContentLoaded", () => {
  // (선택) 헤더를 렌더링
  document.getElementById("header-container").innerHTML = Header.render();

  // 🔥 로그인 상태 확인 후 시작 페이지 결정
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser && storedUser.userStatus) {
    loadPage("../pages/posts/posts.js"); // ✅ 로그인된 경우 게시판으로 이동
  } else {
    loadPage("../pages/auth/login.js"); // ✅ 비로그인 상태면 로그인 화면
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
