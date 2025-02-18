export function HoverButton(label, id) {
  return `<button id="${id}" class="hover-button">${label}</button>`;
}

export function setupHoverButton(buttonId, onClick) {
  setTimeout(() => {
      const button = document.getElementById(buttonId);
      if (!button) {
          console.error(`setupHoverButton: 버튼을 찾을 수 없습니다. ID: ${buttonId}`);
          return;
      }
      console.log(`setupHoverButton: 버튼(${buttonId}) 클릭 이벤트 추가`);
      button.addEventListener("click", onClick);
  }, 100); // DOM 로딩 보장
}
