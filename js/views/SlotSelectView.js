import View from './View.js';
import { formatTime12, formatSlotLabel } from '../timeFormat.js';

/**
 * Member ownership: SlotSelectView
 * Tap times to highlight; total = hours × pricePerHour (e.g. 6–8 AM = 3 hrs × ₱250 = ₱750).
 */
class SlotSelectView extends View {
  _parentElement = document.querySelector('#slot-view');
  _errorMessage = 'Could not hold that slot.';

  addHandlerSelectCourt(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-court-id]');
      if (!btn) return;
      handler(btn.dataset.courtId);
    });
  }

  addHandlerToggleSlot(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-slot]');
      if (!btn) return;
      handler(btn.dataset.slot);
    });
  }

  addHandlerHoldSelected(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="hold-selected"]')) handler();
    });
  }

  addHandlerBack(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="back-results"]')) handler();
    });
  }

  _generateMarkup() {
    const venue = this._data.venue;
    const { selectedCourtId, selectedSlots, selection, message, messageType } =
      this._data;

    if (!venue) {
      return `
        <section class="panel">
          <div class="banner banner--error"><p>No court selected.</p></div>
          <button class="btn btn--ghost" type="button" data-action="back-results">Back to courts</button>
        </section>
      `;
    }

    const selected =
      venue.courts.find(c => c.id === selectedCourtId) || venue.courts[0];
    const picked = selectedSlots || [];
    const summary = selection || {
      hours: 0,
      totalPrice: 0,
      pricePerHour: venue.pricePerHour,
      label: '',
    };

    const slots = (selected?.openSlots || [])
      .map(slot => {
        const isOn = picked.includes(slot);
        return `
          <button
            class="slot-btn ${isOn ? 'slot-btn--selected' : ''}"
            type="button"
            data-slot="${slot}"
            aria-pressed="${isOn ? 'true' : 'false'}"
          >
            ${formatTime12(slot)}
          </button>`;
      })
      .join('');

    const selectedLabel = summary.label
      ? formatSlotLabel(summary.label)
      : formatSlotLabel(picked);

    return `
      <section class="panel">
        <header class="panel__header">
          <p class="eyebrow">Court details · Mati City</p>
          <h2>${venue.name}</h2>
          <p class="lede">₱${venue.pricePerHour}/hr · ${venue.indoorOutdoor} · ${venue.date}</p>
        </header>

        ${
          message
            ? `<div class="banner banner--${messageType || 'info'}"><p>${message}</p></div>`
            : ''
        }

        ${
          venue.image
            ? `<figure class="court-hero">
                <img src="${venue.image}" alt="Photo of ${venue.name}" />
                <figcaption>Court photo — ${venue.name} (${venue.indoorOutdoor})</figcaption>
              </figure>`
            : ''
        }

        <div class="location-card">
          <h3 class="subhead">Location</h3>
          <dl class="detail-list">
            <div><dt>Address</dt><dd>${venue.address}</dd></div>
            <div><dt>Barangay</dt><dd>${venue.barangay || '—'}</dd></div>
            <div><dt>Landmark</dt><dd>${venue.landmark || '—'}</dd></div>
            <div><dt>How to find</dt><dd>${venue.mapHint || '—'}</dd></div>
            <div><dt>City</dt><dd>Mati City, Davao Oriental</dd></div>
          </dl>
        </div>

        <div class="stack">
          <div>
            <h3 class="subhead">Available times — ${selected?.name || 'court'}</h3>
            <div class="slot-grid">
              ${slots || '<p class="muted">No open slots on this court for that date.</p>'}
            </div>
            <p class="hint">Tap each hour you want (example: 6:00 AM, 7:00 AM, 8:00 AM). Total updates automatically.</p>
          </div>

          <div class="payment-total ${summary.hours ? 'is-active' : ''}">
            <div>
              <p class="payment-total__label">Selected</p>
              <p class="payment-total__slots">${selectedLabel || 'None yet'}</p>
            </div>
            <div>
              <p class="payment-total__label">Hours × rate</p>
              <p>${summary.hours || 0} × ₱${summary.pricePerHour}</p>
            </div>
            <div>
              <p class="payment-total__label">Total payment</p>
              <p class="payment-total__amount">₱${summary.totalPrice || 0}</p>
            </div>
          </div>

          <button
            class="btn btn--primary"
            type="button"
            data-action="hold-selected"
            ${summary.hours ? '' : 'disabled'}
          >
            Hold ${summary.hours || 0} hour(s) · ₱${summary.totalPrice || 0}
          </button>
        </div>

        <button class="btn btn--ghost" type="button" data-action="back-results">Back to courts</button>
      </section>
    `;
  }
}

export default new SlotSelectView();
