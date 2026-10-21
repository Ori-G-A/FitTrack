import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// La instrumentación solo existe en el bundle sintético; src permanece intacto.
export async function buildInterface({ mutation, entry='test-support/interface-entry.jsx' }={}) {
 const result=await build({entryPoints:[resolve(entry)],bundle:true,write:false,metafile:true,format:'iife',platform:'browser',define:{'process.env.NODE_ENV':'"development"','import.meta.env':'{}'},plugins:[{name:'interface-boundaries',setup(b){
  b.onResolve({filter:/(?:^|\/)supabase\.js$/},()=>({path:resolve('test-support/fake-supabase.js')}));
  b.onLoad({filter:/(?:FitTrack|DashboardScreen)\.jsx$|(?:app-utils|ui-theme|app-styles)\.js$|toast\.jsx$/},async({path})=>{
   let s=await readFile(path,'utf8');
   if(path.endsWith('FitTrack.jsx')) {
    const anchor='  return (\n    <div className="ft-root" data-theme={theme}>';
    if(!s.includes(anchor))throw Error('Ancla de App ausente');
    s=s.replace(anchor,'  globalThis.__interfaceApp={tab,focusDate,focusCard,goTo,openCard,themePref,setThemePref,theme,menuOpen,setMenuOpen,sheet,setSheet,session,loaded,goals,setGoals,setWeights,setWorkouts,setNutrition,setMeasurements,setWellness};\n'+anchor);
    if(mutation==='date') {const old='setFocusDate(date); setTab(next);';if(!s.includes(old))throw Error('Mutación fecha no aplicable');s=s.replace(old,'if(date) setFocusDate(date); setTab(next);');}
    // Retraso controlado de imports: se conserva el Suspense real de App.
    s=s.replaceAll('lazy(() => import(', 'lazy(() => globalThis.__interfaceLazyGate ? globalThis.__interfaceLazyGate.then(() => import(');
    // Las ramas anteriores requieren cerrar el ternario, sin cambiar el import original.
    s=s.replace(/const (\w+) = lazy\(\(\) => globalThis\.__interfaceLazyGate \? globalThis\.__interfaceLazyGate\.then\(\(\) => import\(("\.\/[^"\n]+")\)\);/g,'const $1 = lazy(() => globalThis.__interfaceLazyGate ? globalThis.__interfaceLazyGate.then(() => import($2)) : import($2));');
   }
   if(path.endsWith('DashboardScreen.jsx')) {const anchor='  // Un aviso del Diario';if(!s.includes(anchor))throw Error('Ancla de Métricas ausente');s=s.replace(anchor,'  globalThis.__interfaceDashboard={filter,setFilter};\n'+anchor);}
   if(mutation==='auto'&&/(app-utils|ui-theme)\.js$/.test(path))s=s.replace('systemDark ? "dark" : "light"','systemDark ? "light" : "dark"');
   if(mutation==='toast'&&path.endsWith('toast.jsx'))s=s.replace('[current, ms]','[Boolean(current), ms]');
   if(mutation==='breakpoint')s=s.replaceAll('@media (max-width:720px)','@media (max-width:719px)');
   return {contents:s,loader:path.endsWith('.jsx')?'jsx':'js'};
  });
 }}]});
 if(Object.keys(result.metafile.inputs).some(f=>/src[\\/]supabase\.js$/.test(f)))throw Error('Cliente real prohibido en harness006');
 return result.outputFiles[0].text;
}
