import { JSDOM, VirtualConsole } from 'jsdom';
import { buildHarness } from './build-harness.js';
import { createClock } from './clock.js';
export const plain = value => JSON.parse(JSON.stringify(value));
export async function waitFor(predicate, label = 'estado') {
  const end = Date.now() + 8000;
  while (!predicate()) {
    if (Date.now() > end) throw new Error(`Timeout: ${label}`);
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}
const bundles = new Map();
export async function mountApp(seed = {}, { hook = false, captureIntervals = false } = {}) {
  if (!bundles.has(hook)) bundles.set(hook, buildHarness({ capture: !hook, entry: hook ? 'test-support/hook-entry.jsx' : 'test-support/app-entry.jsx' }));
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://sdd.invalid/', runScripts: 'outside-only', virtualConsole: new VirtualConsole() });
  const w = dom.window, clock = createClock(), captures = [], alerts = [], downloads = [], revoked = [];
  const intervals = new Map(); let intervalSequence = 0;
  if (captureIntervals) {
    const realSetInterval = w.setInterval.bind(w), realClearInterval = w.clearInterval.bind(w);
    w.setInterval = (callback, delay, ...args) => {
      if (delay !== 12 * 60 * 60 * 1000) return realSetInterval(callback, delay, ...args);
      const id = `photo:${++intervalSequence}`; intervals.set(id, { callback, delay }); return id;
    };
    w.clearInterval = id => intervals.has(id) ? intervals.delete(id) : realClearInterval(id);
  }
  w.__sddFixture = seed;
  w.__sddCapture = value => captures.push(value);
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.structuredClone = structuredClone;
  w.Blob = Blob;
  w.alert = message => alerts.push(message);
  w.confirm = () => true;
  w.prompt = () => 'ELIMINAR';
  w.fetch = async url => {
    if (String(url).startsWith('data:image/')) return new Response(Buffer.from(String(url).split(',')[1], 'base64'), { headers: { 'content-type': String(url).slice(5).split(';')[0] } });
    if (String(url).startsWith('https://signed.example/')) return new Response('photo', { status: w.__sddFixture.failPhotoDownload ? 500 : 200, headers: { 'content-type': 'image/jpeg' } });
    throw new Error('Red no simulada prohibida');
  };
  w.XMLHttpRequest = class { constructor() { throw new Error('Red prohibida'); } };
  w.WebSocket = class { constructor() { throw new Error('Red prohibida'); } };
  w.URL.createObjectURL = blob => { downloads.push({ blob }); return 'blob:sdd'; };
  w.URL.revokeObjectURL = url => revoked.push(url);
  w.HTMLAnchorElement.prototype.click = function () { downloads.at(-1).name = this.download; };
  w.FileReader = class {
    readAsText(file) { queueMicrotask(() => { if (file.error) this.onerror(); else { this.result = file.text; this.onload(); } }); }
    readAsDataURL(blob) { blob.arrayBuffer().then(buffer => { this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`; this.onload(); }); }
  };
  const realSet = w.setTimeout.bind(w), realClear = w.clearTimeout.bind(w);
  const delays = new Set([600, 1000, 123, 15000, 20000]);
  w.setTimeout = (fn, delay, ...args) => delays.has(delay) ? `fake:${clock.setTimeout(() => fn(...args), delay)}` : realSet(fn, delay, ...args);
  w.clearTimeout = id => typeof id === 'string' && id.startsWith('fake:') ? clock.clearTimeout(Number(id.slice(5))) : realClear(id);
  const RealDate = w.Date, epoch = Date.parse('2026-10-15T12:00:00Z');
  w.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [epoch + clock.now])); } static now() { return epoch + clock.now; } };
  w.eval(await bundles.get(hook));
  if (!hook) await waitFor(() => captures.length, 'montaje');
  const app = {
    w, clock, alerts, downloads, revoked, captures, intervals,
    get fixture() { return w.__sddFixture; },
    get current() { return captures.at(-1); },
    async ready() { await waitFor(() => w.__sddCommitted?.loaded, 'carga y efectos'); },
    async button(text) {
      let button;
      await waitFor(() => (button = [...w.document.querySelectorAll('button')].find(b => b.textContent.trim() === text)), `botón ${text}`);
      button.click(); await new Promise(resolve => setTimeout(resolve, 0));
    },
    async account() { await app.ready(); w.document.querySelector('button.ft-user').click(); await app.button('DATOS Y CONFIGURACIÓN'); },
    async import(value, size = 100, error = false) {
      const input = w.document.querySelector('input[type=file]');
      Object.defineProperty(input, 'files', { configurable: true, value: value === undefined ? [] : [{ size, text: typeof value === 'string' ? value : JSON.stringify(value), error }] });
      Object.defineProperty(input, 'value', { configurable: true, writable: true, value: 'selected' });
      input.dispatchEvent(new w.Event('change', { bubbles: true }));
      if (value !== undefined) await waitFor(() => input.value === '', 'fin de importación');
      return input;
    },
    close() { w.__sddUnmount?.(); w.close(); },
  };
  return app;
}
