import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTraining} from '../test-support/training-dom.js';
import {mountApp,waitFor} from '../test-support/app-dom.js';
import {buildHarness} from '../test-support/build-harness.js';
import {JSDOM,VirtualConsole} from 'jsdom';
test('entrenamiento consumidores y previews compatibles',async()=>{
 const a=await mountTraining();
 try{assert.equal(a.train.phaseCaution,null);assert.equal(typeof a.utils.epley,'function');assert.equal(a.config.computeProteinTargets(61).dailyTarget,122);assert.equal(a.config.distributeProtein(120,4).length,4);}finally{a.close();}
 const app=await mountApp();try{await app.ready();app.current.goTo('entrenar');await waitFor(()=>app.w.document.body.textContent.includes('Calentamiento'));}finally{app.close();}
 for(const entry of ['src/preview-main.jsx','preview/maqueta.jsx']){
  const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM('<div id="root"></div>',{url:'http://sdd.invalid/',runScripts:'outside-only',virtualConsole:vc});
  try{
   const w=dom.window;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
   w.structuredClone=structuredClone;w.fetch=()=>{throw Error('Red prohibida');};
   w.eval(await buildHarness({entry,capturePreview:true}));
   await waitFor(()=>[...w.document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Entrenar'));
   [...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Entrenar').click();
   await waitFor(()=>w.document.body.textContent.includes('Calentamiento'));
   assert.deepEqual(errors,[]);
  }finally{dom.window.__sddPreviewRoot?.unmount();dom.window.close();}
 }
});
