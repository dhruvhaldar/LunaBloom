# Building LunaBloom Android APK

This guide provides instructions for building the LunaBloom Android application in different environments (debug, staging, and release).

## Quick Start
### Expo Build
`npx expo start`

### Building apk
`./gradlew app:assembleRelease -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64,arm64-v8a --info`

`~/LunaBloom/android/app/build/outputs/apk/release/app-x86_64-release.apk`  - `Pixel_7a_API_36`
`~/LunaBloom/android/app/build/outputs/apk/release/app-x86_64-release.apk`  - `Pixel 8 Pro API 29`

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

#### Clean and Release Build
```bash
./gradlew clean && ./gradlew assembleRelease
```
The release APK will be generated at: `android/app/build/outputs/apk/release/*.apk`

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
   - Requires setting the following properties in your `~/.gradle/gradle.properties` or passing them as command line arguments (e.g. `-PLUNABLOOM_RELEASE_STORE_FILE=...`):
     - `LUNABLOOM_RELEASE_STORE_FILE`: Path to the keystore file (e.g. `lunabloom.keystore`)
     - `LUNABLOOM_RELEASE_STORE_PASSWORD`: Keystore password
     - `LUNABLOOM_RELEASE_KEY_ALIAS`: Key alias
     - `LUNABLOOM_RELEASE_KEY_PASSWORD`: Key password

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

## Security Notes

- Never commit keystore files or passwords to version control
- Keep release keystore secure and backed up
- Use environment variables for sensitive build configurations

## Additional Resources

- [React Native Android Build Documentation](https://reactnative.dev/docs/signed-apk-android)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [R8 Optimization](https://developer.android.com/studio/build/shrink-code)

## Build Outputs

The build process generates separate APKs for different CPU architectures:

- `app-arm64-v8a-release.apk` (31MB): For modern ARM devices (64-bit)
- `app-armeabi-v7a-release.apk` (25MB): For older ARM devices (32-bit)
- `app-x86_64-release.apk` (33MB): For 64-bit x86 devices
- `app-x86-release.apk` (33MB): For 32-bit x86 devices

These APKs are located in `android/app/build/outputs/apk/release/`.

### APK Size Optimization

The current build configuration includes several optimizations to reduce APK size:

1. **R8 Optimization**: Enabled with `minifyEnabled true`
2. **Resource Shrinking**: Enabled with `shrinkResources true`
3. **PNG Crunching**: Enabled with `crunchPngs true`
4. **ABI Splitting**: Separate APKs for different CPU architectures

To further optimize APK size:

1. Review and remove unused dependencies
2. Use WebP images instead of PNG where possible
3. Remove unused assets and resources
4. Consider using dynamic feature modules for less frequently used features
5. Add ProGuard rules to remove unused code 