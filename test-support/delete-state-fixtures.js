import assert from 'node:assert/strict';
import {mountApp,waitFor,plain} from './app-dom.js';
import {deferred,settle} from './clock.js';
export {deferred,settle,waitFor,plain};
export const userA='sdd-user-001',userB={id:'sdd-user-002',email:'b@example.test'};
export const oldWeight={id:'solo-A',date:'2026-10-22',kg:70};
export const freshWeight={id:'fresco',date:'2026-10-24',kg:68};
export const rawError='secreto-backend-no-publicar-008';
export const flush=()=>new Promise(r=>setTimeout(r,40));
// Los callbacks pertenecen al doble: ninguna conexión a Supabase real.
export async function withDeleteApp(seed,run,options={}){
 const app=await mountApp(seed,options);
 try{await app.ready();await run(app);}finally{app.close();}
}
export function startDelete(app){return app.current.actions.deleteAllData().then(()=>null,e=>e);}
export function action(app,label,fr){
 const button=[...app.w.document.querySelectorAll('button')].find(b=>b.textContent.trim()===label);
 assert.ok(button,`${fr}: acción manual ${label} disponible`);assert.equal(button.disabled,false,`${fr}: acción operable`);button.click();return button;
}
export async function blockedSave(app,fr){
 const count=app.fixture.writes.length;await app.w.__sddSync.saveKey(userA,'probe008',[]);
 assert.equal(app.fixture.writes.length,count,`${fr}: el bloqueo impide nuevos guardados`);
}
export function fireRecovery(app,kind){
 Object.defineProperty(app.w.document,'visibilityState',{configurable:true,value:'visible'});
 if(kind==='visibility')app.w.document.dispatchEvent(new app.w.Event('visibilitychange'));
 else {assert.equal(app.intervals.size,1,'intervalo de doce horas capturado');[...app.intervals.values()][0].callback();}
}
