# Survey 006: Interfaz y accesibilidad

Fecha: 2026-10-19. BASE: 86299a4497e3c19180c30a640598a1358d61cc8f.
Estado: diagnóstico y propuesta; sin plan aprobado ni baseline contractual 006.
[Spec](../../specs/006-interfaz/spec.md), [checklist](../../specs/006-interfaz/checklist.md),
[constitución](../../.specify/memory/constitution.md).

## Responsabilidades y fronteras

| Fuente | Comportamiento observado | Frontera |
| --- | --- | --- |
| [FitTrack](../../src/FitTrack.jsx:505) | Rutas, fecha enfocada, tarjeta enfocada, tema, shell, rail, barra móvil y Registrar | 001/002 conservan carga, persistencia e identidad; no reescribirlas |
| [CSS en FitTrack](../../src/FitTrack.jsx:69) | Tokens, tipografía, rejillas, sticky, media queries, sesión y overlays | Inventariar consumidores antes de extraer estilos; conservar orden y cascada |
| [app-utils](../../src/app-utils.js:157) | Búsqueda de diario y lectura/resolución de tema | Mantiene fachadas compartidas de 001–005; no trasladar algoritmos de dominio |
| [Diario](../../src/DiarioScreen.jsx:176) y [Plan](../../src/PlanScreen.jsx:48) | Búsqueda/filtros, tarjetas, rutas con fecha, avisos y deshacer | Reutilizar resultados y operaciones de 003–005 |
| [Métricas](../../src/DashboardScreen.jsx:432) | Filtros, anclas y resaltado al abrir aviso | Fórmulas pertenecen a 003–005; foco visual no equivale a foco de teclado |
| [Cuenta](../../src/AccountScreen.jsx:15) | Perfil y Datos; composición de Perfil y Ajustes | El estado de pestaña se inicializa desde section, no se sincroniza después |
| [EditorialUI](../../src/EditorialUI.jsx) | Cabeceras, fechas, sparkline, reveal y breakpoint 640 | Distinto del breakpoint 720 de navegación; no unificarlos implícitamente |
| [DetailSheet](../../src/DetailSheet.jsx:14) | Detalles numéricos, cierre por fondo y botón | Tiene role/aria-modal, pero carece de manejo de teclado/foco |
| [Toast](../../src/toast.jsx:13) y [AuthUI](../../src/AuthUI.jsx) | Confirmación efímera; estado de guardado y acceso | Toast no prueba persistencia remota; conservar la distinción |
| [ErrorBoundary](../../src/ErrorBoundary.jsx), [main](../../src/main.jsx), [index](../../index.html) | Error de render, recarga y tema antes de React | Diagnóstico sanitizado pertenece a 002 |
| [Preview principal](../../src/preview-main.jsx) y [maqueta](../../preview/maqueta.jsx) | Composición sintética y rutas propias | No tienen paridad total con App: temas, estado e identidad son distintos |

La revisión incluye las pantallas de registro como consumidoras de interfaz.
No propone rediseño visual, sustitución de componentes ni un router concreto.
Las extracciones y sus límites se decidirán en el plan, después del alcance.

## Pruebas existentes

Hay 21 casos en [ui-regressions](../../test/ui-regressions.test.js). Comprueban
principalmente texto fuente/CSS. Una parte se complementa con pruebas de dominio
y 13 recorridos Chromium de 001/003/004/005, a 1280×900 por defecto. Esas pruebas
no prueban por sí solas navegación móvil, geometría, teclado ni toda la semántica
que sugieren sus títulos; por ejemplo, «un perfil de hombre no ve nada del ciclo»
no cubre todos los consumidores ni invalida BODY-003 de 005.

El plan debe mapear individualmente los 21 casos a FR/escenarios, descubrir
qué afirmaciones ya tienen pruebas funcionales y cubrir el resto antes de
proponer retirar KD-002. Un caso estático útil puede conservarse, pero no contará
como única evidencia de una interacción o de un resultado visual.

## Exploración ejecutada

Comando: pnpm exec node test-results/survey-interface.mjs, Node 24.21.0.
Chromium con harness existente, servicios sintéticos y toda la red abortada;
sin backend real ni lectura de credenciales. [Resultado](../../specs/006-interfaz/evidence/survey.json).
A 390×900 y 1280×900: Registrar existe pero carece de role=dialog; al abrir,
el foco permanece en su disparador; Escape no cierra; el input de peso existe
pero getByLabel("Peso en kg", exact) devuelve cero. No se observó overflow
horizontal en esas dos vistas concretas de Diario/Cuerpo con la fixture vacía.
Esto no demuestra ausencia de overflow en otras pantallas, datos o anchuras.

El primer intento esperó visibilidad de la cuenta del rail oculta en móvil;
se interrumpió y se corrigió el diagnóstico para esperar montaje, con timeout.
Se repitió la exploración completa. Ningún src ni prueba contractual fue editado.
No es G-PIN, prueba CHANGE roja ni aceptación de alcance.

## Hallazgos y propuestas

| ID | Evidencia y límite | Propuesta |
| --- | --- | --- |
| UI-006-001 | Registrar sin semántica modal, foco ni Escape, reproducido; DetailSheet tiene semántica pero sin código de foco/Escape, observado por lectura | CHANGE FR-021: ambos overlays con foco inicial/contenido, confinamiento Tab/Shift+Tab, Escape y restauración si el disparador sigue conectado |
| UI-005-001 / UI-006-002 | Peso no se encuentra por etiqueta, reproducido. Correo/Contraseña tienen labels hermanos sin asociación, por lectura en AuthUI:79/93 | CHANGE FR-022 limitado a esos tres controles: nombres accesibles inequívocos, sin cambiar validación ni guardado |
| UI-006-003 | index.html interpreta preferencia inválida como claro; readThemePref la normaliza a oscuro | Preservar como compatibilidad temporal FR-010; corrección de primer render en un CHANGE posterior |
| UI-006-004 | Rise usa animaciones inline; reduced-motion solo modifica algunos estilos (toast/resaltado), no todo el movimiento | Caracterizar FR-018; no prometer reducción universal ni conformidad WCAG completa |
| UI-006-005 | Cuenta inicializa pestaña una vez; cambiar alias mientras sigue montada puede conservar selección | Caracterizar FR-004; no añadir sincronización implícita |
| PERF-001 | Último build 005: index 504,38 kB / gzip 146,51 kB; LineChart 393,31 kB / gzip 107,99 kB | Medir en baseline con runtime/build fijos; no fijar presupuesto ni optimizar sin objetivo aprobado |

Las propuestas CHANGE están pendientes de aprobación; lo demás no autoriza
correcciones silenciosas. Conservar comportamiento de temas inválidos y Cuenta
requiere pins antes de transformar, y revisión al cierre M7.

## Cierre constitucional previsto

001–005 tienen 136 IDs completos, pero eso no cierra KD-002 global. M7 exige
006 completa, revisión de aserciones de interfaz, mapa de los 21 casos estáticos,
escenarios de teclado y móvil, regresiones anteriores, y revisión constitucional.
La retirada normativa de KD-002 requiere informe PATCH y ratificación separada.
No basta borrar pruebas estáticas, añadir screenshots o ejecutar un escáner.

Para aprobar alcance: C-001 shell y consumidores de interfaz, C-002 los dos
cambios delimitados, C-003 compatibilidades/exclusiones y puerta KD-002.
Todavía no se prepara implementación ni se publica otro PR.

## Inventario individual de regresiones existentes

Mapa preliminar por lectura, no afirmación de cobertura completa. En el plan
se revisará cada aserción, se enlazará la prueba funcional por nombre exacto y
se registrará cualquier brecha. Los FR siguientes son de 006 salvo dueño explícito.

| Caso existente | Dueño/frontera | FR de interfaz | Situación |
| --- | --- | --- | --- |
| [manual duration saves on Enter, on blur and by itself](../../test/ui-regressions.test.js:5) | 003 FR-004 | FR-017/020 | Revisión funcional PENDING |
| [el aviso de ritmo persiste su decisión en goals, no en estado local](../../test/ui-regressions.test.js:17) | 004 FR-014 | FR-020 | Revisión funcional PENDING |
| [el arranque pinta el tema antes de que React monte](../../test/ui-regressions.test.js:29) | 006 | FR-009/010 | Revisión funcional PENDING |
| [cada fila del diario aterriza en la pantalla de su tipo](../../test/ui-regressions.test.js:41) | 001/003/005 y 006 | FR-003/005/006/019 | Revisión funcional PENDING |
| [el día del Plan recibe todo el día, no solo el entreno](../../test/ui-regressions.test.js:75) | 003/005 y 006 | FR-003/007 | Revisión funcional PENDING |
| [los avisos se leen en el Diario y saltan a su tarjeta de Métricas](../../test/ui-regressions.test.js:97) | 004/005 y 006 | FR-008/013 | Revisión funcional PENDING |
| [la cuenta es una pantalla con dos pestañas y se entra por el nombre](../../test/ui-regressions.test.js:120) | 006 | FR-004 | Revisión funcional PENDING |
| [Biblioteca abre con la lista y la ficha vive en el panel derecho](../../test/ui-regressions.test.js:137) | 003/004 y 006 | FR-014/017 | Revisión funcional PENDING |
| [registrar comida son tres pantallas y la cantidad es obligatoria](../../test/ui-regressions.test.js:157) | 004 | FR-017/020 | Revisión funcional PENDING |
| [Cuerpo se registra en cuatro pantallas, no en una pila de formularios](../../test/ui-regressions.test.js:185) | 005 | FR-005/017 | Revisión funcional PENDING |
| [un perfil de hombre no ve nada del ciclo](../../test/ui-regressions.test.js:207) | 005 (reglas distintas por consumidor) | FR-002/005/020 | Revisión funcional PENDING |
| [sin ciclo no salen avisos de ciclo ni corrección por fase](../../test/ui-regressions.test.js:221) | 005 | FR-020 | Revisión funcional PENDING |
| [guardar confirma: hay toast en las cuatro pantallas que escriben](../../test/ui-regressions.test.js:230) | 006 y confirmaciones de 004/005 | FR-011/020 | Revisión funcional PENDING |
| [la rejilla de Métricas es fluida y no parte los gráficos](../../test/ui-regressions.test.js:247) | 006 | FR-014 | Revisión funcional PENDING |
| [el modo sesión va a pantalla completa, sin rail ni barra inferior](../../test/ui-regressions.test.js:256) | 003 y 006 | FR-015 | Revisión funcional PENDING |
| [en móvil la ficha reemplaza la lista y las cifras no se aprietan](../../test/ui-regressions.test.js:271) | 004 y 006 | FR-014/017 | Revisión funcional PENDING |
| [el rail y la barra móvil llevan a lo mismo, y nada queda huérfano](../../test/ui-regressions.test.js:283) | 006 | FR-001/002 | Revisión funcional PENDING |
| [planificar otro día no son ocho flechas](../../test/ui-regressions.test.js:304) | 004 y 006 | FR-003/017 | Revisión funcional PENDING |
| [en móvil los controles se pueden tocar con el dedo](../../test/ui-regressions.test.js:314) | 006 | FR-016 | Revisión funcional PENDING |
| [la acción principal de cada pantalla no se va al desplazarse](../../test/ui-regressions.test.js:333) | 006 | FR-016 | Revisión funcional PENDING |
| [los avisos se pueden descartar, y vuelven si la causa sigue](../../test/ui-regressions.test.js:348) | 006; no confundir con aviso de ritmo 004 | FR-023 | Revisión funcional PENDING |

UI-006-006: Métricas busca el nodo inmediatamente después de solicitar filtro all;
si la tarjeta estaba desmontada por el filtro, retorna sin consumir focusCard.
Observado por lectura en DashboardScreen:432–441; FR-008 exige caracterizarlo
sin prometer el desplazamiento que sugiere el título de la regresión textual.
Revisar al cierre M7; corregirlo necesitaría CHANGE separado.

El último caso incorpora FR-023 para los descartes generales a siete días y
su deshacer. No pertenece al snapshot del aviso de ritmo FR-014 de 004.
La propuesta final tiene 21 AS-IS y dos CHANGE, 23 escenarios y 46 IDs.
