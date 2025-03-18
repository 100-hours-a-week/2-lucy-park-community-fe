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
  const storedUserToken = localStorage.getItem("accessToken");
  const storedUserId = localStorage.getItem("id");

  if (storedUserToken && storedUserId) {
    // 로그인된 상태: 헤더와 hr을 보이게 설정
    // 초기 헤더는 기본값(뒤로가기 버튼 없음)으로 렌더링해두고, loadPage에서 업데이트함.
    appElement.innerHTML = renderHeader();
    setupHeader();
    hrElement.style.display = "block";
    loadPage("../pages/posts/posts.js");
  } else {
    // 로그인되지 않은 상태: 헤더와 hr을 숨김
    appElement.innerHTML = "";
    hrElement.style.display = "none";
    loadPage("../pages/auth/login.js");
  }
}

/**
 * 페이지 스크립트에 따라 헤더를 업데이트합니다.
 * /post/가 포함되거나 makePost.js, editPost.js인 경우 뒤로가기 버튼을 보입니다.
 * 뒤로가기 버튼을 누르면 기본적으로 게시글 목록 페이지로 이동하도록 설정했습니다.
 */
function updateHeader(pageScript) {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  let showBackButton = false;
  let backButtonTarget = "../pages/posts/posts.js"; // 기본 뒤로가기 대상

  // 조건에 따라 뒤로가기 버튼 표시 여부 결정
  if (
    pageScript.includes("posts/post.js") || 
    pageScript.includes("makePost.js") || 
    pageScript.includes("editPost.js")
  ) {
    showBackButton = true;
  }

  // 헤더 재렌더링: 뒤로가기 버튼 여부에 따라 업데이트
  appElement.innerHTML = renderHeader(backButtonTarget, showBackButton);
  setupHeader(backButtonTarget, showBackButton);
}

/** loadPage 수정: params를 추가하여 데이터 전달 */
export function loadPage(pageScript, params = {}) {
  // 페이지 스크립트에 따라 헤더 업데이트
  updateHeader(pageScript);

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

/** 로그인 후 자동 새로고침 기능 */
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
