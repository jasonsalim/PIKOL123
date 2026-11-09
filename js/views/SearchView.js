import View from './View.js';

/**
 * Member ownership: SearchView
 * Search bar + filters only. Court suggestions live in VenueListView below.
 */
class SearchView extends View {
  _parentElement = document.querySelector('#search-view');
  _errorMessage = 'Please complete the required search fields.';

  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', e => {
      e.preventDefault();
      const form = e.target.closest('form');
      if (!form) return;
      const data = Object.fromEntries(new FormData(form).entries());
      handler(data);
    });
  }

  addHandlerToggleFilters(handler) {
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('[data-action="toggle-filters"]')) handler();
    });
  }

  _generateMarkup() {
    const { search, message, messageType, screen, filtersOpen } = this._data;
    const showBanner = message && (screen === 'search' || screen === 'results');

    return `
      <section class="panel panel--search">
        <header class="panel__header">
          <p class="eyebrow">Mati City · Davao Oriental</p>
          <h2>Find a pickleball court</h2>
          <p class="lede">Suggested courts are listed below. Search a name to highlight a match, or use Filters to narrow the list.</p>
        </header>

        ${
          showBanner
            ? `<div class="banner banner--${messageType || 'info'}"><p>${message}</p></div>`
            : ''
        }

        <form class="form form--browse" novalidate>
          <div class="search-stack">
            <div class="search-bar-row">
              <label class="field field--search">
                <span class="sr-only">Search Mati courts</span>
                <input
                  class="search-input"
                  type="search"
                  name="query"
                  value="${search.query || ''}"
                  placeholder="Search court name (e.g. Rafas, Courtside)"
                  autocomplete="off"
                />
              </label>
              <button class="btn btn--primary btn--search" type="submit">Search</button>
              <button
                class="btn btn--ghost btn--filters ${filtersOpen ? 'is-open' : ''}"
                type="button"
                data-action="toggle-filters"
                aria-expanded="${filtersOpen ? 'true' : 'false'}"
              >
                Filters ${filtersOpen ? '▴' : '▾'}
              </button>
            </div>

            <div class="filters-panel ${filtersOpen ? 'is-open' : ''}" ${filtersOpen ? '' : 'hidden'}>
              <h3 class="subhead">Filters</h3>
              <div class="filters-row">
                <label class="field">
                  <span>Date <abbr title="required">*</abbr></span>
                  <input type="date" name="date" value="${search.date || ''}" ${filtersOpen ? 'required' : ''} />
                </label>

                <label class="field">
                  <span>Max price / hour</span>
                  <input type="number" name="maxPrice" min="0" step="50" placeholder="e.g. 400" value="${search.maxPrice ?? ''}" />
                </label>

                <label class="field">
                  <span>Indoor / outdoor</span>
                  <select name="indoorOutdoor">
                    <option value="any" ${search.indoorOutdoor === 'any' ? 'selected' : ''}>Any</option>
                    <option value="indoor" ${search.indoorOutdoor === 'indoor' ? 'selected' : ''}>Indoor</option>
                    <option value="outdoor" ${search.indoorOutdoor === 'outdoor' ? 'selected' : ''}>Outdoor</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </form>
      </section>
    `;
  }
}

export default new SearchView();
