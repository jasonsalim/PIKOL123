/**
 * Model — owns all data and business rules.
 * Must never touch the DOM or import any view.
 */

import {
  venues as seedVenues,
  cities as seedCities,
  CITY,
  demoOwner,
} from './db.js';
import { formatSlotLabel } from './timeFormat.js';

const STORAGE_KEY = 'picklebook-state-v2';
const HOLD_MS = 10 * 60 * 1000; // 10 minutes
const ADMIN_SCREENS = [
  'adminAuth',
  'adminHome',
  'adminVenue',
  'adminCourts',
  'adminPublish',
  'adminAvailability',
  'adminBookings',
];

function cloneSeedVenues() {
  return structuredClone(seedVenues);
}

/** Single exported state object — all app data lives here. */
export const state = {
  search: {
    query: '',
    city: '',
    date: '',
    maxPrice: '',
    indoorOutdoor: 'any',
  },
  venues: cloneSeedVenues(),
  customVenues: [],
  results: [],
  selectedVenueId: null,
  selectedCourtId: null,
  selectedSlots: [],
  hold: null,
  paymentMethod: 'gcash',
  lastConfirmation: null,
  bookings: [],
  owners: [structuredClone(demoOwner)],
  sessionOwnerId: null,
  blockedSlots: [],
  ui: {
    screen: 'search', // player + admin screens
    message: '',
    messageType: '', // info | error | success
    filtersOpen: false,
    hasSearched: false,
    adminAuthMode: 'login', // login | signup
    editingVenueId: null,
  },
};

function rebuildVenueList() {
  const custom = Array.isArray(state.customVenues) ? state.customVenues : [];
  const seed = cloneSeedVenues().map(seedV => {
    const overlay = custom.find(c => c.id === seedV.id);
    return overlay ? { ...seedV, ...overlay, id: seedV.id } : seedV;
  });
  const seedIds = new Set(seed.map(v => v.id));
  const extras = custom.filter(c => !seedIds.has(c.id));
  state.venues = [...seed, ...extras];
}

function persist() {
  const snapshot = {
    bookings: state.bookings,
    hold: state.hold,
    search: state.search,
    customVenues: state.customVenues,
    owners: state.owners,
    sessionOwnerId: state.sessionOwnerId,
    blockedSlots: state.blockedSlots,
    editingVenueId: state.ui.editingVenueId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.bookings)) state.bookings = saved.bookings;
    if (saved.hold) state.hold = saved.hold;
    if (saved.search) state.search = { ...state.search, ...saved.search };
    if (Array.isArray(saved.customVenues)) state.customVenues = saved.customVenues;
    if (Array.isArray(saved.owners) && saved.owners.length) {
      const byId = new Map(saved.owners.map(o => [o.id, o]));
      if (!byId.has(demoOwner.id)) byId.set(demoOwner.id, structuredClone(demoOwner));
      state.owners = [...byId.values()];
    }
    if (saved.sessionOwnerId) state.sessionOwnerId = saved.sessionOwnerId;
    if (Array.isArray(saved.blockedSlots)) state.blockedSlots = saved.blockedSlots;
    if (saved.editingVenueId) state.ui.editingVenueId = saved.editingVenueId;
  } catch {
    // Ignore corrupt storage and start fresh.
  }
  rebuildVenueList();
}

function generateCode() {
  const part = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PB-${Date.now().toString().slice(-5)}-${part}`;
}

function findVenue(venueId) {
  return state.venues.find(v => v.id === venueId) ?? null;
}

function findCourt(venue, courtId) {
  return venue?.courts.find(c => c.id === courtId) ?? null;
}

function slotKey(venueId, courtId, date, slot) {
  return `${venueId}|${courtId}|${date}|${slot}`;
}

/** Drop expired holds (step 6: 10 minutes pass). */
export function clearExpiredHold() {
  if (!state.hold) return false;
  if (Date.now() > state.hold.expiresAt) {
    state.hold = null;
    state.ui.message = 'Your 10-minute hold expired. Please pick another slot.';
    state.ui.messageType = 'error';
    if (['review', 'pay'].includes(state.ui.screen)) {
      state.ui.screen = 'results';
    }
    persist();
    return true;
  }
  return false;
}

function bookingSlotList(booking) {
  if (Array.isArray(booking.slots) && booking.slots.length) return booking.slots;
  return booking.slot ? [booking.slot] : [];
}

function holdSlotList(hold) {
  if (!hold) return [];
  if (Array.isArray(hold.slots) && hold.slots.length) return hold.slots;
  return hold.slot ? [hold.slot] : [];
}

function formatSlotRange(slots) {
  return formatSlotLabel(slots);
}

export function isSlotTaken(venueId, courtId, date, slot, ignoreHoldId = null) {
  clearExpiredHold();

  const booked = state.bookings.some(b => {
    if (b.status === 'cancelled') return false;
    if (b.venueId !== venueId || b.courtId !== courtId || b.date !== date) return false;
    return bookingSlotList(b).includes(slot);
  });
  if (booked) return true;

  const blocked = state.blockedSlots.some(
    b =>
      b.venueId === venueId &&
      b.courtId === courtId &&
      b.date === date &&
      b.slot === slot
  );
  if (blocked) return true;

  if (
    state.hold &&
    state.hold.holdId !== ignoreHoldId &&
    state.hold.venueId === venueId &&
    state.hold.courtId === courtId &&
    state.hold.date === date &&
    Date.now() <= state.hold.expiresAt &&
    holdSlotList(state.hold).includes(slot)
  ) {
    return true;
  }

  return false;
}

function isPublishedVenue(v) {
  return v.published !== false;
}

export function getOpenSlots(venue, courtId, date) {
  return venue.slots.filter(slot => !isSlotTaken(venue.id, courtId, date, slot));
}

/** Step 1–2: search courts by city/date/time + optional filters. */
function normalizeTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

export function toggleFilters() {
  state.ui.filtersOpen = !state.ui.filtersOpen;
  return { ok: true, filtersOpen: state.ui.filtersOpen };
}

export function searchCourts(formData) {
  const query = (formData.query || '').trim();
  const date = formData.date || state.search.date || '';
  const maxPrice = formData.maxPrice === '' || formData.maxPrice == null
    ? null
    : Number(formData.maxPrice);
  const indoorOutdoor = formData.indoorOutdoor || 'any';

  if (!date) {
    state.ui.filtersOpen = true;
    return { ok: false, error: 'Open Filters and choose a date.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosen = new Date(`${date}T00:00:00`);
  if (Number.isNaN(chosen.getTime()) || chosen < today) {
    state.ui.filtersOpen = true;
    return { ok: false, error: 'Date must be today or a future date.' };
  }

  const q = query.toLowerCase();

  state.search = {
    query,
    city: CITY,
    date,
    maxPrice: maxPrice ?? '',
    indoorOutdoor,
  };

  clearExpiredHold();

  // Always limited to published Mati City courts
  // Filters use the same 3 infos stored on each court:
  // date (availableDaily + slots), pricePerHour, indoorOutdoor
  state.results = state.venues
    .filter(v => v.city === CITY)
    .filter(isPublishedVenue)
    .filter(v => v.availableDaily !== false)
    .filter(v => {
      if (!q) return true;
      const tags = Array.isArray(v.searchTags) ? v.searchTags.join(' ') : '';
      const haystack =
        `${v.name} ${v.address} ${v.barangay || ''} ${v.landmark || ''} ${tags} ${v.indoorOutdoor}`.toLowerCase();
      return haystack.includes(q);
    })
    .filter(v => (maxPrice == null ? true : Number(v.pricePerHour) <= maxPrice))
    .filter(v =>
      indoorOutdoor === 'any' ? true : v.indoorOutdoor === indoorOutdoor
    )
    .map(v => {
      const openByCourt = v.courts.map(c => ({
        courtId: c.id,
        courtName: c.name,
        openSlots: getOpenSlots(v, c.id, date),
      }));
      const totalOpen = openByCourt.reduce((n, c) => n + c.openSlots.length, 0);
      return {
        ...v,
        openByCourt,
        totalOpen,
        // Echo the 3 filter infos onto the result card
        filterDate: date,
        filterPrice: v.pricePerHour,
        filterType: v.indoorOutdoor,
      };
    })
    .filter(v => v.totalOpen > 0)
    .sort((a, b) => a.pricePerHour - b.pricePerHour);

  state.selectedVenueId = null;
  state.selectedCourtId = null;
  state.selectedSlots = [];
  state.ui.hasSearched = true;
  state.ui.screen = 'results';
  state.ui.message = state.results.length
    ? `Found ${state.results.length} match(es)${query ? ` for “${query}”` : ''}.`
    : `None — no courts match${query ? ` “${query}”` : ''} with those filters.`;
  state.ui.messageType = state.results.length ? 'success' : 'error';
  persist();
  return { ok: true };
}

/** Step 3: open a Mati court → show location + available times. */
export function selectVenue(venueId) {
  const venue = findVenue(venueId);
  if (!venue) return { ok: false, error: 'Court not found.' };
  state.selectedVenueId = venueId;
  // Each listing is one court location — auto-select it and show times.
  state.selectedCourtId = venue.courts[0]?.id ?? null;
  state.selectedSlots = [];
  state.ui.screen = 'slot';
  state.ui.message = '';
  state.ui.messageType = '';
  return { ok: true };
}

export function selectCourt(courtId) {
  state.selectedCourtId = courtId;
  state.selectedSlots = [];
  return { ok: true };
}

/** Toggle a time slot highlight; total updates live (hours × pricePerHour). */
export function toggleSlotSelection(slot) {
  clearExpiredHold();
  const venueId = state.selectedVenueId;
  const courtId = state.selectedCourtId;
  const date = state.search.date;

  if (!venueId || !courtId || !date || !slot) {
    return { ok: false, error: 'Open a court and choose a date first.' };
  }

  if (isSlotTaken(venueId, courtId, date, slot)) {
    return { ok: false, error: 'That slot is no longer available.' };
  }

  if (state.selectedSlots.includes(slot)) {
    state.selectedSlots = state.selectedSlots.filter(s => s !== slot);
  } else {
    state.selectedSlots = [...state.selectedSlots, slot].sort();
  }

  return { ok: true, ...getSlotSelectionSummary() };
}

export function getSlotSelectionSummary() {
  const venue = findVenue(state.selectedVenueId);
  const hours = state.selectedSlots.length;
  const pricePerHour = venue?.pricePerHour ?? 0;
  const totalPrice = hours * pricePerHour;
  const slots = [...state.selectedSlots].sort();
  return {
    slots,
    hours,
    pricePerHour,
    totalPrice,
    label: formatSlotRange(slots),
  };
}

/**
 * Steps 3–4: hold all highlighted slots for 10 minutes.
 */
export function holdSelectedSlots() {
  clearExpiredHold();
  const venueId = state.selectedVenueId;
  const courtId = state.selectedCourtId;
  const date = state.search.date;
  const slots = [...state.selectedSlots].sort();

  if (!venueId || !courtId || !date || !slots.length) {
    return { ok: false, error: 'Highlight at least one time slot first.' };
  }

  for (const slot of slots) {
    if (isSlotTaken(venueId, courtId, date, slot)) {
      state.ui.message = 'One of those slots was just taken. Pick again.';
      state.ui.messageType = 'error';
      state.selectedSlots = [];
      return { ok: false, error: 'Slot no longer available', backToResults: true };
    }
  }

  const venue = findVenue(venueId);
  const hours = slots.length;
  const totalPrice = hours * venue.pricePerHour;

  state.hold = {
    holdId: `hold-${Date.now()}`,
    venueId,
    courtId,
    date,
    slots,
    slot: formatSlotRange(slots),
    hours,
    pricePerHour: venue.pricePerHour,
    totalPrice,
    expiresAt: Date.now() + HOLD_MS,
  };
  state.ui.screen = 'review';
  state.ui.message = `${hours} hour(s) held for 10 minutes. Total ₱${totalPrice}.`;
  state.ui.messageType = 'success';
  persist();
  return { ok: true };
}

/** @deprecated use holdSelectedSlots — kept for older call sites */
export function holdSlot(slot) {
  if (slot && !state.selectedSlots.includes(slot)) {
    state.selectedSlots = [...state.selectedSlots, slot].sort();
  }
  return holdSelectedSlots();
}

export function confirmReview() {
  clearExpiredHold();
  if (!state.hold) {
    return { ok: false, error: 'Hold expired or missing. Pick a slot again.', backToResults: true };
  }
  state.ui.screen = 'pay';
  state.ui.message = '';
  state.ui.messageType = '';
  return { ok: true };
}

/**
 * Step 6: pay.
 * Choose payment method "fail-demo" to simulate a failed payment for testing.
 */
export function pay(paymentMethod) {
  clearExpiredHold();
  if (!state.hold) {
    state.ui.screen = 'results';
    return { ok: false, error: 'Your hold expired. Please pick another slot.', backToResults: true };
  }

  if (!paymentMethod) {
    return { ok: false, error: 'Please choose a payment method.' };
  }

  state.paymentMethod = paymentMethod;

  if (paymentMethod === 'fail-demo') {
    state.hold = null;
    state.ui.screen = 'results';
    state.ui.message = 'Payment failed. The hold was released. Pick another slot.';
    state.ui.messageType = 'error';
    persist();
    return { ok: false, error: 'Payment failed', backToResults: true };
  }

  const venue = findVenue(state.hold.venueId);
  const court = findCourt(venue, state.hold.courtId);

  const slots = holdSlotList(state.hold);
  for (const slot of slots) {
    if (
      isSlotTaken(
        state.hold.venueId,
        state.hold.courtId,
        state.hold.date,
        slot,
        state.hold.holdId
      )
    ) {
      state.hold = null;
      state.ui.screen = 'results';
      state.ui.message = 'Slot no longer available. Choose another slot.';
      state.ui.messageType = 'error';
      persist();
      return { ok: false, error: 'Slot no longer available', backToResults: true };
    }
  }

  const booking = {
    id: `bk-${Date.now()}`,
    code: generateCode(),
    venueId: state.hold.venueId,
    venueName: venue.name,
    courtId: state.hold.courtId,
    courtName: court?.name ?? 'Court',
    city: venue.city,
    address: venue.address,
    date: state.hold.date,
    slots,
    slot: state.hold.slot || formatSlotRange(slots),
    hours: state.hold.hours || slots.length,
    pricePerHour: state.hold.pricePerHour,
    totalPrice: state.hold.totalPrice,
    paymentMethod,
    paymentStatus: 'paid',
    playerName: 'Guest Player',
    playerContact: 'demo@picklebook.local',
    status: 'under_review', // Owner must approve → CONFIRMED
    createdAt: Date.now(),
    cancellationWindowHours: 24,
  };

  state.bookings = [booking, ...state.bookings];
  state.lastConfirmation = {
    ...booking,
    notice: 'Confirmation sent to your screen (email/SMS simulated in this offline demo).',
  };
  state.hold = null;
  state.ui.screen = 'confirm';
  state.ui.message = 'Booking submitted and marked UNDER REVIEW.';
  state.ui.messageType = 'success';
  persist();
  return { ok: true, booking };
}

/** Derived values for summary / review screens. */
export function getDerivedTotals() {
  clearExpiredHold();
  const active = state.bookings.filter(b => b.status !== 'cancelled');
  const underReview = active.filter(b => b.status === 'under_review').length;
  const confirmed = active.filter(b => b.status === 'confirmed').length;
  const totalSpent = active.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const holdSecondsLeft = state.hold
    ? Math.max(0, Math.floor((state.hold.expiresAt - Date.now()) / 1000))
    : 0;

  return {
    bookingCount: active.length,
    underReview,
    confirmed,
    cancelledCount: state.bookings.filter(b => b.status === 'cancelled').length,
    totalSpent,
    avgPrice: active.length ? Math.round(totalSpent / active.length) : 0,
    holdSecondsLeft,
    hold: state.hold,
    resultsCount: state.results.length,
  };
}

export function getSelectedVenueDetails() {
  clearExpiredHold();
  const venue = findVenue(state.selectedVenueId);
  if (!venue) return null;
  const date = state.search.date;
  const courts = venue.courts.map(c => ({
    ...c,
    openSlots: getOpenSlots(venue, c.id, date),
  }));
  return { ...venue, courts, date };
}

export function getHoldDetails() {
  clearExpiredHold();
  if (!state.hold) return null;
  const venue = findVenue(state.hold.venueId);
  const court = findCourt(venue, state.hold.courtId);
  return {
    ...state.hold,
    venueName: venue?.name ?? '',
    courtName: court?.name ?? '',
    address: venue?.address ?? '',
    city: venue?.city ?? '',
    secondsLeft: Math.max(0, Math.floor((state.hold.expiresAt - Date.now()) / 1000)),
  };
}

export function setScreen(screen) {
  clearExpiredHold();
  state.ui.screen = screen;
}

/** Release an active hold and free the slot (user cancels review/pay). */
export function releaseHold(message = 'Hold cancelled. Slot released.') {
  if (!state.hold) return { ok: false };
  state.hold = null;
  state.selectedSlots = [];
  state.ui.message = message;
  state.ui.messageType = 'info';
  persist();
  return { ok: true };
}

/**
 * Step 8: cancel or reschedule.
 * Within cancellation window → refund; else no refund.
 */
export function cancelBooking(bookingId) {
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  if (booking.status === 'cancelled') {
    return { ok: false, error: 'This booking is already cancelled.' };
  }

  const hoursUntil =
    (new Date(`${booking.date}T${booking.slot}:00`).getTime() - Date.now()) / (1000 * 60 * 60);
  const withinWindow = hoursUntil >= booking.cancellationWindowHours;
  const refund = withinWindow;

  booking.status = 'cancelled';
  booking.cancelledAt = Date.now();
  booking.refunded = refund;
  booking.refundNote = refund
    ? 'Full refund — cancelled within the venue cancellation window.'
    : 'No refund — cancelled outside the venue cancellation window.';

  // Slot is released because cancelled bookings are ignored by isSlotTaken.
  persist();
  return { ok: true, booking, refund };
}

export function rescheduleBooking(bookingId, newDate, newSlot) {
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  if (booking.status === 'cancelled') {
    return { ok: false, error: 'Cannot reschedule a cancelled booking.' };
  }
  const slot = normalizeTime(newSlot);
  if (!newDate || !slot) {
    return { ok: false, error: 'Choose a new date and time slot.' };
  }

  if (isSlotTaken(booking.venueId, booking.courtId, newDate, slot)) {
    return { ok: false, error: 'That new slot is no longer available.' };
  }

  // Release old slot by updating in place.
  booking.date = newDate;
  booking.slot = slot;
  booking.status = 'under_review';
  booking.rescheduledAt = Date.now();
  persist();
  return { ok: true, booking };
}

export function deleteBooking(bookingId) {
  const exists = state.bookings.some(b => b.id === bookingId);
  if (!exists) return { ok: false, error: 'Booking not found.' };
  state.bookings = state.bookings.filter(b => b.id !== bookingId);
  persist();
  return { ok: true };
}

export function updateBookingNotes(bookingId, notes) {
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  booking.notes = (notes || '').trim();
  persist();
  return { ok: true, booking };
}

/** Approve under-review booking (demo helper for venue-side status). */
export function markBookingConfirmed(bookingId) {
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  booking.status = 'confirmed';
  persist();
  return { ok: true, booking };
}

export function getCities() {
  return seedCities.length
    ? [...seedCities]
    : [...new Set(state.venues.map(v => v.city))].sort();
}

/** Suggested courts shown under Available courts before a search. */
export function getSuggestedCourts() {
  return state.venues
    .filter(v => v.city === CITY)
    .filter(isPublishedVenue)
    .map(v => ({
      ...v,
      filterDate: state.search.date || '',
      filterPrice: v.pricePerHour,
      filterType: v.indoorOutdoor,
      totalOpen: state.search.date
        ? v.courts.reduce(
            (n, c) => n + getOpenSlots(v, c.id, state.search.date).length,
            0
          )
        : v.slots.length,
    }));
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function requireOwner() {
  const owner = getCurrentOwner();
  if (!owner) return { ok: false, error: 'Log in as an owner first.' };
  return { ok: true, owner };
}

export function isAdminScreen(screen = state.ui.screen) {
  return ADMIN_SCREENS.includes(screen);
}

export function getCurrentOwner() {
  if (!state.sessionOwnerId) return null;
  return state.owners.find(o => o.id === state.sessionOwnerId) ?? null;
}

export function setAdminAuthMode(mode) {
  state.ui.adminAuthMode = mode === 'signup' ? 'signup' : 'login';
  return { ok: true };
}

export function enterOwnerMode() {
  const owner = getCurrentOwner();
  state.ui.screen = owner
    ? owner.businessVerified
      ? 'adminHome'
      : 'adminAuth'
    : 'adminAuth';
  state.ui.message = owner
    ? `Welcome back, ${owner.name}.`
    : 'Owner sign up / log in to manage venues.';
  state.ui.messageType = 'info';
  if (owner && !owner.businessVerified) state.ui.adminAuthMode = 'signup';
  return { ok: true };
}

export function exitOwnerMode() {
  state.ui.screen = 'search';
  state.ui.message = '';
  state.ui.messageType = '';
  return { ok: true };
}

export function setAdminStep(step) {
  if (!ADMIN_SCREENS.includes(step)) {
    return { ok: false, error: 'Unknown admin step.' };
  }
  const gate = requireOwner();
  if (!gate.ok && step !== 'adminAuth') return gate;
  if (gate.ok && !gate.owner.businessVerified && step !== 'adminAuth') {
    state.ui.screen = 'adminAuth';
    state.ui.message = 'Submit business details for verification first.';
    state.ui.messageType = 'info';
    return { ok: false, error: state.ui.message };
  }
  state.ui.screen = step;
  return { ok: true };
}

export function ownerSignup(data) {
  const name = (data.name || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const phone = (data.phone || '').trim();
  const password = (data.password || '').trim();
  const businessName = (data.businessName || '').trim();
  const businessDetails = (data.businessDetails || '').trim();

  if (!name || !email || !phone || !password) {
    return { ok: false, error: 'Name, email/phone, and password are required.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  if (state.owners.some(o => o.email === email)) {
    return { ok: false, error: 'That email is already registered. Log in instead.' };
  }
  if (!businessName || !businessDetails) {
    return { ok: false, error: 'Submit business name and details for verification.' };
  }

  const owner = {
    id: uid('owner'),
    name,
    email,
    phone,
    password,
    businessName,
    businessDetails,
    businessVerified: true, // local demo auto-verifies
    createdAt: Date.now(),
  };
  state.owners.push(owner);
  state.sessionOwnerId = owner.id;
  state.ui.screen = 'adminHome';
  state.ui.message = 'Account created. Business verified (demo). You can add a venue.';
  state.ui.messageType = 'success';
  persist();
  return { ok: true, owner };
}

export function ownerLogin(data) {
  const email = (data.email || '').trim().toLowerCase();
  const password = (data.password || '').trim();
  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }
  const owner = state.owners.find(
    o => o.email === email && o.password === password
  );
  if (!owner) {
    return { ok: false, error: 'Invalid email or password.' };
  }
  state.sessionOwnerId = owner.id;
  state.ui.screen = owner.businessVerified ? 'adminHome' : 'adminAuth';
  state.ui.message = `Logged in as ${owner.name}.`;
  state.ui.messageType = 'success';
  persist();
  return { ok: true, owner };
}

export function ownerLogout() {
  state.sessionOwnerId = null;
  state.ui.editingVenueId = null;
  state.ui.screen = 'adminAuth';
  state.ui.message = 'Logged out.';
  state.ui.messageType = 'info';
  persist();
  return { ok: true };
}

export function getOwnerVenues() {
  const owner = getCurrentOwner();
  if (!owner) return [];
  return state.venues.filter(v => v.ownerId === owner.id);
}

export function getEditingVenue() {
  const id = state.ui.editingVenueId;
  if (!id) return null;
  return findVenue(id);
}

function upsertCustomVenue(venue) {
  const idx = state.customVenues.findIndex(v => v.id === venue.id);
  if (idx >= 0) state.customVenues[idx] = venue;
  else state.customVenues.push(venue);
  rebuildVenueList();
}

function parseOpeningSlots(openingHours, slotDurationHours = 1) {
  const match = String(openingHours || '').match(
    /(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/
  );
  if (!match) {
    return ['07:00', '08:00', '09:00', '10:00', '16:00', '17:00', '18:00'];
  }
  const toMin = t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const start = toMin(match[1]);
  const end = toMin(match[2]);
  const step = Math.max(1, Number(slotDurationHours) || 1) * 60;
  const slots = [];
  for (let m = start; m < end; m += step) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots.length ? slots : ['07:00', '08:00', '09:00'];
}

/** Step 2 — Add / update venue details. */
export function saveOwnerVenue(data) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const name = (data.name || '').trim();
  const address = (data.address || '').trim();
  const barangay = (data.barangay || '').trim() || 'Mati';
  const mapHint = (data.mapHint || '').trim();
  const mapPin = (data.mapPin || '').trim();
  const openingHours = (data.openingHours || '').trim() || '07:00–19:00';
  const contact = (data.contact || '').trim();
  const indoorOutdoor = data.indoorOutdoor === 'indoor' ? 'indoor' : 'outdoor';
  const slotDurationHours = Math.max(1, Number(data.slotDurationHours) || 1);
  const logo = (data.logo || '').trim();
  const image = (data.image || '').trim();

  if (!name || !address || !contact) {
    return { ok: false, error: 'Venue name, address, and contact are required.' };
  }

  const existing = data.venueId ? findVenue(data.venueId) : null;
  if (existing && existing.ownerId !== gate.owner.id) {
    return { ok: false, error: 'You can only edit your own venues.' };
  }

  const venue = {
    ...(existing || {}),
    id: existing?.id || uid('venue'),
    name,
    city: CITY,
    address,
    barangay,
    landmark: (data.landmark || '').trim() || mapHint || address,
    mapHint: mapHint || address,
    mapPin,
    distanceKm: existing?.distanceKm ?? 1,
    ownerId: gate.owner.id,
    published: existing?.published ?? false,
    openingHours,
    contact,
    slotDurationHours,
    availableDaily: true,
    pricePerHour: existing?.pricePerHour ?? (Number(data.pricePerHour) || 250),
    indoorOutdoor,
    rating: existing?.rating ?? 0,
    reviews: existing?.reviews ?? 0,
    photo: indoorOutdoor,
    logo: logo || existing?.logo || '',
    image: image || existing?.image || logo || '',
    searchTags: [name, barangay, indoorOutdoor]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
    courts: existing?.courts?.length
      ? existing.courts
      : [],
    slots: parseOpeningSlots(openingHours, slotDurationHours),
  };

  upsertCustomVenue(venue);
  state.ui.editingVenueId = venue.id;
  state.ui.screen = 'adminCourts';
  state.ui.message = existing
    ? 'Venue updated. Next: add courts & pricing.'
    : 'Venue saved. Next: add courts & pricing.';
  state.ui.messageType = 'success';
  persist();
  return { ok: true, venue };
}

/** Step 3 — Add a court under the editing venue. */
export function addOwnerCourt(data) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const venue = getEditingVenue();
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Save a venue first.' };
  }

  const name = (data.name || '').trim();
  const indoorOutdoor = data.indoorOutdoor === 'indoor' ? 'indoor' : 'outdoor';
  const surface = (data.surface || 'concrete').trim();
  const pricePerHour = Number(data.pricePerHour);
  const peakPrice = Number(data.peakPrice) || pricePerHour;
  const offPeakPrice = Number(data.offPeakPrice) || pricePerHour;
  const slotDurationHours = Math.max(
    1,
    Number(data.slotDurationHours) || venue.slotDurationHours || 1
  );

  if (!name || !Number.isFinite(pricePerHour) || pricePerHour <= 0) {
    return { ok: false, error: 'Court name and a valid price per hour are required.' };
  }

  const court = {
    id: uid('court'),
    name,
    indoorOutdoor,
    surface,
    pricePerHour,
    peakPrice,
    offPeakPrice,
  };

  const updated = {
    ...venue,
    courts: [...venue.courts, court],
    pricePerHour,
    indoorOutdoor,
    slotDurationHours,
    slots: parseOpeningSlots(venue.openingHours, slotDurationHours),
  };
  upsertCustomVenue(updated);
  state.ui.message = `Court “${name}” added.`;
  state.ui.messageType = 'success';
  persist();
  return { ok: true, venue: updated, court };
}

export function removeOwnerCourt(courtId) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const venue = getEditingVenue();
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'No venue selected.' };
  }
  const courts = venue.courts.filter(c => c.id !== courtId);
  if (courts.length === venue.courts.length) {
    return { ok: false, error: 'Court not found.' };
  }
  const updated = {
    ...venue,
    courts,
    pricePerHour: courts[0]?.pricePerHour ?? venue.pricePerHour,
    indoorOutdoor: courts[0]?.indoorOutdoor ?? venue.indoorOutdoor,
  };
  upsertCustomVenue(updated);
  persist();
  return { ok: true, venue: updated };
}

/** Step 4 — Publish venue so it appears in player search. */
export function publishOwnerVenue() {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const venue = getEditingVenue();
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'No venue to publish.' };
  }
  if (!venue.courts.length) {
    return { ok: false, error: 'Add at least one court before publishing.' };
  }
  if (!venue.address || !venue.contact) {
    return { ok: false, error: 'Complete venue address and contact first.' };
  }

  const updated = { ...venue, published: true, availableDaily: true };
  upsertCustomVenue(updated);
  state.ui.screen = 'adminHome';
  state.ui.message = `“${venue.name}” is published and now appears in player searches.`;
  state.ui.messageType = 'success';
  persist();
  return { ok: true, venue: updated };
}

export function unpublishOwnerVenue(venueId) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const venue = findVenue(venueId);
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Venue not found.' };
  }
  const updated = { ...venue, published: false };
  upsertCustomVenue(updated);
  state.ui.message = `“${venue.name}” unpublished.`;
  state.ui.messageType = 'info';
  persist();
  return { ok: true };
}

export function selectOwnerVenue(venueId) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const venue = findVenue(venueId);
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Venue not found.' };
  }
  state.ui.editingVenueId = venueId;
  persist();
  return { ok: true, venue };
}

/** Step 5 — Block slots for maintenance / events / holidays. */
export function blockOwnerSlot(data) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const venueId = data.venueId || state.ui.editingVenueId;
  const venue = findVenue(venueId);
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Choose one of your venues.' };
  }
  const courtId = data.courtId || venue.courts[0]?.id;
  const date = data.date;
  const slot = normalizeTime(data.slot);
  const reason = (data.reason || 'Blocked').trim();

  if (!courtId || !date || !slot) {
    return { ok: false, error: 'Court, date, and time slot are required.' };
  }

  const exists = state.blockedSlots.some(
    b =>
      b.venueId === venueId &&
      b.courtId === courtId &&
      b.date === date &&
      b.slot === slot
  );
  if (exists) return { ok: false, error: 'That slot is already blocked.' };

  state.blockedSlots = [
    {
      id: uid('block'),
      venueId,
      courtId,
      date,
      slot,
      reason,
      createdAt: Date.now(),
    },
    ...state.blockedSlots,
  ];
  state.ui.message = `Blocked ${date} @ ${slot} (${reason}).`;
  state.ui.messageType = 'success';
  persist();
  return { ok: true };
}

export function unblockOwnerSlot(blockId) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const block = state.blockedSlots.find(b => b.id === blockId);
  if (!block) return { ok: false, error: 'Block not found.' };
  const venue = findVenue(block.venueId);
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Not your venue.' };
  }
  state.blockedSlots = state.blockedSlots.filter(b => b.id !== blockId);
  persist();
  return { ok: true };
}

export function updateOwnerVenueHours(data) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const venue = findVenue(data.venueId || state.ui.editingVenueId);
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Venue not found.' };
  }
  const openingHours = (data.openingHours || '').trim() || venue.openingHours;
  const pricePerHour = Number(data.pricePerHour);
  const updated = {
    ...venue,
    openingHours,
    slots: parseOpeningSlots(openingHours, venue.slotDurationHours || 1),
    pricePerHour: Number.isFinite(pricePerHour) && pricePerHour > 0
      ? pricePerHour
      : venue.pricePerHour,
    contact: (data.contact || venue.contact || '').trim(),
  };
  upsertCustomVenue(updated);
  state.ui.message = 'Hours / pricing updated.';
  state.ui.messageType = 'success';
  persist();
  return { ok: true, venue: updated };
}

/** Steps 6–7 — Bookings for this owner's venues. */
export function getOwnerBookings() {
  const owner = getCurrentOwner();
  if (!owner) return [];
  const venueIds = new Set(getOwnerVenues().map(v => v.id));
  return state.bookings.filter(b => venueIds.has(b.venueId));
}

export function getOwnerBlockedSlots() {
  const owner = getCurrentOwner();
  if (!owner) return [];
  const venueIds = new Set(getOwnerVenues().map(v => v.id));
  return state.blockedSlots.filter(b => venueIds.has(b.venueId));
}

export function approveOwnerBooking(bookingId) {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  const venue = findVenue(booking.venueId);
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Not your venue booking.' };
  }
  if (booking.status === 'cancelled') {
    return { ok: false, error: 'Cancelled bookings cannot be approved.' };
  }
  booking.status = 'confirmed';
  booking.approvedAt = Date.now();
  booking.ownerNote = 'Approved by venue owner.';
  state.ui.message = `Booking ${booking.code} confirmed. Player notified (demo).`;
  state.ui.messageType = 'success';
  persist();
  return { ok: true, booking };
}

export function rejectOwnerBooking(bookingId, reason = '') {
  const gate = requireOwner();
  if (!gate.ok) return gate;
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return { ok: false, error: 'Booking not found.' };
  const venue = findVenue(booking.venueId);
  if (!venue || venue.ownerId !== gate.owner.id) {
    return { ok: false, error: 'Not your venue booking.' };
  }
  booking.status = 'cancelled';
  booking.cancelledAt = Date.now();
  booking.refunded = true;
  booking.refundNote = reason || 'Declined by venue owner — slot released.';
  state.ui.message = `Booking ${booking.code} declined.`;
  state.ui.messageType = 'info';
  persist();
  return { ok: true, booking };
}

export function getAdminDashboard() {
  const owner = getCurrentOwner();
  const venues = getOwnerVenues();
  const bookings = getOwnerBookings();
  return {
    owner,
    venues,
    editingVenue: getEditingVenue(),
    bookings,
    underReview: bookings.filter(b => b.status === 'under_review'),
    confirmed: bookings.filter(b => b.status === 'confirmed'),
    blockedSlots: getOwnerBlockedSlots(),
    publishedCount: venues.filter(v => v.published).length,
    draftCount: venues.filter(v => !v.published).length,
  };
}

export function init() {
  loadFromStorage();
  clearExpiredHold();
}
