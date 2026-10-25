# Verificación 008

## E0 — 2026-10-24 (Bogotá)

Plan aprobado: `2ee8edca15a95012344e0dca3823e8b103b231f3`.
Node 24.21.0/pnpm 11.11.0. [Original](evidence/original-checkpoint.json):
325 Node, 29 Chromium y build aprobados, sin skips/retries; bundle principal
507,26 kB / gzip 147,38 kB, con aviso >500 kB conservado.

[G-PIN](evidence/baseline.json): cuatro AS-IS verdes y trece CHANGE rojos por
cláusula (doce Node y uno Chromium, con fallo esperado independiente en ambos
anchos 390/1280). El runner Node cuenta además subcasos: 22 pruebas, cinco
verdes y diecisiete rojas. No equivale a una suite global verde.

108 firmas históricas verificadas y ocho archivos nuevos congelados. Se
archivaron los dos originales necesarios para la enmienda controlada. La
navegación móvil/escritorio del harness nuevo se corrigió antes de congelarlo;
después se repitió E0 entero. Ningún fallo de preparación cuenta como rojo FR.

Src conserva `0d01417177a2f231d480a09ba77949cf781ce901b161cb2092f8fa2724718802`.
No se accedió al backend real. Matriz: siete complete, veintidós pending.
E1–E3, mutaciones, ocho contratos y RLS fresco siguen pendientes.

Comandos ejecutados:

```powershell
pnpm test
pnpm test:browser
pnpm run build
pnpm exec node --test --test-isolation=none --test-reporter=tap test/delete-state-asis.test.js test/delete-state-core-change.test.js test/delete-state-app-change.test.js
pnpm exec playwright test --config playwright.delete-state.config.js
```

Publicación, integración y Vercel no están autorizados por este plan local.

## E1 — 2026-10-24 (Bogotá)

[Checkpoint](evidence/e1.json): 342 Node, 29 Chromium heredados y build aprobados.
Núcleo, suplementos y heredados verdes; ocho IDs completos y veintiuno pending.
Los nueve casos nuevos de App y el Chromium propio no se reevaluaron en E1.
No es cierre de 008 ni recertificación RLS.

Motor sin recuperación automática y coordinador puro por actor/intento, con
barrera de commit, exclusión y limpieza. 107/108 firmas históricas intactas;
una enmienda [PIN-008-001](evidence/pin-008-001.json), original archivado y adenda
001 explícita. Ocho pins E0 intactos. Resolutores 006/007 conservados mediante
composición central y controles negativos; ningún validador histórico debilitado.

Primera verificación dirigida: la nueva aserción del pin observó loaded antes
del commit. Se añadió espera de ese commit conservando loaded=false y se repitió
la verificación dirigida íntegra: 24/24. Checkpoint completo posterior: 342/342.
E1 sourceHash: `afec0c08616a1a19cd932907cb6dc40f7d090bad6bc92bf632b0374d8a36a571`.

## E2 — 2026-10-24 (Bogotá)

[Checkpoint](evidence/e2.json): 355 Node, 30 Chromium y build aprobados con
descubrimiento ordinario, cero skips/retries/cancelaciones. Siete contratos
verificados desde los mismos resultados, incluidos los 29 IDs 008 completos;
002 se excluye de recertificación hasta disponer de RLS fresco en E3.

Feedback raíz por fase, recuperación manual y aislamiento de generación conectados.
107 firmas anteriores intactas, una enmendada y ocho pins E0 intactos. La prueba
congelada detectó que el reintento de cierre perdía el texto Datos eliminados;
se corrigió presentación y se repitió todo el conjunto dirigido, después el
checkpoint ordinario completo. Ningún caso congelado se modificó.

Bundle: 512,62 kB / gzip 149,48 kB frente a 507,26 / 147,38: delta +5,36 / +2,10.
El aviso >500 kB permanece. SourceHash E2:
`db61cd101d4a6c79fba23d08832d67cc79ebffb54959cc7ee5a4feed2a42d0ad`.

La revisión añade T037 para reforzar carga ordinaria pendiente y continuidad de
guardados propios de B frente a A tardío. Es evidencia suplementaria posterior,
no altera E0 ni sustituye sus rojos. E3, RLS y autorización remota pendientes.

## E3 parcial — 2026-10-24 (Bogotá)

[Registro parcial](evidence/e3-progress.json): cinco mutaciones detectadas, cinco
controles positivos, cero skips/cancelaciones y limpieza confirmada. Se prueba
el bypass conjunto de las barreras de visibilidad y carga ordinaria, porque
quitar una sola conserva la otra. Las aserciones observan lecturas y guardados.
[Mutaciones](evidence/mutations.json).

[T037](evidence/supplementary-load-races.json): dos casos suplementarios verdes,
firmados; no se atribuye rojo original. Los controles de trazabilidad rechazan
nombre inexistente o distinto del plan, duplicado, omisión, partial y retried.
El primer control de firmas detectó que el helper reaplicaba enmiendas 006/007
sobre firmas ya efectivas; se corrigió el helper y se repitió el control completo.
Ninguna firma histórica o E0 se cambió para resolverlo.

CI 008 y artefactos preparados, conservando siete puertas anteriores, mutaciones
006/007 y RLS separado. Falta verificar el checkpoint final con RLS fresco y
los ocho contratos/234 IDs. [Intento RLS](evidence/rls-attempt.json) terminado
fallido, sin resultados ni limpieza confirmada. Docker se cerró al acceder a
dockerInference; el servicio estaba detenido. Se interrumpió únicamente el CLI
hijo de arranque tras comprobar padre, ruta y propietario; el runner intentó
retirar su fixture, sin confirmar éxito. Se conserva el directorio de
[recuperación](evidence/rls-environment.json), cuyo proyecto propio debe retirarse
con Docker operativo antes de crear otro fixture. La comprobación posterior
sigue sin encontrar el pipe dockerDesktopLinuxEngine. No se reutiliza evidencia antigua.
[PR de código en borrador](code-pr.md).

El aislamiento impide invocar pasos posteriores desde un actor obsoleto; no
cancela operaciones ya invocadas, incluido signOut dentro del SDK. No se promete
abortar efectos internos de una llamada ya enviada si cambia la cuenta después.

## Checkpoint local posterior de E3 — 2026-10-24

[Perfil local completo](evidence/local.json): 358 Node, 30 Chromium y build
verdes, sin skips/cancelaciones/retries. Siete contratos/211 IDs completos
desde los mismos resultados y sourceHash E2. Los 23 IDs de 002 no se recertifican
sin RLS fresco. El campo closurePassed permanece false.

Mutaciones heredadas [006](evidence/interface-postgreen-mutations.json) y
[007](evidence/save007-mutations.json) renovadas para este candidato: tres y
tres detectadas, controles positivos y limpieza. Con las cinco de 008 son once
mutaciones detectadas. Dos originales archivados y todas las firmas verificadas.
La [puerta final](evidence/final-gate-negative.json) rechaza expresamente RLS incompleta.

```powershell
pnpm exec node scripts/check-delete-state-mutations.js
pnpm exec node scripts/run-delete-state-checkpoint.js local
# Solo con RLS fresco y limpieza confirmada:
pnpm exec node scripts/run-delete-state-checkpoint.js final
```

T029–T036 conservan sus dependencias pendientes: retirar el fixture propio,
ejecutar RLS fresco, checkpoint final de ocho contratos, converge y preparación
definitiva de PRs. CI y los borradores están preparados, sin publicación autorizada.
