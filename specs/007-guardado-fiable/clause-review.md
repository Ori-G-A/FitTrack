# Revisión de aserciones 007

Revisión del agente sobre las pruebas y el diff; no es una revisión independiente.
Los resultados de ejecución y firmas pertenecen a [verificación](verification.md).
Esta lectura complementa la matriz de nombres y no certifica por sí sola un contrato.

| Cláusulas | Qué comprueba la aserción |
| --- | --- |
| FR-001; US3-AS1 | Cola serial del mismo par, concurrencia de pares distintos y referencia del valor entregado a persistencia |
| FR-002; US3-AS2 | Límite de 600 ms con reloj controlado, sustitución del valor y limpieza al desmontar |
| FR-003 | La promesa de saveKey conserva resolución ante error de persistencia, con notificación de fallo |
| FR-004; US3-AS3 | Usuario ausente no persiste; suspensión impide guardados nuevos; la espera conserva el conjunto capturado |
| FR-005; US1-AS1/AS4 | Fallo A visible con B pendiente; comenzar C no borra A; resolver B/C en ambos órdenes no anuncia éxito; un segundo fallo actualiza A |
| FR-006; US1-AS2/AS3 | Recuperar A no borra el fallo B; recuperar después B produce saved y error null; snapshot estable e inmutable |
| FR-007; US2-AS1/AS2 | Suscripción B no recibe inicio ni fallo tardío A; el primer DOM de B se observa en layout antes del efecto, y volver a A conserva su error |
| FR-008; US2-AS3 | Remontar sin nueva escritura muestra el fallo previo; una escritura en el intervalo de montaje no pierde estado; desmontado no cambia el DOM |
| FR-009; US4-AS1/AS2 | Error visible con bounding box dentro de 390/1280 y sin recorte; región status única sin Toast, error tras éxito ajeno, ft-focus oculta/restaura y recuperación propia anuncia Guardado |

La prueba suplementaria de layout se añadió durante la revisión después de
implementar. Su rojo sobre BASE no se presenta como evidencia anterior a E0.
Los seis archivos fijados en E0 conservan sus hashes originales.

## Compatibilidad de contratos anteriores

- 001 FR-004/006: la adenda limita la evolución a agregación y aislamiento del
  estado; cola, debounce, resolución de promesa y suspensión mantienen pruebas.
- 006 FR-012: la adenda permite la región nueva y lectura al montar. Los siete
  anchos y recorridos anteriores conservan sus aserciones de geometría y foco.
- PIN-007-001 cambia la expectativa contradictoria de pérdida del error.
  PIN-007-003/005 adaptan verificadores, sin cambiar baselines históricas.
- PIN-007-002 sustituye dos negativas de región en el caso de guardado por
  comprobaciones de role, texto y unicidad. No cambia las negativas de Toast.
- PIN-007-006 acota tres selectores al Toast manteniendo su role, textos,
  tiempos y desaparición. No elimina la segunda región para satisfacer la prueba.

Hay cuatro archivos anteriores enmendados y cinco registros explícitos, porque
interface-cases encadena dos enmiendas. 97 de los 101 archivos anteriores
permanecen intactos; las dos enmiendas 006 previas siguen verificándose.

## Límites de la conclusión

ARIA y Chromium no prueban la experiencia de todos los lectores de pantalla.
El estado solo dura en memoria dentro de esta ejecución, sin caché durable ni
sincronización de errores entre dispositivos. Las pruebas usan fallos sintéticos;
RLS local real prueba aislamiento en el entorno desechable, sin certificar el
backend de producción. DATA-004/005 y borrado parcial quedan fuera de 007.
