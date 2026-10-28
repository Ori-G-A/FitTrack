Estado vigente — 2026-10-28 (Bogotá): 010 cerrada localmente, 24 IDs propios y diez contratos/274 IDs completos. [Converge](converge.md), [verificación](verification.md). Los apartados siguientes conservan la cronología y sus aprobaciones; las esperas locales antiguas quedan cumplidas. Publicación/integración/Vercel pendientes de autorización específica.

# Matriz de validación propuesta — 010

Estado: plan pendiente de aprobación; nombres previstos, no pruebas ejecutadas.
[Spec](spec.md), [plan](plan.md), [tareas](tasks.md), [manifiesto](traceability.json).

## Oráculos previstos y etapas

| Clave | Archivo :: nombre exacto | Cuándo y qué prueba |
| --- | --- | --- |
| A1 | browser-tests/body-inputs.spec.js :: cuerpo010 original conserva reemplazo e historiales | E0 original/E1 candidato: duplicados, otro día, ID nuevo, orden, resets peso/medidas, gráficos/historiales 8/6/6, borrados y accesos/pasos válidos |
| A2 | browser-tests/body-inputs.spec.js :: cuerpo010 original conserva bienestar y vacios | E0/E1: bienestar por fecha, cambios externos, notas/energía, nota sola, opcionales null y formularios sin contenido |
| B1 | change-tests/body-inputs.spec.js :: cuerpo010 coma y punto recorren nueve campos | E0 rojo real/E1 verde: teclado y valores guardados de los nueve campos con ambos separadores, sin normalización prematura |
| B2 | change-tests/body-inputs.spec.js :: cuerpo010 sintaxis y fronteras rechazan sin reemplazar | E0 rojo/E1 verde: texto, exponente, hexadecimal, separadores mezclados, Infinity, negativo y cero donde no procede; setter/registro previo observados |
| B3 | change-tests/body-inputs.spec.js :: cuerpo010 mezcla invalida conserva borrador sin exito | E0 rojo/E1 verde: medidas y bienestar mezclados; ninguna escritura ni éxito, notas/energía no permiten el inválido, borrador intacto |
| B4 | change-tests/body-inputs.spec.js :: cuerpo010 errores asocian campos en movil y escritorio | E0 rojo/E1 verde: nombres de nueve campos/tres acciones, role=alert, aria-invalid, relación con explicación y layout utilizable en 390×844 y 1280×900 |
| B5 | change-tests/body-inputs.spec.js :: cuerpo010 corregir permite un unico guardado | E0 rojo/E1 verde: entrada inválida, error y conservación; corregir, un setter, valores finitos/null, mensaje retirado y resets por formulario |
| B6 | change-tests/body-inputs.spec.js :: cuerpo010 espacios y ceros conservan ausencia y precision | E0 control/E1 verde: cero sueño/pasos, opcionales vacíos o espacios, fracciones y positivos grandes finitos; mismo significado final aunque el control original filtre espacios |
| V1 | test/body-inputs-values.test.js :: cuerpo010 valores distinguen decimales vacios y errores | E1: tabla pura completa con los nueve campos, texto/números hidratados y errores discriminados; no contar import ausente como rojo E0 |
| V2 | test/body-inputs-values.test.js :: cuerpo010 validadores conservan borradores y null | E1: inmutabilidad de borrador, rechazo agregado, null frente a cero y payload válido sin NaN/Infinity |
| L1 | test/body-inputs-architecture.test.js :: cuerpo010 capas y alcance de fuente rechazan dependencias ajenas | E1: grafo puro sin React/DOM/SDK, ciclos y negativos transitivos; alcance exacto de fuente, historial y módulos ajenos intactos |
| P1 | test/body-inputs-pins.test.js :: cuerpo010 firmas y transicion rechazan enmiendas ajenas | E0/E1: seis transformaciones, cadena y negativos de fuente/plan/hash/bloques; resultados sintéticos solo acreditan verificador |
| T1 | test/body-inputs-trace.test.js :: cuerpo010 trazabilidad rechaza evidencia falsa omitida y parcial | E0/E1: nombres falsos, duplicados, omitidos, partial/pending y resultados no aprobados; sin atribuir metadatos a ejecución de producto |
| M1 | recibo real de scripts/check-body-inputs-mutations.js :: cuerpo010 reintroducciones detectan cinco defectos de entrada | E2: cinco mutaciones reales y controles positivos; síntesis del nombre solo después de validar recibos, resultados y limpieza |

B6 no se fuerza a fallar cuando preserva lo que ya funciona. Entregar las
mismas secuencias de teclado en E0 y E1 y comprobar su significado guardado:
si type=number filtra espacios y deja vacío, el resultado opcional sigue siendo
null. B1 exige además conservar la coma, una garantía nueva. No se cambia el
cuerpo congelado entre etapas ni se usan condiciones para omitir regresiones
ante el producto antiguo.

## Matriz de valores

- Válidos: `65`, `65.4`, `65,4`, `+65,4`, `.5`, `5,`, espacios exteriores; números hidratados finitos, incluso si su String usa exponente.
- Vacíos: cadena vacía y solo espacios; null en payload opcional. Probar peso requerido, medidas todas vacías y bienestar vacío/nota sola/energía sola.
- Cero: `0`, `0,0`, `-0` y número cero. Conservar solo sueño/pasos; rechazar para peso, las cinco medidas y pulso.
- Negativos: nueve campos con valor menor que cero, incluida mezcla con otros válidos.
- Rechazos de sintaxis: `x`, `1e2`, `0x10`, `1,2.3`, `1 000`, varios separadores, `NaN`, `Infinity`, `-Infinity`; tipos booleano/objeto en validadores puros.
- Finitud: texto decimal que desborda Number, Number NaN/Infinity y positivos finitos grandes. Sin redondeo añadido; no prometer exactitud decimal arbitraria.
- Precisión: fracciones de sueño, pasos y pulso; sin obligar enteros ni máximos. `1,000` significa decimal 1 según C-001.

La tabla pura recorre los nueve campos; Chromium cubre entrada real en los
nueve, matrices por tipo de regla, los tres formularios y ambos viewports. No
se afirma que el navegador entregue literalmente NaN/Infinity a un input number;
se prueba texto en los controles nuevos y tipo numérico en el módulo puro.

## Cobertura por cláusula

El manifiesto contiene una fila por FR y escenario con nombres/archivos/tareas
previstos, y tests vacíos/status pending hasta ejecutar. No completar un FR
compuesto por pasar una subaserción. Las asociaciones se fijan en el manifiesto;
P1/T1 complementan la evidencia y M1 refuerza las garantías críticas.

SC-001: A1/A2 sobre original y B1–B5 con errores funcionales identificados,
antes de cambios de src; V1/V2 no se presentan como pruebas originales.
SC-002: V1/V2 y B1/B2/B3/B6. SC-003: B4/B5. SC-004: checkpoint completo con
las nueve trazas previas y 24 IDs propios. SC-005: A1/A2/L1/P1/M1 y revisión
de diff, source-transition y módulos ajenos sin cambios.

## Comandos propuestos

Los scripts y archivos nuevos siguientes son parte del plan; todavía no existen
como capacidades ejecutables. Usar Node 24.21.0/pnpm 11.11.0 fijados.

```powershell
pnpm exec node --version
pnpm test
pnpm exec playwright test --reporter=json
pnpm run build
pnpm exec playwright test --config=playwright.body-inputs.config.js
pnpm exec node --test --test-isolation=none test/body-inputs-values.test.js
pnpm exec node scripts/run-body-inputs-checkpoint.js e1
pnpm exec node scripts/run-body-inputs-checkpoint.js proofs
pnpm exec node scripts/run-body-inputs-checkpoint.js verify-proofs
pnpm exec node scripts/run-body-inputs-checkpoint.js final
pnpm run test:sdd:complete --spec=010-entradas-cuerpo
```

El checkpoint E1 puede usar evidencia RLS anterior solo para diagnóstico,
marcándola como anterior. El cierre E2 exige ejecución fresca de `pnpm test:rls`
dentro del checkpoint, posterior al código final y con limpieza; no backend real.
El runner integra pruebas de mutación y contratos 001–010 sin reescribir los
reportes históricos de 009. Sin skips/retries nuevos ni ampliación de timeouts.

## Negativos y límites de cierre

Las cinco mutaciones de 010 operan en copias sin credenciales, alteran una regla
real y fallan por una aserción funcional prevista. Cada control positivo pasa;
se restaura/elimina únicamente la copia propia con ruta resuelta y nonce.
Los recibos rechazan huella/hash/nombre/comando alterado, reporte omitido,
duplicado, recuento incompleto o cleanup ausente. Mantener los catorce negativos
postverde de 006–009 y los cuatro integrados de Cuerpo dentro de la suite Node.

No prueba política productiva, todos los dispositivos/lectores de pantalla,
precisión médica ni limpieza de datos antiguos. No se necesita instalar o
actualizar dependencias para este plan. La autorización local propuesta no
incluye publicación, fusión ni Vercel.

## Aprobación de planificación — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2». Aprueba plan, 31 tareas y análisis,
y autoriza E0–E2 local antes de integrar el PR documental con snapshot aprobado.
Las esperas de decisión local anteriores son históricas. No autoriza publicar,
fusionar ni desplegar 010.
