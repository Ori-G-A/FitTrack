import {JSDOM,VirtualConsole} from 'jsdom';
import {buildBody} from './body-build.js';import {waitFor} from './app-dom.js';
const bundles=new Map();
export function plain(value){if(value===null||typeof value!=='object')return value;if(Array.isArray(value))return Array.from(value,plain);return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,plain(v)]));}
export async function mountBody(seed={},options={}){
 const key=options.mutation||'';if(!bundles.has(key))bundles.set(key,buildBody(options));
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<div id="root"></div>',{url:'http://sdd.invalid',runScripts:'outside-only',virtualConsole:vc}),w=dom.window;
 w.__bodySeed=seed;w.__sddFixture={};w.structuredClone=structuredClone;
 const D=w.Date;w.Date=class extends D{constructor(...a){super(...(a.length?a:['2026-10-18T12:00:00Z']));}static now(){return Date.parse('2026-10-18T12:00:00Z');}};
 let random=0;w.Math.random=()=>++random/10000;
 w.MessageChannel=class{port1={onmessage:null};port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.confirm=()=>true;w.fetch=()=>{throw Error('Red prohibida');};w.XMLHttpRequest=class{constructor(){throw Error('Red prohibida');}};w.WebSocket=w.XMLHttpRequest;
 w.eval(await bundles.get(key));await waitFor(()=>w.__bodyState,'montaje cuerpo');
 const call=async(fn,...args)=>{let result;await w.__bodyAct(async()=>{result=fn(...args);});return result;};
 return {w,errors,call,get b(){return w.__body;},get state(){return w.__bodyState;},get modules(){return w.__bodyModules;},get dashboard(){return w.__bodyDashboard;},get perfil(){return w.__bodyPerfil;},get training(){return w.__bodyTraining;},get text(){return w.document.body.textContent;},
 async input(selector,value){const el=w.document.querySelector(selector);if(!el)throw Error('Input ausente '+selector);const proto=el.tagName==='TEXTAREA'?w.HTMLTextAreaElement.prototype:w.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,String(value));await call(()=>el.dispatchEvent(new w.Event('input',{bubbles:true})));},
 async button(text){const el=[...w.document.querySelectorAll('button')].find(x=>x.textContent.trim()===text);if(!el)throw Error('Botón ausente '+text);await call(()=>el.click());},close(){w.__bodyUnmount();w.close();}};
}
