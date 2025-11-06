import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Reminder, Theme, Filters, SortBy, Priority } from '../types';
import * as StorageService from '../services/storageService';
import * as NotificationService from '../services/notificationService';

interface ReminderContextData {
  reminders: Reminder[];
  loading: boolean;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  togglePause: (id: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  backupSecretKey: string;
  lastBackup: string | null;
  setLastBackup: (timestamp: string) => void;
  getAllReminders: () => Reminder[];
}

export const ReminderContext = createContext<ReminderContextData>({} as ReminderContextData);

const PRIORITY_ORDER: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ status: 'active' });
  const [sortBy, setSortBy] = useState<SortBy>('date-asc');

  const [webAppUrl, setWebAppUrlState] = useState<string>(() => localStorage.getItem('webAppUrl') || '');
  const [backupSecretKey, setBackupSecretKeyState] = useState<string>(() => {
    let key = localStorage.getItem('backupSecretKey');
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem('backupSecretKey', key);
    }
    return key;
  });
  const [lastBackup, setLastBackupState] = useState<string | null>(() => localStorage.getItem('lastBackup'));

  // Load reminders on initial mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const storedReminders = await StorageService.loadReminders();
      setReminders(storedReminders);
      await NotificationService.initialize();
      await NotificationService.scheduleAllReminders(storedReminders.filter(r => r.active));
      setLoading(false);
    };
    loadData();
  }, []);

  const setWebAppUrl = (url: string) => {
    setWebAppUrlState(url);
    localStorage.setItem('webAppUrl', url);
  };

  const setLastBackup = (timestamp: string) => {
    setLastBackupState(timestamp);
    localStorage.setItem('lastBackup', timestamp);
  };

  const addReminder = useCallback(async (reminder: Reminder) => {
    const newReminders = [...reminders, reminder];
    setReminders(newReminders);
    await StorageService.saveReminders(newReminders);
    await NotificationService.scheduleNotification(reminder);
  }, [reminders]);

  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>) => {
    const newReminders = reminders.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r);
    setReminders(newReminders);
    const updatedReminder = newReminders.find(r => r.id === id);
    await StorageService.saveReminders(newReminders);
    if(updatedReminder) {
        await NotificationService.rescheduleNotification(updatedReminder);
    }
  }, [reminders]);

  const deleteReminder = useCallback(async (id: string) => {
    const reminderToDelete = reminders.find(r => r.id === id);
    const newReminders = reminders.filter(r => r.id !== id);
    setReminders(newReminders);
    await StorageService.saveReminders(newReminders);
    if(reminderToDelete) {
        await NotificationService.cancelNotification(reminderToDelete.notificationId);
    }
  }, [reminders]);
  
  const togglePause = useCallback(async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    const newActiveState = !reminder.active;
    const newReminders = reminders.map(r => r.id === id ? { ...r, active: newActiveState, updatedAt: new Date().toISOString() } : r);
    setReminders(newReminders);
    const updatedReminder = newReminders.find(r => r.id === id);
    if (!updatedReminder) return;

    await StorageService.saveReminders(newReminders);
    
    if (newActiveState) {
        await NotificationService.scheduleNotification(updatedReminder);
    } else {
        await NotificationService.cancelNotification(updatedReminder.notificationId);
    }
  }, [reminders]);
  
  const getAllReminders = useCallback(() => {
    return [...reminders];
  }, [reminders]);

  const processedReminders = useMemo(() => {
    let processed = [...reminders];

    // 1. Filtering
    if (filters.status !== 'all') {
      processed = processed.filter(r => r.active === (filters.status === 'active'));
    }

    // 2. Searching
    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      processed = processed.filter(r => 
        r.title.toLowerCase().includes(lowercasedQuery) ||
        r.description.toLowerCase().includes(lowercasedQuery)
      );
    }

    // 3. Sorting
    processed.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
        case 'date-desc':
          return new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime();
        case 'priority':
          return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        case 'created-desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return processed;
  }, [reminders, filters, searchQuery, sortBy]);

  return (
    <ReminderContext.Provider value={{ 
        reminders: processedReminders, 
        loading, 
        addReminder, 
        updateReminder, 
        deleteReminder,
        togglePause,
        theme,
        setTheme,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        sortBy,
        setSortBy,
        webAppUrl,
        setWebAppUrl,
        backupSecretKey,
        lastBackup,
        setLastBackup,
        getAllReminders,
    }}>
      {children}
    </ReminderContext.Provider>
  );
};
