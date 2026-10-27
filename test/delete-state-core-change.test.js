import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteUserData} from '../src/app-data-lifecycle.js';
const base={userId:'u',suspendUserSaves(){},waitForUserSaves:async()=>{},deleteUserPhotos:async()=>{},deleteAppData:async()=>{},signOut:async()=>({error:null}),resumeUserSaves(){},setLoaded(){}};

test('borrado008 cierre distingue retorno error y rechazo',async t=>{
 for(const mode of ['retorno','rechazo'])await t.test(mode,async()=>{
  const error=Error('fallo cierre '+mode);
  await assert.rejects(deleteUserData({...base,signOut:async()=>{if(mode==='rechazo')throw error;return {error};}}),e=>e===error,'FR-005: ambos resultados rechazan con el error original');
 });
});
test('borrado008 resultado de borrado no confirmado conserva bloqueo',async()=>{
 const error=Error('respuesta perdida'),loaded=[],resumed=[],events=[];
 await assert.rejects(deleteUserData({...base,setLoaded:v=>loaded.push(v),resumeUserSaves:id=>resumed.push(id),deleteAppData:async()=>{events.push('DELETE enviado');throw error;},signOut:async()=>events.push('signOut')}),e=>e===error);
 assert.deepEqual(loaded,[false],'FR-007/010: resultado incierto no reabre edición');assert.deepEqual(resumed,[],'FR-008: no se reactivan guardados');assert.deepEqual(events,['DELETE enviado']);
});
test('borrado008 no recrea datos tras fallo de cierre',async()=>{
 const original={weights:[{id:'anterior',kg:70}]};let rows=structuredClone(original);const loaded=[],writes=[];
 await assert.rejects(deleteUserData({...base,setLoaded:v=>loaded.push(v),deleteAppData:async()=>{rows={};},signOut:async()=>{throw Error('fallo cierre');},resumeUserSaves:()=>{writes.push(structuredClone(original));rows=structuredClone(original);}}),/fallo cierre/);
 assert.deepEqual(rows,{},'FR-008/010: no se reescribe el estado anterior tras borrar');assert.deepEqual(writes,[]);assert.deepEqual(loaded,[false]);
});
