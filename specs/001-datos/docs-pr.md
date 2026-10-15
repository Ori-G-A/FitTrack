# Propuesta de PR documental

Documento de la etapa previa a implementación: sus resultados parciales eran
los disponibles entonces. Evidencia actual: [PR de código](code-pr.md) y verification.md.

Título: **Define tareas y verificación para refactorizar los datos de FitTrack**

La persistencia y las acciones de copia/borrado están coordinadas desde App.
Este PR define cómo separar esas responsabilidades conservando los contratos
observados, con pins completos sobre el código original antes de extraer nada.
Incluye plan aprobado para avanzar, 24 tareas, trazabilidad de 11 requisitos y
10 escenarios y análisis documental sin hallazgos CRITICAL abiertos.

No contiene cambios de src. Las pruebas de preparación ya están en la rama
dependiente anterior; aquí se planifican los pins íntegros sin declararlos ejecutados.

## Validación prevista y ejecutada

| Validación | Prevista | Ejecutada en esta etapa | Resultado |
| --- | --- | --- | --- |
| Mapa FR/escenario → prueba/tarea | 21 IDs | 21/21 | Todos tienen grupo concreto y tarea de pin |
| Identidad/dependencias de tareas | 24 tareas | 24 IDs únicos; grafo comprobado | Sin ciclos; extracción bloqueada por T012 |
| Enlaces locales/diff | Documentación modificada | Verificación local | Sin enlaces rotos ni errores de whitespace |
| Verificador actual frente a manifest ampliado | Preservar estados observados | Verificación con resultados previos | 12 partial, 9 pending, 0 complete; sin promover cobertura |
| Nuevos pins completos | 10 grupos | 0 | Pendientes de implementación tras puerta documental |
| CI remoto de este PR | Jobs obligatorios | No observado | Pendiente |

Evidencia previa de preparación, ejecutada antes de este PR: 132 pruebas Node
aprobadas, build aprobado en copia limpia, 8 comprobaciones SDD y audit con
0 vulnerabilidades reportadas. No se repitió esa suite por estos cambios
documentales; ver [readiness](../../docs/sdd/readiness.md).

## Límites

Los contratos defectuosos preservados tienen seguimientos DATA-001–004. No hay
CHANGE, migración ni despliegue. El piloto actual aporta evidencia parcial;
la implementación no podrá cerrarse con pruebas omitidas, referencias futuras
o filas PENDING/partial.

## Dependencias y merge order

1. `codex/sdd-constitution-1.0.1`: enmienda editorial.
2. `codex/sdd-readiness`: entorno y pruebas de preparación.
3. `codex/001-datos-docs`: este PR; diff documental respecto a readiness.
4. Rama de implementación de 001, después de merge documental y G-PIN verde.

Es una secuencia de ramas dependientes. Para revisar este PR antes de fusionar
sus dependencias, usar readiness como base; después revisar/ajustar la base para
que solo entre el diff documental. El propietario abre y fusiona los PRs.
Este archivo prepara título/cuerpo; no demuestra que exista un PR remoto.
