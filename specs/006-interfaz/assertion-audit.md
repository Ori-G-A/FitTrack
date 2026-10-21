# Auditoría de aserciones de interfaz — 006

Estado: revisión del agente cerrada con checkpoint E6 completo. No constituye
aceptación del propietario ni ratificación de una enmienda. Se complementa con
[mapa de casos](static-regression-map.md), [revisión contractual](assertion-review.md)
y [validación](validation-plan.md). No se usa un título como prueba de cobertura.

## Los 21 casos de ui-regressions

Cada fila agrupa las aserciones del caso, incluyendo sus negativas. Los nombres
exactos de los pins funcionales están en el mapa y en los manifiestos propietarios.

| Caso | Aserciones revisadas y evidencia funcional | Límite |
| --- | --- | --- |
| Duración manual | Enter, blur, debounce y guarda contra reescritura inicial: training-duration y entrenamiento guiado de003 | La inspección de handlers es complementaria |
| Decisión de ritmo | markPaceGoals, snapshot, tres campos previos y undoPaceGoals: nutrition-pace-actions de004 | No certifica validez clínica |
| Tema antes de React | Fondo html, script real, valor por defecto y @import como primera regla: theme/theme-lifecycle y hash CSS006 | Se conserva la discrepancia de preferencia inválida |
| Filas de Diario | Cinco tipos, destinos, alias de Cuerpo y sección de preview: diary/routing/body-routing/previews006 | Fechas y datos sintéticos |
| Día de Plan | Datos completos, filas/huecos/entreno con fecha y limpieza al volver a raíz: plan/routing006 | Sin añadir router/history |
| Avisos y Métricas | Avisos en Diario, ancla, filtro all y retorno temprano: body-alerts005, metric-focus/detail006 | Retirada temporal en App pertenece a FR-024 |
| Cuenta | Dos pestañas, pie del rail, tres alias y selección local: account y recorrido de cuenta006 | No sincronizar sección por efecto |
| Biblioteca | Lista inicial, Nuevo, ficha, filtros de lugar/músculo y composición única: library004, screens/geometría006 | El test textual no prueba por sí mismo el panel |
| Registrar comida | Tres pantallas, Atrás/Cerrar, cantidad positiva, CTA y cuatro pestañas: CRUD/biblioteca004 y screens006 | Mantiene conversiones del contrato004 |
| Cuerpo | Cuatro secciones, selector, key por tab, coma decimal y stepper: body-routing006 y peso/medidas/bienestar005 | No cambia las diferencias de cuerpo documentadas |
| Perfil sin ciclo | Guarda compartida en registro, Cuerpo y Métricas: registration/body-routing006 y consumers005 | No afirmar supresión universal; rigen diferencias BODY |
| Avisos sin ciclo | Inicios vacíos y retorno sin avisos: body-alerts005 | Se preserva el modelo005 |
| Confirmación al guardar | Un Toast en App, posición CSS y emisiones en BodyScreen, NutritionScreen y LibraryScreen; toast006 y recorridos propietarios004/005 | El título dice cuatro pantallas, pero sus asserts de emisiones enumeran tres; no se certifica una cuarta por ese título |
| Rejilla de Métricas | auto-fill380, ausencia de salto860/minmax240 y cajas reales de gráficos: responsive/geometría006 | Siete anchos y fuente fallback fija |
| Modo sesión | Clase ft-focus, limpieza, ocultación de shell y fondo propio: sesión guiada003 y session/recorrido006 | Sin cambiar lógica de entrenamiento |
| Ficha móvil | Lista oculta hasta959 y Nutrición sin ficha superpuesta: geometría006 y CRUD004 | No certifica todos los dispositivos |
| Rail/barra y destinos | Cuatro raíces, Registrar, cinco entradas y Biblioteca fuera de Cuenta: navigation/registration/account006 | Lectura textual solo de módulos alcanzables |
| Elegir fecha | Campo date, nombre y flecha anterior: navegador004 y navegación de fechas006 | Selector nativo, sin promesa entre navegadores |
| Controles táctiles | Steppers40 en móvil/26 compactos, papelera/añadir/icono40 y filtros de fuerza compartidos: touch y controles reales en geometría006 | No interpreta el comentario sobre chips como un assert inexistente |
| Cabecera sticky | Posición, top, fondo y preview con catálogo completo: touch/previews y desplazamiento de150 alimentos006 | Oráculo bajo las fuentes de la prueba |
| Descartar avisos | Persistencia por clave/fecha, valor por defecto, plazo exacto7 días y deshacer: dismiss/recorrido006 | Avisos generales separados de paceCheckedAt004 |

## Aserciones fuera del archivo

Se inventariaron los archivos test que leen fuentes/fixtures y las aserciones
DOM de los harness funcionales. training-architecture e identity/data/body/
nutrition-architecture verifican dependencias, exports y firmas, no recorridos
visuales; pertenecen a sus contratos y FR-020006. training-trace, sdd-mutations,
interface-mutants y rls-preflight verifican evidencias/guardas; no se cuentan
como cobertura visual. security-headers y supabase-contracts pertenecen a002.
body-phase/body-guidance y nutrition-sensitivity leen oráculos/mutaciones de
dominio, además de pruebas montadas; no sustituyen geometría o teclado006.

Los asserts DOM/eventos en data-sync-hooks, data-lifecycle, identidad/fotos,
training-duration/guided, nutrition-CRUD/library/pace y body-weight/measures/
wellness/consumers se conservan bajo001–005; sus nombres ejecutados se cruzan
con los seis manifiestos en E6. Las nuevas aserciones006 se revisan por cláusula
en assertion-review y están congeladas en baseline; arquitectura añadida tras
E0 es una guarda de implementación, no un oráculo fingido del original.

## Gobierno y pendiente de cierre

Checkpoint final y negativos postverde aprobados; evidencia/final.json. KD-002 sigue
activa. La eventual propuesta de retirada debe conservar los límites de los
títulos anteriores, los hallazgos fuera de alcance y la ratificación separada.
No se modifica la constitución mediante esta auditoría.
