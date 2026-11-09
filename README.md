# PickleBook

Vanilla JS MVC court-booking app for **ITPFE 1 — Web Systems and Technologies 2** prelim project.

Users search courts by city/date/time, compare venues, hold a slot for 10 minutes, pay, get an **UNDER REVIEW** confirmation, then cancel or reschedule from **My Bookings**.

No backend — all data lives in the model and `localStorage`.

## Folder structure

```text
PickleBook/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── db.js
│   ├── model.js
│   ├── controller.js
│   └── views/
│       ├── View.js
│       ├── SearchView.js
│       ├── VenueListView.js
│       ├── SlotSelectView.js
│       ├── CheckoutView.js
│       ├── MyBookingsView.js
│       └── SummaryView.js
└── docs/
    ├── Written_Documentation_Template.md
    └── Video_Script.md
```

## MVC ownership (suggested for a group of 4)

| Member | Owns |
|--------|------|
| A | `SearchView.js` + search validation wiring notes |
| B | `VenueListView.js` + `SlotSelectView.js` |
| C | `CheckoutView.js` (review / pay / confirm) |
| D | `MyBookingsView.js` (cancel / reschedule / CRUD) |

Shared: `View.js`, `model.js`, `controller.js`, `style.css` — edit carefully and credit in the contribution table.

## Run locally

Because the app uses ES modules, serve the folder over HTTP (opening `index.html` as a file may be blocked by the browser):

```bash
npx --yes serve .
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

## GitHub Pages

1. Create one shared GitHub repository and add every member as a collaborator.
2. Push this project to the repo root (or `/docs` if you prefer that Pages source).
3. GitHub → **Settings** → **Pages** → Source: **Deploy from a branch** → `main` / `/ (root)`.
4. After deploy, the live app is `https://<user-or-org>.github.io/<repo>/`.
5. Each member must make **at least 5 meaningful commits** under their own GitHub account.

## Demo tips (matches the algorithm)

1. Search **Mati** or **Davao**, pick today/future date + preferred time.
2. Open a venue → court → slot (hold starts, 10-minute countdown).
3. Review → Pay with GCash/Maya/Card for success.
4. Use payment method **Fail payment (demo)** to simulate step 6 failure (hold released → back to results).
5. Open **My Bookings** to cancel (refund depends on 24h window) or reschedule.

## Course constraints honored

- Extends base `View` class
- Model holds `state`, mutator functions, `localStorage`
- Views never import the model
- Controller only wires actions and re-renders
- Form validation errors render through views
- Derived totals recompute (active bookings, spend, hold countdown)
- Add / edit notes / delete bookings in My Bookings
