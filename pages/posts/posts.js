import { loadPage } from "../../scripts/app.js";
import { HoverButton, setupHoverButton } from "../../components/HoverButton/HoverButton.js";
import { truncateText, formatDate, formatCount } from "../../scripts/utils.js"; 

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
      console.error("❌ make-post-btn 버튼을 찾을 수 없습니다.");
      return;
    }
    console.log("✅ make-post-btn 버튼 찾음. 클릭 이벤트 추가 중...");
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

async function loadPosts() {
  const postList = document.getElementById("post-list");
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");

  try {
    const response = await fetch("../../data/posts.json");
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
    }

    const { posts } = await response.json();
    localStorage.setItem("posts", JSON.stringify(posts)); // 게시글 데이터를 로컬 스토리지에 저장

    posts.forEach(post => {
      const li = document.createElement("li");
      li.classList.add("post-card");
      li.dataset.postId = post.id;
      li.innerHTML = `
        <h3 class="post-title">${truncateText(post.title, 26)}</h3>
        <p class="post-meta">
          좋아요 ${formatCount(post.likes)} · 댓글 ${formatCount(post.comments)} · 조회수 ${formatCount(post.views)}
          <span class="post-date">${formatDate(post.createdAt)}</span>
        </p>
        <div class="post-author">
          <img src="${post.author.profilePic || 'default-profile.png'}" class="profile-pic"> 
          <span>${post.author.name}</span>
        </div>
      `;
      li.addEventListener("click", () => loadPage("../pages/posts/post.js", { id: post.id }));
      postList.appendChild(li);
    });
  } catch (error) {
    console.error("게시글 로딩 오류:", error);
  } finally {
    loading.classList.add("hidden");
  }
}

// 📌 무한 스크롤 (JSON 데이터에서는 추가 로딩 없이 전체 표시)
function handleInfiniteScroll() {}
