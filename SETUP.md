# Visitor Management PWA - Setup Guide

## ✅ Completed Features

- ✅ MongoDB + Mongoose schemas (User, Visitor, Department, Notification, Member)
- ✅ JWT Authentication with HTTP-only cookies
- ✅ Role-based access control (Guard/Admin)
- ✅ First-time setup wizard
- ✅ Visitor management (log, approve, reject)
- ✅ Member auto-detection (3+ visits)
- ✅ Department management
- ✅ Analytics APIs (weekly/monthly trends, member tracking)
- ✅ Notification polling system
- ✅ PDF & CSV report generation
- ✅ Progressive Web App (PWA) with service worker
- ✅ Tailwind CSS design system
- ✅ Offline-first capabilities

## 🚀 Quick Start

### Step 1: Install MongoDB

**Option A: Install MongoDB Community Server (Recommended)**
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" installation)
3. During installation, select "Install MongoDB as a Service"
4. MongoDB will start automatically on port 27017

**Option B: Use Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### Step 2: Verify MongoDB is Running

Open PowerShell and run:
```powershell
mongosh
```

You should see the MongoDB shell. Type `exit` to quit.

### Step 3: Start the Application

```bash
npm run dev
```

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

## 📋 First-Time Setup

1. On first launch, you'll see a setup wizard
2. Create your admin account:
   - Full Name
   - Username
   - Password
   - Recovery PIN (4-6 digits)
3. Click "Create Admin Account"
4. You'll be redirected to login

## 👥 User Roles

### Security Guard
- Log new visitors
- View visitors they logged
- See approval status

### Admin
- Approve/reject visitors
- Manage departments
- View analytics
- Generate reports
- Approve new user signups
- Manage members

## 🎨 Features Overview

### 1. Visitor Management
- **Guard**: Log visitors with name, contact, purpose, department
- **Admin**: Approve or reject pending visitors
- **Notifications**: Guard gets notified when visitor is approved/rejected

### 2. Member Tracking
- Auto-detect repeat visitors (3+ visits)
- Track visit count per member
- View member history

### 3. Analytics
- Weekly visitor trends (last 7 days)
- Monthly visitor trends (last 6 months)
- Department-wise distribution
- Member analytics (new vs returning)

### 4. Reports
- Generate PDF reports with filters
- Generate CSV exports
- Filter by date range, department, status

### 5. PWA Features
- Install as app on mobile/desktop
- Works offline (cached data)
- Push notification badges

## 🔧 Configuration

### Environment Variables (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/visitor_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=24h
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` in production!

## 📱 Testing the PWA

### Desktop (Chrome/Edge)
1. Open http://localhost:3000
2. Click the install icon in the address bar
3. App will open in its own window

### Android
1. Open http://localhost:3000 in Chrome
2. Menu → "Add to Home Screen"
3. App will appear on your home screen

## 🗄️ Database Collections

- **users**: Guard and Admin accounts
- **visitors**: Visitor records
- **departments**: College departments
- **notifications**: In-app notifications
- **members**: Repeat visitors (auto-detected)

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ JWT in HTTP-only cookies (XSS protection)
- ✅ Rate limiting on API endpoints
- ✅ PIN-based password recovery
- ✅ Admin approval for new users

## 📊 API Endpoints

### Authentication
- POST `/api/setup/check` - Check if setup needed
- POST `/api/setup/initialize` - Create first admin
- POST `/api/auth/login` - Login
- POST `/api/auth/signup` - Signup
- POST `/api/auth/logout` - Logout
- GET `/api/auth/me` - Get current user

### Visitors
- GET `/api/visitors` - Get all visitors
- POST `/api/visitors` - Log new visitor
- PUT `/api/visitors/:id/approve` - Approve visitor
- PUT `/api/visitors/:id/reject` - Reject visitor

### Analytics
- GET `/api/analytics/dashboard` - Dashboard stats
- GET `/api/analytics/weekly` - Weekly trends
- GET `/api/analytics/monthly` - Monthly trends
- GET `/api/analytics/members` - Member analytics

### Reports
- POST `/api/reports/pdf` - Generate PDF report
- POST `/api/reports/csv` - Generate CSV report

## 🐛 Troubleshooting

### MongoDB Connection Error
**Error**: `❌ MongoDB Connection Error`

**Solution**:
1. Check if MongoDB is running:
   ```powershell
   mongosh
   ```
2. If not running, start MongoDB service:
   ```powershell
   net start MongoDB
   ```

### Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
1. Change PORT in `.env` file
2. Or kill the process using port 3000:
   ```powershell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Tailwind CSS Not Building
**Solution**:
```bash
npx tailwindcss -i ./public/css/input.css -o ./public/css/styles.css --watch
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Change `JWT_SECRET` to a strong random string
3. Enable HTTPS for secure cookies
4. Build Tailwind for production:
   ```bash
   npx tailwindcss -i ./public/css/input.css -o ./public/css/styles.css --minify
   ```
5. Use PM2 or similar for process management:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name visitor-app
   ```

## 📝 Next Steps (Future Enhancements)

- [ ] Add Chart.js visualizations for analytics
- [ ] Add Three.js subtle background effects
- [ ] Implement photo capture for visitors
- [ ] Add bulk visitor operations
- [ ] Add visitor checkout process
- [ ] Email notifications (optional)
- [ ] QR code visitor passes
- [ ] Visitor pre-registration system

## 🆘 Support

For issues or questions:
1. Check MongoDB is running
2. Check .env configuration
3. Check browser console for errors
4. Check server logs

## 📜 License

ISC

---

**🎉 Your Visitor Management System is ready to use!**

Access it at: **http://localhost:3000**
