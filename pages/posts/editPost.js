// pages/posts/editPost.js
import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { getPostData } from "../../scripts/utils.js"; 

let currentPost = null;
let postId = null;

/** 게시글 수정 페이지 초기화 */
export async function init(param) {
  // CSS 로드
  await loadStyles();

  if (!param?.id) {
    return `<section class="edit-post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;
  }

  postId = param.id;
  currentPost = await getPostData(postId);

  if (!currentPost) {
    return `<section class="edit-post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;
  }

  // HTML 렌더링
  const html = await render();

  // DOM 업데이트 후 이벤트 핸들러 부착
  setTimeout(() => {
    setupBackButton("../pages/posts/post.js", "edit-post-back-button");
    setupForm();
  }, 0);

  return html;
}

/** HTML 렌더링 */
export async function render() {
  return `
    <section class="edit-post-container">
      <div class="back-button">
        ${BackButton("../pages/posts/post.js", "edit-post-back-button")}
      </div>
      <h1 class="edit-post-title">게시글 수정</h1>
      
      <form id="edit-post-form">
        <!-- 제목 -->
        <label for="title">제목 <span class="required">*</span></label>
        <input type="text" id="title" maxlength="26" required />
        <p id="title-helper" class="helper-text hidden">
          * 제목은 최대 26자까지 가능합니다.
        </p>

        <!-- 내용 -->
        <label for="content">내용 <span class="required">*</span></label>
        <textarea id="content" required></textarea>

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

        <!-- 수정하기 버튼 -->
        <button type="submit" id="update-post-btn" class="update-btn">
          수정하기
        </button>
      </form>
    </section>
  `;
}

/** 폼 데이터 채우기 및 이벤트 설정 */
function setupForm() {
  const backBtn = document.getElementById("edit-post-back-button");
  backBtn?.addEventListener("click", () => {
    loadPage("../pages/posts/post.js", { id: postId });
  });

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const fileInput = document.getElementById("image-upload");
  const selectFileBtn = document.getElementById("select-file-btn");
  const currentImageDiv = document.getElementById("current-image");

  // 기존 데이터 채우기
  titleInput.value = currentPost.title || "";
  contentInput.value = currentPost.content || "";
  if (currentPost.image) {
    currentImageDiv.textContent = `기존 파일: ${currentPost.image}`;
  }

  titleInput.focus();

  // 유효성 검사 버튼
  const validationBtn = new ValidationButton("update-post-btn");
  function validateForm() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    validationBtn.updateValidationState(title !== "" && content !== "");
  }
  titleInput.addEventListener("input", validateForm);
  contentInput.addEventListener("input", validateForm);

  // 파일 선택
  selectFileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    if (file) {
      currentImageDiv.textContent = `선택된 파일: ${file.name}`;
    }
  });

  // 제출 처리
  document.getElementById("edit-post-form")?.addEventListener("submit", handleUpdatePost);
}

/** 게시글 수정 처리 */
function handleUpdatePost(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const file = document.getElementById("image-upload").files[0];

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요!");
    return;
  }

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const idx = posts.findIndex((p) => String(p.id) === String(currentPost.id));

  if (idx !== -1) {
    posts[idx].title = title;
    posts[idx].content = content;
    if (file) {
      posts[idx].image = file.name;
    }
    localStorage.setItem("posts", JSON.stringify(posts));
  }

  alert("게시글이 수정되었습니다.");
  loadPage(`../pages/posts/detail.js?id=${currentPost.id}`);
}

/** CSS 로드 */
async function loadStyles() {
  if (!document.getElementById("edit-post-css")) {
    const link = document.createElement("link");
    link.id = "edit-post-css";
    link.rel = "stylesheet";
    // 프로젝트 구조에 맞게 수정 (예: "../styles/posts/editPost.css")
    link.href = "../styles/posts/editPost.css";
    document.head.appendChild(link);
  }
}
