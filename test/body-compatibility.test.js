import {approvedSavePinHash} from '../scripts/save-state-evidence.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo consumidores conservan fachadas fotos y contratos previos",async()=>{
const h=await mountBody({section:'medidas'});try{const a=h.modules.app,c=h.modules.cycle;for(const name of ['creatineWaterKg','lutealRetentionKg','slopePerDay','weightTrendHighlight','stepsToday','dayFeed'])assert.equal(typeof a[name],'function',name);for(const name of ['emptyMenstrualLog','normalizeMenstrualLog','inferCyclePhase','buildCycleStarts','cycleContext','dailyGuidance','getCycleInsights','summarizeCycles','symptomDistribution','phaseSegments','ovulationEstimate','recalculateCycleEstimates','buildCycleTimeline'])assert.equal(typeof c[name],'function',name);
 h.w.__bodyPhotoFailure=true;await h.call(h.b.addPhoto,{target:{files:[{}]}});assert.equal(h.state.photos.length,0);assert.equal(h.b.photoBusy,false);assert.match(h.b.photoErr,/simulada/);h.w.__bodyPhotoFailure=false;await h.call(h.b.addPhoto,{target:{files:[{}]}});assert.equal(h.state.photos.length,1);const photo=h.state.photos[0];assert.match(photo.storagePath,/body-user/);h.w.__bodyPhotoFailure=true;await h.call(h.b.delPhoto,photo);assert.equal(h.state.photos.length,1);assert.match(h.b.photoErr,/eliminar/);h.w.__bodyPhotoFailure=false;await h.call(h.b.delPhoto,photo);assert.equal(h.state.photos.length,0);
 const backup=a.validateBackup({weights:[weight('w',today,70)],measurements:[],wellness:[]},h.modules.config.DEFAULT_GOALS);assert.equal(backup.weights[0].kg,70);
 }finally{h.close();}
 const {readFile}=await import('node:fs/promises'),{createHash}=await import('node:crypto');const b=JSON.parse(await readFile('specs/004-nutricion-objetivos/evidence/baseline.json','utf8'));for(const pin of [...b.pins,...b.previousPinsVerified])assert.equal(createHash('sha256').update((await readFile(pin.file,'utf8')).replace(/\r\n/g,'\n')).digest('hex'),approvedSavePinHash(pin.file,pin.sha256),pin.file);

});
