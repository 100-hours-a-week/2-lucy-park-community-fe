// scripts/app.js

import * as Header from "../components/Header/Header.js";

// 페이지 로드 시점에 헤더 렌더 + 기본 페이지(login.js) 로드
document.addEventListener("DOMContentLoaded", () => {
  // (선택) 헤더를 렌더링
  document.getElementById("header-container").innerHTML = Header.render();

  // 시작 페이지를 login.js로
  loadPage("../pages/auth/login.js");
});

/** 다른 모듈에서 사용할 수 있게 export */
export function loadPage(pageScript) {
  // 동적으로 모듈 import
  import(pageScript)
    .then((module) => {
      // 모듈이 render()를 제공하면, #content에 삽입
      const contentElem = document.getElementById("content");
      if (module.render) {
        contentElem.innerHTML = module.render();
      } else {
        contentElem.innerHTML = ""; // render 없으면 기본값
      }

      // 모듈이 setup()를 제공하면, 추가 초기화 수행 (이벤트, CSS 로드 등)
      if (module.setup) {
        module.setup();
      }
    })
    .catch((error) => {
      console.error("페이지 로드 오류:", error);
    });
}

// (예시) nav-link 클릭 시 data-page 경로로 이동
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("nav-link")) {
    event.preventDefault();
    const page = event.target.getAttribute("data-page");
    loadPage(page);
  }
});
