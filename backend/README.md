# Vasista Pickles — Backend (Node + Express + MongoDB Atlas)

Production-ready REST API for the **Vasista Pickles** premium pickle brand.

## Tech
- Node.js / Express 4
- MongoDB Atlas + Mongoose
- JWT auth (Bearer token) + bcryptjs password hashing
- Helmet, CORS, rate limiting
- Cloudinary-ready image uploads
- Notification system (per-user + admin broadcast)

## Folder Structure

```
backend/
├── config/
│   ├── db.js                # MongoDB connection
│   └── cloudinary.js
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Review.js
│   ├── Notification.js
│   └── Contact.js
├── controllers/             # Route handlers
├── routes/                  # Express routers
├── middleware/              # auth.js, error.js
├── services/                # notification.service.js
├── scripts/
│   └── seed.js              # Seed products + admin
├── server.js
├── package.json
└── .env.example
```

## Setup

1. **Create MongoDB Atlas cluster** — copy the connection string.
2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```
3. **Configure environment**
   ```bash
   cp .env.example .env
   # edit .env: MONGODB_URI, JWT_SECRET, CLIENT_URL, admin creds
   ```
4. **Seed database** (creates products + admin + demo customer)
   ```bash
   npm run seed
   ```
5. **Run**
   ```bash
   npm run dev    # development (nodemon)
   npm start      # production
   ```

API runs at `http://localhost:5000`.

## Demo accounts (after seeding)
- Admin: `admin@vasistapickles.com` / `Admin@123`
- Customer: `customer@test.com` / `Customer@123`

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Customer signup |
| POST | `/api/auth/login` | Customer/admin login |
| POST | `/api/auth/admin/login` | Admin-only login |
| POST | `/api/auth/forgot-password` | Issue reset token |
| POST | `/api/auth/reset-password` | Reset with token |
| GET | `/api/auth/me` | Current user (Bearer) |

### Products (public read, admin write)
- `GET /api/products?q=&category=&sort=&page=&limit=&featured=`
- `GET /api/products/categories`
- `GET /api/products/:idOrSlug`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Orders
- `POST /api/orders` — place order
- `GET /api/orders/mine` — my orders
- `GET /api/orders/:id` — order detail
- `GET /api/orders/all` (admin)
- `PUT /api/orders/:id/status` (admin) — Pending → Confirmed → Processing → Packed → Shipped → Delivered

### Reviews
- `GET /api/reviews/product/:productId`
- `POST /api/reviews/product/:productId` (auth)
- `DELETE /api/reviews/:id` (auth/owner/admin)

### Wishlist
- `GET /api/wishlist`
- `POST /api/wishlist/:productId` (toggle)

### Notifications
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

### Contact
- `POST /api/contact`
- `GET /api/contact` (admin)

### Admin
- `GET /api/admin/dashboard` — stats + charts
- `GET /api/admin/customers?q=`
- `DELETE /api/admin/customers/:id`

### User profile
- `PUT /api/users/me`
- `PUT /api/users/me/password`
- `GET|POST /api/users/me/addresses`
- `DELETE /api/users/me/addresses/:id`

## Deployment

### Render (recommended)
1. Push `backend/` to a GitHub repo.
2. **New Web Service** → connect repo, root dir = `backend`.
3. Build: `npm install` — Start: `npm start`.
4. Add env vars from `.env.example` (MONGODB_URI, JWT_SECRET, CLIENT_URL = your frontend URL, admin creds).
5. After first deploy, open the Render Shell once and run `npm run seed`.

### Railway
- New project → Deploy from GitHub → select `backend` folder.
- Add the same env vars. `railway run npm run seed` once.

### VPS (Ubuntu)
```bash
sudo apt install -y nodejs npm
git clone <your-repo> && cd <repo>/backend
npm install --omit=dev
cp .env.example .env && nano .env
npm run seed
npm i -g pm2
pm2 start server.js --name vasista-api
pm2 save && pm2 startup
```
Front it with Nginx + Certbot for HTTPS.

## Frontend wiring

Set in the Lovable frontend (or `.env`):
```
VITE_API_URL=https://your-backend.onrender.com/api
```
