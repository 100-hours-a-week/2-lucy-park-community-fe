import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";

let postId = null;
let currentPost = null;

/** 게시글 수정 페이지 초기화 */
export async function init(param) {
  await loadStyles();

  if (!param?.id) {
    return `<section class="edit-post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;
  }

  postId = param.id;
  currentPost = await getPostData(postId);

  if (!currentPost) {
    return `<section class="edit-post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;
  }

  const html = await render();
  setTimeout(() => {
    setupBackButton(`../pages/posts/post.js?id=${postId}`, "edit-post-back-button");
    setupForm();
  }, 0);

  return html;
}

/** HTML 렌더링 */
export async function render() {
  return `
    <section class="edit-post-container">
      <div class="back-button">
        ${BackButton(`../pages/posts/post.js?id=${postId}`, "edit-post-back-button")}
      </div>
      <h1 class="edit-post-title">게시글 수정</h1>
      
      <form id="edit-post-form">
        <label for="title">제목</label>
        <input type="text" id="title" maxlength="26" value="${currentPost.title || ''}" />

        <label for="content">내용</label>
        <textarea id="content">${currentPost.content || ''}</textarea>

        <div class="image-upload-section">
          <label>이미지</label>
          <div id="current-image">${currentPost.imageUrl ? `기존 이미지: <a href="${currentPost.imageUrl}" target="_blank">보기</a>` : "파일 없음"}</div>
          <input type="file" id="image-upload" accept="image/*" hidden />
          <button type="button" id="select-file-btn">파일 선택</button>
        </div>

        <button type="submit" id="update-post-btn" class="update-btn">수정하기</button>
      </form>
    </section>
  `;
}

/** 폼 데이터 설정 및 이벤트 등록 */
function setupForm() {
  const backBtn = document.getElementById("edit-post-back-button");
  backBtn?.addEventListener("click", () => {
    loadPage(`../pages/posts/post.js?id=${postId}`);
  });

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const fileInput = document.getElementById("image-upload");
  const selectFileBtn = document.getElementById("select-file-btn");
  const currentImageDiv = document.getElementById("current-image");
  const submitBtn = document.getElementById("update-post-btn");

  const validationBtn = new ValidationButton("update-post-btn");
  
  function validateForm() {
    validationBtn.updateValidationState(titleInput.value.trim() !== "" && contentInput.value.trim() !== "");
  }

  titleInput.addEventListener("input", validateForm);
  contentInput.addEventListener("input", validateForm);

  selectFileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    if (file) {
      currentImageDiv.innerHTML = `선택된 파일: ${file.name}`;
    }
  });

  document.getElementById("edit-post-form")?.addEventListener("submit", handleUpdatePost);
}

/** 게시글 데이터 불러오기 */
async function getPostData(postId) {
  try {
    const response = await fetch(`https://example.com/api/posts/${postId}`);
    if (response.status === 200) {
      const { data } = await response.json();
      return data;
    } else {
      console.error("⛔ 게시글 불러오기 실패:", response.status);
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
  }
  return null;
}

/** 게시글 수정 처리 */
async function handleUpdatePost(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const file = document.getElementById("image-upload").files[0];

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요!");
    return;
  }

  let imageUrl = currentPost.imageUrl;
  if (file) {
    imageUrl = await uploadImage(file);
    if (!imageUrl) {
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }
  }

  await updatePost(postId, title, content, imageUrl);
}

/** 이미지 업로드 (서버에 업로드 후 URL 반환) */
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

/** 게시글 수정 (서버에 데이터 전송) */
async function updatePost(postId, title, content, imageUrl) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("로그인이 필요합니다.");
    loadPage("../pages/auth/login.js");
    return;
  }

  try {
    const response = await fetch(`https://example.com/api/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ title, content, imageUrl })
    });

    if (response.status === 200) {
      console.log("✅ 게시글 수정 성공");
      alert("게시글이 수정되었습니다.");
      loadPage(`../pages/posts/post.js?id=${postId}`);
    } else if (response.status === 403) {
      console.error("⛔ 권한 없음");
      alert("게시글 수정 권한이 없습니다.");
    } else {
      console.error("⛔ 서버 오류 발생");
      alert("게시글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("⛔ 네트워크 오류:", error);
    alert("네트워크 오류가 발생했습니다.");
  }
}

/** CSS 로드 */
async function loadStyles() {
  if (!document.getElementById("edit-post-css")) {
    const link = document.createElement("link");
    link.id = "edit-post-css";
    link.rel = "stylesheet";
    link.href = "../styles/posts/editPost.css";
    document.head.appendChild(link);
  }
}
