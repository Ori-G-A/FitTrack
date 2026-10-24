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
