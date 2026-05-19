import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    let hasUnregistered = false;
    for (let registration of registrations) {
      await registration.unregister();
      hasUnregistered = true;
    }
    if (hasUnregistered) {
      if (window.caches) {
        const keys = await window.caches.keys();
        for (const key of keys) {
          await window.caches.delete(key);
        }
      }
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }).catch(console.error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
