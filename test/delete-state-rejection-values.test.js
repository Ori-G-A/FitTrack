import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeleteCoordinator} from '../src/delete-coordinator.js';
const reasons=[['undefined',undefined],['null',null],['false',false],['zero',0],['empty','']];
const rejected=promise=>promise.then(()=>({rejected:false}),reason=>({rejected:true,reason}));
function fixture(patch={}){return createDeleteCoordinator({suspendUserSaves(){},setLoaded(){},waitForUserSaves:async()=>{},deleteUserPhotos:async()=>{},deleteAppData:async()=>{},signOut:async()=>({error:null}),resumeUserSaves(){},reload:async()=>true,...patch});}

test('borrado008 rechazo sin Error permite recarga temprana',async t=>{
 for(const [label,reason] of reasons)await t.test(label,async()=>{
  let reads=0,resumes=0;const flow=fixture({deleteUserPhotos:()=>Promise.reject(reason),reload:async()=>{reads++;return true;},resumeUserSaves:()=>{resumes++;}});flow.setActor('a');const result=await rejected(flow.start());assert.equal(result.rejected,true);assert.equal(result.reason,reason,'FR-005: identidad original');assert.equal(flow.getSnapshot().error,true);
  const token=await flow.recover();assert.equal(reads,1,'FR-009: rechazo falsy también permite recarga manual');assert.equal(resumes,0,'FR-009: lectura no libera antes del commit');assert.equal(flow.confirmRecovery(token),true);assert.equal(resumes,1);assert.equal(flow.isBlocked(),false);
 });
});
test('borrado008 rechazo sin Error permite reintento solo de cierre',async t=>{
 for(const [label,reason] of reasons)await t.test(label,async()=>{
  let closes=0,deletes=0,photos=0;const flow=fixture({deleteUserPhotos:async()=>{photos++;},deleteAppData:async()=>{deletes++;},signOut:()=>++closes===1?Promise.reject(reason):Promise.resolve({error:null})});flow.setActor('a');const result=await rejected(flow.start());assert.equal(result.rejected,true);assert.equal(result.reason,reason);assert.equal(flow.getSnapshot().error,true);assert.equal(flow.getSnapshot().dataDeleted,true);
  await flow.retryClose();assert.equal(closes,2,'FR-010: rechazo falsy también permite cierre manual');assert.equal(deletes,1);assert.equal(photos,1);assert.equal(flow.getSnapshot().phase,'closed');assert.equal(flow.getSnapshot().error,false);
 });
});
