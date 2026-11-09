# User booking algorithm → PickleBook implementation

Offline SPA adaptation of the system-user algorithm. Multi-user races, email/SMS, and real payments are **simulated** in the model + UI.

| Step | User intent | Implementation |
|------|-------------|----------------|
| 1 Search | City, date, preferred time + optional filters | `SearchView` → `controlSearch` → `searchCourts` |
| 2 View courts | Compare venues with open slots | `VenueListView` renders `state.results` |
| 3 Select | Venue → court → time slot | `selectVenue`, `selectCourt`, slot buttons |
| 4 Slot check | Taken → back to results; else 10-min hold | `holdSlot` / `isSlotTaken`; `expiresAt` |
| 5 Review | Confirm venue/court/date/time/price | `CheckoutView` review + `confirmReview` |
| 6 Pay | Pay or fail/timeout → release hold | `pay`; `fail-demo`; `clearExpiredHold` |
| 7 Confirm | UNDER REVIEW + booking code | `lastConfirmation`; screen notice (email/SMS simulated) |
| 8 Cancel / reschedule | Refund window; release slot | `cancelBooking`, `rescheduleBooking` in My Bookings |

Derived values (brief requirement): active booking count, under-review count, total spent, average price, hold countdown — via `getDerivedTotals()` + `SummaryView`.
