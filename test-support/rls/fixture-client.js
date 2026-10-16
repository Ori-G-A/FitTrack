import { assertDisposableLocalRlsTarget } from '../../scripts/local-rls-guard.js';

export async function connectLocalRlsFixture(context, createClient) {
  const { apiOrigin } = assertDisposableLocalRlsTarget(context);
  if (!/^fittrack-sdd-rls-[a-f0-9]{12}$/.test(context.projectId || '') ||
      !/^[a-f0-9-]{36}$/.test(context.nonce || '') || !context.anonKey || !context.serviceRoleKey) {
    throw new Error('Fixture RLS sin identidad/configuración explícita');
  }
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) },
  };
  const anonymous = createClient(apiOrigin, context.anonKey, options);
  const marker = await anonymous.rpc('sdd_fixture_identity');
  if (marker.error || marker.data !== context.nonce) throw new Error('El servidor no pertenece al fixture RLS desechable');
  const admin = createClient(apiOrigin, context.serviceRoleKey, options);
  return { anonymous, admin, options, apiOrigin };
}
