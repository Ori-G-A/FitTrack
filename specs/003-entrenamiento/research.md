# Decisiones técnicas — 003

Estado: decisiones adoptadas mediante el plan aprobado; E1–E4 verificadas.

| ID | Decisión | Razón y alternativa descartada |
| --- | --- | --- |
| R1 | Mantener fachadas FitTrack/app-utils/fase1Config | Hay consumidores App, previews, alerts y pantallas. Cambiar todos los imports y contratos a la vez amplía el riesgo |
| R2 | Separar cálculos de coordinación y JSX por entregas | Permite verificar diferencias pequeñas; extraer todo Train primero ocultaría responsabilidades todavía mezcladas |
| R3 | Conservar ambos relojes y sus efectos | Timer persistido usa Date.now; guiado usa ticks. Unificarlos alteraría FR-005/006 y TRAIN-002/003 |
| R4 | Pins por UI real o función productiva, no copias | Permite comparar original y extracción sin probar una reproducción del algoritmo |
| R5 | Harness con intervalos y reloj independientes | El actual createClock cubre timeouts; capturar intervalos solo de 12 h no prueba el timer de 1 s |
| R6 | Reutilizar selector SDD genérico | selectSpec admite nombres numéricos y run-sdd-evidence resuelve rutas; solo faltan manifiesto y tests de 003 |
| R7 | Mover addDays/daysBetween únicamente si dominio nuevo los importa | app-utils incluye localStorage; date-utils ya da localISO puro con reexport compatible |
| R8 | Mantener IDs, snapshots y updater funcional según original | Mejorar unicidad o evitar cierres obsoletos sería CHANGE; proteger también orden y cantidad de llamadas uid |
| R9 | Mantener mapeos/plantillas existentes en fase1Config | Comparte proteína con 004; no requiere migración ni separación masiva para refactorizar handlers |
| R10 | Adaptar pruebas textuales por ubicación con evidencia explícita | Tras mover Train sus aserciones deben seguir leyendo implementación real; los pins funcionales se conservan |

Hallazgo adicional por inspección: comentario antiguo de canonExercise niega un
alias que CANON_ALIAS sí implementa. El contrato corresponde a código observado;
fijar Press de pecho → Press banca en pins. Una corrección de comentario puede
acompañar su extracción, sin cambiar normalización.

Alcance aprobado y decisiones de [spec](spec.md) prevalecen. No se ha ejecutado
experimento nuevo ni se afirma resultado de los tests planificados.
