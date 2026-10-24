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
