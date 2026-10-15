import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/FitTrack.jsx';
import { fixture } from './fake-supabase.js';

globalThis.__sddFixture = fixture;
const root = createRoot(document.getElementById('root'));
globalThis.__sddUnmount = () => root.unmount();
root.render(<React.StrictMode><App /></React.StrictMode>);
