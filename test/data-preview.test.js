import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, VirtualConsole } from 'jsdom';
import { buildHarness } from '../test-support/build-harness.js';
import { waitFor } from '../test-support/app-dom.js';

test('datos humo de previews con cliente sintetico', async () => {
  for (const entry of ['src/preview-main.jsx', 'preview/maqueta.jsx']) {
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error.message));
    const dom = new JSDOM('<div id="root"></div>', { url: 'http://sdd.invalid/', runScripts: 'outside-only', virtualConsole });
    try {
      const w = dom.window;
      w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      w.structuredClone = structuredClone;
      w.fetch = () => { throw new Error('Red prohibida'); };
      w.XMLHttpRequest = class { constructor() { throw new Error('Red prohibida'); } };
      w.WebSocket = class { constructor() { throw new Error('Red prohibida'); } };
      w.eval(await buildHarness({ entry, capturePreview: true }));
      let train;
      await waitFor(() => (train = [...w.document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Entrenar')), entry);
      train.click();
      await waitFor(() => w.document.body.textContent.includes('Calentamiento'), 'Train compartido');
      assert.deepEqual(errors, []);
    } finally { dom.window.__sddPreviewRoot?.unmount(); dom.window.close(); }
  }
});
