/**
 * db.js — fake local database (seed data only).
 * PickleBook is scoped to Mati City — 5 pickleball courts.
 *
 * Each court includes the same 3 filter infos used in Search:
 *   1. date / availability  → availableDaily + slots
 *   2. pricePerHour         → Max price / hour filter
 *   3. indoorOutdoor        → Indoor / outdoor filter
 */

export const CITY = 'Mati';

/** Demo venue owner — use these to open Owner Admin. */
export const demoOwner = {
  id: 'owner-demo',
  name: 'Demo Owner',
  email: 'owner@mati.ph',
  phone: '09171234567',
  password: 'owner123',
  businessName: 'Mati Pickleball Network',
  businessDetails: 'Operates Mati City pickleball courts',
  businessVerified: true,
  createdAt: 0,
};

/** 5 pickleball courts inside Mati City. */
export const venues = [
  {
    id: 'v1',
    name: 'Courtside',
    city: 'Mati',
    address: 'Lower Kapayas, Matiao, Mati City',
    barangay: 'Matiao',
    landmark: 'Near Mati City Hall / public plaza',
    mapHint: 'Open court beside the plaza parking area',
    mapPin: '7.0105, 126.3408',
    distanceKm: 0.8,
    ownerId: demoOwner.id,
    published: true,
    openingHours: '07:00–19:00',
    contact: '0917-111-0001',
    slotDurationHours: 1,
    // --- 3 filter infos ---
    availableDaily: true,
    pricePerHour: 250,
    indoorOutdoor: 'outdoor',
    // ---------------------
    rating: 4.6,
    reviews: 38,
    photo: 'outdoor',
    logo: 'images/logos/courtside.jpg',
    image: 'images/courts/courtside.jpg',
    searchTags: ['courtside', 'matiao', 'kapayas', 'central'],
    courts: [{ id: 'v1c1', name: 'Main Court', indoorOutdoor: 'outdoor', surface: 'concrete', pricePerHour: 250, peakPrice: 300, offPeakPrice: 250 }],
    slots: ['07:00', '08:00', '09:00', '10:00', '16:00', '17:00', '18:00', '19:00'],
  },
  {
    id: 'v2',
    name: 'D Challenger Courts',
    city: 'Mati',
    address: 'Techno Park, Dahican, Mati City',
    barangay: 'Dahican',
    landmark: 'Across from popular Dahican surf spots',
    mapHint: 'Outdoor courts along the beach access road',
    mapPin: '6.9480, 126.2800',
    distanceKm: 6.2,
    ownerId: demoOwner.id,
    published: true,
    openingHours: '06:00–18:00',
    contact: '0917-111-0002',
    slotDurationHours: 1,
    // --- 3 filter infos ---
    availableDaily: true,
    pricePerHour: 300,
    indoorOutdoor: 'outdoor',
    // ---------------------
    rating: 4.7,
    reviews: 54,
    photo: 'outdoor',
    logo: 'images/logos/challenger.jpg',
    image: 'images/courts/challenger.jpg',
    searchTags: ['challenger', 'dahican', 'techno', 'beach'],
    courts: [{ id: 'v2c1', name: 'Beach Court', indoorOutdoor: 'outdoor', surface: 'asphalt', pricePerHour: 300, peakPrice: 350, offPeakPrice: 280 }],
    slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00'],
  },
  {
    id: 'v3',
    name: 'Jaqiro Courtside',
    city: 'Mati',
    address: 'Phase 1 MPRDC, Badas, Mati City',
    barangay: 'Badas',
    landmark: 'Beside Badas covered gym',
    mapHint: 'Indoor hall — enter through the gym side gate',
    mapPin: '7.0250, 126.3100',
    distanceKm: 3.4,
    ownerId: demoOwner.id,
    published: true,
    openingHours: '08:00–19:00',
    contact: '0917-111-0003',
    slotDurationHours: 1,
    // --- 3 filter infos ---
    availableDaily: true,
    pricePerHour: 400,
    indoorOutdoor: 'indoor',
    // ---------------------
    rating: 4.5,
    reviews: 41,
    photo: 'indoor',
    logo: 'images/logos/jaqiro.jpg',
    image: 'images/courts/jaqiro.jpg',
    searchTags: ['jaqiro', 'badas', 'mprdc', 'indoor'],
    courts: [{ id: 'v3c1', name: 'Indoor Court', indoorOutdoor: 'indoor', surface: 'wood', pricePerHour: 400, peakPrice: 450, offPeakPrice: 380 }],
    slots: ['08:00', '09:00', '10:00', '11:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  },
  {
    id: 'v4',
    name: 'D Backside Court',
    city: 'Mati',
    address: 'Old LTO, Madang, Mati City',
    barangay: 'Madang',
    landmark: 'Near Old LTO',
    mapHint: 'Look for the painted pickleball lines near the baywalk benches',
    mapPin: '7.0080, 126.3350',
    distanceKm: 2.1,
    ownerId: demoOwner.id,
    published: true,
    openingHours: '07:00–19:00',
    contact: '0917-111-0004',
    slotDurationHours: 1,
    // --- 3 filter infos ---
    availableDaily: true,
    pricePerHour: 200,
    indoorOutdoor: 'outdoor',
    // ---------------------
    rating: 4.3,
    reviews: 27,
    photo: 'outdoor',
    logo: 'images/logos/backside.jpg',
    image: 'images/courts/backside.jpg',
    searchTags: ['backside', 'madang', 'lto', 'baywalk'],
    courts: [{ id: 'v4c1', name: 'Baywalk Court', indoorOutdoor: 'outdoor', surface: 'concrete', pricePerHour: 200, peakPrice: 230, offPeakPrice: 180 }],
    slots: ['07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00'],
  },
  {
    id: 'v5',
    name: 'Rafas',
    city: 'Mati',
    address: 'Bayview, Dahican, Mati City',
    barangay: 'Dahican',
    landmark: 'Near Subangan Area',
    mapHint: 'Follow Bayview road toward Subangan — courts on the left',
    mapPin: '6.9600, 126.2900',
    distanceKm: 4.0,
    ownerId: demoOwner.id,
    published: true,
    openingHours: '06:00–18:00',
    contact: '0917-111-0005',
    slotDurationHours: 1,
    // --- 3 filter infos ---
    availableDaily: true,
    pricePerHour: 250,
    indoorOutdoor: 'indoor',
    // ---------------------
    rating: 4.4,
    reviews: 63,
    photo: 'indoor',
    logo: 'images/logos/rafas.jpg',
    image: 'images/courts/rafas.jpg',
    searchTags: ['rafas', 'bayview', 'dahican', 'subangan'],
    courts: [{ id: 'v5c1', name: 'Rafas Court', indoorOutdoor: 'indoor', surface: 'synthetic', pricePerHour: 250, peakPrice: 280, offPeakPrice: 230 }],
    slots: ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00'],
  },
];

export const cities = [CITY];

/** Quick directory — the 5 court names shown on the search screen. */
export const courtNames = venues.map(v => ({
  id: v.id,
  name: v.name,
  barangay: v.barangay,
  indoorOutdoor: v.indoorOutdoor,
  pricePerHour: v.pricePerHour,
}));

export const paymentMethods = [
  { id: 'gcash', label: 'GCash' },
  { id: 'maya', label: 'Maya' },
  { id: 'card', label: 'Card' },
  { id: 'fail-demo', label: 'Fail payment (demo)' },
];
