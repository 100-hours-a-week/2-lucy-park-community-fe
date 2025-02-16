import { loadPage } from "../../scripts/app.js";
import { HoverButton, setupHoverButton } from "../../components/HoverButton/HoverButton.js";
import { truncateText, formatDate, formatCount } from "../../scripts/utils.js"; // ✅ 유틸 함수 import

export function render() {
  return `
    <section class="post-list-container">
      <p class="welcome-message">안녕하세요,<br>아무 말 대잔치 게시판 입니다.</p>
      <div id="create-post-btn-container">${HoverButton("게시글 작성", "create-post-btn")}</div>
      
      <ul id="post-list" class="post-list"></ul>
      <div id="loading" class="loading hidden">게시글 불러오는 중...</div>
    </section>
  `;
}

export function setup() {
  loadStyles();
  loadPosts();
  setupEventListeners();
  setupHoverButton("create-post-btn", () => loadPage("../posts/create.js"));
}

function loadStyles() {
  if (!document.getElementById("post-css")) {
    const link = document.createElement("link");
    link.id = "post-css";
    link.rel = "stylesheet";
    link.href = "styles/posts/posts.css";
    document.head.appendChild(link);
  }

  if (!document.getElementById("hover-button-css")) {
    const link = document.createElement("link");
    link.id = "hover-button-css";
    link.rel = "stylesheet";
    link.href = "../../components/HoverButton/HoverButton.css";
    document.head.appendChild(link);
  }
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

    const data = await response.json();
    const posts = data.posts;

    // 게시글 데이터를 로컬 스토리지에 저장하여 post.js에서 사용 가능하도록 함
    localStorage.setItem("posts", JSON.stringify(posts));

    posts.forEach(post => {
      const li = document.createElement("li");
      li.classList.add("post-card");
      li.dataset.postId = post.id; // 게시글 ID 저장

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

      li.addEventListener("click", () => {
        loadPage("../pages/posts/post.js", { id: post.id }); // ✅ URL에 id 추가
      });
      

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
