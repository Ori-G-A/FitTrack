# PR documental 008 — preparación

Estado: título y cuerpo preparados; plan aprobado, sin PR publicado.
Se conservará un snapshot aprobado antes de implementar. No incluir en ese
snapshot evidencia de implementación futura como si ya estuviera ejecutada.

Título propuesto: `docs(sdd): especificar borrado fiable por sesión (008)`.

## Cuerpo propuesto

Este cuerpo describe el snapshot documental aprobado `2ee8edc`, anterior a
implementar. Sus estados pending son históricos. La ejecución posterior vive
en la rama de código y en [verificación](verification.md); no se mezcla con aquel snapshot.

El flujo actual puede perder el error al desmontar Ajustes, reactivar guardados
tras un borrado y aplicar efectos tardíos a otra sesión. La spec 008 define
feedback persistente y recuperación manual según si DELETE fue despachado,
aislando intentos por sesión sin prometer rollback ni reintentos automáticos.

Incluye alcance aprobado (4 AS-IS, 9 CHANGE, 16 escenarios), decisiones, plan
E0–E3 y 36 tareas. Propone caracterizar original, congelar ocho archivos,
enmendar explícitamente un pin contradictorio y cerrar ocho contratos/234 IDs
con RLS local fresco. El plan fue aprobado por separado el 2026-10-22.

Validación documental: IDs/nombres/tareas, enlaces y firmas efectivas existentes,
según [revisión](evidence/plan-review.json). El sondeo sintético tiene seis
reproducciones y no constituye G-PIN ni evidencia productiva. Todos los IDs 008
siguen pending; no hay cambios de src, SQL, dependencias o pruebas contractuales.

Orden futuro: documental aprobado primero, código después de converge completo
y CI remoto verde. La autorización local aprobada no permite publicar, fusionar
ni desplegar. El PR de código se preparará en T036 con evidencia real y límites.
Reversión futura: revert coordinado de código/adendas/pins, sin revertir datos.
