
import { Reminder } from '../types';
import { addDays, addMonths, format, formatRelative, isPast } from 'date-fns';

/**
 * Calculates the next occurrence of a reminder.
 * @param reminder The reminder object.
 * @returns A Date object for the next occurrence.
 */
export const getNextOccurrence = (reminder: Reminder): Date => {
  let nextDate = new Date(`${reminder.date}T${reminder.time}`);
  
  if (isPast(nextDate) && reminder.recurrence !== 'once') {
    const now = new Date();
    switch (reminder.recurrence) {
      case 'daily':
        while (isPast(nextDate)) {
          nextDate = addDays(nextDate, 1);
        }
        break;
      case 'weekly':
        while (isPast(nextDate)) {
          nextDate = addDays(nextDate, 7);
        }
        break;
      case 'monthly':
        // This is a simple implementation. A robust one would handle end-of-month cases better.
        while (isPast(nextDate)) {
          nextDate = addMonths(nextDate, 1);
        }
        break;
    }
  }
  
  return nextDate;
};


/**
 * Formats a date into a user-friendly relative string like "Tomorrow at 10:00 AM".
 * @param date The date to format.
 * @returns A formatted string.
 */
export const formatRelativeDate = (date: Date): string => {
  const relativeDay = formatRelative(date, new Date()).split(' at ')[0];
  const time = format(date, 'p'); // e.g., 10:00 AM
  return `${relativeDay} at ${time}`;
};
