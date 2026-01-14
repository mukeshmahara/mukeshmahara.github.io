import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// Global listener for resource load errors (e.g., 404s)
window.addEventListener('error', function(event) {
  const target = event.target || event.srcElement;
  if (target && (target.src || target.href)) {
    const url = target.src || target.href;
    console.error('Resource failed to load:', url);
    // TODO: replace console.error with your tracking endpoint or analytics call
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
