import test from 'node:test';
import assert from 'node:assert/strict';
import { identityModule } from '../test-support/identity-harness.js';
import { deferred } from '../test-support/clock.js';

test('identidad autenticacion credenciales errores y plazo', async t => {
  await t.test('normaliza solo correo y elige operación sin alterar contraseña', async () => {
    const { subject } = await identityModule('src/auth-service.js');
    const calls = [];
    const client = { auth: {
      signInWithPassword: async value => { calls.push(['login', value]); return {}; },
      signUp: async value => { calls.push(['register', value]); return {}; },
    } };
    await subject.authenticate(client, 'login', '  A@EXAMPLE.COM ', ' Pass WORD ');
    await subject.authenticate(client, 'register', ' B@example.COM ', ' x ');
    assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
      ['login', { email: 'a@example.com', password: ' Pass WORD ' }],
      ['register', { email: 'b@example.com', password: ' x ' }],
    ]);
    // La longitud mínima pertenece a AuthScreen, no al servicio observado.
  });
  await t.test('propaga retorno error rechazo y excepción síncrona', async () => {
    const { subject } = await identityModule('src/auth-service.js');
    for (const mode of ['login', 'register']) {
      for (const kind of ['returned', 'rejected', 'thrown']) {
        const error = new Error(kind);
        const method = () => {
          if (kind === 'thrown') throw error;
          return kind === 'returned' ? Promise.resolve({ error }) : Promise.reject(error);
        };
        await assert.rejects(subject.authenticate({ auth: { signInWithPassword: method, signUp: method } }, mode, 'a@b.c', 'pw'), value => value === error);
      }
    }
  });
  await t.test('vence a 15000 ms sin cancelar la respuesta remota', async () => {
    const { subject, clock } = await identityModule('src/auth-service.js');
    const gate = deferred(); let done = false;
    const pending = subject.authenticate({ auth: { signInWithPassword: () => gate.promise } }, 'login', 'a@b.c', 'pw');
    pending.then(() => { done = true; }, () => { done = true; });
    const rejected = assert.rejects(pending, { code: 'OPERATION_TIMEOUT', message: 'La autenticacion tardo demasiado.' });
    await clock.advance(14999); assert.equal(done, false);
    await clock.advance(1); await rejected;
    gate.resolve({}); await gate.promise;
  });
});
