# Preparación verificada de SDD

Actualización 2026-10-17: los resultados siguientes documentan la preparación
inicial. 001/002 ya se integraron; 003 ejecutó E0–E4 con baseline y checkpoints.
Resultado actual: 242/242 Node, 6/6 Chromium, build correcto, 21/21 contratos
en los gates finales 001 y 003. El gate 002 fue rechazado por evidencia RLS
incompleta tras fallo de Docker local; cierre pendiente en T025.
[Estado y evidencia actual de 003](../../specs/003-entrenamiento/verification.md).

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
