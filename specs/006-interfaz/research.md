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
