# Visitor Management PWA

A local-only Progressive Web App for managing college visitors with role-based access control.

## Features

- 🔐 JWT Authentication (Guard/Admin roles)
- 👮 Security Guard: Log visitors, view approval status
- 🧑‍💼 Admin: Approve visitors, manage departments, view analytics
- 📊 Analytics with Chart.js (weekly/monthly trends, member tracking)
- 🎨 Subtle Three.js effects for enhanced UI
- 📱 PWA with offline capabilities
- 📄 PDF & CSV report generation
- 🗄️ Local MongoDB storage

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Community Server (installed as Windows service)
- Modern web browser

## Installation

1. Install dependencies:
```bash
npm install
```

2. Ensure MongoDB is running on `localhost:27017`

3. Start the application:
```bash
npm run dev
```

4. Build Tailwind CSS (in separate terminal):
```bash
npm run build:css
```

5. Open browser and navigate to `http://localhost:3000`

## First Time Setup

On first launch, you'll be prompted to create an admin account. This is a one-time setup.

## Project Structure

```
├── server/              # Backend (Express + Mongoose)
│   ├── config/         # Database & JWT config
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & role middleware
│   ├── utils/          # PDF/CSV generators
│   └── server.js       # Entry point
├── public/             # Frontend (PWA)
│   ├── pages/          # HTML pages
│   ├── js/             # JavaScript logic
│   ├── css/            # Tailwind CSS
│   └── manifest.json   # PWA manifest
└── .env                # Environment variables
```

## Default Ports

- Application: `3000`
- MongoDB: `27017`

## Security

- Passwords hashed with bcrypt
- JWT stored in HTTP-only cookies
- PIN-based password recovery
- No external services (local-only)

## License

ISC
