import View from './View.js';
import { formatSlotLabel } from '../timeFormat.js';

/**
 * Member ownership: MyBookingsView
 * Step 8 — Cancel or reschedule bookings; also supports edit notes + delete (CRUD).
 */
class MyBookingsView extends View {
  _parentElement = document.querySelector('#bookings-view');
  _errorMessage = 'No bookings yet.';

  addHandlerCancel(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-cancel]');
      if (!btn) return;
      handler(btn.dataset.cancel);
    });
  }

  addHandlerReschedule(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="reschedule"]');
      if (!form) return;
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      handler(form.dataset.bookingId, data.newDate, data.newSlot);
    });
  }

  addHandlerEditNotes(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="notes"]');
      if (!form) return;
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      handler(form.dataset.bookingId, data.notes);
    });
  }

  addHandlerDelete(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-delete]');
      if (!btn) return;
      handler(btn.dataset.delete);
    });
  }

  addHandlerConfirmStatus(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-confirm-status]');
      if (!btn) return;
      handler(btn.dataset.confirmStatus);
    });
  }

  _statusChip(status) {
    if (status === 'under_review') return '<span class="chip chip--warn">UNDER REVIEW</span>';
    if (status === 'confirmed') return '<span class="chip chip--ok">CONFIRMED</span>';
    return '<span class="chip">CANCELLED</span>';
  }

  _generateMarkup() {
    const { bookings, message, messageType, totals } = this._data;

    const rows = bookings
      .map(b => {
        const canManage = b.status !== 'cancelled';
        return `
          <article class="booking-card">
            <div class="booking-card__head">
              <div>
                <h3>${b.venueName} · ${b.courtName}</h3>
                <p class="muted">${b.code}</p>
              </div>
              ${this._statusChip(b.status)}
            </div>
            <ul class="meta">
              <li>${b.date} @ ${formatSlotLabel(b.slots || b.slot)}</li>
              <li>₱${b.totalPrice}</li>
              <li>${b.city}</li>
            </ul>
            ${
              b.refundNote
                ? `<p class="hint">${b.refundNote}</p>`
                : ''
            }
            ${
              canManage
                ? `
              <div class="booking-actions">
                <button class="btn btn--secondary" type="button" data-cancel="${b.id}">Cancel booking</button>
                ${
                  b.status === 'under_review'
                    ? `<button class="btn btn--ghost" type="button" data-confirm-status="${b.id}">Mark confirmed (demo)</button>`
                    : ''
                }
                <form class="form form--inline" data-form="reschedule" data-booking-id="${b.id}">
                  <label class="field">
                    <span>Reschedule date</span>
                    <input type="date" name="newDate" required />
                  </label>
                  <label class="field">
                    <span>New time</span>
                    <input type="time" name="newSlot" step="3600" required />
                  </label>
                  <button class="btn btn--secondary" type="submit">Reschedule</button>
                </form>
                <form class="form form--inline" data-form="notes" data-booking-id="${b.id}">
                  <label class="field field--grow">
                    <span>Edit notes</span>
                    <input type="text" name="notes" value="${b.notes || ''}" placeholder="Optional notes" />
                  </label>
                  <button class="btn btn--ghost" type="submit">Save notes</button>
                </form>
              </div>`
                : `
              <div class="booking-actions">
                <button class="btn btn--ghost" type="button" data-delete="${b.id}">Delete from list</button>
              </div>`
            }
          </article>`;
      })
      .join('');

    return `
      <section class="panel">
        <header class="panel__header">
          <p class="eyebrow">Step 8</p>
          <h2>My bookings</h2>
          <p class="lede">Cancel within the window for a refund, or reschedule to release/rebook a slot.</p>
        </header>

        ${
          message
            ? `<div class="banner banner--${messageType || 'info'}"><p>${message}</p></div>`
            : ''
        }

        <div class="summary-strip">
          <p><strong>${totals.bookingCount}</strong> active</p>
          <p><strong>${totals.underReview}</strong> under review</p>
          <p><strong>₱${totals.totalSpent}</strong> total · avg ₱${totals.avgPrice}</p>
        </div>

        <div class="booking-list">
          ${rows || '<p class="muted">No bookings yet. Search for a court to get started.</p>'}
        </div>
      </section>
    `;
  }
}

export default new MyBookingsView();
