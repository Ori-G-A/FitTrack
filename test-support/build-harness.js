import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function buildHarness({ mutation } = {}) {
  const result = await build({
    entryPoints: [resolve('test-support/app-entry.jsx')], bundle: true,
    format: 'iife', platform: 'browser', write: false, metafile: true,
    define: { 'process.env.NODE_ENV': '"development"', 'import.meta.env': '{}' },
    plugins: [{
      name: 'sdd-test-boundaries',
      setup(builder) {
        builder.onResolve({ filter: /(?:^|\/)supabase\.js$/ }, () => ({ path: resolve('test-support/fake-supabase.js') }));
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
