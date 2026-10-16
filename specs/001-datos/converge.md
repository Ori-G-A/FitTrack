# Convergencia — 001-datos

Revisión local: 2026-10-15. Código revisado:
`80920d4c1ff86648ef5f39ce459284929d7cf975`.
Comparación contra spec, plan y constitución 1.0.1; no se declara revisión externa.

## Contrato frente al código final

| FR | Implementación observada | Evidencia |
| --- | --- | --- |
| FR-001 | data-operations conserva consulta por usuario/clave y fallback nullish | Pin T002 idéntico a BASE |
| FR-002 | Upsert/conflicto y timeout 15000 ms conservados; timeout no cancela remoto | Pin T002 con fronteras y rechazo/error |
| FR-003 | save-coordinator conserva cola por par y referencia del valor | Pin T003, mutación de orden detectada |
| FR-004 | Bus global, contador en ejecución, errores capturados y promesa resuelta preservados | Pin T004 e intercalados deterministas |
| FR-005 | Suspensión, reanudación y snapshot de colas conservados | Pin T005 con otros usuarios y entradas futuras |
| FR-006 | Fachada conserva hook, delay, cleanup y suscripción sin replay | Pin T006; el cliente sigue usando una instancia global |
| FR-007 | loadUserData coordina lectura paralela, hidratación, migraciones y cancelación | Pin T007 y captura de sesión anterior descartada |
| FR-008 | App conserva 12 bindings; photoForStorage y timer separado sin cambios | Pin T008 con iniciar/pausar/reiniciar y URLs filtradas |
| FR-009 | exportUserData materializa fotos; App conserva Blob/descarga/revocación | Pin T009 y recorrido Chromium de copia |
| FR-010 | importUserData conserva validación, límite, confirmación, setters y cleanup | Pin T010, frontera exacta 50 MiB y foto fallida; recorrido de copia |
| FR-011 | deleteUserData conserva orden y recuperación; adaptador filtra usuario sin timeout añadido | Pin T011 con fallos por etapa y retorno error vs rechazo de signOut |

## Plan y principios

- E1, E2, E3 y E4 tienen commits separados y checkpoints verdes.
- Los seis archivos de pins conservan exactamente sus hashes de la baseline
  previa a modificar producción. No se cambiaron aserciones para hacer pasar
  la refactorización.
- La única adaptación de mutaciones fue el punto donde se instrumenta la cola
  movida a save-coordinator; las aserciones y el defecto inducido se conservaron.
- Los módulos de coordinación no importan React, DOM ni cliente Supabase global.
  Se verifican imports transitivos y referencias DOM directas, con fixtures negativos.
- App no consulta app_data directamente. Las APIs de sincronización y firmas de
  pantallas/Train siguen disponibles; los dos previews montan Train con cliente falso.
- No hay dependencias productivas, esquemas, fórmulas, parámetros ni migraciones
  nuevas en esta entrega. No se ejecutaron escrituras contra backend real.
- La validación y los errores heredados no se rediseñaron. DATA-001–005 siguen
  fuera del cambio funcional y tienen seguimiento para decisiones posteriores.

## Verificación final observada

- Suite Node: 160 pruebas, 160 aprobadas, 0 fallidas, 0 omitidas.
- Chromium: 3 recorridos aprobados.
- Trazabilidad: 21 complete, 0 partial, 0 pending; tests existentes y ejecutados.
- Build: aprobado, 2254 módulos, 16,90 s. Warning de chunk index 508,72 kB
  registrado en PERF-001; no se oculta ni se presenta como optimización.
- Audit completo: 0 vulnerabilidades reportadas.
- Los 6 hashes de pins anteriores coinciden. Resumen: [evidencia final](evidence/final.json).

Resultado: **0 gaps de implementación nuevos abiertos en esta revisión local**.
No se añade fase de convergencia porque no se detectó trabajo corrector nuevo.

## Integración pendiente

CI remoto y apertura/fusión de PRs no observados. La aprobación del dueño para
continuar habilitó el trabajo local, sin afirmar un merge remoto inexistente.
La puerta de CI antes de integrar sigue abierta. KD-001 tiene evidencia para
proponer su cierre en enmienda PATCH independiente; aquí no se modifica la
constitución ni se declara cerrada por el simple paso de los tests.
