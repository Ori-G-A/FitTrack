import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {clockFixtures,clockTimes,clockBundles,observeClockMount,hostWait} from '../test-support/clock-state-fixtures.js';
test.setTimeout(120000);test.beforeAll(async()=>clockBundles());
function save(name,rows){mkdirSync('test-results',{recursive:true});writeFileSync('test-results/clock009-observations-'+name+'.json',JSON.stringify(rows,null,2)+'\n');}
function record(m){return {...m.state,error:m.error?.message};}
function requireReady(m){if(m.error)throw m.error;expect(m.state.ready).toBe(true);expect(m.state.beforeApp.date).toBe(Date.parse(clockTimes[m.state.fixture]));}
function mountedTime(fixture){return Date.parse(clockTimes[fixture])+(fixture==='guardado'?600:0);}
function failAll(errors){if(errors.length)throw new AggregateError(errors,'FR-004/005: preparación incumplida: '+errors.map(e=>e.message).join(' | '));}

test('reloj009 conserva fechas datos y red de tres montajes',async({browser})=>{
 const rows=[],errors=[];
 for(const fixture of clockFixtures){const m=await observeClockMount(browser,fixture);try{
  requireReady(m);expect(await m.page.evaluate(()=>Date.now())).toBe(mountedTime(fixture));
  const data=await m.page.evaluate(()=>({reads:__sddFixture.reads,user:__sddFixture.user.id,weights:__sddFixture.data.weights,writes:__sddFixture.writes.length}));
  expect(data.user).toBe('sdd-user-001');expect(data.reads.length).toBeGreaterThanOrEqual(12);expect(data.reads.every(r=>r.user_id==='sdd-user-001')).toBe(true);
  if(fixture==='interfaz')expect(data.weights[0].kg).toBe(70);
  if(fixture==='guardado')expect(data.writes).toBeGreaterThanOrEqual(12);
  expect(await m.page.evaluate(async()=>{try{await fetch('https://blocked.invalid/clock009');return false;}catch{return true;}})).toBe(true);
  rows.push({...record(m),preserved:true});
 }catch(error){rows.push({...record(m),assertion:error.message});errors.push(error);}finally{await m.close();}}
 save('asis',rows);failAll(errors);
});

test('reloj009 demora de preparacion conserva instante y reloj detenido',async({browser})=>{
 const rows=[],errors=[];
 for(const fixture of clockFixtures)for(const delayMs of [0,250,1500]){
  const m=await observeClockMount(browser,fixture,{delayMs});try{
   requireReady(m);const now=await m.page.evaluate(()=>Date.now());await hostWait(60);expect(await m.page.evaluate(()=>Date.now())).toBe(now);
   rows.push({...record(m),passed:true});
  }catch(error){rows.push({...record(m),passed:false,assertion:error.message});errors.push(error);}finally{await m.close();}
 }
 save('matrix',rows);failAll(errors);
});

test('reloj009 host no consume plazos antes ni despues del montaje',async({browser})=>{
 const rows=[],errors=[];
 for(const fixture of clockFixtures){const m=await observeClockMount(browser,fixture,{delayMs:250});try{
  requireReady(m);const before=await m.page.evaluate(()=>({date:Date.now(),writes:__sddFixture.writes.length}));
  if(fixture==='interfaz'){await m.page.evaluate(()=>__interfaceToast('Control temporal 009'));await expect(m.page.locator('.ft-toast')).toHaveText('Control temporal 009');}
  if(fixture==='borrado')await expect(m.page.getByRole('alert')).toBeVisible();
  if(fixture==='guardado')await expect(m.page.getByRole('status')).toHaveText('Error al guardar');
  await m.page.evaluate(()=>{globalThis.__clock009Timer=0;setTimeout(()=>__clock009Timer++,10);});await hostWait(250);
  expect(await m.page.evaluate(()=>Date.now())).toBe(before.date);expect(await m.page.evaluate(()=>__clock009Timer)).toBe(0);
  expect(await m.page.evaluate(()=>__sddFixture.writes.length)).toBe(before.writes);
  await m.page.clock.runFor(9);expect(await m.page.evaluate(()=>__clock009Timer)).toBe(0);await m.page.clock.runFor(1);expect(await m.page.evaluate(()=>__clock009Timer)).toBe(1);
  if(fixture==='interfaz'){await m.page.clock.runFor(2589);await expect(m.page.locator('.ft-toast')).toBeVisible();await m.page.clock.runFor(1);await expect(m.page.locator('.ft-toast')).toHaveCount(0);}
  rows.push({...record(m),passed:true});
 }catch(error){rows.push({...record(m),passed:false,assertion:error.message});errors.push(error);}finally{await m.close();}}
 save('host',rows);failAll(errors);
});

test('reloj009 fallos de preparacion y montaje se registran sin ocultarlos',async({browser})=>{
 const rows=[];
 for(const fixture of clockFixtures)for(const failAt of ['clock.install','app.inject']){
  const m=await observeClockMount(browser,fixture,{failAt});try{
   expect(m.error).toBe(m.sentinel);expect(m.state.ready).toBe(false);expect(m.state.stage).toBe(failAt);expect(m.state.scriptsInjected).toBe(0);rows.push({...record(m),expectedRejection:true});
  }finally{await m.close();}
 }
 save('errors',rows);
});

test('reloj009 contextos independientes conservan su origen',async({browser})=>{
 const rows=[],errors=[];
 for(const fixture of clockFixtures){let first,second;try{
  first=await observeClockMount(browser,fixture);requireReady(first);await first.page.evaluate(()=>{globalThis.__clock009Marker='solo primero';});await first.page.clock.runFor(1234);
  second=await observeClockMount(browser,fixture);requireReady(second);expect(await second.page.evaluate(()=>globalThis.__clock009Marker)).toBeUndefined();
  expect(await second.page.evaluate(()=>Date.now())).toBe(mountedTime(fixture));expect(await first.page.evaluate(()=>Date.now())).toBe(mountedTime(fixture)+1234);rows.push({fixture,independent:true});
 }catch(error){errors.push(error);rows.push({fixture,error:error.message});}finally{await first?.close();await second?.close();}}
 save('contexts',rows);failAll(errors);
});
