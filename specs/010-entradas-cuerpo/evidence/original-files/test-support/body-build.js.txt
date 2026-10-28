import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';import {resolve} from 'node:path';
export async function buildBody({mutation}={}){
 const result=await build({entryPoints:[resolve('test-support/body-entry.jsx')],bundle:true,write:false,format:'iife',platform:'browser',metafile:true,define:{'process.env.NODE_ENV':'"development"','import.meta.env':'{}'},plugins:[{name:'body-original',setup(b){
 b.onResolve({filter:/(?:^|\/)supabase\.js$/},()=>({path:resolve('test-support/fake-supabase.js')}));
 b.onResolve({filter:/(?:^|\/)photo-storage\.js$/},()=>({path:'photos',namespace:'body-fake'}));
 b.onLoad({filter:/.*/,namespace:'body-fake'},()=>({contents:`const check=()=>{if(globalThis.__bodyPhotoFailure)throw Error('Foto simulada fallida');};export const validatePhotoFile=()=>check();export const compressImage=async()=>{check();return 'data:image/png;base64,AA==';};export const uploadPhotoData=async(user,p)=>{check();return {...p,storagePath:user+'/'+p.id};};export const deletePhotoFile=async()=>check();`}));
 b.onLoad({filter:/(BodyScreen|PerfilScreen|DashboardScreen|TrainingScreen)\.jsx$|cycle-(?:inference|phase)\.js$|alerts\.js$|toast\.jsx$/},async({path})=>{
 let s=await readFile(path,'utf8');const insert=(anchor,code)=>{if(!s.includes(anchor))throw Error('Ancla ausente '+path+' '+anchor);s=s.replace(anchor,code+'\n'+anchor);};
 if(path.endsWith('toast.jsx'))s=s.replace('export function toast(message) {','export function toast(message) { globalThis.__bodyEvents?.push("toast");');
 if(path.endsWith('BodyScreen.jsx')){
 insert('  const sub =','  globalThis.__body = {wDate,setWDate,kg,setKg,parseKg,addW,delW,wSorted,wChart,lastKg,bumpKg,mDate,setMDate,meas,setMeas,addM,delM,mSorted,cinturaChart,welDate,setWelDate,wel,setWel,existingWel,saveWel,welSorted,cycleDate,setCycleDate,cycleLog,setCycleLog,existingCycleLog,saveCycleLog,delCycleLog,delPeriod,phaseEstimate,ctx,cycleInsights,cycleSummary,distribution,guidance,ovulation,legend,maxCycleLen,section,setSection,SECTIONS,cycle,creaDays,creaWaterKg,creaSat,creaFull,photoBusy,photoErr,addPhoto,delPhoto,pSortedPhotos};');
 if(mutation==='weight-zero')s=s.replace('if (!value) return;','if (Number.isNaN(value)) return;');
 if(mutation==='wellness-hydrate')s=s.replace('}, [welDate]);','}, [welDate, existingWel]);');
 }
 if(path.endsWith('PerfilScreen.jsx'))insert('  // Embebida','  globalThis.__bodyPerfil={tracksCycle,ctx,guide,summary,group,phaseColor};');
 if(path.endsWith('DashboardScreen.jsx'))insert('  // Un aviso del Diario','  globalThis.__bodyDashboard={m,weightChart,currentW,change7,measSorted,measLatest,measDelta,cyc,sleep,hr};');
 if(path.endsWith('TrainingScreen.jsx'))insert('  if (inSession && exercises.length > 0)','  globalThis.__bodyTraining={phaseCaution,date,setDate};');
 if(mutation==='bleeding-precedence'&&/cycle-(?:inference|phase)\.js$/.test(path))s=s.replace('const periodEvent = loggedNoBleeding ? null :','const periodEvent = false ? null :');
 if(mutation==='alert-keys'&&path.endsWith('alerts.js'))s=s.replace('if (!cycle) return a;','if (!cycle) return a.map((alert) => ({ ...alert, key: alertKey(alert) }));');
 return {contents:s,loader:path.endsWith('.jsx')?'jsx':'js'};
 });
 }}]});if(Object.keys(result.metafile.inputs).some(p=>/src[\\/]supabase\.js$/.test(p)))throw Error('Backend real prohibido');return result.outputFiles[0].text;
}
