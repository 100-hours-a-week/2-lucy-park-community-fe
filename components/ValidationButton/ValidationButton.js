// components/ValidationButton/ValidationButton.js
export function createValidationButton(buttonId) {
  const button = document.getElementById(buttonId);
  let isValid = false;

  if (!button) return null;

  function setDisabled(disabled) {
    button.disabled = disabled;
    updateButtonStyle();
  }

  function updateButtonStyle() {
    button.style.backgroundColor = button.disabled ? "#ACA0EB" : "#7F6AEE";
  }

  function updateValidationState(valid) {
    isValid = valid;
    setDisabled(!valid);
  }

  // 초기화 로직
  function initializeButton() {
    setDisabled(true);
    button.classList.add("validation-button");
  }

  initializeButton();

  return {
    updateValidationState,
    setDisabled,
  };
}
