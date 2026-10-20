# Plan técnico — 006-interfaz

Estado: APROBADO para ejecución local E0–E6; ejecución pendiente. Fecha: 2026-10-19.
[Spec aprobada](spec.md), [research](research.md), [validación](validation-plan.md),
[tareas](tasks.md), [analyze](analyze.md), [PR documental preparado](doc-pr.md).
BASE de producto: 86299a4497e3c19180c30a640598a1358d61cc8f.
El commit 25230b7 aprueba alcance; no modifica producto ni autoriza este plan.

## Entregas y puertas

G-DOC / T001: aprobación separada de plan/tasks/analyze. Preparar snapshot del
PR documental; publicación/fusión/despliegue requieren decisión expresa.
Ejecución local antes de integrarlo únicamente con autorización explícita.

E0 / T002–T028: fixtures/harness sobre original, 21 grupos de pins AS-IS, siete
recorridos Chromium, cinco pruebas CHANGE rojas, cuatro mutaciones AS-IS y
negativos del verificador. G-PIN exige 42 IDs AS-IS completos y cuatro IDs
CHANGE pending, con evidencia roja separada. No exige un falso verde de CHANGE.
Congelar pruebas, fixtures, oráculos e instrumentación; comprobar los 68 pins
previos. Ninguna modificación de src antes de G-PIN.

E1 / T029: navegación/configuración de shell separada; fechas, tarjeta, alias y
orden de setters en App conservados. E2 / T030: tema y adaptadores del navegador
aislados, fachada app-utils intacta; no cambiar el script de primer render.
E3 / T031: estilos y presentación del shell separados sin cambiar CSS ni cascada.

E4 / T032: FR-021: ModalSheet compartido para Registrar/DetailSheet, foco y teclado;
rojo registrado antes de src, pruebas verdes tras implementar y limpieza probada.
E5 / T033: FR-022: asociación explícita de los tres inputs, sin tocar validación
o guardado; rojo previo individual y verde posterior por cada campo.

E6 / T034–T039: arquitectura, negativos CHANGE, incorporación a descubrimiento
ordinario, CI/artifacts 006, seis contratos completos, RLS fresco, medidas de
build, revisión de las 21 regresiones, converge y PR de código preparado.
No retirar KD-002 ni publicar/mergear/desplegar por inferencia de este plan.

Cada E1–E5 tiene checkpoint indivisible: Node completo, Chromium AS-IS completo,
CHANGE ya implementados, build, matriz parcial vigente, firmas y hashes. Un
fallo obliga a corregir y repetir ese checkpoint entero antes de continuar.
Commit por entrega comprobada. Nuevas tareas de converge se añaden sin
reescribir el historial; una corrección de comportamiento no aprobada se consulta.

## Fronteras propuestas

| Archivo | Responsabilidad | Dependencias permitidas / preservación |
| --- | --- | --- |
| src/app-navigation.js | Destinos raíz, grupos de alias, filas de registro y descriptores de navegación | Datos puros; recibe habilitación de ciclo, sin importar React, DOM, app-utils ni backend; no validar/rechazar destinos nuevos por iniciativa |
| src/ui-theme.js | THEME_KEY, readThemePref y resolveTheme actuales | Adaptador de almacenamiento permitido; API pública reexportada por app-utils; lectura inválida/bloqueada sigue dark |
| src/use-app-theme.js | Estado de preferencia/sistema, listener, persistencia y atributo de html | React, ui-theme y navegador; mismas dependencias/cleanup que App; no depender de pantallas o servicios |
| src/app-styles.js | Cadena CSS completa en el mismo orden | Datos de presentación; sin React/DOM/backend; @import sigue primero; CSS reexportado por FitTrack para previews |
| src/AppNavigation.jsx | Rail/barra y presentación de cuenta/Registrar, con callbacks recibidos | React/lucide/configuración; sin Supabase, coordinador de guardado o estado de dominio; indicador/acciones se inyectan |
| src/ModalSheet.jsx | Estructura modal, fondo/panel y gestión de foco/teclado aprobada | React y DOM local; sin dominio/backend; conserva clases existentes, no portal ni nuevo sistema de overlays |
| src/DetailSheet.jsx | Contenido de desglose existente | ModalSheet; títulos/filas/notas intactos; sin duplicar métricas |

FitTrack conserva la coordinación de sesión/carga/persistencia y estado tab,
focusDate, focusCard, menuOpen y sheet. goTo mantiene setFocusDate antes de
setTab; openCard mantiene setFocusCard → limpiar fecha → dashboard. No router,
history, nueva validación de ruta ni sincronización de efectos adicional.
BodyScreen conserva key por tab; AccountScreen conserva inicialización local
sin efecto para section. Dashboard conserva la búsqueda del nodo en el mismo
efecto que cambia filtro, incluido retorno temprano UI-006-006.

AppNavigation recibe callbacks, textos y señal de guardado; no obtiene datos ni
invoca useSyncedState. No trasladar lógica de import/export/signOut al componente.
Si las filas de Registrar merecen componente local, se aloja junto a navegación;
no añadir una abstracción genérica de formularios, contexto global o biblioteca UI.

La extracción CSS debe ser identidad de cadena, no un formateo o limpieza.
Capturar hash normalizado a LF del CSS original y comparar tras E3, manteniendo
especificidad, orden, @import y defaults. No reemplazar tokens ni breakpoints.
La regla .gitattributes de 005 permanece intacta. Medir cajas computadas además
de la identidad textual: el markup podría cambiar geometría aun con CSS idéntico.

## Cambios de accesibilidad aprobados

ModalSheet conserva el fondo .ft-sheet y panel .ft-sheet-panel. Los dos callers
aportan nombre accesible y onClose; los botones y filas mantienen orden/texto.
Al abrir guarda activeElement y enfoca primer control interior utilizable;
si no existe, enfoca el contenedor con tabIndex=-1. Tab/Shift+Tab recorren solo
controles interiores habilitados/visibles; Escape cierra. Los listeners no
reaccionan tras desmontar y StrictMode no deja suscripciones duplicadas.

Cancelación por botón/fondo/Escape restaura el disparador si está conectado y
visible. La selección de ruta cierra sin invadir el foco del destino ni enfocar
un elemento desmontado; debe distinguirse del cierre por cancelación. No usar
selectores globales de foco, no enfocar el fondo y no alterar un diálogo ajeno.
Sin portal: conserva herencia de tema y ubicación CSS. Probar contenedor sin
controles y disparador removido mediante fixture de componente además de App.

FR-022 se limita a input de peso, correo y contraseña. Asociación explícita
label/htmlFor/id o equivalente inequívoco, con IDs sin colisiones si se monta
una fixture adicional. El stepper queda fuera del label de peso. Preservar
inputMode, type, autofill, conversiones, onKeyDown/submit, busy y orden de efectos.
No extender el cambio a otros campos mal etiquetados encontrados durante E0.

## Pruebas y evidencias por fase

E0 ejecuta pnpm test y pnpm exec playwright test con configuración habitual para
AS-IS. Las cinco pruebas rojas viven en change-tests/interface-accessibility.spec.js
y usan playwright.interface-change.config.js con testDir propio, sin test.skip,
test.fail o catches genéricos. Ejecutarlas separadas de las pruebas verdes;
guardar JSON, títulos, revisiones y mensajes exactos de cada fallo esperado.
Un timeout de montaje, import o fixture no demuestra el rojo requerido.

pnpm test:sdd --spec=006-interfaz valida en E0 los 42 AS-IS completos y cuatro
CHANGE pending. pnpm test:sdd:complete --spec=006-interfaz DEBE rechazar ese
estado por esos cuatro IDs; registrar esa prueba negativa sin presentarla
como fallo inesperado del checkpoint. Los cinco contratos anteriores siguen
vigentes. No convertir el rechazo esperado en complete ni omitir pruebas.

Después de E4/E5 ejecutar la configuración CHANGE explícita para los casos ya
implementados; lo que falte conserva su rojo histórico/pending. En E6, añadir
proyectos Playwright con testDir browser-tests y change-tests, compartiendo use
y reporter, para que el runner ordinario descubra todas las pruebas una sola
vez. Nombres únicos; pruebas anteriores conservan nombres, cero skips/retries.
La configuración específica CHANGE congelada permanece en su ruta original.

Los pins nuevos se ejecutan sobre BASE y producto refactorizado, sin bifurcar
aserciones por versión o snapshot creado después de cambiar src. La geometría
usa tolerancias explícitas de ≤1 CSS px, mismo Chromium, fuentes externas
bloqueadas y fuente fallback determinista; no certifica tipografía remota.
Oráculos CSS/DOM se capturan sobre original y se revisan antes de congelar.
El harness falla si entra src/supabase.js o cualquier red no simulada.

Las 21 pruebas existentes de ui-regressions se conservan o se adaptan solo para
dejar de depender de ubicación al extraer archivos. Citar FR por aserción;
demostrar la misma comprobación sobre BASE y candidato. No debilitarla por un
fallo; no concatenar fuentes muertas/duplicadas para satisfacer regex. Complementar
con recorrido funcional concreto; se revisa cada afirmación, no solo cada título.
Los 68 pins congelados no se editan. Repetir íntegro todo checkpoint fallido.

## Descubrimiento, arquitectura y cierre

Pruebas transitivas por metafile, negativos React/DOM/backend en app-navigation
y E/S en app-styles; ui-theme/use-app-theme/ModalSheet son adaptadores, no se
declaran puros. Impedir imports de dominio/backend en navegación/modal y ciclos
en el grafo nuevo. Mantener límites de módulos puros 001–005, exports de FitTrack
(incluido CSS y Train), app-utils y consumidores de previews/harness existentes.

Para sourceHash registrar todos los src nuevos en Git antes de calcularlo;
comparar manifiestos contra la misma colección TAP/JSON, revisión y bytes. En
cierre exigir 182 IDs completos: 136 anteriores + 46 de 006, sin mezclar evidencia.
RLS sobre Supabase local desechable con guardas, runtime declarado y limpieza;
no .env.local ni backend real. Un Docker inaccesible impide cierre, no el trabajo
independiente; no restaurar una evidencia antigua para simular frescura.

Medir baseline/final minificados y gzip con build/runtime fijos; registrar delta
y explicar cambios. No ampliar chunkSizeWarningLimit ni prometer optimización.
Sin dependencias previstas; si surge necesidad, justificarla y auditar el cambio.

Converge revisa spec/plan/tareas/aserciones/mapa de 21 casos. Proponer informe
de retirada KD-002 solo con cobertura funcional real de sus afirmaciones y sin
brechas; preparar una PATCH en rama propia para ratificación posterior. Este
plan no la ratifica ni promete accesibilidad global. PR de código incluye orden,
pruebas reales/omisiones, hallazgos y reversión. Publicación/merge/Vercel esperan
autorización específica; la anterior cubría exclusivamente 005.

Reversión: entregas independientes E5→E1, sin migraciones de datos. No revertir
evidencia ni congelados para esconder fallos. Un cambio del alcance o un AS-IS
demostrablemente incorrecto se resuelve con el propietario antes de modificarlo.
