import View from './View.js';
import { formatTime12 } from '../timeFormat.js';

/**
 * Owner Admin — Step 5: Manage availability (block slots, update hours/prices).
 */
class AdminAvailabilityView extends View {
  _parentElement = document.querySelector('#admin-availability-view');

  addHandlerBlock(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="block-slot"]');
      if (!form) return;
      e.preventDefault();
      handler(Object.fromEntries(new FormData(form).entries()));
    });
  }

  addHandlerUnblock(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-unblock]');
      if (!btn) return;
      handler(btn.dataset.unblock);
    });
  }

  addHandlerUpdateHours(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="update-hours"]');
      if (!form) return;
      e.preventDefault();
      handler(Object.fromEntries(new FormData(form).entries()));
    });
  }

  addHandlerNav(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-admin-step]');
      if (!btn) return;
      handler(btn.dataset.adminStep);
    });
  }

  _generateMarkup() {
    const { message, messageType, venues, blockedSlots, editingVenueId } = this._data;
    const venueOptions = (venues || [])
      .map(
        v =>
          `<option value="${v.id}" ${v.id === editingVenueId ? 'selected' : ''}>${v.name}</option>`
      )
      .join('');

    const activeVenue =
      (venues || []).find(v => v.id === editingVenueId) || (venues || [])[0];
    const courtOptions = (activeVenue?.courts || [])
      .map(c => `<option value="${c.id}">${c.name}</option>`)
      .join('');
    const slotOptions = (activeVenue?.slots || [])
      .map(s => `<option value="${s}">${formatTime12(s)}</option>`)
      .join('');

    const blocks = (blockedSlots || [])
      .map(b => {
        const v = (venues || []).find(x => x.id === b.venueId);
        const c = v?.courts?.find(x => x.id === b.courtId);
        return `
          <article class="admin-venue-row">
            <div>
              <strong>${v?.name || b.venueId} · ${c?.name || b.courtId}</strong>
              <p class="muted">${b.date} @ ${formatTime12(b.slot)} — ${b.reason}</p>
            </div>
            <button type="button" class="btn btn--ghost" data-unblock="${b.id}">Unblock</button>
          </article>`;
      })
      .join('');

    return `
      <section class="panel admin-panel">
        <div class="panel__header">
          <p class="eyebrow">Owner Admin · Step 5</p>
          <h2>Manage availability</h2>
          <p class="lede">Block slots for maintenance, private events, or holidays. Update prices or hours anytime.</p>
        </div>

        ${
          message
            ? `<p class="flash flash--${messageType || 'info'}" role="status">${message}</p>`
            : ''
        }

        ${
          !venues?.length
            ? `<p class="flash flash--info">Add a venue first.</p>`
            : `
        <form class="form form__stack" data-form="block-slot">
          <h3 class="subhead">Block a slot</h3>
          <label>Venue
            <select name="venueId" required>${venueOptions}</select>
          </label>
          <label>Court
            <select name="courtId" required>${courtOptions || '<option value="">No courts</option>'}</select>
          </label>
          <div class="form__grid">
            <label>Date
              <input name="date" type="date" required />
            </label>
            <label>Time slot
              <select name="slot" required>${slotOptions || '<option value="">—</option>'}</select>
            </label>
          </div>
          <label>Reason
            <select name="reason">
              <option>Maintenance</option>
              <option>Private event</option>
              <option>Holiday</option>
              <option>Other</option>
            </select>
          </label>
          <button type="submit" class="btn btn--primary">Block slot</button>
        </form>

        <form class="form form__stack" data-form="update-hours">
          <h3 class="subhead">Update hours / price</h3>
          <input type="hidden" name="venueId" value="${activeVenue?.id || ''}" />
          <div class="form__grid">
            <label>Opening hours
              <input name="openingHours" value="${activeVenue?.openingHours || '07:00–19:00'}" />
            </label>
            <label>Base price / hour (₱)
              <input name="pricePerHour" type="number" min="1" value="${activeVenue?.pricePerHour || 250}" />
            </label>
          </div>
          <label>Contact
            <input name="contact" value="${activeVenue?.contact || ''}" />
          </label>
          <button type="submit" class="btn btn--secondary">Save hours / price</button>
        </form>

        <h3 class="subhead">Blocked slots</h3>
        <div class="stack">${blocks || '<p class="muted">No blocked slots.</p>'}</div>
        `
        }

        <div class="actions-row">
          <button type="button" class="btn btn--ghost" data-admin-step="adminHome">Dashboard</button>
          <button type="button" class="btn btn--secondary" data-admin-step="adminBookings">Bookings →</button>
        </div>
      </section>
    `;
  }
}

export default new AdminAvailabilityView();
