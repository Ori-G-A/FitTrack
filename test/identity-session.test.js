import test from 'node:test';
import assert from 'node:assert/strict';
import { mountApp, waitFor } from '../test-support/app-dom.js';
import { deferred } from '../test-support/clock.js';

test('identidad sesion consulta eventos reintento y limpieza', async t => {
  await t.test('sesión ausente presenta acceso sin leer datos y cleanup desuscribe', async () => {
    const app = await mountApp({ user: null });
    try {
      await waitFor(() => app.w.document.querySelector('input[type=email]'), 'acceso');
      assert.equal(app.fixture.reads.length, 0);
      assert.equal(app.fixture.listeners.size, 1);
    } finally { app.close(); }
    assert.equal(app.fixture.listeners.size, 0);
  });
  await t.test('error de sesión se muestra y reintento consulta de nuevo', async () => {
    let failing = true, calls = 0;
    const app = await mountApp({ onGetSession: async () => { calls++; return failing ? { error: new Error('session failure') } : { data: { session: null } }; } });
    try {
      await waitFor(() => app.w.document.body.textContent.includes('No se pudo verificar tu sesión.'), 'error sesión');
      assert.equal(app.fixture.reads.length, 0);
      const before = calls; failing = false;
      await app.button('Reintentar');
      await waitFor(() => app.w.document.querySelector('input[type=email]'), 'acceso tras reintento');
      assert.equal(calls, before + 1);
      assert.equal(app.fixture.listeners.size, 1);
    } finally { app.close(); }
  });
  await t.test('timeout 15000 ms muestra error sin consulta de datos', async () => {
    const gate = deferred();
    const app = await mountApp({ onGetSession: () => gate.promise });
    try {
      await waitFor(() => app.fixture.listeners.size === 1, 'efecto de sesión instalado');
      await app.clock.advance(14999);
      assert.equal(app.w.document.body.textContent.includes('No se pudo verificar tu sesión.'), false);
      await app.clock.advance(1);
      await waitFor(() => app.w.document.body.textContent.includes('No se pudo verificar tu sesión.'), 'timeout sesión');
      assert.equal(app.fixture.reads.length, 0);
    } finally { app.close(); gate.resolve({ data: { session: null } }); }
  });
  await t.test('eventos mismo usuario no recargan y usuario nuevo cambia propietario', async () => {
    const app = await mountApp();
    try {
      await app.ready();
      const reads = app.fixture.reads.length;
      app.fixture.emitSession({ ...app.fixture.user, email: 'changed@example.test' });
      await new Promise(resolve => setTimeout(resolve, 15));
      assert.equal(app.fixture.reads.length, reads);
      const user = { id: 'sdd-user-002', email: 'second@example.test' };
      app.fixture.emitSession(user);
      await waitFor(() => app.fixture.reads.some(value => value.user_id === user.id), 'nuevo propietario');
      await app.ready();
      assert.ok(app.fixture.reads.slice(reads).every(value => value.user_id === user.id));
      app.fixture.emitSession(null);
      await waitFor(() => app.w.document.querySelector('input[type=email]'), 'salida de sesión');
      assert.equal(app.current.state.loaded, false);
    } finally { app.close(); }
  });
  await t.test('respuesta de sesión tras desmontaje no inicia carga', async () => {
    const gate = deferred();
    const app = await mountApp({ onGetSession: () => gate.promise });
    app.close();
    gate.resolve({ data: { session: { user: { id: 'late' } } } });
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(app.fixture.reads.length, 0);
    assert.equal(app.fixture.listeners.size, 0);
  });
});

function fill(app, selector, value) {
  const input = app.w.document.querySelector(selector);
  Object.getOwnPropertyDescriptor(app.w.HTMLInputElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new app.w.Event('input', { bubbles: true }));
}

test('identidad acceso interfaz validacion mensajes y espera', async t => {
  await t.test('campos vacíos no autentican y registro corto muestra mensaje', async () => {
    const calls = [];
    const app = await mountApp({ user: null, onAuthenticate: (...args) => { calls.push(args); return {}; } });
    try {
      await waitFor(() => app.w.document.querySelector('input[type=email]'), 'formulario');
      app.w.document.querySelector('button.ft-btn').click();
      await new Promise(resolve => setTimeout(resolve, 0));
      assert.equal(calls.length, 0);
      await app.button('Registrarse');
      fill(app, 'input[type=email]', ' TEST@example.COM ');
      fill(app, 'input[type=password]', 'short');
      await app.button('Crear cuenta');
      await waitFor(() => app.w.document.body.textContent.includes('La contraseña debe tener al menos 8 caracteres.'), 'registro corto');
      assert.equal(calls.length, 0);
      await app.button('Entrar');
      assert.equal(app.w.document.body.textContent.includes('La contraseña debe tener al menos 8 caracteres.'), false);
      assert.equal(app.w.document.querySelector('input[type=password]').value, 'short');
    } finally { app.close(); }
  });
  await t.test('busy deshabilita formulario y error recupera inputs', async () => {
    const gate = deferred(), calls = [];
    const app = await mountApp({ user: null, onAuthenticate: (...args) => { calls.push(args); return gate.promise; } });
    try {
      await waitFor(() => app.w.document.querySelector('input[type=email]'), 'formulario');
      fill(app, 'input[type=email]', 'TEST@example.COM'); fill(app, 'input[type=password]', '12345678');
      app.w.document.querySelector('button.ft-btn').click();
      await waitFor(() => app.w.document.querySelector('button.ft-btn').disabled, 'busy');
      assert.ok([...app.w.document.querySelectorAll('input')].every(input => input.disabled));
      assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['login', { email: 'test@example.com', password: '12345678' }]]);
      gate.resolve({ error: { code: 'invalid_credentials', message: 'raw error' } });
      await waitFor(() => app.w.document.body.textContent.includes('Correo o contraseña incorrectos.'), 'error público');
      assert.ok([...app.w.document.querySelectorAll('input')].every(input => !input.disabled));
      assert.equal(app.w.document.querySelector('button.ft-btn').disabled, false);
    } finally { app.close(); }
  });
  await t.test('registro válido confirma correo y otros errores usan message o fallback', async () => {
    let response = {};
    const app = await mountApp({ user: null, onAuthenticate: async () => response });
    try {
      await waitFor(() => app.w.document.querySelector('input[type=email]'), 'formulario');
      await app.button('Registrarse');
      fill(app, 'input[type=email]', 'test@example.com'); fill(app, 'input[type=password]', '12345678');
      await app.button('Crear cuenta');
      await waitFor(() => app.w.document.body.textContent.includes('Revisa tu correo para confirmar el registro.'), 'confirmación');
      for (const [error, expected] of [[{ message: 'specific failure' }, 'specific failure'], [{}, 'No se pudo completar la solicitud.']]) {
        response = { error };
        await app.button('Crear cuenta');
        await waitFor(() => app.w.document.body.textContent.includes(expected), 'mensaje error');
      }
    } finally { app.close(); }
  });
});
