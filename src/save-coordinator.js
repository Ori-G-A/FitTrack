// Instancia única en la fachada productiva; instancias independientes en pruebas.
export function createSaveCoordinator(persist, logger = console) {
  const idle = Object.freeze({ status: 'idle', error: null });
  const users = new Map();
  const listeners = new Set();
  const saveQueues = new Map();
  const suspendedUsers = new Set();
  function stateFor(userId) {
    if (!users.has(userId)) users.set(userId, { pending: 0, errors: new Map(), snapshot: idle });
    return users.get(userId);
  }
  const getSaveStatus = userId => userId ? users.get(userId)?.snapshot || idle : idle;
  function emitSave(userId) {
    const state = stateFor(userId);
    const error = state.errors.size ? state.errors.values().next().value : null;
    const status = error !== null ? 'error' : state.pending > 0 ? 'saving' : 'saved';
    if (state.snapshot.status !== status || state.snapshot.error !== error) {
      state.snapshot = Object.freeze({ status, error });
    }
    for (const listener of listeners) {
      if (listener.userId === undefined || listener.userId === userId) listener.callback(state.snapshot);
    }
  }
  function onSaveStatus(callback, userId) {
    const listener = { callback, userId };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  async function persistKey(userId, key, value) {
    const state = stateFor(userId);
    state.pending += 1;
    emitSave(userId);
    try {
      await persist(userId, key, value);
      state.errors.delete(key);
    } catch (error) {
      logger.error('saveKey', key, error);
      state.errors.set(key, error?.message || 'Error al guardar');
    } finally {
      state.pending = Math.max(0, state.pending - 1);
      emitSave(userId);
    }
  }
  function saveKey(userId, key, value) {
    if (!userId) {
      for (const listener of listeners) {
        if (listener.userId === undefined) listener.callback({ status: 'error', error: 'Sin sesion activa' });
      }
      return Promise.resolve();
    }
    if (suspendedUsers.has(userId)) return Promise.resolve();
    const queueKey = `${userId}:${key}`;
    const previous = saveQueues.get(queueKey) || Promise.resolve();
    const next = previous.catch(() => {}).then(() => persistKey(userId, key, value));
    saveQueues.set(queueKey, next);
    next.finally(() => {
      if (saveQueues.get(queueKey) === next) saveQueues.delete(queueKey);
    });
    return next;
  }
  const waitForUserSaves = userId => Promise.allSettled(
    [...saveQueues.entries()].filter(([key]) => key.startsWith(`${userId}:`)).map(([, pending]) => pending),
  );
  const suspendUserSaves = userId => suspendedUsers.add(userId);
  const resumeUserSaves = userId => suspendedUsers.delete(userId);
  return { onSaveStatus, getSaveStatus, saveKey, waitForUserSaves, suspendUserSaves, resumeUserSaves };
}
