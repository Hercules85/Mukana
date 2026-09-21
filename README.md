# Mukana

Companionship products from Hong Kong. This repository contains the **frontend**
(Next.js + React + Tailwind) and **backend** (Node + Express + SQLite + admin UI)
for the Mukana web presence.

Pages:

- `/` — landing page (hero, brand story, featured products, partners)
- `/merch` — product catalogue (notebook, canvas bags, keychain, stickers,
  postcards) with prices, descriptions, and "Order for pickup" CTA
- `/about` — about Mukana (Finnish: *companionship*), origin story, gallery
- `/locations` — our stores in D·Park (Tsuen Wan) and APM (Kwun Tong) plus
  distributor logos (Log-on, 7-Eleven HK, …)
- `/order` — order online with **store pickup** only (no shipping)

Site copy is bilingual: **Traditional Chinese (`zh-Hant`) + English (`en`)**
with a language switcher in the header.

## Tech stack

| Layer    | Choice                                                              |
| -------- | ------------------------------------------------------------------- |
| Frontend | Next.js 14 (App Router) + React + TypeScript + Tailwind CSS         |
| Backend  | Node.js + Express + TypeScript + better-sqlite3                     |
| Data     | SQLite file (`backend/data/mukana.sqlite`)                          |
| Admin UI | Plain HTML + vanilla JS, served by the backend at `/admin`          |

## Running locally

```bash
# 1) Backend
cd backend
npm install
npm run seed          # populate sample products + stores
npm run dev           # http://localhost:4000

# 2) Frontend
cd ../frontend
npm install
npm run dev           # http://localhost:3000
```

The frontend talks to the backend via `NEXT_PUBLIC_API_URL` (defaults to
`http://localhost:4000`). The admin panel lives at
`http://localhost:4000/admin` — sign in with the admin token (default
`mukana-dev-token`, override via the `ADMIN_TOKEN` env var on the backend).

## Image strategy

Product photography and event/store photos are served directly from the public
Google Drive CDN (`https://lh3.googleusercontent.com/d/<id>=w1200`) so the
repo stays small. All file IDs live in
[`frontend/src/lib/gallery.ts`](frontend/src/lib/gallery.ts) — replace any ID
to swap a photo. **Next.js remote image patterns** are preconfigured for
`lh3.googleusercontent.com`.

> Because the source images are not visually labelled here, the `/merch` page
> uses **inline SVG product illustrations** rather than risk mis-pairing a
> Drive photo with the wrong product. The raw gallery lives under `/about`
> (no captions).

## Order flow

Reserve now, pay in store:

1. Customer picks a store (D·Park or APM), browses products, adds to cart.
2. Customer picks a **pickup date** (next 14 days) and a time window.
3. Customer submits name, phone, email — backend creates an order with a
   short **pickup code** (e.g. `MUK-7H4K`).
4. Customer sees confirmation + code; backend emails/SMSes the shop.
5. Staff uses `/admin` to mark the order *ready* and then *picked up*.

No payment integration. Stock is tracked per product; admins can decrement on
pickup.

## Project layout

```
Mukana/
├── frontend/                Next.js app
│   ├── src/app/             Routes (App Router)
│   ├── src/components/      Header, Footer, ProductCard, Mascot, …
│   ├── src/i18n/            zh-Hant + en dictionaries + provider
│   ├── src/lib/             API client, gallery manifest, products data
│   └── public/images/       Brand SVGs (logo, mascot)
└── backend/                 Express + SQLite
    ├── src/index.ts         Server entry
    ├── src/db.ts            Schema + helpers
    ├── src/seed.ts          Seed data
    ├── src/routes/          products, orders, stores, admin
    └── admin/               Static admin UI (HTML + JS + CSS)
```

## Before go-live

1. **Photos** — swap Drive file IDs in `frontend/src/lib/gallery.json` for the
   final picks (hero, store shots). Drive files must stay shared "anyone with
   the link".
2. **Distributor logos** — drop real logo files in `frontend/public/images/`
   and replace the placeholder circles in `src/app/locations/page.tsx`
   (`DISTRIBUTORS` list).
3. **Store details** — verify phone numbers / opening hours in
   `backend/src/seed.ts` (they seed the DB) and in
   `frontend/src/i18n/{zh,en}.ts` (display strings).
4. **Social links** — point the footer icons at real Instagram/Facebook URLs
   in `src/components/Footer.tsx`.
5. **Admin token** — set a strong `ADMIN_TOKEN` env var on the backend.
6. **Production run** — `cd frontend && npm run build && npm start` and
   `cd backend && npm run build && npm start`.
