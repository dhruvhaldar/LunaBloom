# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Optimization settings
-optimizationpasses 5
-allowaccessmodification
-repackageclasses
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
-dontpreverify
-verbose
-printmapping proguardMapping.txt
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keepattributes Deprecated
-keepattributes RuntimeVisible*Annotations
-keepattributes RuntimeInvisible*Annotations
-keepattributes RuntimeVisibleParameterAnnotations
-keepattributes RuntimeInvisibleParameterAnnotations
-keepattributes AnnotationDefault
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keepattributes Deprecated
-keepattributes RuntimeVisible*Annotations
-keepattributes RuntimeInvisible*Annotations
-keepattributes RuntimeVisibleParameterAnnotations
-keepattributes RuntimeInvisibleParameterAnnotations
-keepattributes AnnotationDefault

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    static ** CREATOR;
}

# Keep Serializable implementations
-keepnames class * implements java.io.Serializable

# Keep R8 full mode
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep Kotlin Metadata
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# Keep Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Keep Retrofit
-keepattributes Signature
-keepattributes Exceptions
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
-dontwarn javax.annotation.**
-dontwarn kotlin.Unit
-dontwarn retrofit2.KotlinExtensions
-dontwarn retrofit2.KotlinExtensions$*

# Keep OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# Keep Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer
-keepclassmembers,allowobfuscation,allowshrinking class * {
  @com.google.gson.annotations.SerializedName <fields>;
}

# Keep Glide
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule {
 <init>(...);
}
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}
-keep class com.bumptech.glide.load.data.ParcelFileDescriptorRewinder$InternalRewinder {
  *** rewind();
}

# Keep Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep Crashlytics
-keepattributes SourceFile,LineNumberTable
-keep class com.crashlytics.** { *; }
-keep class com.crashlytics.android.** { *; }

# Keep Analytics
-keep class com.google.android.gms.analytics.** { *; }
-keep class com.google.android.gms.measurement.** { *; }

# Keep AdMob
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }

# Keep In-App Billing
-keep class com.android.vending.billing.** { *; }

# Keep WebRTC
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# Keep OpenGL
-keep class javax.microedition.khronos.** { *; }
-keep class android.opengl.** { *; }
-keep class android.opengl.GLSurfaceView { *; }

# Keep AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-keep class * extends androidx.** { *; }
-keep class * implements androidx.** { *; }

# Keep Android Support Library
-keep class android.support.** { *; }
-keep interface android.support.** { *; }
-keep class * extends android.support.** { *; }
-keep class * implements android.support.** { *; }

# Keep AndroidX Core
-keep class androidx.core.** { *; }
-keep interface androidx.core.** { *; }
-keep class * extends androidx.core.** { *; }
-keep class * implements androidx.core.** { *; }

# Keep AndroidX AppCompat
-keep class androidx.appcompat.** { *; }
-keep interface androidx.appcompat.** { *; }
-keep class * extends androidx.appcompat.** { *; }
-keep class * implements androidx.appcompat.** { *; }

# Keep AndroidX Material Design
-keep class com.google.android.material.** { *; }
-keep interface com.google.android.material.** { *; }
-keep class * extends com.google.android.material.** { *; }
-keep class * implements com.google.android.material.** { *; }

# Keep AndroidX Navigation
-keep class androidx.navigation.** { *; }
-keep interface androidx.navigation.** { *; }
-keep class * extends androidx.navigation.** { *; }
-keep class * implements androidx.navigation.** { *; }

# Keep AndroidX Room
-keep class androidx.room.** { *; }
-keep interface androidx.room.** { *; }
-keep class * extends androidx.room.** { *; }
-keep class * implements androidx.room.** { *; }

# Keep AndroidX WorkManager
-keep class androidx.work.** { *; }
-keep interface androidx.work.** { *; }
-keep class * extends androidx.work.** { *; }
-keep class * implements androidx.work.** { *; }

# Keep AndroidX Lifecycle
-keep class androidx.lifecycle.** { *; }
-keep interface androidx.lifecycle.** { *; }
-keep class * extends androidx.lifecycle.** { *; }
-keep class * implements androidx.lifecycle.** { *; }

# Keep AndroidX ViewModel
-keep class androidx.lifecycle.ViewModel { *; }
-keep class * extends androidx.lifecycle.ViewModel { *; }

# Keep AndroidX LiveData
-keep class androidx.lifecycle.LiveData { *; }
-keep class * extends androidx.lifecycle.LiveData { *; }

# Keep AndroidX Paging
-keep class androidx.paging.** { *; }
-keep interface androidx.paging.** { *; }
-keep class * extends androidx.paging.** { *; }
-keep class * implements androidx.paging.** { *; }

# Keep AndroidX RecyclerView
-keep class androidx.recyclerview.** { *; }
-keep interface androidx.recyclerview.** { *; }
-keep class * extends androidx.recyclerview.** { *; }
-keep class * implements androidx.recyclerview.** { *; }

# Keep AndroidX SwipeRefreshLayout
-keep class androidx.swiperefreshlayout.** { *; }
-keep interface androidx.swiperefreshlayout.** { *; }
-keep class * extends androidx.swiperefreshlayout.** { *; }
-keep class * implements androidx.swiperefreshlayout.** { *; }

# Keep AndroidX ViewPager2
-keep class androidx.viewpager2.** { *; }
-keep interface androidx.viewpager2.** { *; }
-keep class * extends androidx.viewpager2.** { *; }
-keep class * implements androidx.viewpager2.** { *; }

# Keep AndroidX ConstraintLayout
-keep class androidx.constraintlayout.** { *; }
-keep interface androidx.constraintlayout.** { *; }
-keep class * extends androidx.constraintlayout.** { *; }
-keep class * implements androidx.constraintlayout.** { *; }

# Keep AndroidX CoordinatorLayout
-keep class androidx.coordinatorlayout.** { *; }
-keep interface androidx.coordinatorlayout.** { *; }
-keep class * extends androidx.coordinatorlayout.** { *; }
-keep class * implements androidx.coordinatorlayout.** { *; }

# Keep AndroidX DrawerLayout
-keep class androidx.drawerlayout.** { *; }
-keep interface androidx.drawerlayout.** { *; }
-keep class * extends androidx.drawerlayout.** { *; }
-keep class * implements androidx.drawerlayout.** { *; }

# Keep AndroidX SlidingPaneLayout
-keep class androidx.slidingpanelayout.** { *; }
-keep interface androidx.slidingpanelayout.** { *; }
-keep class * extends androidx.slidingpanelayout.** { *; }
-keep class * implements androidx.slidingpanelayout.** { *; }

# Keep AndroidX SwipeRefreshLayout
-keep class androidx.swiperefreshlayout.** { *; }
-keep interface androidx.swiperefreshlayout.** { *; }
-keep class * extends androidx.swiperefreshlayout.** { *; }
-keep class * implements androidx.swiperefreshlayout.** { *; }

# Keep AndroidX ViewPager
-keep class androidx.viewpager.** { *; }
-keep interface androidx.viewpager.** { *; }
-keep class * extends androidx.viewpager.** { *; }
-keep class * implements androidx.viewpager.** { *; }

# Keep AndroidX WebView
-keep class androidx.webkit.** { *; }
-keep interface androidx.webkit.** { *; }
-keep class * extends androidx.webkit.** { *; }
-keep class * implements androidx.webkit.** { *; }

# Keep AndroidX Biometric
-keep class androidx.biometric.** { *; }
-keep interface androidx.biometric.** { *; }
-keep class * extends androidx.biometric.** { *; }
-keep class * implements androidx.biometric.** { *; }

# Keep AndroidX Camera
-keep class androidx.camera.** { *; }
-keep interface androidx.camera.** { *; }
-keep class * extends androidx.camera.** { *; }
-keep class * implements androidx.camera.** { *; }

# Keep AndroidX ExifInterface
-keep class androidx.exifinterface.** { *; }
-keep interface androidx.exifinterface.** { *; }
-keep class * extends androidx.exifinterface.** { *; }
-keep class * implements androidx.exifinterface.** { *; }

# Keep AndroidX Print
-keep class androidx.print.** { *; }
-keep interface androidx.print.** { *; }
-keep class * extends androidx.print.** { *; }
-keep class * implements androidx.print.** { *; }

# Keep AndroidX Preference
-keep class androidx.preference.** { *; }
-keep interface androidx.preference.** { *; }
-keep class * extends androidx.preference.** { *; }
-keep class * implements androidx.preference.** { *; }

# Keep AndroidX Security
-keep class androidx.security.** { *; }
-keep interface androidx.security.** { *; }
-keep class * extends androidx.security.** { *; }
-keep class * implements androidx.security.** { *; }

# Keep AndroidX Share
-keep class androidx.share.** { *; }
-keep interface androidx.share.** { *; }
-keep class * extends androidx.share.** { *; }
-keep class * implements androidx.share.** { *; }

# Keep AndroidX Slice
-keep class androidx.slice.** { *; }
-keep interface androidx.slice.** { *; }
-keep class * extends androidx.slice.** { *; }
-keep class * implements androidx.slice.** { *; }

# Keep AndroidX Startup
-keep class androidx.startup.** { *; }
-keep interface androidx.startup.** { *; }
-keep class * extends androidx.startup.** { *; }
-keep class * implements androidx.startup.** { *; }

# Keep AndroidX Test
-keep class androidx.test.** { *; }
-keep interface androidx.test.** { *; }
-keep class * extends androidx.test.** { *; }
-keep class * implements androidx.test.** { *; }

# Keep AndroidX Transition
-keep class androidx.transition.** { *; }
-keep interface androidx.transition.** { *; }
-keep class * extends androidx.transition.** { *; }
-keep class * implements androidx.transition.** { *; }

# Keep AndroidX TV
-keep class androidx.tv.** { *; }
-keep interface androidx.tv.** { *; }
-keep class * extends androidx.tv.** { *; }
-keep class * implements androidx.tv.** { *; }

# Keep AndroidX Wear
-keep class androidx.wear.** { *; }
-keep interface androidx.wear.** { *; }
-keep class * extends androidx.wear.** { *; }
-keep class * implements androidx.wear.** { *; }

# Keep AndroidX Window
-keep class androidx.window.** { *; }
-keep interface androidx.window.** { *; }
-keep class * extends androidx.window.** { *; }
-keep class * implements androidx.window.** { *; }

# Keep AndroidX Work
-keep class androidx.work.** { *; }
-keep interface androidx.work.** { *; }
-keep class * extends androidx.work.** { *; }
-keep class * implements androidx.work.** { *; }

# Keep AndroidX Wear OS
-keep class androidx.wear.** { *; }
-keep interface androidx.wear.** { *; }
-keep class * extends androidx.wear.** { *; }
-keep class * implements androidx.wear.** { *; }

# Keep AndroidX Wear OS Input
-keep class androidx.wear.input.** { *; }
-keep interface androidx.wear.input.** { *; }
-keep class * extends androidx.wear.input.** { *; }
-keep class * implements androidx.wear.input.** { *; }

# Keep AndroidX Wear OS Remote
-keep class androidx.wear.remote.** { *; }
-keep interface androidx.wear.remote.** { *; }
-keep class * extends androidx.wear.remote.** { *; }
-keep class * implements androidx.wear.remote.** { *; }

# Keep AndroidX Wear OS WatchFace
-keep class androidx.wear.watchface.** { *; }
-keep interface androidx.wear.watchface.** { *; }
-keep class * extends androidx.wear.watchface.** { *; }
-keep class * implements androidx.wear.watchface.** { *; }

# Keep AndroidX Wear OS Complications
-keep class androidx.wear.complications.** { *; }
-keep interface androidx.wear.complications.** { *; }
-keep class * extends androidx.wear.complications.** { *; }
-keep class * implements androidx.wear.complications.** { *; }

# Keep AndroidX Wear OS Tiles
-keep class androidx.wear.tiles.** { *; }
-keep interface androidx.wear.tiles.** { *; }
-keep class * extends androidx.wear.tiles.** { *; }
-keep class * implements androidx.wear.tiles.** { *; }

# Keep AndroidX Wear OS Tiles Material
-keep class androidx.wear.tiles.material.** { *; }
-keep interface androidx.wear.tiles.material.** { *; }
-keep class * extends androidx.wear.tiles.material.** { *; }
-keep class * implements androidx.wear.tiles.material.** { *; }

# Keep AndroidX Wear OS Tiles Renderer
-keep class androidx.wear.tiles.renderer.** { *; }
-keep interface androidx.wear.tiles.renderer.** { *; }
-keep class * extends androidx.wear.tiles.renderer.** { *; }
-keep class * implements androidx.wear.tiles.renderer.** { *; }

# Keep AndroidX Wear OS Tiles Testing
-keep class androidx.wear.tiles.testing.** { *; }
-keep interface androidx.wear.tiles.testing.** { *; }
-keep class * extends androidx.wear.tiles.testing.** { *; }
-keep class * implements androidx.wear.tiles.testing.** { *; }

# Keep AndroidX Wear OS Tiles Tooling
-keep class androidx.wear.tiles.tooling.** { *; }
-keep interface androidx.wear.tiles.tooling.** { *; }
-keep class * extends androidx.wear.tiles.tooling.** { *; }
-keep class * implements androidx.wear.tiles.tooling.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview
-keep class androidx.wear.tiles.tooling.preview.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material
-keep class androidx.wear.tiles.tooling.preview.material.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3
-keep class androidx.wear.tiles.tooling.preview.material3.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Color
-keep class androidx.wear.tiles.tooling.preview.material3.color.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.color.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.color.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.color.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Layout
-keep class androidx.wear.tiles.tooling.preview.material3.layout.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.layout.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.layout.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.layout.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Typography
-keep class androidx.wear.tiles.tooling.preview.material3.typography.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.typography.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.typography.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.typography.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Animation
-keep class androidx.wear.tiles.tooling.preview.material3.animation.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.animation.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.animation.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.animation.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Interaction
-keep class androidx.wear.tiles.tooling.preview.material3.interaction.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.interaction.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.interaction.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.interaction.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 State
-keep class androidx.wear.tiles.tooling.preview.material3.state.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.state.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.state.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.state.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Theme
-keep class androidx.wear.tiles.tooling.preview.material3.theme.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.theme.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.theme.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.theme.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Utils
-keep class androidx.wear.tiles.tooling.preview.material3.utils.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.utils.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.utils.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.utils.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Widgets
-keep class androidx.wear.tiles.tooling.preview.material3.widgets.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.widgets.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.widgets.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.widgets.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Widgets Button
-keep class androidx.wear.tiles.tooling.preview.material3.widgets.button.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.widgets.button.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.widgets.button.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.widgets.button.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Widgets Card
-keep class androidx.wear.tiles.tooling.preview.material3.widgets.card.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.widgets.card.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.widgets.card.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.widgets.card.** { *; }

# Keep AndroidX Wear OS Tiles Tooling Preview Material3 Widgets Chip
-keep class androidx.wear.tiles.tooling.preview.material3.widgets.chip.** { *; }
-keep interface androidx.wear.tiles.tooling.preview.material3.widgets.chip.** { *; }
-keep class * extends androidx.wear.tiles.tooling.preview.material3.widgets.chip.** { *; }
-keep class * implements androidx.wear.tiles.tooling.preview.material3.widgets.chip.** { *; }

# Keychain
-keep class com.oblador.keychain.** { *; }
-keep class com.oblador.keychain.KeychainModule { *; }
-keep class com.oblador.keychain.KeychainModule$* { *; }
-keep class com.oblador.keychain.KeychainModule$*$* { *; }
-keepclassmembers class com.oblador.keychain.KeychainModule { *; }
-keepclassmembers class com.oblador.keychain.KeychainModule$* { *; }
-keepclassmembers class com.oblador.keychain.KeychainModule$*$* { *; }

# Local Authentication
-keep class com.rnlocalauth.** { *; }
-keep class com.rnlocalauth.RNLocalAuthModule { *; }
-keep class com.rnlocalauth.RNLocalAuthModule$* { *; }
-keepclassmembers class com.rnlocalauth.RNLocalAuthModule { *; }
-keepclassmembers class com.rnlocalauth.RNLocalAuthModule$* { *; }

# In-App Purchase
-keep class com.android.billingclient.** { *; }
-keep class com.android.billingclient.api.** { *; }
-keep class com.android.billingclient.api.BillingClient { *; }
-keep class com.android.billingclient.api.BillingResult { *; }
-keep class com.android.billingclient.api.ProductDetails { *; }
-keep class com.android.billingclient.api.Purchase { *; }
-keep class com.android.billingclient.api.QueryProductDetailsParams { *; }
-keep class com.android.billingclient.api.QueryPurchasesParams { *; }
-keepclassmembers class com.android.billingclient.api.** { *; }

# Permissions
-keep class com.facebook.react.modules.permissions.** { *; }
-keep class com.facebook.react.modules.permissions.PermissionsModule { *; }
-keep class com.facebook.react.modules.permissions.PermissionsModule$* { *; }
-keepclassmembers class com.facebook.react.modules.permissions.PermissionsModule { *; }
-keepclassmembers class com.facebook.react.modules.permissions.PermissionsModule$* { *; }

# Biometric
-keep class com.rnbiometrics.** { *; }
-keep class com.rnbiometrics.ReactNativeBiometrics { *; }
-keep class com.rnbiometrics.ReactNativeBiometrics$* { *; }
-keepclassmembers class com.rnbiometrics.ReactNativeBiometrics { *; }
-keepclassmembers class com.rnbiometrics.ReactNativeBiometrics$* { *; }

# Security
-keep class com.facebook.react.modules.network.** { *; }
-keep class com.facebook.react.modules.network.NetworkingModule { *; }
-keep class com.facebook.react.modules.network.NetworkingModule$* { *; }
-keepclassmembers class com.facebook.react.modules.network.NetworkingModule { *; }
-keepclassmembers class com.facebook.react.modules.network.NetworkingModule$* { *; }

# Keep all native methods
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# Keep all JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all Parcelable implementations
-keep class * implements android.os.Parcelable {
    static ** CREATOR;
}

# Keep all Serializable implementations
-keep class * implements java.io.Serializable { *; }

# Keep all native methods
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# Keep all JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}