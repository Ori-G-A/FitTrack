import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { connectLocalRlsFixture } from '../test-support/rls/fixture-client.js';

// Solo el runner desechable proporciona este contexto; no se carga env de la app.
const context = JSON.parse(readFileSync(process.env.SDD_RLS_CONTEXT_FILE, 'utf8'));
const { anonymous, admin, options, apiOrigin } = await connectLocalRlsFixture(context, createClient);
const actors = [];
for (const label of ['a', 'b']) {
  const email = `sdd-${label}-${randomUUID()}@example.test`, password = `Synthetic!${randomUUID()}`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ok(!created.error, 'Crear usuario sintético del fixture');
  const login = await createClient(apiOrigin, context.anonKey, options).auth.signInWithPassword({ email, password });
  assert.ok(!login.error && login.data.session, 'Autenticar usuario sintético');
  actors.push({ id: created.data.user.id, client: createClient(apiOrigin, context.anonKey, {
    ...options, global: { ...options.global, headers: { Authorization: `Bearer ${login.data.session.access_token}` } },
  }) });
}
const [a, b] = actors;
const ok = (result, operation) => { assert.ok(!result.error, operation); return result.data; };
const bucket = client => client.storage.from('progress-photos');

test('SDD-RLS-001 app_data dos propietarios y anonimo', async () => {
  for (const owner of actors) {
    ok(await owner.client.from('app_data').insert({ user_id: owner.id, key: 'weights', value: ['original'] }), 'Insertar propio');
    const own = ok(await owner.client.from('app_data').select('value').eq('user_id', owner.id), 'Leer propio');
    assert.equal(own.length, 1);
    ok(await owner.client.from('app_data').update({ value: ['updated'] }).eq('user_id', owner.id), 'Actualizar propio');
  }
  assert.deepEqual(ok(await b.client.from('app_data').select('*').eq('user_id', a.id), 'Consulta cruzada sin filas'), []);
  assert.ok((await b.client.from('app_data').insert({ user_id: a.id, key: 'foreign', value: [] })).error, 'Insert cruzado denegado');
  assert.deepEqual(ok(await b.client.from('app_data').update({ value: ['attack'] }).eq('user_id', a.id).select(), 'Update cruzado sin filas'), []);
  assert.deepEqual(ok(await b.client.from('app_data').delete().eq('user_id', a.id).select(), 'Delete cruzado sin filas'), []);
  assert.ok((await a.client.from('app_data').update({ user_id: b.id, key: 'moved' }).eq('user_id', a.id)).error, 'WITH CHECK impide transferir propietario');
  const state = ok(await admin.from('app_data').select('value').eq('user_id', a.id).single(), 'Control posterior de A');
  assert.deepEqual(state.value, ['updated']);
  assert.ok((await anonymous.from('app_data').select('*')).error, 'Lectura anónima denegada');
  assert.ok((await anonymous.from('app_data').insert({ user_id: a.id, key: 'anonymous', value: [] })).error, 'Insert anónimo denegado');
  assert.ok((await anonymous.from('app_data').update({ value: ['attack'] }).eq('user_id', a.id)).error, 'Update anónimo denegado');
  assert.ok((await anonymous.from('app_data').delete().eq('user_id', a.id)).error, 'Delete anónimo denegado');
  assert.deepEqual(ok(await admin.from('app_data').select('value').eq('user_id', a.id).single(), 'Control después de anónimo').value, ['updated']);
  for (const owner of actors) {
    const deleted = ok(await owner.client.from('app_data').delete().eq('user_id', owner.id).select(), 'Borrar propio');
    assert.equal(deleted.length, 1);
  }
});

test('SDD-RLS-002 Storage privado permite solo prefijo propio', async () => {
  const pathA = `${a.id}/photo.png`, pathB = `${b.id}/photo.png`;
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=', 'base64');
  const upload = () => ({ contentType: 'image/png', upsert: false });
  for (const [owner, path] of [[a, pathA], [b, pathB]]) {
    ok(await bucket(owner.client).upload(path, bytes, upload(owner.client)), 'Subir propia');
    const signed = ok(await bucket(owner.client).createSignedUrl(path, 60), 'Firmar propia');
    const response = await fetch(signed.signedUrl, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200);
    ok(await bucket(owner.client).update(path, bytes, { contentType: 'image/png' }), 'Actualizar propia');
  }
  assert.ok((await bucket(b.client).upload(`${a.id}/foreign.png`, bytes, upload(b.client))).error, 'Subida cruzada denegada');
  assert.ok((await bucket(b.client).download(pathA)).error, 'Lectura cruzada denegada');
  assert.ok((await bucket(b.client).createSignedUrl(pathA, 60)).error, 'Firma cruzada denegada');
  assert.ok((await bucket(b.client).update(pathA, bytes, { contentType: 'image/png' })).error, 'Update cruzado denegado');
  assert.ok((await bucket(a.client).move(pathA, `${b.id}/moved.png`)).error, 'WITH CHECK impide cambio de prefijo');
  const foreignDelete = await bucket(b.client).remove([pathA]);
  assert.ok(foreignDelete.error || foreignDelete.data.length === 0, 'No borrar objeto ajeno');
  ok(await bucket(admin).download(pathA), 'Objeto A sigue presente tras ataque');
  assert.ok((await bucket(anonymous).download(pathA)).error, 'Lectura anónima denegada');
  assert.ok((await bucket(anonymous).createSignedUrl(pathA, 60)).error, 'Firma anónima denegada');
  assert.ok((await bucket(anonymous).upload(`${a.id}/anon.png`, bytes, upload(anonymous))).error, 'Subida anónima denegada');
  assert.ok((await bucket(anonymous).update(pathA, bytes, { contentType: 'image/png' })).error, 'Update anónimo denegado');
  const anonDelete = await bucket(anonymous).remove([pathA]);
  assert.ok(anonDelete.error || anonDelete.data.length === 0, 'Delete anónimo no altera objeto');
  ok(await bucket(admin).download(pathA), 'Objeto A sigue presente tras anónimo');
  const publicUrl = bucket(anonymous).getPublicUrl(pathA).data.publicUrl;
  assert.notEqual((await fetch(publicUrl, { signal: AbortSignal.timeout(10000) })).status, 200, 'Bucket no público');
  const metadata = ok(await admin.storage.getBucket('progress-photos'), 'Configuración bucket');
  assert.equal(metadata.public, false); assert.equal(metadata.file_size_limit, 5242880);
  assert.deepEqual([...metadata.allowed_mime_types].sort(), ['image/jpeg', 'image/png', 'image/webp'].sort());
  for (const [owner, path] of [[a, pathA], [b, pathB]]) {
    const removed = ok(await bucket(owner.client).remove([path]), 'Borrar propia'); assert.equal(removed.length, 1);
  }
});

test('SDD-RLS-003 diagnosticos insert-only sin suplantacion', async () => {
  for (const owner of actors) {
    ok(await owner.client.from('client_error_reports').insert({ kind: 'sdd', message: `fixture-${owner.id}` }), 'Insert propio por default');
    assert.ok((await owner.client.from('client_error_reports').select('*')).error, 'Sin lectura de diagnósticos');
    assert.ok((await owner.client.from('client_error_reports').update({ message: 'attack' }).eq('user_id', owner.id)).error, 'Sin update');
    assert.ok((await owner.client.from('client_error_reports').delete().eq('user_id', owner.id)).error, 'Sin delete');
  }
  assert.ok((await b.client.from('client_error_reports').insert({ user_id: a.id, kind: 'sdd', message: 'spoof' })).error, 'No suplantar propietario');
  assert.ok((await anonymous.from('client_error_reports').insert({ kind: 'sdd', message: 'anon' })).error, 'Sin insert anónimo');
  assert.ok((await anonymous.from('client_error_reports').select('*')).error, 'Sin lectura anónima');
  const rows = ok(await admin.from('client_error_reports').select('user_id,message'), 'Control de reportes');
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map(row => row.user_id).sort(), [a.id, b.id].sort());
});
