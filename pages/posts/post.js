import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";
import { createValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { formatDate } from "../../scripts/utils.js";
import { API_BASE_URL } from "../../config.js";

let commentToDelete = null;
let editCommentId = null;

/** 현재 로그인한 사용자 정보 가져오기 */
function getUser() {
  return localStorage.getItem("id");
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

/** 댓글 목록 가져오기 */
async function getComments(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
    if (response.status === 200) {
      const { data } = await response.json();
      return data;
    }
  } catch (error) {
    console.error("⛔ 댓글 불러오기 실패:", error);
  }
  return [];
}

/** 게시글 페이지 초기화 */
export async function init(params) {
  await loadStyles();
  const postId = params.id;
  if (!postId) return `<section class="post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;

  const post = await getPost(postId);
  const comments = await getComments(postId);

  setTimeout(() => {
    setupBackButton("../pages/posts/posts.js", "post-back-btn");
    setupCommentValidation(postId);
  }, 0);

  return render(post, comments);
}

/** 메인 렌더 함수 */
export function render(post, comments) {
  if (!post) return `<section class="post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;

  const commentsHTML = renderComments(comments);

  setTimeout(() => setupPage(post.id), 0);

  return `
    <section class="post-container">
      <div class="back-button">
        ${BackButton("../pages/posts/posts.js", "post-back-btn")}
      </div>

      <h1 class="post-title">${post.title}</h1>
      <div class="post-meta">
        <span class="author">${post.user?.nickname || "알 수 없음"}</span>
        <span class="date">${formatDate(post.createdAt)}</span>
      </div>

      ${post.imageUrl ? `<img src="${post.imageUrl}" alt="게시글 이미지" class="post-image">` : ""}
      <p class="post-content">${post.content}</p>
      <div class="post-actions">
        <button id="delete-post-btn" class="delete-btn">삭제</button>
      </div>

      ${commentsHTML}

      ${ConfirmPopup("post-delete-popup", "게시글을 삭제하시겠습니까?", "삭제된 게시글은 복구할 수 없습니다.", "확인")}
      ${ConfirmPopup("comment-delete-popup", "댓글을 삭제하시겠습니까?", "삭제된 댓글은 복구할 수 없습니다.", "확인")}
    </section>
  `;
}

/** 댓글 목록 렌더링 (본인만 수정/삭제 가능) */
function renderComments(comments = []) {
  const user = getUser(); // 현재 로그인한 사용자 정보

  return `
    <div class="comments-container">
      <textarea class="comment-input" placeholder="댓글을 입력하세요"></textarea>
      <button id="comment-submit-btn" class="validation-button" disabled>등록</button>
      ${
        comments.length > 0
          ? comments
              .map(
                (comment) => `
        <div class="comment-item" data-id="${comment.id}">
          <div class="comment-meta">
            <span class="comment-author">${comment.user?.nickname || "알 수 없음"}</span>
            <span class="comment-date">${formatDate(comment.createdAt)}</span>
          </div>
          <p class="comment-content">${comment.content}</p>
          ${
            user.id === comment.user.id
              ? `
            <button class="edit-comment-btn" data-id="${comment.id}">수정</button>
            <button class="delete-comment-btn" data-id="${comment.id}">삭제</button>
          `
              : ""
          }
        </div>
      `
              )
              .join("")
          : "<p class='no-comments'>아직 댓글이 없습니다.</p>"
      }
    </div>
  `;
}

/** 페이지 이벤트 설정 */
function setupPage(postId) {
  document.getElementById("delete-post-btn")?.addEventListener("click", () => {
    document.getElementById("post-delete-popup").classList.remove("hidden");
  });

  setupConfirmPopup("post-delete-popup", () => deletePost(postId));
  setupConfirmPopup("comment-delete-popup", () => deleteComment(postId));

  document.getElementById("comment-submit-btn")?.addEventListener("click", () => {
    if (editCommentId) {
      updateComment(editCommentId, postId);
    } else {
      addComment(postId);
    }
  });
}

/** 댓글 등록 요청 */
async function addComment(postId) {
  const accessToken = localStorage.getItem("accessToken");
  const commentInput = document.querySelector(".comment-input");
  const content = commentInput.value.trim();

  if (!content) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      alert("댓글이 등록되었습니다.");
      location.reload();
    } else {
      alert("댓글 등록에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 댓글 등록 오류:", error);
  }
}

/** 댓글 입력 유효성 검사 설정 */
function setupCommentValidation(postId) {
  const commentInput = document.querySelector(".comment-input");
  const submitButton = document.getElementById("comment-submit-btn");

  commentInput.addEventListener("input", () => {
    submitButton.disabled = commentInput.value.trim() === "";
  });
}

/** CSS 로드 */
async function loadStyles() {
  // 이미 로드된 CSS를 중복 추가하지 않음
  if (!document.getElementById("post-css")) {
    const link = document.createElement("link");
    link.id = "post-css";
    link.rel = "stylesheet";
    link.href = "../styles/posts/post.css";
    document.head.appendChild(link);
  }

  if (!document.getElementById("validation-css")) {
    const link = document.createElement("link");
    link.id = "validation-css";
    link.rel = "stylesheet";
    link.href = "../../components/ValidationButton/ValidationButton.css";
    document.head.appendChild(link);
  }

  if (!document.getElementById("confirm-popup-css")) {
    const link = document.createElement("link");
    link.id = "confirm-popup-css";
    link.rel = "stylesheet";
    link.href = "../../components/ConfirmPopup/confirmPopup.css";
    document.head.appendChild(link);
  }
}

