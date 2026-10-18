import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function buildTraining({ mutation } = {}) {
  const result = await build({
    entryPoints: [resolve('test-support/training-entry.jsx')], bundle: true, write: false,
    format: 'iife', platform: 'browser', metafile: true,
    define: { 'process.env.NODE_ENV': '"development"', 'import.meta.env': '{}' },
    plugins: [{ name: 'training-original-callbacks', setup(builder) {
      builder.onResolve({ filter: /(?:^|\/)supabase\.js$/ }, () => ({ path: resolve('test-support/fake-supabase.js') }));
      builder.onLoad({ filter: /(?:FitTrack|TrainingScreen|SessionScreen|LibraryScreen|PlanScreen)\.jsx$|app-utils\.js$|training-records\.js$/ }, async ({ path }) => {
        let source = await readFile(path, 'utf8');
        if (source.includes('  if (inSession && exercises.length > 0)')) {
          source = source.replace('  if (inSession && exercises.length > 0)', `  globalThis.__training = { date, session, exercises, cardio, durInput, tSec, tRun, lastPerformance, totalVol, totalSets, avgRpe, phaseCaution,
            setDate, setName, setPrimary, setSecondary, setCardio, setDurInput, setInSession,
            writeSession, addExercise, addExercisesFromList, loadRoutine, loadMinimal, minimalFor, minimalMin, loadWarmup,
            editSet, addSet, delSet, delEx, delExEverywhere, addCardio, delCardio, setExerciseLoad, saveDayAsRoutine,
            startT, pauseT, resetT, commitT, commitDuration };
          if (inSession && exercises.length > 0)`);
        }
        if (path.endsWith('SessionScreen.jsx')) source = source.replace('  const done = logged.length;', '  globalThis.__guided = { index, elapsed, draft, seed, advice, setDraft, setEditingSetId, register, addExtraSet, goTo };\n  const done = logged.length;');
        if (path.endsWith('LibraryScreen.jsx')) source = source.replace('  const counts = {', '  globalThis.__library = { open, setOpen, saveRoutine, loadTemplates };\n  const counts = {');
        if (path.endsWith('PlanScreen.jsx')) source = source.replace('  const rest = useMemo(', '  globalThis.__plan = { assign, week, number };\n  const rest = useMemo(');
        if (mutation === 'sesion-vacia' && source.includes('return empty ? others : [...others, next]')) source = source.replace('return empty ? others : [...others, next]', 'return [...others, next]');
        if (mutation === 'redondeo-timer' && source.includes('Math.round(tSec / 60)')) source = source.replaceAll('Math.round(tSec / 60)', 'Math.floor(tSec / 60)');
        if (mutation === 'serie-registrada' && source.includes('Number(s.reps) > 0 ? s :')) source = source.replace('Number(s.reps) > 0 ? s :', 'false ? s :');
        return { contents: source, loader: path.endsWith('.jsx') ? 'jsx' : 'js' };
      });
    } }],
  });
  if (Object.keys(result.metafile.inputs).some(p => /src[\\/]supabase\.js$/.test(p))) throw new Error('Cliente real prohibido');
  return result.outputFiles[0].text;
}
