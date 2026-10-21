# Revisión de KD-002 — candidata tras integración006

Estado: revisión local y remota completada; retirada ratificada mediante
PATCH 1.0.3 el 2026-10-20. Aplicada localmente, con integración documental
pendiente de CI verde. Los párrafos siguientes conservan la revisión previa.

La evidencia local cubre184 IDs en seis contratos, cada cláusula006 y las aserciones de los21 casos estáticos. La lectura textual complementa pruebas funcionales; los títulos generales conservan los límites explícitos de assertion-audit.md. Los negativos, pins y RLS respaldan el cierre local.

Antes de proponer retirada normativa: integrar006 con CI remoto verde, revisar el informe de impacto y preparar una PATCH en rama/PR propios. El propietario debe ratificarla por separado. Mantener KD-002 activa hasta ese acto. No se infiere cobertura de futuras funciones ni de comportamiento fuera de los contratos aprobados.

Actualización tras integración: PRs #13/#14 fusionados; ambos jobs de CI de
main y Production aprobados para `492be5d`. [Registro](evidence/integration.json).
La revisión de las 21 regresiones y aserciones fuera de ese archivo conserva
los límites de [auditoría](assertion-audit.md). Las 101 firmas se verificaron
con dos enmiendas técnicas: PIN-006-001 para el reloj y PIN-006-002 para esperar
el render de la fixture FR-023, ambas con reproducción sobre el original.

El [informe de impacto PATCH 1.0.3](../../docs/sdd/amendment-1.0.3.md) y su diff
están preparados en rama propia. La evidencia respalda proponer la retirada
para 001–006, no cobertura universal. La constitución vigente permanece intacta
y M7 no se declara cerrado antes de ratificación expresa.

Ratificación recibida posteriormente: «Ratificar PATCH y autorizar publicación,
integración con CI verde y Vercel». Permite retirar KD-002 y satisface la puerta
normativa M7. La constitución 1.0.3 conserva los límites y hallazgos; la entrega
documental se integrará solo cuando CI remoto esté verde.
