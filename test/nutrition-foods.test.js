import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {food,today} from '../test-support/nutrition-fixtures.js';
test('nutricion alimentos conservan crud conversiones orden y deduplicacion',async()=>{
 const a=await mountNutrition({view:'library',foods:[{...food,extra:42}]});
 try{
  await a.call(a.lib.saveFood,{...food,name:'  Zeta ',kcal:'-3',protein:'x',carbs:'',fat:'2.35',unit:''});
  assert.deepEqual(plain(a.state.foods),[{...food,name:'Zeta',extra:42,kcal:-3,protein:0,carbs:0,fat:2.35,unit:'g'}]);
  await a.call(a.lib.saveFood,{name:' Alfa ',kcal:'12',protein:'1',carbs:'2',fat:'3'});
  const added=a.state.foods[0];assert.equal(added.name,'Alfa');assert(added.id);assert.equal(added.unit,'g');
  await a.call(a.lib.saveFood,{name:'Alfa',kcal:0});assert.equal(a.state.foods.filter(f=>f.name==='Alfa').length,2);
  await a.call(a.lib.addFromCatalog,{name:'ALFA',kcal:99});assert.equal(a.state.foods.length,3);
  const stale=a.lib.addFromCatalog;
  await a.call(a.state.setFoods,c=>[...c,{...food,id:'later',name:'Nuevo'}]);
  await a.call(stale,{...food,name:'Nuevo'});assert.equal(a.state.foods.filter(f=>f.name==='Nuevo').length,2);
  await a.call(a.lib.setOpen,'milk');await a.button('Eliminar');assert(!a.state.foods.some(f=>f.id==='milk'));
  assert(a.state.foods.some(f=>f.id===added.id));
 }finally{a.close();}
});
