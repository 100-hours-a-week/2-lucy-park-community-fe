// components/ValidationButton/ValidationButton.js
export class ValidationButton {
    constructor(buttonId) {
      this.button = document.getElementById(buttonId);
      this.isValid = false;
  
      if (this.button) {
        this.initializeButton();
      }
    }
  
    initializeButton() {
      this.setDisabled(true);
      this.button.classList.add("validation-button");
    }
  
    setDisabled(disabled) {
      this.button.disabled = disabled;
      this.updateButtonStyle();
    }
  
    updateButtonStyle() {
      if (this.button.disabled) {
        this.button.style.backgroundColor = "#ACA0EB";
      } else {
        this.button.style.backgroundColor = "#7F6AEE";
      }
    }
  
    updateValidationState(isValid) {
      this.isValid = isValid;
      this.setDisabled(!isValid);
    }
  }
  