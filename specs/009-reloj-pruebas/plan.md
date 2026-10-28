# Plan técnico 009 — reloj de pruebas determinista

Estado vigente — 2026-10-27 (Bogotá): 009 integrada mediante #20/#21,
con CI de main y Vercel Production verificados en `392e797`.
[Entrega remota](evidence/integration.json). Los apartados siguientes conservan
la cronología de preparación local y sus autorizaciones ya cumplidas.


Estado vigente — 2026-10-27 (Bogotá): E0–E2 cerradas localmente;
27 tareas, nueve contratos/250 IDs y RLS fresco con limpieza verificados.
[Converge](converge.md). Las etapas siguientes conservan la cronología.
Publicación, integración y Vercel 009 pendientes de autorización específica.


Estado: APROBADO el 2026-10-27, incluida la precisión SC-001 y ejecución local E0–E2. Alcance aprobado en
`ed35fb2` el 2026-10-27. [Spec](spec.md), [tareas](tasks.md),
[validación](validation-plan.md), [decisiones](research.md), [análisis](analyze.md).

El propietario autorizó ejecución local E0–E2 antes de integrar el PR documental,
conservando un snapshot aprobado. No autoriza publicar, fusionar ni desplegar.
La [precisión SC-001](precision-sc-001.md) fue aceptada expresamente junto con
el plan; E0 queda autorizada. Publicación, fusión y Vercel siguen excluidos.

## Resultado y baseline

Eliminar la carrera de preparación en los tres montajes aprobados, sin cambiar
producto, fechas, plazos ni oráculos. Producto BASE `1f6b29d`; cierre documental
008 `6d9aa20`; hash de src original:
`e4e98de0fa1bced3a4372dab58e63172257ed8003eafad8febe306260312b377`.
370 Node/30 Chromium y ocho contratos/234 IDs son referencia previa, no nueva
evidencia 009. No se reutilizan los sondeos como G-PIN.

## Entregas y puertas

| Etapa | Tareas | Puerta verificable |
| --- | --- | --- |
| E0 | T001–T007 | Aprobación de plan y precisión; baseline original; preservar tres AS-IS y controles de fallo; dos regresiones de carrera rojas específicas; siete archivos nuevos congelados; nueve IDs completos/siete pending |
| E1 | T008–T016 | Helper y tres adaptaciones, tres enmiendas, verificadores compuestos y CI preparados; cinco casos Chromium nuevos y treinta anteriores verdes; catorce IDs completos/dos pending hasta las mutaciones de cierre |
| E2 | T017–T026 | Tres mutaciones de reloj y once heredadas; RLS fresco con limpieza; checkpoint completo de nueve contratos/250 IDs; converge y PRs preparados localmente |

Los conteos de nueve/catorce son estados conservadores del manifiesto, no
recuentos de pruebas del runner. FR-006 y US1-AS3 son controles de preservación
que podrán quedar completos en E0 conforme a la precisión solicitada. FR-007 y
US3-AS2 permanecen pending hasta la reintroducción negativa real de E2.

## Protocolo de reloj propuesto

Nuevo `test-support/paused-clock.js`, exportación `preparePausedClock(page,time)`:
`install({time}) → setFixedTime(time) → pauseAt(time) → setSystemTime(time)`.
Todas las llamadas terminan antes de inyectar la aplicación. Fijar Date evita
que el objetivo de pausa quede atrás; después de pausar, restaurar el reloj de
sistema permite que `runFor` avance Date y los temporizadores conjuntamente.
No se utiliza un instante futuro de margen, un retry ni una API interna.

El helper no captura ni convierte errores en éxito. La observación de etapa
pertenece al instrumental de pruebas: instalación/preparación, inyección y
montaje listo. Un error sintético conservado por identidad debe hacer fallar
la operación; el control prueba ese rechazo, sin aprobar un montaje fallido.
La [prueba de API](evidence/api-spike.json) solo acredita viabilidad en página
vacía; E0/E1 deberán probar cada montaje real y el producto.

Se conservan nombres, parámetros y datos de `mountUi`, la función local `mount`
de guardado y `mountDeleteBrowser`. El nuevo helper sustituye únicamente su par
de llamadas temporal. La extracción diagnóstica de `mount` en el instrumental
009 conservará su cuerpo real y enlazará explícitamente el nuevo helper cuando
exista; no duplicará su lógica ni exigirá una API ausente en el original.

## Fronteras propuestas

| Archivo | Modificación permitida | Protección |
| --- | --- | --- |
| test-support/paused-clock.js | Nuevo protocolo público de preparación | Sin React, SDK, datos, esperas del host ni decisiones de dominio |
| test-support/interface-browser.js | Importar/invocar helper con su fecha actual | Mantener routing, semillas, firmas y montaje; PIN-009-001 |
| change-tests/save-state.spec.js | Sustituir preparación local del reloj | Conservar ambos nombres y todas las aserciones, incluido avance de 600 ms/doce escrituras; PIN-009-002 |
| test-support/delete-state-browser.js | Sustituir preparación local del reloj | Conservar confirmación, captura, rutas y error sintético; PIN-009-003 |
| scripts/clock-pin-amendments.js | Resolutor independiente y estricto de tres enmiendas | Sin importar save-state-evidence, para evitar ciclos |
| scripts/save-state-evidence.js | Componer resolutor 009 después de 006/007/008; aplicarlo también a los seis pins nuevos 007 | Conservar orden y validaciones anteriores; no reconstruir baselines |
| scripts/delete-state-evidence.js | Validar cadena 008→009 en cohortes anteriores y nuevas; reportar recuentos actuales | Sin permitir diferencias genéricas; cada cambio exige su enmienda |
| test/delete-state-trace.test.js | Actualizar únicamente la aserción de recuentos de integridad | Archivo posterior a E0 de 008, sin pin en las 116 firmas; conservar nombre y negativos de trazabilidad; no tocar aserciones de borrado |
| scripts/clock-state-evidence.js y run-clock-state-checkpoint.js | Contrato 009, huellas, recibos de ejecución y checkpoint | Ningún resultado sintético se atribuye a una prueba de negocio |
| scripts/run-sdd-evidence.js y .github/workflows/ci.yml | Añadir 009 completa, validación de mutaciones reales y artefactos | Ocho contratos anteriores, once mutaciones y job RLS separado permanecen |

## Enmiendas técnicas propuestas

| ID | Archivo | Firma efectiva antes de 009 |
| --- | --- | --- |
| PIN-009-001 | test-support/interface-browser.js | 94989d588f5af8a6e8c12cd06b27983bb27f8935275562b2521e0204fd84ad63 |
| PIN-009-002 | change-tests/save-state.spec.js | 30c03f1dcf64591ff7b93e9e7baaacbcb49ea4cea6e0fcca68dc4a4232afcfea |
| PIN-009-003 | test-support/delete-state-browser.js | 755aa4c3d12ffc970e59767f8437865a625fa1ea60cd76d50b8f41c5fb8d6894 |

No hay firmas after aprobadas ni aplicadas aún. Cada registro debe citar el SHA
del plan aprobado, FR-004/005/007, baseline original, nombre/error del rojo,
verde dirigido, protocolo y declaraciones comprobadas de oráculos intactos.
La original de 006 PIN-006-001 y las baselines 006/007/008 no se reescriben.

La baseline 009 fijará las 116 firmas efectivas actuales: 108 anteriores a 008,
con su enmienda de data-delete ya aplicada, más ocho E0 de 008. Se esperan 113
intactas y tres enmendadas respecto de esa baseline. Dentro del informe legado
008 serán 105 anteriores intactas/tres enmendadas y siete nuevas intactas/una
enmendada. Se propone que `verifyDeletePins` exprese los cuatro valores y que
su prueba de recuento los exija; el cambio es metadato de integridad, no un
relajamiento de la comparación criptográfica ni de aserciones de producto.

Los resolutores deben rechazar archivo no autorizado, before/after falsos,
plan distinto, evidencia ausente o incoherente y hashes ya transformados que
intenten reaplicar la cadena. Los archivos desconocidos conservan su firma de
entrada. No se amplía una allowlist para aceptar cualquier cambio de helper.

## Evidencia y huellas

`sourceHash` permanece igual porque src no cambia. No basta para certificar
esta entrega: se añadirá `verificationHash`, huella normalizada y ordenada de
src, test, test-support, browser-tests, change-tests, scripts, configuraciones
Playwright, workflow, package.json, lockfile, .node-version, rls-tests y SQL.
Incluir archivos nuevos de esas rutas aunque aún no estén en un commit;
excluir node_modules, documentos/evidencia generada y test-results.

Cada ejecución relevante conserva huella antes/después, versiones, comando,
salida original y resultado. Nunca se añade retrospectivamente una huella
actual a una ejecución anterior. Mutadores heredados se ejecutan de nuevo,
con recibos del runner 009 que prueban huella estable durante su ejecución.
RLS exige ensayo posterior a E1, hashes de políticas/runner/dependencias
coincidentes, tres contratos reales y limpieza confirmada. El runner final
valida los recibos; no presenta sourceHash igual como evidencia nueva.

Siete archivos E0 se congelan: los dos tests Node de pins/traza, el spec
Chromium 009, su fixture, su configuración y los dos helpers de evidencia y
enmiendas 009. Deben quedar implementados con su lógica de validación completa
en E0; E1 no puede ajustarlos para aprobar el candidato. Una brecha implica
tarea aditiva de converge y enmienda explícita, no cambio silencioso.

## Verificación y comandos previstos

Runtime Node 24.21.0/pnpm 11.11.0. No cambiar ni reinstalar dependencias por
esta entrega; Chromium ya está disponible. Comandos nuevos son propuestas,
no herramientas ya ejecutadas:

```powershell
pnpm exec node --version
pnpm test
pnpm exec playwright test --config=playwright.clock-state.config.js
pnpm exec node scripts/check-clock-state-mutations.js
pnpm exec node scripts/check-interface-mutations.js
pnpm exec node scripts/check-save-state-mutations.js
pnpm exec node scripts/check-delete-state-mutations.js
pnpm test:rls
pnpm exec node scripts/run-clock-state-checkpoint.js final
pnpm run test:sdd:complete --spec=009-reloj-pruebas
```

El checkpoint final ejecutará Node y descubrimiento Chromium ordinario sin
filtros, build y los nueve contratos sobre resultados reales; añade los tres
resultados RLS y la prueba agregada de mutaciones 009 solo tras validarlos.
Se prevén 35 casos Chromium (30 anteriores + cinco nuevos); el total Node se
obtendrá del runner, incluidos subcasos. Cero skips, retries y flakies aceptados.
Un fallo obliga a conservarlo, corregir su causa y repetir completo el checkpoint.

Las mutaciones de reloj restauran el par original en cada uno de los tres
fixtures dentro de una copia con nonce, red bloqueada y sin .env.local. Cada
una tiene control positivo, error específico de pausa en pasado antes de App
y cleanup verificable. Se exige mantener las once mutaciones de 006–008.

## Entrega, límites y reversión

Converge exige 16 IDs propios y 234 anteriores completos, sin brechas de estas
cláusulas. Mantener límites de DNS, producción y la espera no diagnosticada de
007. La reparación no promete eliminar toda inestabilidad ni optimiza CI.
Preparar documental primero y código después; no publicar sin autorización.
Revertir de forma coordinada los tres fixtures, helper, resolutores y sus
enmiendas; nunca restaurar documentos históricos mediante reescritura de Git.
