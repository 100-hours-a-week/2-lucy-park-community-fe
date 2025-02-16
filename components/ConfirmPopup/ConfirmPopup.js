export function ConfirmPopup(id, title, message, confirmText) {
    return `
      <div id="${id}" class="confirm-popup hidden">
        <div class="popup-content">
          <p class="popup-title">${title}</p>
          <p class="popup-message">${message}</p>
          <div class="popup-actions">
            <button class="popup-cancel-btn">취소</button>
            <button class="popup-confirm-btn">${confirmText}</button>
          </div>
        </div>
      </div>
    `;
  }
  
  export function setupConfirmPopup(id, onConfirm) {
    const popup = document.getElementById(id);
    if (!popup) return;
  
    const cancelBtn = popup.querySelector(".popup-cancel-btn");
    const confirmBtn = popup.querySelector(".popup-confirm-btn");
  
    cancelBtn.addEventListener("click", () => popup.classList.add("hidden"));
    confirmBtn.addEventListener("click", () => {
      onConfirm();
      popup.classList.add("hidden");
    });
  }
  