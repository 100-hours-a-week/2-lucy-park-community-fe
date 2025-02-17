import { loadPage } from "../../scripts/app.js";
import { BackButton, setupBackButton } from "../../components/BackButton/BackButton.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";
import { ValidationButton } from "../../components/ValidationButton/ValidationButton.js";
import { formatCount, formatDate } from "../../scripts/utils.js";

let commentToDelete = null; // 삭제할 댓글 ID
let editCommentId = null;   // 수정 중인 댓글 ID (없으면 null)

/** 로컬 스토리지에서 user 가져오기 (없으면 기본값 생성) */
function getUser() {
  let user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    user = {
      name: "GuestUser",
      profilePic: "../../assets/my-profile.png"
    };
    localStorage.setItem("user", JSON.stringify(user));
  }
  return user;
}

/** post.js 초기화 (페이지 진입 시 호출) */
export async function init(params) {
  await loadStyles();
  

  const postId = params.id;
  if (!postId) {
    return `<section class="post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;
  }
  const post = await getPostData(postId);

  // DOM에 html이 삽입되기 ‘직후’에 버튼 세팅
  setTimeout(() => {
    setupBackButton("../pages/posts/posts.js", "post-back-btn");
  }, 0);

  return await render(post);
}

/** 메인 render 함수 (게시글+댓글 섹션) */
export async function render(post) {
  if (!post) {
    return `<section class="post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;
  }

  // 좋아요 기본값 처리
  if (typeof post.likedByCurrentUser !== "boolean") post.likedByCurrentUser = false;
  if (typeof post.likes !== "number") post.likes = 0;

  // 댓글 섹션 HTML
  const commentsHTML = await renderCommentsSection(post.id);

  // DOM 렌더 후 이벤트 바인딩
  setTimeout(() => setupPage(post.id), 0);

  return `
    <section class="post-container">
      <div class="back-button">
        ${BackButton("../pages/posts/posts.js", "post-back-btn")}
      </div>

      <h1 class="post-title">${post.title}</h1>
      <div class="post-meta">
        <div class="author-info">
          <img
            src="${post.author?.profilePic || "../../assets/default-profile.png"}"
            alt="profile"
            class="profile-pic"
          >
          ${post.author?.name || "익명 사용자"}
        </div>
        <div class="post-actions">
          <button id="edit-post-btn" class="edit-btn">수정</button>
          <button id="delete-post-btn" class="delete-btn">삭제</button>
        </div>
      </div>

      <p class="post-content">${post.content || "내용이 없습니다."}</p>
      <div class="post-stats">
        <button
          id="like-post-btn"
          class="like-post-btn"
          style="background-color:${post.likedByCurrentUser ? "#ACA0EB" : "#D9D9D9"};
                 color:#fff; border:none; border-radius:4px; padding:6px 10px; cursor:pointer;"
        >
          좋아요 ${formatCount(post.likes)}
        </button>
        <span class="view-count">${formatCount(post.views || 0)} 조회수</span>
        <span class="comment-count">${formatCount(post.comments?.length || 0)} 댓글</span>
      </div>

      ${commentsHTML}

      <!-- 게시글 삭제 모달 -->
      ${ConfirmPopup(
        "post-delete-popup",
        "게시글을 삭제하시겠습니까?",
        "삭제한 내용은 복구 할 수 없습니다.",
        "확인"
      )}

      <!-- 댓글 삭제 모달 -->
      ${ConfirmPopup(
        "comment-delete-popup",
        "댓글을 삭제하시겠습니까?",
        "삭제한 내용은 복구 할 수 없습니다.",
        "확인"
      )}
    </section>
  `;
}

/** 댓글 목록+입력 폼 생성 */
async function renderCommentsSection(postId) {
  const comments = await getCommentsForPost(postId);
  let commentsHTML = "";

  comments.forEach((comment) => {
    const isUserComment = comment.id.startsWith("c") && comment.id.length > 2;
    let actionButtons = "";
    if (isUserComment) {
      actionButtons = `
        <button class="edit-comment-btn" data-comment-id="${comment.id}">수정</button>
        <button class="delete-comment-btn" data-comment-id="${comment.id}">삭제</button>
      `;
    } else {
      // JSON 댓글 → 수정/삭제 불가 
      actionButtons = `<div class="comment-locked"></div>`;
    }

    commentsHTML += `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-meta">
          <span class="comment-author">
            <img
              src="${comment.profilePic || "../../assets/default-profile.png"}"
              alt="profile"
              class="profile-pic"
              style="width:24px; height:24px; border-radius:50%; object-fit:cover;"
            >
            <span class="comment-nickname">${comment.author}</span>
          </span>
          <div class="comment-date">${formatDate(comment.createdAt)}</div>
          <div class="comment-actions">
            ${actionButtons}
          </div>
        </div>
        <div class="comment-content">${comment.content}</div>
      </div>
    `;
  });

  return `
    <div class="comments-container">
      <div class="comment-form">
        <textarea class="comment-input" placeholder="댓글을 남겨주세요!"></textarea>
        <!-- "댓글 등록" / "댓글 수정" 두 가지 역할 (editCommentId에 따라) -->
        <button id="comment-submit-btn" class="comment-submit-btn">댓글 등록</button>
      </div>
      ${commentsHTML}
    </div>
  `;
}

/** 전체 이벤트 바인딩(게시글 삭제/좋아요, 댓글 등록/수정/삭제) */
function setupPage(postId) {
  document.getElementById("post-back-btn").addEventListener("click", () => {
    loadPage("../pages/posts/posts.js");
  });

  // 게시글 수정 
  const editBtn = document.getElementById("edit-post-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      loadPage(`../pages/posts/editPost.js?id=${postId}`);
    });
  }

  // 게시글 삭제
  const deleteBtn = document.getElementById("delete-post-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      document.getElementById("post-delete-popup").classList.remove("hidden");
    });
  }
  setupConfirmPopup("post-delete-popup", () => doDeletePost(postId));

  // 좋아요
  const likePostBtn = document.getElementById("like-post-btn");
  if (likePostBtn) {
    likePostBtn.addEventListener("click", () => toggleLikePost(postId));
  }

  // 댓글 등록/수정
  const commentSubmitBtn = document.getElementById("comment-submit-btn");
  const commentInput = document.querySelector(".comment-input");
  if (commentSubmitBtn && commentInput) {
    const validationBtn = new ValidationButton("comment-submit-btn");
    commentInput.addEventListener("input", () => {
      const text = commentInput.value.trim();
      validationBtn.updateValidationState(text.length > 0);
    });

    commentSubmitBtn.addEventListener("click", async () => {
      if (commentSubmitBtn.disabled) return;
      if (editCommentId) {
        await updateComment(editCommentId, postId);
      } else {
        await addComment(postId);
      }
    });
  }

  // 댓글 수정/삭제
  const commentsContainer = document.querySelector(".comments-container");
  if (commentsContainer) {
    commentsContainer.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-comment-btn");
      const delBtn = e.target.closest(".delete-comment-btn");
      if (editBtn) {
        const cid = editBtn.getAttribute("data-comment-id");
        startEditingComment(cid);
      }
      if (delBtn) {
        const cid = delBtn.getAttribute("data-comment-id");
        commentToDelete = cid;
        document.getElementById("comment-delete-popup").classList.remove("hidden");
      }
    });
  }

  // 댓글 삭제 모달
  setupConfirmPopup("comment-delete-popup", () => doDeleteComment());
}

/** 게시글 삭제 */
function doDeletePost(postId) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const idx = posts.findIndex((p) => String(p.id) === String(postId));
  if (idx !== -1) {
    posts.splice(idx, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    alert("게시글이 삭제되었습니다.");
  }
  loadPage("../posts/posts.js");
}

/** 댓글 삭제 */
function doDeleteComment() {
  if (!commentToDelete) return;
  let comments = JSON.parse(localStorage.getItem("comments")) || [];
  comments = comments.filter((c) => c.id !== commentToDelete);
  localStorage.setItem("comments", JSON.stringify(comments));

  const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentToDelete}"]`);
  if (commentItem) commentItem.remove();

  commentToDelete = null;
}

/** 게시글 좋아요 토글 */
function toggleLikePost(postId) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const idx = posts.findIndex((p) => String(p.id) === String(postId));
  if (idx === -1) return;

  const post = posts[idx];
  if (typeof post.likes !== "number") post.likes = 0;
  if (typeof post.likedByCurrentUser !== "boolean") post.likedByCurrentUser = false;

  if (post.likedByCurrentUser) {
    post.likedByCurrentUser = false;
    post.likes = Math.max(post.likes - 1, 0);
  } else {
    post.likedByCurrentUser = true;
    post.likes += 1;
  }

  posts[idx] = post;
  localStorage.setItem("posts", JSON.stringify(posts));

  const likePostBtn = document.getElementById("like-post-btn");
  if (likePostBtn) {
    likePostBtn.style.backgroundColor = post.likedByCurrentUser ? "#ACA0EB" : "#D9D9D9";
    likePostBtn.textContent = `좋아요 ${formatCount(post.likes)}`;
  }
}

/** 댓글 등록 */
async function addComment(postId) {
  const commentInput = document.querySelector(".comment-input");
  if (!commentInput) return;
  const newCommentContent = commentInput.value.trim();
  if (!newCommentContent) {
    alert("댓글 내용을 입력해주세요!");
    return;
  }

  const user = getUser();
  const newComment = {
    id: "c" + Date.now(),
    postId: String(postId),
    author: user.nickname, 
    profilePic: user.profilePic,
    content: newCommentContent,
    createdAt: new Date().toISOString()
  };

  let comments = JSON.parse(localStorage.getItem("comments")) || [];
  comments.push(newComment);
  localStorage.setItem("comments", JSON.stringify(comments));

  commentInput.value = "";
  await refreshComments(postId);
}

/** 댓글 수정 모드로 진입 (기존 내용 → input) */
function startEditingComment(commentId) {
  const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
  if (!commentItem) return;
  const contentEl = commentItem.querySelector(".comment-content");
  const commentInput = document.querySelector(".comment-input");
  const commentSubmitBtn = document.getElementById("comment-submit-btn");

  editCommentId = commentId;
  if (commentInput) {
    commentInput.value = contentEl.textContent;
  }
  if (commentSubmitBtn) {
    commentSubmitBtn.textContent = "댓글 수정";
  }
}

/** 댓글 수정 완료 */
async function updateComment(commentId, postId) {
  const commentInput = document.querySelector(".comment-input");
  if (!commentInput) return;
  const editedText = commentInput.value.trim();
  if (!editedText) {
    alert("댓글 내용을 입력해주세요!");
    return;
  }

  let comments = JSON.parse(localStorage.getItem("comments")) || [];
  const idx = comments.findIndex((c) => c.id === commentId);
  if (idx !== -1) {
    comments[idx].content = editedText;
    localStorage.setItem("comments", JSON.stringify(comments));
  }

  // 수정 완료 후 초기화
  editCommentId = null;
  commentInput.value = "";
  const commentSubmitBtn = document.getElementById("comment-submit-btn");
  if (commentSubmitBtn) {
    commentSubmitBtn.textContent = "댓글 등록";
  }

  await refreshComments(postId);
}

/** 댓글 목록 새로고침 (게시글 내용 유지) */
async function refreshComments(postId) {
  const newHTML = await renderCommentsSection(postId);
  const commentsContainer = document.querySelector(".comments-container");
  if (commentsContainer) {
    // 임시 DOM 파싱
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newHTML;

    // 새 .comments-container를 추출
    const newContainer = tempDiv.querySelector(".comments-container");
    if (newContainer) {
      // 기존 .comments-container만 교체
      commentsContainer.innerHTML = newContainer.innerHTML;
    }
  }

  // 다시 이벤트 연결 (ValidationButton, editComment 등)
  const commentSubmitBtn = document.getElementById("comment-submit-btn");
  const commentInput = document.querySelector(".comment-input");
  if (commentSubmitBtn && commentInput) {
    const validationBtn = new ValidationButton("comment-submit-btn");
    commentInput.addEventListener("input", () => {
      const text = commentInput.value.trim();
      validationBtn.updateValidationState(text.length > 0);
    });
    commentSubmitBtn.addEventListener("click", async () => {
      if (commentSubmitBtn.disabled) return;
      if (editCommentId) {
        await updateComment(editCommentId, postId);
      } else {
        await addComment(postId);
      }
    });
  }

  // 댓글 수정/삭제 이벤트 재연결
  const commentsContainerNew = document.querySelector(".comments-container");
  if (commentsContainerNew) {
    commentsContainerNew.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-comment-btn");
      const delBtn = e.target.closest(".delete-comment-btn");
      if (editBtn) {
        const cid = editBtn.getAttribute("data-comment-id");
        startEditingComment(cid);
      }
      if (delBtn) {
        const cid = delBtn.getAttribute("data-comment-id");
        commentToDelete = cid;
        document.getElementById("comment-delete-popup").classList.remove("hidden");
      }
    });
  }
}

/** CSS 로드 함수 (post.css, ConfirmPopup.css, ValidationButton.css) */
async function loadStyles() {
  if (!document.getElementById("post-css")) {
    const link = document.createElement("link");
    link.id = "post-css";
    link.rel = "stylesheet";
    link.href = "styles/posts/post.css";
    document.head.appendChild(link);
  }
  if (!document.getElementById("confirm-popup-css")) {
    const link2 = document.createElement("link");
    link2.id = "confirm-popup-css";
    link2.rel = "stylesheet";
    link2.href = "components/ConfirmPopup/ConfirmPopup.css";
    document.head.appendChild(link2);
  }
  if (!document.getElementById("comment-validation-button-css")) {
    const link3 = document.createElement("link");
    link3.id = "comment-validation-button-css";
    link3.rel = "stylesheet";
    link3.href = "components/ValidationButton/ValidationButton.css";
    document.head.appendChild(link3);
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

/** 로컬 스토리지에서 comments.json 읽기 */
async function getCommentsForPost(postId) {
  let comments = JSON.parse(localStorage.getItem("comments"));
  if (!comments) {
    const response = await fetch("../../data/comments.json");
    const data = await response.json();
    comments = data.comments;
    localStorage.setItem("comments", JSON.stringify(comments));
  }
  return comments.filter((c) => String(c.postId) === String(postId));
}
