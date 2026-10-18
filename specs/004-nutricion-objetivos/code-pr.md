# Título previsto

Separar nutrición, objetivos y métricas preservando su comportamiento

# Cuerpo preparado para revisión

Nutrición, Biblioteca, Ajustes, Diario y Métricas mezclaban cálculos con
coordinación. La extracción lleva catálogo/proteína, normalización, registros,
objetivos y métricas a ocho módulos puros y conserva las APIs anteriores.
Por ejemplo, una receta sigue guardando snapshots y grams=null; autoMacros
continúa ejecutándose solo mientras Ajustes está montado, también en datos.

Validación local: baseline previa a src;18 archivos de pins propios y 22 anteriores
intactos;263 Node, 9 Chromium, build correcto y 3 contratos RLS reales con
cleanup. Gate002 repetido íntegro; manifiestos 001/002/003/004:21/23/21/31 IDs
completos sobre los mismos resultados/hash. Cuatro mutaciones detectadas y
límites transitivos comprobados. Las 29 tareas completadas, converge sin gaps locales.
[Resumen final](evidence/final.json), [converge](converge.md),
[RLS renovada](evidence/rls-final.json), [recuperación previa](evidence/recovery.json).

CI 004 añadido conservando los gates anteriores; todavía sin resultado remoto.
Sin SQL ni dependencias nuevas. NUTR preservados; inferencia de peso/ciclo y
rediseño visual fuera. El build conserva aviso de chunk>500kB; la maqueta antigua
mantiene su marcador de Nutrición. No se afirma prueba RLS sobre producción.

Orden previsto: revisión del propietario, autorización/publicación de la rama y PR,
CI remoto verde sobre el head revisado, decisión de integración y autorización
expresa del despliegue automático de Vercel. No hay autorización permanente de
entregas anteriores. Rollback revierte código por entrega sin migrar datos.
PR preparado; no publicado, fusionado ni desplegado004.
