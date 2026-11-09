import View from './View.js';

/**
 * Derived-value strip — totals recompute whenever bookings / hold / results change.
 * Shared chrome (not tied to a single member feature).
 */
class SummaryView extends View {
  _parentElement = document.querySelector('#summary-view');

  _generateMarkup() {
    const { totals, screen, ownerMode, owner } = this._data;

    if (ownerMode) {
      return `
        <div class="live-summary live-summary--owner" data-screen="${screen}">
          <p>Owner mode <strong>${owner?.businessName || owner?.name || 'Admin'}</strong></p>
          <p>Screen <strong>${screen.replace('admin', '')}</strong></p>
        </div>
      `;
    }

    const hold =
      totals.holdSecondsLeft > 0
        ? `<span class="chip chip--warn">Hold ${Math.floor(totals.holdSecondsLeft / 60)}:${String(
            totals.holdSecondsLeft % 60
          ).padStart(2, '0')}</span>`
        : '';

    return `
      <div class="live-summary" data-screen="${screen}">
        <p>Active bookings <strong>${totals.bookingCount}</strong></p>
        <p>Under review <strong>${totals.underReview}</strong></p>
        <p>Total spent <strong>₱${totals.totalSpent}</strong></p>
        <p>Avg / booking <strong>₱${totals.avgPrice}</strong></p>
        ${hold}
      </div>
    `;
  }
}

export default new SummaryView();
