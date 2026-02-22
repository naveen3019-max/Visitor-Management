# Mobile App Build Guide

Your Visitor Management System has been converted into a **native Android app** using Capacitor! 🎉

## 📱 What Was Done

1. ✅ Installed Capacitor core and Android platform
2. ✅ Created `capacitor.config.json` with app configuration
3. ✅ Added Android project in the `/android` folder
4. ✅ Configured app settings (HTTPS scheme, mixed content support, splash screen)
5. ✅ Added build scripts to `package.json`
6. ✅ Synced web assets to Android platform

## 🚀 Building the Android App

### Prerequisites
You need **Android Studio** installed on your computer:
- Download from: https://developer.android.com/studio
- Install with default settings
- Make sure Android SDK is installed

### Build Steps

1. **Open the Android project:**
   ```bash
   npm run android
   ```
   This will open Android Studio with your project.

2. **In Android Studio:**
   - Wait for Gradle sync to complete (first time takes 5-10 minutes)
   - Connect your Android phone via USB with USB Debugging enabled
   - OR use an Android Emulator (Create one in Device Manager)
   - Click the green "Run" button (▶️) at the top

3. **Alternative - Generate APK:**
   - In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Transfer this APK to your phone and install it

### Quick Commands

```bash
# Sync changes after modifying web code
npm run cap:sync

# Build CSS and sync to mobile
npm run cap:build

# Open Android Studio
npm run cap:open
```

## 📝 App Configuration

### App Details
- **App Name:** Visitor Management
- **Package ID:** com.college.visitor
- **Config File:** `capacitor.config.json`

### Changing App Name/Icon
1. **App Name:** Edit `capacitor.config.json` → `appName`
2. **App Icon:** Replace icons in `android/app/src/main/res/` folders
3. **Splash Screen:** Modify in `android/app/src/main/res/drawable/` 

## 🔧 Important Notes

### Server Connection
- The app needs to connect to your backend server
- **Update the API URL** in `public/js/api.js`:
  ```javascript
  const API_BASE_URL = 'https://your-vercel-app.vercel.app/api';
  ```
- Make sure your server is deployed and accessible online
- Local servers (localhost) won't work on physical devices

### Permissions
Camera permission is automatically configured for photo capture.

### Testing
- Test thoroughly on a real Android device
- Check camera functionality
- Verify network requests work
- Test offline behavior

## 📦 Publishing to Google Play Store

1. **Generate Signed APK:**
   - Build → Generate Signed Bundle/APK
   - Create a keystore (keep it safe!)
   - Build release APK or AAB (recommended)

2. **Create Google Play Developer Account:**
   - Cost: $25 one-time fee
   - https://play.google.com/console

3. **Upload and Publish:**
   - Create new app listing
   - Upload your AAB/APK
   - Fill in app details, screenshots, description
   - Submit for review

## 🍎 iOS App (Future)

To add iOS support:
```bash
npm install @capacitor/ios
npx cap add ios
```
Requires Mac with Xcode installed.

## 🛠️ Troubleshooting

**Gradle build fails:**
- Check internet connection
- Update Android Studio
- Run: `cd android && ./gradlew clean`

**App crashes on launch:**
- Check API URL is correct
- Verify CORS settings on backend
- Check Android Studio Logcat for errors

**Camera not working:**
- Verify camera permission in AndroidManifest.xml
- Test on real device (emulator cameras are limited)

## 📚 Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Android Developer Guide: https://developer.android.com
- Your Android project: `./android/`

---

🎉 Your app is ready! Run `npm run android` to start building!
