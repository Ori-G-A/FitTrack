# Plan técnico 007 — guardado fiable

Estado: APROBADO para ejecución local E0–E3 el 2026-10-21; ejecución iniciada.
[Alcance aprobado](spec.md), [tareas](tasks.md), [decisiones](research.md),
[validación](validation-plan.md), [análisis](analyze.md).
BASE de producto: `4eee59db2efb7ff389acdb5396b4e77ca4094cad`.
Alcance registrado en `63141e2`. El propietario aprobó después plan, tareas y
análisis y autorizó ejecución local E0–E3 antes de integrar el documental.

## Entregas y puertas

- G-DOC: plan, tareas y análisis aprobados por separado del alcance, con
  ejecución local E0–E3 antes de integrar el PR documental. Publicación, fusión
  y Vercel necesitan autorización posterior específica.
- E0 / T001–T010: repetir el original con Node 24.21.0; caracterizar AS-IS,
  fijar seis casos CHANGE rojos por motivos de negocio, congelar nuevas pruebas,
  fixtures y adaptadores. Conservar las 101 firmas previas y sus dos enmiendas.
  G-PIN exige siete IDs AS-IS completos (cuatro FR y tres escenarios), catorce
  IDs CHANGE pending y seis rojos explicados. No se presenta un contrato completo.
- E1 / T011–T014: implementar estado por usuario/clave y suscripción con filtro,
  preparar adendas y primera enmienda de pin afectado. Tres CHANGE del coordinador verdes;
  tres CHANGE del indicador/presentación siguen rojos. Verificar checkpoint parcial declarado.
- E2 / T015–T018: indicador con usuario, snapshot al montar, texto visible y una
  región accesible; completar integración con App y estilos locales. Los seis
  CHANGE pasan. Descubrimiento ordinario sin filtros y checkpoint completo.
- E3 / T019–T024: tres negativos postverde, siete contratos completos (205 IDs),
  RLS local fresco con limpieza, revisión de aserciones, CI, converge y PR preparado.

Un fallo obliga a repetir el checkpoint completo de su entrega tras corregirlo.
Una etapa parcial enumera exactamente qué casos ejecuta y cuáles permanecen
rojos/pending. No hay test.skip, test.fail ni filtros permanentes para obtener verde.

## Fronteras técnicas

| Archivo | Cambio previsto | Restricciones |
| --- | --- | --- |
| src/save-coordinator.js | Estado en memoria por usuario; fallos por clave y pendientes en ejecución por usuario | Sin React, DOM, Supabase ni persistencia nueva; misma cola y referencia de payload |
| src/data-sync.js | Exportar consulta getSaveStatus y suscripción opcional por usuario | Fachada única; debounce 600 ms y carga/escritura remota intactos |
| src/AuthUI.jsx | SaveIndicator recibe userId y usa useSyncExternalStore con snapshot y suscripción de ese usuario | AuthScreen sin cambios; cleanup, estado textual y región de estado |
| src/FitTrack.jsx | Pasar userId y ubicar una sola instancia visible fuera del rail oculto | No mover sesión/carga/import/export/borrado ni cambiar rutinas de persistencia |
| Presentación local del indicador | Estilos limitados a la nueva región | Preservar cadena CSS histórica, dimensiones de controles, navegación, overlays y ocultación durante ft-focus |

No se añade una librería ni se extrae un módulo puro sin necesidad. El coordinador
ya es una frontera independiente. Se conserva el contrato público de saveKey,
waitForUserSaves, suspendUserSaves y resumeUserSaves.

## Estado y compatibilidad de API

`getSaveStatus(userId)` devolverá el estado vigente de ese usuario. Sin usuario
devuelve idle sin errores de cuentas anteriores. Estado inicial sin historial:
idle; hay escrituras ejecutándose sin fallos: saving; hay fallos no resueltos:
error aunque se esté reintentando; sin fallos al terminar la persistencia: saved.
No se cuentan trabajos aún no ejecutándose ni el debounce previo.

`onSaveStatus(callback, userId)` filtra por usuario; la forma existente sin
segundo argumento se conserva como observador de eventos para compatibilidad.
App no usará ese observador global para mostrar estado de sesión. La suscripción
heredada no necesita cambiar su política de replay: el snapshot explícito resuelve
el montaje. Al cambiar usuario, la UI cambia de snapshot y limpia el listener viejo.

Cada fallo queda asociado al usuario y clave. Solo el éxito posterior del mismo
par lo elimina; los éxitos de otras claves y el paso a cero pendientes no limpian
fallos. Un segundo fallo del mismo par actualiza su mensaje sin eliminar otros.
El texto visible será fijo; no se incorporan claves, payloads o identificadores al
mensaje público. Los detalles internos conservan la política diagnóstica existente.

Los snapshots del getter serán inmutables y de identidad estable mientras no
cambie el estado. SaveIndicator usará useSyncExternalStore de React ya instalado
para cubrir el intervalo entre render y suscripción y leer el usuario vigente
durante el render, sin pintar el estado anterior de otra cuenta. La prueba de
montaje no puede depender de que casualmente ocurra otra escritura. No cambiar
el conteo global de la cola ni introducir sincronización remota adicional.

## Enmienda controlada de contratos y pins

La aprobación de FR-005–009 permite evolucionar solo 001 FR-004/006 y 006 FR-012
en lo descrito por la spec. Se añadirán adendas vigentes enlazadas a 007; no se
reescriben los checkpoints ni las specs históricas para fingir que siempre fue así.

Dos archivos tienen contradicciones identificadas:

1. `test/data-sync.test.js`: el caso `datos eventos y promesas de guardado`
   espera saved después de perder el fallo de A. Sustituir esa expectativa por
   error y comprobar recuperación posterior de A; conservar el resto de sus asserts.
2. `test-support/interface-cases.js`: `cases.boot` espera ausencia de role=status
   tras Guardado. Sustituir solo esa negativa por la comprobación de la región de
   guardado con su texto; conservar checks de carga, guardado y toast independientes.

Antes de cambiarlos: fijar hashes efectivos tras PIN-006-001/002, guardar contenido
original y resultados originales sobre BASE. Después: PIN-007-001 para el primer
archivo en E1 y PIN-007-002 para el segundo en E2, con FR, decisiones aprobadas,
diffs de aserciones, firma anterior/nueva y resultados de su entrega. La negativa
de role=status no se enmienda antes de implementar la región en E2.
`scripts/interface-pins.js` aceptará únicamente esos cambios explícitos mediante
verificación estricta de ambas enmiendas por etapa, manteniendo las dos enmiendas 006 y las
firmas de los otros 99 archivos. El número histórico sigue siendo 101.

Si otro pin contradice un CHANGE, detener esa adaptación, documentar el FR y
añadir tarea de converge antes de modificarlo. Un fallo por refactor, selector
equivocado o regresión de geometría no autoriza cambiar su expectativa.

## Checkpoints

Runtime: `pnpm exec node --version` debe dar v24.21.0. E0 repetirá Node y Chromium
originales y build; los totales previos 314/27 son referencia, no resultado nuevo.
El diagnóstico Node v26.5.0 del survey sigue archivado y no satisface G-PIN.

E0 selecciona la lista histórica de pruebas y los cuatro AS-IS nuevos; ejecuta
los seis CHANGE por separado sobre el original. E1 incorpora los tres del coordinador
ya corregidos; los tres del indicador siguen en el informe de rojos. La selección
por etapa será explícita y verificada contra nombres/resultados, sin omitir otros
casos heredados. E2/E3 ejecutan `pnpm test`, todos los proyectos Chromium y build
sin exclusiones de 007. Los nombres exactos están en validation-plan.md.

E3: `pnpm run test:sdd:complete --spec=007-guardado-fiable` y los seis contratos
anteriores sobre evidencia del mismo sourceHash. Para 002 aportar RLS local real
fresco, con guardas y limpieza; no usar .env.local ni backend real. Conservar
reportes TAP/JSON, comandos, Node, hashes y errores previos en evidencia verificable.

## Presentación y regresiones

Una sola instancia del indicador, legible en móvil y escritorio y separada de
Toast. Evitar regiones vivas duplicadas y avisos repetidos por render sin cambio.
Medir bounding box y estilo computado; buscar texto en DOM no prueba visibilidad.
Preservar ft-focus de sesión, foco de diálogos, rail/barra, sticky y los siete
anchos de geometría 006. No cambiar la cadena CSS heredada para añadir la región.
La adenda solo permite la nueva presentación de estado; no un rediseño de pantallas.

## CI, riesgos y cierre

Añadir puerta completa y artefactos 007 a CI; conservar RLS separado, los seis
contratos y mutaciones existentes. Sin cambios de dependencias: no reinstalar
localmente ni hacer auditoría por los cambios de documentación; CI conserva su
instalación limpia. El aviso de bundle >500 kB sigue siendo un límite, no un fallo
oculto ni una optimización incluida. Medir el delta del build al cierre.

No se garantiza persistencia tras recargar ni que el ledger refleje escrituras
desde otras pestañas/dispositivos. DATA-004/005 y prueba autenticada de producción
quedan fuera. Al cierre preparar doc-pr/code-pr con orden de integración, pruebas,
omisiones y reversión; no publicar, fusionar ni desplegar por esta aprobación local.
