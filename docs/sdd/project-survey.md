# Diagnóstico inicial SDD

Fecha: 2026-10-14. Estado: diagnóstico inicial; propuestas pendientes de aprobación.

## Alcance y referencia

La solicitud es refactorizar FitTrack siguiendo SDD. El acuerdo brownfield
aportado se usa como referencia de proceso; sus ejemplos no son decisiones
de producto ni hechos comprobados de FitTrack. Este documento no aprueba una
constitución ni autoriza cambios de comportamiento.

## Evidencia del proyecto

| Hallazgo | Evidencia |
| --- | --- |
| Aplicación React con Vite y cliente Supabase | `package.json:15`, `src/supabase.js:1` |
| Carga de doce colecciones y objetivos desde la aplicación principal | `src/FitTrack.jsx:706`–`717` |
| Persistencia automática condicionada a la carga inicial | `src/FitTrack.jsx:767`–`780` |
| Cola de escritura por usuario y clave; errores publicados mediante estado de guardado | `src/data-sync.js:25`–`53` |
| Sincronización diferida 600 ms por defecto | `src/data-sync.js:56`–`61` |
| Lectura y escritura delimitadas por usuario y clave, con timeout de 15 s | `src/data-operations.js:3`–`30` |
| Borrado, exportación e importación residen en el componente principal | `src/FitTrack.jsx:783`, `800`, `814` |
| Existen reglas de dominio sobre objetivos y ciclo | `src/app-config.js:1`–`55`, `src/cycle-inference.js:305` |
| CI declara instalación, pruebas y build en un solo job | `.github/workflows/ci.yml:12`–`25` |
| Algunas regresiones verifican texto fuente; no prueban interacción en navegador | `test/ui-regressions.test.js:3`–`6` |
| Parte de los contratos RLS inspecciona SQL; no demuestra políticas ejecutadas en una BD | `test/supabase-contracts.test.js:88`–`100` |

No se encontraron `.specify/`, `specs/`, `AGENTS.md` ni `CLAUDE.md`
en el inventario del repositorio. El README describe Vercel como destino;
no se verificó un despliegue real ni se consultaron datos remotos.

## Verificación inicial sobre código sin modificar

- `pnpm test` y `pnpm run build`: no iniciaron sus scripts; pnpm informó
  `unable to open database file`.
- Equivalente directo `node --test --test-isolation=none`: 124 pruebas,
  124 aprobadas, 0 fallidas, 0 omitidas, con Node v26.5.0.
- `node node_modules/vite/bin/vite.js build`: aprobado; 2252 módulos,
  21,20 s. Vite advierte de un chunk de 507,04 kB, superior a 500 kB.
- CI remoto, auditoría de dependencias, pruebas de navegador y políticas RLS
  ejecutadas en base de datos: no verificados.

Estas pruebas son una línea base, no una demostración de cobertura de todos
los requisitos. Antes de refactorizar cada área se requieren contratos y
pruebas de caracterización trazables que pasen sobre el código original.

## Secuencia propuesta

1. Preparar la fase 0: plantillas locales de spec y tareas, borrador de
   constitución contrastado con código, guía operativa y roadmap.
2. Proponer como área 001 persistencia y ciclo de vida de datos: carga,
   guardado, aislamiento por usuario, importación/exportación y borrado.
   Prioridad sugerida por el alcance de sus efectos sobre datos de usuario.
3. Continuar con autenticación y fotos; entrenamiento; nutrición y
   objetivos; medidas y ciclo; finalmente composición de interfaz.
   Los límites definitivos se decidirán con el inventario de llamadas.
4. Aprobar spec, aclaraciones, plan y tareas antes de implementar;
   separar documentación y código y mantener trazabilidad hasta verificación.

## Decisiones pendientes para la fase 0

- Aprobar constitución y límites del área 001 después de revisar sus borradores.
- Confirmar si este repositorio despliega producción automáticamente;
  recomendación: dejar despliegues fuera del alcance de esta refactorización.
- Elegir idioma de nuevos documentos y comentarios; recomendación: español,
  manteniendo los identificadores existentes.
- No declarar código congelado como legacy sin inventario de llamadores.
- Fechas y estimaciones del roadmap serán propuestas, no compromisos asumidos.

## Seguimientos iniciales

| ID | Hallazgo | Criterio de cierre | Momento propuesto |
| --- | --- | --- | --- |
| ENV-001 | pnpm no inicia por acceso a su base de datos local | `pnpm test` y `pnpm run build` ejecutan sus scripts | Antes de verificar fase 0 |
| DOC-001 | README menciona `desktop/`, ausente del inventario raíz | Documentación coherente con inventario y decisión sobre legacy | Fase 0 |
| TEST-001 | Contratos de interfaz y RLS incluyen inspección estática | Cada requisito dispone de evidencia que comprueba su comportamiento completo | Plan y tareas de cada área |
