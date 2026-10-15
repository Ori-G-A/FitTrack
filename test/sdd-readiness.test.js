import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, VirtualConsole } from 'jsdom';
import { buildHarness } from '../test-support/build-harness.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(predicate, label) {
  const end = Date.now() + 8000;
  while (!predicate()) {
    if (Date.now() > end) throw new Error(`Timeout: ${label}`);
    await sleep(20);
  }
}

async function mount({ mutation } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM('<div id="root"></div>', {
    url: 'http://sdd.invalid/', runScripts: 'outside-only', virtualConsole,
  });
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  dom.window.structuredClone = structuredClone;
  dom.window.fetch = () => { throw new Error('Red prohibida en pruebas'); };
  dom.window.XMLHttpRequest = class { constructor() { throw new Error('Red prohibida'); } };
  dom.window.WebSocket = class { constructor() { throw new Error('Red prohibida'); } };
  const code = await buildHarness({ mutation });
  try {
    dom.window.eval(code);
    return { dom, errors, fixture: dom.window.__sddFixture };
  } catch (error) { dom.window.close(); throw error; }
}

test('SDD-PILOT-001 App original carga y guarda con servicios simulados', async () => {
  const { dom, errors, fixture } = await mount();
  try {
    await waitFor(() => fixture.writes.length >= 12, 'guardado inicial');
    assert.equal(new Set(fixture.reads.map((r) => r.key)).size, 12);
    assert.equal(new Set(fixture.writes.map((r) => r.payload.key)).size, 12);
    assert.ok(fixture.writes.every((r) => r.payload.user_id === fixture.user.id));
    assert.ok(dom.window.document.querySelector('button.ft-user'));
    assert.deepEqual(errors, []);
  } finally { dom.window.__sddUnmount?.(); dom.window.close(); }
});

async function loadingContract(mutation) {
  // El gate se instala antes de evaluar App, manteniendo los datos aún sin cargar.
  const { dom } = await mount({ mutation });
  try {
    let release;
    dom.window.__sddFixture.readGate = new Promise((resolve) => { release = resolve; });
    const fixture = dom.window.__sddFixture;
    await waitFor(() => fixture.reads.length >= 12, 'lecturas pendientes');
    await sleep(750);
    assert.equal(fixture.writes.length, 0, 'No debe guardar antes de completar la carga');
    release();
    await waitFor(() => fixture.writes.length >= 12, 'guardado tras carga');
  } finally { dom.window.__sddUnmount?.(); dom.window.close(); }
}

test('SDD-PILOT-002 carga pendiente impide escrituras', async () => {
  await loadingContract();
});

test('SDD-MUT-001 el contrato detecta guardar antes de cargar', async () => {
  await assert.rejects(loadingContract('guardar-antes-de-cargar'), {
    code: 'ERR_ASSERTION', message: /No debe guardar antes de completar la carga/,
  });
});
