import { DEFAULT_GOALS } from '../src/app-config.js';

// Solo se incluye en bundles de prueba; ninguna credencial ni llamada de red.
export function createFixture() {
  return {
    user: { id: 'sdd-user-001', email: 'sdd@example.test' },
    data: { goals: { ...DEFAULT_GOALS, sex: 'hombre' } },
    reads: [], writes: [], events: [], storageFiles: [], failWrites: false, readGate: null,
    listeners: new Set(),
  };
}
export const fixture = Object.assign(createFixture(), globalThis.__sddFixture);
globalThis.__sddFixture = fixture;
fixture.emitSession = (user) => {
  fixture.user = user;
  fixture.listeners.forEach(listener => listener('SIGNED_IN', user ? { user } : null));
};

export const supabase = {
  auth: {
    getSession: async () => await fixture.onGetSession?.() ?? ({ data: { session: fixture.user ? { user: fixture.user } : null } }),
    signInWithPassword: async credentials => await fixture.onAuthenticate?.('login', credentials) ?? { error: null },
    signUp: async credentials => await fixture.onAuthenticate?.('register', credentials) ?? { error: null },
    onAuthStateChange: (listener) => {
      fixture.listeners.add(listener);
      return { data: { subscription: { unsubscribe() { fixture.listeners.delete(listener); } } } };
    },
    signOut: async () => { fixture.events.push('signOut'); return await fixture.onSignOut?.() ?? { error: null }; },
  },
  from(table) {
    if (table !== 'app_data') throw new Error(`Tabla inesperada: ${table}`);
    const filters = {};
    return {
      select() { return this; },
      eq(key, value) { filters[key] = value; return this; },
      delete() { return { eq: async (key, value) => {
        fixture.events.push('deleteData');
        fixture.deletedFilter = [key, value];
        return await fixture.onDelete?.(key, value) ?? { error: null };
      } }; },
      async maybeSingle() {
        fixture.reads.push({ ...filters });
        const overridden = await fixture.onRead?.({ ...filters });
        if (overridden !== undefined) return overridden;
        if (fixture.readGate) await fixture.readGate;
        if (!filters.user_id) throw new Error('Lectura sin propietario');
        const data = fixture.dataByUser?.[filters.user_id] ?? fixture.data;
        return { data: Object.hasOwn(data, filters.key) ? { value: data[filters.key] } : null, error: null };
      },
      async upsert(payload, options) {
        fixture.writes.push({ payload: structuredClone(payload), options });
        fixture.events.push(`write:${payload.key}`);
        const overridden = await fixture.onWrite?.(payload, options);
        if (overridden !== undefined) return overridden;
        if (payload.user_id !== fixture.user.id) throw new Error('Escritura sin propietario');
        if (fixture.failWrites) return { error: { message: 'Fallo simulado de guardado' } };
        fixture.data[payload.key] = structuredClone(payload.value);
        return { error: null };
      },
    };
  },
  storage: { from(bucket) {
    if (bucket !== 'progress-photos') throw new Error('Bucket inesperado');
    const call = async (kind, args, fallback) => {
      fixture.events.push(kind);
      return await fixture.onStorage?.(kind, ...args) ?? fallback();
    };
    return {
      createSignedUrl: (...args) => call('signPhoto', args, () => ({ data: { signedUrl: `https://signed.example/${args[0]}` }, error: null })),
      upload: (...args) => call('uploadPhoto', args, () => ({ error: null })),
      list: (...args) => call('listPhotos', args, () => ({ data: fixture.storageFiles.slice(args[1].offset, args[1].offset + args[1].limit), error: null })),
      remove: (...args) => call('removePhotos', args, () => { fixture.storageFiles = []; return { error: null }; }),
    };
  } },
};
