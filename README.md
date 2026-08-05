# Makki Town Badminton Club Management System

A premium, mobile-first bookkeeping app for Makki Town Badminton Club — built to replace the club's Excel sheet with something anyone can use, that saves automatically, and that always shows a complete, accurate financial picture.

## Features

- **Members** — add, edit, and deactivate members with a default monthly fee, phone number, joining date, and notes.
- **Monthly Payments** — record how much each member paid this month with one tap ("Mark Full") or a custom partial amount. Status (Paid / Partially Paid / Not Paid) and the remaining balance are calculated automatically from the default fee.
- **Fines** — unlimited fines per member, each with a reason, amount, paid/unpaid status, date issued, date paid, and notes.
- **Expenses** — unlimited expenses (guard salary, shuttle, tea, electricity, repairs, etc.) with amount, date, and description.
- **Reports** — a complete, Excel-equivalent monthly report: every member's payment, every fine, every expense, and a full financial summary, plus a chronological activity timeline. Also includes Yearly, Member, Fine, and Expense report views. Every report can be printed or exported to CSV.
- **Statistics** — income vs. expenses over time, monthly balance, fine collection, top contributors, and expense breakdown, all as interactive charts.
- **Monthly Records** — browse every past month at a glance, each completely independent from the others.
- **Member Profiles** — a full payment and fine history for each member.
- **Backup & Restore** — export everything to a single JSON file and restore it on any device. A quick "undo" is also available right after deleting something.
- **Dark Mode** — a genuinely soft, readable light theme and a full dark theme.
- **Help & Instructions** — a built-in, plain-language guide covering every workflow, plus an FAQ.
- **Works fully offline** — all data lives on your device; nothing is sent to a server.

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview a production build

```bash
npm run preview
```

## Technologies Used

- React 19
- Vite
- Tailwind CSS v4
- IndexedDB (via the `idb` library)
- Framer Motion
- Recharts
- React Hook Form
- React Router

## Folder Structure

```
src/
  components/     Shared UI building blocks (Sidebar, Topbar, Sheet, cards, tables, error boundary)
  context/        Global app state (DataContext) and theme (ThemeContext)
  db/             IndexedDB access layer and first-run seed data
  features/       Feature-specific forms (members, fines, expenses)
  pages/          One file per screen/route (Dashboard, Reports, Members, etc.)
  utils/          Shared, pure helper functions — dates, currency, and all financial calculations
```

All financial math (payment status, remaining balances, monthly totals) lives in `src/utils/finance.js` so every page — Dashboard, Reports, Statistics, Monthly Records — always agrees on the same numbers.

## Data Storage

All club data — members, months, payments, fines, expenses, and activity — is stored **only on this device**, using the browser's built-in IndexedDB. Every change is saved automatically the instant it happens; there is no "Save" button and nothing is ever sent to a server.

## Backup & Restore

Open **Backup & Restore** from the sidebar:

- **Export Backup** downloads a single JSON file containing every member, month, payment, fine, and expense.
- **Import Backup** lets you select a previously exported file and restore it — this replaces all data currently on the device, so use it when moving to a new phone or computer, or recovering from a lost device.

## Browser Compatibility

Works in current versions of:

- Chrome / Chrome for Android
- Safari / Safari for iOS
- Firefox
- Microsoft Edge

Requires a browser with IndexedDB support (all modern desktop and mobile browsers). For the best experience on shared club phones, use the browser's "Add to Home Screen" option to launch the app like a native app.
