export function HoverButton(label, onClick) {
    return `<button class="hover-button">${label}</button>`;
  }
  
  export function setupHoverButton(buttonId, onClick) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", onClick);
    }
  }
  