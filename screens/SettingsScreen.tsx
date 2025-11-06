import React, { useContext, useState, useEffect } from 'react';
import { ReminderContext } from '../context/ReminderContext';
import { Screen } from '../App';
import { Theme } from '../types';
import { backupToDrive } from '../services/googleSheetService';
import Spinner from '../components/Spinner';

interface SettingsScreenProps {
  navigateTo: (screen: Screen) => void;
}

const APPS_SCRIPT_CODE = `// 1. Paste your secret key here.
var SCRIPT_SECRET = "PASTE_YOUR_SECRET_KEY_HERE";
var FOLDER_NAME = "NudgeMe Backups";
var FILE_NAME = "reminders.json";

// This function is REQUIRED to handle CORS preflight requests from the browser.
function doOptions(e) {
  return ContentService.createTextOutput()
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * Finds the backup file using a stored ID, or creates a new one if not found.
 * This is secure because it accesses the file directly by ID, avoiding broad searches.
 * @returns {File} The backup file object.
 */
function getOrCreateBackupFile() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var fileId = scriptProperties.getProperty('backupFileId');
  
  if (fileId) {
    try {
      var file = DriveApp.getFileById(fileId);
      var parentFolder = file.getParents().next();
      if (parentFolder.getName() === FOLDER_NAME) {
        return file; // File and folder are valid
      }
    } catch (e) {
      // File or folder was likely deleted, so we'll create a new one.
    }
  }

  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);

  var files = folder.getFilesByName(FILE_NAME);
  var newFile = files.hasNext() ? files.next() : folder.createFile(FILE_NAME, "[]", MimeType.PLAIN_TEXT);

  scriptProperties.setProperty('backupFileId', newFile.getId());
  return newFile;
}

function doPost(e) {
  var responseHeaders = { "Access-Control-Allow-Origin": "*" };
  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error("No data received in the request.");
    }
    var postData = JSON.parse(e.postData.contents);
    
    if (postData.secret !== SCRIPT_SECRET) {
      throw new Error("Invalid secret key.");
    }

    if (!postData.reminders || !Array.isArray(postData.reminders)) {
      throw new Error("Invalid or missing 'reminders' data in payload.");
    }

    var remindersJson = JSON.stringify(postData.reminders, null, 2);
    
    var file = getOrCreateBackupFile();
    file.setContent(remindersJson);
    DriveApp.flush();
    
    // **NEW VERIFICATION STEP**
    // Read the file back to ensure the content was written correctly.
    var writtenContent = file.getBlob().getDataAsString();
    if (writtenContent !== remindersJson) {
      throw new Error("Verification failed. File content in Drive does not match sent data.");
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Backup successful. " + postData.reminders.length + " reminders saved and verified."
    })).setMimeType(ContentService.MimeType.JSON).setHeaders(responseHeaders);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Script error: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON).setHeaders(responseHeaders);
  }
}`;

const SetupBackupModal: React.FC<{
    initialUrl: string;
    secretKey: string;
    onSave: (url: string) => void;
    onCancel: () => void;
}> = ({ initialUrl, secretKey, onSave, onCancel }) => {
    const [scriptUrl, setScriptUrl] = useState(initialUrl);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text)
            .then(() => alert(`${type} copied to clipboard!`))
            .catch(() => alert(`Failed to copy ${type}. Please copy it manually.`));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Set Up Secure Backup to Google Drive</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    To securely save a backup file to your Google Drive, a small script with a secret key is required. This is a one-time setup.
                    <br />
                    The script will create a folder named <strong>"NudgeMe Backups"</strong> and save your backup file inside it.
                </p>

                <ol className="list-decimal list-inside text-sm space-y-3 mb-4">
                    <li>Go to <a href="https://script.google.com/home/my" target="_blank" rel="noopener noreferrer" className="text-light-primary underline">script.google.com</a> and start a new project.</li>
                    
                    <li>Copy your unique secret key below. This is your private password that prevents unauthorized access.
                        <div className="my-2 relative bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          <button onClick={() => handleCopy(secretKey, 'Secret Key')} className="absolute top-2 right-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">Copy Key</button>
                          <code className="text-xs break-all">{secretKey}</code>
                        </div>
                    </li>

                    <li>Delete any existing code in the script editor and paste the code provided below. Then, paste your secret key into the `SCRIPT_SECRET` variable at the top of the script.
                      <div className="my-2 relative bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <button onClick={() => handleCopy(APPS_SCRIPT_CODE, 'Code')} className="absolute top-2 right-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">Copy Code</button>
                        <pre className="text-xs whitespace-pre-wrap overflow-x-auto"><code>{APPS_SCRIPT_CODE}</code></pre>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <strong>Security Note:</strong> This script is designed to access only the single file it creates. It saves the file's ID so it never needs to search your Google Drive.
                      </p>
                    </li>

                    <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
                    <li>Click the gear icon (⚙️) and select <strong>Web app</strong>.</li>
                    <li>Under "Who has access", select <strong>Anyone</strong>. (Your secret key will still protect your data).</li>
                    <li>Click <strong>Deploy</strong> and <strong>Authorize access</strong>. Google will ask for permission for the script to manage files in your Drive.</li>
                    <li>Copy the generated <strong>Web app URL</strong> and paste it below.</li>
                </ol>
                
                <hr className="my-4 dark:border-gray-600"/>

                <h4 className="font-semibold mb-2">Troubleshooting</h4>
                <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li><strong>Error: "Invalid secret key"</strong>: Double-check that you copied the secret key correctly into the script.</li>
                    <li><strong>Error: "Script error: ..."</strong>: Make sure you've authorized the script's permissions for Google Drive. Try re-authorizing.</li>
                    <li><strong>Error: "Could not connect..."</strong> or <strong>"Failed to fetch"</strong>: This is a network or CORS error. Ensure you created a **New Deployment** after pasting the latest code and are using the new URL.</li>
                    <li>If you change the deployment, you must select <strong>Manage Deployments</strong>, edit your deployment, and select <strong>"New version"</strong> to get an updated URL.</li>
                </ul>

                <div className="mt-6">
                    <label htmlFor="web-app-url" className="block text-sm font-medium mb-1">Web App URL</label>
                    <input
                        id="web-app-url"
                        type="url"
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                        className="block w-full p-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:ring-light-primary focus:border-light-primary"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                    <button onClick={() => onSave(scriptUrl)} className="bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary px-4 py-2 rounded-lg text-sm font-medium shadow hover:opacity-90">Save URL</button>
                </div>
            </div>
        </div>
    );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigateTo }) => {
  const { 
    theme, setTheme, webAppUrl, setWebAppUrl, backupSecretKey, 
    lastBackup, setLastBackup, getAllReminders
  } = useContext(ReminderContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  useEffect(() => {
      if (message) {
          const timer = setTimeout(() => setMessage(null), 5000);
          return () => clearTimeout(timer);
      }
  }, [message]);

  const handleBackupToDrive = async () => {
    if (!webAppUrl) {
      setIsSetupModalOpen(true);
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const reminders = getAllReminders();
      if (reminders.length === 0) {
        setMessage({ type: 'info', text: 'No reminders to backup.' });
        setIsLoading(false);
        return;
      }
      const successMessage = await backupToDrive(webAppUrl, backupSecretKey, reminders);
      setLastBackup(new Date().toISOString());
      setMessage({ type: 'success', text: successMessage });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to backup. Check console for details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebAppUrl = (newUrl: string) => {
    setWebAppUrl(newUrl);
    setIsSetupModalOpen(false);
    setMessage({ type: 'success', text: 'Backup URL saved. You can now back up to Google Drive.' });
  };
  
  const formatDate = (isoString: string | null) => {
      if (!isoString) return 'never';
      return new Date(isoString).toLocaleString();
  }

  return (
    <>
      {isLoading && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><Spinner size="lg" /></div>}
      {isSetupModalOpen && <SetupBackupModal initialUrl={webAppUrl} secretKey={backupSecretKey} onSave={handleSaveWebAppUrl} onCancel={() => setIsSetupModalOpen(false)} />}
      
      <div>
        <header className="bg-light-surface dark:bg-dark-surface p-4 shadow-md flex items-center sticky top-0 z-10">
          <button onClick={() => navigateTo('home')} className="mr-4" aria-label="Back to home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-xl font-bold text-light-primary dark:text-dark-primary">Settings</h1>
        </header>
        <main className="p-4 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Appearance</h2>
            <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="flex gap-2 sm:gap-4">
                {(['light', 'dark', 'system'] as Theme[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 p-3 text-sm sm:text-base rounded-lg border-2 transition-colors capitalize ${theme === t ? 'border-light-primary dark:border-dark-primary' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Google Drive Backup</h2>
            <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Securely back up your reminders as a JSON file to your Google Drive.
                </p>
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded-md mb-4">
                  <p>Your backups are saved in a folder named <strong>NudgeMe Backups</strong>.</p>
                  <p>The file will be named <strong>reminders.json</strong>.</p>
                </div>
                <button onClick={handleBackupToDrive} disabled={isLoading} className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary disabled:opacity-50">
                  {isLoading ? 'Backing up...' : 'Backup to Drive'}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                  Direct backup requires a one-time setup.
                  <button onClick={() => setIsSetupModalOpen(true)} className="text-light-primary dark:text-dark-primary underline ml-1 font-semibold">
                      {webAppUrl ? 'View/Update Setup' : 'Set Up Backup'}
                  </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
                <p>Last Backup: {formatDate(lastBackup)}</p>
              </div>
            </div>
          </section>

          <section>
               <h2 className="text-lg font-semibold mb-2">About</h2>
               <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>NudgeMe Reminder App</strong></p>
                  <p>Version: 1.2.0</p>
                  <p className="mt-2">All data is stored locally on your device.</p>
               </div>
          </section>
        </main>
        {message && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white ${message.type === 'success' ? 'bg-green-600' : message.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
              {message.text}
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsScreen;