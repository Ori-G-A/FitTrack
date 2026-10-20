# Spec 006: Interfaz y accesibilidad

Estado: ALCANCE Y CAMBIOS APROBADOS; plan e implementación pendientes | Propietario: propietario de FitTrack | Fecha: 2026-10-19
Constitución: [1.0.2 ratificada](../../.specify/memory/constitution.md).
BASE: 86299a4497e3c19180c30a640598a1358d61cc8f.
[Survey](../../docs/sdd/interfaz-survey.md), [checklist](checklist.md).

## Resultado de usuario e intención

Completar los recorridos actuales desde móvil y escritorio con sus fechas,
resultados y feedback intactos, y poder usar con teclado los dos overlays y
tres campos delimitados abajo. Hacer verificables las interacciones que hoy
se comprueban principalmente mediante texto fuente. No es un rediseño visual.

## Alcance y restricciones

Incluye composición global, navegación/fecha/tarjeta enfocadas, Diario/Plan como
consumidores, Cuenta, tema, estilos compartidos, feedback, estados de carga/error,
componentes editoriales y ambos previews. Las pantallas de 003–005 entran solo
para conservar recorridos, geometría y verificar las dependencias necesarias.
001 mantiene persistencia; 002 identidad/fotos/diagnóstico; 003–005 algoritmos y
operaciones de dominio. No se cambia SQL, esquema, backend ni fórmula clínica.
El plan decidirá extracciones, harness, módulos y tareas después del alcance.

## Historias y escenarios

### US1 — Navegar conservando contexto (prioridad P1)

Como usuario, quiero abrir la pantalla y fecha que elegí para registrar y consultar sin cambiar de día por sorpresa.

- US1-AS1: Dadas las dos anchuras de navegación, cuando se active cada destino raíz, entonces se mostrará su pantalla y el estado activo correspondiente.
- US1-AS2: Dado un perfil con o sin seguimiento de ciclo, cuando se abra Registrar y se seleccione una fila disponible, entonces los destinos y la presencia de Check-in serán los actuales.
- US1-AS3: Dada una fila histórica, cuando se abra su editor y después una raíz y un registro nuevo, entonces se usará primero la fecha histórica y después la fecha actual; abrir un aviso mantendrá su tarjeta destino.
- US1-AS4: Dados los alias de Cuenta, cuando se monten y se cambien sus pestañas o section sin desmontar, entonces se preservarán inicialización, selección local y composición de Perfil/Ajustes.
- US1-AS5: Dados los alias de Cuerpo, cuando se cambie de destino o sección, entonces se mostrarán las secciones y fechas actuales sin ampliar las reglas de visibilidad de ciclo.
- US1-AS6: Dadas entradas de varios tipos y fechas, cuando se busque, se oculte un tipo y se limpie el texto, entonces resultados, límites, vacíos y filtros coincidirán con el original.
- US1-AS7: Dado un día distinto de hoy con sesión, comida y medidas, cuando se activen filas y huecos del Plan, entonces cada editor recibirá la fecha seleccionada y su destino actual.
- US1-AS8: Dadas una tarjeta ya montada, otra oculta por filtro y un ID inexistente, cuando se solicite cada una, entonces se seleccionará all y se conservarán por separado resaltado/consumo o retorno temprano, sin prometer desplazamiento de una tarjeta ausente en el efecto inicial.

### US2 — Entender estado y apariencia (prioridad P1)

Como usuario, quiero conservar mi tema y distinguir cargas, errores y confirmaciones para saber qué está ocurriendo.

- US2-AS1: Dado almacenamiento vacío, válido, inválido o bloqueado, cuando se monte App y se cambie el tema, entonces resolverá y persistirá según las reglas actuales sin impedir el uso por fallo de almacenamiento.
- US2-AS2: Dado auto y luego un tema explícito, cuando cambie la preferencia del sistema y se desmonte, entonces se conservarán colores y limpieza del listener; se caracterizará por separado el primer render con ft-theme inválido.
- US2-AS3: Dado Toast montado, cuando se emitan mensajes consecutivos, uno vacío y luego se desmonte, entonces solo el último mensaje válido ocupará el estado y desaparecerá según su propio plazo sin replay.
- US2-AS4: Dadas sesión/carga diferidas o fallidas, guardado fallido y un error de render sintéticos, cuando se presenten sus vistas, entonces se mostrarán mensajes y acciones originales sin tratar un toast como confirmación remota.
- US2-AS5: Dado un desglose con filas y campos opcionales, cuando se pulse contenido, botón o fondo, entonces datos y cierres coincidirán con el original antes de añadir el contrato de teclado.
- US2-AS6: Dados avisos con fechas de descarte antes y justo en el límite de siete días, cuando se descarte otro y se deshaga, entonces persistencia, visibilidad, expiración y restauración seguirán el original sin afectar otras claves.

### US3 — Completar tareas en mis pantallas (prioridad P1)

Como usuario, quiero usar móvil y escritorio conservando los recorridos y resultados actuales.

- US3-AS1: Dadas anchuras 390, 420, 720, 721, 959, 960 y 1280 px, cuando se muestren pantallas con fixtures representativas, entonces navegación, columnas y cajas coincidirán con el baseline; las discrepancias se registrarán sin corregirlas implícitamente.
- US3-AS2: Dada una sesión activa y su salida, cuando se monte y desmonte SessionScreen, entonces se ocultará y reaparecerá la navegación sin clase residual.
- US3-AS3: Dada una lista larga y controles representativos, cuando se desplace a 390 y 1280 px, entonces la cabecera conservará su posición actual y las dimensiones computadas coincidirán con el original.
- US3-AS4: Dadas listas largas y un registro en cada área, cuando se abra detalle, se vuelva y se complete una operación, entonces se preservarán las salidas de pantalla y los resultados de los contratos propietarios.
- US3-AS5: Dadas distintas anchuras y preferencias de movimiento, cuando se monten, redimensionen y desmonten los componentes, entonces se conservarán fechas, columnas, transiciones actuales y limpieza de listeners/temporizadores.
- US3-AS6: Dados preview-main y maqueta, cuando se recorran sus destinos admitidos y cambios de sección, entonces conservarán sus mapeos actuales y no intentarán acceso a servicios reales en las pruebas.
- US3-AS7: Dadas la aplicación y sus consumidores, cuando se validen las reorganizaciones de interfaz, entonces pasarán las regresiones anteriores, límites de capas y firmas con los mismos resultados de dominio y los pins originales intactos.

### US4 — Usar los controles delimitados con teclado (prioridad P1)

Como usuario de teclado o tecnología de asistencia, quiero reconocer los campos y entrar/salir de los overlays sin perder el foco.

- US4-AS1: Dado un disparador enfocado de Registrar o un desglose, cuando se abra, se recorra en ambos sentidos y se cierre por Escape, botón o fondo, entonces el diálogo tendrá nombre, contendrá el foco y restaurará el disparador disponible; al seleccionar una ruta no alterará su fecha ni destino.
- US4-AS2: Dados los tres formularios, cuando se localice y use cada control por su nombre accesible exacto mediante teclado y prueba de navegador, entonces será único y conservará los mismos resultados de peso y autenticación de 005/002.

## Requisitos funcionales

- FR-001 [AS-IS] Cuando se navegue mediante rail o barra móvil, el sistema deberá conservar los destinos raíz Diario, Plan, Métricas y Biblioteca, sus estados activos y las entradas actuales a Cuenta y Registrar, aunque el orden de ambas barras difiera.
- FR-002 [AS-IS] Cuando se abra Registrar y se elija una fila, el sistema deberá cerrar la hoja y abrir Entreno, Comida, Peso, Nota o Medidas; ofrecerá Check-in únicamente cuando tracksCycle(goals) lo habilite.
- FR-003 [AS-IS] Cuando una fila abra un editor con fecha, el sistema deberá transmitir esa fecha; cuando se navegue a una raíz sin fecha, deberá limpiar focusDate; abrir una tarjeta de Métricas deberá limpiar la fecha y conservar el identificador de tarjeta solicitado.
- FR-004 [AS-IS] Cuando se monte Cuenta, el sistema deberá resolver cuenta/perfil hacia PERFIL y ajustes hacia DATOS Y CONFIGURACIÓN; mientras la misma instancia siga montada, conservará la selección local actual aunque cambie section, hasta selección explícita o remontaje.
- FR-005 [AS-IS] Cuando se navegue a cuerpo, peso, medidas, nota o checkin, el sistema deberá conservar BodyScreen con key por tab, su sección inicial y la fecha enfocada; las secciones visibles seguirán las condiciones del dominio 005.
- FR-006 [AS-IS] Cuando se busque en Diario, el sistema deberá conservar trim/minúsculas, mínimo de dos caracteres, límite de 40 resultados y 460 fechas distintas como máximo, orden reciente, metadatos de coincidencia y filtros por tipo aplicados a la lista resultante; limpiar la búsqueda conservará los filtros.
- FR-007 [AS-IS] Cuando se consulte un día del Plan, el sistema deberá presentar sus registros y huecos disponibles y abrir cada editor en selected.iso; la navegación a rutinas conservará el destino actual.
- FR-008 [AS-IS] Cuando se reciba focusCard en Métricas, el sistema deberá seleccionar all y buscar el nodo en ese mismo efecto; si ya existe, desplazará a su ancla, aplicará resaltado de 2200 ms y consumirá la petición con la limpieza actual. Si no existe aún, conservará el retorno temprano sin resaltado ni consumo; no garantizará un reintento al aparecer después del cambio de filtro.
- FR-009 [AS-IS] Cuando se lea o cambie la preferencia de tema, el sistema deberá conservar ft-theme, los valores dark/light/auto, dark por defecto o lectura inválida/bloqueada, y la escritura tolerante a fallos de almacenamiento.
- FR-010 [AS-IS] Mientras se use auto, el sistema deberá reaccionar a cambios de prefers-color-scheme y retirar su listener al desmontar; dark/light explícitos prevalecerán. El tema se aplicará a html y ft-root; antes de React se conservarán el fondo y la interpretación actual del script, incluida la diferencia ante valores inválidos.
- FR-011 [AS-IS] Cuando se emita una confirmación toast no vacía con el suscriptor montado, el sistema deberá mostrar la más reciente como status/polite durante 2600 ms por defecto, reiniciar el plazo al reemplazarla y limpiar temporizadores y suscripción; no encolará ni repetirá emisiones anteriores al montaje.
- FR-012 [AS-IS] Mientras se resuelva sesión, carga o pantalla diferida, el sistema deberá conservar los estados visibles y acciones de reintento actuales; ante error de render mostrará el fallback con tema resuelto y acción Recargar; el indicador de persistencia conservará su señal propia, distinta de la confirmación toast.
- FR-013 [AS-IS] Cuando se abra un desglose de Diario o Métricas, el sistema deberá conservar título, filas, nota, fuente y valores suministrados; el botón Cerrar y un clic en el fondo cerrarán, mientras un clic en el contenido no cerrará. La gestión de teclado se rige por FR-021.
- FR-014 [AS-IS] Cuando cambie el ancho, el sistema deberá conservar la alternancia rail/barra a 720 px, los paneles de Biblioteca a 959/960 px, la rejilla fluida de Métricas y su excepción hasta 420 px; los gráficos conservarán sus cajas según CSS y datos caracterizados sobre el original.
- FR-015 [AS-IS] Mientras esté montado el modo sesión, el sistema deberá conservar ft-focus en la raíz y ocultar rail/barra con su fondo y anchura actuales; al salir deberá retirar la clase y restaurar la navegación.
- FR-016 [AS-IS] Mientras se navegue o desplace en móvil, el sistema deberá conservar cabeceras sticky y las dimensiones táctiles actualmente definidas para steppers, papeleras, addset, iconbtn y filtros, respetando sus breakpoints y cascada. No extenderá esas dimensiones a controles no incluidos.
- FR-017 [AS-IS] Cuando se recorran Biblioteca, Nutrición o Cuerpo, el sistema deberá conservar lista/ficha, pantallas día/búsqueda/cantidad y una sección de cuerpo por vez, con sus acciones de salida; seguirán vigentes validaciones, registros y formatos de 003–005.
- FR-018 [AS-IS] Cuando se rendericen componentes editoriales y movimiento, el sistema deberá conservar etiquetas/fechas, sparkline decorativo, reveal, breakpoint 640 de KpiStrip, limpieza de efectos y las excepciones actuales de reduced-motion para toast/resaltado; no convertirá estas excepciones en una garantía global.
- FR-019 [AS-IS] Cuando se utilicen ambos previews, el sistema deberá conservar sus destinos admitidos, secciones y fecha donde ya se transmite; conservará las diferencias explícitas de tema y estado sintético frente a App, sin conectarlos al backend real.
- FR-020 [AS-IS] Cuando se reorganicen responsabilidades de interfaz, el sistema deberá conservar las firmas públicas y resultados de los contratos 001–005, el orden CSS observado, los destinos compartidos y los pins congelados, salvo el cambio de interacción expresamente descrito en FR-021/022.
- FR-021 [CHANGE] Cuando se abran Registrar o DetailSheet, el sistema deberá exponer un diálogo modal con nombre accesible y mover el foco a un control interior; Tab/Shift+Tab permanecerán dentro, Escape cerrará y el cierre por cancelación restaurará el disparador si sigue conectado y visible. Si no hay control interior se enfocará el contenedor; al elegir una ruta se conservará la navegación y no se intentará enfocar un disparador desmontado.
- FR-022 [CHANGE] Cuando se presenten los controles de peso, correo y contraseña, el sistema deberá asociar de forma inequívoca sus nombres accesibles Peso en kg, Correo electrónico y Contraseña con el input correspondiente, sin incluir los botones adyacentes en la etiqueta ni modificar tipo, conversión, validación, fecha, envío o persistencia.
- FR-023 [AS-IS] Cuando se descarte un aviso general del Diario, el sistema deberá conservar goals.dismissedAlerts por clave y fecha local, ocultarlo hasta que la fecha guardada más siete días sea menor o igual a hoy, y ofrecer deshacer el último descarte borrando esa clave sin perder las demás; no modificará la fórmula ni la clave que produce el dominio.

## Evidencia AS-IS y situación CHANGE

Los enlaces y referencias corresponden a BASE; los casos existentes son evidencia
parcial hasta revisar sus aserciones. Todos los pins contractuales 006 siguen
PENDING. Ninguna prueba nueva se declara ejecutada por inventariarla.

| FR | Código en BASE | Evidencia actual / límite |
| --- | --- | --- |
| FR-001 | src/FitTrack.jsx:681–839 | test/ui-regressions.test.js:283 |
| FR-002 | src/FitTrack.jsx:682–693; src/FitTrack.jsx:842–852 | test/ui-regressions.test.js:283; browser-tests/body.spec.js:25 |
| FR-003 | src/FitTrack.jsx:506–513; src/DiarioScreen.jsx; src/PlanScreen.jsx:197 | test/ui-regressions.test.js:41; test/ui-regressions.test.js:75; browser-tests/body.spec.js:25 |
| FR-004 | src/FitTrack.jsx:818–829; src/AccountScreen.jsx:15–22; src/AccountScreen.jsx:36–90 | test/ui-regressions.test.js:120 |
| FR-005 | src/FitTrack.jsx:694; src/FitTrack.jsx:788–790; src/BodyScreen.jsx | test/ui-regressions.test.js:185; browser-tests/body.spec.js:25 |
| FR-006 | src/app-utils.js:157–181; src/DiarioScreen.jsx:185–193; src/DiarioScreen.jsx:260–350 | test/app-utils.test.js; test/ui-regressions.test.js:41 |
| FR-007 | src/PlanScreen.jsx:62–76; src/PlanScreen.jsx:182–211 | test/ui-regressions.test.js:75; browser-tests/training-journeys.spec.js:37; browser-tests/body.spec.js:25 |
| FR-008 | src/FitTrack.jsx:513; src/DashboardScreen.jsx:432–441 | test/ui-regressions.test.js:97 |
| FR-009 | src/app-utils.js:196–209; src/FitTrack.jsx:517–527; src/SettingsScreen.jsx | test/ui-regressions.test.js:29; test/app-utils.test.js |
| FR-010 | index.html:8–17; src/FitTrack.jsx:518–530; src/app-utils.js:207 | test/ui-regressions.test.js:29 |
| FR-011 | src/toast.jsx:10–40; src/FitTrack.jsx:840 | test/ui-regressions.test.js:230 |
| FR-012 | src/FitTrack.jsx:715–741; src/FitTrack.jsx:783–829; src/AuthUI.jsx:7–24; src/ErrorBoundary.jsx | browser-tests/data-journeys.spec.js:43; test/identity-session.test.js; test/error-utils.test.js |
| FR-013 | src/DetailSheet.jsx:14–48; src/DiarioScreen.jsx:114; src/DashboardScreen.jsx:745 | test/ui-regressions.test.js:97 (cobertura parcial; no prueba la hoja) |
| FR-014 | src/FitTrack.jsx:239–242; src/FitTrack.jsx:327–334; src/FitTrack.jsx:406–410 | test/ui-regressions.test.js:247; test/ui-regressions.test.js:271 |
| FR-015 | src/SessionScreen.jsx; src/FitTrack.jsx:383–385 | test/ui-regressions.test.js:256; browser-tests/training-journeys.spec.js |
| FR-016 | src/FitTrack.jsx:231; src/FitTrack.jsx:359–381; src/DashboardScreen.jsx | test/ui-regressions.test.js:314; test/ui-regressions.test.js:333 |
| FR-017 | src/LibraryScreen.jsx; src/NutritionScreen.jsx; src/BodyScreen.jsx | test/ui-regressions.test.js:137; test/ui-regressions.test.js:157; test/ui-regressions.test.js:185; browser-tests/nutrition.spec.js; browser-tests/body.spec.js |
| FR-018 | src/EditorialUI.jsx:16–42; src/EditorialUI.jsx:49–67; src/EditorialUI.jsx:113–151; src/FitTrack.jsx:281; src/FitTrack.jsx:389 | PENDING: sin contrato específico completo |
| FR-019 | src/preview-main.jsx:142–247; preview/maqueta.jsx | browser-tests/body.spec.js:25; test/data-preview.test.js |
| FR-020 | src/FitTrack.jsx; src/app-utils.js; src/EditorialUI.jsx; .github/workflows/ci.yml | test/*-architecture.test.js; manifiestos 001–005 |
| FR-021 | src/FitTrack.jsx:842–852; src/DetailSheet.jsx:14–48 | evidence/survey.json: Registrar reproducido sin foco/Escape; DetailSheet por lectura |
| FR-022 | src/BodyScreen.jsx:175; src/AuthUI.jsx:79–103 | evidence/survey.json: peso reproducido; correo/contraseña por lectura |
| FR-023 | src/DiarioScreen.jsx:7; src/DiarioScreen.jsx:203–225; src/DiarioScreen.jsx:342–370; src/app-config.js | test/ui-regressions.test.js:348 |

Para FR-021/022 el plan exigirá pruebas que fallen en BASE por el motivo
específico antes de cambiar src y pasen después. La exploración no cumple
esa puerta. Para los AS-IS los pins deberán pasar antes de transformar.

## Criterios medibles de aceptación

- SC-001: 23 FR y 23 escenarios (46 IDs) completos, sin partial/pending y con nombres de pruebas descubiertos; revisión de aserciones por ID.
- SC-002: Caracterización del original antes de src y controles negativos que demuestren detectar pérdida de fecha, tema, cierre/foco y asociación de campos; el plan definirá mutaciones y checkpoint.
- SC-003: Chromium sobre App real con servicios sintéticos: navegación a 390/720/721/1280 px; geometría también en 420/959/960 px. Red externa bloqueada; fechas y datos deterministas. Un fallo existente se registra, no se convierte en un CHANGE implícito.
- SC-004: FR-021/022 rojos sobre BASE y verdes después, con teclado real de Chromium, nombres accesibles exactos y limpieza al desmontar; regresiones de clic y de guardado intactas.
- SC-005: Seis manifiestos completos sobre el mismo src/resultados, suite Node, Chromium, build, límites de arquitectura y RLS real fresco con retirada del entorno local desechable. No backend real. Si cambian dependencias, auditoría; sin actualización preventiva.
- SC-006: Los 21 casos de ui-regressions.test.js inventariados individualmente con dueño, FR/escenario y prueba funcional equivalente para cada afirmación de interacción/visual. Una inspección textual sola no cierra esa afirmación. Proponer retirada KD-002 solo después de revisar las brechas y con PATCH separado ratificado.
- SC-007: Medir bundles minificados/gzip del build original y final bajo el mismo entorno; explicar variaciones. No inventar presupuesto de rendimiento ni afirmar mejora sin objetivo y medición aprobados.

## Out of Scope

- Rediseño, nueva paleta, cambio masivo de tipografía, nuevos destinos o deep links/URL/history.
- Cambiar validaciones numéricas, retención, ciclo, objetivos, temporizadores de entrenamiento, escrituras o semántica de error de servicios.
- Cambiar el primer render de tema inválido, sincronizar section de Cuenta en caliente o aplicar reduced-motion universalmente sin CHANGE adicional.
- Etiquetar todos los campos del producto, certificar accesibilidad/WCAG, compatibilidad exhaustiva con lectores de pantalla, Safari o Firefox; los tres inputs y dos overlays de US4 son el incremento propuesto.
- Optimizar bundles, imponer límites nuevos de tamaño, añadir dependencias para una auditoría genérica, desplegar o tocar el backend real.
- Retirar KD-002 automáticamente al aprobar la spec; exige evidencia y decisión constitucional posterior.

## Compatibilidad temporal

UI-006-003 (tema inválido antes/después de React), UI-006-004 (movimiento parcial)
UI-006-005 (Cuenta conserva selección si cambia section montada) y UI-006-006
(foco de tarjeta ausente en el efecto inicial) quedan
caracterizados por FR-010/018/004/008 y se revisarán al cierre M7. No se les atribuye
validez deseada. BODY-001–005 continúan bajo 005. UI-005-001 se aborda mediante FR-022 aprobado; la ejecución espera aprobación del plan. El resto de barreras accesibles descubiertas se
registrará con prioridad y propuesta CHANGE; 006 no equivale a conformidad global.

## Clarificaciones aprobadas — 2026-10-19

- C-001 [APROBADA]: Aprobar shell y consumidores de interfaz con 21 FR AS-IS, fechas/temas/recorridos actuales y fronteras 001–005. Recomendación: incluir ambos previews y todas las dependencias necesarias, sin reescribir dominio ni rediseñar.
- C-002 [APROBADA]: Aprobar FR-021/022 como dos CHANGE: foco/teclado/modalidad en Registrar y DetailSheet; nombres accesibles solo en peso, correo y contraseña. Recomendación: incluirlos con prueba roja antes de implementar; no ampliar a toda la accesibilidad del producto.
- C-003 [APROBADA]: Aprobar compatibilidades temporales, medición de bundles sin optimización y cierre de KD-002 condicionado al mapa de 21 casos/evidencia/PATCH ratificada. Recomendación: conservar diferencias observadas y revisar hallazgos al cierre M7.

## Traceability

Una fila por FR y escenario; nombres y tareas se definirán en el plan. PENDING
es deliberado en esta propuesta. La tabla no presenta pruebas futuras como ejecutadas.

| FR o escenario | Historia | Resultado | Archivo :: prueba | Tarea | Estado/evidencia |
| --- | --- | --- | --- | --- | --- |
| FR-001 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS1 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-002 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS2 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-003 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS3 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-004 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS4 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-005 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS5 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-006 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS6 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-007 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS7 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-008 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| US1-AS8 | US1 | Navegar conservando contexto | PENDING | PENDING | PENDING; AS-IS |
| FR-009 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| US2-AS1 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| FR-010 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| US2-AS2 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| FR-011 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| US2-AS3 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| FR-012 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| US2-AS4 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| FR-013 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| US2-AS5 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| FR-014 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| US3-AS1 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| FR-015 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| US3-AS2 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| FR-016 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| US3-AS3 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| FR-017 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| US3-AS4 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| FR-018 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| US3-AS5 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| FR-019 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| US3-AS6 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| FR-020 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| US3-AS7 | US3 | Completar tareas en mis pantallas | PENDING | PENDING | PENDING; AS-IS |
| FR-021 | US4 | Usar los controles delimitados con teclado | PENDING | PENDING | PENDING; CHANGE |
| US4-AS1 | US4 | Usar los controles delimitados con teclado | PENDING | PENDING | PENDING; CHANGE |
| FR-022 | US4 | Usar los controles delimitados con teclado | PENDING | PENDING | PENDING; CHANGE |
| US4-AS2 | US4 | Usar los controles delimitados con teclado | PENDING | PENDING | PENDING; CHANGE |
| FR-023 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |
| US2-AS6 | US2 | Entender estado y apariencia | PENDING | PENDING | PENDING; AS-IS |

## Aprobación

2026-10-19: el propietario respondió «Aprobar alcance, ambos cambios y las tres
aclaraciones» a la solicitud explícita de aprobar esta spec y C-001/002/003.
Quedan aprobados 21 AS-IS, dos CHANGE y 23 escenarios. Se autoriza preparar
plan/tareas/analyze; su aprobación y la ejecución local son puertas separadas.
