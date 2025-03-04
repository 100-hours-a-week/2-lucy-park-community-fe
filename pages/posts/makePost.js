import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { createValidationButton } from "../../components/ValidationButton/ValidationButton.js";

/** 게시글 작성 페이지 초기화 */
export async function init() {
  await loadStyles();
  const html = await render();

  setTimeout(() => {
    setupBackButton("../pages/posts/posts.js", "make-post-back-btn");
    setupForm();
  }, 0);

  return html;
}

/** HTML 렌더링 */
export async function render() {
  return `
    <div class="back-button">
      ${BackButton("../pages/posts/posts.js", "make-post-back-button")}
    </div>
    <section class="make-post-container">
      <h1 class="make-post-title">게시글 작성</h1>
      <form id="make-post-form">
        <label for="title">제목 <span class="required">*</span></label>
        <input type="text" id="title" maxlength="26" placeholder="제목을 입력해주세요. (최대 26자)" required />
        <p id="title-helper" class="helper-text hidden">* 제목은 최대 26자까지 가능합니다.</p>

        <label for="content">내용 <span class="required">*</span></label>
        <textarea id="content" placeholder="내용을 입력하세요." required></textarea>

        <div class="image-upload-section">
          <label>이미지</label>
          <div id="current-image">파일 없음</div>
          <input type="file" id="image-upload" accept="image/*" hidden />
          <button type="button" id="select-file-btn">파일 선택</button>
        </div>

        <button type="submit" id="submit-post-btn" class="submit-btn">등록</button>
      </form>
    </section>
  `;
}

/** 폼 데이터 설정 및 이벤트 등록 */
function setupForm() {
  document.getElementById("make-post-back-button")?.addEventListener("click", () => {
    loadPage("../pages/posts/posts.js");
  });

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const fileInput = document.getElementById("image-upload");
  const selectFileBtn = document.getElementById("select-file-btn");
  const currentImageDiv = document.getElementById("current-image");

  const validationBtn = createValidationButton("submit-post-btn");

  function validateForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const isValid = title !== "" && content !== "";
    validationBtn.updateValidationState(isValid);
  }

  titleInput.addEventListener("input", validateForm);
  contentInput.addEventListener("input", validateForm);

  selectFileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    if (file) {
      currentImageDiv.textContent = `선택된 파일: ${file.name}`;
    }
  });

  document.getElementById("make-post-form")?.addEventListener("submit", handleSubmitPost);
}

/**
 * 게시글 등록 처리 
 */
async function handleSubmitPost(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const file = document.getElementById("image-upload").files[0];

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요!");
    return;
  }

  let imageUrl = null;
  if (file) {
    imageUrl = await uploadImage(file);
    if (!imageUrl) {
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }
  }

  await createPost(title, content, imageUrl);
}

/**
 * 이미지 업로드 (서버에 업로드 후 URL 반환)
 */
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("imageFile", file);
  formData.append("type", "post");

  try {
    const response = await fetch("https://example.com/api/upload", {
      method: "POST",
      body: formData
    });

    if (response.status === 201) {
      const data = await response.json();
      console.log("✅ 이미지 업로드 성공:", data.imageUrl);
      return data.imageUrl;
    } else {
      console.error("⛔ 이미지 업로드 실패:", response.status);
      return null;
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    return null;
  }
}

/**
 * 게시글 등록 (서버에 데이터 전송)
 */
async function createPost(title, content, imageUrl) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }

  try {
    const response = await fetch("https://example.com/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ title, content, imageUrl })
    });

    if (response.status === 201) {
      console.log("✅ 게시글 등록 성공");
      alert("게시글이 등록되었습니다.");
      loadPage("../pages/posts/posts.js");
    } else if (response.status === 400) {
      const errorData = await response.json();
      console.error("⛔ 필수 항목 누락:", errorData.error);
      alert(errorData.error);
    } else if (response.status === 403) {
      console.error("⛔ 권한 없음");
      alert("게시글 작성 권한이 없습니다.");
    } else {
      console.error("⛔ 서버 오류 발생");
      alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
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
