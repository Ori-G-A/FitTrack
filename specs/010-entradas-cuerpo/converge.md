# Converge local 010

Estado: E0–E2 verificadas localmente el 2026-10-28 (Bogotá). Entrega remota sin autorizar.

El plan original conserva sus 31 tareas. T032–T035 son aditivas: portabilidad de fuentes históricas, corrección de su ubicación, paridad del presupuesto de los casos nuevos y lectura correcta de nombres históricos. No se amplía el producto ni se reescriben intentos fallidos.

## Evidencia de cierre

379 pruebas Node, 43 Chromium y build aprobados; diez contratos/274 IDs completos. Diecinueve mutaciones postverde con controles positivos, trece controles negativos de recibos/dos positivos y restauración. RLS local fresco con tres contratos reales y limpieza.

[Checkpoint final](evidence/final.json), [recibos](evidence/final-attempt-1.json), [negativos](evidence/receipt-negatives.json). La entrada genérica completa 010 se verificó aparte; su resultado se conserva en evidencia.

Seis enmiendas legadas y dos técnicas propias canónicas. 123 firmas efectivas anteriores verificadas (117 intactas/seis enmendadas), nueve E0 propias verificadas (siete intactas/dos enmendadas) y ocho E1 intactas. Los 35 presupuestos de navegador anteriores no cambiaron.

## Revisión por cláusula

| ID | Resultado | Oráculos ejecutados | Estado |
| --- | --- | --- | --- |
| FR-001 | reemplazo por fecha, orden y reinicio de borradores | cuerpo010 original conserva reemplazo e historiales; cuerpo010 original conserva bienestar y vacios | Completo |
| FR-002 | historiales, gráficos, borrado y accesos de peso | cuerpo010 original conserva reemplazo e historiales | Completo |
| FR-003 | hidratación de bienestar, notas, energía y feedback local | cuerpo010 original conserva bienestar y vacios | Completo |
| FR-004 | opcionales null y formularios sin contenido | cuerpo010 original conserva bienestar y vacios; cuerpo010 espacios y ceros conservan ausencia y precision; cuerpo010 validadores conservan borradores y null | Completo |
| FR-005 | interpretación decimal finita y explícita | cuerpo010 coma y punto recorren nueve campos; cuerpo010 sintaxis y fronteras rechazan sin reemplazar; cuerpo010 espacios y ceros conservan ausencia y precision; cuerpo010 valores distinguen decimales vacios y errores | Completo |
| FR-006 | positivos y cero conocido sin máximos nuevos | cuerpo010 sintaxis y fronteras rechazan sin reemplazar; cuerpo010 espacios y ceros conservan ausencia y precision; cuerpo010 valores distinguen decimales vacios y errores; cuerpo010 reintroducciones detectan cinco defectos de entrada | Completo |
| FR-007 | rechazo completo sin mutación ni pérdida de borrador | cuerpo010 sintaxis y fronteras rechazan sin reemplazar; cuerpo010 mezcla invalida conserva borrador sin exito; cuerpo010 corregir permite un unico guardado; cuerpo010 validadores conservan borradores y null; cuerpo010 reintroducciones detectan cinco defectos de entrada | Completo |
| FR-008 | errores, nombres y asociación accesibles | cuerpo010 errores asocian campos en movil y escritorio; cuerpo010 reintroducciones detectan cinco defectos de entrada | Completo |
| FR-009 | corrección y un único guardado local válido | cuerpo010 corregir permite un unico guardado; cuerpo010 validadores conservan borradores y null | Completo |
| FR-010 | coma decimal utilizable desde la interfaz | cuerpo010 coma y punto recorren nueve campos; cuerpo010 reintroducciones detectan cinco defectos de entrada | Completo |
| US1-AS1 | coma/punto en nueve campos | cuerpo010 coma y punto recorren nueve campos; cuerpo010 valores distinguen decimales vacios y errores | Completo |
| US1-AS2 | espacios y forma decimal | cuerpo010 espacios y ceros conservan ausencia y precision; cuerpo010 valores distinguen decimales vacios y errores | Completo |
| US1-AS3 | opcionales y formularios vacíos | cuerpo010 original conserva bienestar y vacios; cuerpo010 espacios y ceros conservan ausencia y precision; cuerpo010 validadores conservan borradores y null | Completo |
| US1-AS4 | cero conocido y precisión | cuerpo010 espacios y ceros conservan ausencia y precision; cuerpo010 valores distinguen decimales vacios y errores | Completo |
| US1-AS5 | sintaxis inválida rechazada | cuerpo010 sintaxis y fronteras rechazan sin reemplazar; cuerpo010 valores distinguen decimales vacios y errores | Completo |
| US1-AS6 | fronteras de cero y negativos | cuerpo010 sintaxis y fronteras rechazan sin reemplazar; cuerpo010 valores distinguen decimales vacios y errores | Completo |
| US2-AS1 | error accesible en dos viewports | cuerpo010 errores asocian campos en movil y escritorio | Completo |
| US2-AS2 | registro previo intacto y sin éxito | cuerpo010 sintaxis y fronteras rechazan sin reemplazar; cuerpo010 mezcla invalida conserva borrador sin exito; cuerpo010 corregir permite un unico guardado | Completo |
| US2-AS3 | corrección y guardado único | cuerpo010 corregir permite un unico guardado | Completo |
| US2-AS4 | formulario mixto rechazado completo | cuerpo010 mezcla invalida conserva borrador sin exito; cuerpo010 validadores conservan borradores y null | Completo |
| US3-AS1 | reemplazo e ID nuevo ordenado | cuerpo010 original conserva reemplazo e historiales | Completo |
| US3-AS2 | borrador de bienestar preservado | cuerpo010 original conserva bienestar y vacios | Completo |
| US3-AS3 | historiales y acciones intactos | cuerpo010 original conserva reemplazo e historiales | Completo |
| US3-AS4 | consumidores y contratos previos preservados | cuerpo010 capas y alcance de fuente rechazan dependencias ajenas; cuerpo010 firmas y transicion rechazan enmiendas ajenas; cuerpo010 trazabilidad rechaza evidencia falsa omitida y parcial; cuerpo010 reintroducciones detectan cinco defectos de entrada; cuerpo010 presupuesto propio conserva aserciones y rechaza adendas ajenas; cuerpo010 agregador conserva nombres reales de contratos historicos | Completo |

Ninguna cláusula queda pending/partial. Los hallazgos ajenos se mantienen en el roadmap. No se realizaron limpieza histórica, cambios clínicos, SQL, dependencias, publicación ni despliegue.

sourceHash: d98481bc21caa1ade1675c38fef36c33f0a74ff2ab7a1db94d301a4d3388a38e.
verificationHash: 84218601d12e133d5e99f3bd52c6a8b6c9e2d7ee543c7489df7d4a992430ed38.

La verificación es local: no certifica una sesión autenticada ni las políticas del backend productivo. Publicar/fusionar/Vercel requiere autorización posterior específica.
