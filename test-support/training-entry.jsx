import React, { act, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Train } from '../src/FitTrack.jsx';
import Library from '../src/LibraryScreen.jsx';
import Plan from '../src/PlanScreen.jsx';
import { fixture } from './fake-supabase.js';
import * as utils from '../src/app-utils.js';
import * as config from '../src/fase1Config.js';
globalThis.__trainingModules = { utils, config };
globalThis.__trainingAct = act;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__trainingWrites = [];
function Entry() {
  const seed = globalThis.__trainingSeed || {};
  const [workouts, updateWorkouts] = useState(seed.workouts || []);
  const setWorkouts = useCallback(value => {
    globalThis.__trainingWrites.push(value);
    updateWorkouts(value);
  }, []);
  const [routines, setRoutines] = useState(seed.routines || []);
  const [view, setView] = useState(seed.view || 'train');
  const [userId, setUserId] = useState('sdd-user-001');
  globalThis.__trainingState = { workouts, routines, setWorkouts, setRoutines, setView, setUserId };
  const noop = () => {};
  return <div className="ft-root">
    {view === 'train' && <Train workouts={workouts} setWorkouts={setWorkouts} routines={routines} setRoutines={setRoutines} userId={userId} initialDate={seed.date || '2026-10-15'} periods={seed.periods || []} menstrualLogs={seed.menstrualLogs || []} wellness={seed.wellness || []} />}
    {view === 'library' && <Library foods={[]} setFoods={noop} recipes={[]} setRecipes={noop} routines={routines} setRoutines={setRoutines} initialView="rutinas" />}
    {view === 'plan' && <Plan routines={routines} setRoutines={setRoutines} workouts={workouts} setTab={noop} />}
  </div>;
}
const root = createRoot(document.getElementById('root'));
globalThis.__trainingUnmount = () => act(() => root.unmount());
act(() => root.render(<Entry />));
