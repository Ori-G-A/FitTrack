// Instancia única en la fachada productiva; instancias independientes en pruebas.
export function createSaveCoordinator(persist, logger = console) {
  const saveBus = { status: 'idle', error: null, at: null, pending: 0, listeners: new Set() };
  const saveQueues = new Map();
  const suspendedUsers = new Set();
  function emitSave(status, error = null) {
    saveBus.status = status;
    saveBus.error = error;
    saveBus.at = Date.now();
    saveBus.listeners.forEach(listener => listener({ status, error }));
  }
  function onSaveStatus(callback) {
    saveBus.listeners.add(callback);
    return () => saveBus.listeners.delete(callback);
  }
  async function persistKey(userId, key, value) {
    if (saveBus.pending === 0) saveBus.error = null;
    saveBus.pending += 1;
    emitSave('saving');
    try {
      await persist(userId, key, value);
    } catch (error) {
      logger.error('saveKey', key, error);
      saveBus.error = error.message || 'Error al guardar';
    } finally {
      saveBus.pending = Math.max(0, saveBus.pending - 1);
      if (saveBus.pending === 0) emitSave(saveBus.error ? 'error' : 'saved', saveBus.error);
    }
  }
  function saveKey(userId, key, value) {
    if (!userId) {
      emitSave('error', 'Sin sesion activa');
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
  return { onSaveStatus, saveKey, waitForUserSaves, suspendUserSaves, resumeUserSaves };
}
