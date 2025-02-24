import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { loadPage } from "../../scripts/app.js";

// 이미지 업로드 함수
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("imageFile", file);
    formData.append("type", "profile");

    try {
        const response = await fetch("https://example.com/api/upload", {
            method: "POST",
            body: formData
        });

        if (response.status === 201) {
            const data = await response.json();
            console.log("✅ 이미지 업로드 성공:", data.imageUrl);
            return data.imageUrl;
        } else if (response.status === 400) {
            console.error("⛔ 필수 항목 누락:", await response.json());
        } else if (response.status === 413) {
            console.error("⛔ 이미지 용량 초과");
        } else if (response.status === 500) {
            console.error("⛔ 서버 오류 발생");
        }
    } catch (error) {
        console.error("⛔ 네트워크 오류:", error);
    }
    return null;
}

// 회원가입 요청 함수
async function registerUser(email, password, nickname, imageUrl = null) {
    const requestBody = { email, password, nickname };
    if (imageUrl) requestBody.imageUrl = imageUrl;

    try {
        const response = await fetch("https://example.com/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify(requestBody)
        });

        if (response.status === 201) {
            const data = await response.json();
            console.log("✅ 회원가입 성공:", data);
            alert("회원가입 성공!");
            loadPage("../pages/auth/login.js");
        } else if (response.status === 400) {
            const errorData = await response.json();
            console.error("⛔ 필수 항목 누락:", errorData.error);
            alert(errorData.error);
        } else if (response.status === 500) {
            console.error("⛔ 서버 오류 발생");
            alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
        }
    } catch (error) {
        console.error("⛔ 네트워크 오류:", error);
        alert("네트워크 오류가 발생했습니다.");
    }
}

export function render() {
    return `
    <section class="signup-container">
      <div class="back-button">
        ${BackButton("../pages/auth/login.js")}
      </div>
      <h2>회원가입</h2>
      <form id="signup-form">
        <div class="profile-section">
          <label for="profile-pic">프로필 사진</label>
          <div id="profile-pic-preview" class="profile-pic-preview">
            <span>+</span>
          </div>
          <input type="file" id="profile-pic" accept="image/*" hidden />
        </div>

        <div class="input-group">
          <label for="email">이메일</label>
          <input type="email" id="email" placeholder="이메일을 입력하세요" required />
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" placeholder="비밀번호를 입력하세요" required />
        </div>

        <div class="input-group">
          <label for="confirm-password">비밀번호 확인</label>
          <input type="password" id="confirm-password" placeholder="비밀번호를 다시 입력하세요" required />
        </div>

        <div class="input-group">
          <label for="nickname">닉네임</label>
          <input type="text" id="nickname" placeholder="닉네임을 입력하세요" required />
        </div>

        <button type="submit" id="signup-btn" disabled>회원가입</button>
      </form>
      <button id="login-page-btn">로그인하러 가기</button>
    </section>
  `;
}

export function setup() {
    loadStyles();
    setupEventListeners();
    setupBackButton("../pages/auth/login.js");
}

function loadStyles() {
    if (!document.getElementById("signup-css")) {
        const link = document.createElement("link");
        link.id = "signup-css";
        link.rel = "stylesheet";
        link.href = "styles/auth/signup.css";
        document.head.appendChild(link);
    }
}

function setupEventListeners() {
    document.getElementById("login-page-btn").addEventListener("click", () => {
        loadPage("../pages/auth/login.js");
    });

    document.getElementById("signup-form").addEventListener("input", validateForm);
    document.getElementById("signup-form").addEventListener("submit", handleSignup);

    const profilePicInput = document.getElementById("profile-pic");
    const profilePicPreview = document.getElementById("profile-pic-preview");

    profilePicPreview.addEventListener("click", () => {
        profilePicInput.click();
    });

    profilePicInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicPreview.style.backgroundImage = `url('${e.target.result}')`;
                profilePicPreview.innerHTML = "";
            };
            reader.readAsDataURL(file);
        }
    });
}

function validateForm() {
    const emailValid = document.getElementById("email").value.trim().length > 0;
    const passwordValid = document.getElementById("password").value.trim().length >= 8;
    const confirmPasswordValid = document.getElementById("password").value.trim() === document.getElementById("confirm-password").value.trim();
    const nicknameValid = document.getElementById("nickname").value.trim().length >= 2;

    document.getElementById("signup-btn").disabled = !(emailValid && passwordValid && confirmPasswordValid && nicknameValid);
}

async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    const profilePicInput = document.getElementById("profile-pic").files[0];

    if (!email || !password || !nickname) {
        alert("모든 필수 정보를 입력해주세요.");
        return;
    }

    let imageUrl = null;

    if (profilePicInput) {
        imageUrl = await uploadImage(profilePicInput);
        if (!imageUrl) {
            alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
            return;
        }
    }

    await registerUser(email, password, nickname, imageUrl);
}
