import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { createValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { uploadImage } from "../../scripts/utils.js"; 
import { API_BASE_URL } from "../../config.js";

let postId = null;
let currentPost = null;
// 초기 제목/내용 값 저장 (업데이트 전 비교용)
let initialTitle = "";
let initialContent = "";

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
        <textarea id="content" style="height:200px; width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">${currentPost.content || ''}</textarea>

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
  // 뒤로가기 버튼 설정
  const backBtn = document.getElementById("edit-post-back-button");
  backBtn?.addEventListener("click", () => {
    loadPage(`../pages/posts/post.js?id=${postId}`);
  });
  console.log("Back button event listener 등록됨");

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const fileInput = document.getElementById("image-upload");
  const selectFileBtn = document.getElementById("select-file-btn");
  const currentImageDiv = document.getElementById("current-image");

  // 렌더링 후 명시적으로 textarea 값 설정
  contentInput.value = currentPost.content || '';

  // 수정 버튼에 대한 유효성 검사 버튼 생성
  const validationBtn = createValidationButton("update-post-btn");

  function validateForm() {
    // 현재 입력된 제목/내용을 바로 읽어옴
    const currentTitle = titleInput.value;
    const currentContent = contentInput.value;
    // 제목과 내용이 둘 다 비어있으면 유효하지 않음
    const isValid = !(currentTitle === "" && currentContent === "");
    if (validationBtn?.updateValidationState) {
      validationBtn.updateValidationState(isValid);
    }
  }

  titleInput.addEventListener("input", () => {
    console.log("현재 제목:", titleInput.value);
    validateForm();
  });
  console.log("Title input 이벤트 리스너 등록됨");

  // textarea 내용 업데이트 및 콘솔 출력
  const updateContent = () => {
    console.log("현재 내용:", contentInput.value);
    validateForm();
  };

  contentInput.addEventListener("input", updateContent);
  contentInput.addEventListener("change", updateContent);
  contentInput.addEventListener("keyup", updateContent);
  contentInput.addEventListener("blur", updateContent);
  console.log("Content textarea 관련 이벤트 리스너 등록됨");

  selectFileBtn.addEventListener("click", () => fileInput.click());
  console.log("파일 선택 버튼 클릭 이벤트 리스너 등록됨");

  fileInput.addEventListener("change", (evt) => {
    const file = evt.target.files[0];
    if (file) {
      currentImageDiv.innerHTML = `선택된 파일: ${file.name}`;
    }
  });
  console.log("파일 입력 change 이벤트 리스너 등록됨");

  document.getElementById("edit-post-form")?.addEventListener("submit", handleUpdatePost);
  console.log("폼 제출 이벤트 리스너 등록됨");
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

/** 게시글 수정 처리 */
async function handleUpdatePost(event) {
  event.preventDefault();

  // 폼 제출 시, 최신 값을 DOM에서 직접 읽어옴
  const titleValue = document.getElementById("title").value;
  const contentValue = document.getElementById("content").value;

  console.log("최종 제목:", titleValue);
  console.log("최종 내용:", contentValue);
  
  if (titleValue === "" && contentValue === "") {
    alert("제목과 내용을 입력해주세요!");
    return;
  }

  const file = document.getElementById("image-upload").files[0];
  let imageUrl = currentPost.imageUrl;
  if (file) {
    imageUrl = await uploadImage(file);
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
  }
  
  if (Object.keys(updateData).length === 0) {
    alert("변경된 내용이 없습니다.");
    return;
  }
  
  console.log("업데이트 데이터:", updateData);

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
      location.reload();
    } else {
      alert("게시글 수정에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 게시글 수정 오류:", error);
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
