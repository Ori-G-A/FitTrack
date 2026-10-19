import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition,plain} from '../test-support/nutrition-dom.js';
import {food,recipe} from '../test-support/nutrition-fixtures.js';
test('nutricion recetas conservan ingredientes porciones y snapshots',async()=>{
 const history={id:'h',name:recipe.name,kcal:61,date:'2026-10-18'};
 const a=await mountNutrition({view:'library',foods:[food],nutrition:[history],recipes:[{...recipe,extra:42}]});
 try{
  await a.call(a.lib.switchTab,'recetas');await a.call(a.lib.setOpen,'nuevo');
  assert(a.w.document.querySelector('.ft-dc-acts button').disabled);
  await a.call(a.recipe.addItem);assert.equal(a.recipe.items.length,0);
  await a.call(a.recipe.setPickId,'milk');await a.call(a.recipe.setGrams,'0');await a.call(a.recipe.addItem);
  assert.equal(a.recipe.items[0].grams,0);assert.equal(a.recipe.items[0].kcal,0);
  await a.call(a.recipe.setPickId,'milk');await a.call(a.recipe.setGrams,'-50');await a.call(a.recipe.addItem);
  assert.deepEqual(plain(a.recipe.items[1]),{id:a.recipe.items[1].id,name:'Leche',grams:-50,unit:'ml',kcal:-30.5,protein:-1.6,carbs:-2.4,fat:-1.6});
  await a.call(a.recipe.setName,' Mezcla ');await a.call(a.recipe.setServings,'0');await a.button('Guardar receta');
  const saved=plain(a.state.recipes.at(-1));assert.equal(saved.name,'Mezcla');assert.equal(saved.servings,1);
  await a.call(a.lib.setOpen,saved.id);await a.call(a.recipe.setServings,'-2');await a.button('Guardar cambios');assert.equal(a.state.recipes.at(-1).servings,-2);
  await a.call(a.lib.switchTab,'mis');await a.call(a.lib.saveFood,{...food,kcal:900});
  assert.deepEqual(plain(a.state.recipes[1].items),saved.items);assert.deepEqual(plain(a.state.nutrition),[history]);
  await a.call(a.lib.switchTab,'recetas');await a.call(a.lib.setOpen,'r1');await a.call(a.recipe.setName,'Editada');await a.button('Guardar cambios');assert.equal(a.state.recipes[0].extra,42);
  await a.call(a.lib.setOpen,'r1');await a.button('QUITAR');assert.equal(a.recipe.items.length,0);assert(a.w.document.querySelector('.ft-dc-acts button').disabled);
  await a.button('Eliminar');assert.equal(a.state.recipes.length,1);
 }finally{a.close();}
});
