# Decisiones técnicas propuestas — 010

Estado: preparación de plan, sin implementación autorizada. [Plan](plan.md).

| Decisión | Motivo y alternativas |
| --- | --- |
| Parser decimal explícito y validadores puros | Number solo acepta formatos no deseados y produce NaN; truthiness confunde cero/ausencia. Resultado discriminado con errores por campo evita usar NaN como control. No incorporar librería numérica ni reglas clínicas |
| Entradas que admitan texto decimal | type=number filtra coma antes de que React pueda validarla. inputMode conserva teclado sugerido, con labels/errores explícitos; no prometer precisión decimal arbitraria |
| Separar número hidratado y texto escrito | Un Number finito grande puede representarse en notación exponencial sin que el usuario haya escrito un exponente. Validar el tipo numérico directamente evita rechazar datos válidos por su representación |
| Validación antes de setters y builders | Asegura rechazo completo y evita sustituir registros previos. Las funciones de reemplazo permanecen sin efectos; no añadir validación global a importación o persistencia |
| No exigir enteros/máximos | C-002 aprobó fracciones sin rangos nuevos; solo signo/cero/finitud. No añadir por intuición límites de sueño o pulso |
| Fixture nuevo con BodyScreen real | Permite observar intentos de escritura y borrador desde DOM sin depender de callbacks privados ni modificar las pruebas congeladas para montar el CHANGE |
| Cinco rojos y un control adicional | Seis CHANGE no significan seis defectos independientes. Sintaxis y rango comparten recorrido; vacío/cero/precisión tienen garantías que ya pasan y deben conservarse |
| Resolver 010 independiente y parches canónicos | Los resolutores legados entran en varias cohortes. Dependencia unidireccional impide ciclos; before efectivo y after calculado impiden aceptar un hash arbitrario |
| Transición explícita de fuente 009→010 | La igualdad a src original en 009 protegía una entrega sin cambios de producto. Conservar su prueba histórica y permitir solo dos modificaciones/un módulo nuevo mediante evidencia evita borrarla o dejarla bloqueando todo cambio futuro |
| API pura probada en E1, comportamiento fijado en E0 | Importar un módulo aún inexistente no demuestra el defecto de entrada. Primero fijar rojos sobre los formularios originales; después añadir las pruebas unitarias y transitivas del módulo real |
| Informe final y backlog separado | 001–006 y 007–009 ya están integradas. 010 se propone como última entrega actual; los hallazgos fuera de alcance siguen registrados, sin iniciar otro ciclo por inferencia |

No se investigó documentación externa ni se cambió una dependencia para este
plan. Las decisiones se basan en el código, sus llamadores, pruebas actuales,
sondeo del alcance y reglas C-001/002/003 aprobadas. La ejecución E0/E1 deberá
confirmar su viabilidad sobre Chromium; este documento no certifica el diseño.

## Aprobación de planificación — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2». Aprueba plan, 31 tareas y análisis,
y autoriza E0–E2 local antes de integrar el PR documental con snapshot aprobado.
Las esperas de decisión local anteriores son históricas. No autoriza publicar,
fusionar ni desplegar 010.
