import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname, basename } from 'node:path';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { assertDisposableLocalRlsTarget, isLocalDockerEndpoint } from './local-rls-guard.js';

const repo = process.cwd();
const output = resolve('test-results/rls-evidence.json');
mkdirSync(dirname(output), { recursive: true });
// Cualquier nuevo intento invalida resultados previos, incluso si falla el preflight.
writeFileSync(output, JSON.stringify({ passed: false, cleanupPassed: false }));
const cli = process.env.SDD_SUPABASE_CLI || 'supabase';
const cliVersion = '2.121.0';
const projectId = `fittrack-sdd-rls-${randomBytes(6).toString('hex')}`;
const nonce = randomUUID();
const target = { apiUrl: 'http://127.0.0.1:59321', databaseUrl: 'postgresql://127.0.0.1:59322/postgres', environment: 'fittrack-sdd-disposable' };
// Rechazo previo a CLI/SDK; el destino nunca proviene de env de la aplicación.
assertDisposableLocalRlsTarget(target);
if (process.env.DOCKER_HOST && !isLocalDockerEndpoint(process.env.DOCKER_HOST)) throw new Error('Docker remoto no admitido para RLS');
const endpoint = spawnSync('docker', ['context', 'inspect', '--format', '{{.Endpoints.docker.Host}}'], { encoding: 'utf8', timeout: 30000 });
if (endpoint.status !== 0 || !isLocalDockerEndpoint(endpoint.stdout.trim())) throw new Error('Se requiere un contexto Docker local');
const version = spawnSync(cli, ['--version'], { encoding: 'utf8', timeout: 30000 });
if (version.status !== 0 || version.stdout.trim() !== cliVersion) throw new Error(`RLS requiere Supabase CLI ${cliVersion}`);

const root = mkdtempSync(join(tmpdir(), 'fittrack-sdd-rls-'));
const owner = { projectId, nonce };
writeFileSync(join(root, '.sdd-owner.json'), JSON.stringify(owner), { mode: 0o600 });
const childEnv = { ...process.env, DO_NOT_TRACK: '1' };
for (const key of Object.keys(childEnv)) if (key.startsWith('SUPABASE_')) delete childEnv[key];
let attempted = false, cleanupPassed = false, failure, results = [], apiOrigin;

function command(file, args, env = childEnv, timeoutMs = 120000) {
  return new Promise((yes, no) => {
    const child = spawn(file, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutMs);
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });
    child.on('error', () => { clearTimeout(timer); no(new Error('No se pudo ejecutar herramienta local de RLS')); });
    child.on('close', code => { clearTimeout(timer); yes({ code: timedOut ? 124 : code, stdout, stderr }); });
  });
}
function verifyOwner() {
  const actual = realpathSync(root), parent = realpathSync(tmpdir());
  const saved = JSON.parse(readFileSync(join(root, '.sdd-owner.json'), 'utf8'));
  if (dirname(actual) !== parent || !basename(actual).startsWith('fittrack-sdd-rls-') || saved.projectId !== projectId || saved.nonce !== nonce) {
    throw new Error('No se puede verificar propiedad del entorno temporal');
  }
  return actual;
}
function safeError(stderr) {
  return stderr.replace(/(?:postgres(?:ql)?:|https?):\/\/\S+/g, '[conexion]')
    .replace(/\b(?:eyJ[\w.-]+|sb_(?:secret|publishable)_[\w-]+)\b/g, '[clave]')
    .split(/\r?\n/).filter(Boolean).slice(-8).join('\n');
}
try {
  const sb = join(root, 'supabase'), migrations = join(sb, 'migrations');
  mkdirSync(migrations, { recursive: true });
  writeFileSync(join(sb, 'config.toml'), `project_id = "${projectId}"
[api]
enabled = true
port = 59321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
[db]
port = 59322
shadow_port = 59320
major_version = 17
[db.seed]
enabled = false
[db.pooler]
enabled = false
[studio]
enabled = false
[local_smtp]
enabled = false
[realtime]
enabled = false
[analytics]
enabled = false
[edge_runtime]
enabled = false
[storage]
enabled = true
[auth]
enabled = true
site_url = "http://127.0.0.1:3000"
enable_signup = true
[auth.email]
enable_signup = true
enable_confirmations = false
`);
  // Prerrequisito mínimo de fixture; no es una migración productiva ni simula auth/Storage.
  writeFileSync(join(migrations, '20260101000000_fixture.sql'), `
create table public.app_data (user_id uuid not null, key text not null, value jsonb, primary key(user_id,key));
create function public.sdd_fixture_identity() returns text language sql stable as $$ select '${nonce}'::text $$;
grant execute on function public.sdd_fixture_identity() to anon, authenticated;
`);
  for (const file of readdirSync(resolve('supabase/migrations')).filter(file => file.endsWith('.sql')).sort()) {
    copyFileSync(resolve('supabase/migrations', file), join(migrations, file));
  }
  verifyOwner();
  console.log('RLS: arrancando fixture Supabase local desechable');
  attempted = true;
  const heartbeat = setInterval(() => console.log('RLS: preparación local en curso; salida de credenciales retenida'), 30000);
  let started;
  try {
    started = await command(cli, ['start', '--workdir', root, '--yes', '--agent=no', '--exclude', 'realtime,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor'], childEnv, 20 * 60 * 1000);
  } finally { clearInterval(heartbeat); }
  if (started.code !== 0) throw new Error(`Arranque local falló: ${safeError(started.stderr)}`);
  const status = await command(cli, ['status', '--workdir', root, '--output', 'json', '--agent=no']);
  if (status.code !== 0) throw new Error('No se pudo obtener estado del fixture local');
  let vars;
  try { vars = JSON.parse(status.stdout); } catch { throw new Error('Formato de estado local no reconocido; no se imprime contenido'); }
  const context = {
    environment: target.environment, projectId, nonce,
    apiUrl: vars.API_URL, databaseUrl: vars.DB_URL,
    anonKey: vars.ANON_KEY, serviceRoleKey: vars.SERVICE_ROLE_KEY,
  };
  apiOrigin = assertDisposableLocalRlsTarget(context).apiOrigin;
  const contextFile = join(root, 'context.json');
  writeFileSync(contextFile, JSON.stringify(context), { mode: 0o600 });
  console.log('RLS: ejecutando matriz real de dos usuarios y anónimo');
  const test = await command(process.execPath, ['--test', '--test-isolation=none', '--test-reporter=tap', resolve(repo, 'rls-tests/ownership.js')], { ...childEnv, SDD_RLS_CONTEXT_FILE: contextFile }, 5 * 60 * 1000);
  const tap = test.stdout;
  // Los tests solo imprimen nombres/resultados; no registran credenciales ni sesiones.
  writeFileSync(resolve(repo, 'test-results/rls.tap'), tap);
  results = [...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map(match => ({ name: match[2], status: match[1] === 'ok' && !/ # (?:SKIP|TODO)/.test(match[2]) ? 'passed' : 'failed' }));
  if (test.code !== 0 || results.length !== 3 || results.some(result => result.status !== 'passed')) {
    throw new Error(`Matriz RLS falló; revisar test-results/rls.tap. ${safeError(test.stderr)}`);
  }
} catch (error) { failure = error; }
finally {
  try {
    const actual = verifyOwner();
    if (attempted) {
      console.log('RLS: retirando solo el fixture creado por esta ejecución');
      const stopped = await command(cli, ['stop', '--workdir', root, '--project-id', projectId, '--no-backup', '--yes', '--agent=no']);
      if (stopped.code !== 0) throw new Error('No se pudo retirar fixture local; no se declara cleanup completo');
    }
    // Ruta absoluta y propietario comprobados antes del borrado recursivo.
    rmSync(actual, { recursive: true });
    cleanupPassed = true;
  } catch (error) { failure ||= error; }
}
const files = ['rls-tests/ownership.js', 'scripts/run-local-rls.js', 'scripts/local-rls-guard.js', 'test-support/rls/fixture-client.js', 'pnpm-lock.yaml', ...readdirSync(resolve('supabase/migrations')).filter(file => file.endsWith('.sql')).sort().map(file => `supabase/migrations/${file}`)];
const hashes = Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(resolve(repo, file))).digest('hex')]));
writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), node: process.version, cliVersion, projectId, recoveryDirectory: cleanupPassed ? null : root, passed: !failure, cleanupPassed, environment: target.environment, apiOrigin, results, hashes }, null, 2) + '\n');
if (failure) { console.error(failure.message); process.exitCode = 1; }
else console.log('RLS: 3 contratos reales aprobados; fixture retirado');
