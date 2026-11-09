# PickleBook — Prelim Project Written Documentation

Copy this into your final PDF (`GroupName_PrelimProject.pdf`). Replace every `[bracketed]` prompt. Keep the heading order.

## Cover page

| Field | Value |
|-------|-------|
| Project title | PickleBook |
| Group name | [Group name] |
| Members | [Full name — role] (mark the group leader) |
| Course and section | ITPFE 1 — Web Systems and Technologies 2, [Section] |
| Instructor | [Instructor name] |
| Date submitted | [Date] |
| Repository | [GitHub link] |
| Live app | [GitHub Pages link] |
| Video | [Video link] |

## 1. Project overview

**Problem:** [Two or three sentences on the problem and who has it]

**Users:** [Who uses the app and when]

**Solution:** [What the app does, in one paragraph]

## 2. Features

| Feature | What the user can do | Owner |
|---------|----------------------|-------|
| Search courts | Choose city, date, preferred time + optional filters | [Member] |
| Compare / select venues | View open slots, price, distance, reviews; pick venue/court/slot | [Member] |
| Hold, pay, confirm | 10-minute hold, review, pay, UNDER REVIEW confirmation | [Member] |
| My Bookings | Cancel (refund rules), reschedule, edit notes, delete | [Member] |

## 3. Architecture

### 3.1 Folder structure

Paste the tree from the README.

### 3.2 State object

Paste a sample `state` from `js/model.js` and explain each property in one line.

### 3.3 Responsibilities

**Model:** […]

**Views:** […]

**Controller:** […]

## 4. Views

| View class | Parent element it renders into | Handler methods it exposes | Owner |
|------------|--------------------------------|----------------------------|-------|
| SearchView | `#search-view` | `addHandlerSearch` | [Member] |
| VenueListView | `#results-view` | `addHandlerSelectVenue`, `addHandlerBack` | [Member] |
| SlotSelectView | `#slot-view` | `addHandlerSelectCourt`, `addHandlerHoldSlot`, `addHandlerBack` | [Member] |
| CheckoutView | `#checkout-view` | `addHandlerConfirmReview`, `addHandlerPay`, `addHandlerNav` | [Member] |
| MyBookingsView | `#bookings-view` | cancel / reschedule / notes / delete handlers | [Member] |
| SummaryView | `#summary-view` | (render-only derived totals) | Shared |

## 5. Tracing one user action

Example: **holding a time slot**

1. The user taps a slot button in `SlotSelectView.js`; the click handler calls the controller.
2. The controller function `controlHoldSlot(slot)` runs.
3. The model function `holdSlot(slot)` checks availability, writes `state.hold` with `expiresAt`, and saves to `localStorage`.
4. The controller calls `renderAll()` → `checkoutView.render(...)`.
5. The review screen shows venue, court, date, time, total, and countdown.

## 6. Screenshots

[3–5 screenshots of the running app, each with a one-line caption. Include one validation error.]

## 7. Testing

| # | What we tested | Input | Expected result | Actual result | Pass? |
|---|----------------|-------|-----------------|---------------|-------|
| 1 | Empty city | City blank | Error: choose a city | […] | Yes/No |
| 2 | Past date | Yesterday | Error: date must be today or future | […] | Yes/No |
| 3 | Search Mati | Valid form | Venue cards appear | […] | Yes/No |
| 4 | Hold slot | Open slot | Review screen + 10 min hold | […] | Yes/No |
| 5 | Fail payment | fail-demo | Hold released, back to results | […] | Yes/No |
| 6 | Reload persistence | Refresh after booking | Booking still in My Bookings | […] | Yes/No |

List at least 6 cases, including at least 2 invalid inputs.

## 8. Challenges and solutions

| Challenge | How we solved it | What we learned |
|-----------|------------------|-----------------|
| [Bug or design problem] | [Fix] | [Lesson] |

## 9. Individual contributions

| Member | Views and functions written | Number of commits | Share of work (%) |
|--------|-----------------------------|-------------------|-------------------|
| [Name] | [e.g. SearchView.js, controlSearch] | [From GitHub Insights] | […] |
| [Name] | […] | […] | […] |
| [Name] | […] | […] | […] |
| [Name] | […] | […] | […] |

Shares must add up to 100%. Every member signs below to confirm the table is accurate.

Signatures: __________________

## 10. Individual reflections

Each member writes 100–150 words: what you built, what MVC made easier or harder, and what you would do differently.

## 11. References and AI use

[Docs, tutorials, and course materials used]

| Member | AI tool | What you asked it | Files or functions it affected |
|--------|---------|-------------------|--------------------------------|
| [Name] | [e.g. Cursor] | [e.g. Explain hold expiry] | [e.g. model.js holdSlot] |
| | | No AI tools used | |

Each member must be able to explain every line listed against their name.
