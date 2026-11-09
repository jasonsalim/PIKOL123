/**
 * Controller — the only layer that talks to both views and the model.
 * Wires user actions → model changes → re-render. Never builds HTML itself.
 */

import * as model from './model.js';
import searchView from './views/SearchView.js';
import venueListView from './views/VenueListView.js';
import slotSelectView from './views/SlotSelectView.js';
import checkoutView from './views/CheckoutView.js';
import myBookingsView from './views/MyBookingsView.js';
import summaryView from './views/SummaryView.js';
import adminAuthView from './views/AdminAuthView.js';
import adminHomeView from './views/AdminHomeView.js';
import adminVenueView from './views/AdminVenueView.js';
import adminCourtsView from './views/AdminCourtsView.js';
import adminPublishView from './views/AdminPublishView.js';
import adminAvailabilityView from './views/AdminAvailabilityView.js';
import adminBookingsView from './views/AdminBookingsView.js';

const appRoot = document.querySelector('#app');
const nav = document.querySelector('#main-nav');

function payloadBase() {
  return {
    search: model.state.search,
    message: model.state.ui.message,
    messageType: model.state.ui.messageType,
    screen: model.state.ui.screen,
    totals: model.getDerivedTotals(),
    paymentMethod: model.state.paymentMethod,
  };
}

function syncShell() {
  const screen = model.state.ui.screen;
  appRoot.dataset.screen = screen;
  const isAdmin = model.isAdminScreen(screen);
  document.body.classList.toggle('is-owner-mode', isAdmin);

  nav?.querySelectorAll('[data-nav]').forEach(btn => {
    const isCheckout =
      btn.dataset.nav === 'checkout' &&
      ['review', 'pay', 'confirm', 'checkout'].includes(screen);
    const isBookings = btn.dataset.nav === 'myBookings' && screen === 'myBookings';
    const isOwner =
      btn.dataset.nav === 'owner' && isAdmin;
    btn.classList.toggle('is-active', isCheckout || isBookings || isOwner);
  });
}

function renderAdmin() {
  const base = payloadBase();
  const screen = model.state.ui.screen;
  const dash = model.getAdminDashboard();

  if (screen === 'adminAuth') {
    adminAuthView.render({
      ...base,
      authMode: model.state.ui.adminAuthMode,
    });
  }

  if (screen === 'adminHome') {
    adminHomeView.render({ ...base, dash });
  }

  if (screen === 'adminVenue') {
    adminVenueView.render({
      ...base,
      venue: model.getEditingVenue(),
    });
  }

  if (screen === 'adminCourts') {
    adminCourtsView.render({
      ...base,
      venue: model.getEditingVenue(),
    });
  }

  if (screen === 'adminPublish') {
    adminPublishView.render({
      ...base,
      venue: model.getEditingVenue(),
    });
  }

  if (screen === 'adminAvailability') {
    adminAvailabilityView.render({
      ...base,
      venues: model.getOwnerVenues(),
      blockedSlots: model.getOwnerBlockedSlots(),
      editingVenueId: model.state.ui.editingVenueId,
    });
  }

  if (screen === 'adminBookings') {
    adminBookingsView.render({
      ...base,
      bookings: model.getOwnerBookings(),
    });
  }
}

function renderAll() {
  model.clearExpiredHold();
  syncShell();

  const screen = model.state.ui.screen;
  const base = payloadBase();

  if (model.isAdminScreen(screen)) {
    summaryView.render({
      totals: base.totals,
      screen,
      ownerMode: true,
      owner: model.getCurrentOwner(),
    });
    renderAdmin();
    return;
  }

  summaryView.render({
    totals: base.totals,
    screen,
  });

  // Search + filters stay on top; court results render directly underneath.
  if (screen === 'search' || screen === 'results') {
    searchView.render({
      ...base,
      filtersOpen: model.state.ui.filtersOpen,
    });
    venueListView.render({
      ...base,
      results: model.state.results,
      suggestions: model.getSuggestedCourts(),
      hasSearched: model.state.ui.hasSearched,
    });
  }

  if (screen === 'slot') {
    slotSelectView.render({
      ...base,
      venue: model.getSelectedVenueDetails(),
      selectedCourtId: model.state.selectedCourtId,
      selectedSlots: model.state.selectedSlots,
      selection: model.getSlotSelectionSummary(),
    });
  }

  if (['review', 'pay', 'confirm'].includes(screen)) {
    checkoutView.render({
      ...base,
      hold: model.getHoldDetails(),
      confirmation: model.state.lastConfirmation,
    });
  }

  if (screen === 'myBookings') {
    myBookingsView.render({
      ...base,
      bookings: model.state.bookings,
    });
  }
}

function goTo(screen) {
  if (screen === 'owner') {
    model.enterOwnerMode();
    renderAll();
    return;
  }

  if (model.isAdminScreen(screen)) {
    model.setAdminStep(screen);
    renderAll();
    return;
  }

  const leavingCheckout =
    ['search', 'results'].includes(screen) &&
    model.state.hold &&
    ['review', 'pay'].includes(model.state.ui.screen);

  if (leavingCheckout) {
    model.releaseHold();
  }

  if (screen === 'checkout') {
    if (model.state.hold) model.setScreen('review');
    else if (model.state.lastConfirmation) model.setScreen('confirm');
    else {
      model.setScreen('search');
      model.state.ui.message = 'Search and hold a slot before checkout.';
      model.state.ui.messageType = 'info';
    }
    renderAll();
    return;
  }

  if (model.isAdminScreen(model.state.ui.screen)) {
    model.exitOwnerMode();
  }

  model.setScreen(screen);
  if (screen === 'search' && !leavingCheckout) {
    model.state.ui.message = '';
    model.state.ui.messageType = '';
  }
  renderAll();
}

function controlToggleFilters() {
  model.toggleFilters();
  renderAll();
}

function controlSearch(formData) {
  const result = model.searchCourts(formData);
  if (!result.ok) {
    model.state.ui.screen = model.state.ui.screen === 'slot' ? 'search' : model.state.ui.screen;
    if (!['search', 'results'].includes(model.state.ui.screen)) {
      model.state.ui.screen = 'search';
    }
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlSelectCourtAndClearMessage(courtId) {
  model.selectCourt(courtId);
  model.state.ui.message = '';
  model.state.ui.messageType = '';
  renderAll();
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function controlSelectVenue(venueId) {
  // Auto-use today if Filters date is empty so "View location & times" always opens.
  if (!model.state.search.date) {
    model.state.search.date = todayISO();
  }
  const result = model.selectVenue(venueId);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
    renderAll();
    return;
  }
  model.state.ui.message = '';
  model.state.ui.messageType = '';
  renderAll();
}

function controlToggleSlot(slot) {
  const result = model.toggleSlotSelection(slot);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  } else {
    model.state.ui.message = '';
    model.state.ui.messageType = '';
  }
  renderAll();
}

function controlHoldSelected() {
  const result = model.holdSelectedSlots();
  if (!result.ok && result.backToResults) {
    renderAll();
    return;
  }
  if (!result.ok) {
    slotSelectView.renderError(result.error);
    return;
  }
  renderAll();
}

function controlConfirmReview() {
  const result = model.confirmReview();
  if (!result.ok) {
    if (result.backToResults) model.setScreen('results');
    renderAll();
    return;
  }
  renderAll();
}

function controlPay(paymentMethod) {
  const result = model.pay(paymentMethod);
  renderAll();
  if (!result.ok && !result.backToResults) {
    checkoutView.renderError(result.error);
  }
}

function controlCancelBooking(bookingId) {
  const result = model.cancelBooking(bookingId);
  model.state.ui.message = result.ok
    ? result.refund
      ? 'Booking cancelled. Refund approved — slot released.'
      : 'Booking cancelled with no refund — slot released.'
    : result.error;
  model.state.ui.messageType = result.ok ? 'success' : 'error';
  renderAll();
}

function controlReschedule(bookingId, newDate, newSlot) {
  const result = model.rescheduleBooking(bookingId, newDate, newSlot);
  model.state.ui.message = result.ok
    ? `Rescheduled to ${result.booking.date} @ ${result.booking.slot}. Status: UNDER REVIEW.`
    : result.error;
  model.state.ui.messageType = result.ok ? 'success' : 'error';
  renderAll();
}

function controlEditNotes(bookingId, notes) {
  const result = model.updateBookingNotes(bookingId, notes);
  model.state.ui.message = result.ok ? 'Notes updated.' : result.error;
  model.state.ui.messageType = result.ok ? 'success' : 'error';
  renderAll();
}

function controlDeleteBooking(bookingId) {
  const result = model.deleteBooking(bookingId);
  model.state.ui.message = result.ok ? 'Booking removed from list.' : result.error;
  model.state.ui.messageType = result.ok ? 'success' : 'error';
  renderAll();
}

function controlMarkConfirmed(bookingId) {
  const result = model.markBookingConfirmed(bookingId);
  model.state.ui.message = result.ok ? 'Booking marked CONFIRMED.' : result.error;
  model.state.ui.messageType = result.ok ? 'success' : 'error';
  renderAll();
}

function controlAdminStep(step) {
  model.setAdminStep(step);
  renderAll();
}

function controlOwnerLogin(data) {
  const result = model.ownerLogin(data);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlOwnerSignup(data) {
  const result = model.ownerSignup(data);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlSaveVenue(data) {
  const result = model.saveOwnerVenue(data);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlAddCourt(data) {
  const result = model.addOwnerCourt(data);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlRemoveCourt(courtId) {
  const result = model.removeOwnerCourt(courtId);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlPublishVenue() {
  const result = model.publishOwnerVenue();
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlUnpublishVenue(venueId) {
  const result = model.unpublishOwnerVenue(venueId);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlSelectOwnerVenue(venueId) {
  const result = model.selectOwnerVenue(venueId);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
    renderAll();
    return;
  }
  model.setAdminStep('adminVenue');
  renderAll();
}

function controlBlockSlot(data) {
  const result = model.blockOwnerSlot(data);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlUnblockSlot(blockId) {
  const result = model.unblockOwnerSlot(blockId);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlUpdateHours(data) {
  const result = model.updateOwnerVenueHours(data);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlApproveBooking(bookingId) {
  const result = model.approveOwnerBooking(bookingId);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function controlRejectBooking(bookingId) {
  const result = model.rejectOwnerBooking(bookingId);
  if (!result.ok) {
    model.state.ui.message = result.error;
    model.state.ui.messageType = 'error';
  }
  renderAll();
}

function initHandlers() {
  searchView.addHandlerSearch(controlSearch);
  searchView.addHandlerToggleFilters(controlToggleFilters);
  venueListView.addHandlerSelectVenue(controlSelectVenue);
  venueListView.addHandlerBack(() => goTo('search'));
  slotSelectView.addHandlerSelectCourt(controlSelectCourtAndClearMessage);
  slotSelectView.addHandlerToggleSlot(controlToggleSlot);
  slotSelectView.addHandlerHoldSelected(controlHoldSelected);
  slotSelectView.addHandlerBack(() => goTo('results'));
  checkoutView.addHandlerConfirmReview(controlConfirmReview);
  checkoutView.addHandlerPay(controlPay);
  checkoutView.addHandlerNav(screen => goTo(screen));
  myBookingsView.addHandlerCancel(controlCancelBooking);
  myBookingsView.addHandlerReschedule(controlReschedule);
  myBookingsView.addHandlerEditNotes(controlEditNotes);
  myBookingsView.addHandlerDelete(controlDeleteBooking);
  myBookingsView.addHandlerConfirmStatus(controlMarkConfirmed);

  adminAuthView.addHandlerToggleMode(mode => {
    model.setAdminAuthMode(mode);
    model.state.ui.message = '';
    renderAll();
  });
  adminAuthView.addHandlerLogin(controlOwnerLogin);
  adminAuthView.addHandlerSignup(controlOwnerSignup);

  adminHomeView.addHandlerNav(controlAdminStep);
  adminHomeView.addHandlerSelectVenue(controlSelectOwnerVenue);
  adminHomeView.addHandlerNewVenue(() => {
    model.state.ui.editingVenueId = null;
    model.setAdminStep('adminVenue');
    renderAll();
  });
  adminHomeView.addHandlerLogout(() => {
    model.ownerLogout();
    renderAll();
  });

  adminVenueView.addHandlerSave(controlSaveVenue);
  adminVenueView.addHandlerBack(controlAdminStep);

  adminCourtsView.addHandlerAdd(controlAddCourt);
  adminCourtsView.addHandlerRemove(controlRemoveCourt);
  adminCourtsView.addHandlerNav(controlAdminStep);

  adminPublishView.addHandlerPublish(controlPublishVenue);
  adminPublishView.addHandlerUnpublish(controlUnpublishVenue);
  adminPublishView.addHandlerNav(controlAdminStep);

  adminAvailabilityView.addHandlerBlock(controlBlockSlot);
  adminAvailabilityView.addHandlerUnblock(controlUnblockSlot);
  adminAvailabilityView.addHandlerUpdateHours(controlUpdateHours);
  adminAvailabilityView.addHandlerNav(controlAdminStep);

  adminBookingsView.addHandlerApprove(controlApproveBooking);
  adminBookingsView.addHandlerReject(controlRejectBooking);
  adminBookingsView.addHandlerNav(controlAdminStep);

  document.querySelector('.page')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-nav]');
    if (!btn) return;
    goTo(btn.dataset.nav);
  });

  // Tick hold countdown / expiry while on review or pay.
  setInterval(() => {
    if (!['review', 'pay'].includes(model.state.ui.screen)) return;
    const expired = model.clearExpiredHold();
    renderAll();
    if (expired) return;
  }, 1000);
}

function init() {
  model.init();
  initHandlers();
  renderAll();
}

init();
