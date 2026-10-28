Estado vigente — 2026-10-28 (Bogotá): E0–E2 cerradas localmente; 379 Node, 43 Chromium/build, diez contratos/274 IDs, mutaciones y RLS fresco con limpieza. Publicación/integración/Vercel pendientes de autorización específica. [Converge](converge.md).

Comandos de cierre ejecutados con pnpm 11.11.0 y Node 24.21.0:

```powershell
pnpm exec node scripts/run-body-inputs-checkpoint.js proofs
pnpm exec node specs/010-entradas-cuerpo/evidence/receipt-negatives-probe.mjs
pnpm exec node scripts/run-body-inputs-checkpoint.js final
pnpm run test:sdd:complete --spec=010-entradas-cuerpo
```

Los checkpoints conservan argumentos, tiempos, salidas y hashes. El final
ejecutó Node/Chromium/Vite y otro ensayo RLS fresco con Supabase CLI 2.121.0
local mediante SDD_SUPABASE_CLI. [Mutaciones](evidence/mutations-body-inputs.json),
[recibos](evidence/proof-receipts.json) y [entrada estándar](evidence/generic-entry-local.json).
Build: index 512,58 kB, gzip 149,46 kB; conserva el warning mayor de 500 kB.
No se cambiaron dependencias/lockfile ni se repitieron auditoría e instalación
limpia locales para este cambio; CI mantiene instalación frozen-lockfile.

# Verificación local 010

Estado: E0 completada, E1/E2 pendientes. No publicación ni integración autorizadas.

Plan aprobado en c8be7bd33b30b6e40f0006e5e270c695bd525208; [G-PIN](evidence/baseline.json).
Baseline original: 372 Node, 35 Chromium y build aprobados. [Checkpoint](evidence/original-checkpoint-attempt-1.json).
Regresiones propias: tres controles originales pasan y cinco casos CHANGE fallan por FR-005–010, con dos tests de metadatos verdes. [Recibos E0](evidence/e0-attempt-3.json).

Los intentos e0-browser-attempt-1/2 son preparación, no cierre: el primero no avanzaba la animación de medidas y obtuvo un fallo de instrumental; se corrigió antes de congelar y se repitieron los ocho casos. El checkpoint 3 captura huellas antes/después y confirma 3/5. No cambió src.

sourceHash: e4e98de0fa1bced3a4372dab58e63172257ed8003eafad8febe306260312b377.
verificationHash E0: 5ed93975663b772143bc8c1be23b9c8d5db7f446ce53c0b73d2748c1d15337ba.
123 firmas anteriores intactas y nueve propias congeladas. Seis IDs completos/dieciocho pending; ninguna garantía CHANGE cerrada todavía.

RLS fresco, mutaciones y los diez contratos/274 IDs pertenecen al cierre E2 y no se presentan como ejecutados.

## Verde dirigido E1

Seis pruebas Node y ocho Chromium propios aprobados; [recibos](evidence/candidate-targeted.json). Adendas PIN-010-001–006 y transición de fuente emitidas con huellas estables, 117 firmas anteriores intactas/seis enmendadas y nueve E0 intactas.

sourceHash candidato: d98481bc21caa1ade1675c38fef36c33f0a74ff2ab7a1db94d301a4d3388a38e.
verificationHash candidato: 5755d70bbd9733dfff185449bd9fdc5495da2b1a8cdd323840abd5a2aebcbc3d.

La suite íntegra E1 sigue en ejecución; mutaciones y RLS fresco aún pendientes. La tarea aditiva T032 protege los archivos fuente históricos ante CRLF sin cambiar producto o pins E0.

## E1 intento 1 y corrección de integridad

El primer checkpoint íntegro obtuvo 371 de 377 pruebas Node aprobadas. Los seis
fallos corresponden al cambio no previsto del archivo raíz .gitattributes en
T032; no se ejecutaron Chromium/build de ese intento después del fallo.
[Recibos y fallo](evidence/e1-attempt-1.json).

T033 restaura su firma `4e14828ae37396a15a48f0b83f5b6e974c7f61a84b6a7228b706f1e8bcc8ab9e`
y sitúa la protección LF en un archivo nuevo de atributos dentro de la carpeta
de evidencia, sin modificar un séptimo pin ni los nueve propios E0.
[Control corregido](evidence/portability-corrected.json). Se está repitiendo
todo el checkpoint E1. El informe de portabilidad es el último control de filtros;
el fallo de integridad original permanece en los recibos del intento 1.

## Checkpoint E1 completo aprobado — 2026-10-28

379 Node, 43 Chromium y build aprobados sin skips/retries; [E1](evidence/e1.json). Seis enmiendas canónicas legadas y dos técnicas propias, siete archivos E0 intactos y ocho E1 congelados. La repetición completa valida T033/T034.

Los contratos ordinarios están verificados; 002 y las filas dependientes de recibos de mutación no se recertifican como completos en E1. E2 exige diecinueve mutaciones postverde, negativos de recibos y RLS fresco; el contrato de código 010 aún no está cerrado.

## RLS fresco previo al cierre E2

Ensayo local desechable aprobado: tres contratos reales y limpieza. [RLS](evidence/rls-readiness.json), [recibos](evidence/rls-readiness-attempt-1.json). No certifica backend productivo; el checkpoint final exige otro ensayo fresco posterior a su inicio.

## Mutaciones y recibos E2 aprobados

Diecinueve mutaciones postverde detectadas y limpieza confirmada. Trece controles negativos de recibos, dos positivos y restauración; ocho archivos E1 intactos. [Negativos](evidence/receipt-negatives.json). El cierre requiere aún el checkpoint final y la entrada genérica completa.
