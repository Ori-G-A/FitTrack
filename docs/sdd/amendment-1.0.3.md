# Enmienda PATCH 1.0.3 — cierre de adopción 001–006

Estado: RATIFICADA y aplicada localmente; integración pendiente de CI remoto.
Fecha: 2026-10-20 (Bogotá). Rama propia: `codex/sdd-constitution-1.0.3`.
Constitución vigente en esta entrega: [1.0.3](../../.specify/memory/constitution.md).
El propietario respondió «Ratificar PATCH y autorizar publicación, integración
con CI verde y Vercel» a la propuesta concreta. El «continua» anterior autorizó
su preparación; la ratificación procede de la respuesta posterior explícita.

La implementación de las seis áreas ya está integrada. Se ratificó retirar
KD-002 porque la trazabilidad y la comprobación funcional que faltaban tienen
evidencia dentro de los contratos aprobados. No se elimina la inspección
textual útil ni se equipara un conteo de IDs con cobertura universal.

## Cambios ratificados

El [diff propuesto y ratificado](amendment-1.0.3.patch) deja intactos los requisitos
normativos de P1–P6, el flujo de aprobaciones y las autorizaciones puntuales.
Actualiza los hechos de adopción y propone retirar la última desviación activa.
Se conserva como snapshot de la propuesta revisada, incluidos sus estados
pendientes originales. La constitución aplicada sustituye esos marcadores por
la fecha y respuesta recibidas; el snapshot no es una segunda norma vigente.

1. Pasar de 1.0.2 a 1.0.3 con la ratificación y evidencia registradas.
2. Actualizar los hechos de P1/P6 y cumplimiento a seis contratos y 184 IDs.
3. Identificar como aprobadas las specs propietarias de las invariantes,
   conservando las citas históricas y la exigencia de CHANGE para modificarlas.
4. Retirar KD-002 del registro activo, con historial y límites conservados.
5. Registrar CI de `492be5d`, su Production autorizado y la ausencia de una
   prueba autenticada de producción. Las autorizaciones siguen siendo puntuales.
6. Sincronizar roadmap, aprobaciones, revisión KD y guía de continuidad sin
   reescribir las decisiones históricas ni declarar corregidos otros hallazgos.

## Evidencia y revisión de KD-002

Main consultado durante esta revisión: `492be5d22a71a885c9be158aa3401f8a229f7326`.
Ambos jobs de [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/39538254800)
están aprobados. PRs [#13](https://github.com/Ori-G-A/FitTrack/pull/13) y
[#14](https://github.com/Ori-G-A/FitTrack/pull/14) integrados en orden.
[Registro de integración y Production](../../specs/006-interfaz/evidence/integration.json).

| Área | IDs completos | Evidencia contractual |
| --- | --- | --- |
| 001 datos | 21 | [Manifiesto](../../specs/001-datos/traceability.json) |
| 002 identidad/fotos | 23 | [Manifiesto](../../specs/002-identidad-fotos/traceability.json) |
| 003 entrenamiento | 21 | [Manifiesto](../../specs/003-entrenamiento/traceability.json) |
| 004 nutrición/objetivos | 31 | [Manifiesto](../../specs/004-nutricion-objetivos/traceability.json) |
| 005 cuerpo/ciclo | 40 | [Manifiesto](../../specs/005-cuerpo-ciclo/traceability.json) |
| 006 interfaz | 48 | [Manifiesto](../../specs/006-interfaz/traceability.json) |
| Total | 184 | Cero filas partial/pending en las seis matrices |

La comprobación documental volvió a contar las filas y verificar que tienen
pruebas asignadas. `verifyInterfacePins()` validó 101 firmas, 68 anteriores y
33 de 006, con las dos enmiendas técnicas explícitas. Esto comprueba integridad
de los artefactos; la evidencia de ejecución viene de CI y de los checkpoints.

La [auditoría de aserciones](../../specs/006-interfaz/assertion-audit.md) revisa
los 21 casos textuales y sus cláusulas. El [mapa individual](../../specs/006-interfaz/static-regression-map.md)
los vincula a pruebas funcionales; la [revisión por FR](../../specs/006-interfaz/assertion-review.md)
detalla qué se verifica. Se revisaron además los asserts de interfaz fuera del
archivo textual, distinguiendo arquitectura, guardas y comportamiento.

El cierre local registra 314 pruebas Node, 27 recorridos Chromium, tres pruebas
RLS reales con limpieza y tres mutaciones detectadas con controles positivos.
[Evidencia E6](../../specs/006-interfaz/evidence/final.json). Las enmiendas
[PIN-006-001](../../specs/006-interfaz/evidence/pin-amendment-001.json) y
[PIN-006-002](../../specs/006-interfaz/evidence/pin-amendment-002.json) conservan
firmas previas y reproducción sobre el original: 20 AS-IS verdes y siete
CHANGE rojos por motivos esperados. No se borraron los fallos previos de CI.

Conclusión de revisión del agente: existe evidencia para proponer retirar
KD-002 en el alcance aprobado de 001–006. La revisión no es ratificación humana
ni revisión independiente de otro agente. La ratificación posterior del
propietario satisface la puerta normativa M7; la integración de esta entrega
documental espera CI remoto verde.

## Límites que se conservan

- RLS se ejecutó en Supabase local desechable; no certifica el backend productivo.
- No hubo prueba autenticada de producción, Safari/Firefox ni lectores de pantalla.
- Geometría bajo Chromium, siete anchos y fuentes fallback fijas; no todos los dispositivos.
- Los títulos antiguos sobre cuatro pantallas con toast y supresión universal
  del ciclo no amplían lo que sus aserciones y contratos realmente verifican.
- DATA, IDEN, PHOTO, TRAIN, NUTR, BODY, UI y PERF conservan sus seguimientos
  en el roadmap. Retirar KD-002 no los corrige ni autoriza nuevos CHANGE.
- Persisten el aviso de bundle mayor de 500 kB y las diferencias AS-IS aprobadas.

## Informe de impacto de sincronización

| Artefacto | Preparación revisada | Aplicación ratificada |
| --- | --- | --- |
| Constitución | Diff original conservado | 1.0.3 aplicada, KD-002 retirada y respuesta/fecha registradas |
| Roadmap | Resumen de 006 integrado | Puerta normativa M7 satisfecha; integración documental pendiente |
| Aprobaciones | Propuesta distinguida de ratificación | Decisión exacta y permisos recibidos registrados |
| Revisión KD-002 | Evidencia local y remota | Retirada ratificada registrada |
| Continuidad | Guía de mantenimiento y pendientes preparada | Conservar como referencia de transferencia |
| AGENTS y plantillas | Inspeccionados; sus enlaces siguen siendo válidos | No requieren cambios de reglas |
| Runtime, tests, SQL, dependencias y secretos | Sin cambios | Sin cambios |

## Entrega e integración autorizadas

Preparar un único PR documental desde esta rama, incluyendo el commit local
`7b523f7` de cierre remoto de 006. Esos registros aún no están en main; su
inclusión evita publicar un PR adicional solo para ese cierre. El cuerpo
preparado está en [amendment-1.0.3-pr.md](amendment-1.0.3-pr.md).

La aprobación recibida comprende ratificación, aplicación, publicación del
PR, fusión cuando CI remoto esté verde y el despliegue automático de Vercel
asociado. Permite registrar esta etapa aprobada en un commit y publicar el PR.
Tras fusionar se verificará CI de main y Production.

Verificación de preparación: enlaces locales, diff constitucional aplicable,
184 filas completas, 101 firmas y comparación contra main de archivos de
runtime/SQL/dependencias. No se reinstalan dependencias ni se repite runtime
por estos cambios exclusivamente documentales.
