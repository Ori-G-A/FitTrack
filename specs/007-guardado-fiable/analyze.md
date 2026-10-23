# Análisis cruzado 007

Estado: análisis inicial aprobado junto al plan el 2026-10-21 y converge local
completado. La tabla inicial conserva la revisión anterior a implementar.
[Spec](spec.md), [plan](plan.md), [tareas](tasks.md), [validación](validation-plan.md).
No es una revisión independiente de otro agente ni evidencia de ejecución.

| Control | Resultado |
| --- | --- |
| Alcance | Nueve FR (cuatro AS-IS, cinco CHANGE), doce escenarios; C-001/002/003 aprobadas |
| Trazabilidad | 21 filas, cada una con nombre de prueba previsto y tarea; todas pending |
| Dependencias | 24 tareas, sin referencias externas ni ciclos; implementación bloqueada por T010 |
| Rojo/verde | Cuatro pruebas AS-IS y seis CHANGE previstos; E0 7/14 IDs, E1 16/5, E2/E3 21/0 |
| Contratos previos | Adendas limitadas a 001 FR-004/006 y 006 FR-012; baseline y decisiones históricas intactas |
| Pins | Dos contradicciones identificadas y enmienda explícita propuesta; 99 archivos anteriores sin modificación prevista |
| Sesión | Snapshot actual durante render, filtro de usuario, resultado tardío y cleanup incluidos |
| UI | Una región, móvil/escritorio, medición real, ft-focus y siete anchos preservados |
| Seguridad | Sin credenciales/backend real; RLS local fresco obligatorio para cerrar |
| Gobierno | Alcance aprobado no autoriza plan; ejecución local y publicación tienen puertas separadas |

La tabla anterior describe la revisión previa a E0. La aprobación separada del
plan y la ejecución autorizada están en [aprobaciones](../../docs/sdd/approvals.md).
Los resultados posteriores se registran por etapa en [verificación](verification.md).

## Hallazgos resueltos en la planificación

- A-001: exigir todos los pins idénticos sería incompatible con corregir el
  defecto aprobado. T012 limita la enmienda a expectativas contradictorias y
  exige evidencia original/nueva; otros conflictos deben documentarse antes.
- A-002: un setState en effect podría pintar estado de la cuenta anterior.
  R-004 propone useSyncExternalStore y snapshots estables, con prueba de carrera.
- A-003: un indicador dentro del rail seguiría oculto en móvil. T016 lo ubica
  fuera y T017 preserva modo sesión; no se considera visible por existir en DOM.
- A-004: exigir replay en la suscripción heredada ampliaría el cambio de API.
  Se conserva esa forma y se añade getter para el consumidor por usuario.
- A-005: rojos nuevos no deben confundirse con una suite completa verde.
  E0/E1 registran selección por etapa y pendientes; E2/E3 usan descubrimiento ordinario.

No se identifican CRITICAL documentales abiertos después de estas decisiones.
Esto no anticipa G-PIN, resultados de tests ni aprobación del propietario.
La decisión pendiente es aprobar plan/tareas/análisis y autorizar E0–E3 local.

## Verificación documental ejecutada — 2026-10-21

24 tareas y grafo acíclico comprobados; 21 IDs únicos cruzados con el manifiesto,
todos pending y con pruebas/tareas previstas. El verificador rechaza las 21 filas
en modo completo, como corresponde antes de ejecutar. Se validaron 11 documentos,
92 enlaces locales y las 101 firmas heredadas. Diff de runtime, pruebas, SQL,
dependencias y constitución vacío respecto a main. No se reinstalaron dependencias
ni se ejecutó una suite de runtime para estos cambios documentales.

## Converge final

E0–E3 completadas localmente: 325 Node y 29 Chromium, sin skips/retries; build aprobado, siete contratos y 205 IDs completos sobre el mismo sourceHash. RLS local fresco: tres contratos reales y limpieza confirmada. Tres mutaciones detectadas con cuatro controles positivos. 97 de 101 archivos anteriores intactos, cuatro archivos con cinco enmiendas explícitas; seis archivos E0 intactos y prueba suplementaria de cambio de cuenta con rojo original/verde candidato.

La tabla inicial conserva el análisis documental previo; la evidencia vigente está
en [verificación](verification.md). Las tres tareas añadidas están cerradas.
La entrega remota se autorizó posteriormente y quedó integrada con CI y Production verificados.
