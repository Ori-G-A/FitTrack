import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo ciclo conserva ovulacion flujo calendario y confianza",async()=>{
const h=await mountBody();try{const c=h.modules.cycle;assert.equal(c.LUTEAL_LENGTH,14);assert.equal(c.ovulationEstimate({date:today}),null);assert.deepEqual(plain(c.ovulationEstimate({date:today,periods})),{date:'2026-10-07',cycleDay:15,source:'calendario',confidence:'medium'});
 for(const gap of [0,1,2,3]){const logs=[{date:'2026-10-05',cervicalFluid:'watery'},{date:h.modules.app.addDays('2026-10-05',gap),cervicalFluid:'dry'}];assert.equal(c.detectOvulationProbableDates(logs).size,gap<=2?1:0);}
 for(const [logs,confidence]of [[fertile,'high'],[fertile.slice(2),'medium'],[fertile.slice(2).map(x=>({...x,pelvicPain:'none'})),'low']]){const d=c.detectOvulationProbableDates(logs).get('2026-10-05');assert.equal(d.confidence,confidence);assert.match(d.reason,/Ultimo dia de flujo fertil/);}
 const e=c.ovulationEstimate({date:'2026-09-24',periods,menstrualLogs:fertile});assert.equal(e.date,'2026-10-05');assert.equal(e.source,'flujo');assert.equal(e.confidence,'high');assert.equal(c.ovulationEstimate({date:'2026-10-01',periods:[{date:'2026-10-01'},{date:'2026-10-05'}]}),null);
const tooOld=[{date:'2026-09-29',cervicalFluid:'dry'},{date:'2026-09-30',cervicalFluid:'creamy'},...['2026-10-01','2026-10-02','2026-10-03','2026-10-04'].map(date=>({date,cervicalFluid:'unknown'})),{date:'2026-10-05',cervicalFluid:'watery'},{date:'2026-10-06',cervicalFluid:'dry'}];assert.equal(c.detectOvulationProbableDates(tooOld).get('2026-10-05').confidence,'low');
 }finally{h.close();}
});
