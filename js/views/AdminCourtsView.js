import View from './View.js';

/**
 * Owner Admin — Step 3: Add courts, pricing, slot duration.
 */
class AdminCourtsView extends View {
  _parentElement = document.querySelector('#admin-courts-view');

  addHandlerAdd(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="owner-court"]');
      if (!form) return;
      e.preventDefault();
      handler(Object.fromEntries(new FormData(form).entries()));
      form.reset();
    });
  }

  addHandlerRemove(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-remove-court]');
      if (!btn) return;
      handler(btn.dataset.removeCourt);
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
    const { message, messageType, venue } = this._data;
    if (!venue) {
      return `
        <section class="panel admin-panel">
          <p class="eyebrow">Owner Admin · Step 3</p>
          <h2>Add courts</h2>
          <p class="flash flash--info">Save a venue first.</p>
          <button type="button" class="btn btn--primary" data-admin-step="adminVenue">Add venue</button>
        </section>`;
    }

    const courts = (venue.courts || [])
      .map(
        c => `
        <article class="admin-venue-row">
          <div>
            <strong>${c.name}</strong>
            <p class="muted">${c.indoorOutdoor} · ${c.surface || '—'} · ₱${c.pricePerHour}/hr
              ${c.peakPrice ? ` · peak ₱${c.peakPrice}` : ''}
              ${c.offPeakPrice ? ` · off-peak ₱${c.offPeakPrice}` : ''}
            </p>
          </div>
          <button type="button" class="btn btn--ghost" data-remove-court="${c.id}">Remove</button>
        </article>`
      )
      .join('');

    return `
      <section class="panel admin-panel">
        <div class="panel__header">
          <p class="eyebrow">Owner Admin · Step 3</p>
          <h2>Add courts — ${venue.name}</h2>
          <p class="lede">Name, indoor/outdoor, surface, price per hour, peak/off-peak, slot duration.</p>
        </div>

        ${
          message
            ? `<p class="flash flash--${messageType || 'info'}" role="status">${message}</p>`
            : ''
        }

        <div class="stack">${courts || '<p class="muted">No courts yet.</p>'}</div>

        <form class="form form__stack" data-form="owner-court">
          <label>Court name
            <input name="name" required placeholder="Court A" />
          </label>
          <div class="form__grid">
            <label>Indoor / outdoor
              <select name="indoorOutdoor">
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
              </select>
            </label>
            <label>Surface
              <select name="surface">
                <option value="concrete">Concrete</option>
                <option value="asphalt">Asphalt</option>
                <option value="wood">Wood</option>
                <option value="synthetic">Synthetic</option>
              </select>
            </label>
          </div>
          <div class="form__grid">
            <label>Price / hour (₱)
              <input name="pricePerHour" type="number" min="1" required value="250" />
            </label>
            <label>Slot duration (hours)
              <input name="slotDurationHours" type="number" min="1" value="${venue.slotDurationHours || 1}" />
            </label>
          </div>
          <div class="form__grid">
            <label>Peak rate (₱, optional)
              <input name="peakPrice" type="number" min="1" placeholder="same as base" />
            </label>
            <label>Off-peak rate (₱, optional)
              <input name="offPeakPrice" type="number" min="1" placeholder="same as base" />
            </label>
          </div>
          <button type="submit" class="btn btn--primary">Add court</button>
        </form>

        <div class="actions-row">
          <button type="button" class="btn btn--ghost" data-admin-step="adminVenue">← Venue</button>
          <button type="button" class="btn btn--secondary" data-admin-step="adminPublish">Next: Publish →</button>
        </div>
      </section>
    `;
  }
}

export default new AdminCourtsView();
