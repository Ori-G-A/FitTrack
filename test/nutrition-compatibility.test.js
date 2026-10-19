import test from 'node:test';
import assert from 'node:assert/strict';
import {mountNutrition} from '../test-support/nutrition-dom.js';
import {mountApp,waitFor} from '../test-support/app-dom.js';
import {buildHarness} from '../test-support/build-harness.js';
import {JSDOM,VirtualConsole} from 'jsdom';
test('nutricion consumidores y previews conservan contratos y fachadas',async()=>{
 const a=await mountNutrition();try{
  assert.equal(typeof a.modules.fit.scaleFood,'function');assert.equal(typeof a.modules.app.proteinAdherence,'function');assert.equal(typeof a.modules.goals.weightVsExpected,'function');
  for(const view of ['library','account','diario','dashboard','nutrition']){await a.call(a.state.setView,view);assert(a.w.document.querySelector('.ft-root').textContent.length>0);}assert.deepEqual(a.errors,[]);
 }finally{a.close();}
 const app=await mountApp();try{await app.ready();app.current.goTo('nutricion');await waitFor(()=>app.w.document.body.textContent.includes('Añadir comida'));}finally{app.close();}
 for(const entry of ['src/preview-main.jsx','preview/maqueta.jsx']){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM('<div id="root"></div>',{url:'http://sdd.invalid',runScripts:'outside-only',virtualConsole:vc});
  try{const w=dom.window;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.structuredClone=structuredClone;w.fetch=()=>{throw Error('Red prohibida');};w.eval(await buildHarness({entry,capturePreview:true}));await waitFor(()=>[...w.document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Nutrición'));[...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Nutrición').click();await waitFor(()=>w.document.body.textContent.includes(entry==='preview/maqueta.jsx'?'Maqueta: Diario, Cuerpo, Entrenar y Ajustes traen datos de ejemplo.':'Añadir comida'));assert.deepEqual(errors,[]);}finally{dom.window.__sddPreviewRoot?.unmount();dom.window.close();}
 }
});
