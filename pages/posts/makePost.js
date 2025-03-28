import { loadPage } from "../../scripts/app.js";
import { createValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { uploadImage } from "../../scripts/utils.js"; 
import { API_BASE_URL } from "../../config.js";

/** 게시글 입력 상태 저장 */
let postData = {
  title: "",
  content: ""
};

let validationBtn; 

/** 게시글 작성 페이지 초기화 */
export async function init() {
  await loadStyles();
  const html = await render();
  // DOM에 HTML이 반영된 후 setupForm 실행
  setTimeout(setupForm, 0);
  return html;
}

/** HTML 렌더링 - 공통 레이아웃(헤더 등)은 유지하고 #content 영역만 업데이트 */
export async function render() {
  return `
      <section class="make-post-container">
        <h1 class="make-post-title">게시글 작성</h1>
        <form id="make-post-form">
          <label for="post-title">제목 <span class="required">*</span></label>
          <input type="text" id="post-title" maxlength="26" placeholder="제목을 입력해주세요. (최대 26자)" required />
          <p id="title-helper" class="helper-text hidden">* 제목은 최대 26자까지 가능합니다.</p>

          <label for="post-content">내용 <span class="required">*</span></label>
          <textarea id="post-content" placeholder="내용을 입력하세요." required></textarea>

          <div class="image-upload-section">
            <label>이미지</label>
            <div id="current-image">파일 없음</div>
            <input type="file" id="make-image-upload" accept="image/*" hidden />
            <button type="button" id="make-select-file-btn">파일 선택</button>
          </div>

          <button type="submit" id="submit-post-btn" class="make-submit-btn">등록</button>
        </form>
      </section>
    `;
}

/** 폼 데이터 설정 및 이벤트 등록 */
function setupForm() {
  const form = document.getElementById("make-post-form");
  if (!form) {
    console.error("🚨 make-post-form 요소가 존재하지 않습니다.");
    return;
  }

  const titleInput = document.getElementById("post-title");
  const contentInput = document.getElementById("post-content");

  // 유효성 검사 버튼 생성
  validationBtn = createValidationButton("submit-post-btn");

  function validateForm() {
    postData.title = titleInput.value.trim();
    postData.content = contentInput.value.trim();
    const isValid = postData.title !== "" && postData.content !== "";
    
    if (validationBtn?.updateValidationState) {
      validationBtn.updateValidationState(isValid);
    }
  }

  titleInput.addEventListener("input", validateForm);
  contentInput.addEventListener("input", validateForm);

  setupImageUpload();
  
  // 폼 제출 이벤트 등록 (기존 validationBtn 대신 form에 직접 등록)
  form.addEventListener("submit", handleSubmitPost);
}


/** 이미지 업로드 처리 */
function setupImageUpload() {
  const fileInput = document.getElementById("make-image-upload");
  const selectFileBtn = document.getElementById("make-select-file-btn");
  const currentImageDiv = document.getElementById("current-image");

  selectFileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    currentImageDiv.textContent = file ? `선택된 파일: ${file.name}` : "파일 없음";
  });
}

/** 게시글 등록 처리 */
async function handleSubmitPost(event) {
  event.preventDefault();

  const file = document.getElementById("make-image-upload").files[0];

  if (!postData.title || !postData.content) {
    alert("제목과 내용을 입력해주세요!");
    return;
  }

  let imageUrl = null;
  if (file) {
    const data = await uploadImage(file);
    imageUrl = data.imageUrl;
    if (!imageUrl) {
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }
  }

  await createPost(postData.title, postData.content, imageUrl);

  // 게시글 등록 후 입력 필드 초기화
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  document.getElementById("current-image").textContent = "파일 없음";
  postData = { title: "", content: "" };
}

/** 게시글 등록 요청 */
async function createPost(title, content, imageUrl) {
  console.log("post 요청 들어옴")
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }
  console.log(JSON.stringify({ title, content, imageUrl })); ///

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title, content, imageUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      const postId = data.data.id;  
      alert("✅ 게시글이 등록되었습니다.");
      loadPage("../pages/posts/posts.js");
    } else {
      const errorData = await response.json();
      alert(errorData.error || "게시글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
  }
}

/** CSS 로드 */
async function loadStyles() {
  if (!document.getElementById("make-post-css")) {
    const link = document.createElement("link");
    link.id = "make-post-css";
    link.rel = "stylesheet";
    link.href = "../styles/posts/makePost.css";
    document.head.appendChild(link);
  }
}
