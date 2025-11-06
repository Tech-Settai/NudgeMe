
import { Reminder } from '../types';

const REMINDERS_KEY = 'reminders.json';

/**
 * Loads all reminders from local storage.
 * @returns A promise that resolves to an array of reminder objects.
 */
export const loadReminders = async (): Promise<Reminder[]> => {
  try {
    const remindersJson = localStorage.getItem(REMINDERS_KEY);
    if (!remindersJson) {
      return []; // If no file exists, return empty array.
    }
    return JSON.parse(remindersJson) as Reminder[];
  } catch (error) {
    console.error("Data corrupted, creating fresh file.", error);
    // If parsing fails, assume data is corrupted and start fresh.
    localStorage.removeItem(REMINDERS_KEY);
    return [];
  }
};

/**
 * Saves the entire reminders array to local storage.
 * In a real React Native app, this would use an atomic write:
 * 1. Write to a temporary file.
 * 2. If successful, rename/move the temporary file to the final destination.
 * This prevents data corruption if the app crashes during a write.
 * @param remindersArray The array of reminder objects to save.
 */
export const saveReminders = async (remindersArray: Reminder[]): Promise<void> => {
  try {
    const remindersJson = JSON.stringify(remindersArray, null, 2);
    localStorage.setItem(REMINDERS_KEY, remindersJson);
  } catch (error) {
    console.error("Could not save reminders.", error);
    // In a real app, you might show an alert to the user.
    alert("Error: Could not save your reminders. Your device storage might be full.");
  }
};
