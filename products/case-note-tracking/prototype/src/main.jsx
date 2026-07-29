import React from 'react';
import { createRoot } from 'react-dom/client';
import '@dhcw/sr-tokens/build/css/tokens.css';
import '@dhcw/sr-tokens/build/css/typography.css';
import './app.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
