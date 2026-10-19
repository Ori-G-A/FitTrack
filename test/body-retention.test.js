import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo peso conserva retencion detrending umbral y cap",async()=>{
const h=await mountBody();try{const a=h.modules.app;const dates=['2026-09-28','2026-09-29','2026-09-30','2026-10-16','2026-10-17',today],phase=d=>d<'2026-10-01'?'follicular_early':'luteal_late';const make=offset=>dates.map((d,i)=>weight('r'+i,d,i<3?70:70+offset));assert.equal(a.lutealRetentionKg(make(1).slice(1),phase),null);assert.equal(a.lutealRetentionKg(make(.1),phase),null);assert.equal(a.lutealRetentionKg(make(-1),phase),null);assert.equal(a.lutealRetentionKg(make(1.2),phase).kg,1.2);assert.equal(a.lutealRetentionKg(make(3),phase).kg,2.5);assert.equal(a.lutealRetentionKg(make(3),phase).capped,true);
 assert.equal(a.lutealRetentionKg(make(2.5),phase).capped,false);const small=make(0).map((w,i)=>({...w,kg:i<3?1:1.2}));assert.equal(a.lutealRetentionKg(small,phase),null);assert.equal(a.lutealRetentionKg(make(.2),phase).kg,.2);
 const descending=dates.map((d,i)=>weight('d'+i,d,70-a.daysBetween(dates[0],d)*.1+(i>=3?1:0)));assert.equal(a.lutealRetentionKg(descending,phase).kg,1);
 const input={weights:make(1.2),periods,menstrualLogs:[{date:'2026-10-10',bleedingLevel:'none'}]};assert.equal(h.modules.alerts.alertMetrics(input).lutealOffset.kg,1.2);assert.equal(h.modules.alerts.alertMetrics({...input,periods:periods.slice(1)}).lutealOffset,null);assert.equal(h.modules.alerts.alertMetrics({...input,goals:{sex:'hombre'}}).phaseByDate.size,0);
assert.equal(a.lutealRetentionKg(make(1).filter((_,i)=>i!==0&&i!==3),phase,2).kg,1);
 }finally{h.close();}
});
