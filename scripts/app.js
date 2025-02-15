// scripts/app.js
import * as Header from "../components/Header/Header.js";

document.addEventListener("DOMContentLoaded", () => {
  // 헤더 렌더링
  document.getElementById("header-container").innerHTML = Header.render();

  // 기본 페이지 로드 (로그인 페이지)
  loadPage("../pages/auth/login.js");
  
  // (필요시) 푸터 등 다른 컴포넌트도 로드
});

// 페이지 변경 시 동적 로딩 함수
function loadPage(pageScript) {
  // pageScript 인자로 "../pages/auth/login.js"와 같은 절대경로(문서 기준)를 받음
  import(pageScript)
    .then((module) => {
      // 모듈에서 render()를 호출해 콘텐츠를 채우고
      document.getElementById("content").innerHTML = module.render();
      // 모듈에 setup() 함수가 있으면 초기화(이벤트 바인딩, CSS 로드 등) 호출
      if (module.setup) {
        module.setup();
      }
    })
    .catch((error) => console.error("페이지 로드 오류:", error));
}

// 네비게이션 이벤트 추가 (예시)
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("nav-link")) {
    event.preventDefault();
    const page = event.target.getAttribute("data-page");
    loadPage(page);
  }
});
