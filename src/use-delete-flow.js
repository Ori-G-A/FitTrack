import {useEffect,useLayoutEffect,useRef,useSyncExternalStore} from 'react';
import {createDeleteCoordinator} from './delete-coordinator.js';

export function useDeleteFlow(effects,loaded) {
  const reference = useRef(null);
  if (!reference.current) reference.current = createDeleteCoordinator(effects);
  const flow = reference.current;
  const state = useSyncExternalStore(flow.subscribe,flow.getSnapshot,flow.getSnapshot);
  useEffect(() => {
    flow.connect();
    return () => flow.disconnect();
  },[flow]);
  useLayoutEffect(() => {
    if (loaded && state.phase === 'ready') flow.confirmRecovery(state.recoveryId);
  },[flow,loaded,state.phase,state.recoveryId]);
  return {flow,state};
}
