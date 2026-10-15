const LOOPBACK_LITERALS = new Set(['127.0.0.1', '[::1]']);

// Guarda pura: no lee variables, archivos ni DNS y nunca abre conexiones.
export function assertDisposableLocalRlsTarget({ apiUrl, databaseUrl, environment } = {}) {
  if (environment !== 'fittrack-sdd-disposable') throw new Error('RLS requiere un entorno desechable explícito');
  let api, database;
  try { api = new URL(apiUrl); database = new URL(databaseUrl); }
  catch { throw new Error('RLS requiere URLs locales válidas'); }
  if (!LOOPBACK_LITERALS.has(api.hostname) || !LOOPBACK_LITERALS.has(database.hostname)) {
    throw new Error('RLS solo admite direcciones loopback literales');
  }
  if (!['http:', 'https:'].includes(api.protocol) || !['postgres:', 'postgresql:'].includes(database.protocol)) {
    throw new Error('RLS requiere protocolos HTTP y PostgreSQL');
  }
  if (api.username || api.password || api.pathname !== '/' || api.search || api.hash || database.search || database.hash || database.pathname.length < 2) {
    throw new Error('Configuración local RLS no admitida');
  }
  if (!api.port || !database.port) throw new Error('RLS requiere puertos locales explícitos');
  return { apiOrigin: api.origin, databaseUrl: database.href };
}
