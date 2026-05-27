# VendorHub

**DevFusion: The Developers Hackathon 2.0** | Problem Statement #26ENVH1

VendorHub is a hyperlocal multi-vendor e-commerce platform where local sellers list
products, manage orders, and grow their business -- while buyers get a modern shopping
experience with AI-powered search and recommendations.

Live:
- Buyer storefront: https://fused-into-development.vercel.app/
- Admin panel: https://fused-into-development-ka5w.vercel.app/login
- Vendor panel: https://fused-into-development-ny39.vercel.app
- Backend API: https://fused-into-development.onrender.com/api

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

## Features

### Buyer
- Browse and search products with filters: category, price range, rating, vendor location
- Product detail page with images, description, seller info, and reviews
- Cart with quantity management, grouped by vendor
- Wishlist
- Checkout with saved address selection and Razorpay sandbox payment
- Order tracking: Placed > Confirmed > Shipped > Delivered
- Review and rating submission after delivery
- Two-factor authentication (email OTP)

### Vendor
- Register as a vendor (requires admin approval before listing)
- Add, edit, and delete products with multiple images (Cloudinary)
- Order management: view incoming orders, mark Confirmed or Shipped
- Earnings dashboard: total revenue, orders this week, top-selling products
- Inventory alerts for low stock

### Admin
- Approve or reject vendor registrations
- Platform analytics: total sales, revenue, top vendors, top categories
- Manage product categories and subcategories
- Handle refund requests: approve or reject
- Commission rate settings (vendor earnings after platform cut)

### AI
- AI-powered search: fuzzy matching and synonym expansion via OpenRouter (gpt-4o-mini)
- Product recommendations on the homepage

### Payments
- Razorpay sandbox checkout with 10-minute stock reservation
- Refund flow with admin approval queue
- Vendor payout history (simulated)

---

## Tech stack

| Layer    | Stack                                              |
|----------|----------------------------------------------------|
| Backend  | Node.js, Express 5, MongoDB, Mongoose              |
| Auth     | JWT (access 15m, refresh 7d), bcrypt, email OTP    |
| Payments | Razorpay sandbox                                   |
| Storage  | Cloudinary (product + vendor images)               |
| Frontend | React 19, Vite, Tailwind CSS 4                     |
| AI       | OpenRouter -- openai/gpt-4o-mini                   |

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

Creates:
- 1 admin, 2 buyers, 5 vendors (all approved)
- 3 root categories + 6 subcategories
- 30 products across all vendors
- 10 orders in various states

**Test credentials:**

| Role   | Email                 | Password     |
|--------|-----------------------|--------------|
| Admin  | admin@vendorhub.com   | Password@123 |
| Buyer  | buyer@vendorhub.com   | Password@123 |
| Vendor | vendor1@vendorhub.com | Password@123 |

### Frontend apps

```bash
cd frontend && npm install && npm run dev    # buyer -- :5173
cd vendor   && npm install && npm run dev    # seller dashboard -- :5174
cd admin    && npm install && npm run dev    # admin panel -- :5175
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

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

SMS / Twilio
-----------

SMS is disabled by default to avoid Twilio trial-account restrictions. To enable SMS verification, set the following in `backend/.env`:

```
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
```

If `SMS_ENABLED` is not set to `true`, SMS send/check calls are skipped and email OTP is used as the primary verification method.

---

## Razorpay test details

Use these in the Razorpay sandbox payment modal:

| Field       | Value                |
|-------------|----------------------|
| Card number | 4111 1111 1111 1111  |
| Expiry      | Any future date      |
| CVV         | Any 3 digits         |
| OTP         | 1234 (test mode)     |

UPI test ID: `success@razorpay`

---

## API overview

All routes are prefixed `/api`.

| Prefix        | Description                            |
|---------------|----------------------------------------|
| `/auth`       | Register, login, token refresh, 2FA    |
| `/products`   | Product CRUD, search, AI search        |
| `/vendors`    | Vendor profiles, approval              |
| `/orders`     | Place and track orders                 |
| `/payments`   | Razorpay checkout, verify, webhook     |
| `/refunds`    | Raise and manage refund requests       |
| `/reviews`    | Product reviews and ratings            |
| `/categories` | Browse categories                      |
| `/admin`      | Analytics, commission, category mgmt   |
| `/wishlist`   | Wishlist management                    |
| `/cart`       | Cart management                        |
| `/ai`         | AI-powered search expansion            |

---

## Known limitations

- Delivery fee system deferred to V2; all orders currently ship at no delivery charge.
- Vendor payout history is simulated; no real payout processing.
- AI recommendations use a basic recency model; collaborative filtering not implemented.
- Email OTP for 2FA requires a working SMTP config in `.env`.

---

## Team

DevFusion: The Developers Hackathon 2.0 | May 2026

| Name                 | Domain                                       |
|----------------------|----------------------------------------------|
| H R Soorya Dev       | Backend services, Razorpay integration       |
| Satrajit Mondal      | Buyer frontend (browsing, cart, checkout)    |
| Joshua Jacob Thomas  | Vendor dashboard, Admin panel                |
| Siddharth Madhavan   | Auth, API wiring, Cloudinary, state mgmt     |
