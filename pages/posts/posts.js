import { loadPage } from "../../scripts/app.js";
import { HoverButton, setupHoverButton } from "../../components/HoverButton/HoverButton.js";
import { truncateText, formatDate, formatCount } from "../../scripts/utils.js"; 
import { API_BASE_URL } from "../../config.js";

export function render() {
  return `
    <section class="post-list-container">
      <p class="welcome-message">안녕하세요,<br>아무 말 대잔치 게시판 입니다.</p>
      <div id="create-post-btn-container"></div>
      
      <ul id="post-list" class="post-list"></ul>
      <div id="loading" class="loading hidden">게시글 불러오는 중...</div>
    </section>
  `;
}

export function setup() {
  loadStyles();
  loadPosts();
  setupEventListeners();
  
  setTimeout(() => {
    const btnContainer = document.getElementById("create-post-btn-container");
    if (btnContainer) {
      btnContainer.innerHTML = HoverButton("게시글 작성", "make-post-btn");
    }
    
    const button = document.getElementById("make-post-btn");
    if (!button) {
      console.error("make-post-btn 버튼을 찾을 수 없습니다.");
      return;
    }

    button.addEventListener("click", () => {
      console.log("🔄 make-post-btn 클릭됨! 페이지 이동 실행...");
      loadPage("../pages/posts/makePost.js");
    });
  }, 300);
}

function loadStyles() {
  [
    { id: "posts-css", href: "styles/posts/posts.css" },
    { id: "hover-button-css", href: "../../components/HoverButton/HoverButton.css" }
  ].forEach(({ id, href }) => {
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  });
}

function setupEventListeners() {
  window.addEventListener("scroll", handleInfiniteScroll);
}

/**
 * 서버에서 게시글 불러오기
 */
async function loadPosts() {
  const postList = document.getElementById("post-list");
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load posts: ${response.status} ${response.statusText}`);
    }

    const { message, data: posts } = await response.json();
    if (message !== "get_posts_success") {
      throw new Error("Unexpected response from server");
    }

    postList.innerHTML = posts.map(post => createPostCard(post)).join("");
    
    // 클릭 이벤트 부착
    document.querySelectorAll(".post-card").forEach(card => {
      card.addEventListener("click", (event) => {
        const postId = event.currentTarget.dataset.postId;
        loadPage("../pages/posts/post.js", { id: postId });
      });
    });

  } catch (error) {
    console.error("⛔ 게시글 로딩 오류:", error);
    alert("게시글을 불러오는 데 실패했습니다. 다시 시도해주세요.");
  } finally {
    loading.classList.add("hidden");
  }
}

/**
 *  PostCard 컴포넌트 - 게시글 카드 생성
 *  추가 확장이 예상되지 않아 별도의 컴포넌트로 분리하지는 않았습니다
 */
function createPostCard(post) {
  return `
    <li class="post-card" data-post-id="${post.id}">
      <h3 class="post-title">${truncateText(post.title, 26)}</h3>
      <p class="post-meta">
        좋아요 ${formatCount(post.likes)} · 댓글 ${formatCount(Array.isArray(post.comments) ? post.comments.length : 0)} · 조회수 ${formatCount(post.views)}
        <span class="post-date">${formatDate(post.createdAt)}</span>
      </p>
      <div class="post-author">
        <span>${post.user.nickname}</span>
      </div>
    </li>
  `;
}

// 무한 스크롤 (추후 API 페이징 기능 추가 가능)
function handleInfiniteScroll() {}
