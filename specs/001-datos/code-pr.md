# Propuesta de PR de código

Título: **Separa la coordinación de datos de App conservando sus contratos**

App concentraba carga, importación, exportación y borrado, y la cola de guardado
dependía del módulo React. Esta entrega separa esos casos de uso en lifecycle,
extrae un coordinador de cola/bus y deja el acceso a app_data en su adaptador.
Los llamadores conservan sus APIs y comportamiento, incluidos los fallos
conocidos que se decidió corregir después.

Antes de modificar producción se fijaron los contratos con pruebas sobre BASE.
Los seis archivos de pins conservan sus hashes tras las cuatro extracciones.

## Verificación prevista y ejecutada

| Comprobación | Prevista | Ejecutada | Resultado |
| --- | --- | --- | --- |
| Caracterización previa | 11 FR y 10 escenarios sobre código original | Suite BASE: 158/158; Chromium 3/3 | Verde antes de extraer; baseline versionada |
| Regresión final y límites | Suite completa, arquitectura y previews | Node 160/160 | 0 fallidas y 0 omitidas |
| Recorridos reales simulando backend | Carga/guardado, copia export/import y error de guardado | Chromium 3/3 | Verde |
| Mutaciones controladas | Aislamiento, orden y guardar antes de cargar | 3/3 dentro de suite | Las aserciones detectan los defectos inducidos |
| Trazabilidad | Todos los IDs con prueba ejecutada | 21/21 complete | Sin PENDING/partial |
| Build | Compilación Vite | Aprobada; 2254 módulos | Warning index 508,72 kB registrado |
| Auditoría | Lockfile actual | 0 vulnerabilidades reportadas | Sin cambios de dependencias en este refactor |
| CI remoto | Commit exacto antes de merge | No observado | Pendiente de integración |

## Límites y riesgos conocidos

Se preservan errores agregados del bus global, importación no atómica, borrado
sin rollback distribuido y retorno error de signOut no inspeccionado. El posible
feedback perdido al desmontar Settings durante borrado queda en DATA-005.
El backend de las pruebas es sintético; no prueban RLS ejecutada en servidor real.
No se han aplicado migraciones, desplegado ni operado sobre datos de usuarios.

## Merge order

1. Constitución `codex/sdd-constitution-1.0.1`.
2. Preparación `codex/sdd-readiness`.
3. Documentación `codex/001-datos-docs`.
4. Código `codex/001-datos-code` (esta entrega), con CI observado antes de integrar.

Ramas dependientes: revisar este diff contra la rama documental hasta fusionar
sus dependencias. El propietario abre/fusiona los PRs. Este documento proporciona
título/cuerpo y no afirma que se haya publicado un PR.

Detalle de ejecución: [verification](verification.md). Revisión de convergencia:
[converge](converge.md). KD-001 podrá retirarse en una enmienda separada tras
aceptar su cierre; el registro normativo todavía la conserva.
