import React from 'react';
import { createRoot } from 'react-dom/client';
import 'whatwg-fetch'; // eski webOS'ta fetch polyfill
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);