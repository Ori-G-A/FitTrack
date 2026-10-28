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

## E2 — cierre local 2026-10-27 (Bogotá)

372 Node, 35 Chromium/build, nueve contratos/250 IDs completos, catorce mutaciones con quince controles positivos, nueve negativos de recibos y RLS real fresco con limpieza. [Checkpoint](evidence/final.json), [revisión](evidence/completion-review.json), [entrada genérica local](evidence/generic-entry-local.json). Cero skips/retries/flakies.

T027 completó la huella inicial/final del reportador genérico. La primera ejecución de catorce mutaciones se conserva en proofs-before-t027.json como histórica/no elegible para cierre; la repetición usa la huella definitiva sin etiquetado retrospectivo. Los nueve recibos falsos fueron rechazados y los dos controles positivos pasaron; se restauró el archivo original.

113 firmas anteriores intactas, tres enmendadas por diff canónico y siete E0 propias intactas. Producto, SQL y dependencias conservados. Bundle: 512.58 kB/gzip 149.47 kB frente a 512.58/149.47; aviso >500 kB conservado, sin optimización atribuida.

No se certifican producción, DNS, lectores de pantalla ni toda inestabilidad. La espera no diagnosticada de montaje de 007 no se atribuye a la carrera reparada. Publicación, integración y Vercel 009 requieren autorización específica posterior.

## Integración 009 verificada — 2026-10-27 (Bogotá)

Los PRs [#20 documental](https://github.com/Ori-G-A/FitTrack/pull/20) y
[#21 de código](https://github.com/Ori-G-A/FitTrack/pull/21) están integrados,
en ese orden, con ambos jobs de CI aprobados para cada PR. El resultado
`392e797` aprobó [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/40617873796)
y Vercel confirmó Production para ese mismo SHA. 372 Node, 35 Chromium,
nueve contratos/250 IDs, catorce mutaciones y RLS fresco real con limpieza
confirmados. Las huellas de producto y verificación coinciden con el cierre local.
[Registro](evidence/integration.json).

La URL técnica respondió HTTP 302 y redirigió al acceso de Vercel; no se realizó
una prueba autenticada de FitTrack ni se certifican políticas del backend
productivo. Esta observación sustituye la limitación DNS anterior para esa URL
en este entorno. La espera de montaje no diagnosticada de 007, los demás
hallazgos y el aviso de bundle se conservan; no se promete estabilidad absoluta.

Este estado sustituye las esperas históricas de autorización, publicación e
integración de 009. No concede autorizaciones permanentes para futuras specs.
