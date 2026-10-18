# Borrador de revisión — no listo para integración

Título previsto: Separar nutrición, objetivos y métricas preservando su comportamiento

Nutrición, Biblioteca, Ajustes, Diario y Métricas mezclaban cálculo y coordinación.
La extracción lleva catálogo/proteína, normalización, registros, objetivos y
métricas a ocho módulos puros, manteniendo las APIs anteriores y el momento de
actualización de cada pantalla. Cantidades y recetas conservan snapshots,
conversiones y diferencias de validación y fechas del comportamiento existente.

Validación: baseline previa a src;18 archivos de pins propios y 22 anteriores
intactos. Checkpoint actual: 263 Node, 9 Chromium, 31/31 contratos de 004 y build verde.
001/003:21/21 cada una sobre los mismos resultados. Límites transitivos y cuatro
mutaciones comprobados; CI de 004 configurado, sin resultado remoto observado.

Bloqueo: RLS real desechable no ejecutada por fallo de arranque Docker; cleanup
sin confirmar. 002 y G-CLOSE no están aprobados. [Converge](converge.md),
[evidencia](evidence/e5.json), [RLS](evidence/rls-local.json). Resolver T029 y
repetir el checkpoint002 antes de convertir este borrador en entrega final.

Sin SQL ni dependencias nuevas. NUTR preservados; algoritmos de peso/ciclo y
rediseño visual fuera. Rollback revierte código por entrega sin migrar datos.
Publicación, aceptación final, integración y despliegue requieren sus decisiones
posteriores; no se han solicitado como si RLS estuviera completa.
