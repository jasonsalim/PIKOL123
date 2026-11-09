import View from './View.js';

/**
 * Owner Admin — Step 1: Sign up / Log in (+ business verification for new owners).
 */
class AdminAuthView extends View {
  _parentElement = document.querySelector('#admin-auth-view');
  _errorMessage = 'Could not authenticate.';

  addHandlerToggleMode(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-auth-mode]');
      if (!btn) return;
      handler(btn.dataset.authMode);
    });
  }

  addHandlerLogin(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="owner-login"]');
      if (!form) return;
      e.preventDefault();
      handler(Object.fromEntries(new FormData(form).entries()));
    });
  }

  addHandlerSignup(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="owner-signup"]');
      if (!form) return;
      e.preventDefault();
      handler(Object.fromEntries(new FormData(form).entries()));
    });
  }

  _generateMarkup() {
    const { message, messageType, authMode } = this._data;
    const isSignup = authMode === 'signup';

    return `
      <section class="panel admin-panel">
        <div class="panel__header">
          <p class="eyebrow">Owner Admin · Step 1</p>
          <h2>Sign up / Log in</h2>
          <p class="lede">Create an owner account or log in to manage venues, courts, and bookings.</p>
        </div>

        ${
          message
            ? `<p class="flash flash--${messageType || 'info'}" role="status">${message}</p>`
            : ''
        }

        <div class="admin-tabs" role="tablist">
          <button type="button" class="chip-btn ${!isSignup ? 'is-active' : ''}" data-auth-mode="login">Log in</button>
          <button type="button" class="chip-btn ${isSignup ? 'is-active' : ''}" data-auth-mode="signup">Sign up</button>
        </div>

        ${
          isSignup
            ? `
          <form class="form form__stack" data-form="owner-signup">
            <label>Full name
              <input name="name" required placeholder="Juan Dela Cruz" />
            </label>
            <label>Email
              <input name="email" type="email" required placeholder="you@business.ph" />
            </label>
            <label>Phone
              <input name="phone" required placeholder="09xxxxxxxxx" />
            </label>
            <label>Password
              <input name="password" type="password" required minlength="6" />
            </label>
            <fieldset class="admin-fieldset">
              <legend>Business details (verification)</legend>
              <label>Business name
                <input name="businessName" required placeholder="My Pickleball Courts" />
              </label>
              <label>Business details
                <textarea name="businessDetails" rows="3" required placeholder="Venue locations, permits, contact…"></textarea>
              </label>
            </fieldset>
            <button type="submit" class="btn btn--primary">Create owner account</button>
          </form>`
            : `
          <form class="form form__stack" data-form="owner-login">
            <label>Email
              <input name="email" type="email" required placeholder="you@email.com" />
            </label>
            <label>Password
              <input name="password" type="password" required />
            </label>
            <button type="submit" class="btn btn--primary">Log in</button>
          </form>`
        }
      </section>
    `;
  }
}

export default new AdminAuthView();
