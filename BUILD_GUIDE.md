# 📱 Build APK Guide - CS:GO Armory

Complete guide to build your React Native app into an APK file for Android.

---

## 🎯 Quick Build (Recommended for Students)

### Option 1: EAS Build (Easiest - Cloud Build)

1. **Install EAS CLI**

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**

   ```bash
   eas login
   # Or create account: eas register
   ```

3. **Configure Project**

   ```bash
   eas build:configure
   ```

4. **Build APK**

   ```bash
   # For testing/sharing (APK file)
   eas build -p android --profile preview

   # For production (AAB bundle for Play Store)
   eas build -p android --profile production
   ```

5. **Download APK**
   - Build will take 10-20 minutes
   - You'll get a link to download the APK
   - Install on any Android device!

---

## 🔧 Option 2: Local Build (More Control)

### Prerequisites

1. **Install Android Studio**

   - Download from: https://developer.android.com/studio
   - Install Android SDK (API 34+)
   - Set up ANDROID_HOME environment variable

2. **Install Java JDK**
   - Download JDK 17: https://www.oracle.com/java/technologies/downloads/
   - Set JAVA_HOME environment variable

### Build Steps

1. **Generate Android Project**

   ```bash
   npx expo prebuild --platform android
   ```

2. **Build APK**

   ```bash
   # Development APK
   cd android
   ./gradlew assembleDebug

   # Production APK (signed)
   ./gradlew assembleRelease
   ```

3. **Find APK**
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔐 Signing Your APK (Production)

### Generate Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Gradle

Create `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

Add to `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

---

## 📦 Testing Your APK

### 1. Install on Device

**Via ADB (USB):**

```bash
adb install path/to/your-app.apk
```

**Via File Transfer:**

1. Copy APK to phone
2. Open with file manager
3. Allow "Install from Unknown Sources"
4. Install!

### 2. Test Key Features

- ✅ App launches successfully
- ✅ Data fetches from API
- ✅ Swipe gestures work
- ✅ Haptic feedback responds
- ✅ Favorites persist after restart
- ✅ Search and filters function
- ✅ Navigation is smooth
- ✅ Images load properly

---

## 🚀 Recommended Approach for SE1720

### For Demo/Submission:

**Use EAS Build** - Simplest and fastest:

```bash
# 1. Install EAS
npm install -g eas-cli

# 2. Build APK
eas build -p android --profile preview

# 3. Wait 10-20 minutes

# 4. Download and share APK link with teacher
```

**Benefits:**

- No Android Studio needed
- No complex setup
- Cloud builds on Expo servers
- Share download link easily
- Works on any computer

---

## 📋 Pre-Build Checklist

Before building, ensure:

- [ ] `npm install` completes successfully
- [ ] `npm start` runs without errors
- [ ] App works in Expo Go
- [ ] All screens navigate correctly
- [ ] API data loads successfully
- [ ] Favorites save and persist
- [ ] Swipe gestures work
- [ ] No console errors

---

## 🐛 Common Issues

### Issue: Build fails on EAS

**Solution:**

```bash
# Clear cache and retry
eas build:cancel  # Cancel current build
eas build -p android --profile preview --clear-cache
```

### Issue: "Reanimated plugin not found"

**Solution:** Check `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"], // Must be last!
  };
};
```

### Issue: APK crashes on launch

**Solution:**

- Check app.json has correct package name
- Ensure all native modules are compatible
- Test in Expo Go first before building

---

## 📊 Build Comparison

| Method          | Time      | Difficulty  | Requirements        | Output                |
| --------------- | --------- | ----------- | ------------------- | --------------------- |
| **EAS Build**   | 10-20 min | ⭐ Easy     | Expo account        | APK Link              |
| **Local Build** | 30-60 min | ⭐⭐⭐ Hard | Android Studio, JDK | APK File              |
| **Expo Go**     | 0 min     | ⭐ Easiest  | Just phone          | No APK (testing only) |

---

## 💡 Pro Tips

1. **For SE1720 Assignment:**

   - Use EAS Build preview profile
   - Share download link in your submission
   - Include QR code in presentation

2. **For Production:**

   - Use EAS Build production profile
   - Sign with proper keystore
   - Test on multiple devices

3. **For Development:**
   - Use Expo Go during development
   - Only build APK when ready to demo
   - Saves time and resources

---

## 🎓 Submission Package

Your final submission should include:

1. **Source Code** (GitHub repo)
2. **APK Download Link** (from EAS Build)
3. **README.md** (with features list)
4. **Screenshots** (app screens)
5. **Build Instructions** (this file)

---

## 🔗 Useful Links

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Android Studio:** https://developer.android.com/studio
- **Expo Account:** https://expo.dev/signup
- **APK Signing:** https://reactnative.dev/docs/signed-apk-android

---

## ⚡ Quick Commands Reference

```bash
# Test in Expo Go
npm start

# Build APK (EAS - Recommended)
eas build -p android --profile preview

# Build locally (if Android Studio installed)
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug

# Install APK on device
adb install app-debug.apk

# Check build status
eas build:list
```

---

**Need help?** Check the error logs or reach out with specific error messages!
