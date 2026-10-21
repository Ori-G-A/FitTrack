# Revisión de aserciones — 006

Estado: revisión del agente sobre original y candidato; cierre E6 verificado.
No es aceptación humana ni revisión independiente de otro agente.
[Validación](validation-plan.md), [matriz](traceability.json), [contrato](spec.md).

Se revisaron las cláusulas por grupo, no solo el nombre o conteo. Los pins
funcionales se ejecutan con servicios sintéticos y red bloqueada. La selección
de DOM del reveal y los textos reales se corrigieron antes de congelar; no se
modificaron aserciones de los 68 archivos previos.

| FR | Cláusulas y prueba | Estado de revisión |
| --- | --- | --- |
| FR-001 | interfaz conserva raices activas y entradas de shell; interfaz navegador raices registrar y fechas | Cláusulas revisadas y verdes sobre original |
| FR-002 | interfaz conserva destinos de registrar segun ciclo; interfaz navegador raices registrar y fechas | Cláusulas revisadas y verdes sobre original |
| FR-003 | interfaz conserva fecha enfocada y tarjeta solicitada; interfaz navegador raices registrar y fechas | Cláusulas revisadas y verdes sobre original |
| FR-004 | interfaz conserva alias de cuenta y seleccion local; interfaz navegador cuenta cuerpo y plan | Cláusulas revisadas y verdes sobre original |
| FR-005 | interfaz conserva alias seccion fecha y montaje de cuerpo; interfaz navegador cuenta cuerpo y plan | Cláusulas revisadas y verdes sobre original |
| FR-006 | interfaz conserva busqueda filtros limites y vacios de diario; interfaz navegador diario busqueda y descartes | Cláusulas revisadas y verdes sobre original |
| FR-007 | interfaz conserva destinos y fecha del dia del plan; interfaz navegador cuenta cuerpo y plan | Cláusulas revisadas y verdes sobre original |
| FR-008 | interfaz conserva filtro ancla resaltado y retorno temprano; interfaz navegador metricas tarjeta y desglose | Cláusulas revisadas y verdes sobre original |
| FR-009 | interfaz conserva preferencia y fallos de almacenamiento; interfaz navegador temas carga y errores | Cláusulas revisadas y verdes sobre original |
| FR-010 | interfaz conserva tema de sistema primer render y limpieza; interfaz navegador temas carga y errores | Cláusulas revisadas y verdes sobre original |
| FR-011 | interfaz conserva toast ultimo mensaje plazo y limpieza; interfaz navegador temas carga y errores | Cláusulas revisadas y verdes sobre original |
| FR-012 | interfaz conserva cargas reintentos errores y estado de guardado; interfaz navegador temas carga y errores; SDD-E2E-001 cargar y guardar objetivo desde interfaz; SDD-E2E-003 fallo de guardado visible y dato remoto conservado | Cláusulas revisadas y verdes sobre original |
| FR-013 | interfaz conserva contenido y cierres de desglose; interfaz navegador metricas tarjeta y desglose | Cláusulas revisadas y verdes sobre original |
| FR-014 | interfaz conserva CSS y matriz responsive original; interfaz navegador responsive geometria y tacto | Cláusulas revisadas y verdes sobre original |
| FR-015 | interfaz conserva foco visual de sesion y salida limpia; interfaz navegador sesion biblioteca nutricion y previews | Cláusulas revisadas y verdes sobre original |
| FR-016 | interfaz conserva cabecera sticky y medidas tactiles; interfaz navegador responsive geometria y tacto | Cláusulas revisadas y verdes sobre original |
| FR-017 | interfaz conserva recorridos y salidas de registro; interfaz navegador sesion biblioteca nutricion y previews; nutricion navegador registrar cantidades y corregir dia; nutricion navegador biblioteca recetas y snapshots; cuerpo navegador peso medidas y creatina | Cláusulas revisadas y verdes sobre original |
| FR-018 | interfaz conserva componentes fechas movimiento y cleanup; interfaz navegador responsive geometria y tacto | Cláusulas revisadas y verdes sobre original |
| FR-019 | interfaz conserva contratos diferentes de ambos previews; interfaz navegador sesion biblioteca nutricion y previews | Cláusulas revisadas y verdes sobre original |
| FR-020 | interfaz conserva fachadas CSS y contratos anteriores; interfaz navegador sesion biblioteca nutricion y previews | Cláusulas revisadas y verdes sobre original |
| FR-021 | interfaz cambio Registrar teclado y foco; interfaz cambio DetailSheet teclado y foco | Rojo original archivado; verde final E6 |
| FR-022 | interfaz cambio campo Peso en kg; interfaz cambio campo Correo electrónico; interfaz cambio campo Contraseña | Rojo original archivado; verde final E6 |
| FR-023 | interfaz conserva descarte general siete dias y deshacer; interfaz navegador diario busqueda y descartes | Cláusulas revisadas y verdes sobre original |
| FR-024 | interfaz cambio resaltado temporal tras consumo de focusCard; interfaz cambio resaltado reemplazo y desmontaje | Rojo original archivado; verde final E6 |

FR-001: rail/barra, activos, cuenta y expansión hover/focus/clic. FR-003/005:
fecha histórica/limpieza, key por tab y borrador al remontar. FR-006/007: límites
40/460, filtros, fechas por fila/huecos y rutas actuales. FR-008: control aislado
y retorno temprano; el plazo en App pertenece al CHANGE FR-024, no se oculta
el fallo. FR-009/010: media query, almacenamiento bloqueado, script real e
interpretación inválida conservada. FR-011/012: último mensaje/plazos/cleanup,
carga/reintentos, Guardando/Guardado/error y fallback con tema. FR-013: contenido
y cierres reales de Diario/Métricas. FR-014/016: CSS idéntico, siete anchos,
cajas de gráficos, sticky, stepper/papeleras/añadir serie y filtros de fuerza
reales; geometría vacía en siete anchos. Oráculo congelado en baseline.
FR-015: ft-focus y salida/interval cleanup. FR-017: recorridos con guardado de
los contratos propietarios complementan las pantallas compartidas. FR-018:
fechas/spark/reveal, 639/640 y listeners/temporizadores; no movimiento universal.
FR-019: nueve destinos del preview principal y ocho de maqueta, conservando
sus placeholders y tema distinto. FR-020: exports, 68 pins y CSS; la retirada
KD-002 requiere todavía revisar el mapa individual al cierre, no esta baseline.
FR-023: fecha por clave, límite exacto7 días, deshacer sin perder otras claves.

El original conserva los rojos FR-021/022/024, sin skips ni test.fail; el candidato pasa los siete casos.
G-PIN no ratifica la duración defectuosa ni declara esos seis IDs completos.

Ejecución fresca:309 Node y20 Chromium aprobados; siete rojos específicos
repetidos con el harness final. [Firmas y resultados](evidence/baseline.json).

Cierre:314 Node/27 Chromium y184 IDs completos en seis contratos. [Evidencia](evidence/final.json). Los plazos se controlan mediante [PIN-006-001](evidence/pin-amendment-001.json), con20 AS-IS y siete rojos repetidos sobre el original. RLS fresco con cleanup y tres negativos postverde detectados.
