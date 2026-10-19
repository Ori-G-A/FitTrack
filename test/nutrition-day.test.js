import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {today} from '../test-support/nutrition-fixtures.js';
test('nutricion diario nutricional conserva totales grupos fechas y borrado',async()=>{
 const row=(id,meal,date=today)=>({id,name:id,meal,date,kcal:'10.5',protein:'2',carbs:'x',fat:1});
 const a=await mountNutrition({nutrition:[row('extra','Noche'),row('cena','Cena'),row('none',''),row('breakfast','Desayuno'),row('other','Cena','2026-10-17')]});
 try{
  assert.deepEqual(plain(a.n.sum),{kcal:42,protein:8,carbs:0,fat:4});assert.deepEqual(plain(a.n.groups.map(g=>g.meal)),['Desayuno','Cena','Noche',null]);
  const quit=[...a.w.document.querySelectorAll('button')].filter(b=>b.textContent==='QUITAR');assert.equal(quit.length,4);await a.call(()=>quit[0].click());
  assert(!a.state.nutrition.some(n=>n.id==='breakfast'));assert(a.state.nutrition.some(n=>n.id==='other'));
  await a.call(a.n.shift,-1);assert.equal(a.n.date,'2026-10-17');assert.equal(a.n.dayItems.length,1);assert.equal(a.n.sum.kcal,10.5);
  await a.input('[type=date]','2020-01-01','change');assert.equal(a.n.date,'2020-01-01');assert.equal(a.n.groups.length,0);assert.equal(a.n.sum.kcal,0);
 }finally{a.close();}
});
