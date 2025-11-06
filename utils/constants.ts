// Fix: Import React to use React.createElement
import React from 'react';
import { Category, Priority, Recurrence, SortBy } from "../types";

// Icons for categories
// Fix: Rewrite SVG components using React.createElement to avoid JSX syntax in a .ts file.
const WorkIcon = ({className}:{className: string}) => React.createElement('svg', {className, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor"}, React.createElement('path', {strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"}));
const PersonalIcon = ({className}:{className: string}) => React.createElement('svg', {className, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor"}, React.createElement('path', {strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"}));
const HealthIcon = ({className}:{className: string}) => React.createElement('svg', {className, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor"}, React.createElement('path', {strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"}));
const ShoppingIcon = ({className}:{className: string}) => React.createElement('svg', {className, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor"}, React.createElement('path', {strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"}));
const CustomIcon = ({className}:{className: string}) => React.createElement('svg', {className, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor"}, React.createElement('path', {strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 5a2 2 0 012-2h10a2 2 0 012 2v1h2a1 1 0 011 1v3a1 1 0 01-1 1h-2v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1H3a1 1 0 01-1-1V7a1 1 0 011-1h2V5z"}));


export const CATEGORY_CONFIG: Record<Category, { icon: React.FC<{className: string}>; color: string }> = {
    work: { icon: WorkIcon, color: '#2196F3' },
    personal: { icon: PersonalIcon, color: '#9C27B0' },
    health: { icon: HealthIcon, color: '#4CAF50' },
    shopping: { icon: ShoppingIcon, color: '#FF9800' },
    custom: { icon: CustomIcon, color: '#607D8B' },
};

export const RECURRENCE_OPTIONS: Recurrence[] = ['once', 'daily', 'weekly', 'monthly'];
export const CATEGORIES: Category[] = ['personal', 'work', 'health', 'shopping', 'custom'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const SORT_OPTIONS: { label: string; value: SortBy }[] = [
    { label: 'Date (Oldest First)', value: 'date-asc'},
    { label: 'Date (Newest First)', value: 'date-desc'},
    { label: 'Priority (High to Low)', value: 'priority'},
    { label: 'Recently Created', value: 'created-desc'},
];