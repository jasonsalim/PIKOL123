import View from './View.js';

/**
 * Member ownership: VenueListView
 * Shows suggested Mati courts by default; search highlights matches or shows None.
 */
class VenueListView extends View {
  _parentElement = document.querySelector('#results-view');
  _errorMessage = 'None — no courts match your search.';

  addHandlerSelectVenue(handler) {
    this._parentElement.addEventListener('click', e => {
      const target = e.target.closest('[data-venue-id]');
      if (!target) return;
      e.preventDefault();
      handler(target.dataset.venueId);
    });
  }

  addHandlerBack(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="back-search"]')) handler();
    });
  }

  _photoLabel(kind) {
    return kind === 'indoor' ? 'Indoor' : 'Outdoor';
  }

  _cardMarkup(v, search, { highlighted = false, suggested = false } = {}) {
    const typeLabel = this._photoLabel(v.indoorOutdoor);
    const dateLabel = v.filterDate || search.date || 'Set date in Filters';
    const thumb = v.logo || v.image;
    const photo = thumb
      ? `<div class="venue-card__photo venue-card__photo--real ${v.logo ? 'venue-card__photo--logo' : ''}">
            <img src="${thumb}" alt="${v.name} logo" loading="lazy" />
            <span class="venue-card__badge">${typeLabel}</span>
          </div>`
      : `<div class="venue-card__photo venue-card__photo--${v.photo}" aria-hidden="true">
            <span>${typeLabel}</span>
          </div>`;

    return `
      <article class="venue-card ${highlighted ? 'venue-card--highlight' : ''} ${suggested ? 'venue-card--suggested' : ''}" data-venue-id="${v.id}" role="button" tabindex="0">
        ${photo}
        <div class="venue-card__body">
          <div class="venue-card__top">
            <h3>${v.name}</h3>
            ${
              highlighted
                ? '<span class="chip chip--ok">Match</span>'
                : suggested
                  ? '<span class="chip">Suggested</span>'
                  : `<span class="chip chip--ok">${v.totalOpen ?? '—'} open</span>`
            }
          </div>
          <p class="muted">${v.barangay || 'Mati'} · ${v.address}</p>
          <ul class="court-filter-infos">
            <li>
              <span class="court-filter-infos__label">Date</span>
              <strong>${dateLabel}</strong>
            </li>
            <li>
              <span class="court-filter-infos__label">Price / hour</span>
              <strong>₱${v.filterPrice ?? v.pricePerHour}</strong>
            </li>
            <li>
              <span class="court-filter-infos__label">Indoor / outdoor</span>
              <strong>${typeLabel}</strong>
            </li>
          </ul>
          <span class="btn btn--secondary venue-card__cta">View location & times</span>
        </div>
      </article>
    `;
  }

  _generateMarkup() {
    const {
      results,
      suggestions,
      search,
      message,
      messageType,
      totals,
      hasSearched,
    } = this._data;

    // Searched but nothing matched
    if (hasSearched && !results.length) {
      return `
        <section class="panel panel--results">
          <header class="panel__header">
            <p class="eyebrow">Available courts</p>
            <h2>Available pickleball courts</h2>
          </header>
          <div class="banner banner--error">
            <p>${message || this._errorMessage}</p>
          </div>
          <p class="muted results-empty">None</p>
        </section>
      `;
    }

    // Searched with matches — highlight them
    if (hasSearched && results.length) {
      const cards = results
        .map(v => this._cardMarkup(v, search, { highlighted: true }))
        .join('');

      return `
        <section class="panel panel--results">
          <header class="panel__header">
            <p class="eyebrow">Available courts</p>
            <h2>Search results</h2>
            <p class="lede">Highlighted courts match your search${search.query ? ` for “${search.query}”` : ''}.</p>
          </header>

          ${
            message
              ? `<div class="banner banner--${messageType || 'info'}"><p>${message}</p></div>`
              : ''
          }

          <div class="summary-strip">
            <p><strong>${totals.resultsCount}</strong> match(es)</p>
            <p>Date <strong>${search.date}</strong></p>
            <p>City <strong>Mati</strong></p>
          </div>

          <div class="venue-grid">${cards}</div>
        </section>
      `;
    }

    // Default: suggest all 5 courts
    const cards = (suggestions || [])
      .map(v => this._cardMarkup(v, search, { suggested: true }))
      .join('');

    return `
      <section class="panel panel--results">
        <header class="panel__header">
          <p class="eyebrow">Available courts</p>
          <h2>Suggested courts in Mati</h2>
          <p class="lede">These 5 courts are ready to book. Search a name above to highlight one, or open Filters then Search.</p>
        </header>

        <div class="summary-strip">
          <p><strong>${(suggestions || []).length}</strong> suggested</p>
          <p>City <strong>Mati</strong></p>
        </div>

        <div class="venue-grid">${cards}</div>
      </section>
    `;
  }
}

export default new VenueListView();
