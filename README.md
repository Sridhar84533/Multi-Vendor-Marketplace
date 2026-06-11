# 🛒 Multi-Vendor Marketplace

A full-stack, production-ready **Multi-Vendor E-Commerce Platform** built with the MERN stack (MongoDB, Express, React, Node.js). Features role-based dashboards for Customers, Sellers, and Admins, real-time notifications, PDF invoice generation, and a complete checkout flow.

---

## 📸 Screenshots

> Storefront · Seller Central · Admin Panel

---

## 🚀 Features

### 🛍️ Customer
- Browse & search products with filters (category, brand, price, rating)
- Product detail pages with image zoom, variants, specifications
- Shopping cart with persistent state
- Wishlist management
- Checkout with address selection, coupon codes, loyalty points
- Cash on Delivery & Razorpay online payment
- **Auto-generated PDF invoice** emailed on every order
- Instant **invoice download** from the Order Success page
- Order tracking with live status history
- Product reviews (rating + comment + verified purchase badge)
- Real-time notifications (Socket.IO)
- Customer dashboard (orders, profile, wishlist, loyalty points)

### 🏪 Seller (Vendor)
- Seller Central dashboard with revenue & order statistics
- Add / Edit / Delete products with image upload (Cloudinary)
- Inventory management table
- Order fulfilment & status updates
- Pending approval flow (admin must approve before listing)

### 🔑 Admin
- Standalone Admin Panel at `localhost:5174`
- Platform analytics (revenue, users, vendors, orders)
- User management (view, block/unblock)
- Vendor management (approve/reject registrations)
- Platform-wide order oversight

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Redux Toolkit, React Router v6 |
| **Admin Panel** | React 18, Vite (standalone app on port 5174) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **File Uploads** | Multer + Cloudinary |
| **Payments** | Razorpay (with COD fallback) |
| **PDF Invoices** | PDFKit |
| **Email** | Nodemailer (Gmail / SMTP) |
| **Real-time** | Socket.IO |
| **Styling** | Vanilla CSS (custom design system) |

---

## 📁 Project Structure

```
Multi-Vendor Marketplace/
├── backend/                  # Node.js + Express API
│   ├── config/               # DB & Cloudinary config
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth, Role guards
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── utils/                # Invoice PDF, Email helpers
│   ├── uploads/              # Local file uploads (if Cloudinary disabled)
│   └── server.js             # App entry point
│
├── frontend/                 # React storefront (port 5173)
│   └── src/
│       ├── components/       # Navbar, Footer, SearchBar, etc.
│       ├── pages/            # Home, Products, Checkout, Orders…
│       ├── seller/           # Seller dashboard & product management
│       ├── redux/            # Auth, Cart, Wishlist slices
│       ├── services/         # Axios API service
│       └── styles/           # Global CSS design system
│
└── admin/                    # Standalone Admin Panel (port 5174)
    └── src/
        ├── components/       # Sidebar, Header, Loader
        ├── pages/            # Dashboard, UserManagement, VendorManagement
        └── services/         # Axios API service
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/multivendor

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary (for product image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (for online payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (Nodemailer - Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:5173
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🖥️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/multi-vendor-marketplace.git
cd multi-vendor-marketplace
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (Storefront)
cd ../frontend
npm install

# Admin Panel
cd ../admin
npm install
```

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
# Then open .env and fill in your values
```

### 4. Start all three services

Open **3 separate terminals**:

```bash
# Terminal 1 — Backend API
cd backend
npm start

# Terminal 2 — Customer Storefront
cd frontend
npm run dev

# Terminal 3 — Admin Panel
cd admin
npm run dev
```

| Service | URL |
|---|---|
| Backend API | `http://localhost:5000` |
| Customer Storefront | `http://localhost:5173` |
| Admin Panel | `http://localhost:5174` |

---

## 👤 Role Management

Roles are assigned in **MongoDB** manually (by design for security):

```js
// Make a user an Admin
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })

// Make a user a Seller + approve their vendor profile
db.users.updateOne({ email: "seller@example.com" }, { $set: { role: "vendor" } })
db.vendors.updateOne({ businessName: "My Store" }, { $set: { isApproved: true } })
```

| Role | Access |
|---|---|
| `customer` | Default on registration. Can shop, review, track orders. |
| `vendor` | Seller Central dashboard. Can list & manage products. Requires admin approval. |
| `admin` | Full Admin Panel at `localhost:5174`. Platform-wide controls. |

> After changing a role in MongoDB, the user must **sign out and sign back in** to get a refreshed JWT.

---

## 📧 Invoice & Receipt System

After every successful order:
1. The backend **auto-generates a professional PDF invoice** (including GST breakdown).
2. The invoice is **emailed to the customer** as a PDF attachment.
3. The customer lands on the **Order Success page** with a direct **Download Invoice** button.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Built with ❤️ using the MERN Stack</p>
