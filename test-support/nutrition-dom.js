import {JSDOM,VirtualConsole} from 'jsdom';
import {buildNutrition} from './nutrition-build.js';
import {waitFor,plain} from './app-dom.js';
export {plain};
const bundles=new Map();
export async function mountNutrition(seed={},options={}){
 const key=options.mutation||'';if(!bundles.has(key))bundles.set(key,buildNutrition(options));
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<div id="root"></div>',{url:'http://sdd.invalid',runScripts:'outside-only',virtualConsole:console}),w=dom.window;
 w.MessageChannel=class{port1={onmessage:null};port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};};
 w.__nutSeed=seed;w.__sddFixture={};w.structuredClone=structuredClone;
 const D=w.Date;w.Date=class extends D{constructor(...a){super(...(a.length?a:['2026-10-18T12:00:00Z']));}static now(){return Date.parse('2026-10-18T12:00:00Z');}};
 let random=0;w.Math.random=()=>++random/10000;
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
 w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
 w.confirm=()=>true;w.fetch=()=>{throw new Error('Red prohibida');};w.XMLHttpRequest=class{constructor(){throw new Error('Red prohibida');}};w.WebSocket=w.XMLHttpRequest;
 w.eval(await bundles.get(key));await waitFor(()=>w.__nutState,'montaje nutrición');
 const call=async(fn,...args)=>{let result;await w.__nutAct(async()=>{result=fn(...args);});return result;};
 return {w,errors,get state(){return w.__nutState;},get n(){return w.__nut;},get lib(){return w.__foodLibrary;},get recipe(){return w.__recipe;},get amount(){return w.__amount;},get settings(){return w.__settings;},get modules(){return w.__nutModules;},call,
 async input(selector,value,event='input'){const el=w.document.querySelector(selector);if(!el)throw new Error('Input ausente '+selector);const p=el instanceof w.HTMLSelectElement?w.HTMLSelectElement.prototype:w.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(el,String(value));await call(()=>el.dispatchEvent(new w.Event(event,{bubbles:true})));},
 async button(text){const b=[...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);if(!b)throw new Error('Botón ausente '+text);await call(()=>b.click());},
 close(){w.__nutUnmount();w.close();}};
}
