import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {food,recipe,today} from '../test-support/nutrition-fixtures.js';
test('nutricion busqueda conserva fuentes limites recientes y navegacion',async()=>{
 const entries=Array.from({length:25},(_,i)=>({id:'h'+i,name:'Comida '+i,date:'2026-10-'+String(25-i).padStart(2,'0'),grams:50,kcal:30,protein:3,carbs:4,fat:1}));
 const a=await mountNutrition({foods:[food,{...food,id:'accent',name:'Brócoli'}],recipes:[recipe],nutrition:[...entries,{...entries[0],id:'dup',name:'COMIDA 0'}]});
 try{
  const {fromFood,fromRecipe,fromEntry}=a.modules.normalization;
  assert.equal(fromFood({...food,unit:''},true).unit,'g');assert.equal(fromFood(food,true).mio,true);
  assert.equal(fromRecipe(recipe).per.kcal,6100);assert.equal(fromRecipe(recipe).unit,'porc.');
  assert.equal(fromEntry(entries[0],false).per.kcal,60);assert.equal(fromEntry(entries[0],false).lastQty,50);
  const ration=fromEntry({...entries[0],grams:null},false);assert.equal(ration.unit,'ración');assert.equal(ration.per.kcal,3000);
  assert.equal(a.n.recent.length,20);assert.equal(a.n.recent[0].id,'h0');
  await a.button('Añadir comida');assert.equal(a.n.tab,'mios');
  await a.call(a.n.setQuery,'  LECHE ');assert.equal(a.n.options.length,1);
  await a.call(a.n.setQuery,'brocoli');assert.equal(a.n.options.length,0);
  await a.button('BUSCAR');assert.equal(a.n.query,'');assert.equal(a.n.options.length,60);
  await a.call(a.n.setQuery,'  ACEITE ');assert.equal(a.n.options.length,6);assert(a.n.options.some(p=>p.name==='Sardina en lata (aceite)'));
  await a.button('RECIENTES');await a.call(a.n.setQuery,'Comida 24');assert.equal(a.n.options.length,0);
  await a.button('RECETAS');assert.equal(a.n.options[0].name,'Batido');
  await a.call(a.n.setPick,a.n.options[0]);await a.button('Atrás');assert.equal(a.n.pick,null);assert.equal(a.n.adding,true);
  await a.button('Cerrar');assert.equal(a.n.adding,false);assert.equal(a.n.query,'');
 }finally{a.close();}
});
