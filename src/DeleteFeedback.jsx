import React,{useEffect,useRef} from 'react';

export default function DeleteFeedback({state,onRecover,onClose}) {
  const region = useRef(null);
  useEffect(() => {region.current?.focus();},[state.error,state.busy]);
  const progress = {
    waiting:'Esperando los guardados en curso…',photos:'Eliminando fotos…',
    deleting:'Eliminando registros…',closing:state.dataDeleted?'Datos eliminados. Cerrando sesión…':'Cerrando sesión…',
    recovering:'Recargando tus datos…',ready:'Aplicando los datos recién leídos…',
    closed:state.dataDeleted?'Datos eliminados. Sesión cerrada.':'Sesión cerrada.',
  };
  const failed = state.error && !state.busy;
  const message = state.dataDeleted
    ? 'Datos eliminados. No se pudo cerrar la sesión.'
    : state.deleteDispatched
      ? 'No se pudo confirmar el borrado de registros.'
      : 'No se pudo completar el borrado.';
  const detail = state.deleteDispatched
    ? 'Los guardados siguen bloqueados. Cierra esta sesión para continuar. No se repetirá el borrado.'
    : 'Puede haber fotos ya eliminadas. Recarga los datos antes de volver a editar; esto no restaura las fotos.';
  return <main className="ft-wrap" style={{maxWidth:640,padding:'40px 20px',boxSizing:'border-box'}}>
    <section ref={region} tabIndex={-1} role={failed?'alert':'status'} aria-label="Estado del borrado" style={{overflowWrap:'anywhere'}}>
      <h1 style={{fontSize:24,lineHeight:1.3,margin:'0 0 16px'}}>{failed?message:progress[state.phase]||'Preparando borrado…'}</h1>
      {state.error&&<p style={{lineHeight:1.6}}>{detail}</p>}
    </section>
    {state.error&&<button className="ft-btn" disabled={state.busy} onClick={state.deleteDispatched?onClose:onRecover} style={{marginTop:20,maxWidth:'100%'}}>
      {state.deleteDispatched?'Cerrar sesión':'Recargar datos'}
    </button>}
  </main>;
}
