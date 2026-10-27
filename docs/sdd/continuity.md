# Continuidad de FitTrack tras la refactorización SDD

Estado: guía operativa actualizada tras integrar 001–008. La constitución vigente
es [1.0.3](../../.specify/memory/constitution.md), ratificada el 2026-10-20;
la [enmienda](amendment-1.0.3.md) satisface la puerta normativa M7 y su
integración documental se verifica en el [PR #15](https://github.com/Ori-G-A/FitTrack/pull/15).
No hay alcance nuevo aprobado aquí.

## Punto de partida verificable

Main integrado: `1f6b29d41d05aa3ca9321ab737035a347973f13d`.
[CI](https://github.com/Ori-G-A/FitTrack/actions/runs/40537644734) y Production
aprobados para ese SHA. [Registro completo](../../specs/008-borrado-fiable/evidence/integration.json).
Los ocho contratos suman 234 IDs completos; 370 Node, 30 Chromium, once
mutaciones y RLS local real con limpieza verificados. La consulta HTTP de la URL
técnica sigue sin poder resolverse o alcanzarse desde este entorno; no hay
prueba autenticada de producción. El cierre documental posterior está publicado
en `6d9aa20` de la rama 008, sin atribuir ese commit a main.

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
| 1 | Completar la entrega de la mejora del reloj | [Propuesta 009](../../specs/009-reloj-pruebas/spec.md): E0–E2 verificadas localmente; publicación, integración y Vercel pendientes de autorización |
| 2 | Validar el uso real después del despliegue | Prueba autenticada de producción supervisada por el propietario, con cuenta y datos acordados; no ejecutar escrituras implícitas |
| 3 | Reforzar límites de entradas y fotos | BODY-001 y PHOTO-001: decidir validación y fronteras sin cambiar fórmulas clínicas |
| 4 | Resolver compatibilidades de interfaz y medir rendimiento | UI-006-003/004/005/006 y PERF-001: elegir un objetivo y baseline; no ampliar accesibilidad ni optimización por inferencia |

El cierre inicial/PATCH y los fallos de guardado y borrado ya cuentan con sus
entregas verificadas; 007/008 no autorizan corregir otros hallazgos.
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
