
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ReminderProvider } from './context/ReminderContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ReminderProvider>
      <App />
    </ReminderProvider>
  </React.StrictMode>
);
