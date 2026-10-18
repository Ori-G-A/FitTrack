import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {mountNutrition} from '../test-support/nutrition-dom.js';
import {paceWeights,paceGoals,recipe,today} from '../test-support/nutrition-fixtures.js';
import {verifyTrace} from '../scripts/sdd-trace.js';
test('nutricion mutaciones detectan gramos redondeo montaje y snapshot',async()=>{
 const files=['src/NutritionScreen.jsx','src/app-utils.js','src/SettingsScreen.jsx','src/DiarioScreen.jsx'];const hash=async()=>Promise.all(files.map(async f=>createHash('sha256').update(await readFile(f)).digest('hex')));const before=await hash();
 for(const mutation of ['recipe-grams','adherence-round','datos-effect','undo-snapshot']){
  for(const enabled of [false,true]){
   const seed=mutation==='datos-effect'?{view:'settings',section:'datos',goals:{startWeight:60,autoMacros:true,weeklyChange:-.4}}:mutation==='undo-snapshot'?{view:'diario',weights:paceWeights(),goals:paceGoals}:{recipes:[recipe]};
   const a=await mountNutrition(seed,enabled?{mutation}:{});try{
    let actual,expected;
    if(mutation==='recipe-grams'){await a.call(a.n.setPick,a.modules.normalization.fromRecipe(recipe));await a.call(a.n.save,{kcal:61,protein:3.2,carbs:4.8,fat:3.3,qty:1,meal:'Cena'});actual=a.state.nutrition[0].grams;expected=null;}
    if(mutation==='adherence-round'){actual=a.modules.app.proteinAdherence([{date:today,protein:89.6}],100,today).onTarget;expected=1;}
    if(mutation==='datos-effect'){actual=a.state.goals.kcalTarget;expected=1480;}
    if(mutation==='undo-snapshot'){await a.call(a.w.__paceActions.applyPace);await a.call(a.state.setGoals,g=>({...g,extra:'reciente'}));await a.call(a.w.__paceActions.undoPace);actual=a.state.goals.extra;expected='reciente';}
    const check=()=>assert.equal(actual,expected,mutation);
    if(enabled)assert.throws(check,{name:'AssertionError'});else check();
   }finally{a.close();}
  }
 }
 assert.deepEqual(await hash(),before);
});
test('nutricion manifiesto rechaza cobertura incompleta y resultados invalidos',()=>{
 for(const status of ['pending','partial']){const r=verifyTrace({requirements:[{id:'FR-001',status,tests:status==='partial'?['pin']:[]}]},['FR-001'],[{name:'pin',status:'passed'}],{complete:true});assert(r.errors.some(e=>e.includes('Cobertura incompleta')));}
 const m={requirements:[{id:'FR-001',status:'complete',tests:['pin']}]};
 for(const results of [[],[{name:'pin',status:'skipped'}],[{name:'pin',status:'failed'}],[{name:'pin',status:'passed'},{name:'pin',status:'passed'}]])assert(verifyTrace(m,['FR-001'],results,{complete:true}).errors.length>0);
 assert.deepEqual(verifyTrace(m,['FR-001'],[{name:'pin',status:'passed'}],{complete:true}).errors,[]);
});
