package com.konkurshomar.countdown

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat
import java.util.Calendar
import java.util.TimeZone

object CountdownNotifier {
    const val CH_NORMAL = "countdown"
    const val CH_CRITICAL = "critical_countdown"
    const val NOTIF_ID = 1001
    const val PREFS = "konkur_prefs"
    const val KEY_EXAM = "exam_date"      // Gregorian ISO yyyy-MM-dd
    const val KEY_ENABLED = "enabled"
    const val ACTION_MIDNIGHT = "com.konkurshomar.MIDNIGHT"
    const val ACTION_REFRESH = "com.konkurshomar.REFRESH"

    private val TEHRAN: TimeZone = TimeZone.getTimeZone("Asia/Tehran")

    fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    fun isEnabled(ctx: Context) = prefs(ctx).getBoolean(KEY_ENABLED, false)

    private fun fa(n: Int): String =
        n.toString().map { if (it in '0'..'9') ('۰' + (it - '0')) else it }.joinToString("")

    /** Days between today (Asia/Tehran) and the exam day; null if no exam date stored. */
    fun daysRemaining(ctx: Context): Int? {
        val iso = prefs(ctx).getString(KEY_EXAM, null) ?: return null
        val p = iso.split("-")
        if (p.size != 3) return null
        val now = System.currentTimeMillis()
        val todayDay = Math.floorDiv(now + TEHRAN.getOffset(now), 86_400_000L)
        val utc = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        utc.clear()
        utc.set(p[0].toInt(), p[1].toInt() - 1, p[2].toInt())
        val examDay = utc.timeInMillis / 86_400_000L
        return (examDay - todayDay).toInt()
    }

    fun ensureChannels(ctx: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = ctx.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CH_NORMAL, "شمارش معکوس کنکور", NotificationManager.IMPORTANCE_LOW).apply {
                description = "نمایش دائمی تعداد روزهای باقی‌مانده تا کنکور"
                setShowBadge(false)
            }
        )
        nm.createNotificationChannel(
            NotificationChannel(CH_CRITICAL, "هشدار روزهای پایانی", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "هشدار ۱۰ روز پایانی تا کنکور"
                enableLights(true)
                lightColor = Color.RED
            }
        )
    }

    fun build(ctx: Context, days: Int): Notification {
        ensureChannels(ctx)
        val critical = days in 0..10
        val title: String
        val body: String
        when {
            days > 10 -> { title = "${fa(days)} روز تا کنکور"; body = "هر روز یک قدم نزدیک‌تر به هدفت 💪" }
            days > 0 -> { title = "⚠️ فقط ${fa(days)} روز مانده!"; body = "مرحله نهایی — متمرکز بمان!" }
            days == 0 -> { title = "⚠️ امروز روز کنکور است!"; body = "موفق باشی — متمرکز بمان!" }
            else -> { title = "کنکور برگزار شد"; body = "امیدواریم موفق بوده باشی 🌱" }
        }
        val flags = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        val open = PendingIntent.getActivity(
            ctx, 0, ctx.packageManager.getLaunchIntentForPackage(ctx.packageName), flags
        )
        // Android 14+ lets users swipe away FGS notifications; re-post when that happens.
        val deleted = PendingIntent.getBroadcast(
            ctx, 1, Intent(ctx, CountdownReceiver::class.java).setAction(ACTION_REFRESH), flags
        )
        val b = NotificationCompat.Builder(ctx, if (critical) CH_CRITICAL else CH_NORMAL)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(
                if (critical) android.R.drawable.ic_dialog_alert
                else android.R.drawable.ic_menu_my_calendar
            )
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setContentIntent(open)
            .setDeleteIntent(deleted)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        if (critical) {
            b.setColor(Color.parseColor("#D32F2F"))
                .setColorized(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
        }
        return b.build()
    }

    fun update(ctx: Context) {
        if (!isEnabled(ctx)) return
        val days = daysRemaining(ctx) ?: return
        try {
            ctx.getSystemService(NotificationManager::class.java).notify(NOTIF_ID, build(ctx, days))
        } catch (_: SecurityException) { /* POST_NOTIFICATIONS not granted */ }
    }

    fun scheduleNextMidnight(ctx: Context) {
        val cal = Calendar.getInstance(TEHRAN).apply {
            add(Calendar.DAY_OF_YEAR, 1)
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 5); set(Calendar.MILLISECOND, 0)
        }
        val am = ctx.getSystemService(AlarmManager::class.java)
        val pi = alarmIntent(ctx)
        val exactOk = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
        if (exactOk) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.timeInMillis, pi)
        else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.timeInMillis, pi)
    }

    fun cancelAlarm(ctx: Context) {
        ctx.getSystemService(AlarmManager::class.java).cancel(alarmIntent(ctx))
    }

    private fun alarmIntent(ctx: Context): PendingIntent = PendingIntent.getBroadcast(
        ctx, 2,
        Intent(ctx, CountdownReceiver::class.java).setAction(ACTION_MIDNIGHT),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )
}
