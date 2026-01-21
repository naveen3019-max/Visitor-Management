# IMPORTANT: Vercel Environment Variables

**You MUST set these environment variables in your Vercel dashboard for the app to work:**

## Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

### 1. MONGODB_URI
```
mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/visitor-management?retryWrites=true&w=majority
```
**Your current MongoDB URI:**
```
mongodb+srv://vistor:6EFBIRhsUR1uFw7D@cluster0.gcg0qfz.mongodb.net/
```

### 2. JWT_SECRET
A secure random string (minimum 32 characters). Generate one:
```
your-super-secret-jwt-key-32-characters-minimum-change-this
```

### 3. NODE_ENV
```
production
```

## How to Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project "Visitor-Management"
3. Click "Settings" tab
4. Click "Environment Variables" in the left sidebar
5. Add each variable:
   - Name: MONGODB_URI
   - Value: (paste your MongoDB connection string)
   - Environment: Production, Preview, Development (select all)
   - Click "Save"
6. Repeat for JWT_SECRET and NODE_ENV
7. Click "Redeploy" after adding all variables

## Verifying the Deployment

After setting environment variables and redeploying:

1. Visit your Vercel URL
2. You should see the modern UI with gradients
3. Complete the setup (create principal account)
4. If you still see errors, check the Vercel logs:
   - Go to your project → Deployments
   - Click on the latest deployment
   - Click "View Function Logs"

## Common Issues

### "A server error..." message
- **Cause:** Environment variables not set
- **Fix:** Add MONGODB_URI, JWT_SECRET, NODE_ENV

### Icons showing 404
- **Fix:** Already fixed in the latest push

### Plain styling (no colors/gradients)
- **Fix:** Already fixed - CSS file is now included in git

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas allows connections from anywhere:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## After Configuration

Once environment variables are set and deployment is complete:

✅ Modern UI with gradients and colors
✅ Login/signup functionality
✅ Visitor management
✅ Notifications
✅ Analytics and reports
