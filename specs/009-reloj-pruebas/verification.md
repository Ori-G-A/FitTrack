# Verificación 009

## E0 — 2026-10-27 (Bogotá)

Plan aprobado `5658328`. Original: 370 Node, 30 Chromium y build, sin omisiones/retries. 116 firmas efectivas y producto intactos. [Original](evidence/original-checkpoint.json).

[G-PIN](evidence/baseline.json): tres controles nuevos verdes y dos regresiones rojas específicas, con seis combinaciones demoradas y tres fixtures fallando antes de inyectar App. Dos tests Node de metadatos verdes. Nueve IDs completos/siete pending; siete archivos nuevos congelados.

El intento Chromium 1 registró un error del instrumental: esperaba la fecha inicial después de que el montaje original de guardado avanzara explícitamente 600 ms. Se corrigió esa expectativa antes de congelar y se repitieron los cinco casos. El intento fallido se conserva, sin atribuirlo al producto ni contar sus dos errores adicionales como rojo contractual. [Intento 1](evidence/e0-browser-attempt-1.json).

La reparación de los tres fixtures todavía no se ha aplicado. RLS, mutaciones y cierre E1/E2 siguen pendientes.

## E1 — 2026-10-27 (Bogotá)

372 Node, 35 Chromium y build aprobados, cero skips/retries/flakies. [Checkpoint](evidence/e1.json). Catorce IDs propios completos/dos pending; 002 excluida de este perfil hasta RLS fresco de E2. No se presenta ese perfil como nueve contratos completos.

Tres enmiendas de preparación validadas por diff canónico; 113 de 116 firmas efectivas intactas y tres enmendadas, siete E0 propios intactos. src conserva el hash original. Los recuentos del legado 008 describen 105/3 anteriores y 7/1 nuevos; sus aserciones de borrado no cambian.

CI conserva las ocho puertas anteriores y el job RLS separado. El runner de proofs ejecuta las tres CLIs de mutación heredadas sin cambiar sus oráculos y añade la de reloj; registra huella antes/después y salidas, en lugar de añadir metadatos retrospectivos. E2 y autorización remota siguen pendientes.
