import View from './View.js';

/**
 * Owner Admin — Step 2: Add venue.
 */
class AdminVenueView extends View {
  _parentElement = document.querySelector('#admin-venue-view');

  addHandlerSave(handler) {
    this._parentElement.addEventListener('submit', e => {
      const form = e.target.closest('form[data-form="owner-venue"]');
      if (!form) return;
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const logoFile = form.querySelector('[name="logoFile"]')?.files?.[0];
      const imageFile = form.querySelector('[name="imageFile"]')?.files?.[0];

      const readFile = file =>
        new Promise(resolve => {
          if (!file) return resolve('');
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

      Promise.all([readFile(logoFile), readFile(imageFile)]).then(([logoData, imageData]) => {
        handler({
          ...data,
          logo: logoData || data.logoUrl || '',
          image: imageData || data.imageUrl || '',
        });
      });
    });
  }

  addHandlerBack(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-admin-step]')) {
        handler(e.target.closest('[data-admin-step]').dataset.adminStep);
      }
    });
  }

  _generateMarkup() {
    const { message, messageType, venue } = this._data;
    const v = venue || {};

    return `
      <section class="panel admin-panel">
        <div class="panel__header">
          <p class="eyebrow">Owner Admin · Step 2</p>
          <h2>${v.id ? 'Edit venue' : 'Add venue'}</h2>
          <p class="lede">Enter venue name, city, address, map location, photos, hours, and contact.</p>
        </div>

        ${
          message
            ? `<p class="flash flash--${messageType || 'info'}" role="status">${message}</p>`
            : ''
        }

        <form class="form form__stack" data-form="owner-venue">
          <input type="hidden" name="venueId" value="${v.id || ''}" />
          <label>Venue name
            <input name="name" required value="${v.name || ''}" placeholder="Courtside" />
          </label>
          <label>City
            <input name="city" value="Mati" readonly />
          </label>
          <label>Barangay
            <input name="barangay" value="${v.barangay || ''}" placeholder="Matiao" />
          </label>
          <label>Address
            <input name="address" required value="${v.address || ''}" placeholder="Street, barangay, Mati City" />
          </label>
          <label>Map pin (lat, lng or place note)
            <input name="mapPin" value="${v.mapPin || ''}" placeholder="7.0105, 126.3408" />
          </label>
          <label>Map / location hint
            <input name="mapHint" value="${v.mapHint || ''}" placeholder="Beside plaza parking" />
          </label>
          <label>Landmark
            <input name="landmark" value="${v.landmark || ''}" />
          </label>
          <div class="form__grid">
            <label>Opening hours
              <input name="openingHours" value="${v.openingHours || '07:00–19:00'}" placeholder="07:00–19:00" />
            </label>
            <label>Contact
              <input name="contact" required value="${v.contact || ''}" placeholder="0917…" />
            </label>
          </div>
          <label>Primary type
            <select name="indoorOutdoor">
              <option value="outdoor" ${v.indoorOutdoor !== 'indoor' ? 'selected' : ''}>Outdoor</option>
              <option value="indoor" ${v.indoorOutdoor === 'indoor' ? 'selected' : ''}>Indoor</option>
            </select>
          </label>
          <div class="form__grid">
            <label>Logo URL (optional)
              <input name="logoUrl" value="${(v.logo || '').startsWith('data:') ? '' : v.logo || ''}" placeholder="images/logos/…" />
            </label>
            <label>Upload logo
              <input name="logoFile" type="file" accept="image/*" />
            </label>
          </div>
          <div class="form__grid">
            <label>Court photo URL (optional)
              <input name="imageUrl" value="${(v.image || '').startsWith('data:') ? '' : v.image || ''}" placeholder="images/courts/…" />
            </label>
            <label>Upload court photo
              <input name="imageFile" type="file" accept="image/*" />
            </label>
          </div>
          <div class="actions-row">
            <button type="button" class="btn btn--ghost" data-admin-step="adminHome">Back</button>
            <button type="submit" class="btn btn--primary">Save venue → Courts</button>
          </div>
        </form>
      </section>
    `;
  }
}

export default new AdminVenueView();
