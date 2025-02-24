import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { formatCount, formatDate } from "../../scripts/utils.js";

let commentToDelete = null;
let editCommentId = null;

/** 현재 로그인한 사용자 정보 가져오기 */
function getUser() {
  return JSON.parse(localStorage.getItem("user")) || { name: "GuestUser", profilePic: "../../assets/default-profile.png" };
}

/** 게시글 정보 가져오기 */
async function getPost(postId) {
  try {
    const response = await fetch(`https://example.com/api/posts/${postId}`);
    if (response.status === 200) {
      const { data } = await response.json();
      return data;
    } else if (response.status === 404) {
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
    const response = await fetch(`https://example.com/api/posts/${postId}/comments`);
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
        <span class="author">${post.author}</span>
        <span class="date">${formatDate(post.date)}</span>
      </div>

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

/** 댓글 목록 렌더링 */
function renderComments(comments) {
  return `
    <div class="comments-container">
      <textarea class="comment-input" placeholder="댓글을 입력하세요"></textarea>
      <button id="comment-submit-btn" class="comment-submit-btn">등록</button>
      ${comments
        .map(
          (comment) => `
        <div class="comment-item" data-id="${comment.commentId}">
          <div class="comment-meta">
            <span class="comment-author">${comment.author}</span>
            <span class="comment-date">${formatDate(comment.date)}</span>
          </div>
          <p class="comment-content">${comment.content}</p>
          <button class="edit-comment-btn" data-id="${comment.commentId}">수정</button>
          <button class="delete-comment-btn" data-id="${comment.commentId}">삭제</button>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

/** 페이지 이벤트 설정 */
function setupPage(postId) {
  document.getElementById("delete-post-btn")?.addEventListener("click", () => {
    document.getElementById("post-delete-popup").classList.remove("hidden");
  });

  setupConfirmPopup("post-delete-popup", () => deletePost(postId));
  setupConfirmPopup("comment-delete-popup", () => deleteComment());

  document.getElementById("comment-submit-btn")?.addEventListener("click", () => {
    if (editCommentId) {
      updateComment(editCommentId, postId);
    } else {
      addComment(postId);
    }
  });

  document.querySelectorAll(".edit-comment-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      editCommentId = btn.dataset.id;
      document.querySelector(".comment-input").value = btn.closest(".comment-item").querySelector(".comment-content").textContent;
    })
  );

  document.querySelectorAll(".delete-comment-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      commentToDelete = btn.dataset.id;
      document.getElementById("comment-delete-popup").classList.remove("hidden");
    })
  );
}

/** 게시글 삭제 요청 */
async function deletePost(postId) {
  const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await fetch(`https://example.com/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 204) {
      alert("게시글이 삭제되었습니다.");
      loadPage("../pages/posts/posts.js");
    } else {
      alert("게시글 삭제에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 게시글 삭제 오류:", error);
  }
}

/** 댓글 추가 요청 */
async function addComment(postId) {
  const accessToken = localStorage.getItem("accessToken");
  const content = document.querySelector(".comment-input").value.trim();
  if (!content) return alert("댓글을 입력해주세요!");

  try {
    const response = await fetch(`https://example.com/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ content }),
    });

    if (response.status === 201) {
      alert("댓글이 등록되었습니다.");
      loadPage(`../pages/posts/post.js?id=${postId}`);
    }
  } catch (error) {
    console.error("⛔ 댓글 등록 오류:", error);
  }
}

/** 댓글 수정 요청 */
async function updateComment(commentId, postId) {
  const accessToken = localStorage.getItem("accessToken");
  const content = document.querySelector(".comment-input").value.trim();
  if (!content) return alert("댓글을 입력해주세요!");

  try {
    const response = await fetch(`https://example.com/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ content }),
    });

    if (response.status === 200) {
      alert("댓글이 수정되었습니다.");
      loadPage(`../pages/posts/post.js?id=${postId}`);
    }
  } catch (error) {
    console.error("⛔ 댓글 수정 오류:", error);
  }
}

/** 댓글 삭제 요청 */
async function deleteComment() {
  const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await fetch(`https://example.com/api/comments/${commentToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 204) {
      alert("댓글이 삭제되었습니다.");
      location.reload();
    }
  } catch (error) {
    console.error("⛔ 댓글 삭제 오류:", error);
  }
}
