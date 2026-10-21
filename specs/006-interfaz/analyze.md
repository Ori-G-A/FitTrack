# Revisión cruzada — 006

Fecha: 2026-10-19. Revisión documental del agente; aprobada por el dueño.
[Spec](spec.md), [plan](plan.md), [tareas](tasks.md), [validación](validation-plan.md),
[research](research.md), [mapa de regresiones](static-regression-map.md).
No es converge ni ejecución de las pruebas propuestas.

| Control | Resultado documental | Evidencia/límite |
| --- | --- | --- |
| Alcance | 21 AS-IS y dos CHANGE aprobados junto con C-001/002/003 | Commit 25230b7 y registro; no autoriza plan/ejecución |
| IDs | 23 FR + 23 escenarios, 46 filas únicas | Pruebas previstas en matriz/manifiesto; tests ejecutados vacíos |
| Pruebas | 21 grupos Node AS-IS, siete recorridos Chromium y cinco casos CHANGE | Cláusulas y nombres concretos en validation-plan; todavía sin código |
| Orden | G-PIN T028 precede toda extracción; T023/024 preceden cambios T032/033 | DAG de 39 tareas; validación mecánica de referencias/ciclos pendiente de registrar |
| Evidencia parcial | E0: 42 IDs completos + cuatro CHANGE pending; rojos aparte | complete debe rechazar la parcialidad; no usar skips/test.fail para aparentar verde |
| Extracciones | Configuración, tema, estilos y presentación con adapters explícitos | App mantiene coordinación, estado y orden de setters; sin router nuevo |
| Comportamiento | UI-006-003–006 y BODY-001–005 conservados | No normalizar temas, Cuenta, movimiento o foco de tarjeta por iniciativa |
| Accesibilidad | Dos overlays y tres inputs delimitados | No certifica WCAG ni corrige otros campos no aprobados |
| Arquitectura | Configuración pura separada de React/DOM y servicios | Grafo transitivo y negativos al introducir cada frontera; sin afirmar guardas implementadas |
| Compatibilidad | CSS/Train/app-utils y harness/exports antiguos conservados | 68 pins previos y nuevos oráculos sobre original; no duplicar código muerto para regex |
| Cierre | 182 IDs en seis contratos sobre mismo src/resultados, RLS fresco con cleanup | Docker inaccesible bloquea cierre; nunca backend real ni credenciales |
| Gobernanza | PR documental preparado; ejecución anticipada solo por autorización expresa | No hay publicación/fusión/Vercel006 autorizados |

## Hallazgos resueltos en el diseño propuesto

- A-001: exigir 46 IDs completos antes de corregir CHANGE impediría demostrar
  rojo real. Resuelto: 42 AS-IS completos, cuatro pending y cinco rojos fuera
  del descubrimiento verde E0; en E6 los cinco entran sin skips al runner general.
- A-002: mover CSS/nav rompe pruebas sobre ubicación aunque conserve comportamiento.
  Resuelto: mantener exports/anclas y adaptar únicamente asserts no congelados
  demostrando la misma comprobación sobre BASE/candidato, con pruebas funcionales.
- A-003: role=dialog por sí solo no demuestra foco ni Escape. Resuelto: dos
  pruebas independientes de overlays, Tab/Shift+Tab, cancelación, restauración,
  contenedor sin controles y disparador desmontado, además de clics existentes.
- A-004: snapshots geométricos con fuentes/red variables producirían resultados
  ambiguos. Resuelto: mismo Chromium, fixtures y fallback, red abortada y
  tolerancia explícita; las capturas solo apoyan, no sustituyen aserciones.
- A-005: el título «un perfil de hombre no ve nada del ciclo» exagera sus asserts.
  Resuelto: conservar reglas distintas de consumidores 005 y revisar cada
  afirmación; el mapa de 21 casos no declara cobertura por título.
- A-006: los descartes generales no pertenecen al snapshot de ritmo de 004.
  Resuelto: FR-023/T025 verifica fechas por clave, siete días y deshacer propio.
- A-007: restaurar foco sin distinguir selección puede interferir con navegación.
  Resuelto: cancelación restaura disparador disponible; selección mantiene
  destino/fecha y no enfoca elementos desmontados.
- A-008: sourceHash omite src nuevo sin trackear. Resuelto: registrar todos los
  módulos antes de capturar, cruzar seis contratos con la misma colección real.
- A-009: retirar KD-002 por completar los 21 títulos podría omitir otros asserts
  de interfaz. Resuelto: T036 inventaría también comprobaciones de UI fuera de
  ese archivo y las vincula a sus specs; si persisten brechas no se propone
  retirada global. Los hallazgos añaden tareas de converge o CHANGE separado.

Sin hallazgos CRITICAL documentales abiertos tras estas resoluciones propuestas.
La comprobación mecánica se registra en verification; no prueba contratos,
arquitectura ni cobertura semántica todavía. No hubo revisión por otro agente.

Siguiente puerta: aprobación de plan/tasks/analyze y decisión explícita sobre
ejecución local E0–E6 antes de integrar el PR documental. No iniciar E0 sin ella.

## Estado posterior de alcance — 2026-10-20

La adenda FR-024 y precisión FR-008 están aprobadas; el plan original de 39
tareas estaba aprobado en e06f105. La extensión a 43 tareas todavía espera su
aprobación separada. La discrepancia AS-IS está documentada y las dos regresiones
CHANGE conservan las aserciones temporales originales como rojos. No se declara
converge ni G-PIN mientras falte esa puerta y la revisión íntegra de E0.

## Estado vigente — 2026-10-20

G-PIN superado;42 AS-IS completos y seis CHANGE pending con siete rojos específicos.33 pins nuevos congelados,68 previos verificados;309 Node/20 Chromium y build verdes. [Baseline](evidence/baseline.json). Sin cambio de src/index. No se infiere cierre E6 ni ratificación de KD-002.
