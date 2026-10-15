import React from 'react';
import { createRoot } from 'react-dom/client';
import * as sync from '../src/data-sync.js';
import { fixture } from './fake-supabase.js';
const root = createRoot(document.getElementById('root'));
function Probe({ userId, keyName, value, enabled, delay }) {
  sync.useSyncedValue(userId, keyName, value, enabled, delay);
  return null;
}
globalThis.__sddFixture = fixture;
globalThis.__sddSync = sync;
globalThis.__sddRenderHook = props => root.render(<Probe {...props} />);
globalThis.__sddUnmount = () => root.unmount();
