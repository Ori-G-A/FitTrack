# Preparación verificada de SDD

Actualización 2026-10-19: 005 verificada localmente E0–E6: 286 Node,
13 Chromium, 3 RLS reales con guardas/cleanup y build correcto. Cinco contratos
completos (21/23/21/31/40 IDs), mismo src/resultados y 68 hashes congelados.
Nueve módulos puros y fachadas conservadas. [Cierre 005](../../specs/005-cuerpo-ciclo/converge.md),
[evidencia](../../specs/005-cuerpo-ciclo/evidence/final.json).
001–004 siguen integradas; 005 espera aceptación/publicación e integración.
No instalación limpia/auditoría nuevas: dependencias intactas. Los apartados
siguientes conservan evidencia histórica; sus pendientes no sustituyen este estado.

Revisión: 2026-10-15. Autorización: «aplica tus sugerencias y revisa el estado
actual de lo aprobado». Estado de decisiones: [aprobaciones](approvals.md).
Plan resultante: [001-datos](../../specs/001-datos/plan.md).

## Cambios aplicados

| Sugerencia | Aplicación concreta |
| --- | --- |
| Validar mecanismo de pruebas primero | App original montada con React real en jsdom; carga/guardado y carga pendiente comprobados |
| Entorno reproducible | Node 24.21.0 y pnpm 11.11.0 fijados; copia temporal con instalación congelada, suite y build |
| Entregas pequeñas | Plan E0 preparación, E1 cola, E2 carga, E3 copias y E4 borrado con checkpoints y reversión de código |
| Separar compatibilidad temporal | Spec vincula errores preservados a FR y DATA-001/002/003/004; revisión al cierre M2 |
| Comprobar fuerza de aserciones | Tres mutaciones en memoria detectadas por la aserción esperada; src no se altera |
| Trazabilidad mecánica | Manifiesto JSON cruzado con resultados TAP/JSON; negativos para prueba inexistente, omitida, fallida y duplicados |
| Recorridos reales | Chromium: cargar/guardar objetivo, exportar/reimportar copia y fallo de guardado visible |
| Coherencia documental | Constitución 1.0.1 en rama propia; registro explícito de aprobaciones y pendientes |

## Entorno y dependencias

DevDependencies nuevas: jsdom 30.1.2, esbuild 0.25.12 y @playwright/test 1.64.0.
El manifiesto declara Node 24.21.0 mediante devEngines.runtime; no cambia el
Node global. CI obtiene Node desde .node-version y pnpm desde packageManager.

Se actualizaron de forma dirigida dependencias transitivas señaladas por audit:
nanoid, browserslist, baseline-browser-mapping y source-map-js, dentro de los
rangos existentes. Los paquetes productivos directos conservan sus versiones
resueltas iniciales. No se añadieron excepciones de antigüedad de paquetes.

El primer Playwright seleccionado, 1.64.1, acababa de publicarse y pnpm generó
excepciones automáticas de antigüedad. Se retiraron. Se eligió finalmente 1.64.0,
compatible con la política vigente y el navegador utilizado en la verificación.

## Evidencia ejecutada

Base productiva: `46697650f18043319a7c96ccdf93ebbdf29e2d75`.
`git diff BASE -- src` vacío: no se ha iniciado la extracción de producción.
Hash agregado de los archivos src versionados usado por el reporte:
`577abd800c6c0ae8bc04d8c63a844b83a828e8629c9224a0e758f329932d8004`.

| Comprobación | Resultado observado |
| --- | --- |
| Instalación congelada | Instalación local y copia temporal desde pnpm-lock.yaml; validación de política de paquetes aprobada |
| Suite en copia limpia | 132 pruebas, 132 aprobadas, 0 fallidas, 0 omitidas |
| Build en copia limpia | Aprobado; 2252 módulos, 25,51 s; aviso de chunk index 506,80 kB |
| Piloto + mutaciones + navegador (`pnpm test:sdd`) | 8 pruebas aprobadas: 2 de piloto, 3 mutaciones, 3 de Chromium |
| Verificador de trazabilidad (incluido en suite) | 3 pruebas de negativos aprobadas |
| Estado del contrato | 21 IDs: 12 con evidencia parcial, 9 pendientes, 0 completamente caracterizados |
| Puerta completa sobre evidencia actual | Rechaza correctamente las 21 filas incompletas |
| Auditoría completa | 0 vulnerabilidades de cualquier severidad reportadas con la selección final |
| Documentación | 32 enlaces locales válidos; diff sin errores de espacios |

La suite contiene 124 pruebas previas y 8 nuevas de preparación;
los 3 recorridos Chromium se ejecutan aparte. No sumar ejecuciones repetidas
como si fueran pruebas diferentes.

## Reproducción y artefactos

```powershell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test
pnpm test:sdd
pnpm audit
./scripts/verify-clean.ps1
```

El script de copia limpia incluye código, tests y archivos estáticos necesarios,
sin copiar .env.local, bases de datos, node_modules ni credenciales. Usa la caché
de paquetes local: demuestra instalación desde lockfile con node_modules nuevo,
no descarga fría desde cero ni reproducción ya observada en Linux.

Reportes regenerables ignorados por Git: `test-results/clean-install.log`,
`sdd-pilot.tap`, `sdd-browser.json`, `sdd-evidence.json` y `audit.json`.
Playwright usa su subcarpeta de salida para no borrar evidencia de otros checks.

## Fallos encontrados y tratamiento

- pnpm no podía abrir su base de datos dentro del sandbox; los comandos
  autorizados fuera de él funcionaron sin borrar ni reparar estado global.
- La primera copia temporal omitió SQL y vercel.json; sus pruebas fallaron
  por archivos ausentes. Se corrigió el inventario y se repitió el checkpoint
  completo, sin cambiar aserciones.
- El primer arranque de Chromium coincidió con su descarga y falló con EBUSY;
  se repitió el conjunto completo tras finalizar instalación.
- La descarga de Chromium para una versión intermedia de Playwright agotó
  tiempo. Se fijó 1.64.0 y se verificó la combinación final; esa versión
  intermedia no forma parte del lockfile final.

## Límites y puertas pendientes

Los dobles reemplazan al cliente Supabase antes de compilar las pruebas;
la red está bloqueada. No se han probado permisos RLS contra servidor real,
despliegues, datos de usuarios ni ejecución remota de CI.

El piloto no equivale a los pins completos de los 11 FR y 10 escenarios.
`test:sdd:complete` exige todas las filas completas y debe fallar en el estado
actual. La revisión humana aún debe comprobar cada cláusula del contrato.
El plan revisado espera aprobación; tareas, analyze, PR documental y extracción
productiva permanecen pendientes. No se declara M0 ni M1 completado.

## Baseline 004 — 2026-10-18

Plan aprobado y ejecución local autorizada. Sobre src original2a70042: 260 Node,
9 Chromium, 31/31 contratos de 004 y build verdes. Cuatro mutaciones detectadas,
22 pins anteriores intactos. [Baseline](../../specs/004-nutricion-objetivos/evidence/baseline.json).
No se declara implementación004 completa ni RLS renovada; T020–T028 pendientes en este checkpoint inicial.

## Implementación 004 y cierre pendiente — 2026-10-18

[Checkpoint](../../specs/004-nutricion-objetivos/evidence/e5.json): 263 Node, 9 Chromium,
31/31 contratos de 004, build y 40 hashes intactos.001/003: 21/21 sobre la misma colección.
La ejecución RLS actual falló por motor Docker inaccesible (socket de inferencia);
cleanup no confirmado. No se restaura evidencia previa ni se declara completo002.
[Acción pendiente](../../specs/004-nutricion-objetivos/converge.md):T029 y repetición
íntegra de 002 con RLS. Sin cambios SQL/dependencias ni publicación/integración/despliegue.

## Cierre local 004 completo — 2026-10-18

Docker volvió a responder; T029 resuelta con recuperación del fixture previo
y RLS renovada3/3 con cleanup. Gate002 repetido íntegramente:23/23 IDs,
263 Node, 9 Chromium y build correcto. Contratos001/002/003/004:21/23/21/31
completos sobre los mismos resultados/hash;40 pins intactos.
[Resumen final](../../specs/004-nutricion-objetivos/evidence/final.json).
Las 29 tareas completas; revisión del propietario e integración pendientes.

## Baseline 005 — 2026-10-19

E0 sobre original: 284 Node, 13 Chromium, build y 40/40 IDs completos. 28 archivos
nuevos congelados y 40 anteriores intactos. [Evidencia](../../specs/005-cuerpo-ciclo/evidence/baseline.json).
Regla LF versionada para reproducir anclas congeladas en Windows/Linux; no hay
cambio de contenido src. Implementación y RLS fresco de cierre pendientes.

## Cierre local 005 y publicación autorizada — 2026-10-19

286 pruebas Node, 13 Chromium y tres RLS con limpieza; build aprobado.
Los cinco contratos suman 136 IDs completos sobre el mismo src; 68 pins intactos.
[Evidencia final](../../specs/005-cuerpo-ciclo/evidence/final.json).
El propietario autorizó publicar e integrar con CI verde y desplegar automáticamente.
PR documental #11 publicado; confirmación remota de cierre pendiente.

## Integración 005 comprobada — 2026-10-19

PRs #11/#12 y CI de PR/main aprobados; Production exitoso en 86299a4.
[Evidencia](../../specs/005-cuerpo-ciclo/evidence/integration.json).
Árbol src idéntico al cierre local. Sin prueba funcional autenticada real.

## Preparación documental 006 — 2026-10-19

Alcance y dos cambios aprobados; plan/tasks/analyze propuestos. 46 IDs pending,
33 nombres únicos de pruebas previstas, 39 tareas con dependencias verificadas.
[Verificación de propuesta](../../specs/006-interfaz/verification.md).
Sin cambios de producto ni ejecución contractual, instalación o auditoría nueva.

## E0 006 en ejecución — 2026-10-20

Plan/E0–E6 local autorizado, snapshot documental e06f105 conservado sin publicar.
E0: 21 grupos Node verdes; suite inicial 307/307, build y cuatro controles de
mutación aprobados; cinco rojos de accesibilidad válidos. Chromium 6/7: diferencia
de resaltado en App. El propietario pidió proponer CHANGE separado.
[FR-024 propuesto](../../specs/006-interfaz/change-card-highlight.md), cuatro tareas
adicionales y dos rojos específicos; alcance/plan de esa extensión pendientes.
G-PIN no superado; src intacto. Sin publicación, integración ni despliegue006.

Actualización E0 — 2026-10-20: repetición completa Node 309/309 y build verdes;
Chromium 20/20 sin skips/retries y 68 pins anteriores intactos. Se conserva el
fallo previo de debounce y su repetición íntegra sin editar la aserción.
[Avance parcial](../../specs/006-interfaz/evidence/e0-partial.json).
48 IDs aún pending, G-PIN no superado y extensión T040–T043 pendiente de aprobación.

## Estado vigente — 2026-10-20

G-PIN006 superado:309 Node y20 Chromium aprobados; siete CHANGE rojos específicos, build verde,33 pins nuevos y68 anteriores intactos.42 IDs AS-IS completos y seis CHANGE pendientes. Plan completo43 tareas aprobado; ejecución local E1–E6 habilitada. [Baseline](../../specs/006-interfaz/evidence/baseline.json). RLS fresco pendiente del cierre E6.

## Cierre local006 — 2026-10-20

E0–E6 completas:314 Node/27 Chromium,184 IDs en seis contratos, RLS real fresco con cleanup y tres negativos postverde detectados.68 pins anteriores intactos;33 firmas006 con enmienda técnica PIN-006-001. [Evidencia](../../specs/006-interfaz/evidence/final.json) y [PR preparado](../../specs/006-interfaz/code-pr.md). Publicación/CI remoto/integración/Vercel pendientes de autorización específica. KD-002 sigue activa hasta ratificación propia.
