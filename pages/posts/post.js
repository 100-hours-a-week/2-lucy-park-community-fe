import { loadPage } from "../../scripts/app.js";
import { ConfirmPopup, setupConfirmPopup } from "../../components/ConfirmPopup/ConfirmPopup.js";
import { formatCount, formatDate } from "../../scripts/utils.js";

// ✅ loadPage()에서 { id: post.id }를 받음
export async function init(params) {
  await loadStyles();

  const postId = params.id; // 🏆 여기서 바로 params.id를 사용!
  console.log("🔥 전달받은 postId:", postId);

  if (!postId) {
    return `<section class="post-container"><h2>게시글 ID가 존재하지 않습니다.</h2></section>`;
  }

  const post = await getPostData(postId);
  return render(post);
}

export function render(post) {
  if (!post) {
    return `<section class="post-container"><h2>게시글을 찾을 수 없습니다.</h2></section>`;
  }

  // setup() 호출은 DOM이 렌더링된 뒤에
  setTimeout(() => setup(post.id), 0);

  return `
    <section class="post-container">
      <h1 class="post-title">${post.title}</h1>
      <div class="post-meta">
        <div class="author-info">
          <img src="${post.author?.profilePic || "../../assets/default-profile.png"}" class="profile-pic">
          ${post.author?.name || "익명 사용자"}
        </div>
        <div class="post-actions">
          <button id="edit-post-btn" class="edit-btn">수정</button>
          <button id="delete-post-btn" class="delete-btn">삭제</button>
        </div>
      </div>

      <img src="${post.image || "../../assets/post-image-placeholder.png"}" class="post-image">
      <p class="post-content">${post.content || "내용이 없습니다."}</p>
      <div class="post-stats">
        <span class="like-count">${formatCount(post.likes || 0)} 좋아요</span>
        <span class="view-count">${formatCount(post.views || 0)} 조회수</span>
        <span class="comment-count">${formatCount(post.comments?.length || 0)} 댓글</span>
      </div>

      ${ConfirmPopup(
        "post-delete-popup",
        "게시글을 삭제하시겠습니까?",
        "삭제한 내용은 복구할 수 없습니다.",
        "삭제"
      )}
    </section>
  `;
}

// DOM 이벤트
function setup(postId) {
  console.log("✅ setup(postId):", postId);

  const deleteBtn = document.getElementById("delete-post-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      document.getElementById("post-delete-popup").classList.remove("hidden");
    });
  }

  setupConfirmPopup("post-delete-popup", () => deletePost(postId));
}

// ✅ CSS 로드
async function loadStyles() {
  if (!document.getElementById("post-css")) {
    const link = document.createElement("link");
    link.id = "post-css";
    link.rel = "stylesheet";
    link.href = "../../styles/posts/post.css";
    document.head.appendChild(link);
  }
}

// ✅ 로컬 스토리지에서 데이터 찾기
async function getPostData(postId) {
  let posts = JSON.parse(localStorage.getItem("posts"));
  if (!posts) {
    // 로컬 스토리지에 없으면 백업 JSON 사용
    const response = await fetch("../../data/posts.json");
    const data = await response.json();
    posts = data.posts;
    localStorage.setItem("posts", JSON.stringify(posts));
  }
  return posts.find((p) => p.id === postId) || null;
}

// ✅ 삭제 기능
function deletePost(postId) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts = posts.filter((p) => p.id !== postId);
  localStorage.setItem("posts", JSON.stringify(posts));

  alert("게시글이 삭제되었습니다.");
  loadPage("../posts/posts.js"); // 목록 페이지로 이동
}
