import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export async function buildNutrition({mutation}={}){
 const result=await build({entryPoints:[resolve('test-support/nutrition-entry.jsx')],bundle:true,write:false,format:'iife',platform:'browser',metafile:true,define:{'process.env.NODE_ENV':'"development"','import.meta.env':'{}'},plugins:[{name:'nutrition-original-callbacks',setup(b){
  b.onResolve({filter:/(?:^|\/)supabase\.js$/},()=>({path:resolve('test-support/fake-supabase.js')}));
  b.onLoad({filter:/(?:FitTrack|NutritionScreen|LibraryScreen|SettingsScreen|DiarioScreen|DashboardScreen)\.jsx$|app-utils\.js$|nutrition-records\.js$|nutrition-metrics\.js$/},async({path})=>{
   let s=await readFile(path,'utf8');
   const insert=(anchor,code)=>{if(!s.includes(anchor))throw new Error('Ancla de instrumentación ausente '+path+' '+anchor);s=s.replace(anchor,code+'\n'+anchor);};
   if(path.endsWith('FitTrack.jsx'))s+='\nexport {migrateFoodUnits};\n';
   if(path.endsWith('NutritionScreen.jsx')){
    s+='\nexport {fromFood,fromRecipe,fromEntry,mealsFor};\n';
    insert('  if (pick) {','  globalThis.__nut = { date, setDate, adding, setAdding, tab, setTab_, query, setQuery, pick, setPick, meals, dayItems, sum, adherence, recent, options, save, shift };');
    insert('  const esPorciones =','  globalThis.__amount = {qty,setQty,meal,setMeal,amount,valid,macros,onSave,onBack};');
    insert('  return (\n    <div className="ft-dc">\n      <div className="ft-dc-head">\n        <div>\n          <h1>Nutrición</h1>','  globalThis.__nut.groups = groups;');
   }
   if(path.endsWith('LibraryScreen.jsx')){
    insert('  const counts = {','  globalThis.__foodLibrary = {tab,switchTab,open,setOpen,saveFood,addFromCatalog,saveRecipe};');
    insert('  const total = recipeTotals({ items });','  globalThis.__recipe = {name,setName,servings,setServings,items,setItems,pickId,setPickId,grams,setGrams,addItem};');
   }
   if(path.endsWith('SettingsScreen.jsx'))insert('  const removeAllData =','  globalThis.__settings = {updateGoal,referenceWeight,direction,suggestion,mealSplit,section};');
   if(path.endsWith('DiarioScreen.jsx'))insert('  const applyPace =','  globalThis.__paceRead = {alert,protein};');
   if(path.endsWith('DiarioScreen.jsx'))insert('  return (\n    <div className="ft-dc">\n      <div className="ft-dc-head">\n        <div>\n          <h1>Diario</h1>','  globalThis.__paceActions = {applyPace,dismissPace,undoPace,paceDone};');
   if(path.endsWith('DashboardScreen.jsx'))insert('  const totalMin =','  globalThis.__nutDashboard={kcalChart,kcalAvg,macro14,trainingDays7,macroTargets,nutDays7,vsExpected,m};');
   if(mutation==='recipe-grams')s=s.replace('grams: pick.unit === "porc." || pick.unit === "ración" ? null : qty','grams: qty');
   if(mutation==='adherence-round')s=s.replace('.map(([, grams]) => Math.round(grams));','.map(([, grams]) => grams);');
   if(mutation==='datos-effect')s=s.replace('if (!goals.autoMacros || !suggestion) return;','if (section === "datos" || !goals.autoMacros || !suggestion) return;');
   if(mutation==='undo-snapshot'){s=s.replace('setPaceDone({ kind, kcal: patch.kcalTarget, previous });','setPaceDone({ kind, kcal: patch.kcalTarget, previous, captured: goals });');s=s.replace('undoPaceGoals(current, paceDone.previous)','undoPaceGoals(paceDone.captured, paceDone.previous)');}
   return {contents:s,loader:path.endsWith('.jsx')?'jsx':'js'};
  });
 }}]});
 if(Object.keys(result.metafile.inputs).some(p=>/src[\\/]supabase\.js$/.test(p)))throw new Error('Cliente real prohibido');
 return result.outputFiles[0].text;
}
