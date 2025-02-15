import { loadPage } from "../../scripts/app.js";

export function render() {
  return `
    <section class="post-list-container">
      
      <p class="welcome-message">안녕하세요,<br>아무 말 대잔치 게시판 입니다.</p>
      <button id="create-post-btn" class="create-post-btn">게시글 작성</button>
      

      <ul id="post-list" class="post-list"></ul>

      <div id="loading" class="loading hidden">게시글 불러오는 중...</div>
    </section>
  `;
}

export function setup() {
  loadStyles();
  loadPosts();
  setupEventListeners();
}

function loadStyles() {
  if (!document.getElementById("post-css")) {
    const link = document.createElement("link");
    link.id = "post-css";
    link.rel = "stylesheet";
    link.href = "styles/posts/list.css";
    document.head.appendChild(link);
  }
}

function setupEventListeners() {
  document.getElementById("create-post-btn").addEventListener("click", () => {
    loadPage("../posts/create.js");
  });

  window.addEventListener("scroll", handleInfiniteScroll);
}

async function loadPosts() {
  const postList = document.getElementById("post-list");
  const loading = document.getElementById("loading");

  loading.classList.remove("hidden");

  try {
    // ✅ `posts.json`에서 게시글 데이터 가져오기
    const response = await fetch("../../data/posts.json");
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const posts = data.posts;

    posts.forEach(post => {
      const li = document.createElement("li");
      li.classList.add("post-card");
      li.innerHTML = `
        <h3 class="post-title">${truncateText(post.title, 26)}</h3>
        <p class="post-meta">
          ❤️ ${formatCount(post.likes)} · 💬 ${formatCount(post.comments)} · 👀 ${formatCount(post.views)}
            <span class="post-date">${formatDate(post.createdAt)}</span>
        </p>
        <div class="post-author">
          <img src="${post.author.profilePic || 'default-profile.png'}" class="profile-pic"> 
          <span>${post.author.name}</span>
        </div>
      `;

      li.addEventListener("click", () => {
        loadPage(`../posts/detail.js?id=${post.id}`);
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
function handleInfiniteScroll() {
  // JSON 파일은 정적 데이터라 추가 로딩 없음
}

// 📌 텍스트 26자 초과 시 줄이기
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
}

// 📌 날짜 형식 변환 (yyyy-mm-dd hh:mm:ss)
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
}

// 📌 숫자 단위 변환 (1k, 10k, 100k)
function formatCount(count) {
  if (count >= 100000) return `${Math.floor(count / 1000)}k`;
  if (count >= 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count >= 1000) return `${Math.floor(count / 1000)}k`;
  return count;
}
