import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {food,recipe,today} from '../test-support/nutrition-fixtures.js';
test('nutricion cantidad conserva validacion escalado guardado y retorno',async()=>{
 const a=await mountNutrition({foods:[food],recipes:[recipe]});
 try{
  await a.button('Añadir comida');await a.call(a.n.setPick,a.n.options[0]);
  for(const qty of ['',0,-1]){await a.call(a.amount.setQty,String(qty));assert.equal(a.amount.valid,false);assert(a.w.document.querySelector('.ft-dc-cta').disabled);}
  await a.call(a.amount.setQty,'Infinity');assert.equal(a.amount.valid,true);assert.equal(a.amount.macros.kcal,Infinity);
  await a.input('.ft-qty-input','25,5');assert.equal(a.amount.amount,25.5);assert.equal(a.amount.macros.kcal,15.555);
  await a.call(()=>a.w.document.querySelector('[aria-label="Más"]').click());assert.equal(a.amount.amount,35.5);
  await a.call(()=>a.w.document.querySelector('[aria-label="Menos"]').click());assert.equal(a.amount.amount,25.5);
  await a.button('100 ml');assert.equal(a.amount.amount,100);await a.call(a.amount.setQty,'25,5');
  await a.button('CENA');await a.call(()=>a.w.document.querySelector('.ft-qty-input').dispatchEvent(new a.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true})));
  assert.equal(a.state.nutrition.length,1);assert.deepEqual(plain(a.state.nutrition[0]),{id:a.state.nutrition[0].id,date:today,name:'Leche',meal:'Cena',grams:25.5,unit:'ml',kcal:15.6,protein:0.8,carbs:1.2,fat:0.8});
  assert(a.state.nutrition[0].id);assert.equal(a.n.pick,null);assert.equal(a.n.adding,false);assert.equal(a.n.query,'');assert.equal(a.n.tab,'mios');
  await a.button('Añadir comida');await a.button('RECETAS');await a.call(a.n.setPick,a.n.options[0]);await a.call(a.amount.setQty,'1,5');await a.call(()=>a.w.document.querySelector('.ft-dc-cta').click());
  assert.equal(a.state.nutrition[1].grams,null);assert.equal(a.state.nutrition[1].kcal,91.5);assert.equal(a.state.nutrition[1].unit,'porc.');assert.equal(a.n.tab,'recetas');
  await a.button('Añadir comida');await a.button('RECIENTES');await a.call(a.n.setPick,a.n.options.find(p=>p.name==='Batido'));assert.equal(a.n.pick.unit,'ración');await a.call(()=>a.w.document.querySelector('.ft-dc-cta').click());assert.equal(a.state.nutrition[2].grams,null);
 }finally{a.close();}
});
