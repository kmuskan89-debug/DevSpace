import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const origError = console.error;
console.error = function (...args) {
  origError.apply(console, args);
  if (args.some((a) => typeof a === 'string' && a.includes('Maximum update depth'))) {
    console.log('=== REACT ERROR DETAILS ===', ...args);
    console.log('=== CALLER STACK ===', new Error().stack);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
