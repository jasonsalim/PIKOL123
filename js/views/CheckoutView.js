import View from './View.js';
import { formatSlotLabel } from '../timeFormat.js';

/**
 * Member ownership: CheckoutView
 * Steps 5–7 — Review booking, pay, get confirmation.
 */
class CheckoutView extends View {
  _parentElement = document.querySelector('#checkout-view');
  _errorMessage = 'Checkout could not continue.';

  addHandlerConfirmReview(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="confirm-review"]')) handler();
    });
  }

  addHandlerPay(handler) {
    this._parentElement.addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target.closest('form');
      if (!form || form.dataset.form !== 'pay') return;
      const data = Object.fromEntries(new FormData(form).entries());
      handler(data.paymentMethod);
    });
  }

  addHandlerNav(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-nav]');
      if (!btn) return;
      handler(btn.dataset.nav);
    });
  }

  _formatCountdown(seconds) {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  _generateMarkup() {
    const { screen, hold, confirmation, paymentMethod, message, messageType, totals } =
      this._data;

    if (screen === 'review') {
      if (!hold) {
        return `
          <section class="panel">
            <div class="banner banner--error"><p>Hold missing or expired.</p></div>
            <button class="btn btn--ghost" type="button" data-nav="results">Back to venues</button>
          </section>`;
      }
      return `
        <section class="panel">
          <header class="panel__header">
            <p class="eyebrow">Step 5</p>
            <h2>Review booking</h2>
            <p class="lede">Check venue, court, date, time, and total before paying.</p>
          </header>
          ${
            message
              ? `<div class="banner banner--${messageType || 'info'}"><p>${message}</p></div>`
              : ''
          }
          <dl class="detail-list">
            <div><dt>Venue</dt><dd>${hold.venueName}</dd></div>
            <div><dt>Court</dt><dd>${hold.courtName}</dd></div>
            <div><dt>Date</dt><dd>${hold.date}</dd></div>
            <div><dt>Time</dt><dd>${formatSlotLabel(hold.slots || hold.slot)}</dd></div>
            <div><dt>Hours</dt><dd>${hold.hours || 1} × ₱${hold.pricePerHour || hold.totalPrice}</dd></div>
            <div><dt>Total price</dt><dd><strong>₱${hold.totalPrice}</strong></dd></div>
            <div><dt>Hold expires in</dt><dd><strong>${this._formatCountdown(hold.secondsLeft)}</strong></dd></div>
          </dl>
          <div class="btn-row">
            <button class="btn btn--primary" type="button" data-action="confirm-review">Confirm details</button>
            <button class="btn btn--ghost" type="button" data-nav="results">Cancel hold</button>
          </div>
        </section>`;
    }

    if (screen === 'pay') {
      if (!hold) {
        return `
          <section class="panel">
            <div class="banner banner--error"><p>Hold expired. Pick another slot.</p></div>
            <button class="btn btn--ghost" type="button" data-nav="results">Back to venues</button>
          </section>`;
      }
      return `
        <section class="panel">
          <header class="panel__header">
            <p class="eyebrow">Step 6</p>
            <h2>Pay</h2>
            <p class="lede">Pay within the hold window. Failed payment or timeout releases the slot.</p>
          </header>
          ${
            message
              ? `<div class="banner banner--${messageType || 'info'}"><p>${message}</p></div>`
              : ''
          }
          <div class="summary-strip">
            <p>${hold.venueName} · ${hold.courtName}</p>
            <p>${hold.date} @ ${formatSlotLabel(hold.slots || hold.slot)}</p>
            <p><strong>₱${hold.totalPrice}</strong> · hold ${this._formatCountdown(totals.holdSecondsLeft)}</p>
          </div>
          <form class="form" data-form="pay" novalidate>
            <label class="field">
              <span>Payment method <abbr title="required">*</abbr></span>
              <select name="paymentMethod" required>
                <option value="gcash" ${paymentMethod === 'gcash' ? 'selected' : ''}>GCash</option>
                <option value="maya" ${paymentMethod === 'maya' ? 'selected' : ''}>Maya</option>
                <option value="card" ${paymentMethod === 'card' ? 'selected' : ''}>Card</option>
                <option value="fail-demo">Fail payment (demo)</option>
              </select>
            </label>
            <button class="btn btn--primary" type="submit">Pay ₱${hold.totalPrice}</button>
          </form>
        </section>`;
    }

    // confirm
    if (!confirmation) {
      return `
        <section class="panel">
          <div class="banner banner--info"><p>No confirmation yet.</p></div>
          <button class="btn btn--ghost" type="button" data-nav="search">Search again</button>
        </section>`;
    }

    return `
      <section class="panel">
        <header class="panel__header">
          <p class="eyebrow">Step 7</p>
          <h2>Booking confirmation</h2>
          <p class="lede">Your booking is marked <strong>UNDER REVIEW</strong>.</p>
        </header>
        <div class="banner banner--success">
          <p>${confirmation.notice}</p>
        </div>
        <dl class="detail-list">
          <div><dt>Booking code</dt><dd><strong>${confirmation.code}</strong></dd></div>
          <div><dt>Status</dt><dd><span class="chip chip--warn">UNDER REVIEW</span></dd></div>
          <div><dt>Venue</dt><dd>${confirmation.venueName}</dd></div>
          <div><dt>Court</dt><dd>${confirmation.courtName}</dd></div>
          <div><dt>When</dt><dd>${confirmation.date} @ ${formatSlotLabel(confirmation.slots || confirmation.slot)}</dd></div>
          <div><dt>Paid</dt><dd>₱${confirmation.totalPrice} via ${confirmation.paymentMethod}</dd></div>
        </dl>
        <div class="btn-row">
          <button class="btn btn--primary" type="button" data-nav="myBookings">My bookings</button>
          <button class="btn btn--ghost" type="button" data-nav="search">Book another</button>
        </div>
      </section>`;
  }
}

export default new CheckoutView();
