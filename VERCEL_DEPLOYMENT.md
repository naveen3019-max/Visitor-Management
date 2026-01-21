# Vercel Deployment Guide

## Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Create a Vercel account at https://vercel.com

## Setup Steps

### 1. Build CSS
```bash
npm run build:css
```

### 2. Set Environment Variables in Vercel Dashboard
Go to your project settings and add:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Your JWT secret key (e.g., use a random 32+ character string)
- `NODE_ENV` - Set to "production"

### 3. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Using GitHub (Recommended)**
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables in the project settings
5. Deploy

### 4. Configure MongoDB Atlas

Make sure your MongoDB Atlas cluster allows connections from anywhere:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. Or add Vercel's IP ranges

### 5. Update CORS Settings (if needed)

The app is configured to accept requests from any origin in production. If you need to restrict this, update `server/server.js`:

```javascript
app.use(cors({
  origin: 'https://your-vercel-domain.vercel.app',
  credentials: true
}));
```

## Important Notes

1. **MongoDB Connection**: Ensure your MongoDB URI is stored in Vercel environment variables
2. **JWT Secret**: Use a strong random string for production
3. **Static Files**: The `public` folder is served as static files
4. **API Routes**: All `/api/*` routes are handled by the Node.js server
5. **PWA**: Service worker will work after deployment

## Vercel Environment Variables

Add these in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/your-db-name
JWT_SECRET=your-super-secret-jwt-key-32-characters-minimum
NODE_ENV=production
```

## Deployment Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

## Troubleshooting

### Issue: "Cannot find module"
- Make sure all dependencies are in `package.json` dependencies (not devDependencies)
- Run `npm install` before deploying

### Issue: MongoDB connection timeout
- Check MongoDB Atlas IP whitelist
- Verify connection string is correct
- Ensure MongoDB Atlas cluster is active

### Issue: 404 on refresh
- This is handled by the routing configuration in `vercel.json`
- All routes redirect to `index.html` for SPA functionality

### Issue: API routes not working
- Check that `/api/*` routes are properly configured in `vercel.json`
- Verify environment variables are set in Vercel dashboard

## Post-Deployment

After successful deployment:
1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Complete the initial setup (create principal account)
3. Test all features (login, visitor logging, notifications, etc.)
4. Update service worker cache if needed

## Custom Domain (Optional)

To add a custom domain:
1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
