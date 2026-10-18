# Survey de entrenamiento — 003

Fecha: 2026-10-16. BASE: `c7d9e814de992b376005d82ee042f1304da6e46f`.
Estado: inventario inicial; alcance pendiente de aprobación. Sin cambios de runtime.
Gobierno: [constitución](../../.specify/memory/constitution.md), versión 1.0.2.

## Resultado y fronteras

Registrar sesiones y consultar su planificación y métricas sin alterar datos,
fórmulas, prescripciones o interfaces. El área comprende coordinación de
entrenamiento, cálculos y consumidores necesarios; no rediseña pantallas ni
valida clínicamente recomendaciones existentes.

| Responsabilidad | Evidencia en BASE | Llamadores y límites |
| --- | --- | --- |
| Sesión por fecha, series, cardio y duración | src/FitTrack.jsx:988–1157, Train | App:898; src/preview-main.jsx:208; preview/maqueta.jsx; mantener export Train |
| Sesión guiada | src/SessionScreen.jsx:24–99 | Lazy desde Train; recibe exercises/writeExercises/onExit/lastPerformance |
| Temporizador persistido | src/FitTrack.jsx:1116–1145 | loadKey/saveKey, clave timer por usuario; cola y contratos pertenecen a 001 |
| Normalización, RPE comparable | src/app-utils.js:22–76 | Train, SessionScreen y alerts.js y sus consumidores de avisos |
| Epley y destacado | src/app-utils.js:183–212 | Train y utilidades de métricas; ventana inclusiva 56 días y tres puntos |
| Consejo siguiente serie | src/app-utils.js:426–469 | SessionScreen; no es prescripción automática de próxima sesión |
| Ajuste de carga | src/app-utils.js:570 | Train; conserva series con Number(reps) > 0 |
| Calendario/cumplimiento | src/app-utils.js:500–566 | PlanScreen y DashboardScreen; semanas completas, fecha local |
| Plantillas y clasificación | src/fase1Config.js:106–473 | Train, LibraryScreen y preview-main; comparte módulo con proteína de 004 |
| Edición de rutina | src/LibraryScreen.jsx:177,320–331 | Biblioteca mezcla rutinas con alimentos/recetas de 004 |
| Asignación semanal | src/PlanScreen.jsx:65 | Una rutina recibe suggestedDay; desasigna otras del mismo día |
| Consumo transversal | src/app-data-lifecycle.js, alerts.js y pantallas | Migración/persistencia de workouts se conserva; no duplicar reglas |

Las líneas son referencias de lectura a BASE. Antes de extraer símbolos se
comprobarán imports transitivos y consumidores; el inventario no autoriza mover
todo app-utils, fase1Config o LibraryScreen como si fueran solo entrenamiento.

## Semántica observada

- writeSession conserva campos con spread, elimina una sesión sin ejercicios,
  duración ni cardio y coloca la sesión modificada al final del array.
- Cargar rutina/calentar añade ejercicios con IDs nuevos; repetir la carga
  vuelve a añadirlos. El calentamiento suma WARMUP.durationMin.
- No se elimina la última serie mediante delSet. La carga masiva protege series
  registradas; el usuario puede corregirlas explícitamente en sesión guiada.
- Duración manual: Number(valor) || 0, debounce 1000 ms y guardado inmediato
  por blur/Enter. No se añade validación numérica nueva.
- Timer: reloj Date.now, baseSec y startedAt; aplicar redondea segundos/60,
  suma minutos positivos y reinicia; el botón Guardar está deshabilitado bajo 60 s. Sesión guiada: ticks de un segundo,
  redondea al salir y solo sustituye duración si supera la registrada.
- Referencia anterior: última fecha estrictamente anterior, nombre canónico,
  mayor kg y último empate por >=; no selecciona por mayor Epley.
- Epley devuelve kg*(1+reps/30) para positivos y cero en otro caso. El destacado
  compara puntos inicial/final redondeados y elige mayor porcentaje.
- RPE comparable agrupa nombre/kg/reps, promedia por día y usa tres fechas
  últimas; no interpreta todos los RPE como equivalentes.
- Plantillas se añaden en Biblioteca por nombre exacto ausente; no por templateId.
- La cautela de fase consume inferCyclePhase y omite confianza low; inferencia
  y mensajes clínicos quedan bajo 005, sin cambiar sus reglas aquí.

## Pruebas existentes y brechas

Lectura de pruebas; no se ejecutó una nueva suite por este inventario documental.

| Archivo | Evidencia leída | Límite |
| --- | --- | --- |
| test/app-utils.test.js | localISO, fechas, matchedLoadRpeTrend, destacado, RPE, planificación y applyAdjustments | No caracteriza todos los handlers ni errores de reloj |
| test/fase1-config.test.js | Selectores, mapeo de plantilla, músculo y equipo | Incluye proteína ajena a 003; preservar sus pruebas |
| test/ui-regressions.test.js | Duración y modo sesión | Parte son asserts sobre texto fuente, no interacción |
| test/data-lifecycle.test.js y data-preview.test.js | Timer compartido y smoke de dos previews | No equivalen a todos los contratos de entrenamiento |
| browser-tests/data-journeys.spec.js | Carga/guardado/copia generales | No hay todavía recorrido completo de registrar serie |

Se requieren pins ejecutados sobre BASE antes de extraer, pruebas funcionales
de Train/SessionScreen/Library/Plan, fronteras de fórmulas y fecha local, y
manifiesto SDD de 003 en el plan técnico posterior. La revisión técnica confirmó que el selector existente ya admite 003; no requiere reescritura.

## Hallazgos para caracterizar, sin corrección autorizada

- TRAIN-001: carga timer asíncrona sin guarda de cancelación por usuario/desmontaje.
  Riesgo observado por lectura; carrera aún no reproducida con reloj controlado.
- TRAIN-002: contador de sesión guiada basado en ticks y no en Date.now.
  No promete exactitud en segundo plano; caracterizar antes de decidir CHANGE.
- TRAIN-003: reglas distintas para guardar duración de timer y sesión guiada
  (sumar vs sustituir máximo), con posibilidad de sorpresa al combinarlos.
  No se afirma duplicación reproducida ni se cambia la semántica.

La propuesta es preservar estos comportamientos como AS-IS, con seguimiento.
Cualquier corrección requiere CHANGE y prueba roja por la razón esperada.
