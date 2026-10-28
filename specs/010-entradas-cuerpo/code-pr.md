Estado vigente — 2026-10-28 (Bogotá): 010 integrada mediante #22/#23, con CI de main y Vercel Production verificados en `e427682`. [Entrega remota](evidence/integration.json). Los apartados siguientes conservan la cronología y sus decisiones ya cumplidas.

Estado vigente — 2026-10-28 (Bogotá): publicación de ambas ramas/PRs, integración con CI remoto verde y Vercel autorizadas. [Decisión](evidence/remote-authorization.json). Pendiente ejecutar y verificar la entrega; las esperas de autorización anteriores son históricas.

# PR de código 010 — preparado, sin publicar

Título propuesto: `fix(cuerpo): validar entradas antes de reemplazar registros`.

## Cuerpo propuesto

Cuerpo podía guardar negativos o valores no finitos y perder la coma decimal en medidas y bienestar. Los nueve campos se validan antes de reemplazar datos: coma/punto, positivos para peso/medidas/pulso y cero conocido para sueño/pasos. Si falla un campo, se conserva todo el borrador y el registro previo, con error accesible y corrección manual.

Conserva datos históricos, fórmulas, orden/ID diario, fotos, ciclo y coordinación de persistencia. No incorpora límites clínicos, enteros nuevos, dependencias ni SQL. El parser puro se separa de los handlers y builders.

Validación local: 379 Node, 43 Chromium/build, diez contratos/274 IDs, diecinueve mutaciones postverde, trece negativos de recibos/dos positivos y RLS fresco con limpieza. Seis enmiendas de pruebas/verificadores anteriores y dos técnicas propias, con originales/rojos/verdes/recibos; sin cambios de aserciones o plazos de los 35 recorridos anteriores.

[Verificación](verification.md), [converge](converge.md), [checkpoint](evidence/final.json), [presupuestos](evidence/budget-parity.json), [enmiendas](pin-amendments.md).

Orden de integración: PR documental del snapshot aprobado primero y este PR de código después, ambos con CI remoto verde. Esta descripción no concede autorización de publicación, fusión o Vercel.

Reversión: revertir de forma coordinada runtime, pruebas, resolutores y evidencia del cambio; no revertir ni borrar datos de usuario. El warning de bundle y los demás hallazgos permanecen fuera del alcance.

sourceHash: d98481bc21caa1ade1675c38fef36c33f0a74ff2ab7a1db94d301a4d3388a38e.
verificationHash: 84218601d12e133d5e99f3bd52c6a8b6c9e2d7ee543c7489df7d4a992430ed38.
