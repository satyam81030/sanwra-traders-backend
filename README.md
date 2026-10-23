# Sanwra Traders API

Node.js + Express + TypeScript REST API for the Sanwra Traders clothing storefront. Public product reads; admin-only JWT auth for product CRUD and image upload.

## Stack

- Express + TypeScript (`tsx` in development)
- MongoDB via Mongoose
- JWT admin auth (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Cloudinary for images when `CLOUDINARY_*` is set; otherwise local `/uploads` or image URLs

## Local development

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Default URL: [http://127.0.0.1:4311](http://127.0.0.1:4311)

- Health: `GET /health`
- Products: `GET /api/products`
- Admin login: `POST /api/auth/login` with `{ "email", "password" }`

### MongoDB without Atlas (local/dev)

Leave `MONGODB_URI` empty. The server starts an **in-memory MongoDB** and seeds sample clothing items. Data is lost when the process exits.

### Free MongoDB Atlas (M0) — production / shared DB

1. Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **free M0** cluster (Shared / Free tier).
3. **Database Access** → add a user (username + password).
4. **Network Access** → allow `0.0.0.0/0` (required for Render) or your IPs.
5. **Connect** → Drivers → copy the `mongodb+srv://...` URI; replace `<password>` and set a DB name (e.g. `sanwra`).
6. Set `MONGODB_URI` in `.env` or on Render.

### Cloudinary (optional, free tier)

1. Create a free account at [https://cloudinary.com](https://cloudinary.com).
2. Copy Cloud name, API Key, API Secret into `CLOUDINARY_*`.
3. If unset, admin uploads are saved under `uploads/` and served at `/uploads/...`, or you can paste an image URL.

## Environment variables

See `.env.example`. Important:

| Variable | Purpose |
|----------|---------|
| `PORT` | Listen port (Render sets this) |
| `MONGODB_URI` | Atlas URI (required in production) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Single admin login |
| `JWT_SECRET` | JWT signing secret |
| `CORS_ORIGIN` | Comma-separated frontend origins |
| `CLOUDINARY_*` | Optional image hosting |

Default local admin: `admin@sanwratraders.com` / `changeme-admin` (change in production).

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/api/products` | — | List products (`?available=true`, `?category=`) |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/auth/login` | — | Admin login → JWT |
| GET | `/api/auth/me` | Bearer | Current admin |
| POST | `/api/products` | Bearer | Create (JSON or `multipart/form-data` with `image`) |
| PUT | `/api/products/:id` | Bearer | Update |
| DELETE | `/api/products/:id` | Bearer | Delete |

Product fields: `name`, `description`, `price`, `currency`, `size`, `category` (`shirts` \| `trousers` \| `dresses` \| `outerwear` \| `knitwear` \| `accessories` \| `other`), `available`, `imageUrl`.

## Deploy on Render

1. Connect this GitHub repo as a **Web Service**.
2. Settings:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Health check path:** `/health`
3. Environment variables: set all from `.env.example` (especially `MONGODB_URI`, `JWT_SECRET`, `ADMIN_*`, `CORS_ORIGIN`).
4. Set `CORS_ORIGIN` to your Vercel URLs, e.g.  
   `https://sanwratraders.com,https://www.sanwratraders.com,https://your-app.vercel.app`
