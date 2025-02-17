import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";

let currentPost = null;

/** 게시글 수정 페이지 초기화 */
export async function init(postId) {
  await loadStyles();
  
  if (!postId) {
    return `<section class="edit-post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;
  }

  currentPost = await getPostData(postId);
  
  setTimeout(() => {
    setupBackButton("../pages/posts/posts.js", "edit-post-back-btn");
    setupForm();
  }, 0);

  return await render();
}

/** HTML 렌더링 */
export function render() {
  return `
    <section class="edit-post-container">
      <div class="back-button">
        ${BackButton("../pages/posts/posts.js", "edit-post-back-btn")}
      </div>

      <h1 class="edit-post-title">게시글 수정</h1>
      
      <form id="edit-post-form">
        <!-- 제목 -->
        <label for="title">제목 <span class="required">*</span></label>
        <input type="text" id="title" maxlength="26" placeholder="제목을 입력하세요" required />

        <p id="title-helper" class="helper-text hidden">* 제목은 최대 26자까지 가능합니다.</p>

        <!-- 내용 -->
        <label for="content">내용 <span class="required">*</span></label>
        <textarea id="content" placeholder="내용을 입력하세요" required></textarea>

        <!-- 이미지 업로드 -->
        <div class="image-upload-section">
          <label>이미지</label>
          <div id="current-image">${currentPost?.image ? `기존 파일: ${currentPost.image}` : "파일 없음"}</div>
          <input type="file" id="image-upload" accept="image/*" hidden />
          <button type="button" id="select-file-btn">파일 선택</button>
          <p id="image-helper" class="helper-text hidden">* 이미지 파일은 1개만 업로드 가능합니다.</p>
        </div>

        <!-- 수정하기 버튼 -->
        <button type="submit" id="update-post-btn" class="update-btn" disabled>수정하기</button>
      </form>
    </section>
  `;
}

/** 폼 데이터 채우기 및 이벤트 설정 */
function setupForm() {
  if (!currentPost) return;

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const updateBtn = document.getElementById("update-post-btn");
  const fileInput = document.getElementById("image-upload");
  const selectFileBtn = document.getElementById("select-file-btn");

  // 기존 데이터 채우기
  titleInput.value = currentPost.title;
  contentInput.value = currentPost.content;

  // 유효성 검사
  const validationBtn = new ValidationButton("update-post-btn");

  titleInput.addEventListener("input", () => {
    document.getElementById("title-helper").classList.toggle("hidden", titleInput.value.length <= 26);
    validationBtn.updateValidationState(titleInput.value.trim() !== "" && contentInput.value.trim() !== "");
  });

  contentInput.addEventListener("input", () => {
    validationBtn.updateValidationState(titleInput.value.trim() !== "" && contentInput.value.trim() !== "");
  });

  // 파일 선택 버튼 클릭 시 input 클릭
  selectFileBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      document.getElementById("current-image").textContent = `선택된 파일: ${file.name}`;
    }
  });

  // 게시글 수정 이벤트
  document.getElementById("edit-post-form").addEventListener("submit", handleUpdatePost);
}

/** 게시글 수정 처리 */
function handleUpdatePost(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const fileInput = document.getElementById("image-upload");
  const file = fileInput.files[0];

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
      posts[idx].image = file.name; // 파일명 저장
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
    link.href = "styles/posts/editPost.css";
    document.head.appendChild(link);
  }
}

/** 로컬 스토리지에서 posts.json 읽기 */
async function getPostData(postId) {
  let posts = JSON.parse(localStorage.getItem("posts"));
  if (!posts) {
    const response = await fetch("../../data/posts.json");
    const data = await response.json();
    posts = data.posts;
    localStorage.setItem("posts", JSON.stringify(posts));
  }
  return posts.find((p) => String(p.id) === String(postId)) || null;
}
