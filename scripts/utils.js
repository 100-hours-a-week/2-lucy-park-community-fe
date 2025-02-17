// ✅ utils.js - 유틸 함수 모음

export function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
  }
  
  export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
  }
  
  export function formatCount(count) {
    if (count >= 100000) return `${Math.floor(count / 1000)}k`;
    if (count >= 10000) return `${(count / 1000).toFixed(1)}k`;
    if (count >= 1000) return `${Math.floor(count / 1000)}k`;
    return count;
  }

  /** 로컬 스토리지에서 posts.json 읽기 */
export async function getPostData(postId) {
  let posts = JSON.parse(localStorage.getItem("posts"));
  if (!posts) {
    const response = await fetch("../../data/posts.json");
    const data = await response.json();
    posts = data.posts;
    localStorage.setItem("posts", JSON.stringify(posts));
  }
  return posts.find((p) => String(p.id) === String(postId)) || null;
}
  