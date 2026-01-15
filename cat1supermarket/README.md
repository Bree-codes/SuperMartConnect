# SuperMart Distributed System

A full-stack supermarket web application with inventory management, customer shopping, and sales reporting.

## Tech Stack

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React 18 + Vite + TailwindCSS
- **Charts**: Chart.js + react-chartjs-2
- **Authentication**: JWT (JSON Web Tokens)

## Features

### Customer Features
- Browse products across multiple branches (Kisumu, Mombasa, Nakuru, Eldoret)
- Filter products by branch
- Add to cart and checkout with M-Pesa simulation
- Real-time stock updates

### Admin Features
- View inventory across all branches
- Restock products
- Sales reports with charts
- Revenue analytics

## Project Structure

```
supermarket-app/
├── server/                 # Backend API
│   ├── index.js           # Express server entry
│   ├── database.js        # SQLite setup & seeding
│   ├── middleware/        # Auth middleware
│   │   └── auth.js
│   └── routes/            # API routes
│       ├── auth.js
│       ├── inventory.js
│       └── sales.js
├── client/                # Frontend React app
│   ├── src/
│   │   ├── api.js         # API client
│   │   ├── App.jsx        # Main app with routing
│   │   └── components/    # React components
│   │       ├── AdminView.jsx
│   │       ├── AuthForms.jsx
│   │       ├── CustomerView.jsx
│   │       ├── Layout.jsx
│   │       └── ThemeToggle.jsx
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

   Or install manually:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

### Running the Application

**Development mode (runs both server and client):**
```bash
npm run dev
```

**Run server only:**
```bash
npm run dev:server
# Server runs at http://localhost:3000
```

**Run client only:**
```bash
npm run dev:client
# Client runs at http://localhost:5173
```

**Production build:**
```bash
npm run build
npm start
```

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | 123 |
| Customer | user | 123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Inventory
- `GET /api/inventory` - Get all products (query param: `?branch=Kisumu`)
- `PUT /api/inventory/:id/stock` - Update stock

### Sales
- `POST /api/sales` - Record a sale
- `GET /api/sales/report` - Get sales report

## Branches Included
- Kisumu
- Mombasa
- Nakuru
- Eldoret

## Products
- Coke (KES 100-120)
- Fanta (KES 100-115)
- Sprite (KES 100-110)

