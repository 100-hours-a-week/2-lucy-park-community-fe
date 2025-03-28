import { loadPage } from "../../scripts/app.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";
import { createValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { formatDate } from "../../scripts/utils.js";
import { API_BASE_URL } from "../../config.js";

// 전역 변수: 댓글 수정, 삭제, 답글용 ID
let commentToDelete = null;
let editCommentId = null;
let replyCommentId = null;

/** 현재 로그인한 사용자 ID 가져오기 */
function getUserId() {
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
      console.log(data);
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
  if (!postId)
    return `<section class="post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;

  const post = await getPost(postId);
  const comments = await getComments(postId);

  // 댓글 입력 유효성 검사 설정 (딜레이 필요시)
  setTimeout(() => {
    setupCommentValidation();
  }, 0);

  return render(post, comments);
}

/** 메인 렌더 함수 */
export function render(post, comments) {
  if (!post)
    return `<section class="post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;

  const userId = getUserId();
  const isPostAuthor = userId == post.user?.id;

  const commentsHTML = renderComments(comments);

  // 페이지 이벤트 설정 (딜레이 필요시)
  setTimeout(() => setupPage(post.id, isPostAuthor), 0);

  return `
    <section class="post-container">
      <h1 class="post-detail-title">${post.title}</h1>
      <div class="post-detail-meta">
        ${post.user?.imageUrl
          ? `<img src="${API_BASE_URL}${post.user?.imageUrl}" alt="작성자 이미지" class="post-author-image">`
          : ""}
        <span class="post-detail-author">${post.user?.nickname || "알 수 없음"}</span>
        <span class="post-detail-date">${formatDate(post.createdAt)}</span>
        <div class="post-actions">
          ${isPostAuthor ? `<button id="edit-post-btn" class="edit-btn">수정</button>` : ""}
          ${isPostAuthor ? `<button id="delete-post-btn" class="delete-btn">삭제</button>` : ""}
        </div>
      </div>

      ${post.imageUrl
        ? `<img src="${API_BASE_URL}${post.imageUrl}" alt="게시글 이미지" class="post-image">`
        : ""}
      <p class="post-content">${post.content}</p>
      <div class="post-detail">
          <div class="post-like-btn">
            <div id="post-like-btn" data-post-id="${post.id}">${post.likeCount}</div>
            <p>좋아요수</p>
          </div>
          <div>
            <div>${post.viewCount}</div>
            <p>조회수</p>
          </div>
          <div>
            <div class="comments-count">${post.comments.length}</div>
            <p>댓글</p>
          </div>
      </div>

      ${commentsHTML}

      ${ConfirmPopup("post-delete-popup", "게시글을 삭제하시겠습니까?", "삭제된 게시글은 복구할 수 없습니다.", "확인")}
      ${ConfirmPopup("comment-delete-popup", "댓글을 삭제하시겠습니까?", "삭제된 댓글은 복구할 수 없습니다.", "확인")}
    </section>
  `;
}

/** 댓글 목록 렌더링 - 재귀적으로 처리 */
function renderComments(comments = []) {
  const commentsHTML = comments.length > 0
    ? comments.map(comment => renderCommentItem(comment)).join("")
    : "<p class='no-comments'>아직 댓글이 없습니다.</p>";

  // 댓글 수 업데이트 (여기서는 최상위 댓글 수를 표시)
  setTimeout(() => {
    const commentsCountElem = document.querySelector(".post-detail .comments-count");
    if (commentsCountElem) {
      commentsCountElem.textContent = comments.length;
    }
  }, 0);

  return `
    <div class="comments-container">
      <div class="comment-input-container">
        <textarea class="comment-input" placeholder="댓글을 입력하세요"></textarea>
        <button id="comment-submit-btn" class="validation-button" disabled>등록</button>
      </div>
      <div class="comments-list">
        ${commentsHTML}
      </div>
    </div>
  `;
}

function renderCommentItem(comment, isChild = false) {
  const userId = getUserId();

  // 자식 댓글 HTML 재귀 렌더링
  const childrenHTML = comment.children && comment.children.length > 0
    ? comment.children.map(child => renderCommentItem(child, true)).join("")
    : "";

  return `
    <div class="comment-item ${isChild ? 'child-comment' : ''}" data-id="${comment.id}">
      <div class="comment-meta">
        ${comment.user?.imageUrl
          ? `<img src="${API_BASE_URL}${comment.user.imageUrl}" alt="작성자 이미지" class="comment-author-image">`
          : ""}
        <span class="comment-author">${comment.user?.nickname || "알 수 없음"}</span>
        <span class="comment-date">${formatDate(comment.createdAt)}</span>
      </div>
      <p class="comment-content">${comment.content}</p>
      <div class="comment-actions">
        ${
          userId == comment.user.id
            ? `<button class="edit-comment-btn" data-id="${comment.id}">수정</button>
               <button class="delete-comment-btn" data-id="${comment.id}">삭제</button>`
            : ""
        }
        <button class="reply-comment-btn" data-id="${comment.id}">답글</button>
      </div>
      ${childrenHTML}
    </div>
  `;
}



/** 페이지 이벤트 설정 */
function setupPage(postId, isPostAuthor) {
  if (isPostAuthor) {
    document.getElementById("edit-post-btn")?.addEventListener("click", () => {
      loadPage("../pages/posts/editPost.js", { id: postId });
    });
    document.getElementById("delete-post-btn")?.addEventListener("click", () => {
      document.getElementById("post-delete-popup").classList.remove("hidden");
    });
    setupConfirmPopup("post-delete-popup", () => deletePost(postId));
  }
  setupConfirmPopup("comment-delete-popup", () => deleteComment(postId, commentToDelete));

  document.getElementById("comment-submit-btn")?.addEventListener("click", () => {
    if (editCommentId) {
      updateComment(editCommentId, postId);
    } else {
      addComment(postId);
    }
  });

  // 좋아요 처리
  document.getElementById("post-like-btn")?.addEventListener("click", async (event) => {
    const postId = event.target.getAttribute("data-post-id");
    await likePost(postId);
  });

  // 댓글 수정 버튼 이벤트
  document.querySelectorAll(".edit-comment-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      editCommentId = btn.dataset.id;
      const commentItem = btn.closest(".comment-item");
      document.querySelector(".comment-input").value = commentItem.querySelector(".comment-content").textContent;
      // 수정모드일 경우, reply 모드는 초기화
      replyCommentId = null;
      document.querySelector(".comment-input").placeholder = "댓글을 입력하세요";
    })
  );

  // 댓글 삭제 버튼 이벤트
  document.querySelectorAll(".delete-comment-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      commentToDelete = btn.dataset.id;
      document.getElementById("comment-delete-popup").classList.remove("hidden");
    })
  );

  // 답글(대댓글) 작성 버튼 이벤트
  document.querySelectorAll(".reply-comment-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      replyCommentId = btn.dataset.id;
      // 답글 작성 시, 수정모드는 초기화
      editCommentId = null;
      const commentInput = document.querySelector(".comment-input");
      commentInput.placeholder = "대댓글을 입력하세요";
      commentInput.focus();
    })
  );
}

/** 게시글 삭제 요청 */
async function deletePost(postId) {
  const accessToken = localStorage.getItem("accessToken");

  if (!postId) {
    alert("삭제할 게시글 ID가 없습니다.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      alert("게시글이 삭제되었습니다.");
      location.reload();
    } else {
      alert("게시글 삭제에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 게시글 삭제 오류:", error);
  }
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

  // 작성할 댓글의 payload 구성 (답글인 경우 parentCommentId 포함)
  const payload = { content };
  if (replyCommentId) {
    payload.parentCommentId = replyCommentId;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      alert("댓글이 등록되었습니다.");
      // 댓글 등록 후 reply 모드 초기화 및 입력창 클리어
      replyCommentId = null;
      commentInput.value = "";
      commentInput.placeholder = "댓글을 입력하세요";
      loadPage("../pages/posts/post.js", { id: postId });
    } else {
      alert("댓글 등록에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 댓글 등록 오류:", error);
  }
}

/** 댓글 입력 유효성 검사 설정 */
function setupCommentValidation() {
  const commentInput = document.querySelector(".comment-input");
  const submitButton = document.getElementById("comment-submit-btn");

  commentInput.addEventListener("input", () => {
    submitButton.disabled = commentInput.value.trim() === "";
  });
}

/** 댓글 삭제 요청 */
async function deleteComment(postId, commentId) {
  const accessToken = localStorage.getItem("accessToken");
  if (!commentId) {
    alert("삭제할 댓글 ID가 없습니다.");
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.ok) {
      alert("댓글이 삭제되었습니다.");
      loadPage("../pages/posts/post.js", { id: postId });
    } else {
      alert("댓글 삭제에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 댓글 삭제 오류:", error);
  }
}

/** 댓글 수정 요청 */
async function updateComment(commentId, postId) {
  const accessToken = localStorage.getItem("accessToken");
  const newContent = document.querySelector(".comment-input").value;

  if (!newContent) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content: newContent }),
    });
    if (response.ok) {
      alert("댓글이 수정되었습니다.");
      loadPage("../pages/posts/post.js", { id: postId });
    } else {
      alert("댓글 수정에 실패했습니다.");
    }
  } catch (error) {
    console.error("⛔ 댓글 수정 오류:", error);
  }
}

/** 좋아요 API 요청 함수 */
async function likePost(postId) {
  const userId = getUserId(); // 로그인한 유저의 ID 가져오기
  console.log("좋아요 클릭");

  if (!userId) {
    alert("로그인한 사용자만 좋아요를 누를 수 있습니다.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      }
    });

    if (response.ok) {
      console.log("좋아요가 업데이트되었습니다.");
      const data = await response.json();
      const commentsCountElem = document.getElementById("post-like-btn");
      const updatedCount = data.data.likeCount;
      setTimeout(() => {
        const commentsCountElem = document.getElementById("post-like-btn");
        if (commentsCountElem) {
          commentsCountElem.textContent = updatedCount;
        }
      }, 0);
      alert(updatedCount > 0 ? "좋아요가 추가되었습니다." : "좋아요가 취소되었습니다.");
    }
  } catch (error) {
    console.error("좋아요 처리 중 오류 발생:", error);
    alert("좋아요 처리 중 오류가 발생했습니다.");
  }
}

/** CSS 로드 */
async function loadStyles() {
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
  if (!document.getElementById("hover-css")) {
    const link = document.createElement("link");
    link.id = "hover-css";
    link.rel = "stylesheet";
    link.href = "../../components/HoverButton/HoverButton.css";
    document.head.appendChild(link);
  }
}
