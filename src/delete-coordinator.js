import {deleteUserData} from './app-data-lifecycle.js';

// Un coordinador por raíz; actor, efectos y carga son dependencias explícitas.
export function createDeleteCoordinator(effects) {
  let actor = Object.freeze({userId: null, generation: 0});
  let active = true, sequence = 0, attempt = null;
  const listeners = new Set();
  const idle = () => ({userId: actor.userId, generation: actor.generation,
    blocked: false, busy: false, error: false, phase: 'idle',
    deleteDispatched: false, dataDeleted: false, recoveryId: null});
  let snapshot = Object.freeze(idle());
  const publish = value => {
    snapshot = Object.freeze({...snapshot, ...value});
    listeners.forEach(listener => listener());
  };
  const matches = origin => active && origin === actor;
  const current = item => attempt === item && matches(item.actor);
  // El motivo de un rechazo puede ser falsy; el estado no depende de su valor.
  const failure = item => {
    if (!current(item)) return;
    publish({busy: false, error: true, recoveryId: null});
  };
  function setActor(userId) {
    userId = userId || null;
    if (actor.userId === userId) return actor;
    actor = Object.freeze({userId, generation: actor.generation + 1});
    attempt = null;
    publish(idle());
    return actor;
  }
  function start() {
    if (!active || !actor.userId) return Promise.reject(new Error('No hay una sesión activa'));
    if (attempt) return attempt.promise;
    const item = {id: ++sequence, actor, promise: null, recovery: null};
    attempt = item;
    publish({blocked: true, busy: true, error: false, phase: 'waiting',
      deleteDispatched: false, dataDeleted: false, recoveryId: null});
    item.promise = deleteUserData({...effects, userId: actor.userId,
      isCurrent: () => current(item),
      onPhase: phase => {
        if (!current(item)) return;
        publish({phase, ...(phase === 'deleting' ? {deleteDispatched: true} : {}),
          ...(phase === 'closing' ? {dataDeleted: true} : {})});
      },
    }).then(() => {if (current(item)) publish({busy: false, phase: 'closed'});})
      .catch(error => {if (current(item)) {failure(item); throw error;}});
    return item.promise;
  }
  function recover() {
    const item = attempt;
    if (!item || !current(item) || snapshot.deleteDispatched || !snapshot.error) return Promise.resolve();
    if (snapshot.busy) return item.recovery || item.promise;
    const token = ++sequence;
    publish({busy: true, phase: 'recovering', recoveryId: null});
    item.recovery = Promise.resolve().then(() => {
      if (!current(item)) return false;
      return effects.reload({actor: item.actor, isCurrent: () => current(item), token});
    }).then(success => {
      if (!current(item)) return;
      if (!success) throw new Error('No se pudieron recargar los datos');
      // Sigue bloqueado hasta que el adaptador confirme el commit de esos valores.
      publish({phase: 'ready', recoveryId: token});
      return token;
    }).catch(error => {if (current(item)) {failure(item); throw error;}});
    return item.recovery;
  }
  function confirmRecovery(token) {
    const item = attempt;
    if (!item || !current(item) || snapshot.phase !== 'ready' || snapshot.recoveryId !== token) return false;
    effects.resumeUserSaves(item.actor.userId);
    attempt = null;
    publish(idle());
    return true;
  }
  function retryClose() {
    const item = attempt;
    if (!item || !current(item) || !snapshot.deleteDispatched || !snapshot.error) return Promise.resolve();
    if (snapshot.busy) return item.recovery || item.promise;
    publish({busy: true, phase: 'closing'});
    item.recovery = Promise.resolve().then(() => {
      if (!current(item)) return;
      return effects.signOut();
    }).then(result => {
      if (!current(item)) return;
      if (result?.error) throw result.error;
      publish({busy: false, error: false, phase: 'closed'});
    }).catch(error => {if (current(item)) {failure(item); throw error;}});
    return item.recovery;
  }
  function disconnect() {
    active = false;
    actor = Object.freeze({...actor, generation: actor.generation + 1});
    attempt = null;
    publish(idle());
  }
  return {start, recover, retryClose, confirmRecovery, setActor, disconnect,
    connect() {active = true;},
    getActor: () => actor, matches,
    isBlocked: () => snapshot.blocked,
    getSnapshot: () => snapshot,
    subscribe(listener) {listeners.add(listener); return () => listeners.delete(listener);},
  };
}
