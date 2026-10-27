# Spec 009 — preparación determinista del reloj de pruebas

Estado: alcance y C-001/002/003 APROBADOS el 2026-10-27; plan pendiente. Propietario: usuario del proyecto.
Fecha: 2026-10-27 (Bogotá). Gobierno:
[constitución 1.0.3](../../.specify/memory/constitution.md).
[Survey](../../docs/sdd/reloj-pruebas-survey.md), [diagnóstico](evidence/survey.json).
BASE de producto: `1f6b29d`; cierre documental previo: `6d9aa20`.

## Resultado de usuario e intención

Como responsable de FitTrack, poder confiar en que las pruebas de interacción
fallen por un comportamiento incorrecto y no por intentar detener el reloj en
el pasado durante la preparación. Mantener las fechas, los escenarios y las
fronteras temporales ya aprobadas en 006–008.

## Alcance y restricciones

Solo la preparación de reloj de interfaz, guardado y borrado que usa el par
`install(T)` seguido de `pauseAt(T)`, sus pruebas y la evidencia contractual.
Son tres archivos congelados; cualquier enmienda exige propuesta explícita en
el plan, firmas antes/después y caracterización sobre el original. No se aprueba
un diseño concreto ni se permite editar los archivos con esta propuesta.

## Historias y escenarios

### US1 — preparar la prueba sin carreras del host (P1)

- US1-AS1: Dado un contexto nuevo sin demora impuesta, al preparar cualquiera de los tres fixtures, se conservarán su fecha, datos y aislamiento sintético originales.
- US1-AS2: Dada una demora finita de 250 o 1500 ms entre operaciones de preparación, al montar cualquiera de los tres fixtures, no se intentará pausar en el pasado y la aplicación empezará con el reloj detenido en su fecha original.
- US1-AS3: Dado un fallo real de preparación, al iniciar un caso, este fallará antes de presentar el montaje como listo, sin capturar el fallo para producir un aprobado.

### US2 — conservar los tiempos del comportamiento (P1)

- US2-AS1: Dado el resaltado solicitado desde App, al avanzar 2199 ms y después 1 ms desde la petición, se conservarán las aserciones de permanencia y retirada de 006 FR-024, incluido reemplazo y limpieza al salir.
- US2-AS2: Dado un Toast reemplazado, al ejecutar los avances originales de 2000/600/2000 ms, se conservarán los textos, presencia y desaparición comprobados en el caso original.
- US2-AS3: Dados los casos de guardado y borrado, al avanzar el tiempo virtual previsto y realizar sus acciones, se conservarán las doce escrituras iniciales de 007 y las aserciones de error, bloqueo y recuperación de 007/008.

### US3 — demostrar la reparación sin debilitar pruebas (P1)

- US3-AS1: Dado el código original, al imponer la demora, la nueva regresión fallará específicamente por la preparación del reloj antes de inyectar la aplicación; con la reparación deberá pasar en los tres fixtures.
- US3-AS2: Dado el candidato reparado, al reintroducir de forma aislada el patrón original, la regresión volverá a detectar el defecto y el control positivo pasará, con limpieza confirmada.
- US3-AS3: Dados los contratos y firmas anteriores, al cerrar la entrega, se mantendrán los nombres, aserciones y tiempos de negocio; solo cambiarán las firmas enumeradas y justificadas por el plan aprobado.

## Requisitos EARS

- FR-001 [AS-IS] Cuando se prepare un contexto sintético nuevo, el fixture deberá conservar su fecha propia (interfaz 2026-10-18, guardado 2026-10-21, borrado 2026-10-24), datos y punto de entrada actuales.
- FR-002 [AS-IS] Mientras se ejecuten estos casos, las solicitudes externas deberán permanecer bloqueadas y el acceso a Supabase deberá utilizar el doble existente, sin credenciales reales.
- FR-003 [AS-IS] Cuando las pruebas avancen el tiempo virtual desde una acción de usuario, deberán conservar los plazos, textos, efectos y límites temporales de sus aserciones originales de 006–008.
- FR-004 [CHANGE] Cuando transcurra tiempo del host durante la preparación de cualquiera de los tres fixtures, el montaje deberá completar la preparación temporal sin pedir un retroceso del reloj y conservar el instante inicial propio del fixture. La aceptación cubrirá demoras impuestas de 0, 250 y 1500 ms; no promete disponibilidad ante un host detenido indefinidamente.
- FR-005 [CHANGE] Mientras no se solicite un avance explícito del reloj virtual, el tiempo simulado deberá permanecer detenido desde antes de inyectar el código de la aplicación; una demora del host no deberá consumir el plazo de un efecto de producto ni dispararlo anticipadamente.
- FR-006 [CHANGE] Si falla la preparación o el montaje, el caso deberá finalizar como fallido e identificar la etapa en su evidencia; no deberá producir un resultado aprobado mediante captura del error, omisión, retries nuevos o ampliación de esperas.
- FR-007 [CHANGE] Cuando se declare cerrada la reparación, la evidencia deberá incluir rojo específico sobre el original, verde sobre el candidato y reintroducción negativa del patrón original; deberá vincular cada firma enmendada a esta spec y conservar los oráculos de negocio anteriores.

## Evidencia AS-IS y límites

| FR | Código | Caracterización requerida y límite actual |
| --- | --- | --- |
| FR-001 | `test-support/interface-browser.js:3–11`, `change-tests/save-state.spec.js:4–6`, `test-support/delete-state-browser.js:4–7` | PENDING sobre original con runtime fijado; el sondeo actual no inyecta la aplicación |
| FR-002 | Los tres montajes y `test-support/interface-build.js:8`, `test-support/build-harness.js` | PENDING comprobar red/doble en la baseline; no se certifica backend real |
| FR-003 | `change-tests/interface-highlight.spec.js:11–22`, `browser-tests/interface.spec.js:46–47`, `change-tests/save-state.spec.js:6`, `change-tests/delete-state.spec.js` | PENDING repetir casos originales; la evidencia 008 conserva el contrato previo, no sustituye la nueva baseline |

El sondeo conserva el hash `e4e98de0fa1bced3a4372dab58e63172257ed8003eafad8febe306260312b377`
y las tres firmas archivadas. Reproduce un riesgo con demora sintética; no
estima su frecuencia natural, no prueba que la otra espera agotada de 007 tenga
la misma causa y no cuenta como rojo contractual de E0.

## Criterios medibles

- SC-001: tres AS-IS caracterizados en el original y cuatro CHANGE con regresiones rojas específicas antes de cambiar los fixtures; sin usar el diagnóstico como G-PIN.
- SC-002: los tres montajes pasan con demoras de 0/250/1500 ms y el reloj detenido antes del código de aplicación; demoras posteriores del host no consumen los plazos de producto.
- SC-003: se mantienen las aserciones temporales y de efectos originales, cero retries añadidos, cero skips y cero ampliaciones de timeout para ocultar esta carrera.
- SC-004: dieciséis IDs propios completos y los 234 anteriores conservados; el cierre deberá mantener las puertas existentes, incluida evidencia RLS local desechable cuando corresponda al checkpoint. El plan concretará los comandos.
- SC-005: la reintroducción negativa se detecta por el motivo esperado, el control positivo pasa y se confirma la limpieza; src, SQL y dependencias permanecen idénticos al original.

## Fuera de alcance

- Cambios de producto, fechas reales, algoritmos clínicos, datos, fotos o autenticación.
- Rediseñar otros relojes, actualizar Playwright/Chromium o optimizar CI/bundle.
- Declarar eliminada toda inestabilidad, ocultar fallos mediante repeticiones o atribuir causa a la espera de montaje no diagnosticada.
- Enmendar una prueba congelada, implementar o preparar un plan como si estuviera aprobado por esta propuesta.
- Publicar ramas/PRs, integrar, desplegar o probar una sesión autenticada productiva.

## Aclaraciones aprobadas — 2026-10-27

- C-001 [APROBADA]: limitar la corrección a los tres montajes con carrera reproducida; preservar sus fechas y los plazos de producto, sin extender cambios a otros relojes. Decisión aprobada por el propietario.
- C-002 [APROBADA]: permitir proponer en el plan las enmiendas técnicas estrictamente necesarias de los tres archivos y verificadores de firmas afectados; conservar nombres, aserciones y tiempos. Esta decisión no autoriza aplicarlas todavía. Decisión aprobada por el propietario.
- C-003 [APROBADA]: usar TEST-002 para esta carrera, conservando TEST-001 para la cobertura estática histórica y las referencias antiguas con una nota de equivalencia. Decisión aprobada por el propietario; no reescribir evidencia histórica ni declarar resuelto el defecto antes de verificarlo.

## Trazabilidad y aprobación

[Manifiesto](traceability.json): siete requisitos y nueve escenarios, dieciséis
filas individuales pending. Los nombres, archivos y tareas de pruebas se
decidirán en el plan después de aprobar el alcance. [Checklist](checklist.md).

El propietario respondió «Aprobar alcance y las tres aclaraciones» el
2026-10-27 (Bogotá). Aprueba tres AS-IS, cuatro CHANGE, nueve escenarios y
C-001/002/003. Autoriza preparar plan/tareas/análisis para aprobación separada;
no implementar, publicar, fusionar ni desplegar 009.
