import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
async function check(snippet){
 const layers=['src/delete-coordinator.js','src/app-data-lifecycle.js'];
 const result=await build({...snippet?{stdin:{contents:snippet,sourcefile:'__delete008_arch__.js',resolveDir:process.cwd()}}:{entryPoints:['src/delete-coordinator.js']},bundle:true,write:false,metafile:true,platform:'browser'});
 for(const file of Object.keys(result.metafile.inputs)){assert.ok([...layers,'__delete008_arch__.js'].includes(file.replaceAll('\\','/')),'Import prohibido '+file);const text=file==='__delete008_arch__.js'?snippet:readFileSync(file,'utf8');assert.doesNotMatch(text,/\b(?:document|window|localStorage)\s*[.\[]/,'DOM directo');}
}
test('borrado008 coordinador conserva limites de dependencias',async()=>{
 await check();await assert.rejects(check("import React from 'react';export const bad=React;"),/Import prohibido/);await assert.rejects(check("import {createClient} from '@supabase/supabase-js';export const bad=createClient;"),/Import prohibido/);await assert.rejects(check('export const bad=()=>document.title;'),/DOM directo/);
});
