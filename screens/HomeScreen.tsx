import React, { useContext, useState, useEffect } from 'react';
import { ReminderContext } from '../context/ReminderContext';
import ReminderCard from '../components/ReminderCard';
import { Screen } from '../App';
import { Reminder, SortBy, FilterStatus } from '../types';
import { SORT_OPTIONS } from '../utils/constants';

interface HomeScreenProps {
  navigateTo: (screen: Screen, reminder?: Reminder) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigateTo }) => {
  const { 
    reminders, 
    loading, 
    deleteReminder, 
    togglePause,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy
  } = useContext(ReminderContext);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleDelete = (reminder: Reminder) => {
    if(window.confirm("Delete this reminder?")) {
      deleteReminder(reminder.id);
    }
  };

  return (
    <div className="relative min-h-screen">
      <header className="bg-light-surface dark:bg-dark-surface p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-light-primary dark:text-dark-primary">Reminders</h1>
          <button onClick={() => navigateTo('settings')} aria-label="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        <input 
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:ring-light-primary focus:border-light-primary"
        />
      </header>

      <div className="p-4">
        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="flex gap-2">
              {(['active', 'paused', 'all'] as FilterStatus[]).map(status => (
                  <button key={status} onClick={() => setFilters({ ...filters, status })}
                      className={`px-3 py-1 text-sm rounded-full border capitalize ${filters.status === status ? 'bg-light-primary text-white dark:bg-dark-primary' : 'bg-transparent'}`}
                  >{status}</button>
              ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="p-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 text-sm">
            {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {notificationPermission === 'default' && (
          <div className="bg-light-secondary/20 dark:bg-dark-secondary/20 border-l-4 border-light-primary dark:border-dark-primary p-4 rounded-md mb-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">Notifications are turned off.</p>
            </div>
            <button
              onClick={handleRequestPermission}
              className="bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary px-4 py-2 rounded-lg text-sm font-medium shadow hover:opacity-90 transition-transform transform active:scale-95"
            >
              Turn On
            </button>
          </div>
        )}

        {notificationPermission === 'denied' && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-light-error dark:border-dark-error p-4 rounded-md mb-4 flex items-center justify-between shadow-sm">
                <div>
                    <p className="font-semibold text-light-error dark:text-dark-error">Notifications are blocked.</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">To receive alerts, enable notifications for this site in your browser settings.</p>
                </div>
            </div>
        )}
      </div>
      
      <main className="px-4 pb-24">
        {loading && <p className="text-center">Loading reminders...</p>}
        
        {!loading && reminders.length === 0 && (
          <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584M15 16a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584" /></svg>
            <h2 className="text-xl font-semibold">No reminders found</h2>
            <p className="mt-2">Try adjusting your search or filters, or create a new reminder!</p>
          </div>
        )}

        {!loading && reminders.length > 0 && (
          <div className="space-y-4">
            {reminders.map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder}
                onEdit={() => navigateTo('edit', reminder)}
                onDelete={handleDelete}
                onTogglePause={() => togglePause(reminder.id)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => navigateTo('create')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary rounded-full shadow-lg flex items-center justify-center text-3xl font-light hover:bg-opacity-90 transition-transform transform active:scale-90"
        aria-label="Create new reminder"
      >
        +
      </button>
    </div>
  );
};

export default HomeScreen;