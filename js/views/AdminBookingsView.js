import View from './View.js';
import { formatSlotLabel } from '../timeFormat.js';

/**
 * Owner Admin — Steps 6–7: Receive bookings (UNDER REVIEW) and approve → CONFIRMED.
 */
class AdminBookingsView extends View {
  _parentElement = document.querySelector('#admin-bookings-view');

  addHandlerApprove(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-approve]');
      if (!btn) return;
      handler(btn.dataset.approve);
    });
  }

  addHandlerReject(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-reject]');
      if (!btn) return;
      handler(btn.dataset.reject);
    });
  }

  addHandlerNav(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-admin-step]');
      if (!btn) return;
      handler(btn.dataset.adminStep);
    });
  }

  _statusChip(status) {
    if (status === 'under_review') return '<span class="chip chip--warn">UNDER REVIEW</span>';
    if (status === 'confirmed') return '<span class="chip chip--ok">CONFIRMED</span>';
    return '<span class="chip">CANCELLED</span>';
  }

  _generateMarkup() {
    const { message, messageType, bookings } = this._data;
    const list = bookings || [];
    const pending = list.filter(b => b.status === 'under_review');
    const others = list.filter(b => b.status !== 'under_review');

    const card = b => `
      <article class="booking-card">
        <div class="booking-card__head">
          <div>
            <h3>${b.venueName} · ${b.courtName}</h3>
            <p class="muted">${b.code}</p>
          </div>
          ${this._statusChip(b.status)}
        </div>
        <ul class="meta">
          <li>Player: ${b.playerName || 'Guest'} (${b.playerContact || '—'})</li>
          <li>${b.date} @ ${formatSlotLabel(b.slots || b.slot)}</li>
          <li>₱${b.totalPrice} · ${b.paymentMethod || '—'} · ${b.paymentStatus || 'unpaid'}</li>
        </ul>
        ${
          b.status === 'under_review'
            ? `<div class="actions-row">
                <button type="button" class="btn btn--primary" data-approve="${b.id}">Approve → CONFIRMED</button>
                <button type="button" class="btn btn--ghost" data-reject="${b.id}">Decline</button>
              </div>`
            : b.ownerNote
              ? `<p class="hint">${b.ownerNote}</p>`
              : ''
        }
      </article>`;

    return `
      <section class="panel admin-panel">
        <div class="panel__header">
          <p class="eyebrow">Owner Admin · Steps 6–7</p>
          <h2>Receive &amp; review bookings</h2>
          <p class="lede">New bookings arrive as UNDER REVIEW. Approve to notify the player as CONFIRMED.</p>
        </div>

        ${
          message
            ? `<p class="flash flash--${messageType || 'info'}" role="status">${message}</p>`
            : ''
        }

        <h3 class="subhead">Under review (${pending.length})</h3>
        <div class="stack">
          ${pending.length ? pending.map(card).join('') : '<p class="muted">No new bookings waiting.</p>'}
        </div>

        <h3 class="subhead">Other bookings</h3>
        <div class="stack">
          ${others.length ? others.map(card).join('') : '<p class="muted">None yet.</p>'}
        </div>

        <div class="actions-row">
          <button type="button" class="btn btn--ghost" data-admin-step="adminHome">Dashboard</button>
        </div>
      </section>
    `;
  }
}

export default new AdminBookingsView();
