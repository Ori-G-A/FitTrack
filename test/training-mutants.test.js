import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTraining} from '../test-support/training-dom.js';
const cases=[
 ['sesion-vacia',async a=>{await a.call(a.train.writeSession,{durationMin:1});await a.call(a.train.writeSession,{durationMin:0});assert.equal(a.state.workouts.length,0);}],
 ['redondeo-timer',async a=>{await a.call(a.train.startT);await a.advance(90000);await a.call(a.train.commitT);assert.equal(a.train.session.durationMin,2);}],
 ['serie-registrada',async a=>{const es=[{id:'e',sets:[{reps:'8',kg:'20'},{reps:'',kg:'20'}]}];assert.equal(a.utils.applyAdjustments(es,[{id:'e',kg:40}])[0].sets[0].kg,'20');}],
];
test('entrenamiento mutaciones detectan contrato roto',async()=>{
 for(const [mutation,probe] of cases){
  const original=await mountTraining();try{await probe(original);}finally{original.close();}
  const mutated=await mountTraining({}, {}, {mutation});try{await assert.rejects(()=>probe(mutated),{name:'AssertionError'});}finally{mutated.close();}
 }
});
