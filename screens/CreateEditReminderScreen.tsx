
import React, { useState, useContext, FormEvent } from 'react';
import { Reminder, Recurrence, Category, Priority } from '../types';
import { ReminderContext } from '../context/ReminderContext';
import { Screen } from '../App';
import { CATEGORIES, PRIORITIES, RECURRENCE_OPTIONS } from '../utils/constants';

interface CreateEditReminderScreenProps {
  navigateTo: (screen: Screen) => void;
  reminder?: Reminder | null;
}

const CreateEditReminderScreen: React.FC<CreateEditReminderScreenProps> = ({ navigateTo, reminder }) => {
  const isEditMode = !!reminder;
  const { addReminder, updateReminder } = useContext(ReminderContext);

  const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
    };
  };

  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    description: reminder?.description || '',
    date: reminder?.date || getDefaultDateTime().date,
    time: reminder?.time || getDefaultDateTime().time,
    recurrence: reminder?.recurrence || 'once',
    category: reminder?.category || 'personal',
    priority: reminder?.priority || 'medium',
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectOption = <T extends string>(name: string, value: T) => {
    setFormData(prev => ({...prev, [name]: value}));
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    
    const now = new Date().toISOString();

    if (isEditMode && reminder) {
      updateReminder(reminder.id, { ...formData, updatedAt: now });
    } else {
      const newReminder: Reminder = {
        id: crypto.randomUUID(),
        ...formData,
        recurrence: formData.recurrence as Recurrence,
        category: formData.category as Category,
        priority: formData.priority as Priority,
        active: true,
        createdAt: now,
        updatedAt: now,
        notificationId: crypto.randomUUID(),
      };
      addReminder(newReminder);
    }
    navigateTo('home');
  };
  
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div>
      <header className="bg-light-surface dark:bg-dark-surface p-4 shadow-md flex items-center sticky top-0 z-10">
        <button onClick={() => navigateTo('home')} className="mr-4" aria-label="Back to home">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-xl font-bold text-light-primary dark:text-dark-primary">
          {isEditMode ? 'Edit Reminder' : 'Create Reminder'}
        </h1>
      </header>

      <main className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className={labelStyle}>Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:ring-light-primary focus:border-light-primary"
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label htmlFor="description" className={labelStyle}>Description (Optional)</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full p-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:ring-light-primary focus:border-light-primary"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="date" className={labelStyle}>Date</label>
                <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className="block w-full p-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:ring-light-primary focus:border-light-primary"
                required
                />
            </div>
            <div>
                <label htmlFor="time" className={labelStyle}>Time</label>
                <input
                type="time"
                name="time"
                id="time"
                value={formData.time}
                onChange={handleChange}
                className="block w-full p-2 border rounded-lg bg-transparent border-gray-300 dark:border-gray-600 focus:ring-light-primary focus:border-light-primary"
                required
                />
            </div>
          </div>
          
          <div>
            <label className={labelStyle}>Recurrence</label>
            <div className="flex flex-wrap gap-2">
                {RECURRENCE_OPTIONS.map(opt => (
                    <button
                        type="button"
                        key={opt}
                        onClick={() => handleSelectOption('recurrence', opt)}
                        className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors border ${
                            formData.recurrence === opt
                                ? 'bg-light-primary text-white dark:bg-dark-primary border-transparent'
                                : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >{opt}</button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelStyle}>Category</label>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(opt => (
                         <button
                            type="button"
                            key={opt}
                            onClick={() => handleSelectOption('category', opt)}
                            className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors border ${
                                formData.category === opt
                                    ? 'bg-light-primary text-white dark:bg-dark-primary border-transparent'
                                    : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >{opt}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className={labelStyle}>Priority</label>
                <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map(opt => (
                        <button
                            type="button"
                            key={opt}
                            onClick={() => handleSelectOption('priority', opt)}
                            className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors border ${
                                formData.priority === opt
                                    ? 'bg-light-primary text-white dark:bg-dark-primary border-transparent'
                                    : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >{opt}</button>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary px-6 py-2 rounded-lg font-medium shadow hover:opacity-90 transition-transform transform active:scale-95"
            >
              Save Reminder
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateEditReminderScreen;