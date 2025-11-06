
import { Reminder } from '../types';
import { getNextOccurrence } from '../utils/dateUtils';

/**
 * Initializes the notification system by requesting permission.
 */
export const initialize = async (): Promise<void> => {
  if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
  }
};

/**
 * Schedules a single notification for a reminder.
 * @param reminder The reminder object.
 */
export const scheduleNotification = async (reminder: Reminder): Promise<void> => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log(`Notification permission not granted. Mock scheduling for: "${reminder.title}"`);
    return;
  }

  const nextOccurrence = getNextOccurrence(reminder);
  const now = new Date();
  
  if (nextOccurrence < now) {
      console.log(`Skipping past reminder: "${reminder.title}"`);
      return;
  }
  
  const delay = nextOccurrence.getTime() - now.getTime();

  setTimeout(() => {
    new Notification(reminder.title, {
      body: reminder.description,
      tag: reminder.notificationId,
    });
    console.log(`[NOTIFICATION FIRED] ${reminder.title}`);

    // If it's a recurring reminder, automatically schedule the next one.
    if (reminder.recurrence !== 'once') {
      console.log(`[RECURRING] Re-scheduling next notification for "${reminder.title}"`);
      scheduleNotification(reminder);
    }
  }, delay);

  console.log(`[SCHEDULED] "${reminder.title}" for ${nextOccurrence.toLocaleString()}`);
};

/**
 * Cancels a scheduled notification.
 * NOTE: There's no way to cancel a setTimeout, so this is a mock.
 * In a real app, you'd use the notification library's cancel function.
 * @param notificationId The ID of the notification to cancel.
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  console.log(`[CANCELED] Notification with ID: ${notificationId}`);
  // With a real library: PushNotification.cancelLocalNotifications({id: notificationId});
};

/**
 * Reschedules a notification by canceling the old one and scheduling a new one.
 * @param reminder The reminder to reschedule.
 */
export const rescheduleNotification = async (reminder: Reminder): Promise<void> => {
  await cancelNotification(reminder.notificationId);
  await scheduleNotification(reminder);
};

/**
 * Schedules notifications for all active reminders.
 * Useful on app startup to handle device reboots.
 * @param remindersArray An array of all reminders.
 */
export const scheduleAllReminders = async (remindersArray: Reminder[]): Promise<void> => {
  const activeReminders = remindersArray.filter(r => r.active);
  console.log(`[INIT] Scheduling ${activeReminders.length} active reminders.`);
  for (const reminder of activeReminders) {
    await scheduleNotification(reminder);
  }
};
