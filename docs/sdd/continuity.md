# Continuidad de FitTrack tras la refactorización SDD

Estado: guía operativa actualizada tras integrar 001–009. La constitución vigente
es [1.0.3](../../.specify/memory/constitution.md), ratificada el 2026-10-20;
la [enmienda](amendment-1.0.3.md) satisface la puerta normativa M7 y su
integración documental se verifica en el [PR #15](https://github.com/Ori-G-A/FitTrack/pull/15).
No hay alcance nuevo aprobado aquí.

## Punto de partida verificable

Main integrado: `392e797b54478ec96b9bd9d352a1dde5d53c4376`.
[CI](https://github.com/Ori-G-A/FitTrack/actions/runs/40617873796) y Production
aprobados para ese SHA. [Registro completo](../../specs/009-reloj-pruebas/evidence/integration.json).
Los nueve contratos suman 250 IDs completos; 372 Node, 35 Chromium, catorce
mutaciones y RLS local real con limpieza verificados. La URL técnica responde
HTTP 302 y redirige al acceso de Vercel; no hay prueba autenticada de FitTrack.
El registro de cierre posterior se publica en la rama 009, sin atribuirlo al
commit de main verificado.


La guía de módulos y comandos está en [AGENTS](../../AGENTS.md). Las variables
y previews están en [README](../../README.md). Cada spec contiene su contrato,
plan, tareas, manifiesto, investigación y evidencia; para modificar un área
hay que leer esos artefactos y sus llamadores, no solo el componente visible.

## Cómo continuar un cambio

1. Elegir un resultado de usuario y revisar el hallazgo correspondiente en
   [roadmap](roadmap.md). Los pendientes no son autorización para corregirlos.
2. Caracterizar el comportamiento actual. Definir CHANGE explícitos y obtener
   aprobación de alcance; preparar y aprobar el plan técnico por separado.
3. Crear rama propia, mantener IDs estables y registrar trazabilidad. Fijar los
   AS-IS sobre el original y el fallo esperado de cada CHANGE antes de implementar.
4. Ejecutar las puertas del área y sus dependencias. Usar el runtime declarado,
   fixtures sin credenciales y RLS local desechable cuando corresponda. Una
   inspección SQL no sustituye el servidor real.
5. Cerrar converge y revisar aserciones. Una enmienda de pin debe conservar
   firmas, motivo, FR y evidencia renovada; nunca adaptar el resultado esperado
   para ocultar un fallo. Repetir completo el checkpoint que falló.
6. Preparar el PR con omisiones, evidencia y orden de merge. Publicar, integrar
   y permitir Vercel solo con autorización que cubra esa entrega. Comprobar el
   SHA exacto, CI de main y Production después de la fusión.

## Siguientes decisiones recomendadas

| Orden propuesto | Resultado | Referencias y decisión necesaria |
| --- | --- | --- |
| 1 | Validar el uso real después del despliegue | Prueba autenticada de producción supervisada por el propietario, con cuenta y datos acordados; no ejecutar escrituras implícitas |
| 2 | Reforzar límites de entradas y fotos | BODY-001 y PHOTO-001: decidir validación y fronteras sin cambiar fórmulas clínicas |
| 3 | Resolver compatibilidades de interfaz y medir rendimiento | UI-006-003/004/005/006 y PERF-001: elegir un objetivo y baseline; no ampliar accesibilidad ni optimización por inferencia |

El cierre inicial/PATCH y los fallos de guardado y borrado ya cuentan con sus
entregas verificadas; 007/008/009 no autorizan corregir otros hallazgos.
Este orden es una recomendación para priorizar, no una aprobación de producto
ni una nueva numeración de specs. Los demás hallazgos siguen en el roadmap;
no se consideran cerrados por completar la refactorización.

## Límites de la evidencia

La ejecución funcional usa Chromium y servicios sintéticos con red bloqueada.
No certifica todos los dispositivos, lectores de pantalla ni exactitud clínica.
RLS está probado localmente con usuarios A/B/anónimo y limpieza; no se ha
verificado una sesión autenticada ni las políticas efectivas de producción.
Se conserva el warning de chunk mayor de 500 kB. La guía describe software
observado y contratos aprobados, no consejo médico.

## Propuesta 010 — 2026-10-27 (Bogotá)

La siguiente propuesta concreta es [010: entradas de Cuerpo](../../specs/010-entradas-cuerpo/spec.md),
preparada en la rama codex/010-entradas-cuerpo a partir del cierre documental
009. [Survey](entradas-cuerpo-survey.md): nueve casos sintéticos y tres
caracterizaciones originales aprobadas. BODY-001 sigue abierto; aprobar alcance
y C-001/002/003 antes de preparar el plan. No hay implementación ni cambios
en firmas. La entrega remota requiere su propia autorización posterior.

## Alcance 010 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar alcance y las tres aclaraciones» a
[010](../../specs/010-entradas-cuerpo/spec.md): cuatro AS-IS, seis CHANGE,
catorce escenarios y C-001/002/003. Aprueba decimal explícito coma/punto,
positivos para peso/medidas/pulso, cero conocido para sueño/pasos, sin máximos
ni enteros nuevos; rechazo completo con error accesible y borrador conservado,
sin limpiar historia. Autoriza preparar plan/tareas/análisis y proponer
enmiendas de 005 y del verificador 009, para aprobación separada. No autoriza
implementar, publicar, fusionar ni desplegar 010.
