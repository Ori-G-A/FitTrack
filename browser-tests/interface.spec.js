import {test,expect} from '@playwright/test';
import {buildInterface} from '../test-support/interface-build.js';
import {buildHarness} from '../test-support/build-harness.js';
import {mountUi,go,uiSeed,today} from '../test-support/interface-browser.js';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
test.use({timezoneId:'America/Bogota'});test.setTimeout(90000);
let bundle;test.beforeAll(async()=>bundle=await buildInterface());

test('interfaz navegador raices registrar y fechas',async({page})=>{
 await mountUi(page,bundle);
 for(const width of [390,720,721,1280]){
  await page.setViewportSize({width,height:900});const bar=page.locator(width<=720?'.ft-tabbar':'.ft-nav');
  for(const [name,tab]of [['Plan','plan'],['Métricas','dashboard'],['Biblioteca','biblioteca'],['Diario','diario']]){await bar.getByRole('button',{name,exact:true}).click();await expect.poll(()=>page.evaluate(()=>__interfaceApp.tab)).toBe(tab);await expect(bar.locator('.active')).toHaveText(name);}
  await bar.locator(width<=720?'.add':'.ft-nav-add').click();await expect(page.locator('.ft-sheet-row')).toHaveCount(5);await page.locator('.ft-sheet-panel').click({position:{x:100,y:10}});await expect(page.locator('.ft-sheet')).toBeVisible();await page.getByRole('button',{name:'Cerrar',exact:true}).click();
 }
 await page.setViewportSize({width:1280,height:900});await go(page,'diario');
 const side=page.locator('.ft-side');await page.getByLabel('Buscar en el diario').focus();await page.mouse.move(500,200);await expect.poll(()=>side.evaluate(el=>Math.round(el.getBoundingClientRect().width))).toBe(56);await page.locator('.ft-side-logo').hover();await expect.poll(()=>side.evaluate(el=>Math.round(el.getBoundingClientRect().width))).toBe(232);await page.mouse.move(500,200);await expect.poll(()=>side.evaluate(el=>Math.round(el.getBoundingClientRect().width))).toBe(56);await page.locator('.ft-side-logo').focus();await expect.poll(()=>side.evaluate(el=>Math.round(el.getBoundingClientRect().width))).toBe(232);await page.getByLabel('Buscar en el diario').fill('69 kg');await page.locator('.ft-dc-row').filter({hasText:'69 kg'}).click();await expect(page.locator('input[type=date]').first()).toHaveValue('2026-10-17');await page.locator('.ft-nav button[title=Diario]').click();await page.locator('.ft-nav-add').click();await page.locator('.ft-sheet-row').filter({hasText:'báscula del día'}).click();await expect(page.locator('input[type=date]').first()).toHaveValue(today);
 await page.evaluate(()=>__interfaceApp.setGoals(g=>({...g,sex:'mujer'})));await page.locator('.ft-nav-add').click();await expect(page.locator('.ft-sheet-row')).toHaveCount(6);await page.locator('.ft-sheet-row').filter({hasText:'Check-in de ciclo'}).click();await expect(page.getByRole('button',{name:'Guardar ciclo'})).toBeVisible();
});

test('interfaz navegador cuenta cuerpo y plan',async({page})=>{
 await mountUi(page,bundle);await page.locator('.ft-user').click();await page.getByRole('button',{name:'DATOS Y CONFIGURACIÓN',exact:true}).click();await expect(page.getByRole('button',{name:'Elegir archivo'})).toBeVisible();await go(page,'perfil');await expect(page.getByRole('button',{name:'DATOS Y CONFIGURACIÓN',exact:true})).toHaveClass('on');
 await go(page,'diario');await go(page,'ajustes');await expect(page.getByRole('button',{name:'DATOS Y CONFIGURACIÓN',exact:true})).toHaveClass('on');
 for(const tab of ['cuerpo','peso','medidas','nota']){await go(page,tab,'2026-10-17');await expect(page.getByRole('heading',{name:'Cuerpo',exact:true})).toBeVisible();await expect(page.locator('input[type=date]').first()).toHaveValue('2026-10-17');}
 await go(page,'peso');await page.locator('input[inputmode=decimal]').fill('64,2');await go(page,'medidas');await go(page,'peso');await expect(page.locator('input[inputmode=decimal]')).toHaveValue('');
 await go(page,'plan');await page.locator('.ft-plan-week button').nth(5).click();await page.locator('button.ft-dc-row').filter({hasText:'69 kg'}).click();await expect(page.locator('input[type=date]').first()).toHaveValue('2026-10-17');
});

test('interfaz navegador diario busqueda y descartes',async({page})=>{
 await mountUi(page,bundle);const query=page.getByLabel('Buscar en el diario');await query.fill('69 kg');await expect(page.locator('.ft-dc-row').filter({hasText:'69 kg'})).toHaveCount(1);await page.locator('.ft-dc-chips').getByRole('button',{name:'PESO',exact:true}).click();await expect(page.locator('.ft-dc-row').filter({hasText:'69 kg'})).toHaveCount(0);await page.getByLabel('Limpiar búsqueda').click();await expect(page.locator('.ft-dc-chips').getByRole('button',{name:'PESO',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.evaluate(()=>__interfaceApp.setGoals(g=>({...g,sex:'mujer',dismissedAlerts:{other:'2026-10-01'}})));const dismiss=page.locator('.ft-dc-x');await expect(dismiss.first()).toBeVisible();const count=await dismiss.count();await dismiss.first().click();await expect(dismiss).toHaveCount(count-1);expect(await page.evaluate(()=>Object.values(__interfaceApp.goals.dismissedAlerts))).toContain(today);await page.getByRole('button',{name:/Descartado.*DESHACER/}).click();await expect(dismiss).toHaveCount(count);expect(await page.evaluate(()=>__interfaceApp.goals.dismissedAlerts)).toEqual({other:'2026-10-01'});
});

test('interfaz navegador metricas tarjeta y desglose',async({page})=>{
 await mountUi(page,bundle);await go(page,'dashboard');await expect(page.locator('#card-peso')).toBeVisible();await page.evaluate(()=>__interfaceApp.openCard('peso'));await expect(page.locator('#card-peso')).toHaveClass(/ft-dc-focus/);// FR-008/024: la aserción temporal se conserva íntegra en interface-highlight.spec.js como CHANGE rojo; no se impone al AS-IS.
 await expect.poll(()=>page.evaluate(()=>__interfaceApp.focusCard)).toBe(null);
 await page.locator('.ft-kpi').first().click();await expect(page.getByRole('dialog')).toBeVisible();const title=await page.getByRole('dialog').getAttribute('aria-label');expect(title).toBeTruthy();await page.locator('.ft-sheet-panel').click({position:{x:80,y:10}});await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Cerrar',exact:true}).click();await expect(page.locator('.ft-sheet')).toHaveCount(0);
 await page.locator('.ft-dc-chips').getByRole('button',{name:'FUERZA',exact:true}).click();await expect(page.locator('#card-peso')).toHaveCount(0);await page.evaluate(()=>__interfaceApp.openCard('peso'));await expect(page.locator('.ft-dc-chips').getByRole('button',{name:'TODO',exact:true})).toHaveClass('on');await expect(page.locator('#card-peso')).not.toHaveClass(/ft-dc-focus/);
});

test('interfaz navegador temas carga y errores',async({page})=>{
 await mountUi(page,bundle,{pref:'auto',gate:true});await expect(page.getByText('Cargando Diario…',{exact:true})).toBeVisible();await page.evaluate(()=>__releaseInterfaceLazy());await expect(page.getByRole('heading',{name:'Diario',exact:true})).toBeVisible();await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.locator('.ft-user').click();await page.getByRole('button',{name:'DATOS Y CONFIGURACIÓN',exact:true}).click();await page.getByRole('button',{name:'Claro',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');expect(await page.evaluate(()=>localStorage.getItem('ft-theme'))).toBe('light');await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.evaluate(()=>{__interfaceToast('Primero');});await expect(page.getByRole('status')).toHaveText('Primero');await page.clock.runFor(2000);await page.evaluate(()=>__interfaceToast('Segundo'));await page.clock.runFor(600);await expect(page.getByRole('status')).toHaveText('Segundo');await page.clock.runFor(2000);await expect(page.getByRole('status')).toHaveCount(0);
 await page.evaluate(()=>__interfaceRender({mode:'error'},true));await expect(page.getByRole('heading',{name:'FitTrack no pudo mostrar esta pantalla'})).toBeVisible();await expect(page.getByRole('button',{name:'Recargar'})).toBeVisible();
});

test('interfaz navegador responsive geometria y tacto',async({page})=>{
 const foods=Array.from({length:150},(_,i)=>({id:'f'+i,name:'Alimento '+String(i).padStart(3,'0'),kcal:100,protein:10,carbs:10,fat:2,unit:'g'}));
 // Dos sesiones permiten medir los filtros de fuerza reales del original.
 const workouts=[...uiSeed.workouts,{...uiSeed.workouts[0],id:'historical-strength',date:'2026-10-17'}];
 await mountUi(page,bundle,{seed:{...uiSeed,foods,workouts}});const actual=[];
 for(const width of [390,420,720,721,959,960,1280]){
  await page.setViewportSize({width,height:900});await go(page,'diario');await expect(page.getByRole('heading',{name:'Diario',exact:true})).toBeVisible();const row={width};row.shell=await page.evaluate(()=>Object.fromEntries(['.ft-side','.ft-tabbar'].map(s=>[s,getComputedStyle(document.querySelector(s)).display])));expect(row.shell['.ft-side']==='none').toBe(width<=720);expect(row.shell['.ft-tabbar']==='none').toBe(width>720);
  await go(page,'biblioteca');await expect(page.getByRole('button',{name:'Nuevo alimento',exact:true})).toBeVisible();await page.getByRole('button',{name:'Nuevo alimento',exact:true}).click();row.library=await page.evaluate(()=>({list:getComputedStyle(document.querySelector('.ft-lib-list')).display,detail:document.querySelector('.ft-lib-detail').getBoundingClientRect().width}));expect(row.library.list==='none').toBe(width<960);await page.getByRole('button',{name:'Cerrar',exact:true}).click();
  await go(page,'dashboard');await expect(page.locator('#card-peso')).toBeVisible();row.metrics=await page.evaluate(()=>({columns:getComputedStyle(document.querySelector('.ft-dc-grid')).gridTemplateColumns.split(' ').map(Number.parseFloat),card:document.querySelector('#card-peso').getBoundingClientRect().width,chart:document.querySelector('#card-peso .recharts-responsive-container')?.getBoundingClientRect().width||0}));actual.push(row);
 }
 await page.setViewportSize({width:390,height:900});await go(page,'peso');await expect(page.getByRole('button',{name:'Subir 0,1 kg'})).toBeVisible();const box=await page.getByRole('button',{name:'Subir 0,1 kg'}).boundingBox();expect(box.width).toBe(40);expect(box.height).toBe(40);await go(page,'biblioteca');await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await expect.poll(()=>page.locator('.ft-dc-head').evaluate(el=>Math.round(el.getBoundingClientRect().top))).toBe(0);

 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});await go(page,'entrenar');await page.locator('.ft-addset').first().click();await expect(page.locator('.ft-dc-step.sm').first()).toBeVisible();
  const controls=await page.evaluate(()=>Object.fromEntries(['.ft-dc-step.sm','.ft-trash','.ft-addset'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [s,{width:r.width,height:r.height}];})));
  if(width===390){expect(controls['.ft-dc-step.sm'].width).toBe(40);expect(controls['.ft-dc-step.sm'].height).toBe(40);expect(controls['.ft-trash'].width).toBeGreaterThanOrEqual(40);expect(controls['.ft-addset'].height).toBeGreaterThanOrEqual(40);}else{expect(controls['.ft-dc-step.sm'].width).toBe(26);expect(controls['.ft-dc-step.sm'].height).toBe(26);}
  await go(page,'dashboard');await expect(page.locator('#card-fuerza select')).toHaveCount(2);controls.filters=await page.locator('#card-fuerza select').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));if(width===390)for(const height of controls.filters)expect(height).toBeGreaterThanOrEqual(40);
  actual.push({kind:'controls',width,controls});
 }
 await page.evaluate(()=>{__interfaceApp.setWeights([]);__interfaceApp.setWorkouts([]);__interfaceApp.setNutrition([]);__interfaceApp.setMeasurements([]);__interfaceApp.setWellness([]);});
 for(const width of [390,420,720,721,959,960,1280]){await page.setViewportSize({width,height:900});await go(page,'diario');await expect(page.getByRole('heading',{name:'Diario',exact:true})).toBeVisible();actual.push({kind:'empty',width,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,grid:getComputedStyle(document.querySelector('.ft-dc-grid')).gridTemplateColumns}))});}
 if(process.env.SDD_INTERFACE_CAPTURE==='1'){expect(execFileSync('git',['diff','86299a4','--name-only','--','src','index.html'],{encoding:'utf8'}).trim()).toBe('');await writeFile('test-support/interface-geometry.json',JSON.stringify(actual,null,2)+'\n');}else{const original=JSON.parse(await readFile('test-support/interface-geometry.json','utf8'));expect(actual.length).toBe(original.length);function compare(a,b){if(typeof b==='number'){expect(Math.abs(a-b)).toBeLessThanOrEqual(1);return;}if(b&&typeof b==='object')for(const k of Object.keys(b))compare(a[k],b[k]);else expect(a).toEqual(b);}compare(actual,original);}
});

test('interfaz navegador sesion biblioteca nutricion y previews',async({page,context})=>{
 await mountUi(page,bundle);await go(page,'entrenar');await expect(page.getByRole('heading',{name:'Entrenar',exact:true})).toBeVisible();await page.getByRole('button',{name:'Seguir sesión',exact:true}).click();await expect(page.locator('.ft-root')).toHaveClass(/ft-focus/);await page.getByRole('button',{name:'Salir',exact:true}).click();await expect(page.locator('.ft-root')).not.toHaveClass(/ft-focus/);
 await go(page,'nutricion');await page.getByRole('button',{name:'Añadir comida',exact:true}).click();await expect(page.getByRole('heading',{name:'Añadir comida'})).toBeVisible();await page.getByRole('button',{name:'Cerrar',exact:true}).click();await expect(page.getByRole('heading',{name:'Nutrición',exact:true})).toBeVisible();
 for(const entry of ['src/preview-main.jsx','preview/maqueta.jsx']){const p=await context.newPage();try{await p.route('**/*',r=>r.abort());await p.setContent('<div id="root"></div>');await p.addScriptTag({content:await buildHarness({entry,capturePreview:true})});await expect(p.locator('.ft-root')).toBeVisible();if(entry.startsWith('src/')){
 const top=p.locator('.ft-wrap > div').first();
 for(const name of ['Diario','Entrenar','Nutrición','Cuerpo','Plan','Biblioteca','Métricas','Cuenta','Sesión']){
  await top.getByRole('button',{name,exact:true}).click();
  if(name==='Cuenta')await expect(p.getByRole('button',{name:'DATOS Y CONFIGURACIÓN',exact:true})).toBeVisible();
  else if(name==='Sesión')await expect(p.getByRole('button',{name:'Salir',exact:true})).toBeVisible();
  else await expect(p.getByRole('heading',{name:name==='Biblioteca'?'Bibliotecas':name,exact:true})).toBeVisible();
 }
}else{
 for(const name of ['Diario','Entrenar','Cuerpo','Nutrición','Biblioteca','Rutinas','Dashboard','Ajustes']){
  await p.locator('.ft-nav button').filter({has:p.locator('span')}).filter({hasText:name}).click();
  await expect(p.locator('.ft-nav .active')).toHaveAttribute('title',name);
  if(['Nutrición','Biblioteca','Rutinas'].includes(name))await expect(p.getByText('Maqueta: Diario, Cuerpo, Entrenar y Ajustes traen datos de ejemplo.')).toBeVisible();
 }
}}finally{await p.close();}}
});
