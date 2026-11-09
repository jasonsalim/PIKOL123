import View from './View.js';

/**
 * Owner Admin hub — jump to steps 2–7.
 */
class AdminHomeView extends View {
  _parentElement = document.querySelector('#admin-home-view');

  addHandlerNav(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-admin-step]');
      if (!btn) return;
      handler(btn.dataset.adminStep);
    });
  }

  addHandlerSelectVenue(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-edit-venue]');
      if (!btn) return;
      handler(btn.dataset.editVenue);
    });
  }

  addHandlerLogout(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="owner-logout"]')) handler();
    });
  }

  addHandlerNewVenue(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="new-venue"]')) handler();
    });
  }

  _generateMarkup() {
    const { message, messageType, dash } = this._data;
    const owner = dash.owner;
    const venues = dash.venues || [];

    const venueRows = venues.length
      ? venues
          .map(
            v => `
          <article class="admin-venue-row">
            <div>
              <strong>${v.name}</strong>
              <p class="muted">${v.barangay} · ${v.courts?.length || 0} court(s) · ₱${v.pricePerHour}/hr</p>
            </div>
            <div class="admin-venue-row__actions">
              ${v.published ? '<span class="chip chip--ok">Published</span>' : '<span class="chip chip--warn">Draft</span>'}
              <button type="button" class="btn btn--secondary" data-edit-venue="${v.id}" data-admin-step="adminVenue">Edit</button>
            </div>
          </article>`
          )
          .join('')
      : '<p class="muted">No venues yet — add your first venue.</p>';

    return `
      <section class="panel admin-panel">
        <div class="panel__header admin-home-head">
          <div>
            <p class="eyebrow">Owner Admin</p>
            <h2>Hello, ${owner?.name || 'Owner'}</h2>
            <p class="lede">${owner?.businessName || ''} · manage venues, availability, and bookings.</p>
          </div>
          <button type="button" class="btn btn--ghost" data-action="owner-logout">Log out</button>
        </div>

        ${
          message
            ? `<p class="flash flash--${messageType || 'info'}" role="status">${message}</p>`
            : ''
        }

        <div class="admin-stats">
          <div><span class="admin-stats__n">${dash.publishedCount}</span><span>Published</span></div>
          <div><span class="admin-stats__n">${dash.draftCount}</span><span>Drafts</span></div>
          <div><span class="admin-stats__n">${dash.underReview?.length || 0}</span><span>Under review</span></div>
          <div><span class="admin-stats__n">${dash.confirmed?.length || 0}</span><span>Confirmed</span></div>
        </div>

        <ol class="admin-flow">
          <li>
            <button type="button" class="btn btn--primary" data-action="new-venue">2. Add venue</button>
            <p class="hint">Name, city, address, map pin, photos, hours, contact</p>
          </li>
          <li>
            <button type="button" class="btn btn--secondary" data-admin-step="adminCourts">3. Add courts</button>
            <p class="hint">Indoor/outdoor, surface, price, peak/off-peak, slot duration</p>
          </li>
          <li>
            <button type="button" class="btn btn--secondary" data-admin-step="adminPublish">4. Publish venue</button>
            <p class="hint">Review details — courts appear in player search</p>
          </li>
          <li>
            <button type="button" class="btn btn--secondary" data-admin-step="adminAvailability">5. Manage availability</button>
            <p class="hint">Block slots for maintenance, events, holidays</p>
          </li>
          <li>
            <button type="button" class="btn btn--secondary" data-admin-step="adminBookings">6–7. Receive &amp; review bookings</button>
            <p class="hint">UNDER REVIEW → approve to CONFIRMED</p>
          </li>
        </ol>

        <h3 class="subhead">Your venues</h3>
        <div class="stack">${venueRows}</div>
      </section>
    `;
  }
}

export default new AdminHomeView();
