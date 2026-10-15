import test from 'node:test';
import assert from 'node:assert/strict';
import { identityModule } from '../test-support/identity-harness.js';
import { deferred } from '../test-support/clock.js';

const plain = value => JSON.parse(JSON.stringify(value));
function storage(overrides = {}) {
  const calls = [];
  const api = {
    async createSignedUrl(path, seconds) { calls.push(['sign', path, seconds]); return { data: { signedUrl: `signed:${path}` } }; },
    async upload(path, blob, options) { calls.push(['upload', path, blob.type, options]); return {}; },
    async list(user, options) { calls.push(['list', user, options]); return { data: [] }; },
    async remove(paths) { calls.push(['remove', [...paths]]); return {}; },
    ...overrides,
  };
  return { calls, client: { storage: { from(bucket) { assert.equal(bucket, 'progress-photos'); return api; } } } };
}

test('identidad fotos validacion firma subida y recuperacion', async t => {
  await t.test('formatos y frontera exacta 25 MiB', async () => {
    const { subject } = await identityModule('src/photo-storage.js');
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']) {
      const file = { type, size: 25 * 1024 ** 2 };
      assert.equal(subject.validatePhotoFile(file), file);
      assert.throws(() => subject.validatePhotoFile({ ...file, size: file.size + 1 }), /25 MB/);
    }
    for (const file of [null, { type: 'image/gif' }, { type: 'IMAGE/JPEG' }]) assert.throws(() => subject.validatePhotoFile(file), /Formato no admitido/);
  });
  await t.test('ruta saneada firma 86400 y metadatos persistibles', async () => {
    const { client, calls } = storage();
    const { subject } = await identityModule('src/photo-storage.js', { client });
    assert.equal(subject.photoStoragePath('owner', 'image/webp', '../a?b'), 'owner/ab.webp');
    assert.equal(subject.photoStoragePath('owner', 'image/png', 'x'.repeat(90)), `owner/${'x'.repeat(80)}.png`);
    assert.equal(subject.photoStoragePath('owner', 'image/heic', '!!!'), 'owner/generated-id.jpg');
    const photo = { id: 'p', storagePath: 'owner/p.jpg', date: '2026-10-15', extra: 1 };
    const [signed] = await subject.hydratePhotos('owner', [photo]);
    assert.deepEqual(plain(signed), { ...photo, signedUrl: 'signed:owner/p.jpg' });
    assert.deepEqual(calls, [['sign', 'owner/p.jpg', 86400]]);
    assert.deepEqual(plain(subject.photoForStorage(signed)), photo);
    const inline = { dataUrl: 'inline', signedUrl: 'old' };
    assert.equal((await subject.refreshPhotoUrls([inline]))[0], inline);
  });
  await t.test('subida usa mime permitido upsert y firma posterior', async () => {
    for (const type of ['image/png', 'image/webp', 'image/jpeg', 'image/heic']) {
      const { client, calls } = storage();
      const blob = new Blob(['synthetic'], { type });
      const { subject } = await identityModule('src/photo-storage.js', { client, globals: { fetch: async url => { assert.equal(url, 'synthetic:data'); return { blob: async () => blob }; } } });
      const result = await subject.uploadPhotoData('owner', { id: 'p', date: '2026-10-15', dataUrl: 'synthetic:data', extra: 'discarded' });
      const mime = type === 'image/heic' ? 'image/jpeg' : type;
      const extension = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
      assert.deepEqual(plain(calls), [
        ['upload', `owner/p.${extension}`, type, { contentType: mime, upsert: true }],
        ['sign', `owner/p.${extension}`, 86400],
      ]);
      assert.deepEqual(plain(result), { id: 'p', date: '2026-10-15', storagePath: `owner/p.${extension}`, signedUrl: `signed:owner/p.${extension}` });
    }
  });
  await t.test('fallo individual conserva referencia y registra diagnóstico', async () => {
    const failure = new Error('unavailable');
    const { client } = storage({ createSignedUrl: async () => ({ error: failure }) });
    const { subject, errors } = await identityModule('src/photo-storage.js', { client });
    const photo = { id: 'p', storagePath: 'owner/p.jpg' };
    for (const value of [null, {}, []]) assert.deepEqual(plain(await subject.hydratePhotos('owner', value)), []);
    assert.equal((await subject.hydratePhotos('owner', [photo]))[0], photo);
    assert.equal((await subject.refreshPhotoUrls([photo]))[0], photo);
    assert.deepEqual(errors.map(value => value[0]), ['hydratePhoto', 'refreshPhotoUrl']);
    assert.ok(errors.every(value => value[1] === failure));
  });
  await t.test('subida fallida no firma y firma fallida no compensa subida', async () => {
    for (const step of ['upload', 'sign']) {
      const failure = new Error(step); const events = [];
      const { client } = storage({
        upload: async () => { events.push('upload'); return step === 'upload' ? { error: failure } : {}; },
        createSignedUrl: async () => { events.push('sign'); return { error: failure }; },
        remove: async () => { throw new Error('No debe compensar'); },
      });
      const { subject } = await identityModule('src/photo-storage.js', { client, globals: { fetch: async () => ({ blob: async () => new Blob(['photo'], { type: 'image/jpeg' }) }) } });
      await assert.rejects(subject.uploadPhotoData('owner', { id: 'p', dataUrl: 'synthetic' }), value => value === failure);
      assert.deepEqual(events, step === 'upload' ? ['upload'] : ['upload', 'sign']);
    }
  });
  await t.test('defaults de ID fecha y fotos sin ruta conservan contrato', async () => {
    const { client, calls } = storage();
    const { subject } = await identityModule('src/photo-storage.js', { client, globals: {
      Date: class extends Date { constructor() { super(2026, 9, 15, 12); } },
      fetch: async () => ({ blob: async () => new Blob(['photo'], { type: 'image/jpeg' }) }),
    } });
    const result = await subject.uploadPhotoData('owner', { dataUrl: 'synthetic' });
    assert.equal(result.id, 'generated-id'); assert.equal(result.date, '2026-10-15');
    assert.equal(result.storagePath, 'owner/generated-id.jpg');
    const noPath = { id: 'untouched' };
    const count = calls.length;
    assert.equal(await subject.uploadPhotoData('owner', noPath), noPath);
    assert.equal(calls.length, count);
    const operations = await identityModule('src/photo-operations.js', { client });
    const inline = { storagePath: 'owner/p', dataUrl: 'inline', signedUrl: 'keep' };
    assert.equal(await operations.subject.createSignedPhoto(client, inline), inline);
    assert.equal(calls.length, count);
  });
  await t.test('upload vence a 20000 ms antes de iniciar firma', async () => {
    const gate = deferred(); const events = [];
    const { client } = storage({ upload: () => { events.push('upload'); return gate.promise; }, createSignedUrl: () => { throw new Error('Firma inesperada'); } });
    const { subject, clock } = await identityModule('src/photo-storage.js', { client, globals: { fetch: async () => ({ blob: async () => new Blob(['photo']) }) } });
    const pending = subject.uploadPhotoData('owner', { id: 'p', dataUrl: 'synthetic' });
    for (let i = 0; i < 24; i++) await Promise.resolve();
    assert.deepEqual(events, ['upload']);
    let done = false; pending.then(() => { done = true; }, () => { done = true; });
    const rejected = assert.rejects(pending, { code: 'OPERATION_TIMEOUT' });
    await clock.advance(19999); assert.equal(done, false);
    await clock.advance(1); await rejected;
    gate.resolve({});
  });
});

test('identidad fotos borrado paginacion orden y fallos', async t => {
  await t.test('lista todo antes de eliminar y usa lotes de 100', async () => {
    const events = [];
    const { client } = storage({
      async list(user, options) {
        events.push(['list', user, plain(options)]);
        return { data: Array.from({ length: options.offset < 200 ? 100 : 1 }, (_, index) => ({ name: `p${options.offset + index}` })) };
      },
      async remove(paths) { events.push(['remove', [...paths]]); return {}; },
    });
    const { subject } = await identityModule('src/photo-storage.js', { client });
    await subject.deleteUserPhotos('owner');
    assert.deepEqual(events.slice(0, 3), [0, 100, 200].map(offset => ['list', 'owner', { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }]));
    assert.deepEqual(events.slice(3).map(value => value[1].length), [100, 100, 1]);
    assert.deepEqual(events.slice(3).flatMap(value => value[1]), Array.from({ length: 201 }, (_, i) => `owner/p${i}`));
  });
  await t.test('ignora nombres vacíos y no borra después de fallo de listado', async () => {
    const failure = new Error('list failed'); let removed = false;
    const { client } = storage({ list: async () => ({ error: failure }), remove: async () => { removed = true; return {}; } });
    const { subject } = await identityModule('src/photo-storage.js', { client });
    await assert.rejects(subject.deleteUserPhotos('owner'), error => error === failure);
    assert.equal(removed, false);
    const fixture = storage({ list: async () => ({ data: [{ name: '' }, { name: null }, { name: 'p' }] }) });
    const second = await identityModule('src/photo-storage.js', { client: fixture.client });
    await second.subject.deleteUserPhotos('owner');
    assert.deepEqual(fixture.calls, [['remove', ['owner/p']]]);
  });
  await t.test('borrado individual sin ruta no opera y propaga error', async () => {
    const failure = new Error('remove failed');
    const { client } = storage({ remove: async () => ({ error: failure }) });
    const { subject } = await identityModule('src/photo-storage.js', { client });
    await subject.deletePhotoFile({});
    await assert.rejects(subject.deletePhotoFile({ storagePath: 'owner/p' }), value => value === failure);
    const batch = storage({ list: async () => ({ data: [{ name: 'p' }] }), remove: async () => ({ error: failure }) });
    const second = await identityModule('src/photo-storage.js', { client: batch.client });
    await assert.rejects(second.subject.deleteUserPhotos('owner'), value => value === failure);
  });
  await t.test('fallo del segundo lote detiene borrado sin revertir primero', async () => {
    const failure = new Error('second batch'); const removed = [];
    const { client } = storage({
      list: async (_user, options) => ({ data: Array.from({ length: options.offset < 200 ? 100 : 1 }, (_, index) => ({ name: `p${options.offset + index}` })) }),
      remove: async paths => { removed.push([...paths]); return removed.length === 2 ? { error: failure } : {}; },
    });
    const { subject } = await identityModule('src/photo-storage.js', { client });
    await assert.rejects(subject.deleteUserPhotos('owner'), error => error === failure);
    assert.deepEqual(removed.map(value => value.length), [100, 100]);
    assert.equal(removed[0][0], 'owner/p0'); assert.equal(removed[1][0], 'owner/p100');
  });
  await t.test('firma listado y borrado vencen a 20000 ms', async () => {
    for (const operation of ['sign', 'list', 'remove']) {
      const gate = deferred();
      const { client } = storage({
        ...(operation === 'sign' ? { createSignedUrl: () => gate.promise } : {}),
        ...(operation === 'list' ? { list: () => gate.promise } : {}),
        ...(operation === 'remove' ? { remove: () => gate.promise } : {}),
      });
      const file = operation === 'sign' ? 'src/photo-operations.js' : 'src/photo-storage.js';
      const { subject, clock } = await identityModule(file, { client });
      const pending = operation === 'sign' ? subject.createSignedPhoto(client, { storagePath: 'owner/p' }) : operation === 'list' ? subject.deleteUserPhotos('owner') : subject.deletePhotoFile({ storagePath: 'owner/p' });
      let done = false; pending.then(() => { done = true; }, () => { done = true; });
      const rejected = assert.rejects(pending, { code: 'OPERATION_TIMEOUT' });
      await clock.advance(19999); assert.equal(done, false);
      await clock.advance(1); await rejected;
      gate.resolve({ data: { signedUrl: 'late' } });
    }
  });
});

test('identidad fotos compresion y materializacion de copia', async t => {
  await t.test('compresión mantiene proporción sin ampliar y libera objectURL', async () => {
    for (const [width, height, expected] of [[1640, 820, [820, 410]], [400, 600, [400, 600]], [900, 1800, [410, 820]]]) {
      const calls = []; let image;
      const canvas = { getContext: type => { assert.equal(type, '2d'); return { drawImage: (...args) => calls.push(['draw', ...args.slice(1)]) }; }, toDataURL: (...args) => { calls.push(['encode', ...args]); return 'compressed'; } };
      const file = { id: 'synthetic' };
      const { subject } = await identityModule('src/photo-storage.js', { globals: {
        URL: { createObjectURL: value => { assert.equal(value, file); return 'blob:synthetic'; }, revokeObjectURL: value => calls.push(['revoke', value]) },
        Image: class { constructor() { image = this; this.width = width; this.height = height; } },
        document: { createElement: type => { assert.equal(type, 'canvas'); return canvas; } },
      } });
      const pending = subject.compressImage(file);
      assert.equal(image.src, 'blob:synthetic'); image.onload();
      assert.equal(await pending, 'compressed');
      assert.deepEqual([canvas.width, canvas.height], expected);
      assert.deepEqual(calls, [['revoke', 'blob:synthetic'], ['draw', 0, 0, ...expected], ['encode', 'image/jpeg', 0.62]]);
    }
  });
  await t.test('lectura fallida libera objectURL y rechaza', async () => {
    let image; const revoked = [];
    const { subject } = await identityModule('src/photo-storage.js', { globals: {
      URL: { createObjectURL: () => 'blob:synthetic', revokeObjectURL: value => revoked.push(value) },
      Image: class { constructor() { image = this; } },
    } });
    const pending = subject.compressImage({});
    const rejected = assert.rejects(pending, /No se pudo leer la imagen/);
    image.onerror(); await rejected; assert.deepEqual(revoked, ['blob:synthetic']);
  });
  await t.test('copia conserva inline y materializa remotas sin metadatos transitorios', async () => {
    const { client, calls } = storage(); const downloads = [];
    const { subject } = await identityModule('src/photo-storage.js', { client, globals: {
      fetch: async url => { downloads.push(url); return { ok: true, blob: async () => new Blob(['photo']) }; },
      FileReader: class { readAsDataURL(blob) { assert.ok(blob instanceof Blob); this.result = 'data:image/jpeg;base64,cGhvdG8='; this.onload(); } },
    } });
    const result = await subject.photosForBackup([
      { id: 'inline', dataUrl: 'data:original', signedUrl: 'remove', extra: 'keep' },
      { id: 'cached', date: 'day', storagePath: 'owner/cached', signedUrl: 'cached-url', extra: 'remove' },
      { id: 'remote', date: 'day', storagePath: 'owner/remote' },
    ]);
    assert.deepEqual(plain(result), [
      { id: 'inline', dataUrl: 'data:original', extra: 'keep' },
      { id: 'cached', date: 'day', dataUrl: 'data:image/jpeg;base64,cGhvdG8=' },
      { id: 'remote', date: 'day', dataUrl: 'data:image/jpeg;base64,cGhvdG8=' },
    ]);
    assert.deepEqual(downloads.sort(), ['cached-url', 'signed:owner/remote']);
    assert.deepEqual(calls, [['sign', 'owner/remote', 86400]]);
  });
  await t.test('copia rechaza descarga y FileReader fallidos y plazo de fetch', async () => {
    for (const failure of ['http', 'reader', 'network']) {
      const { subject } = await identityModule('src/photo-storage.js', { globals: {
        fetch: async () => {
          if (failure === 'network') throw new Error('network failure');
          return { ok: failure !== 'http', blob: async () => new Blob(['photo']) };
        },
        FileReader: class { readAsDataURL() { this.error = new Error('reader failure'); this.onerror(); } },
      } });
      await assert.rejects(subject.photosForBackup([{ id: 'p', signedUrl: 'synthetic' }]), failure === 'http' ? /No se pudo incluir/ : new RegExp(`${failure} failure`));
    }
    const gate = deferred();
    const { subject, clock } = await identityModule('src/photo-storage.js', { globals: { fetch: () => gate.promise } });
    const pending = subject.photosForBackup([{ signedUrl: 'synthetic' }]); let done = false;
    pending.then(() => { done = true; }, () => { done = true; });
    const rejected = assert.rejects(pending, { code: 'OPERATION_TIMEOUT' });
    await clock.advance(19999); assert.equal(done, false);
    await clock.advance(1); await rejected;
    gate.resolve({ ok: false });
  });
});
