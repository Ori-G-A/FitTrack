# Tareas 007 — estado de guardado fiable

Estado: 27 tareas completadas localmente, incluidas tres añadidas por converge.
Los comandos, resultados, hashes y firmas se registrarán por entrega. Converge
solo añade tareas: no reescribir tareas completadas ni ocultar fallos.

| ID | Historia / requisitos | Entrega y resultado verificable | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T001 | US1–4; todos | E0: registrar aprobación del plan, BASE, Node 24.21.0 y pnpm 11.11.0; preparar snapshot documental y ejecución local autorizada | — | Completada E0 |
| T002 | US3; FR-001–004; US3-AS1/2/3 | E0: repetir Node/Chromium/build heredados sobre original y verificar 101 firmas con dos enmiendas 006 | T001 | Completada E0 |
| T003 | US1/2/3/4; todos | E0: crear fixtures sintéticas y harness 007 que no alcance cliente real; lista explícita de descubrimiento por etapa | T002 | Completada E0 |
| T004 | US3; FR-001; US3-AS1 | E0: pin de cola, concurrencia y referencia verde sobre original | T003 | Completada E0 |
| T005 | US3; FR-002; US3-AS2 | E0: pin de demora 600 ms, cambio de valor y cleanup verde sobre original | T003 | Completada E0 |
| T006 | US3; FR-003/004; US3-AS3 | E0: pins de promesa resuelta, usuario ausente, suspensión y espera capturada verdes | T003 | Completada E0 |
| T007 | US1; FR-005/006; US1-AS1/2/3/4 | E0: dos CHANGE rojos por pérdida de error y recuperación incorrecta, ambos órdenes de resolución | T004,T006 | Completada E0 |
| T008 | US2; FR-007/008; US2-AS1/2/3 | E0: dos CHANGE rojos de cuenta/resultado tardío y remontaje real; no aceptar TypeError por API ausente | T003,T006 | Completada E0 |
| T009 | US4; FR-009; US4-AS1/2 | E0: dos Chromium rojos de visibilidad/accesibilidad en 390/1280, con región única como oráculo previsto | T003 | Completada E0 |
| T010 | US1–4; todos | E0: congelar pruebas/fixtures; G-PIN con siete IDs complete, catorce pending, seis rojos específicos y original sin cambios | T004,T005,T006,T007,T008,T009 | Completada E0 |
| T011 | US1/2; FR-005/006/007; US1-AS1/2/3/4, US2-AS1/2 | E1: ampliar coordinador con ledger por usuario:clave, snapshot estable y suscripción con filtro; misma cola y promesas | T010 | Completada E1 |
| T012 | US1/2; FR-005/006/007 | E1: conservar originales de ambos pins, aplicar PIN-007-001 solo a data-sync.test.js y adenda 001; preparar adenda 006 sin cambiar aún el assert de role=status | T011 | Completada E1 |
| T013 | US1/2; FR-005/006/007 | E1: negativos de aislamiento del coordinador y getter estable; verificar ausencia de efectos React/DOM/backend nuevos | T011 | Completada E1 |
| T014 | US1/2/3; FR-001–007 | E1: checkpoint completo de etapa: Node/Chromium heredados compatibles, AS-IS, tres CHANGE del coordinador verdes, tres UI rojos, build y 16/5 IDs | T012,T013 | Completada E1 |
| T015 | US2; FR-007/008; US2-AS1/2/3 | E2: integrar userId y useSyncExternalStore, cambiar snapshot durante render y limpiar listeners; probar carrera de suscripción | T014 | Completada E2 |
| T016 | US4; FR-009; US4-AS1/2 | E2: una región visible fuera del rail, texto fijo y estilos locales; aplicar PIN-007-002 al assert de role=status y adenda 006; sin duplicar Toast ni alterar CSS histórico | T015 | Completada E2 |
| T017 | US3/4; FR-001/002/004/009 | E2: comprobar siete anchos, foco/overlays, ft-focus, navegación y guardas; no adaptar oráculos geométricos para ocultar regresiones | T016 | Completada E2 |
| T018 | US1–4; todos | E2: checkpoint sin filtros: Node y Chromium ordinarios, seis CHANGE verdes, 21 IDs completos y build; verificar PIN-007-001/002 | T017,T027 | Completada E2 |
| T019 | US1/2/4; FR-005/007/009 | E3: tres mutaciones postverde con controles positivos, error esperado, copia aislada y limpieza; src del checkout intacto | T018 | Completada E3 |
| T020 | US3; FR-001/003/004 | E3: RLS local desechable fresco A/B/anónimo, guardas de destino, hashes y limpieza; no backend real | T018 | Completada E3 |
| T021 | US1–4; todos | E3: validar siete contratos y 205 IDs con sourceHash común; revisar cláusulas y enmiendas contra resultados y baseline | T019,T020,T026 | Completada E3 |
| T022 | US1–4; todos | E3: añadir CI completa 007 y artefactos conservando las seis puertas y mutaciones previas; verificar descubrimiento y negativos del manifiesto | T021 | Completada E3 |
| T023 | US1–4; todos | E3: checkpoint final Node/Chromium/build, manifiestos completos, pins, build delta y límites; repetir completo si falla | T022 | Completada E3 |
| T024 | US1–4; todos | E3: converge, revisión de spec/plan/adendas, registro de aprobación y PR de código preparado con orden, omisiones y reversión; sin publicar | T023 | Completada E3 |

Cada implementación depende de T010 y su G-PIN real. No se deriva aprobación
del plan a partir de la aprobación del alcance. Publicación, fusión y Vercel
quedan fuera; no hay tareas de implementación completadas por crear este archivo.

## Converge E1 — tarea añadida, 2026-10-21

| ID | Historia / requisitos | Resultado verificable | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T025 | US1/2/4; FR-005–009 | Adaptar los cinco verificadores históricos independientes para reconocer solo enmiendas aprobadas, conservando hashes originales; archivar originales y enmendar cuatro archivos adicionales más el adaptador en interface-cases; repetir E1 entero | T011,T012 | Completada E1 |

T014 queda además bloqueada por T025. No cambia ningún resultado de producto
ni una tarea completada. El E1 fallido por hashes se conserva; la previsión de
99 archivos intactos se corrige a 98: body-compatibility también está congelado
y requiere PIN-007-005; tres validadores de arquitectura no pertenecen a los
101 pins. Todos sus originales se archivan. interface-cases usa PIN-007-003
para adaptar el verificador, sin cambiar su oráculo de comportamiento.
interface-cases encadena adaptación del verificador
en E1 y región accesible en E2; la aserción de UI no se adelanta.

## Converge de revisión E3 — tarea añadida

| ID | Historia / requisitos | Resultado verificable | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T026 | US2; FR-007/008; US2-AS1/2 | Añadir comprobación suplementaria del DOM en layout antes del efecto al cambiar usuario y resolver A tarde; demostrar rojo sobre copia de BASE y verde candidato, conservando los seis casos E0 | T018 | Completada E2 |

Esta comprobación refuerza el escenario ya aprobado; no añade comportamiento
de producto ni modifica oráculos congelados. T021 depende también de T026.

## Converge E2 — región Toast

| ID | Historia / requisitos | Resultado verificable | Depende de | Estado |
| --- | --- | --- | --- | --- |
| T027 | US4; FR-009 y adenda 006 FR-012 | Archivar browser-tests/interface.spec.js original; PIN-007-006 limita los tres selectores genéricos de status al Toast, conservando texto y tiempos; control dirigido y repetición E2 entera | T016 | Completada E2 |

T018 depende además de T027. La nueva región aprobada vuelve ambiguo el selector
global del Toast, sin cambiar su comportamiento. Este cuarto archivo enmendado
reduce a 97 los pins anteriores intactos; no altera la baseline histórica.
