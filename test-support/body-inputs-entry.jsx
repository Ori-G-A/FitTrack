import React, {act, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import BodyScreen from '../src/BodyScreen.jsx';
import {CSS} from '../src/app-styles.js';
import {DEFAULT_GOALS} from '../src/app-config.js';
import {Toast} from '../src/toast.jsx';

// Contenedor de observación: la validación y los handlers siguen en BodyScreen.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__bodyInputsAct = act;
function Entry() {
  const seed = globalThis.__bodyInputsSeed || {};
  const [weights, writeWeights] = useState(seed.weights || []);
  const [measurements, writeMeasurements] = useState(seed.measurements || []);
  const [wellness, writeWellness] = useState(seed.wellness || []);
  const [goals, setGoals] = useState({...DEFAULT_GOALS, sex: 'hombre', autoMacros: false, ...seed.goals});
  const calls = useRef([]);
  const wrap = (key, write) => next => {calls.current.push(key); write(next);};
  globalThis.__bodyInputs = {weights, measurements, wellness, calls: calls.current,
    replace: {weights: writeWeights, measurements: writeMeasurements, wellness: writeWellness}};
  return <div className="ft-root" data-theme="dark"><style>{CSS}</style>
    <BodyScreen section={seed.section || 'peso'} initialDate={seed.date || '2026-10-18'}
      weights={weights} setWeights={wrap('weights', writeWeights)}
      measurements={measurements} setMeasurements={wrap('measurements', writeMeasurements)}
      wellness={wellness} setWellness={wrap('wellness', writeWellness)}
      goals={goals} setGoals={setGoals} periods={[]} setPeriods={()=>{}}
      menstrualLogs={[]} setMenstrualLogs={()=>{}} photos={[]} setPhotos={()=>{}} userId="synthetic010"/>
    <Toast/>
  </div>;
}
act(() => createRoot(document.getElementById('root')).render(<Entry/>));
