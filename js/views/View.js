/**
 * Base View class (Week 5 View framework).
 * Every UI view must extend this class.
 * Views never import the model and never change state directly.
 */
export default class View {
  _parentElement = null;
  _data = null;
  _errorMessage = 'Something went wrong.';

  /**
   * Render data into the parent element.
   * @param {*} data Data passed from the controller.
   */
  render(data) {
    this._data = data;
    const markup = this._generateMarkup();
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Show an error / validation message inside the parent element.
   * @param {string} [message]
   */
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error" role="alert">
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Subclasses must return HTML markup as a string.
   * @returns {string}
   */
  _generateMarkup() {
    throw new Error('_generateMarkup() must be implemented by a subclass');
  }
}
