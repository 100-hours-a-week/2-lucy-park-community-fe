// pages/posts/makePost.js
import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";

/** 게시글 작성 페이지 초기화 */
export async function init() {
  // CSS 로드
  await loadStyles();

  // HTML 렌더링
  const html = await render();

  // DOM에 HTML 삽입 후 이벤트 등록 (setTimeout 없이도 가능)
  // 아래와 같은 식으로도 가능:
  // document.getElementById("content").innerHTML = html;
  // setupBackButton(...);
  // setupForm();

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
        <!-- 제목 입력 -->
        <label for="title">제목 <span class="required">*</span></label>
        <input 
          type="text" 
          id="title" 
          maxlength="26" 
          placeholder="제목을 입력해주세요. (최대 26자)" 
          required 
        />
        <p id="title-helper" class="helper-text hidden">
          * 제목은 최대 26자까지 가능합니다.
        </p>

        <!-- 내용 입력 -->
        <label for="content">내용 <span class="required">*</span></label>
        <textarea 
          id="content" 
          placeholder="내용을 입력하세요." 
          required
        ></textarea>

        <!-- 이미지 업로드 -->
        <div class="image-upload-section">
          <label>이미지</label>
          <div id="current-image">파일 없음</div>
          <input type="file" id="image-upload" accept="image/*" hidden />
          <button type="button" id="select-file-btn">파일 선택</button>
          <p id="image-helper" class="helper-text hidden">
            * 이미지 파일은 1개만 업로드 가능합니다.
          </p>
        </div>

        <!-- 등록 버튼 -->
        <button type="submit" id="submit-post-btn" class="submit-btn">
          등록
        </button>
      </form>
    </section>
  `;
}

/** 폼 데이터 설정 및 이벤트 등록 */
function setupForm() {
  // 뒤로가기 버튼
  document.getElementById("make-post-back-button")?.addEventListener("click", () => {
    loadPage("../pages/posts/posts.js");
  });

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const fileInput = document.getElementById("image-upload");
  const selectFileBtn = document.getElementById("select-file-btn");
  const currentImageDiv = document.getElementById("current-image");
  const submitBtn = document.getElementById("submit-post-btn");

  // 유효성 검사 버튼 생성
  const validationBtn = new ValidationButton("submit-post-btn");

  // 폼 유효성 검사
  function validateForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const isValid = title !== "" && content !== "";
    // 버튼 색상 변경 (옵션)
    submitBtn.style.backgroundColor = isValid ? "#7F6AEE" : "#ACA0EB";
    // ValidationButton 처리
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

/** 게시글 등록 처리 */
function handleSubmitPost(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const file = document.getElementById("image-upload").files[0];

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요!");
    return;
  }

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const newPost = {
    id: Date.now(),
    title,
    content,
    image: file ? file.name : null
  };

  posts.push(newPost);
  localStorage.setItem("posts", JSON.stringify(posts));
  alert("게시글이 등록되었습니다.");
  loadPage("../pages/posts/posts.js");
}

/** CSS 로드 */
async function loadStyles() {
  if (!document.getElementById("make-post-css")) {
    const link = document.createElement("link");
    link.id = "make-post-css";
    link.rel = "stylesheet";
    // 경로를 프로젝트 구조에 맞게 조정: 아래는 예시
    link.href = "../styles/posts/makePost.css";
    document.head.appendChild(link);
  }
}
