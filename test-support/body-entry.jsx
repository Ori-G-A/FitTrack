import React,{act,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Body from '../src/BodyScreen.jsx';
import Perfil from '../src/PerfilScreen.jsx';
import Dashboard from '../src/DashboardScreen.jsx';
import {Train} from '../src/TrainingScreen.jsx';
import Diario from '../src/DiarioScreen.jsx';
import * as cycle from '../src/cycle-inference.js';
import * as app from '../src/app-utils.js';
import * as alerts from '../src/alerts.js';
import * as settings from '../src/settings-utils.js';
import * as config from '../src/app-config.js';
globalThis.__bodyModules={cycle,app,alerts,settings,config};
globalThis.__bodyEvents=[];globalThis.__bodyAct=act;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
function Entry(){
 const seed=globalThis.__bodySeed||{};
 const [weights,writeWeights]=useState(seed.weights||[]),[measurements,setMeasurements]=useState(seed.measurements||[]),[wellness,writeWellness]=useState(seed.wellness||[]),[periods,setPeriods]=useState(seed.periods||[]),[menstrualLogs,setMenstrualLogs]=useState(seed.menstrualLogs||[]),[photos,setPhotos]=useState(seed.photos||[]),[goals,setGoals]=useState({...config.DEFAULT_GOALS,autoMacros:false,...seed.goals}),[view,setView]=useState(seed.view||'body'),[section,setSection]=useState(seed.section||'peso'),[date,setDate]=useState(seed.date||'2026-10-18'),[mount,setMount]=useState(0),[workouts,setWorkouts]=useState(seed.workouts||[]);
 const setWeights=next=>{globalThis.__bodyWeightWrite=next;writeWeights(next);};
 const setWellness=next=>{globalThis.__bodyEvents.push("wellness");writeWellness(next);};
 const shared={weights,setWeights,measurements,setMeasurements,wellness,setWellness,periods,setPeriods,menstrualLogs,setMenstrualLogs,photos,setPhotos,goals,setGoals,userId:'body-user',workouts,setWorkouts,routines:[],setRoutines:()=>{},nutrition:[],foods:[],recipes:[],setTab:setView};
 globalThis.__bodyState={...shared,view,setView,section,setSection,date,setDate,mount,setMount};
 return <div className="ft-root">{view==='body'?<Body key={mount} {...shared} section={section} initialDate={date}/>:view==='perfil'?<Perfil {...shared}/>:view==='dashboard'?<Dashboard {...shared}/>:view==='train'?<Train {...shared} initialDate={date}/>:view==='diario'?<Diario {...shared}/>:null}</div>;
}
const root=createRoot(document.getElementById('root'));globalThis.__bodyUnmount=()=>act(()=>root.unmount());act(()=>root.render(<Entry/>));
