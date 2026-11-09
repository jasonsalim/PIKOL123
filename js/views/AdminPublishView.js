import View from './View.js';

/**
 * Owner Admin — Step 4: Review & publish venue.
 */
class AdminPublishView extends View {
  _parentElement = document.querySelector('#admin-publish-view');

  addHandlerPublish(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="publish-venue"]')) handler();
    });
  }

  addHandlerUnpublish(handler) {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('[data-unpublish]');
      if (!btn) return;
      handler(btn.dataset.unpublish);
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
          <p class="eyebrow">Owner Admin · Step 4</p>
          <h2>Publish venue</h2>
          <p class="flash flash--info">Select or create a venue first.</p>
          <button type="button" class="btn btn--primary" data-admin-step="adminHome">Dashboard</button>
        </section>`;
    }

    const courts = (venue.courts || [])
      .map(
        c =>
          `<li><strong>${c.name}</strong> — ${c.indoorOutdoor}, ${c.surface || '—'}, ₱${c.pricePerHour}/hr</li>`
      )
      .join('');

    return `
      <section class="panel admin-panel">
        <div class="panel__header">
          <p class="eyebrow">Owner Admin · Step 4</p>
          <h2>Review &amp; publish</h2>
          <p class="lede">Check all details. After publishing, courts appear in player searches.</p>
        </div>

        ${
          message
            ? `<p class="flash flash--${messageType || 'info'}" role="status">${message}</p>`
            : ''
        }

        <div class="location-card">
          <h3>${venue.name}</h3>
          <p class="muted">${venue.address}</p>
          <ul class="meta">
            <li>Map: ${venue.mapPin || venue.mapHint || '—'}</li>
            <li>Hours: ${venue.openingHours || '—'}</li>
            <li>Contact: ${venue.contact || '—'}</li>
            <li>Status: ${venue.published ? 'Published' : 'Draft'}</li>
          </ul>
          ${
            venue.image || venue.logo
              ? `<img class="admin-preview" src="${venue.image || venue.logo}" alt="${venue.name}" />`
              : ''
          }
          <h4 class="subhead">Courts</h4>
          <ul>${courts || '<li class="muted">No courts</li>'}</ul>
        </div>

        <div class="actions-row">
          <button type="button" class="btn btn--ghost" data-admin-step="adminCourts">← Courts</button>
          ${
            venue.published
              ? `<button type="button" class="btn btn--secondary" data-unpublish="${venue.id}">Unpublish</button>`
              : `<button type="button" class="btn btn--primary" data-action="publish-venue">Publish venue</button>`
          }
          <button type="button" class="btn btn--secondary" data-admin-step="adminHome">Dashboard</button>
        </div>
      </section>
    `;
  }
}

export default new AdminPublishView();
