import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {build,transform} from 'esbuild';
import {bodyInputDigest} from '../scripts/body-inputs-pin-amendments.js';

async function pureGraph(contents){
 const result=await build({stdin:{contents,resolveDir:resolve('.'),sourcefile:'body-inputs-layer.js'},bundle:true,write:false,metafile:true,format:'esm',platform:'browser',logLevel:'silent'});
 const inputs=result.metafile.inputs;
 for(const file of Object.keys(inputs)){assert.doesNotMatch(file,/node_modules|supabase|\.jsx$/);const source=file==='body-inputs-layer.js'?contents:readFileSync(file,'utf8');const code=(await transform(source,{minifyWhitespace:true,legalComments:'none'})).code;assert.doesNotMatch(code,/\b(?:window|document|localStorage|sessionStorage|navigator|fetch|XMLHttpRequest|WebSocket)\b/);}
 const visiting=new Set(),done=new Set();const walk=file=>{assert(!visiting.has(file),'ciclo '+file);if(done.has(file))return;visiting.add(file);for(const edge of inputs[file]?.imports||[])if(inputs[edge.path])walk(edge.path);visiting.delete(file);done.add(file);};for(const file of Object.keys(inputs))walk(file);
}
test('cuerpo010 capas y alcance de fuente rechazan dependencias ajenas',async()=>{
 await pureGraph('export * from "./src/body-inputs.js";');
 for(const contents of ['export * from "react";','export * from "./src/supabase.js";','export const read=()=>window.localStorage;'])await assert.rejects(()=>pureGraph(contents));
 const inventory=JSON.parse(readFileSync('specs/010-entradas-cuerpo/evidence/original-inventory.json'));
 const before=new Map(inventory.sourceInventory.map(p=>[p.file,p.sha256]));
 const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','src'],{encoding:'utf8'}).trim().split(/\r?\n/))].sort();
 const verify=(paths,digest)=>{assert(inventory.sourceInventory.every(p=>paths.includes(p.file)));const changed=paths.filter(file=>!before.has(file)||digest(file)!==before.get(file));assert.deepEqual(changed,['src/BodyScreen.jsx','src/body-inputs.js','src/body-records.js']);};
 const digest=file=>bodyInputDigest(readFileSync(file,'utf8'));verify(files,digest);
 assert.throws(()=>verify([...files,'src/ajeno.js'].sort(),file=>file==='src/ajeno.js'?'fake':digest(file)));
 const unrelated=files.find(file=>!['src/BodyScreen.jsx','src/body-inputs.js','src/body-records.js'].includes(file));assert.throws(()=>verify(files,file=>file===unrelated?'fake':digest(file)));
 assert.throws(()=>verify(files.filter(file=>file!==unrelated),digest));
});
