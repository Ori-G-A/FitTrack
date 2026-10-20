import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {build,transform} from 'esbuild';
import {verifyInterfacePins} from '../scripts/interface-pins.js';

async function pureGraph(contents) {
 const result=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'interface-layer-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',define:{'import.meta.env':'{}'},logLevel:'silent'});
 for(const file of Object.keys(result.metafile.inputs)){
  if(file==='<define:import.meta.env>')continue;
  assert.doesNotMatch(file,/node_modules|supabase|app-utils|\.jsx$/,'dependencia impura '+file);
  const source=file==='interface-layer-fixture.js'?contents:await readFile(file,'utf8');
  const {code}=await transform(source,{minifyWhitespace:true,legalComments:'none'});
  assert.doesNotMatch(code,/\b(?:window|document|localStorage|sessionStorage|navigator|fetch|XMLHttpRequest|WebSocket)\b/,'API de navegador '+file);
 }
 const visiting=new Set(),done=new Set();
 function walk(file){assert(!visiting.has(file),'ciclo '+file);if(done.has(file))return;visiting.add(file);for(const edge of result.metafile.inputs[file]?.imports||[])if(result.metafile.inputs[edge.path])walk(edge.path);visiting.delete(file);done.add(file);}
 for(const file of Object.keys(result.metafile.inputs))walk(file);
}

test('interfaz navegacion pura y negativos transitivos',async()=>{
 await pureGraph('export * from "./src/app-navigation.js";');
 for(const source of ['export * from "react";','export * from "./src/app-utils.js";','export * from "./src/supabase.js";','export const read=()=>window.localStorage;'])await assert.rejects(()=>pureGraph(source),{name:'AssertionError'});
});

test('interfaz verifica todos los pins congelados de E0',async()=>{
 assert.equal(verifyInterfacePins().verified,101);
});

async function themeGraph(contents) {
 const result=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'interface-theme-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',define:{'import.meta.env':'{}'},logLevel:'silent'});
 for(const file of Object.keys(result.metafile.inputs)){
  if(file.startsWith('src/'))assert(['src/ui-theme.js','src/use-app-theme.js'].includes(file),'dependencia ajena al tema '+file);
  if(file.includes('node_modules'))assert.match(file,/node_modules\/(?:\.pnpm\/react@[^/]+\/node_modules\/)?react\//,'servicio externo al tema '+file);
 }
}

test('interfaz tema aislado y negativos de dependencias',async()=>{
 await themeGraph('export * from "./src/use-app-theme.js";');
 for(const source of ['export * from "./src/app-utils.js";','export * from "./src/supabase.js";','export * from "./src/body-metrics.js";'])await assert.rejects(()=>themeGraph(source),{name:'AssertionError'});
});

async function shellGraph(contents) {
 const result=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'interface-shell-fixture.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',define:{'import.meta.env':'{}'},logLevel:'silent'});
 const allowed=new Set(['src/AppNavigation.jsx','src/app-navigation.js','src/app-styles.js','src/ModalSheet.jsx']);
 for(const file of Object.keys(result.metafile.inputs)){
  if(file.startsWith('src/'))assert(allowed.has(file),'dependencia ajena al shell '+file);
  if(file.includes('node_modules'))assert.match(file,/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react|lucide-react)\//,'servicio externo al shell '+file);
 }
 const visiting=new Set(),done=new Set();
 function walk(file){assert(!visiting.has(file),'ciclo '+file);if(done.has(file))return;visiting.add(file);for(const edge of result.metafile.inputs[file]?.imports||[])if(result.metafile.inputs[edge.path])walk(edge.path);visiting.delete(file);done.add(file);}
 for(const file of Object.keys(result.metafile.inputs))walk(file);
}

test('interfaz shell presenta sin dominio ni servicios y sin ciclos',async()=>{
 await shellGraph('export * from "./src/AppNavigation.jsx"; export * from "./src/app-styles.js"; export { default as ModalSheet } from "./src/ModalSheet.jsx";');
 for(const source of ['export * from "./src/app-utils.js";','export * from "./src/supabase.js";','export * from "./src/body-metrics.js";','export * from "./src/data-sync.js";'])await assert.rejects(()=>shellGraph(source),{name:'AssertionError'});
});
