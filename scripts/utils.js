// ✅ utils.js - 유틸 함수 모음
import { API_BASE_URL } from "../../config.js";

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

export async function uploadImage(file) {
    const formData = new FormData();
    formData.append("imageFile", file);
    formData.append("type", "profile");

    try {
        const response = await fetch(`${API_BASE_URL}/api/image`, {
            method: "POST",
            body: formData
        });

        if (response.status === 201) {
            const data = await response.json();
            console.log("✅ 이미지 업로드 성공:", data.imageUrl);
            return data;
        } else {
            const errorData = await response.json();
            console.error("⛔ 이미지 업로드 실패:", errorData);
        }
    } catch (error) {
        console.error("⛔ 네트워크 오류:", error);
    }
    return null;
}