# Building LunaBloom Android APK

This guide provides instructions for building the LunaBloom Android application in different environments (debug, staging, and release).

## Prerequisites

- Node.js (v18 or higher)
- Java Development Kit (JDK) 17 or higher
- Android Studio
- Android SDK
- Gradle

## Environment Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up Android environment variables:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Building the APK

### Debug Build
For development and testing:
```bash
cd android
./gradlew assembleDebug
```
The debug APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Staging Build
For staging environment:
```bash
cd android
./gradlew assembleStaging
```
The staging APK will be generated at: `android/app/build/outputs/apk/staging/app-staging.apk`

### Release Build
For production release:
```bash
cd android
./gradlew assembleRelease
```
The release APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

## Build Configuration

The build process includes the following optimizations:

- R8 optimization enabled
- ProGuard rules configured for React Native and dependencies
- Resource shrinking enabled
- PNG crunching enabled
- Hermes JavaScript engine enabled

## Signing Configuration

The app is configured with two signing profiles:

1. Debug signing (for development):
   - Keystore: `debug.keystore`
   - Default debug credentials

2. Release signing (for production):
   - Keystore: `lunabloom.keystore`
   - Configured in `android/app/build.gradle`

## Troubleshooting

### Common Issues

1. **Build fails with "SDK location not found"**
   - Ensure `local.properties` exists in the `android` folder
   - Add your SDK path: `sdk.dir=/path/to/your/Android/Sdk`

2. **Gradle sync fails**
   - Try cleaning the project: `./gradlew clean`
   - Update Gradle wrapper: `./gradlew wrapper --gradle-version 8.3`

3. **Missing dependencies**
   - Run `npm install` or `yarn install`
   - Clean and rebuild: `cd android && ./gradlew clean && ./gradlew assembleDebug`

### Build Size Optimization

The release build includes several optimizations to reduce APK size:

- R8 code shrinking
- Resource shrinking
- PNG optimization
- Hermes JavaScript engine
- ProGuard rules for React Native modules

## Security Notes

- Never commit keystore files or passwords to version control
- Keep release keystore secure and backed up
- Use environment variables for sensitive build configurations

## Additional Resources

- [React Native Android Build Documentation](https://reactnative.dev/docs/signed-apk-android)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [R8 Optimization](https://developer.android.com/studio/build/shrink-code) 