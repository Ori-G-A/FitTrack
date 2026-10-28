Estado vigente — 2026-10-28 (Bogotá): 010 integrada mediante #22/#23, con CI de main y Vercel Production verificados en `e427682`. [Entrega remota](evidence/integration.json). Los apartados siguientes conservan la cronología y sus decisiones ya cumplidas.

Estado vigente — 2026-10-28 (Bogotá): 010 cerrada localmente, 24 IDs propios y diez contratos/274 IDs completos. [Converge](converge.md), [verificación](verification.md). Los apartados siguientes conservan la cronología y sus aprobaciones; las esperas locales antiguas quedan cumplidas. Publicación/integración/Vercel pendientes de autorización específica.

# Revisión cruzada del plan propuesto — 010

Fecha: 2026-10-27 (Bogotá). Revisión del agente, no aprobación del propietario.
Alcance aprobado `1fa6561`; [plan](plan.md), [tareas](tasks.md),
[validación](validation-plan.md), [enmiendas](pin-amendments.md).

## Resultado documental

Plan preparado con 31 tareas E0–E2. Diez FR y catorce escenarios tienen filas
individuales, nombres previstos y tareas; todos siguen pending. Se prevén
ocho recorridos Chromium nuevos (43 totales), cinco tests Node propios y
diecinueve mutaciones postverde (catorce heredadas + cinco nuevas).
No se ejecutó el código de un diseño que aún no está implementado.

| Revisión | Evidencia y resolución en el plan |
| --- | --- |
| Alcance | Nueve campos, reglas C-001/002/003 ya aprobadas; source limitado a BodyScreen/body-records y body-inputs nuevo |
| P1/P3 | AS-IS originales y cinco rojos funcionales antes del cambio; API pura ausente no se usa como rojo; control B6 conserva significado que ya funciona |
| P2 | Validar antes de setter/uid/éxito y conservar borrador/registro previo; no mezclar feedback local con confirmación remota |
| P4 | Parser/validadores puros, coordinación en pantalla y builders de registros sin efectos; prueba transitiva del nuevo módulo |
| P5 | Fixtures sintéticos, red bloqueada, ningún backend real o secreto; RLS fresco local en cierre |
| P6 | Dos huellas, recibos por ejecución y reportes de omisiones; 274 IDs no se confunden con recuento de tests |
| Compatibilidad 005 | Enmiendas de tres tests preservan nombres/aserciones ajenas; body-build mantiene detección de cero y las otras tres mutaciones |
| Compatibilidad 009 | Seis destinos congelados inventariados; fuente histórica conservada, transición acotada y negativos, sin aceptar hashes libres |
| Cadena de firmas | 123 efectivas, 117 intactas/seis enmendadas; composición independiente y cifras por cohorte declaradas |
| Ejecución | Finalizar ejecutables antes del verde dirigido, emitir adendas con recibos y después correr suite de integridad; evita evidencia circular |
| UI y datos | Campos/action con nombres, errores asociados, ambos viewports; coma probada por teclado sin fill prohibido por Playwright |
| Cierre | Diez contratos/274 IDs, RLS fresco, diecinueve mutaciones postverde y cuatro de Cuerpo dentro de Node; informe final y backlog separado |
| Gobierno | Solo alcance aprobado; plan, ejecución local y entrega remota no aprobados aún |

## Hallazgos resueltos durante la preparación

- A-010-001: las pruebas de 005 exigen negativos/Infinity/NaN. Resuelto documentalmente mediante PIN-010-001/002/003 y nota normativa de sustitución; no se eliminan controles ajenos.
- A-010-002: la mutación weight-zero depende de una guarda que se moverá. PIN-010-004 traslada solo el punto de inyección a la regla pura, con ancla única y ejecución real de los cuatro controles originales.
- A-010-003: verifyClockPins exige igualdad permanente a la fuente sin cambios de 009. PIN-010-005 conserva el original y añade transición verificada de dos modificaciones/un archivo nuevo; PIN-010-006 exige el recuento real de su cohorte.
- A-010-004: sourceHash legado enumera src con git ls-files. El plan exige indexar el módulo nuevo antes de generar huellas candidatas y contrastar además inventario de no ignorados, evitando omitirlo accidentalmente.
- A-010-005: fill de un decimal con coma en type=number puede fallar antes del producto. Teclado real y aserción de entrada/valor, no error del driver, serán la prueba roja.
- A-010-006: Number hidratado puede representarse como exponente. Se valida por tipo/finitud/signo; se rechaza solo notación exponencial escrita como texto. No se impone un máximo nuevo.
- A-010-007: los contadores de integridad 008/009 dejan de describir las firmas reales. Las únicas aserciones de recuento se actualizan y las demás permanecen; la tabla de enmiendas distingue cohortes de agregado efectivo.

No quedan contradicciones CRITICAL documentales identificadas. Estos
tratamientos requieren aprobación del plan y evidencia E0–E2; aún no acreditan
conformidad de implementación ni cierre de BODY-001.

## Riesgos de ejecución y límites

- E0 podría revelar otra dependencia congelada: registrar el hallazgo y revisar antes de ampliar la lista; no aceptar una séptima enmienda por conveniencia.
- Los seis archivos contienen garantías ajenas: after solo es válido si coincide con su transformación canónica desde el original firmado.
- Una transición de fuente no prueba comportamiento: mantener pruebas completas y comparación de archivos ajenos, no limitarse a dos campos de JSON iguales.
- Una colección histórica inválida sigue intacta hasta guardar; la edición de bienestar exige corregir o vaciar el valor incompatible, sin limpieza automática.
- Docker ha fallado de forma intermitente: conservar evidencia y trabajo independiente; RLS pendiente impide cerrar E2.
- Chromium y dos viewports no prueban todos los dispositivos o lectores de pantalla; no se realizó smoke autenticado ni RLS de producción.

## Decisión requerida

Aprobar plan, 31 tareas, análisis y ejecución local E0–E2 antes de integrar el
PR documental, manteniendo snapshot aprobado. La constitución exige esta etapa
separada; la aprobación no incluye publicar, fusionar ni desplegar 010.

## Aprobación de planificación — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2». Aprueba plan, 31 tareas y análisis,
y autoriza E0–E2 local antes de integrar el PR documental con snapshot aprobado.
Las esperas de decisión local anteriores son históricas. No autoriza publicar,
fusionar ni desplegar 010.
