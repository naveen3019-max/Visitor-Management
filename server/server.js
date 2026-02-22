// Load environment variables (only for local development)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

// Initialize app
const app = express();

// Trust proxy for Vercel/serverless deployment (required for rate limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// Disable caching for development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Connect to MongoDB (async for serverless)
connectDB().catch(err => console.error('MongoDB connection failed:', err));

// Rate limiting - only for local development (Vercel has built-in rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in production (Vercel handles this)
  skip: () => process.env.NODE_ENV === 'production'
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for PWA
}));

// CORS configuration - allow mobile app and web requests
const allowedOrigins = [
  'http://localhost:3000',
  'capacitor://localhost',
  'http://localhost',
  'https://visitor-management-psi.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('capacitor://')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now (mobile app compatibility)
    }
  },
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/setup', require('./routes/setup'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/members', require('./routes/members'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Export for Vercel
module.exports = app;

// Start server only when not in serverless environment
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 Visitor Management System                            ║
║   📍 Server running on http://localhost:${PORT}           ║
║   🗄️  Database: ${process.env.MONGODB_URI}                ║
║   🌐 Environment: ${process.env.NODE_ENV || 'development'} ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}
