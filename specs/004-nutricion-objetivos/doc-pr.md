# Título previsto

Plan SDD 004: caracterizar y separar nutrición, objetivos y métricas

# Cuerpo preparado

El área alimentaria comparte cálculos, registros y coordinación entre FitTrack,
Biblioteca, Nutrición, Ajustes, Diario y Métricas. Este plan preserva 16 contratos
AS-IS y 15 escenarios con pins completos sobre código original antes de extraer.
El alcance y las tres aclaraciones fueron aprobados el 2026-10-18.

[Plan](plan.md), [validación](validation-plan.md), [tareas](tasks.md) y
[analyze](analyze.md) proponen seis entregas E0–E5 y 28 tareas. Conservan
validaciones, fórmulas, ventanas, snapshots y efecto autoMacros actuales;
peso/ciclo y cambios clínicos quedan fuera. Cero CHANGE y nuevas dependencias.

Validación documental: véase [verificación](verification.md). Los 31 IDs están
pending y tests vacíos: plannedTests son previsiones. No se ejecutaron pins004,
suite/build/Chromium ni RLS en esta etapa. Plan y ejecución local aprobados posteriormente en 5b5fb83. PR documental preparado, sin publicación ni integración remota declaradas.

Orden: aprobar documentos; integrar PR documental o autorizar ejecución local
antes de su integración; E0 verde sobre BASE; E1–E4 con checkpoints; E5/converge;
PR de código y aceptación posterior. Rollback de entregas revierte código sin
migraciones. No incluye autorización para publicar, fusionar o desplegar004.
