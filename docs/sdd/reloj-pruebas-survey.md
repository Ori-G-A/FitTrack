# Survey — reloj determinista de pruebas

Fecha: 2026-10-27 (Bogotá). BASE de producto: `1f6b29d`.
Rama de preparación: `codex/009-reloj-pruebas`, desde el cierre documental
008 `6d9aa20`. No cambia producto, dependencias ni fixtures congelados.

## Resultado y prioridad

Evitar que una demora del host interrumpa una verificación correcta antes de
montar React. El tercer checkpoint E2 de 007 registró el fallo de preparación
`Cannot fast-forward to the past`, además de otra espera de montaje agotada.
La segunda espera no tiene causa demostrada y no se atribuye a este defecto.
[Registro histórico](../../specs/007-guardado-fiable/evidence/e2-failures.json).

La preparación instala un reloj que corre y después pide detenerlo en el mismo
instante inicial. Una pausa del host entre esas operaciones puede dejar ese
instante atrás. La documentación distingue instalación, pausa y avance manual;
no promete que dos llamadas separadas sean atómicas.
[Referencia primaria de Playwright](https://playwright.dev/docs/clock).

## Inventario de frontera

| Preparación | Código original | Consumidores y alcance |
| --- | --- | --- |
| Interfaz | `test-support/interface-browser.js:8–10` | Siete recorridos de interfaz, cinco casos de accesibilidad y dos de resaltado mediante `mountUi`; conservar llamadas, fechas y oráculos |
| Guardado | `change-tests/save-state.spec.js:5` | Dos casos de 007; función local `mount`, seguida de avance de 600 ms y doce escrituras iniciales |
| Borrado | `test-support/delete-state-browser.js:6` | Caso de 008 con móvil/escritorio; mismo patrón de instalación y pausa |
| Otros relojes | `browser-tests/{training-journeys,nutrition,body}.spec.js` | Instalan el reloj sin el par inmediato que reproduce esta carrera; fuera de la corrección propuesta |

El inventario suma 17 casos consumidores del patrón; no son 17 fallos naturales
observados. La implementación de producto no llama a estas preparaciones.
Los tres archivos están fijados por contratos anteriores; el plan deberá
identificar sus enmiendas y los verificadores afectados antes de cambiarlos.

## Reproducción actual

Comando: `pnpm exec node specs/009-reloj-pruebas/evidence/survey-probe.mjs`.
Node 24.21.0, Playwright 1.64.0, Chromium 156.0.8078.4.
[Sondeo reproducible](../../specs/009-reloj-pruebas/evidence/survey-probe.mjs),
[resultado](../../specs/009-reloj-pruebas/evidence/survey.json).

Se añade en memoria una demora real de 250 ms al retorno de `clock.install`.
Se invocan los dos helpers originales y el cuerpo original de la función local
de guardado, extraído sin cambiarlo. Los tres rechazan con el error esperado,
antes de cualquier `addScriptTag`. La red está bloqueada y no se accede al SDK
real ni a datos reales. Las firmas de los tres archivos y el hash de producto
permanecen iguales antes/después.

Un control de API sin aplicación pausa en un instante futuro y comprueba que
250 ms del host no avanzan el reloj detenido, mientras `runFor(1)` sí lo hace.
Este control valida el instrumental; no implementa una solución en los fixtures
ni demuestra cuál será el diseño correcto. La demora impuesta no mide frecuencia
natural ni acredita G-PIN, cobertura contractual o una solución ya verificada.

## Seguimiento y límites

El roadmap reutiliza TEST-001 para cobertura estática histórica y para esta
carrera de reloj. Se propone TEST-002 para la carrera, conservando las referencias
históricas con una nota de equivalencia; TEST-001 mantiene su significado original.
La decisión forma parte de C-003 de 009, aprobada el 2026-10-27.

Se propone preservar exactamente plazos y resultados del resaltado, Toast,
guardado y borrado. Sin retries adicionales, waits ampliados para ocultar el fallo,
saltos arbitrarios después de montar la aplicación, cambios clínicos, SQL,
dependencias, rendimiento o escrituras de producción. El fallo de DNS de la URL
técnica de Vercel se volvió a observar; sigue separado del despliegue confirmado.

Siguiente puerta: [alcance 009](../../specs/009-reloj-pruebas/spec.md).
El alcance y C-001/002/003 se aprobaron el 2026-10-27. Plan, implementación y
entrega remota de 009 requieren sus decisiones posteriores.
