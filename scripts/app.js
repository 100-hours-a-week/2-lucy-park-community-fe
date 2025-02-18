import { renderHeader, setupHeader } from "../components/Header/Header.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  const appElement = document.getElementById("app");
  const hrElement = document.getElementById("header-divider");

  if (!appElement) {
    console.error("'app' 요소를 찾을 수 없습니다!");
    return;
  }

  // 로그인 상태 확인
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser && storedUser.userStatus) {
    // 로그인된 상태: 헤더와 hr을 보이게 설정
    appElement.innerHTML = renderHeader();
    setupHeader();
    hrElement.style.display = "block"; // hr 표시
    loadPage("../pages/posts/posts.js");
  } else {
    // 로그인되지 않은 상태: 헤더와 hr을 숨김
    appElement.innerHTML = "";
    hrElement.style.display = "none"; // hr 숨김
    loadPage("../pages/auth/login.js");
  }
}

/** loadPage 수정: params를 추가하여 데이터 전달 */
export function loadPage(pageScript, params = {}) {
  import(pageScript)
    .then((module) => {
      const contentElem = document.getElementById("content");

      if (module.init) {
        module.init(params).then((html) => {
          contentElem.innerHTML = html;
          handleLoginRedirect(pageScript);
        });
      } else if (module.render) {
        contentElem.innerHTML = module.render(params);
        handleLoginRedirect(pageScript);
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

/**  로그인 후 자동 새로고침 기능  */
function handleLoginRedirect(pageScript) {
  if (pageScript.includes("login.js")) {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.userStatus) {
      // 로그인 후 즉시 새로고침하여 헤더를 정상적으로 표시
      location.reload();
    }
  }
}

// nav-link 클릭 시 data-page 경로로 이동
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("nav-link")) {
    event.preventDefault();
    const page = event.target.getAttribute("data-page");
    loadPage(page);
  }
});
