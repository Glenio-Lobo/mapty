// @ts-check
'use strict';

/** Error Class */
class Error {
    /**
     * Build a error object
     * @param {string} errorMessage 
     */
    constructor(errorMessage){
      this.errorMessage = errorMessage;
    }
  
    /**
     * Renders error message on the workout container
     * @param {Element} element Element where the message will be positioned
     */
    renderErrorMessage(element){
  
      // Se já existir um erro renderizado retorne
      if(element?.querySelector('.error')) return;
      
      // Gera o erro
      const html = `<div class="error">${this.errorMessage}</div>`;
      element?.insertAdjacentHTML('afterbegin', html);
      const errorElement = element?.querySelector('.error');
  
      setTimeout( () => {
        //@ts-ignore
        errorElement.style.opacity = 0;
        //@ts-ignore
        errorElement.style.visibility = 'hidden';
      }, 2000);
  
      setTimeout( () => {
        errorElement?.remove();
      }, 2500);
    }
  
    /**
     * Sets the error message
     * @param {string} errorMessage 
     */
    setErrorMessage(errorMessage){
      this.errorMessage = errorMessage;
    }
}

export default Error;