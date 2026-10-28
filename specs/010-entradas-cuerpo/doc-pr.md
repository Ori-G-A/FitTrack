# PR documental 010 — preparado, sin publicar

Estado: BORRADOR de descripción. Alcance aprobado; plan/tareas/análisis y
ejecución local todavía pendientes. No hay PR creado ni autorización remota.

Título propuesto: `docs(sdd): planificar entradas numéricas fiables en Cuerpo (010)`.

## Cuerpo propuesto

Los formularios de Cuerpo permiten guardar negativos/valores no finitos y
tratan de forma distinta la coma decimal. 010 propone validar los nueve campos
antes de reemplazar datos, conservar borradores ante rechazo y mostrar errores
accesibles. Positivos para peso/medidas/pulso; cero conocido para sueño/pasos,
sin máximos, enteros ni limpieza histórica nuevos.

Incluye spec, decisiones, matriz de pruebas y 31 tareas E0–E2. Propone seis
enmiendas congeladas, transición de fuente 009→010 y cierre con diez contratos/
274 IDs y RLS local fresco. Las fórmulas, fotos, ciclo, dependencias y SQL quedan
fuera. [Plan](plan.md), [enmiendas](pin-amendments.md), [análisis](analyze.md).

Evidencia actual: nueve casos sintéticos del survey, tres caracterizaciones
originales aprobadas, enlaces/24 IDs revisados y firmas intactas. No acredita
implementación, baseline G-PIN, Chromium nuevo, suite completa o RLS de 010.
La evidencia ejecutada se añadirá al PR de código tras la autorización local.

Orden propuesto: snapshot documental aprobado primero; código, verificadores y
evidencia después. Ninguna publicación, integración o despliegue está autorizada
por la aprobación del alcance o del plan local. Revisar nuevamente este cuerpo
al preparar la entrega remota, conservando la cronología y los límites reales.

## Aprobación de planificación — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2». Aprueba plan, 31 tareas y análisis,
y autoriza E0–E2 local antes de integrar el PR documental con snapshot aprobado.
Las esperas de decisión local anteriores son históricas. No autoriza publicar,
fusionar ni desplegar 010.
