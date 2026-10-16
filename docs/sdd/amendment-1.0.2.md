# Propuesta de enmienda PATCH 1.0.2

Fecha: 2026-10-16. Estado: preparada para ratificación, NO APROBADA.
Rama propia: `codex/sdd-constitution-1.0.2`.
Constitución vigente: [1.0.1](../../.specify/memory/constitution.md).

La integración de 001/002 ya tiene evidencia remota y el propietario confirmó
que la aplicación funciona bien. Esta propuesta retira exclusivamente las
desviaciones resueltas; no cambia principios, contratos de producto, permisos
permanentes de despliegue ni los seguimientos de defectos preservados.

## Cambios exactos propuestos al ratificar

1. Incrementar la versión constitucional 1.0.1 a 1.0.2 y registrar la fecha y
   respuesta explícita de ratificación, sin inventarlas antes de recibirla.
2. Sustituir las afirmaciones de Vercel no verificado por el vínculo observado
   de main y el despliegue autorizado de 9a10a54. Conservar la necesidad de
   autorización para futuros despliegues; la aprobación registrada fue puntual.
3. Retirar KD-001, KD-003, KD-004 y KD-005 de la tabla de desviaciones activas.
   Conservar KD-002: la evidencia de 001/002 no cubre todas las áreas futuras.
4. Actualizar el estado de automatización: CI observado para 001/002, con capas,
   trazabilidad, Chromium y RLS local desechable. Conservar su alcance incremental.
5. Actualizar el informe de sincronización a esta PATCH; conservar el informe
   histórico 1.0.1 y sus decisiones originales.

## Evidencia para retirar cada desviación

| ID | Resolución integrada | Evidencia |
| --- | --- | --- |
| KD-001 | Coordinación de datos fuera de App y adaptadores explícitos | [Converge 001](../../specs/001-datos/converge.md), arquitectura y pins originales |
| KD-003 | app_data, Storage y diagnósticos ejercitados con usuarios reales A/B/anónimo en Supabase local desechable | [Converge 002](../../specs/002-identidad-fotos/converge.md), job rls-and-sdd-002 y limpieza verificada |
| KD-004 | Diagnóstico local fijo y sanitizado si falla reporting opcional, incluido logger que lanza | FR-013 y pruebas rojo/verde en [verificación 002](../../specs/002-identidad-fotos/verification.md) |
| KD-005 | Validación de configuración antes del SDK sin exponer valores | FR-012 y pruebas rojo/verde en verificación 002 |

Integración: PRs [#2](https://github.com/Ori-G-A/FitTrack/pull/2),
[#3](https://github.com/Ori-G-A/FitTrack/pull/3),
[#4](https://github.com/Ori-G-A/FitTrack/pull/4),
[#5](https://github.com/Ori-G-A/FitTrack/pull/5),
[#6](https://github.com/Ori-G-A/FitTrack/pull/6) y
[#7](https://github.com/Ori-G-A/FitTrack/pull/7).
[CI final](https://github.com/Ori-G-A/FitTrack/actions/runs/38939114677): aprobado
en `9a10a54efbf50fcac281397e30f149e31d73a9cd`.

## Informe de impacto de sincronización

| Artefacto | Impacto previsto |
| --- | --- |
| Constitución | PATCH factual y retirada de cuatro KD tras ratificación; sin redefinir principios |
| Roadmap/aprobaciones | Integración observada y validación manual registradas; M3 espera la puerta normativa |
| Converge 001/002 | Añadir integración observada sin reescribir checkpoints locales ni sus resultados |
| AGENTS/plantillas | Sin cambio de reglas; los enlaces apuntan a la constitución vigente |
| Runtime, tests, SQL y dependencias | Sin cambios |
| Áreas 003–006 | Sin alcance aprobado por esta enmienda |

Verificación de esta entrega: enlaces locales y diff. No se repiten pruebas de
runtime por cambios documentales. Tras ratificar se aplicará la lista exacta a
la constitución, se comprobarán enlaces/diff y se observará CI del PR antes de
integrar. No se presenta este documento guardado como ratificación efectiva.
