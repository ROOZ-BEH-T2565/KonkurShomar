package com.konkurshomar.countdown

import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import androidx.core.content.ContextCompat

class CountdownService : Service() {

    private val timeReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            refresh()
        }
    }

    override fun onCreate() {
        super.onCreate()
        val f = IntentFilter().apply {
            addAction(Intent.ACTION_DATE_CHANGED)
            addAction(Intent.ACTION_TIME_CHANGED)
            addAction(Intent.ACTION_TIMEZONE_CHANGED)
        }
        ContextCompat.registerReceiver(this, timeReceiver, f, ContextCompat.RECEIVER_NOT_EXPORTED)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val days = CountdownNotifier.daysRemaining(this)
        if (days == null || !CountdownNotifier.isEnabled(this)) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }
        val n = CountdownNotifier.build(this, days)
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(CountdownNotifier.NOTIF_ID, n, 1 shl 30) // FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        } else {
            startForeground(CountdownNotifier.NOTIF_ID, n)
        }
        CountdownNotifier.scheduleNextMidnight(this)
        return START_STICKY
    }

    private fun refresh() {
        CountdownNotifier.update(this)
        CountdownNotifier.scheduleNextMidnight(this)
    }

    override fun onDestroy() {
        try { unregisterReceiver(timeReceiver) } catch (_: Exception) {}
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
