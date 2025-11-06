
import React, { useMemo } from 'react';
import { Reminder } from '../types';
import { getNextOccurrence, formatRelativeDate } from '../utils/dateUtils';
import { CATEGORY_CONFIG } from '../utils/constants';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
  onTogglePause: (reminder: Reminder) => void;
}

const PriorityIndicator: React.FC<{ priority: Reminder['priority'] }> = ({ priority }) => {
  const color = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }[priority];
  return <div className={`w-3 h-3 rounded-full ${color}`} title={`Priority: ${priority}`}></div>;
};

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onEdit, onDelete, onTogglePause }) => {
  const { icon: CategoryIcon, color: categoryColor } = CATEGORY_CONFIG[reminder.category];

  const nextOccurrence = useMemo(() => getNextOccurrence(reminder), [reminder]);
  const formattedNextOccurrence = useMemo(() => formatRelativeDate(nextOccurrence), [nextOccurrence]);

  return (
    <div 
        className={`bg-light-surface dark:bg-dark-surface rounded-xl shadow-md p-4 flex items-start gap-4 transition-opacity ${!reminder.active ? 'opacity-50' : ''}`}
        aria-label={`Reminder: ${reminder.title}`}
    >
        <div style={{ color: categoryColor }} className="mt-1">
            <CategoryIcon className="w-6 h-6" />
        </div>

        <div className="flex-grow">
            <h3 className="font-bold text-lg text-light-on-surface dark:text-dark-on-surface">{reminder.title}</h3>
            {reminder.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reminder.description}</p>}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-300">
                <span>{formattedNextOccurrence}</span>
                {reminder.recurrence !== 'once' && (
                  <span className="capitalize bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{reminder.recurrence}</span>
                )}
            </div>
             {!reminder.active && (
                <div className="mt-2 text-xs font-bold text-yellow-600 dark:text-yellow-400">PAUSED</div>
            )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <PriorityIndicator priority={reminder.priority} />
            <div className="flex gap-2 mt-auto">
                <button onClick={() => onTogglePause(reminder)} className="text-gray-500 hover:text-light-primary dark:hover:text-dark-primary" aria-label={reminder.active ? 'Pause reminder' : 'Resume reminder'}>
                    {reminder.active ? <PauseIcon/> : <PlayIcon/>}
                </button>
                <button onClick={() => onEdit(reminder)} className="text-gray-500 hover:text-light-primary dark:hover:text-dark-primary" aria-label="Edit reminder">
                    <PencilIcon />
                </button>
                <button onClick={() => onDelete(reminder)} className="text-gray-500 hover:text-red-500" aria-label="Delete reminder">
                    <TrashIcon />
                </button>
            </div>
        </div>
    </div>
  );
};

// Icons
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;


export default React.memo(ReminderCard);
