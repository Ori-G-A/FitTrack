import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo ciclo conserva distribucion escalas bins y picos",async()=>{
const h=await mountBody();try{const c=h.modules.cycle;assert.equal(c.SYMPTOM_TRACKS.length,5);const bleed=c.SYMPTOM_TRACKS[0];for(const [level,value]of [['spotting',.25],['light',.5],['medium',.75],['heavy',1],['none',0]])assert.equal(bleed.value({bleedingLevel:level}),value);assert.equal(c.SYMPTOM_TRACKS[1].value({crampsLevel:20}),1);assert.equal(c.SYMPTOM_TRACKS[2].value({bloatingLevel:-1}),0);
 const rows=c.symptomDistribution({periods:[{date:'2026-10-01'}],menstrualLogs:[{date:'2026-10-02',crampsLevel:10},{date:'2026-10-03'},{date:'2026-10-06',crampsLevel:10}]});assert.equal(rows.length,1);assert.equal(rows[0].key,'cramps');assert.equal(rows[0].days,2);assert.equal(rows[0].peakDay,2);assert.equal(rows[0].bins.length,6);assert.equal(rows[0].bins[0],.5);assert.equal(rows[0].bins[1],1);assert.equal(c.symptomDistribution({periods:[],menstrualLogs:[]}).length,0);
const custom=c.symptomDistribution({periods:[{date:'2026-10-01'}],menstrualLogs:[{date:'2026-11-30',crampsLevel:10}],bins:2});assert.deepEqual(plain(custom[0].bins),[0,1]);
 }finally{h.close();}
});
