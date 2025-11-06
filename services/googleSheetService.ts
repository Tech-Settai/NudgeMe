import { Reminder } from '../types';

/**
 * Sends reminder data to a Google Apps Script Web App for backup to Google Drive.
 * @param webAppUrl The deployment URL of the Google Apps Script.
 * @param secretKey The secret key to authenticate the request.
 * @param reminders The array of reminders to back up.
 * @returns A promise that resolves with the success message from the script.
 */
export async function backupToDrive(webAppUrl: string, secretKey: string, reminders: Reminder[]): Promise<string> {
  try {
    const payload = {
      secret: secretKey,
      reminders: reminders,
    };

    const response = await fetch(webAppUrl, {
      method: 'POST',
      mode: 'cors', // Use standard CORS mode to allow reading the response
      headers: {
        'Content-Type': 'application/json', // Set correct content type for the payload
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === 'error') {
        throw new Error(`Backup script failed: ${result.message}`);
    }
    
    return result.message || 'Backup successful.';

  } catch (error) {
    console.error('Failed to send backup data:', error);
    if (error instanceof Error) {
        throw new Error(`Could not connect to the backup script. Check the URL and network. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred during backup.');
  }
}
