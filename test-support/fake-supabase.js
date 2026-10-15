import { DEFAULT_GOALS } from '../src/app-config.js';

// Solo se incluye en bundles de prueba; ninguna credencial ni llamada de red.
export function createFixture() {
  return {
    user: { id: 'sdd-user-001', email: 'sdd@example.test' },
    data: { goals: { ...DEFAULT_GOALS, sex: 'hombre' } },
    reads: [], writes: [], failWrites: false, readGate: null,
  };
}
export const fixture = globalThis.__sddFixture ?? createFixture();
globalThis.__sddFixture = fixture;

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: { user: fixture.user } } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
  },
  from(table) {
    if (table !== 'app_data') throw new Error(`Tabla inesperada: ${table}`);
    const filters = {};
    return {
      select() { return this; },
      eq(key, value) { filters[key] = value; return this; },
      async maybeSingle() {
        fixture.reads.push({ ...filters });
        if (fixture.readGate) await fixture.readGate;
        if (filters.user_id !== fixture.user.id) throw new Error('Lectura sin propietario');
        return { data: Object.hasOwn(fixture.data, filters.key) ? { value: fixture.data[filters.key] } : null, error: null };
      },
      async upsert(payload, options) {
        fixture.writes.push({ payload: structuredClone(payload), options });
        if (payload.user_id !== fixture.user.id) throw new Error('Escritura sin propietario');
        if (fixture.failWrites) return { error: { message: 'Fallo simulado de guardado' } };
        fixture.data[payload.key] = structuredClone(payload.value);
        return { error: null };
      },
    };
  },
};
