# Continuidad de FitTrack tras la refactorización SDD

Estado: guía operativa actualizada tras integrar 001–010. La constitución vigente
es [1.0.3](../../.specify/memory/constitution.md), ratificada el 2026-10-20;
la [enmienda](amendment-1.0.3.md) satisface la puerta normativa M7 y su
integración documental se verifica en el [PR #15](https://github.com/Ori-G-A/FitTrack/pull/15).
No hay alcance nuevo aprobado aquí.

## Punto de partida verificable

Main integrado: `e4276820142e082fc601110e91d85e05ed73e5c3`.
[CI](https://github.com/Ori-G-A/FitTrack/actions/runs/40775635221) y Production
aprobados para ese SHA. [Registro completo](../../specs/010-entradas-cuerpo/evidence/integration.json).
Los diez contratos suman 274 IDs completos; 379 Node, 43 Chromium, diecinueve
mutaciones y RLS local real con limpieza verificados. La URL técnica responde
HTTP 302 y redirige al acceso de Vercel; no hay prueba autenticada de FitTrack.
El registro de cierre posterior se publica en la rama 010, sin atribuirlo al
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
| 1 | Validar el uso real después del despliegue | Prueba autenticada supervisada, con cuenta y datos acordados; no ejecutar escrituras implícitas |
| Futuro | Evaluar el backlog separado | PHOTO-001, BODY-002–005, UI-006-003/004/005/006 y PERF-001 requieren decisiones propias; no iniciar 011 automáticamente |

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

## Planificación 010 preparada — 2026-10-27 (Bogotá)

[Plan](../../specs/010-entradas-cuerpo/plan.md), 31 tareas E0–E2, matriz,
seis enmiendas y análisis preparados para aprobación separada. 24 IDs propios
pending, con nombres previstos y tareas. Se propone cierre de diez contratos/
274 IDs, 43 Chromium, diecinueve mutaciones postverde y RLS local fresco con
limpieza. Las seis firmas y las 123 efectivas actuales se inventariaron sin
modificarlas; producto, pruebas y verificadores intactos. Plan y ejecución
local antes del PR documental pendientes; publicación, integración y Vercel
requieren decisión posterior. 010 es la última entrega actual propuesta:
informe final y backlog separado, sin iniciar 011 automáticamente.

## Plan 010 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2» a
[010](../../specs/010-entradas-cuerpo/plan.md). Aprueba las 31 tareas, plan,
análisis, seis enmiendas acotadas y ejecución local E0–E2 antes del PR documental,
con snapshot aprobado. Incluye informe final y mantiene RLS local fresco como
requisito de cierre. No publicar, fusionar ni desplegar sin decisión específica.

## Cierre local 010 — 2026-10-28 (Bogotá)

379 Node, 43 Chromium/build, diez contratos/274 IDs, diecinueve
mutaciones postverde, trece negativos de recibos/dos positivos y RLS fresco
real con limpieza verificados. Seis enmiendas legadas y dos técnicas propias;
123 firmas anteriores, nueve E0 y ocho E1 verificadas. [Converge](../../specs/010-entradas-cuerpo/converge.md)
y [informe final](refactor-final.md). Las 31 tareas originales se conservan
con T032–T035 aditivas; publicación, integración y Vercel siguen pendientes de
autorización específica. BODY-001 queda resuelto localmente, sin certificar
producción ni cerrar los demás hallazgos; no se inicia otra spec por inferencia.

## Entrega remota 010 autorizada — 2026-10-28 (Bogotá)

Sobre el cierre local e3b1d04, el propietario respondió «Autorizar publicación,
integración con CI verde y Vercel». Autoriza ambas ramas/PRs, documental primero
y código después, con CI remoto verde y despliegue automático asociado.
[Decisión](../../specs/010-entradas-cuerpo/evidence/remote-authorization.json).
No se presenta aún como integración o despliegue verificados.

## Integración 010 verificada — 2026-10-28 (Bogotá)

Los PRs [#22 documental](https://github.com/Ori-G-A/FitTrack/pull/22) y [#23 de código](https://github.com/Ori-G-A/FitTrack/pull/23) están integrados, en ese orden, con ambos trabajos de CI aprobados para cada PR. El resultado `e427682` aprobó [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/40775635221) y Vercel confirmó Production para ese mismo SHA. 379 Node, 43 Chromium, diez contratos/274 IDs, diecinueve mutaciones y RLS real local con limpieza confirmados. Las huellas coinciden con el cierre local. [Registro](../../specs/010-entradas-cuerpo/evidence/integration.json).

BODY-001 queda resuelto en el alcance aprobado de los nueve campos. Se conservan historia, fórmulas y BODY-002–005. La comprobación del proveedor y de la URL técnica no constituye un smoke autenticado de FitTrack ni certifica las políticas del backend productivo. Los demás hallazgos y el aviso de bundle siguen en el backlog. Esta entrega cierra el alcance actual; no inicia 011.

Este registro posterior se publica en la rama 010; no se atribuye al árbol del commit de main verificado. Las esperas anteriores son históricas y no conceden autorización permanente para otras entregas.
