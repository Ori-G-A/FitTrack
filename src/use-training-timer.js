import { useEffect, useRef, useState } from "react";

// Los efectos conservan las dependencias y la carrera de carga AS-IS (TRAIN-001).
// Los puertos se componen en la pantalla y permanecen estables durante el montaje.
export function useTrainingTimer(userId, { loadKey, saveKey, now, setInterval, clearInterval, logError }) {
  // timer
  const [tSec, setTSec] = useState(0); const [tRun, setTRun] = useState(false); const tRef = useRef(null);
  // ponytail: el conteo se recalcula del reloj real (now()-startedAt) en cada tick,
  // no se acumula tick a tick — así un tab en background/pantalla bloqueada (donde el
  // navegador pausa setInterval) no hace que el tiempo registrado quede por detrás.
  const runRef = useRef({ startedAt: null, baseSec: 0 });
  useEffect(() => {
    (async () => {
      try {
        const t = await loadKey(userId, "timer", { running: false, baseSec: 0, startedAt: null });
        if (t.running && t.startedAt) {
          runRef.current = { startedAt: t.startedAt, baseSec: t.baseSec || 0 };
          setTSec(runRef.current.baseSec + Math.floor((now() - runRef.current.startedAt) / 1000));
          setTRun(true);
        } else { runRef.current = { startedAt: null, baseSec: t.baseSec || 0 }; setTSec(t.baseSec || 0); }
      } catch (error) { logError("loadTimer", error); }
    })();
    return () => clearInterval(tRef.current);
  }, [userId]);
  useEffect(() => {
    if (!tRun) { clearInterval(tRef.current); return; }
    const tick = () => setTSec(runRef.current.startedAt ? runRef.current.baseSec + Math.floor((now() - runRef.current.startedAt) / 1000) : runRef.current.baseSec);
    tick();
    tRef.current = setInterval(tick, 1000);
    return () => clearInterval(tRef.current);
  }, [tRun]);
  const startT = () => { runRef.current = { startedAt: now(), baseSec: tSec }; saveKey(userId, "timer", { running: true, startedAt: runRef.current.startedAt, baseSec: tSec }); setTRun(true); };
  const pauseT = () => { runRef.current = { startedAt: null, baseSec: tSec }; saveKey(userId, "timer", { running: false, startedAt: null, baseSec: tSec }); setTRun(false); };
  const resetT = () => { runRef.current = { startedAt: null, baseSec: 0 }; saveKey(userId, "timer", { running: false, startedAt: null, baseSec: 0 }); setTRun(false); setTSec(0); };
  return { tSec, tRun, startT, pauseT, resetT };
}
