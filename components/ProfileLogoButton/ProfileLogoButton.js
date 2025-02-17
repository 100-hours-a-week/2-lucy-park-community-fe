export function renderProfileLogoButton() {
    loadProfileStyles();

    return `
        <div class="profile-container">
            <button id="profile-button">
                <img id="profile-img" src="" alt="프로필">
            </button>
            <div id="profile-menu" class="hidden">
                <ul>
                    <li>회원정보수정</li>
                    <li>비밀번호수정</li>
                    <li>로그아웃</li>
                </ul>
            </div>
        </div>
    `;
}

export function setupProfileButton() {
    let user = JSON.parse(localStorage.getItem("user")) || {};
    let profilePic = user.profilePic || "../../assets/default-profile.png";

    const profileImg = document.getElementById("profile-img");
    const profileButton = document.getElementById("profile-button");
    const profileMenu = document.getElementById("profile-menu");

    if (profileImg) profileImg.src = profilePic;

    profileButton.addEventListener("click", (event) => {
        event.stopPropagation(); // 클릭 이벤트 전파 방지
        profileMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
        if (!profileButton.contains(event.target) && !profileMenu.contains(event.target)) {
            profileMenu.classList.add("hidden");
        }
    });
}

function loadProfileStyles() {
    if (!document.getElementById("profile-css")) {
        const link = document.createElement("link");
        link.id = "profile-css";
        link.rel = "stylesheet";
        link.href = "../components/ProfileLogoButton/ProfileLogoButton.css"; // 경로 확인
        document.head.appendChild(link);
    }
}