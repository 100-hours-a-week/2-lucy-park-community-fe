import { loadPage } from "../../scripts/app.js";
import { uploadImage } from "../../scripts/utils.js"; 
import { API_BASE_URL } from "../../config.js";

// 회원가입 요청 함수
async function registerUser(email, password, nickname, imageUrl = null) {
    const requestBody = { email, password, nickname };
    if (imageUrl) requestBody.imageUrl = imageUrl;

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            body: JSON.stringify(requestBody)
        });

        if (response.status === 201) {
            console.log("✅ 회원가입 성공");
            alert("회원가입 성공!");
            loadPage("../pages/auth/login.js");
        } else {
            const errorData = await response.json();
            console.error("⛔ 회원가입 실패:", errorData.error);
            alert(errorData.error);
        }
    } catch (error) {
        console.error("⛔ 네트워크 오류:", error);
        alert("네트워크 오류가 발생했습니다.");
    }
}

export function render() {
    return `
    <section class="signup-container">
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
          <p id="email-helper" class="helper-text hidden">* 올바른 이메일 주소를 입력하세요.</p>
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" placeholder="비밀번호를 입력하세요" required />
          <p id="password-helper" class="helper-text hidden">* 비밀번호는 8~20자, 대소문자, 숫자, 특수문자를 포함해야 합니다.</p>
        </div>

        <div class="input-group">
          <label for="confirm-password">비밀번호 확인</label>
          <input type="password" id="confirm-password" placeholder="비밀번호를 다시 입력하세요" required />
          <p id="confirm-password-helper" class="helper-text hidden">* 비밀번호가 일치하지 않습니다.</p>
        </div>

        <div class="input-group">
          <label for="nickname">닉네임</label>
          <input type="text" id="nickname" placeholder="닉네임을 입력하세요" required />
          <p id="nickname-helper" class="helper-text hidden">* 닉네임은 2~10자 이내여야 합니다.</p>
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

// 유효성 검사
function validateForm() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const nickname = document.getElementById("nickname").value.trim();

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password);
    const confirmPasswordValid = password === confirmPassword;
    const nicknameValid = nickname.length >= 2 && nickname.length <= 10;

    document.getElementById("email-helper").classList.toggle("hidden", emailValid);
    document.getElementById("password-helper").classList.toggle("hidden", passwordValid);
    document.getElementById("confirm-password-helper").classList.toggle("hidden", confirmPasswordValid);
    document.getElementById("nickname-helper").classList.toggle("hidden", nicknameValid);

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
        const uploadResponse = await uploadImage(profilePicInput);
        console.log(uploadResponse);
    
        if (!uploadResponse || uploadResponse.message !== "upload_success") {
            alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
            return;
        }
    
        imageUrl = uploadResponse.imageUrl;

        await registerUser(email, password, nickname, imageUrl);  
    }    
}
