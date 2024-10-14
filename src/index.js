import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import Component from './Component';

const initializeApp = () => {
  const container = document.getElementById('root');
  
  if (!container) {
    console.error('Root element not found');
    return;
  }

  const root = createRoot(container);

  const renderApp = () => (
    <React.StrictMode>
      <Component />
    </React.StrictMode>
  );

  root.render(renderApp());
};

// Immediately initialize the app on load
document.addEventListener('DOMContentLoaded', initializeApp);
