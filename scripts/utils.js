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
  