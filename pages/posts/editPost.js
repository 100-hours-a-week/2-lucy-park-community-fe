import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { createValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { uploadImage } from "../../scripts/utils.js"; 
import { API_BASE_URL } from "../../config.js";

let postId = null;
let currentPost = null;

let initialTitle = "";
let initialContent = "";

/** 게시글 입력 상태 저장 */
let postData = {
  title: "",
  content: ""
};

let validationBtn; 

/** 게시글 수정 페이지 초기화 */
export async function init(params) {
  await loadStyles();

  // 전달받은 postId 저장
  postId = params.id;
  if (!postId) {
    return `<section class="edit-post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;
  }

  // 게시글 데이터 불러오기
  currentPost = await getPost(postId);
  if (!currentPost) {
    return `<section class="edit-post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;
  }

  // 초기 입력값을 별도의 변수에 설정 (비교용)
  initialTitle = currentPost.title;
  initialContent = currentPost.content;

  const html = await render();
  setTimeout(() => {
    setupForm();  // render 후 setupForm 호출
  }, 0);

  return html;
}

/** HTML 렌더링 */
export async function render() {
  return `
    <section class="edit-post-container">
      <h1 class="edit-post-title">게시글 수정</h1>
      
      <form id="edit-post-form">
        <label for="title">제목</label>
        <input type="text" id="title" maxlength="26" value="${currentPost.title || ''}" />

        <label for="post-content">내용</label>
        <textarea id="post-content" >${currentPost.content || ''}</textarea>

        <div class="image-upload-section">
          <label>이미지</label>
          <div id="current-image">${
            currentPost.imageUrl 
              ? `기존 이미지: <a href="${currentPost.imageUrl}" target="_blank">보기</a>` 
              : "파일 없음"
          }</div>
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
  const form = document.getElementById("edit-post-form");
  if (!form) {
    console.error("🚨 edit-post-form 요소가 존재하지 않습니다.");
    return;
  }

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("post-content");

  // 유효성 검사 버튼 생성
  validationBtn = createValidationButton("submit-post-btn");

  function validateForm() {
    postData.title = titleInput?.value.trim();
    postData.content = contentInput?.value.trim();

    const isValid = postData.title !== "" && postData.content !== "";

    if (validationBtn?.updateValidationState) {
      validationBtn.updateValidationState(isValid);
    }
  }

  titleInput.addEventListener("input", validateForm);
  contentInput.addEventListener("input", validateForm);

  setupImageUpload();
  form.addEventListener("submit", handleUpdatePost);
}

/** 이미지 업로드 처리 */
function setupImageUpload() {
  const fileInput = document.getElementById("image-upload");
  const selectFileBtn = document.getElementById("select-file-btn");
  const currentImageDiv = document.getElementById("current-image");

  selectFileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    currentImageDiv.textContent = file ? `선택된 파일: ${file.name}` : "파일 없음";
  });
}

/** 게시글 수정 처리 */
async function handleUpdatePost(event) {
  event.preventDefault();

  const titleValue = document.getElementById("title").value;
  const contentValue = document.getElementById("post-content").value;

  if (titleValue === "" && contentValue === "") {
    alert("제목과 내용을 입력해주세요!");
    return;
  }

  const file = document.getElementById("image-upload").files[0];
  let imageUrl = currentPost.imageUrl;
  if (file) {
    const data = await uploadImage(file);
    imageUrl = data.imageUrl;
    if (!imageUrl) {
      alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }
  }

  await updatePost(postId, titleValue, contentValue, imageUrl);
}

/** 게시글 수정 요청 */
async function updatePost(postId, title, content, imageUrl) {
  const accessToken = localStorage.getItem("accessToken");
  
  // 수정된 필드만 업데이트 데이터 객체에 추가 (초기값과 비교)
  const updateData = {};
  if (title !== initialTitle) {
    updateData.title = title;
  }
  if (content !== initialContent) {
    updateData.content = content;
  }
  if (imageUrl !== currentPost.imageUrl) {
    updateData.imageUrl = imageUrl;
  } else {
    updateData.imageUrl = currentPost.imageUrl;
  }

  console.log(updateData.imageUrl);
  
  // 수정된 내용이 없으면 처리하지 않음
  if (Object.keys(updateData).length === 0) {
    alert("변경된 내용이 없습니다.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
    });

    if (response.ok) {
      alert("게시글이 수정되었습니다.");
      loadPage("../pages/posts/post.js", { id: postId });
    } else {
      const errorData = await response.json();
      alert(errorData.error || "게시글 수정에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 게시글 수정 오류:", error);
    alert("게시글 수정에 실패했습니다.");
  }
}

/** 게시글 정보 가져오기 */
async function getPost(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (response.status === 200) {
      const { data } = await response.json();
      return data;
    } else {
      alert("게시글을 찾을 수 없습니다.");
      loadPage("../pages/posts/posts.js");
    }
  } catch (error) {
    console.error("⛔ 게시글 불러오기 실패:", error);
  }
  return null;
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
