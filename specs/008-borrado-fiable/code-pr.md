# PR de código 008 — preparación local completa

Estado vigente — 2026-10-27 (Bogotá): 008 integrada mediante #18/#19;
CI de main y Vercel Production verificados en `1f6b29d`.
[Entrega remota](evidence/integration.json). Las etapas siguientes conservan
la cronología local; sus esperas de autorización e integración están cumplidas.


Rama: codex/008-borrado-fiable. Dependencia: documental 2ee8edc. Publicación, integración y Vercel pendientes de autorización específica.
[Verificación](verification.md), [converge](converge.md), [checkpoint final](evidence/final.json).

Título: `fix(datos): conservar bloqueo y recuperación segura del borrado`.

## Cuerpo para el PR

Tras borrar registros, un fallo al cerrar sesión podía reactivar guardados del estado anterior; las respuestas tardías también podían afectar otra cuenta. El flujo mantiene el bloqueo por intento/sesión, distingue DELETE despachado de confirmado y conserva feedback en la raíz aunque Ajustes se desmonte.

Antes del despacho, ofrece recarga manual y reanuda solo después de aplicar los valores frescos. Después, permite reintentar únicamente el cierre, sin repetir fotos ni DELETE. La generación de sesión invalida A→B→A; los rechazos sin objeto Error también mantienen operativa la recuperación. Feedback visible, con controles accesibles, a 390/1280.

Validación local: 370 Node, 30 Chromium y build; ocho contratos/234 IDs completos, incluidos 29 de 008. RLS real fresco: tres contratos y limpieza confirmada; fixture anterior recuperado. Once mutaciones nuevas/heredadas detectadas con controles positivos y limpieza. 107 firmas anteriores intactas, PIN-008-001 explícita y ocho pins E0 intactos.

Converge añadió T037/T038 dentro del alcance; los suplementos se distinguen de E0 y T038 tiene rojo en candidato previo/verde posterior. Evidencia en specs/008-borrado-fiable/{verification,converge}.md y evidence/final.json.

SQL y dependencias conservados. Se mantiene el aviso de bundle >500 kB. No se promete rollback, cancelación de operaciones ya invocadas en el SDK ni continuidad tras recargar; no se certifica producción ni una sesión autenticada real.

Orden: integrar el documental primero y este código después, con CI remoto verde y autorización de Vercel. Reversión coordinada de código, adendas 001/006 y PIN-008-001; no restaura datos eliminados.
