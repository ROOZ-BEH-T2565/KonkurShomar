package com.konkurshomar.countdown

import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class CountdownModule(private val rc: ReactApplicationContext) : ReactContextBaseJavaModule(rc) {
    override fun getName() = "KonkurCountdown"

    @ReactMethod
    fun setExamDate(iso: String, promise: Promise) {
        CountdownNotifier.prefs(rc).edit().putString(CountdownNotifier.KEY_EXAM, iso).apply()
        CountdownNotifier.update(rc)
        promise.resolve(true)
    }

    @ReactMethod
    fun start(promise: Promise) {
        CountdownNotifier.prefs(rc).edit().putBoolean(CountdownNotifier.KEY_ENABLED, true).apply()
        try {
            ContextCompat.startForegroundService(rc, Intent(rc, CountdownService::class.java))
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_FAILED", e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        CountdownNotifier.prefs(rc).edit().putBoolean(CountdownNotifier.KEY_ENABLED, false).apply()
        rc.stopService(Intent(rc, CountdownService::class.java))
        CountdownNotifier.cancelAlarm(rc)
        rc.getSystemService(NotificationManager::class.java).cancel(CountdownNotifier.NOTIF_ID)
        promise.resolve(true)
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        val ok = Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
            rc.getSystemService(AlarmManager::class.java).canScheduleExactAlarms()
        promise.resolve(ok)
    }

    @ReactMethod
    fun openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val i = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:${rc.packageName}"))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            rc.startActivity(i)
        }
    }

    @ReactMethod
    fun isIgnoringBatteryOptimizations(promise: Promise) {
        promise.resolve(rc.getSystemService(PowerManager::class.java).isIgnoringBatteryOptimizations(rc.packageName))
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimizations() {
        val i = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:${rc.packageName}"))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        rc.startActivity(i)
    }
}
