import { JSDOM, VirtualConsole } from 'jsdom';
import { buildTraining } from './training-build.js';
import { waitFor, plain } from './app-dom.js';
export { plain, waitFor };
const bundles = new Map();
export async function mountTraining(seed = {}, fixture = {}, options = {}) {
  const key = options.mutation || '';
  if (!bundles.has(key)) bundles.set(key, buildTraining(options));
  const errors = [], loggedErrors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', e => errors.push(e.message));
  console.on('error', (...args) => loggedErrors.push(args));
  const dom = new JSDOM('<div id="root"></div>', { url:'http://sdd.invalid/', runScripts:'outside-only', virtualConsole:console });
  const w = dom.window, epoch = Date.parse('2026-10-15T12:00:00Z');
  // JSDOM no implementa MessageChannel; act necesita una tarea real,
  // independiente del reloj virtual de los temporizadores de la aplicación.
  w.MessageChannel = class {
    port1 = { onmessage: null };
    port2 = { postMessage: () => setImmediate(() => this.port1.onmessage?.()) };
  };
  let now = epoch, sequence = 0, random = 0;
  const timeouts = new Map(), intervals = new Map();
  w.__trainingSeed = seed; w.__sddFixture = fixture;
  w.structuredClone = structuredClone;
  w.Math.random = () => (++random % 10000) / 10000;
  const DateOriginal = w.Date;
  w.Date = class extends DateOriginal { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
  const realTimeout = w.setTimeout.bind(w), realClear = w.clearTimeout.bind(w);
  w.setTimeout = (fn, delay = 0, ...args) => { if (![600,1000,15000,20000].includes(delay)) return realTimeout(fn,delay,...args); const id = `fake:${++sequence}`; timeouts.set(id, { fn:() => fn(...args), at:now + delay }); return id; };
  w.clearTimeout = id => timeouts.has(id) ? timeouts.delete(id) : realClear(id);
  w.setInterval = (fn, delay = 0) => { const id = ++sequence; intervals.set(id, { fn, delay, at:now + delay }); return id; };
  w.clearInterval = id => intervals.delete(id);
  w.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
  w.prompt = () => 'Rutina de prueba'; w.confirm = () => true;
  w.fetch = () => { throw new Error('Red prohibida'); };
  w.XMLHttpRequest = class { constructor(){throw new Error('Red prohibida');} };
  w.WebSocket = w.XMLHttpRequest;
  w.eval(await bundles.get(key));
  await waitFor(() => w.__trainingState, 'montaje entrenamiento');
  const flush = async () => { await w.__trainingAct(async () => { await new Promise(resolve => setTimeout(resolve, 0)); }); };
  await flush();
  return {
    w, errors, loggedErrors, intervals, timeouts,
    get state(){ return w.__trainingState; },
    get train(){ return w.__training; },
    get guided(){ return w.__guided; },
    get fixture(){ return w.__sddFixture; },
    get utils(){ return w.__trainingModules.utils; },
    get config(){ return w.__trainingModules.config; },
    flush,
    async call(fn, ...args){ let result; await w.__trainingAct(async () => { result=fn(...args); }); return result; },
    async advance(ms, { ticks = true } = {}) {
      const until = now + ms;
      for (;;) {
        const entries = [...timeouts].map(([id,j])=>({id,j,kind:'timeout'})).concat(ticks ? [...intervals].map(([id,j])=>({id,j,kind:'interval'})) : []);
        const next = entries.filter(e=>e.j.at<=until).sort((a,b)=>a.j.at-b.j.at || a.id-b.id)[0];
        if(!next) break;
        now = Math.max(now,next.j.at);
        if(next.kind==='timeout')timeouts.delete(next.id); else next.j.at=now+next.j.delay;
        await w.__trainingAct(async () => { next.j.fn(); });
      }
      now=until;
      if(!ticks)for(const job of intervals.values())job.at=now+job.delay;
      await flush();
    },
    async input(selector, value, event='input'){
      const input=w.document.querySelector(selector); if(!input)throw new Error('Input ausente '+selector);
      const proto=input instanceof w.HTMLSelectElement ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto,'value').set.call(input,String(value));
      await w.__trainingAct(async () => { input.dispatchEvent(new w.Event(event,{bubbles:true})); });
    },
    async button(text){
      const button=[...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
      if(!button)throw new Error('Boton ausente '+text);
      await w.__trainingAct(async () => { button.click(); });
    },
    close(){w.__trainingUnmount();w.close();},
  };
}
