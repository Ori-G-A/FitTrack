# Precisión de SC-001 — APROBADA el 2026-10-27

El alcance y las etiquetas de FR-001–007 permanecen. Esta precisión requiere
decisión expresa; aprobar el alcance previo no la autoriza por inferencia.

## Motivo

SC-001 aprobado pide regresiones rojas específicas para cuatro CHANGE. La
carrera de FR-004/005 sí se reproduce como fallo en el original. En cambio,
los montajes ya propagan errores: parte de FR-006 es una garantía que se debe
conservar, mientras identificar la etapa añade evidencia de prueba. FR-007 es
una obligación de evidencia de cierre que abarca original, candidato y una
mutación posterior; no es un comportamiento defectuoso ejecutable aislado en
el original. No se puede fingir un rojo de negocio por un reporte aún ausente.

## Texto anterior

SC-001: tres AS-IS caracterizados en el original y cuatro CHANGE con regresiones
rojas específicas antes de cambiar los fixtures; sin usar el diagnóstico como G-PIN.

## Texto aprobado

SC-001: caracterizar los tres AS-IS sobre el original; reproducir regresiones
rojas específicas de la carrera de FR-004/005 antes de modificar los fixtures;
registrar los controles de propagación de errores de FR-006 como preservación
cuando ya pasen en el original, añadiendo evidencia de etapa sin atribuirle un
defecto previo. FR-007 exige rojo original, verde candidato, reintroducción
negativa posterior y validación de enmiendas antes del cierre. Ningún reporte
ausente, API nueva inexistente o fallo de instrumental cuenta como rojo de
negocio. Los sondeos previos no sustituyen G-PIN.

La precisión no elimina controles, no relaja sus aserciones y no autoriza
implementar por sí misma. El plan solicita aprobarla junto con E0–E2 local.

Decisión expresa: «Aprobar plan y precisión SC-001; autorizar ejecución local E0–E2». La precisión se aplica a spec.md junto con la autorización local, sin extenderla a entrega remota.
