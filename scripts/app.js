import * as Header from "../components/Header/Header.js";

document.addEventListener("DOMContentLoaded", () => {
    // 헤더
    document.getElementById("header-container").innerHTML = Header.render();

    // 기본 페이지 로드
    loadPage("../pages/auth/login.js"); 

    // 헤더 & 푸터 로드
    //document.getElementById("header-container").innerHTML = '<object type="text/html" data="components/Header.html"></object>';
    //document.getElementById("footer-container").innerHTML = '<object type="text/html" data="components/Footer.html"></object>';
});

// 페이지 변경 시 동적 로딩
function loadPage(pageScript) {
    import(`./${pageScript}`)
        .then((module) => {
            document.getElementById("content").innerHTML = module.render();
        })
        .catch(error => console.error("페이지 로드 오류:", error));
}

// 네비게이션 이벤트 추가
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("nav-link")) {
        event.preventDefault();
        const page = event.target.getAttribute("data-page");
        loadPage(page);
    }
});
