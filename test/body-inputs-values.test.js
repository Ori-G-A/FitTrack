import test from 'node:test';
import assert from 'node:assert/strict';
import {parseBodyDecimal,validateWeightDraft,validateMeasurementsDraft,validateWellnessDraft} from '../src/body-inputs.js';
import {replaceWellnessRecord} from '../src/body-records.js';

test('cuerpo010 valores distinguen decimales vacios y errores',()=>{
 const fields=['kg','cintura','cadera','pecho','brazo','muslo','sleep','restingHr','steps'];
 for(const field of fields){const rule={required:field==='kg',allowZero:['sleep','steps'].includes(field)};
  for(const [input,expected]of [['65',65],['65.4',65.4],['65,4',65.4],['+65,4',65.4],['.5',.5],['5,',5],[' 65,4 ',65.4],['1,000',1],[1,1],[1e21,1e21],[Number.MAX_VALUE,Number.MAX_VALUE]]){const r=parseBodyDecimal(input,rule);assert.equal(r.valid,true,field+' '+input);assert.equal(r.value,expected);}
  for(const input of ['', '   ',null,undefined]){const r=parseBodyDecimal(input,rule);assert.equal(r.valid,!rule.required,field+' vacío');if(r.valid)assert.equal(r.value,null);}
  for(const input of [0,-0,'0','0,0','-0']){const r=parseBodyDecimal(input,rule);assert.equal(r.valid,rule.allowZero,field+' cero');if(r.valid)assert(r.value===0);}
  for(const input of [-1,'-0.1','x','1e2','0x10','1,2.3','1 000','1,2,3','NaN','Infinity','-Infinity','9'.repeat(309),NaN,Infinity,-Infinity,true,false,{},[]]){const r=parseBodyDecimal(input,rule);assert.equal(r.valid,false,field+' debe rechazar '+String(input));assert.equal(typeof r.error,'string');assert.equal('value'in r,false);}
 }
 assert.equal(validateWeightDraft('65,4').value,65.4);assert.equal(validateWeightDraft('-1').valid,false);assert.equal(validateWeightDraft('0').valid,false);
});

test('cuerpo010 validadores conservan borradores y null',()=>{
 const measures=Object.freeze({cintura:'72,5',cadera:' ',pecho:'90.25',brazo:'.5',muslo:'5,'});
 assert.deepEqual(validateMeasurementsDraft(measures),{valid:true,values:{cintura:72.5,cadera:null,pecho:90.25,brazo:.5,muslo:5}});assert.equal(measures.cintura,'72,5');
 const invalid=Object.freeze({...measures,cadera:'-1',muslo:'Infinity'}),bad=validateMeasurementsDraft(invalid);assert.equal(bad.valid,false);assert.deepEqual(Object.keys(bad.errors),['cadera','muslo']);assert.equal('values'in bad,false);assert.equal(invalid.cadera,'-1');
 const well=Object.freeze({sleep:'0',restingHr:'60,5',steps:'',energy:0,notes:'  nota intacta  '}),result=validateWellnessDraft(well);assert.deepEqual(result,{valid:true,values:{sleep:0,restingHr:60.5,steps:null}});assert.equal(well.notes,'  nota intacta  ');
 const prior=Object.freeze([{id:'other',date:'2026-10-17',sleep:7},{id:'old',date:'2026-10-18',steps:10},{id:'duplicate',date:'2026-10-18',steps:20}].map(Object.freeze));let ids=0;
 const saved=replaceWellnessRecord(prior,'2026-10-18',{...well,...result.values},()=>{ids++;return 'new';});assert.equal(ids,1);assert.equal(saved.length,2);assert.equal(saved[0],prior[0]);assert.deepEqual(saved[1],{id:'new',date:'2026-10-18',sleep:0,restingHr:60.5,steps:null,energy:null,notes:'nota intacta'});assert.equal(prior.length,3);
 const badWell=validateWellnessDraft(Object.freeze({...well,steps:'-1'}));assert.equal(badWell.valid,false);assert.equal('values'in badWell,false);
 for(const payload of [result.values,validateMeasurementsDraft(measures).values])for(const value of Object.values(payload))assert(value===null||Number.isFinite(value));
});
