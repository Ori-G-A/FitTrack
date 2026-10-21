import {JSDOM,VirtualConsole} from 'jsdom';
import {buildInterface} from './interface-build.js';
import {createClock} from './clock.js';
import {waitFor} from './app-dom.js';
import {DEFAULT_GOALS} from '../src/app-config.js';
import {buildHarness} from './build-harness.js';
const bundles=new Map();
export const plain=v=>JSON.parse(JSON.stringify(v));
export async function mountInterface(seed={},view={mode:'app'},options={}) {
 const key=options.mutation||'';if(!bundles.has(key))bundles.set(key,buildInterface(options));
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<div id="root"></div>',{url:'http://sdd.invalid',runScripts:'outside-only',virtualConsole:vc});const w=dom.window,clock=createClock(),mediaListeners=new Set(),listeners=[];
 w.__interfaceSeed=seed;w.__interfaceView=view;w.__sddFixture=options.fixture||{data:{...seed,goals:{...DEFAULT_GOALS,...seed.goals}}};w.structuredClone=structuredClone;w.IS_REACT_ACT_ENVIRONMENT=true;
 if(options.setup)options.setup(w);
 const media={matches:!!options.systemDark,addEventListener:(event,fn)=>{listeners.push(['media-add',fn]);mediaListeners.add(fn);},removeEventListener:(event,fn)=>{listeners.push(['media-remove',fn]);mediaListeners.delete(fn);}};
 if(!options.noMedia)w.matchMedia=()=>media;
 const add=w.addEventListener.bind(w),remove=w.removeEventListener.bind(w);w.addEventListener=(t,f,...a)=>{listeners.push(['add',t,f]);add(t,f,...a);};w.removeEventListener=(t,f,...a)=>{listeners.push(['remove',t,f]);remove(t,f,...a);};
 w.MessageChannel=class{port1={onmessage:null};port2={postMessage:()=>setImmediate(()=>this.port1.onmessage?.())};};
 w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};w.HTMLElement.prototype.scrollIntoView=function(opts){(w.__interfaceScroll||=[]).push({id:this.id,opts});};
 w.fetch=()=>{throw Error('Red no simulada prohibida006');};w.XMLHttpRequest=class{constructor(){throw Error('Red prohibida006');}};w.WebSocket=w.XMLHttpRequest;w.alert=()=>{};w.confirm=()=>true;
 const timers=new Map(),intervals=new Set();const rs=w.setTimeout.bind(w),rc=w.clearTimeout.bind(w);w.setTimeout=(fn,ms,...args)=>{let id;const run=()=>{timers.get(id).fired=true;fn(...args);};id=[2600,2200,123].includes(ms)?'controlled:'+clock.setTimeout(run,ms):rs(run,ms);timers.set(id,{ms,cleared:false,fired:false});return id;};w.clearTimeout=id=>{if(timers.has(id))timers.get(id).cleared=true;return typeof id==='string'&&id.startsWith('controlled:')?clock.clearTimeout(Number(id.slice(11))):rc(id);};
 const ri=w.setInterval.bind(w),ci=w.clearInterval.bind(w);w.setInterval=(...args)=>{const id=ri(...args);intervals.add(id);return id;};w.clearInterval=id=>{intervals.delete(id);ci(id);};
 const D=w.Date;w.Date=class extends D{constructor(...a){super(...(a.length?a:[Date.parse('2026-10-18T12:00:00Z')+clock.now]));}static now(){return Date.parse('2026-10-18T12:00:00Z')+clock.now;}};
 w.eval(await bundles.get(key));await waitFor(()=>w.__interfaceState,'montaje006');
 const act=async fn=>{let out;await w.__interfaceAct(async()=>{out=await fn();});return out;};
 const app={w,dom,clock,errors,listeners,mediaListeners,timers,intervals,act,get state(){return w.__interfaceState;},get app(){return w.__interfaceApp;},get text(){return w.document.body.textContent;},get events(){return w.__interfaceEvents;},get modules(){return w.__interfaceModules;},get fixture(){return w.__interfaceFixture;},
 async ready(){await waitFor(()=>w.__interfaceApp?.loaded&&w.document.querySelector('button.ft-user'),'App cargada006');await act(()=>{});},
 async render(props,reset=false){await act(()=>w.__interfaceRender(props,reset));},
 async advance(ms){await act(()=>clock.advance(ms));},
 async click(selector){const el=w.document.querySelector(selector);if(!el)throw Error('Selector ausente '+selector);await act(()=>el.click());},
 async button(text){const el=[...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);if(!el)throw Error('Botón ausente '+text);await act(()=>el.click());},
 async media(dark){media.matches=dark;await act(()=>{for(const fn of mediaListeners)fn({matches:dark});});},
 async resize(width){w.innerWidth=width;await act(()=>w.dispatchEvent(new w.Event('resize')));},
 async close(){await act(()=>w.__interfaceUnmount());w.close();}
 };await act(()=>{});return app;
}
export async function mountInterfacePreview(entry) {
 const key='preview:'+entry;if(!bundles.has(key))bundles.set(key,buildHarness({entry,capturePreview:true}));
 const dom=new JSDOM('<div id="root"></div>',{url:'http://sdd.invalid',runScripts:'outside-only',virtualConsole:new VirtualConsole()}),w=dom.window;
 w.structuredClone=structuredClone;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.fetch=()=>{throw Error('Red prohibida');};w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
 w.eval(await bundles.get(key));await waitFor(()=>w.document.querySelector('.ft-root'),'preview006');
 return {w,get text(){return w.document.body.textContent;},async button(text){let b;await waitFor(()=>b=[...w.document.querySelectorAll('button')].find(x=>x.textContent.trim()===text),'botón preview '+text);b.click();await new Promise(r=>setTimeout(r,50));},close(){w.__sddPreviewRoot?.unmount();w.close();}};
}
