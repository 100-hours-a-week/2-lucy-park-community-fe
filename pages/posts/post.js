import { loadPage } from "../../scripts/app.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";

export function render(params) {
  const post = getPostData(params.postId);

  if (!post) {
    return `<section class="post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;
  }

  return `
    <section class="post-container">
      <h1 class="post-title">${post.title}</h1>
      <div class="post-meta">
        <div class="author-info">
          <img src="${post.author.profilePic || 'default-profile.png'}" class="profile-pic"> ${post.author.name}
        </div>
        <div class="post-actions">
          <button id="edit-post-btn" class="edit-btn">수정</button>
          <button id="delete-post-btn" class="delete-btn">삭제</button>
        </div>
      </div>
      <img src="${post.image || 'post-image-placeholder.png'}" class="post-image">
      <p class="post-content">${post.content}</p>
      <div class="post-stats">
        <span class="like-count">${formatCount(post.likes)} 좋아요</span>
        <span class="view-count">${formatCount(post.views)} 조회수</span>
        <span class="comment-count">${formatCount(post.comments.length)} 댓글</span>
      </div>

      <div class="comment-section">
        <textarea id="comment-input" placeholder="댓글을 남겨주세요"></textarea>
        <button id="submit-comment-btn" class="submit-comment-btn">댓글 등록</button>
        <ul id="comment-list" class="comment-list">
          ${post.comments.map(comment => `
            <li class="comment-item">
              <div class="comment-meta">
                <div class="author-info">
                  <img src="${comment.profilePic || 'default-profile.png'}" class="profile-pic"> ${comment.author}
                </div>
                <div class="comment-actions">
                  <button class="edit-comment-btn">수정</button>
                  <button class="delete-comment-btn">삭제</button>
                </div>
              </div>
              <p class="comment-text">${comment.content}</p>
            </li>
          `).join('')}
        </ul>
      </div>

      ${ConfirmPopup("post-delete-popup", "게시글을 삭제하시겠습니까?", "삭제한 내용은 복구할 수 없습니다.", "삭제")}
      ${ConfirmPopup("comment-delete-popup", "댓글을 삭제하시겠습니까?", "삭제한 내용은 복구할 수 없습니다.", "삭제")}
    </section>
  `;
}

export function setup() {
  setupConfirmPopup("post-delete-popup", () => deletePost());
  setupConfirmPopup("comment-delete-popup", () => deleteComment());

  document.getElementById("edit-post-btn").addEventListener("click", () => {
    loadPage("../posts/edit.js");
  });

  document.getElementById("delete-post-btn").addEventListener("click", () => {
    document.getElementById("post-delete-popup").classList.remove("hidden");
  });
}

function getPostData(postId) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  return posts.find(post => post.id === postId);
}

function deletePost() {
  alert("게시글이 삭제되었습니다.");
  loadPage("../posts/list.js");
}

function deleteComment() {
  alert("댓글이 삭제되었습니다.");
  document.getElementById("comment-delete-popup").classList.add("hidden");
}
