# VendorHub

A multi-vendor marketplace for Indian artisans and small businesses. Built for DevFusion 2.0 — May 2025.

---

## What it is

VendorHub connects buyers with curated Indian craft vendors. Vendors list handmade and artisanal products. Buyers browse, search, and purchase. Admins manage approvals, refunds, and commissions.

---

## Structure

```
fused-into-development/
  backend/    Node.js + Express + MongoDB API
  frontend/   Buyer-facing storefront (React + Vite)
  vendor/     Seller dashboard (React + Vite)
  admin/      Admin panel (React + Vite)
```

---

## Tech stack

| Layer    | Stack                                          |
|----------|------------------------------------------------|
| Backend  | Node.js, Express 5, MongoDB, Mongoose          |
| Auth     | JWT (access 15m, refresh 7d), bcrypt           |
| Payments | Razorpay sandbox                               |
| Storage  | Cloudinary (product + vendor images)           |
| Frontend | React 19, Vite 8, Tailwind CSS 4, Zustand      |
| AI       | OpenRouter — openai/gpt-4o-mini                |

---

## Running locally

### Prerequisites

- Node.js 20+
- MongoDB Atlas URI or local MongoDB
- Cloudinary account
- Razorpay test keys

### Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                  # starts on :5000
```

### Seed the database

```bash
cd backend
node src/utils/seedData.js
```

This creates:
- 1 admin, 2 buyers, 5 vendors (all approved)
- 3 root categories + 6 subcategories
- 30 products across all vendors
- 10 orders in various states

**Test credentials:**

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@vendorhub.com      | Password@123 |
| Buyer   | buyer@vendorhub.com      | Password@123 |
| Vendor  | vendor1@vendorhub.com    | Password@123 |

### Frontend apps

```bash
cd frontend && npm install && npm run dev    # buyer — :5173
cd vendor   && npm install && npm run dev    # seller dashboard — :5174
cd admin    && npm install && npm run dev    # admin panel — :5175
```

---

## Environment variables (backend)

See `backend/.env.example` for the full list. Key variables:

```
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
OPENAI_API_KEY=
CLIENT_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

---

## API overview

All routes are prefixed `/api`.

| Prefix          | Description                            |
|-----------------|----------------------------------------|
| `/auth`         | Register, login, token refresh         |
| `/products`     | Product CRUD, search                   |
| `/vendors`      | Vendor profiles, approval              |
| `/orders`       | Place and track orders                 |
| `/payments`     | Razorpay checkout, webhook             |
| `/refunds`      | Raise and manage refund requests       |
| `/reviews`      | Product reviews                        |
| `/categories`   | Browse categories                      |
| `/admin`        | Analytics, commission, category mgmt   |
| `/ai`           | AI-powered search expansion            |

---

## Team

DevFusion 2.0 — 4-person team

| Person | Domain                                      |
|--------|---------------------------------------------|
| P1     | Backend services, Razorpay integration      |
| P2     | Buyer frontend (browsing, cart, checkout)   |
| P3     | Vendor dashboard, Admin panel               |
| P4     | Auth, API wiring, Cloudinary, state mgmt    |
