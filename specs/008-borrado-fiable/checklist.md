# Revisión del alcance 008

Estado vigente — 2026-10-27 (Bogotá): 008 integrada mediante #18/#19;
CI de main y Vercel Production verificados en `1f6b29d`.
[Entrega remota](evidence/integration.json). Las etapas siguientes conservan
la cronología local; sus esperas de autorización e integración están cumplidas.


Revisión documental del agente; alcance y aclaraciones aprobados por el propietario.

- [x] Resultado observable y frontera del borrado descritos.
- [x] Cuatro AS-IS y nueve CHANGE con IDs estables.
- [x] Dieciséis escenarios; manifiesto de 29 filas individuales pending.
- [x] Seis reproducciones sintéticas con Node 24.21.0, sin backend real y src intacto.
- [x] Diagnóstico diferenciado de G-PIN y de pruebas contractuales congeladas.
- [x] Dependencias DATA-006/007/008 del mismo flujo inventariadas junto a DATA-004/005.
- [x] Recuperación distingue despacho de DELETE, borrado confirmado y cierre fallido.
- [x] Pérdidas parciales, incertidumbre y ausencia de cancelación/rollback explícitas.
- [x] Adendas necesarias de 001/006 identificadas; sin modificar contratos ni pins.
- [x] Recuperación ordinaria, duplicados y cuenta A→B→A incluidos.
- [x] Exclusiones de SQL, algoritmos, reintentos automáticos y despliegues explícitas.
- [x] Alcance y C-001/002/003 aprobados por el propietario el 2026-10-22.
- [x] Plan, 36 tareas, decisiones y análisis preparados para revisión separada.
- [x] Plan/tareas/análisis aprobados por separado antes de implementar, el 2026-10-22.

Implementación local E0–E3 verificada, sin PR 008 publicado.
38 tareas completas; ocho contratos/234 IDs y RLS fresco con limpieza aprobados.
[Verificación](verification.md). No se hicieron commits de borradores como
etapas aprobadas ni se infirió aprobación desde el diagnóstico.
