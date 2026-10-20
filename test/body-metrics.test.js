import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo peso conserva medias correcciones tendencia y proyeccion",async()=>{
const h=await mountBody();try{const alerts=h.modules.alerts;const weights=[weight('a','2026-10-01',70),weight('b','2026-10-07',72),weight('c','2026-10-08',74)];const m=alerts.alertMetrics({weights,goals:{sex:'hombre',targetWeight:80}});assert.deepEqual(plain(m.maSeries).map(x=>x.media),[70,71,73]);assert.equal(m.currentMA,73);assert.equal(m.maSeriesForTrend,m.maSeries);assert(m.trend>0);assert(m.projection.weeks>0);assert.equal(alerts.alertMetrics({weights,goals:{sex:'hombre',targetWeight:60}}).projection.off,true);
 assert.equal(alerts.alertMetrics({weights:[weight('a',today,70)]}).trend,null);const future=alerts.alertMetrics({weights:[weight('a',today,70),weight('b','2027-01-01',72)]});assert(future.trend>0);const corrected=alerts.alertMetrics({weights,goals:{creatineStart:'2026-10-01'}});assert(corrected.maSeriesForTrend[2].media<corrected.maSeries[2].media);assert.equal(corrected.currentMA,73);
 const exact=alerts.alertMetrics({weights:[weight('x','2026-10-01',70),weight('y','2026-10-08',71)],goals:{sex:'hombre',targetWeight:73}});assert.equal(exact.projection.weeks,2);assert.equal(exact.projection.date,'1 de noviembre de 2026');
 const long=alerts.alertMetrics({weights:[weight('a','2026-10-01',70),weight('b',today,70.1)],goals:{sex:'hombre',targetWeight:100}});assert(long.projection.weeks>104);assert.equal(alerts.alertMetrics({weights:[weight('a','2026-10-01',70),weight('b',today,70.01)],goals:{targetWeight:80}}).projection,null);
const half=alerts.alertMetrics({weights:[weight('x','2026-10-01',70),weight('y','2026-10-08',71)],goals:{sex:'hombre',targetWeight:71.5}});assert.equal(half.projection.weeks,1);assert.equal(half.projection.date,'22 de octubre de 2026');
 }finally{h.close();}
});
