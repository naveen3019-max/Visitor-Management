# Visitor Management System - Technical Documentation

## 📐 System Architecture

### Architecture Pattern
**Serverless Microservices Architecture**
- Frontend: Static files served via Vercel CDN
- Backend: Serverless functions on Vercel
- Database: MongoDB Atlas (Cloud DBaaS)
- Authentication: JWT with HTTP-only cookies

### Technology Stack

#### Frontend
```
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS v3.4.0 (Utility-first CSS framework)
- Bootstrap Icons v1.11.3 (Icon library)
- Service Worker API (PWA capabilities)
- Fetch API (HTTP requests)
- LocalStorage API (Client-side caching)
```

#### Backend
```
- Node.js v18+ (JavaScript runtime)
- Express.js v4.x (Web framework)
- Mongoose v7.x (MongoDB ODM)
- JWT (jsonwebtoken v9.x)
- Bcrypt v5.x (Password hashing)
- Cookie-parser (Cookie handling)
- Helmet (Security headers)
- CORS (Cross-origin resource sharing)
- Compression (Response compression)
- Express-rate-limit (Rate limiting - dev only)
```

#### Database
```
- MongoDB Atlas v6.0
- Cloud-hosted NoSQL database
- Connection: mongodb+srv protocol
- Features: Auto-sharding, replication, backup
```

#### Development Tools
```
- Git/GitHub (Version control)
- Vercel CLI (Deployment)
- npm (Package management)
- dotenv (Environment variables)
```

---

## 🗂️ Project Structure

```
clg app/
├── api/
│   └── index.js                    # Vercel serverless entry point
├── public/
│   ├── index.html                  # Login page
│   ├── manifest.json               # PWA manifest
│   ├── service-worker.js           # PWA service worker (cache v13.8)
│   ├── css/
│   │   ├── input.css              # Tailwind source
│   │   └── styles.css             # Compiled Tailwind CSS
│   ├── icons/                     # PWA icons (placeholder)
│   └── js/
│       ├── api.js                 # API client wrapper
│       ├── app.js                 # Main application logic
│       └── auth.js                # Authentication handler
├── reports/                        # Local PDF/CSV storage (dev only)
├── server/
│   ├── server.js                  # Express app configuration
│   ├── config/
│   │   ├── db.js                  # MongoDB connection with pooling
│   │   └── jwt.js                 # JWT configuration
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── models/
│   │   ├── Department.js          # Department schema
│   │   ├── Member.js              # Faculty member schema
│   │   ├── Notification.js        # Notification schema
│   │   ├── User.js                # User/auth schema
│   │   └── Visitor.js             # Visitor entry schema
│   ├── routes/
│   │   ├── analytics.js           # Analytics endpoints
│   │   ├── auth.js                # Authentication endpoints
│   │   ├── departments.js         # Department CRUD
│   │   ├── members.js             # Member CRUD
│   │   ├── notifications.js       # Notification endpoints
│   │   ├── reports.js             # PDF/CSV generation
│   │   ├── setup.js               # Initial setup check
│   │   ├── users.js               # User management
│   │   └── visitors.js            # Visitor logging/management
│   └── utils/
│       ├── csvGenerator.js        # CSV export utility
│       └── pdfGenerator.js        # PDF generation utility (PDFKit)
├── .env                           # Environment variables (dev only)
├── .gitignore                     # Git ignore rules
├── .vercelignore                  # Vercel ignore rules
├── package.json                   # npm dependencies
├── package-lock.json              # Dependency lock file
├── postcss.config.js              # PostCSS configuration (Tailwind)
├── tailwind.config.js             # Tailwind CSS configuration
├── vercel.json                    # Vercel deployment config
├── README.md                      # Project readme
├── SETUP.md                       # Setup instructions
├── VERCEL_FIX_GUIDE.md           # Vercel troubleshooting
├── PROJECT_OVERVIEW.md            # Client documentation
└── TECHNICAL_DOCUMENTATION.md     # This file
```

---

## 🗄️ Database Schema

### Collections

#### 1. Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required, indexed),
  password: String (bcrypt hashed, required),
  role: String (enum: ['principal', 'guard'], required),
  fullName: String (required),
  email: String,
  phone: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `username: 1` (unique)

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "guard1",
  "password": "$2b$10$abcd1234...",
  "role": "guard",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "createdAt": "2026-01-21T10:00:00Z",
  "updatedAt": "2026-01-21T10:00:00Z"
}
```

#### 2. Visitors Collection
```javascript
{
  _id: ObjectId,
  name: String (required, indexed),
  contact: String (required, indexed),
  purpose: String (required),
  personToMeet: ObjectId (ref: 'Member', required),
  timeIn: Date (required, default: Date.now),
  timeOut: Date (optional),
  guardId: ObjectId (ref: 'User', required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `name: 1`
- `contact: 1`
- `timeIn: -1` (for sorting)

**Virtual Fields:**
- `personToMeetDetails` (populated from Member)

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "contact": "9876543210",
  "purpose": "Meeting with HOD",
  "personToMeet": "507f1f77bcf86cd799439020",
  "timeIn": "2026-01-21T09:30:00Z",
  "timeOut": null,
  "guardId": "507f1f77bcf86cd799439011",
  "createdAt": "2026-01-21T09:30:00Z",
  "updatedAt": "2026-01-21T09:30:00Z"
}
```

#### 3. Departments Collection
```javascript
{
  _id: ObjectId,
  name: String (required, unique, indexed),
  description: String,
  head: ObjectId (ref: 'Member', optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `name: 1` (unique)

#### 4. Members Collection
```javascript
{
  _id: ObjectId,
  name: String (required, indexed),
  phone: String (required, unique, indexed),
  email: String (required, unique),
  departmentId: ObjectId (ref: 'Department', required, indexed),
  designation: String (required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `name: 1`
- `phone: 1` (unique)
- `departmentId: 1`

#### 5. Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, indexed),
  visitorId: ObjectId (ref: 'Visitor', required),
  message: String (required),
  read: Boolean (default: false, indexed),
  createdAt: Date (auto, indexed),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId: 1`
- `read: 1`
- `createdAt: -1`

**TTL Index:** Notifications auto-delete after 30 days
```javascript
createdAt: 1 (expires after 2592000 seconds)
```

---

## 🔌 API Endpoints

### Base URL
```
Development: http://localhost:3000
Production: https://visitor-management-dun.vercel.app
```

### Authentication Endpoints

#### POST /api/auth/login
**Description:** User login with username/password
**Request:**
```json
{
  "username": "guard1",
  "password": "guard123"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "guard1",
    "role": "guard",
    "fullName": "John Doe"
  }
}
```
**Set-Cookie:** `token=<JWT>; HttpOnly; Max-Age=86400; Path=/; SameSite=Strict`

#### POST /api/auth/logout
**Description:** User logout (clears cookie)
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/verify
**Description:** Verify current JWT token
**Headers:** `Cookie: token=<JWT>`
**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "guard1",
    "role": "guard",
    "fullName": "John Doe"
  }
}
```

---

### Visitor Endpoints

#### POST /api/visitors
**Description:** Log new visitor entry (Guards only)
**Auth Required:** Yes (JWT cookie)
**Request:**
```json
{
  "name": "Jane Smith",
  "contact": "9876543210",
  "purpose": "Meeting with HOD",
  "personToMeet": "507f1f77bcf86cd799439020"
}
```
**Response:**
```json
{
  "message": "Visitor logged successfully",
  "visitor": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "contact": "9876543210",
    "purpose": "Meeting with HOD",
    "personToMeet": "507f1f77bcf86cd799439020",
    "timeIn": "2026-01-21T09:30:00Z",
    "timeOut": null,
    "guardId": "507f1f77bcf86cd799439011"
  }
}
```

#### GET /api/visitors
**Description:** Get all visitors (with filters)
**Auth Required:** Yes
**Query Parameters:**
- `status`: `inside` | `checkedout` | `all` (default: all)
- `guardId`: Filter by guard (optional)
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)

**Response:**
```json
{
  "visitors": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "contact": "9876543210",
      "purpose": "Meeting with HOD",
      "personToMeet": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Dr. Kumar",
        "department": "Computer Science"
      },
      "timeIn": "2026-01-21T09:30:00Z",
      "timeOut": null,
      "guardId": "507f1f77bcf86cd799439011",
      "status": "inside"
    }
  ],
  "count": 1
}
```

#### GET /api/visitors/:id
**Description:** Get single visitor details
**Auth Required:** Yes
**Response:**
```json
{
  "visitor": { /* visitor object */ }
}
```

#### PUT /api/visitors/:id/checkout
**Description:** Record visitor checkout
**Auth Required:** Yes (Guards only)
**Response:**
```json
{
  "message": "Visitor checked out successfully",
  "visitor": {
    "_id": "507f1f77bcf86cd799439012",
    "timeOut": "2026-01-21T11:30:00Z"
  }
}
```

#### GET /api/visitors/stats
**Description:** Get visitor statistics
**Auth Required:** Yes (Principal only)
**Response:**
```json
{
  "total": 150,
  "inside": 12,
  "checkedOut": 138,
  "today": 8,
  "thisWeek": 45,
  "thisMonth": 150
}
```

---

### Analytics Endpoints

#### GET /api/analytics/hourly
**Description:** Get hourly visitor distribution (8 AM - 6 PM)
**Auth Required:** Yes (Principal only)
**Response:**
```json
{
  "hourly": [
    { "hour": 8, "count": 5 },
    { "hour": 9, "count": 12 },
    { "hour": 10, "count": 18 },
    // ... up to hour 18
  ]
}
```

#### GET /api/analytics/daily
**Description:** Get daily visitor count (last 7 days)
**Auth Required:** Yes (Principal only)
**Response:**
```json
{
  "daily": [
    { "date": "2026-01-15", "count": 20 },
    { "date": "2026-01-16", "count": 25 },
    // ... 7 days total
  ]
}
```

#### GET /api/analytics/weekly
**Description:** Get weekly visitor count (last 4 weeks)
**Auth Required:** Yes (Principal only)
**Response:**
```json
{
  "weekly": [
    { "week": "Week 1", "startDate": "2025-12-25", "count": 95 },
    { "week": "Week 2", "startDate": "2026-01-01", "count": 110 },
    // ... 4 weeks total
  ]
}
```

---

### Notification Endpoints

#### GET /api/notifications
**Description:** Get user notifications
**Auth Required:** Yes
**Query Parameters:**
- `unreadOnly`: `true` | `false` (default: false)
- `limit`: Number (default: 50)

**Response:**
```json
{
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "userId": "507f1f77bcf86cd799439011",
      "visitorId": "507f1f77bcf86cd799439012",
      "message": "New visitor: Jane Smith - Purpose: Meeting with HOD",
      "read": false,
      "createdAt": "2026-01-21T09:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

#### PUT /api/notifications/:id/read
**Description:** Mark notification as read
**Auth Required:** Yes
**Response:**
```json
{
  "message": "Notification marked as read"
}
```

#### PUT /api/notifications/mark-all-read
**Description:** Mark all notifications as read
**Auth Required:** Yes
**Response:**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### Report Endpoints

#### GET /api/reports/pdf
**Description:** Generate PDF report
**Auth Required:** Yes (Principal only)
**Query Parameters:**
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="visitor-report-2026-01-21.pdf"
<PDF binary data>
```

#### GET /api/reports/csv
**Description:** Generate CSV report
**Auth Required:** Yes (Principal only)
**Query Parameters:** Same as PDF

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="visitor-report-2026-01-21.csv"
Name,Contact,Purpose,Person To Meet,Time In,Time Out
Jane Smith,9876543210,Meeting with HOD,Dr. Kumar,2026-01-21 09:30,2026-01-21 11:30
```

---

### Department Endpoints

#### GET /api/departments
**Description:** Get all departments
**Auth Required:** Yes

#### POST /api/departments
**Description:** Create new department
**Auth Required:** Yes (Principal only)
**Request:**
```json
{
  "name": "Computer Science",
  "description": "CS Department",
  "head": "507f1f77bcf86cd799439020"
}
```

#### PUT /api/departments/:id
**Description:** Update department
**Auth Required:** Yes (Principal only)

#### DELETE /api/departments/:id
**Description:** Delete department
**Auth Required:** Yes (Principal only)

---

### Member Endpoints

#### GET /api/members
**Description:** Get all faculty members
**Auth Required:** Yes

#### POST /api/members
**Description:** Create new member
**Auth Required:** Yes (Principal only)
**Request:**
```json
{
  "name": "Dr. Kumar",
  "phone": "9876543210",
  "email": "kumar@example.com",
  "departmentId": "507f1f77bcf86cd799439040",
  "designation": "Professor"
}
```

#### PUT /api/members/:id
**Description:** Update member
**Auth Required:** Yes (Principal only)

#### DELETE /api/members/:id
**Description:** Delete member
**Auth Required:** Yes (Principal only)

---

### User Management Endpoints

#### GET /api/users
**Description:** Get all users (Principal only)
**Auth Required:** Yes (Principal only)

#### POST /api/users
**Description:** Create new user
**Auth Required:** Yes (Principal only)
**Request:**
```json
{
  "username": "guard2",
  "password": "password123",
  "role": "guard",
  "fullName": "Mike Johnson",
  "email": "mike@example.com",
  "phone": "1234567890"
}
```

---

### Setup Endpoint

#### GET /api/setup/check
**Description:** Check if initial setup is complete
**Auth Required:** No
**Response:**
```json
{
  "setupComplete": true
}
```

---

## 🔐 Authentication & Authorization

### JWT Configuration

**Location:** `server/config/jwt.js`

```javascript
module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
};
```

### Token Structure

**Payload:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "username": "guard1",
  "role": "guard",
  "iat": 1737475200,
  "exp": 1737561600
}
```

### Middleware Flow

**File:** `server/middleware/auth.js`

```javascript
// 1. Extract token from HTTP-only cookie
// 2. Verify JWT signature
// 3. Check expiration
// 4. Attach user to req.user
// 5. Continue to route handler
```

### Role-Based Access Control

**Implementation:**
```javascript
// Check role in route
if (req.user.role !== 'principal') {
  return res.status(403).json({ message: 'Access denied' });
}
```

**Protected Routes:**
- Principal-only: Analytics, Reports, User Management, Stats
- Guard-only: Visitor Checkout (own entries)
- Both: Notifications, Visitor List, Department/Member viewing

---

## 🗃️ Database Connection

### MongoDB Atlas Connection

**File:** `server/config/db.js`

**Features:**
- Connection pooling with singleton pattern
- Automatic retry on failure
- 10-second connection timeout
- Error logging

**Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Environment Variable:**
```
MONGODB_URI=mongodb+srv://vistor:6EFBIRhsUR1uFw7D@cluster0.gcg0qfz.mongodb.net/visitor-management?retryWrites=true&w=majority
```

**Connection Options:**
```javascript
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
}
```

---

## 🛠️ Development Setup

### Prerequisites
```bash
Node.js v18+ (LTS)
npm v9+
Git v2.30+
MongoDB Atlas account
Vercel account (for deployment)
```

### Installation Steps

1. **Clone Repository:**
```bash
git clone https://github.com/naveen3019-max/Visitor-Management.git
cd Visitor-Management
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Create Environment File:**
```bash
# Create .env file in root directory
MONGODB_URI=mongodb+srv://vistor:6EFBIRhsUR1uFw7D@cluster0.gcg0qfz.mongodb.net/visitor-management
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-2024
PORT=3000
NODE_ENV=development
```

4. **Compile Tailwind CSS:**
```bash
npx tailwindcss -i ./public/css/input.css -o ./public/css/styles.css --watch
```

5. **Start Development Server:**
```bash
npm start
# OR
node server/server.js
```

6. **Access Application:**
```
http://localhost:3000
```

---

## 🚀 Deployment (Vercel)

### Configuration Files

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

#### .vercelignore
```
node_modules
.env
reports
*.log
.git
```

### Deployment Steps

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

### Environment Variables Setup

**In Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add the following:

```
MONGODB_URI = mongodb+srv://vistor:6EFBIRhsUR1uFw7D@cluster0.gcg0qfz.mongodb.net/visitor-management?retryWrites=true&w=majority
JWT_SECRET = your-super-secret-jwt-key-min-32-chars-long-2024
NODE_ENV = production
```

3. Select: Production, Preview, Development ✓
4. Save

### MongoDB Atlas Configuration

**Network Access:**
1. MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. Confirm

**Why?** Vercel serverless functions use dynamic IPs.

---

## ⚡ Performance Optimizations

### Frontend

1. **Static Asset Caching:**
   - Service Worker caches CSS, JS, icons
   - Cache version: v13.8
   - Cache-first strategy for static assets
   - Network-first for API calls

2. **Code Splitting:**
   - Separate files: api.js, auth.js, app.js
   - Load only required scripts per page

3. **Tailwind CSS:**
   - Purged unused styles in production
   - Minified output
   - JIT compilation

### Backend

1. **Database Connection Pooling:**
   - Singleton pattern
   - Reuse connections across requests
   - Prevents connection exhaustion

2. **Mongoose Query Optimization:**
   - Indexed fields for fast queries
   - `.lean()` for read-only queries
   - Selective field projection

3. **Response Compression:**
   - Gzip compression middleware
   - Reduces payload size by ~70%

4. **Rate Limiting (Development):**
   - 100 requests per 15 minutes per IP
   - Disabled in production (Vercel handles this)

---

## 🔒 Security Features

### 1. Password Security
```javascript
// Hashing
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Verification
const isMatch = await bcrypt.compare(password, hashedPassword);
```

### 2. JWT Security
- **HTTP-only cookies** (prevents XSS attacks)
- **SameSite=Strict** (prevents CSRF attacks)
- **24-hour expiration**
- **Secure flag in production** (HTTPS only)

### 3. Helmet Security Headers
```javascript
helmet({
  contentSecurityPolicy: false // Allow inline scripts for PWA
})
```

**Headers Set:**
- X-DNS-Prefetch-Control
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

### 4. Input Validation
- **Frontend:** HTML5 validation
- **Backend:** Mongoose schema validation
- **Sanitization:** Trim whitespace, lowercase emails

### 5. MongoDB Security
- **Atlas encryption at rest**
- **TLS/SSL in transit**
- **No credentials in code** (environment variables only)

### 6. CORS Configuration
```javascript
cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false 
    : 'http://localhost:3000',
  credentials: true
})
```

---

## 📊 Monitoring & Logging

### Console Logging

**Levels:**
- `✅` Success operations
- `❌` Errors and failures
- `⚠️` Warnings
- `ℹ️` Informational

**Examples:**
```javascript
console.log('✅ MongoDB connected successfully');
console.error('❌ MongoDB Connection Error:', err.message);
```

### Error Handling

**Global Error Handler:**
```javascript
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

**Database Errors:**
- Connection failures logged to console
- Automatic retry on connection loss
- Graceful degradation

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Token expiration (24h)
- [ ] Role-based access control

#### Visitor Management
- [ ] Log new visitor (Guard)
- [ ] View visitor list
- [ ] Checkout visitor
- [ ] Filter visitors (inside/checked out)
- [ ] View visitor details

#### Notifications
- [ ] Notification creation on visitor log
- [ ] Notification display
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Unread count badge

#### Analytics
- [ ] Hourly graph data
- [ ] Daily graph data
- [ ] Weekly graph data
- [ ] Graph rendering
- [ ] Hover tooltips

#### Reports
- [ ] PDF generation
- [ ] CSV generation
- [ ] Date range filtering
- [ ] File download

### API Testing (Postman)

**Base URL:** `http://localhost:3000` or `https://visitor-management-dun.vercel.app`

**Test Cases:**
1. POST /api/auth/login → Should return token cookie
2. GET /api/visitors → Should require authentication
3. POST /api/visitors → Should log visitor
4. GET /api/analytics/hourly → Should return graph data

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Timeout
**Error:** `MongooseError: Operation buffering timed out after 10000ms`

**Solutions:**
1. Check MongoDB Atlas Network Access (whitelist 0.0.0.0/0)
2. Verify MONGODB_URI environment variable is set
3. Check MongoDB Atlas cluster status
4. Increase connection timeout in db.js

### Issue 2: JWT Token Invalid
**Error:** `Invalid token` or `jwt malformed`

**Solutions:**
1. Check JWT_SECRET is set correctly
2. Verify token is sent in cookie (not header)
3. Clear browser cookies and re-login
4. Check token expiration (24h)

### Issue 3: CORS Error
**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**
1. Check CORS configuration in server.js
2. Verify credentials: true in CORS options
3. Ensure cookies are sent with credentials: 'include'

### Issue 4: Rate Limiting Error on Vercel
**Error:** `ERR_ERL_PERMISSIVE_TRUST_PROXY`

**Solution:**
- Rate limiting is disabled in production (skip: true for production)
- Vercel has built-in rate limiting

### Issue 5: CSS Not Loading on Vercel
**Error:** 404 on /css/styles.css

**Solutions:**
1. Ensure styles.css is NOT in .gitignore
2. Compile Tailwind before deployment
3. Commit compiled CSS to repository

### Issue 6: Reports Directory Error
**Error:** `ENOENT: no such file or directory, mkdir '/var/task/reports'`

**Solution:**
- PDF/CSV generators use /tmp directory in production
- Check NODE_ENV is set to 'production' in Vercel

---

## 📈 Scalability Considerations

### Current Capacity
- **Concurrent Users:** 100+ (serverless auto-scaling)
- **Database:** MongoDB Atlas M0 (512 MB, shared)
- **Daily Visitors:** Unlimited (database dependent)
- **Request Rate:** Vercel limits apply

### Scaling Options

#### Database Scaling
- Upgrade to M2/M5 cluster (dedicated)
- Enable sharding for large collections
- Add read replicas for analytics queries

#### Application Scaling
- Vercel automatically scales serverless functions
- Add Redis cache for frequently accessed data
- Implement CDN for static assets (already done)

#### Code Optimization
- Add database query caching
- Implement pagination for large datasets
- Use aggregation pipelines for analytics

---

## 🔄 Version Control & CI/CD

### Git Workflow

**Branches:**
- `main` - Production branch (auto-deploys to Vercel)
- Feature branches not currently used

**Commit Convention:**
```
feat: Add visitor checkout feature
fix: Resolve MongoDB connection timeout
docs: Update technical documentation
style: Format code with prettier
refactor: Optimize database queries
```

### Continuous Deployment

**Vercel Integration:**
1. Push to GitHub `main` branch
2. Vercel automatically detects push
3. Builds and deploys in ~2-3 minutes
4. Production URL updated instantly

**Deployment URL Pattern:**
```
Production: visitor-management-dun.vercel.app
Preview: visitor-management-<hash>-naveen3019-maxs-projects.vercel.app
```

---

## 🛠️ Maintenance Tasks

### Regular Maintenance

**Daily:**
- Monitor Vercel deployment logs
- Check for error spikes

**Weekly:**
- Review notification cleanup (30-day TTL)
- Backup MongoDB Atlas (automatic)

**Monthly:**
- Review and optimize database indexes
- Update npm dependencies
- Security audit

### Backup Strategy

**MongoDB Atlas:**
- Automatic daily backups (retained 2 days on M0)
- Point-in-time recovery available on paid tiers
- Manual backup via mongodump

**Code:**
- Version controlled on GitHub
- Protected main branch
- All commits preserved

---

## 📚 Additional Resources

### Documentation Links
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose ODM Docs](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Repository
- **GitHub:** https://github.com/naveen3019-max/Visitor-Management.git
- **Clone:** `git clone https://github.com/naveen3019-max/Visitor-Management.git`

---

## 📞 Technical Support Contact

### For Development Issues
- Check TECHNICAL_DOCUMENTATION.md (this file)
- Review VERCEL_FIX_GUIDE.md for deployment issues
- Check GitHub issues

### For Client Issues
- Refer to PROJECT_OVERVIEW.md
- Check SETUP.md for initial setup

---

## 📝 Changelog

### Version 1.0.0 (January 21, 2026)
- ✅ Initial production release
- ✅ Removed visitor approval workflow
- ✅ Added instant notifications
- ✅ Added bar graph analytics (hourly/daily/weekly)
- ✅ Fixed Vercel deployment issues
- ✅ Optimized serverless architecture
- ✅ Added /tmp directory for reports in production
- ✅ Disabled rate limiting in production
- ✅ Added trust proxy configuration

---

**Document Version:** 1.0.0  
**Last Updated:** January 21, 2026  
**Author:** Development Team  
**Status:** ✅ Production Ready
