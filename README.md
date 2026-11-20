# کنکور شمار (Konkur Shomar)

Android-only React Native (bare, TypeScript) countdown + study planner for the Iranian Konkur.
All UI strings are Persian, layout is RTL, calendar is Jalali, dates are computed in `Asia/Tehran`.

## Architecture note (read this first)

The persistent notification is produced by a **small native Kotlin foreground service**
(`android/.../countdown/`), not by a JS foreground-service library. JS-based services
(`@kirenpaul/rn-foreground-service`, `react-native-background-task-manager`, Notifee's JS task)
need a live React context, so they die when the app is swiped away. The native service:

- runs with `START_STICKY` and `foregroundServiceType="specialUse"` (Android 14 compliant),
- computes days left itself from the stored exam date (no JS needed),
- re-schedules an exact alarm for 00:00:05 Tehran time every day (falls back to an inexact
  alarm if `SCHEDULE_EXACT_ALARM` is denied) and also listens for date/time/timezone changes,
- switches to channel `critical_countdown` (HIGH importance, red, alert icon,
  "⚠️ فقط X روز مانده!" / "مرحله نهایی — متمرکز بمان!") when ≤ 10 days remain,
- restarts after reboot via `BOOT_COMPLETED` (and after app update),
- re-posts the notification if the user swipes it away (Android 14+ allows dismissing FGS notifications).

`@notifee/react-native` is used for the Android 13+ `POST_NOTIFICATIONS` prompt and for reading
the permission state. The Jalali date picker is a custom component built on `jalaali-js`
(zero extra native deps).

## Setup

```bash
# 1. Create a bare RN 0.74 project with the same name/package
npx @react-native-community/cli@latest init KonkurShomar --version 0.74.5 --pm npm
cd KonkurShomar

# 2. Copy this repo over it (overwrites package.json, index.js, app.json, tsconfig, babel config,
#    AndroidManifest.xml and adds src/, the Kotlin files and the CI workflow)
#    Make sure the package name is com.konkurshomar (default for that init command).

# 3. Install
npm install
```

### Required Android patches (3 small edits)

**a) `android/app/src/main/java/com/konkurshomar/MainApplication.kt`** – register the package and force RTL
before the first frame:

```kotlin
import com.konkurshomar.countdown.CountdownPackage
import com.facebook.react.modules.i18nmanager.I18nUtil
// ...
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply { add(CountdownPackage()) }
// ...
override fun onCreate() {
    super.onCreate()
    I18nUtil.getInstance().allowRTL(this, true)
    I18nUtil.getInstance().forceRTL(this, true)
    // existing SoLoader.init(...) etc.
}
```

**b) `android/app/build.gradle`** – bundle the icon font (add at the bottom):

```gradle
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

**c) `android/build.gradle`** – Notifee's local Maven repo (inside `allprojects { repositories { ... } }`):

```gradle
maven { url("$rootDir/../node_modules/@notifee/react-native/android/libs") }
```

Also set `compileSdkVersion`/`targetSdkVersion` to **34** (default for RN 0.74) in `android/build.gradle`.

### Run / build

```bash
npm run android                          # debug on device/emulator
cd android && ./gradlew assembleRelease  # APK: android/app/build/outputs/apk/release/
```

> The RN template signs `release` with the debug keystore. For Play Store / long-term distribution,
> generate your own keystore and configure `signingConfigs.release`.

## CI

`.github/workflows/android-build.yml` builds a release APK on every push to `main`
(checkout@v4, setup-java@v4 JDK 17, `./gradlew assembleRelease`) and uploads it as the
`konkur-shomar-release-apk` artifact. Commit the `android/gradlew` wrapper and `package-lock.json`
(the workflow uses `npm ci`).

## Features → files

| Requirement | Where |
|---|---|
| Jalali exam-date picker, persisted | `components/JalaliDatePicker.tsx`, `screens/OnboardingScreen.tsx`, `utils/storage.ts` |
| Persistent / critical notification, boot restart | `android/.../countdown/*.kt`, `AndroidManifest.xml`, `native/Countdown.ts` |
| Permissions (13+ notifications, 12+ exact alarm, battery) | `screens/SettingsScreen.tsx` |
| Study goal, timer, manual log (per Jalali date) | `components/StudyCard.tsx`, `context/AppContext.tsx` |
| Light / dark / system theme | `theme/ThemeContext.tsx` |
| Jalali calendar with ✓ / strikethrough on past days | `screens/CalendarScreen.tsx` |
| Per-date to-dos (add/edit/delete/done) | `components/TodoList.tsx` |
| Bottom tabs امروز / تقویم / تنظیمات | `navigation/index.tsx` |

## Notes

- Notification small icons use Android system drawables; swap in a monochrome `ic_stat_countdown`
  drawable in `CountdownNotifier.build()` for a branded look.
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` and `SCHEDULE_EXACT_ALARM` can trigger extra Play Store
  declarations; remove them (and the matching Settings rows) if you don't ship via Play.
- The picker year range is 1403–1415; adjust `minYear`/`maxYear` as needed.
