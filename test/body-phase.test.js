import {readFile} from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBody,plain} from '../test-support/body-dom.js';
import {today,periods,fertile,weight,blankWell} from '../test-support/body-fixtures.js';
test("cuerpo ciclo conserva precedencia fases y desconocido tardio",async()=>{
const h=await mountBody();try{const c=h.modules.cycle;const phase=(date,logs=[],ps=periods)=>c.inferCyclePhase({date,menstrualLogs:logs,periods:ps});
 const table=[['2026-09-23',[],'menstruation'],['2026-09-28',[],'follicular_early'],['2026-10-02',[],'follicular_mid_late'],['2026-10-05',fertile.slice(0,3),'fertile_window_probable'],['2026-10-05',fertile,'ovulation_probable'],['2026-10-06',fertile,'luteal_early'],['2026-10-09',fertile,'luteal_early'],['2026-10-10',fertile,'luteal_mid'],['2026-10-14',fertile,'luteal_mid'],['2026-10-18',[],'unknown'],['2026-10-18',[{date:today,bleedingLevel:'none'}],'luteal_late']];for(const [date,logs,want]of table)assert.equal(phase(date,logs).phase,want,date);
 for(const bleedingLevel of ['none','spotting'])assert.equal(phase('2026-09-24',[{date:'2026-09-24',bleedingLevel}]).phase,'follicular_early');assert.equal(phase('2026-09-24',[{date:'2026-09-24',bleedingLevel:'not_logged'}]).confidence,'medium');assert.equal(phase(today,[{date:today,bleedingLevel:'heavy',cervicalFluid:'watery'}]).confidence,'high');
 assert.equal(phase(today,[{date:today,breastSensitivity:2}]).phase,'unknown');assert.equal(phase(today,[{date:today,breastSensitivity:3}]).phase,'luteal_late');assert.equal(phase(today,[{date:'2026-10-08',bleedingLevel:'none'}]).phase,'luteal_late');assert.equal(phase(today,[{date:'2026-10-07',bleedingLevel:'none'}]).phase,'unknown');assert.equal(phase(today,[{date:'2026-10-11',bleedingLevel:'spotting'},{date:today,bleedingLevel:'none'}]).phase,'unknown');
 const result=c.inferCyclePhase({date:today,periods,menstrualLogs:[{date:today,bleedingLevel:'none'}],wellness:[{date:today,energy:0,sleep:0}]});assert(result.reason.includes('energia 0/5 y 0 h de sueno'));assert.equal(phase('2026-01-01',[],[]).confidence,'low');
const golden=JSON.parse(await readFile('test-support/body-golden.json','utf8'));for(const item of golden.phase)assert.deepEqual(plain(c.inferCyclePhase(item.input)),item.expected);
 }finally{h.close();}
});
