import { Platform } from 'react-native';
import { eventDate } from './events';

const isWeb = Platform.OS === 'web';

// Loaded lazily: Expo Go ships an older native build and throws on import, so a failed load just disables reminders.
let Notifications = null;
if (!isWeb) {
  try {
    Notifications = require('expo-notifications');
  } catch {}
}
const CHANNEL = 'concerts';
const MAX_SCHEDULED = 60; // iOS keeps at most 64 pending local notifications
const MAX_TIMEOUT = 2 ** 31 - 1; // setTimeout limit, ~24 days

// Browsers only notify while the tab is open; phones schedule with the OS.
export const notificationsSupported = isWeb ? typeof Notification !== 'undefined' : !!Notifications;

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
    }),
  });
}

let webTimers = [];

// Resolves true when the app may post notifications (asks the user if needed).
export async function ensureNotificationPermission() {
  if (!notificationsSupported) return false;
  if (isWeb) {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Concerts',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function doSync(events, t, enabled, rounds = []) {
  webTimers.forEach(clearTimeout);
  webTimers = [];
  if (!notificationsSupported) return;
  if (!isWeb) await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled || !(await ensureNotificationPermission())) return;

  const now = Date.now();
  // Concerts fire at their start; pending ticketing rounds fire 30 minutes before the sale opens.
  const concerts = events.map((e) => ({ e, at: eventDate(e) })).filter(({ at }) => at && at.getTime() > now);
  const sales = rounds
    .filter((r) => r.result === 'pending')
    .map((r) => ({ round: r, at: new Date(new Date(r.saleAt).getTime() - 30 * 60 * 1000) }))
    .filter(({ at }) => at.getTime() > now);
  const upcoming = concerts.sort((a, b) => a.at - b.at).slice(0, MAX_SCHEDULED);
  const saleList = sales.sort((a, b) => a.at - b.at).slice(0, 20);

  for (const { round, at } of saleList) {
    const title = t('saleNotifyTitle');
    const body = t('saleNotifyBody', { title: round.title, platform: round.platform || '—' });
    if (isWeb) {
      const delay = at.getTime() - now;
      if (delay <= MAX_TIMEOUT) webTimers.push(setTimeout(() => new Notification(title, { body }), delay));
    } else {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { roundId: round.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
      });
    }
  }

  for (const { e, at } of upcoming) {
    const title = t('notifyTitle');
    const body = t('notifyBody', { title: e.title, time: e.time, venue: [e.venue, e.city].filter(Boolean).join(', ') });

    if (isWeb) {
      const delay = at.getTime() - now;
      if (delay <= MAX_TIMEOUT) webTimers.push(setTimeout(() => new Notification(title, { body }), delay));
    } else {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { eventId: e.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
      });
    }
  }
}

// Syncs run one at a time so overlapping edits can't cancel each other's schedules.
let queue = Promise.resolve();

// Replaces every pending notification with one per future concert, fired at its date and time.
export function syncEventNotifications(events, t, enabled, rounds = []) {
  queue = queue.then(() => doSync(events, t, enabled, rounds)).catch(() => {});
  return queue;
}

// Number of reminders currently waiting to fire.
export async function countScheduled() {
  await queue;
  if (!notificationsSupported) return 0;
  if (isWeb) return webTimers.length;
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}

// Fires a notification in ~5 seconds so the user can check that delivery works. Resolves false if not allowed.
export async function sendTestNotification(t) {
  if (!(await ensureNotificationPermission())) return false;
  const title = t('notifyTitle');
  const body = t('notifyTest');
  if (isWeb) {
    webTimers.push(setTimeout(() => new Notification(title, { body }), 5000));
  } else {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: CHANNEL },
    });
  }
  return true;
}
