import React, { useState, useCallback, useContext } from 'react';
import { Reminder, Theme } from './types';
import HomeScreen from './screens/HomeScreen';
import CreateEditReminderScreen from './screens/CreateEditReminderScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ReminderContext } from './context/ReminderContext';

export type Screen = 'home' | 'create' | 'edit' | 'settings';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const { theme } = useContext(ReminderContext);

  const navigateTo = useCallback((screen: Screen, reminder?: Reminder) => {
    if ((screen === 'edit') && reminder) {
      setEditingReminder(reminder);
    } else {
      setEditingReminder(null);
    }
    setCurrentScreen(screen);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'create':
        return <CreateEditReminderScreen navigateTo={navigateTo} />;
      case 'edit':
        return <CreateEditReminderScreen navigateTo={navigateTo} reminder={editingReminder} />;
      case 'settings':
        return <SettingsScreen navigateTo={navigateTo} />;
      case 'home':
      default:
        return <HomeScreen navigateTo={navigateTo} />;
    }
  };

  React.useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (themeValue: Theme) => {
      if (themeValue === 'system') {
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else if (themeValue === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);
  
  return (
    <div className="bg-light-background dark:bg-dark-background text-light-on-surface dark:text-dark-on-surface min-h-screen font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;