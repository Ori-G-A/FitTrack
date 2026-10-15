# Plan técnico — 001-datos

Estado: REVISADO con mejoras autorizadas; aprobación integral pendiente, 2026-10-15.
Contrato: [spec](spec.md). Decisiones: [research](research.md).
Revisión de calidad: [checklist](checklists/requirements.md).
Base productiva: `46697650f18043319a7c96ccdf93ebbdf29e2d75`.
Área: `codex/001-datos`. Preparación anticipada: `codex/sdd-readiness`.
Autorizaciones: [registro](../../docs/sdd/approvals.md).
Evidencia actual: [readiness](../../docs/sdd/readiness.md).

## Resultado y enfoque

Separar acceso a datos y coordinación de interfaz conservando los 11 FR y
10 escenarios aprobados. No hay CHANGE: los defectos conocidos se mantienen
caracterizados y se registran para una corrección posterior.

## Diseño propuesto

| Archivo | Responsabilidad final | Contratos |
| --- | --- | --- |
| `src/data-operations.js` | Consultas app_data con cliente explícito; añadir operación de borrado filtrado extraída de App | FR-001/002/011 |
| `src/save-coordinator.js` (nuevo) | Fábrica de cola, suspensión, espera y bus; depende de función de persistencia y logger, sin React/Supabase | FR-003/004/005, suscripción FR-006 |
| `src/data-sync.js` | Fachada con exports actuales; compone instancia global y conserva hook React | FR-003 a FR-006; timer |
| `src/app-data-lifecycle.js` (nuevo) | Coordina carga, importación/exportación y borrado mediante dependencias explícitas y callbacks | FR-007/009/010/011 |
| `src/FitTrack.jsx` | Estado y presentación; adapta navegador y conecta casos de uso; conserva APIs de Train y pantallas | FR-006/007/008/009/010/011 |
| `test/support/` (nuevo) | Harness JSX/DOM, cliente falso, reloj y fixtures sintéticos | Pruebas de las tres historias |
| `test/data-*.test.js` (nuevos) | Contratos y regresión observables, sin exigir la estructura de módulos elegida | Todos los FR/escenarios |

Los adaptadores de navegador (selección de archivo, FileReader, Blob, URL y
descarga) seguirán siendo explícitos. Evitar un framework de repositorios o
inyección general: solo dependencias necesarias para estos casos de uso.
Mantener migraciones de workouts/foods y validación en sus propietarios actuales.
La sincronización de 12 claves y el timer siguen teniendo sus llamadores públicos.

## Límites de dependencia

- `save-coordinator` no importa React, DOM, Supabase ni componentes.
- `app-data-lifecycle` recibe operaciones, callbacks y adaptadores; no importa
  Supabase global, DOM ni JSX. La validación/migración puede recibirse como función.
- `data-operations` depende solo del timeout y cliente recibido.
- `data-sync` compone infraestructura; App no ejecuta consultas app_data directas.
- Fotos conservan módulos existentes. Ninguna función pura importa una pantalla.

Una prueba de límites validará imports reales de estos módulos, incluyendo
resolución transitiva y un fixture negativo. No será una prueba de nombres de
variables ni una afirmación de arquitectura completa del repositorio (KD-001).

## Secuencia y puertas

1. Preparación de pruebas: añadir devDependencies jsdom/esbuild, actualizar
   lockfile sin actualizar dependencias ajenas y validar harness sobre App original.
2. Caracterización bloqueante: implementar todos los pins enumerados abajo.
   Ejecutar contra `src/` sin cambios respecto a BASE; registrar salida y hashes.
   Un fallo se investiga; no cambiar aserciones para ocultar comportamiento.
3. Extraer cola/bus y recomponer fachada, sin cambiar exports ni instancia global.
   Reejecutar sus pins, hook y suite. Añadir pruebas de límites de ese módulo.
4. Extraer coordinación de carga conservando cleanup y estados; reejecutar pins
   de carga, sincronización y timer. No agrupar cambios de fórmulas.
5. Extraer backup y borrado, retirando consulta directa app_data de App.
   Reejecutar pins de acciones y los de carga/sincronización afectados.
6. Verificación final: trazabilidad mecánica y revisión de aserciones, suite,
   build, auditoría por cambios de devDependencies y converge completo.

El propietario autorizó expresamente validar el entorno y el mecanismo de
pruebas antes de aprobar este plan. Esa preparación anticipada queda registrada
en readiness; la extracción productiva espera aprobación del plan, tareas,
analyze y puerta documental definida en la constitución.
Los pasos 3–5 requieren pins verdes del paso 2. Cualquier imposibilidad de
separar fases se documenta y se revisa antes de ejecutarla.

## Matriz de pruebas previstas

La matriz siguiente sigue siendo el objetivo completo. Los pilotos actuales
no la sustituyen ni cambian PENDING por completo sin revisar todas sus cláusulas.

Los nombres son compromisos del plan, no pruebas existentes ni ejecutadas.
Cada prueba puede contener subcasos; debe demostrar todas las cláusulas del FR
que referencia, sin reducir el contrato a su caso feliz.

| Archivo :: nombre previsto | FR | Escenarios | Casos obligatorios |
| --- | --- | --- | --- |
| `test/data-operations.test.js :: datos lectura y escritura por usuario y clave` | FR-001, FR-002 | US1-AS1 | payload/filtros exactos, value incluyendo 0/false, null/ausencia, fallback por referencia, error retornado/rechazo, plazo 14999/15000 y finalización remota posterior |
| `test/data-sync.test.js :: datos cola orden concurrencia y referencia` | FR-003 | US1-AS2 | mismo par serial, otros pares concurrentes, dos usuarios con misma clave, valor mutado antes de ejecutar, cola continúa tras error |
| `test/data-sync.test.js :: datos eventos y promesas de guardado` | FR-004 | US1-AS3 | saving/saved/error, promesa resuelta ante fallo, console, error sin message, saved entre tareas seriales, intercalado que sobrescribe error global |
| `test/data-sync.test.js :: datos suspension y espera capturada` | FR-005 | US1-AS4 | usuario ausente, suspensión silenciosa, reanudar, trabajos ya en cola, snapshot no incluye futuras entradas ni otros usuarios |
| `test/data-sync-hooks.test.js :: datos debounce y suscripciones` | FR-006 | US1-AS5 | 599/600 ms, delay explícito, enabled/userId falsos, rerender/cleanup, callback eliminado y ausencia de replay |
| `test/data-lifecycle.test.js :: datos carga y descarte de resultados` | FR-007 | US1-AS6 | 12 claves/defaults, paralelo, espera fotos y migraciones, fallo individual de foto conserva original, fallo de carga y cleanup/sesión anterior |
| `test/data-lifecycle.test.js :: datos claves sincronizadas y timer` | FR-008 | US1-AS5 | 12 claves habilitadas por loaded, exclusión signedUrl, timer separado con start/pause/reset y payloads actuales |
| `test/data-backup.test.js :: datos exportacion completa o error` | FR-009 | US2-AS1 | JSON desde estado sin esperar cola, fotos embebidas, no timer, nombre local, revocación URL, fallo de foto sin descarga parcial |
| `test/data-backup.test.js :: datos importacion validacion y aplicacion parcial` | FR-010 | US2-AS2 | sin archivo, 50 MiB y un byte más, JSON/estructura/fechas inválidas, confirm cancelada, defaults goals, claves ausentes/desconocidas, migraciones, orden respecto a fotos, foto conservada, input limpio y error de lectura |
| `test/data-delete.test.js :: datos borrado orden y recuperacion` | FR-011 | US3-AS1, US3-AS2 | sin usuario sin efectos, cola pendiente, fotos antes de app_data filtrado, signOut, excepción en cada paso, recuperación sin rollback y retorno error de signOut sin excepción |

Los pins de coordinación montarán App original con React real y sus efectos.
Se sustituyen fronteras externas, no la coordinación ni la validación a probar.
Para acciones de cuenta usar interacción DOM real; no invocar copias de handlers.
El hook puede montarse en componente mínimo. Si DOM simulado impide una prueba,
se revisa el harness antes de tocar producción. Es una condición de salida real,
no una excusa para declarar el requisito verificado con inspección textual.

## Entorno y seguridad de pruebas

- Cliente falso sustituye `src/supabase.js` durante compilación del harness.
- No cargar `.env.local`; no inicializar cliente real; red no simulada falla.
- DOM con origen de prueba, fixtures locales/sintéticos; no bases reales.
- Reloj controlado y promesas diferidas; restauración en finally tras cada caso.
- Módulos con bus/cola se cargan con estado aislado por fixture; se mantiene
  instancia global en producción y se verifica explícitamente con dos usuarios.
- Desmontar y cerrar DOM, timers e intervalos; pruebas no dejan listeners activos.

Las devDependencies de preparación son jsdom, esbuild y Playwright; sus versiones
exactas y Node/pnpm están fijadas en package.json y el lockfile.
No se requieren nuevas dependencias productivas. No hay migraciones de datos.
La evidencia de instalación, piloto y navegador está en readiness; CI remoto
no se da por verificado por ejecutar las mismas herramientas localmente.

## Verificación y evidencia exigidas

Antes del primer cambio productivo: revisión base, diff vacío de src, salida de
pins y suite. Después de cada extracción: pins relevantes y suite. Al final:

```powershell
pnpm test
pnpm run build
pnpm audit
```

Si pnpm falla antes del script, registrar fallo y usar equivalentes de AGENTS
para evidencia parcial. Esto no cierra instalación ni auditoría. Toda dependencia
añadida exige verificación reproducible con lockfile y auditoría ejecutada.
AUTO-005 se amplió con la autorización de aplicar las sugerencias: CI usa la
versión de pnpm del manifiesto y Node de .node-version, e incluye test:sdd.
CI remoto solo se declara verificado tras observar jobs
obligatorios del commit revisado, sin omitidos ni fallos ocultos.

Trazabilidad: pruebas incluyen IDs en su metadato/nombre de subcaso; un manifiesto
relaciona cada fila con archivo/nombre exacto. Comparar el manifiesto con la
ejecución TAP (no es un modo collect-only); comprobar existencia, unicidad de
IDs, resultado y cero omitidos. Un fixture de prueba inexistente debe hacer
fallar el verificador. La revisión comprueba suficiencia de las aserciones.

No hay meta de rendimiento ni optimización. El warning de chunk conocido se
registra; no se silencia ni se convierte en objetivo de esta spec.
La prueba DOM no valida layout ni RLS. Se añaden tres recorridos de Chromium
con servicios simulados: cargar/guardar un objetivo; exportar/reimportar copia;
mostrar fallo de guardado conservando el dato remoto. No son prueba de RLS ni
cobertura de todos los errores de importación, fotos o borrado.

## Entregas pequeñas y reversibles

| Entrega | Cambio productivo previsto | Puerta de salida |
| --- | --- | --- |
| E0 — preparación | Ninguno en src | Entorno reproducible, piloto y trazabilidad inicial con negativos |
| E1 — cola y bus | Extraer coordinador conservando fachada | Pins FR-003/004/005/006 y suite verdes; rollback del commit de extracción posible |
| E2 — carga | Separar coordinación conservando cleanup | Pins FR-007/008 y cola verdes; llamadas públicas intactas |
| E3 — copias | Separar export/import | Pins FR-009/010 y recorrido de copia verdes |
| E4 — borrado | Separar coordinación y consulta filtrada | Pins FR-011, suite/build y converge sin gaps |

Cada entrega tendrá un commit lógico separado de cambios de formato. Las pruebas
se conservan si se revierte una extracción. No se hacen migraciones ni se revierte
estado de usuarios para deshacer una entrega.

## Pruebas que deben detectar defectos

Se ejecutan versiones alteradas solo en memoria/bundles de prueba: quitar el
filtro user_id, permitir que la segunda escritura adelante a la primera y
permitir guardar antes de completar carga. El código original debe pasar y
cada alteración debe provocar la aserción esperada, no un error de instalación.
Estas tres comprobaciones no constituyen un porcentaje global de mutation testing.

## Constitution Check

| Regla | Resultado de diseño | Evidencia/condición |
| --- | --- | --- |
| P1, contrato | PASS | Spec con 11 AS-IS aprobados y 10 escenarios; ningún CHANGE implícito |
| P2, efectos | PASS | Orden/referencias/fallos actuales preservados; no se promete atomicidad |
| P3, pin previo | PASS | Paso 2 bloquea todo cambio en src; mismos puntos de entrada antes/después |
| P4, capas | PASS condicionado a implementación | Límites definidos; KD-001 solo se retira después de comprobarlos |
| P5, privacidad | PASS | Clientes falsos, red bloqueada, sin variables reales; permisos no se alteran |
| P6, evidencia | PASS | Matriz, comandos, omisiones y trazabilidad; nada se declara ejecutado aquí |
| Aprobaciones/PR | PASS de diseño | Plan pendiente; tareas/analyze y puerta documental antes de implementación |
| Desviaciones | PASS sin nuevas | Se mantienen las KD ratificadas; defectos preservados quedan en follow-ups |

PASS aquí evalúa el diseño, no demuestra que la implementación satisfaga el
contrato. Si aparece conflicto real con un no negociable, se bloquea la parte
afectada y se tramita enmienda; el plan no puede autorizarlo.

## Entregas y aprobación

Docs: spec, checklist, research y este plan; después de aprobación se generan
tareas concretas y analyze. Preparar cuerpo de PR documental tras esos pasos.
El propietario abre/fusiona. Código: rama correspondiente con pins, extracciones,
trazabilidad sin PENDING y evidencia de converge. Orden: docs antes de código.

Pendiente aprobación explícita de este plan revisado. La infraestructura y las
pruebas de preparación fueron autorizadas por separado y tienen evidencia en
readiness. No se han implementado las extracciones productivas.
