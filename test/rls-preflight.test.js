import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

test('RLS intento rechazado invalida evidencia previa sin conectar Docker remoto', () => {
  const root = mkdtempSync(join(tmpdir(), 'fittrack-sdd-preflight-'));
  try {
    mkdirSync(join(root, 'test-results'));
    const report = join(root, 'test-results/rls-evidence.json');
    writeFileSync(report, JSON.stringify({ passed: true, cleanupPassed: true }));
    const result = spawnSync(process.execPath, [resolve('scripts/run-local-rls.js')], {
      cwd: root, encoding: 'utf8', timeout: 10000,
      env: { ...process.env, DOCKER_HOST: 'tcp://remote.invalid:2375' },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Docker remoto no admitido/);
    assert.deepEqual(JSON.parse(readFileSync(report, 'utf8')), { passed: false, cleanupPassed: false });
  } finally {
    const actual = realpathSync(root);
    assert.equal(dirname(actual), realpathSync(tmpdir()));
    assert.ok(basename(actual).startsWith('fittrack-sdd-preflight-'));
    rmSync(actual, { recursive: true });
  }
});
