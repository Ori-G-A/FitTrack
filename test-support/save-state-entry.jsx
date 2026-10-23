import React,{act,useState,useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App,{CSS} from '../src/FitTrack.jsx';
import {SaveIndicator} from '../src/AuthUI.jsx';
import * as sync from '../src/data-sync.js';
import {fixture} from './fake-supabase.js';
globalThis.__save007=sync;globalThis.__interfaceAct=act;globalThis.__interfaceFixture=fixture;globalThis.__interfaceEvents=[];
const root=createRoot(document.getElementById('root'));
function Host(){const[userId,setUserId]=useState('sdd-user-001'),[show,setShow]=useState(true),[revision,setRevision]=useState(0);globalThis.__interfaceState={userId,setUserId,show,setShow,revision,setRevision};useLayoutEffect(()=>{globalThis.__save007Layout?.();},[revision]);return <div className="ft-root" data-theme="dark"><style>{CSS}</style>{show&&<SaveIndicator userId={userId}/>}</div>;}
globalThis.__interfaceRender=()=>root.render(globalThis.__interfaceView?.mode==='app'?<App/>:<Host/>);
globalThis.__interfaceUnmount=()=>root.unmount();globalThis.__interfaceRender();
