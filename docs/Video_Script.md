# PickleBook — Video script (5–8 minutes)

Record at 1080p. Every member speaks. Editor font ≥ 16px when showing code.

## 1. Introduction (0:30)

- Group name + members
- App: PickleBook
- Problem: finding and locking a pickleball court slot without phone tag

## 2. Live demo (1:30)

Show one full flow:

1. Search city + date + preferred time (optionally set a max price)
2. Compare venues → select venue → court → slot
3. Review hold countdown
4. Pay successfully → confirmation with booking code **UNDER REVIEW**
5. Trigger a **validation error** (empty city or past date)
6. Reload the page → booking still present (localStorage)

Optional second pass: choose **Fail payment (demo)** to show hold release.

## 3. Trace one action (1:00)

Pick **Hold slot**:

`SlotSelectView` click → `controlHoldSlot` → `holdSlot` in `model.js` → `checkoutView.render` review screen.

Name the file and function at each step on camera.

## 4. Member walkthroughs (~1:00 each)

| Member | Open these files | Explain |
|--------|------------------|---------|
| A | `SearchView.js`, `controlSearch` | Form fields, validation error rendering |
| B | `VenueListView.js`, `SlotSelectView.js` | Cards, court tabs, slot check |
| C | `CheckoutView.js`, `pay` / `confirmReview` | Hold, pay methods, confirmation |
| D | `MyBookingsView.js`, `cancelBooking` / `rescheduleBooking` | Refund window, slot release |

## 5. Wrap-up (0:30)

- Hardest problem solved
- One improvement you would make next

## Recording rules checklist

- [ ] 5–8 minutes total (over 8 = −5 pts)
- [ ] Each member’s voice heard on their part
- [ ] No background music over speech
- [ ] Trace is clear and matches the code
