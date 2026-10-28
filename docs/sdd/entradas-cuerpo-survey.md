# Survey 010 — entradas numéricas de Cuerpo

Preparación del 2026-10-27 (Bogotá), sin cambios del producto.
[Spec propuesta](../../specs/010-entradas-cuerpo/spec.md).
Base integrada `392e797`; cierre documental previo `73819e6`.

## Resultado elegido

Tras cerrar 009 se prioriza BODY-001: impedir que una entrada inválida
reemplace los datos de Cuerpo y hacer utilizable la coma decimal en sus nueve
campos. Afecta directamente a la integridad de registros nuevos; su corrección
puede acotarse sin cambiar fórmulas ni limpiar historia. PHOTO-001 y los demás
hallazgos permanecen fuera. La prueba autenticada de producción sigue pendiente
de acordar cuenta y datos con el propietario; no impide documentar este alcance.

## Inventario de fronteras

| Frontera | Observación actual | Consumidor o consecuencia |
| --- | --- | --- |
| Peso | BodyScreen parseKg normaliza una coma; addW rechaza solo por truthiness | Acepta negativos e Infinity; guarda y limpia borrador |
| Cinco medidas | measurementValues convierte con Number; vacío exacto a null; addM rechaza solo todos null | Coma inyectada produce NaN; negativos se guardan; un campo válido no protege a los demás |
| Bienestar | replaceWellnessRecord convierte sueño/pulso/pasos; saveWel solo comprueba si hay algún dato | Puede guardar negativos y NaN; nota válida no debería autorizar un campo inválido |
| Entrada visual | Peso usa texto/inputMode decimal; medidas y bienestar usan type number | JSDOM convierte una coma asignada a input number en vacío antes de guardar; falta verificar teclado real en Chromium |
| Confirmación | Medidas y peso muestran toast tras solicitar estado; bienestar lo hace antes | Es feedback local, no confirmación remota; 007 conserva la responsabilidad sobre guardados fallidos |
| Historial | Reemplazo por fecha e ID nuevo, orden ascendente; consultas mediante body-metrics | Un rechazo debe impedir sustituir el registro previo; sin migración de historia |

`measurementValues` y `replaceWellnessRecord` solo se llaman desde BodyScreen
en src. Las funciones de reemplazo no acceden al backend. Los selectores y
consumidores de Dashboard/Diario/ciclo no necesitan nuevas reglas numéricas
para realizar este cambio; siguen preservados por 005.

## Reproducción actual

Comando reproducible:

```powershell
pnpm exec node specs/010-entradas-cuerpo/evidence/survey-probe.mjs
```

[Instrumento](../../specs/010-entradas-cuerpo/evidence/survey-probe.mjs) y
[resultado](../../specs/010-entradas-cuerpo/evidence/survey.json): nueve casos
con Node 24.21.0, React/JSDOM, colecciones sintéticas y red bloqueada. Cuatro
casos demuestran guardados inválidos mediante interacción DOM: peso negativo,
peso Infinity, medida negativa y sueño/pasos negativos. Dos prueban NaN desde
borradores inyectados (medidas y pulso con coma); no se presentan como teclado
real. Otro observa sanitización de input number en JSDOM. Dos controles
positivos conservan peso con coma y sueño/pasos con cero/null.

Se comprobaron el sourceHash original y nueve firmas antes/después: producto,
tres caracterizaciones, instrumental y verificador 009 intactos. No se usaron
credenciales, persistencia ni backend real. No se ejecutaron Chromium, suite
completa, build ni RLS para preparar este alcance. El sondeo no es G-PIN ni
acredita la solución o los nuevos requisitos.

Se ejecutaron además las tres caracterizaciones vigentes sobre el original:

```powershell
pnpm exec node --test --test-isolation=none test/body-weight.test.js test/body-measurements.test.js test/body-wellness.test.js
```

Resultado: tres aprobadas, cero fallos/skips.
[Salida conservada](../../specs/010-entradas-cuerpo/evidence/original-targeted.txt).
La [revisión de propuesta](../../specs/010-entradas-cuerpo/evidence/proposal-review.json)
comprueba enlaces, 24 IDs pending y firmas, con la misma huella de verificación
del cierre 009. No se interpreta como contrato completo de 010.

## Contratos y firmas afectados

[005 FR-001/002/003](../../specs/005-cuerpo-ciclo/spec.md) aprobó expresamente
preservar las conversiones actuales. Los casos `cuerpo peso conserva
conversiones reemplazo pasos e historial`, `cuerpo medidas conservan campos
null conversiones y reemplazo` y `cuerpo bienestar conserva borrador fecha
guardas y guardado` incluyen aserciones de negativos, Infinity o NaN. Están
congelados en 005 y en cohortes posteriores. Cambiarlos requiere un CHANGE
aprobado y una propuesta de enmienda precisa, con firmas y controles de
preservación; no basta borrar las aserciones que fallen.

El fixture body-build expone parseKg y monta las pantallas originales; cualquier
adaptación necesaria debe evaluarse como enmienda en el plan, no suponerse
autorizada. Además, verifyClockPins de 009 exige el sourceHash histórico porque
009 no modificó src. Una futura entrega de producto deberá proponer cómo
conservar esa prueba histórica y verificar el candidato nuevo sin relajar
firmas ni aceptar cualquier hash. No se cambió ninguno de esos archivos.

## Decisiones de producto propuestas

La [spec](../../specs/010-entradas-cuerpo/spec.md) define C-001/002/003:
decimal explícito con coma/punto y espacios exteriores; positivos frente a cero
conocido; rechazo completo con feedback accesible y sin limpieza histórica.
Los valores `1,000` se tratarían como decimal y los exponentes dejarían de
aceptarse; estas decisiones requieren aprobación explícita. No se atribuye
validez clínica ni se añaden rangos médicos.

## Siguiente puerta

Aprobar alcance y C-001/002/003. Después preparar plan, tareas, validación,
research y análisis para revisión separada. No hay implementación ni entrega
remota autorizadas para 010.
