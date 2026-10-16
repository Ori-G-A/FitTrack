import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function buildHarness({ mutation, capture = false, capturePreview = false, entry = 'test-support/app-entry.jsx' } = {}) {
  const result = await build({
    entryPoints: [resolve(entry)], bundle: true,
    format: 'iife', platform: 'browser', write: false, metafile: true,
    define: { 'process.env.NODE_ENV': '"development"', 'import.meta.env': '{}' },
    plugins: [{
      name: 'sdd-test-boundaries',
      setup(builder) {
        builder.onResolve({ filter: /(?:^|\/)supabase\.js$/ }, () => ({ path: resolve('test-support/fake-supabase.js') }));
        if (capturePreview) builder.onLoad({ filter: /(?:preview-main|maqueta)\.jsx$/ }, async ({ path }) => {
          const source = await readFile(path, 'utf8');
          const root = 'createRoot(document.getElementById("root")).render';
          if (!source.includes(root)) throw new Error('Raíz preview no encontrada');
          return { contents: source.replace(root, 'globalThis.__sddPreviewRoot = createRoot(document.getElementById("root")); globalThis.__sddPreviewRoot.render'), loader: 'jsx' };
        });
        if (capture) builder.onLoad({ filter: /FitTrack\.jsx$/ }, async ({ path }) => {
          const source = await readFile(path, 'utf8');
          const anchor = '  // Misma lectura que usa Ajustes:';
          if (!source.includes(anchor)) throw new Error('Punto de captura no encontrado');
          const captureCode = 'globalThis.__sddCapture?.({ actions: { deleteAllData, exportData, importData }, state: { workouts, weights, nutrition, foods, recipes, routines, measurements, wellness, periods, menstrualLogs, photos, goals, loaded, loadError }, setters: { setGoals, setWeights, setPhotos }, goTo }); useEffect(() => { globalThis.__sddCommitted = { loaded, loadError }; });\n';
          return { contents: source.replace(anchor, captureCode + anchor), loader: 'jsx' };
        });
        if (mutation === 'guardar-antes-de-cargar') {
          builder.onLoad({ filter: /data-sync\.js$/ }, async ({ path }) => {
            const source = await readFile(path, 'utf8');
            const original = 'if (!enabled || !userId) return undefined;';
            if (!source.includes(original)) throw new Error('Mutación no aplicable: revisar fixture');
            return { contents: source.replace(original, 'if (!userId) return undefined;'), loader: 'js' };
          });
        }
      },
    }],
  });
  if (Object.keys(result.metafile.inputs).some((path) => /(?:^|[\\/])src[\\/]supabase\.js$/.test(path))) {
    throw new Error('El cliente real entró en el harness');
  }
  return result.outputFiles[0].text;
}
