import test from 'node:test';
import assert from 'node:assert/strict';
import { assertDisposableLocalRlsTarget, isLocalDockerEndpoint } from '../scripts/local-rls-guard.js';

const local = {
  environment: 'fittrack-sdd-disposable',
  apiUrl: 'http://127.0.0.1:54321',
  databaseUrl: 'postgresql://synthetic:synthetic@127.0.0.1:54322/postgres',
};

test('RLS Docker acepta sockets locales y rechaza pipes de otra maquina', () => {
  for (const value of ['npipe:////./pipe/dockerDesktopLinuxEngine', 'unix:///var/run/docker.sock']) assert.equal(isLocalDockerEndpoint(value), true);
  for (const value of ['tcp://127.0.0.1:2375', 'ssh://remote', 'npipe:////remote/pipe/docker_engine', 'unix://remote/path', 'unix:////remote/path', undefined]) assert.equal(isLocalDockerEndpoint(value), false);
});

test('RLS guarda admite solo destino desechable local explícito sin conectar', () => {
  assert.deepEqual(assertDisposableLocalRlsTarget(local), { apiOrigin: local.apiUrl, databaseUrl: local.databaseUrl });
  const ipv6 = { ...local, apiUrl: 'http://[::1]:54321', databaseUrl: 'postgres://synthetic:synthetic@[::1]:54322/postgres' };
  assert.equal(assertDisposableLocalRlsTarget(ipv6).apiOrigin, ipv6.apiUrl);
  for (const environment of [undefined, '', 'production']) assert.throws(() => assertDisposableLocalRlsTarget({ ...local, environment }), /desechable/);
});

test('RLS guarda rechaza hosts remotos aliases y confusiones de URL', () => {
  for (const apiUrl of [
    'https://project.supabase.co:54321', 'http://localhost:54321',
    'http://localhost.example.com:54321', 'http://127.0.0.1.example.com:54321',
    'http://127.0.0.1@remote.invalid:54321', 'http://[::ffff:127.0.0.1]:54321',
  ]) assert.throws(() => assertDisposableLocalRlsTarget({ ...local, apiUrl }), /loopback/);
  assert.throws(() => assertDisposableLocalRlsTarget({ ...local, databaseUrl: 'postgres://synthetic:synthetic@remote.invalid:54322/postgres' }), /loopback/);
});

test('RLS guarda rechaza configuración ambigua y no expone valores en errores', () => {
  for (const change of [
    { apiUrl: 'not-a-url-secret-value' }, { databaseUrl: undefined },
    { apiUrl: 'ftp://127.0.0.1:54321' },
    { apiUrl: 'http://synthetic:secret-value@127.0.0.1:54321' },
    { apiUrl: 'http://127.0.0.1:54321/path' }, { apiUrl: 'http://127.0.0.1:54321?secret-value' },
    { apiUrl: 'http://127.0.0.1' }, { databaseUrl: 'postgres://127.0.0.1/postgres' },
    { databaseUrl: 'postgres://127.0.0.1:54322/' }, { databaseUrl: 'postgres://127.0.0.1:54322/postgres?secret-value' },
  ]) assert.throws(() => assertDisposableLocalRlsTarget({ ...local, ...change }), error => !error.message.includes('secret-value'));
});
