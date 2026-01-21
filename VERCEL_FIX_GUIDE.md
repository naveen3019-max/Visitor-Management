# 🚨 CRITICAL: Vercel Deployment Fix Guide

## ❌ Current Error
```
MongoDB Connection Error: MONGODB_URI environment variable is not set
```

## ✅ Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project: **visitor-management-dun**
3. Click **Settings** tab

### Step 2: Add Environment Variables
1. In Settings, click **Environment Variables** in the left sidebar
2. Add these **3 REQUIRED** variables:

#### Variable 1: MONGODB_URI
- **Name**: `MONGODB_URI`
- **Value**: `mongodb+srv://vistor:6EFBIRhsUR1uFw7D@cluster0.gcg0qfz.mongodb.net/visitor-management?retryWrites=true&w=majority`
- **Environment**: Select **Production**, **Preview**, and **Development**
- Click **Save**

#### Variable 2: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: Any secure random string (32+ characters)
- **Example**: `your-super-secret-jwt-key-min-32-chars-long-2024`
- **Environment**: Select **Production**, **Preview**, and **Development**
- Click **Save**

#### Variable 3: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Select **Production** only
- Click **Save**

### Step 3: Redeploy
After adding all 3 environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Check "Use existing Build Cache" is **unchecked**
5. Click **Redeploy**

### Step 4: Verify MongoDB Atlas Settings
1. Go to https://cloud.mongodb.com/
2. Select your cluster **Cluster0**
3. Click **Network Access** in left sidebar
4. Ensure there's an entry: `0.0.0.0/0` (Allow access from anywhere)
   - If not, click **Add IP Address** → **Allow Access from Anywhere** → **Confirm**

## 📝 What Was Fixed in Code
1. **Reports directory**: Now uses `/tmp` in production (Vercel serverless compatible)
2. **Environment loading**: Conditional dotenv loading
3. **MongoDB connection**: Proper error handling for serverless

## 🔄 Push the Latest Code Fixes
Run these commands to push the file system fixes:

```powershell
git add .
git commit -m "Fix serverless file system: use /tmp for reports in production"
git push origin main
```

## ⏱️ Timeline
- Environment variables: **2-3 minutes to set up**
- Redeploy time: **2-5 minutes**
- Total fix time: **~5-8 minutes**

## ✅ Success Indicators
After redeployment, you should see:
- ✅ No "MONGODB_URI environment variable is not set" error
- ✅ Application loads without 500 errors
- ✅ Login page appears correctly
- ✅ CSS styling is applied

## ❓ Still Having Issues?
If you still see errors after setting environment variables:
1. Check Vercel deployment logs for new error messages
2. Verify environment variables are saved (refresh Settings page)
3. Ensure MongoDB Atlas allows `0.0.0.0/0` access
4. Try redeploying again after 5 minutes (DNS propagation)
