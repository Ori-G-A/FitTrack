# Decisiones técnicas propuestas — 006

Estado: APROBADAS con el plan. Fecha: 2026-10-19.
[Plan](plan.md), [survey](../../docs/sdd/interfaz-survey.md), [spec](spec.md).
Se basa en lectura y exploración ya documentada; no hay experimentos nuevos.

| Decisión | Alternativa y evidencia | Elección / consecuencia |
| --- | --- | --- |
| R-001 Separar configuración de navegación de presentación | Un router/history añadiría semántica no aprobada; App tiene estados locales y callbacks con fecha | Configuración pura y componentes con callbacks; App mantiene estado y orden de setters |
| R-002 Preservar adaptador de tema | Unificar script inicial con React corregiría UI-006-003 sin CHANGE | Extraer tema/hook y conservar fachada app-utils; script inicial intacto con pins separados |
| R-003 Extraer CSS como identidad | Dividir/reordenar CSS o convertirlo en módulos cambia cascada y harness | Cadena íntegra en app-styles; CSS público de FitTrack sigue disponible; comprobar hash y geometría |
| R-004 Modal compartido mínimo | Native dialog/portal introducen top layer, backdrop y herencia diferentes | ModalSheet reutiliza las clases y DOM existentes; solo semántica/foco/teclado aprobados |
| R-005 Restauración diferenciada | Restaurar siempre foco tras seleccionar ruta puede enfocar una pantalla anterior | Cancelación restaura disparador visible/conectado; navegación preserva destino/fecha sin foco obsoleto |
| R-006 Cambios con rojo real | test.fail, skip o catches pueden hacer parecer verde un defecto no corregido | Suite CHANGE separada con cinco casos y reporter JSON; incorporar al descubrimiento global tras pasar |
| R-007 Geometría sin red externa | Fuentes remotas y screenshots de otra plataforma añaden ruido | Chromium/fallback fijo, red abortada, cajas/CSS con tolerancia ≤1 px, baseline original revisado; no prometer igualdad de fuentes reales |
| R-008 No modificar pins anteriores | Harness 001–005 instrumenta símbolos/anclas de FitTrack, pantallas y facades | Mantener exports y anclas necesarias; harness 006 independiente con guardas, sin parchear 68 congelados |
| R-009 Tratar explícitamente el texto fuente | Congelar ubicación de CSS/shell impide extraerlos; borrar pruebas reduce señal | Adaptar solo tests no congelados con mismo contrato sobre BASE/candidato, citar FR y añadir funcional; no importar fuente muerta |
| R-010 Etiquetas acotadas | Hay más labels sin asociación que los tres aprobados | Corregir solo peso/correo/contraseña; resto en roadmap con evidencia/prioridad, sin promesa WCAG completa |
| R-011 No sobreextraer pantallas | Diario/Plan/Cuenta tienen estado ligado a sus recorridos y dominio ya separado | Mantener composición y hooks; tocar consumidores solo por dependencia de shell/estilos/modal |
| R-012 Retirada KD como acto normativo | Completar un manifiesto no ratifica la constitución | Mapa individual de 21 casos, revisión de cada aserción, evidencia y propuesta PATCH separada; el dueño decide |

Si E0 descubre que el contrato AS-IS no describe BASE, registrar el caso y
obtener decisión antes de alterar FR/aserciones. Los nombres de módulos pueden
ajustarse por necesidad técnica demostrada y registrada sin ampliar alcance.

## R-013 — Lectura de almacenamiento inyectada (E2, 2026-10-20)

El primer checkpoint E2 pasó311 de312 pruebas. El negativo congelado de
arquitectura003 espera rechazar la fachada app-utils como dependencia impura;
la extracción directa hizo que esbuild visitara primero ui-theme y rechazara
su API de navegador. La separación seguía prohibiendo ese acceso, pero cambió
el motivo exacto fijado por el pin. No se modifica su aserción ni su hash.

ui-theme recibe una función de lectura y valida su resultado dentro del mismo
try/catch. La fachada pública y use-app-theme inyectan la lectura original de
localStorage. Se conserva API, valores válidos, dark por defecto y tratamiento
de fallos; el validador queda independiente del navegador. No introduce otra
regla de producto ni requiere una nueva decisión de alcance. El checkpoint E2
se repite completo después del ajuste; su evidencia se registra al concluir.

## R-014 — Checkpoint incremental de CHANGE (E4–E5b)

scripts/run-interface-checkpoint.js ejecuta la suite Node completa, los20
recorridos AS-IS, los CHANGE ya implementados y build; reutiliza verifyTrace.
E4 selecciona dos casos de teclado/foco; E5 añade tres campos; E5b incorpora
los dos casos de resaltado. Conserva la configuración congelada de los rojos.
Actualiza únicamente sus IDs después de aprobar todo el checkpoint y publica
resultados/sourceHash conjuntos. Un intento invalida primero su reporte para
evitar presentar resultados antiguos como éxito. La ejecución ordinaria y CI
incorporarán los siete CHANGE una sola vez en E6, según el plan aprobado.

## R-015 — Corrección del reloj del harness (FR-024)

El primer checkpoint E5b pasó313 Node y20 AS-IS; cinco CHANGE pasaron y dos
fallaron al observar2199ms. clock.install seguía avanzando entre las acciones
del navegador, sumando tiempo real a runFor. Se añade pauseAt antes de montar
la aplicación. Las aserciones y la duración2200 no cambian.

[PIN-006-001](evidence/pin-amendment-001.json) conserva la firma anterior del
único archivo de harness corregido y la firma nueva. La baseline original no
se reescribe; scripts/interface-pins.js verifica los101 archivos y aplica esa
enmienda explícita. Los68 pins anteriores siguen intactos. En una copia sin
credenciales de BASE86299a4 se repitieron20 AS-IS verdes y siete rojos por sus
motivos específicos; los dos casos temporales pasaron sobre el candidato.
La repetición completa de E5b es obligatoria antes de avanzar a E6. Es una
corrección técnica de la preparación de pruebas aprobada, sin ampliar alcance.

## R-016 — Sincronización de fixture de descartes en CI

El diagnóstico compacto de CI `39536424492` identificó una carrera en
`interfaz navegador diario busqueda y descartes` (FR-023): `setGoals` programa
el render, pero el primer botón ya era visible con la configuración anterior.
El conteo podía leer tres avisos, aplicar la configuración de mujer (cuatro)
y descartar uno (tres), esperando incorrectamente dos. No falló la operación
de dominio. Se espera explícitamente `goals.sex === 'mujer'` antes del conteo.
Las comprobaciones existentes de número, fecha, deshacer y otras claves
permanecen idénticas; se añade una aserción de preparación, sin relajar ninguna.

La firma original de `browser-tests/interface.spec.js` queda en baseline y la
enmienda PIN-006-002 registra ambas firmas y la reproducción sobre BASE86299a4.
Una primera copia de reproducción omitió `preview/`: falló por resolución de
archivos, retiró su entorno y se repitió completa incluyendo esa carpeta.
No hay cambios en src ni en los 68 pins de contratos anteriores.
