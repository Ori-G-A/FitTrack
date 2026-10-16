import { build } from 'esbuild';
import vm from 'node:vm';

export async function configuredClient(env, createClient) {
  const result = await build({
    entryPoints: ['src/supabase.js'], bundle: true, write: false,
    format: 'iife', globalName: 'subject', platform: 'browser', metafile: true,
    define: { 'import.meta.env': JSON.stringify(env) },
    plugins: [{ name: 'sdk-boundary-only', setup(builder) {
      builder.onResolve({ filter: /^@supabase\/supabase-js$/ }, () => ({ path: 'sdk', namespace: 'synthetic' }));
      builder.onLoad({ filter: /.*/, namespace: 'synthetic' }, () => ({ contents: 'export const createClient = (...args) => globalThis.createClient(...args);' }));
    } }],
  });
  if (Object.keys(result.metafile.inputs).some(path => path.includes('node_modules'))) throw new Error('SDK real entró en prueba de configuración');
  return vm.runInNewContext(`${result.outputFiles[0].text}\nsubject`, { createClient, URL, Error });
}
