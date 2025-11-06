export type Recurrence = 'once' | 'daily' | 'weekly' | 'monthly';
export type Category = 'work' | 'personal' | 'health' | 'shopping' | 'custom';
export type Priority = 'high' | 'medium' | 'low';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  recurrence: Recurrence;
  category: Category;
  priority: Priority;
  active: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  notificationId: string;
}

export type Theme = 'light' | 'dark' | 'system';

export type SortBy = 'date-asc' | 'date-desc' | 'priority' | 'created-desc';
export type FilterStatus = 'all' | 'active' | 'paused';

export interface Filters {
    status: FilterStatus;
}