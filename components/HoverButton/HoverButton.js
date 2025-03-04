export function HoverButton(label, id) {
  return `<button id="${id}" class="hover-button">${label}</button>`;
}

export function setupHoverButton(buttonId, onClick) {
  if (document.readyState === "loading") {
    // DOM이 아직 로딩 중이라면 `DOMContentLoaded` 이벤트를 기다림
    document.addEventListener("DOMContentLoaded", () => bindHoverButton(buttonId, onClick));
  } else {
    // 이미 로딩된 경우 즉시 실행
    requestAnimationFrame(() => bindHoverButton(buttonId, onClick));
  }
}

function bindHoverButton(buttonId, onClick) {
  const button = document.getElementById(buttonId);
  if (!button) {
    console.error(`setupHoverButton: 버튼을 찾을 수 없습니다. ID: ${buttonId}`);
    return;
  }
  console.log(`setupHoverButton: 버튼(${buttonId}) 클릭 이벤트 추가`);
  button.addEventListener("click", onClick);
}
