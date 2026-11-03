# Sanwra Traders API

Express + TypeScript API for **सांवरा ट्रेडर्स / Sanwra Traders**.

Serves:
- Public product catalog
- Public store settings (WhatsApp contact, UPI ID / QR)
- Public order submit (after UPI payment — no shopper auth)
- Admin JWT auth for products, settings, and orders

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

→ http://127.0.0.1:4311 · Health: `/health`

Leave `MONGODB_URI` empty for in-memory Mongo + seed.

## Env

| Variable | Notes |
|----------|--------|
| `PORT` | Render sets this |
| `MONGODB_URI` | Required in production (Atlas M0) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Single admin |
| `JWT_SECRET` | Strong random in production |
| `CORS_ORIGIN` | **Both** Vercel origins (storefront + admin), comma-separated |
| `CLOUDINARY_*` | Optional image hosting |

## API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/products` | — | Catalog |
| GET | `/api/settings` | — | Contact + UPI |
| POST | `/api/orders` | — | Submit paid order (name, phone, items) |
| POST | `/api/auth/login` | — | Admin JWT |
| CRUD | `/api/products` | Bearer | Admin products |
| PUT | `/api/settings` | Bearer | Contact / UPI / QR |
| GET/PATCH | `/api/orders` | Bearer | View / update order status |

## Render

- Build: `npm install && npm run build`
- Start: `npm start`
- Health: `/health`
- Set `CORS_ORIGIN` to storefront **and** admin Vercel URLs

## Frontends

- User storefront: https://github.com/satyam81030/sanwra-traders-frontend
- Admin app: https://github.com/satyam81030/sanwra-traders-admin
