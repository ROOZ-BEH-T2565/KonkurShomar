package com.konkurshomar.countdown

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class CountdownReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (!CountdownNotifier.isEnabled(context)) return
        // BOOT_COMPLETED, MY_PACKAGE_REPLACED, TIME_SET, TIMEZONE_CHANGED, MIDNIGHT alarm, notification swiped away
        try {
            ContextCompat.startForegroundService(context, Intent(context, CountdownService::class.java))
        } catch (_: Exception) {
            // Background FGS start can be denied; fall back to a plain notification update.
            CountdownNotifier.update(context)
            CountdownNotifier.scheduleNextMidnight(context)
        }
    }
}
