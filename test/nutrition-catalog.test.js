import test from 'node:test';
import assert from 'node:assert/strict';
import {mountApp,waitFor} from '../test-support/app-dom.js';
import {createHash} from 'node:crypto';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
test('nutricion catalogo y migracion conservan valores y unidades',async()=>{
 const a=await mountNutrition();try{
  const {CATALOG:c,CATALOG_CATS:cats,migrateFoodUnits:migrate,scaleFood,round1}=a.modules.fit;
  assert.equal(c.length,136);assert.equal(createHash('sha256').update(JSON.stringify(c)).digest('hex'),'265fb4ee6a970e81619f23cd47a448e6771a627fe34cb99e793f229ac687986a');
  assert.deepEqual(plain(cats),['Verduras','Frutas','Lácteos y huevos','Carne de res','Carne de cerdo','Aves','Pescados y mariscos','Legumbres','Cereales y granos','Harinas y panes','Frutos secos y semillas','Aceites y grasas']);
  const old=[{id:'1',name:'LECHE ENTERA',extra:1},{id:'2',name:'desconocido'},{id:'3',name:'Brócoli',unit:'ml'}];
  const result=migrate(old);assert.deepEqual(plain(result),[{...old[0],unit:'ml'},{...old[1],unit:'g'},old[2]]);assert.equal(result[2],old[2]);assert.equal(old[0].unit,undefined);
  assert.equal(round1(1.25),1.3);assert.deepEqual(plain(scaleFood({kcal:61,protein:3.2,carbs:4.8,fat:3.3},'50')),{kcal:30.5,protein:1.6,carbs:2.4,fat:1.65});
  assert.equal(scaleFood(c[0],'x').kcal,0);assert.equal(scaleFood(c[0],-100).kcal,-34);
 }finally{a.close();}
 const app=await mountApp({data:{foods:[{id:'old',name:'LECHE ENTERA',extra:42}]}});try{await app.ready();assert.equal(app.current.state.foods[0].unit,'ml');assert.equal(app.current.state.foods[0].extra,42);await app.import({foods:[{id:'new',name:'Desconocido',extra:33}]});await waitFor(()=>app.current.state.foods[0]?.id==='new');assert.equal(app.current.state.foods[0].unit,'g');assert.equal(app.current.state.foods[0].extra,33);}finally{app.close();}
});
