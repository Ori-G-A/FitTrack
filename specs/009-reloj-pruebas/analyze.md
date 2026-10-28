# Revisión cruzada propuesta — 009

Estado vigente — 2026-10-27 (Bogotá): 009 integrada mediante #20/#21,
con CI de main y Vercel Production verificados en `392e797`.
[Entrega remota](evidence/integration.json). Los apartados siguientes conservan
la cronología de preparación local y sus autorizaciones ya cumplidas.


Estado vigente — 2026-10-27 (Bogotá): E0–E2 cerradas localmente;
27 tareas, nueve contratos/250 IDs y RLS fresco con limpieza verificados.
[Converge](converge.md). Las etapas siguientes conservan la cronología.
Publicación, integración y Vercel 009 pendientes de autorización específica.


Estado: preparación documental, pendiente de aprobación. Alcance `ed35fb2`.
[Plan](plan.md), [tareas](tasks.md), [validación](validation-plan.md).

| Área | Revisión y tratamiento |
| --- | --- |
| Alcance | Tres montajes con reproducción; otros relojes y producto fuera del cambio |
| Trazabilidad | Dieciséis filas pending, nombres previstos y tareas; sin resultados ejecutados inventados |
| Viabilidad | Cuatro APIs públicas comprobadas en página vacía con 0/250/1500 ms; no se atribuye ese verde a App |
| Producto y efectos | src, fechas, datos, aserciones temporales y servicios sintéticos conservados |
| Firmas | Tres enmiendas explícitas, originales archivados, diff canónico y orden 006→007→008→009; ninguna baseline reescrita |
| Verificadores | Cambios acotados a componer resolutores y describir recuentos reales; contador y negativos siguen exigiéndose |
| Evidencia | Dos huellas: producto y conjunto verificable; recibos nuevos impiden reciclar reportes de src idéntico |
| Aislamiento | Contexto nuevo por combinación; Clock afecta el contexto completo, copias de mutación con nonce y sin credenciales |
| Cierre | Nueve contratos/250 IDs, 35 Chromium previstos, catorce mutaciones totales, RLS fresco y limpieza |
| Autorización | Alcance sí; plan, precisión SC-001 e implementación local no; publicación/integración/Vercel excluidos |

## Hallazgo bloqueante de autorización — A-009-001

La formulación actual de SC-001 pide cuatro CHANGE rojos, pero parte de FR-006
ya se preserva en el original y FR-007 es evidencia que abarca etapas distintas.
Se propone [precisión explícita](precision-sc-001.md), que conserva el rojo de
la carrera FR-004/005 y verifica propagación/etapas y evidencia sin inventar
defectos previos. El propietario debe aceptar esa precisión junto con el plan.
Hasta entonces no comienza E0 ni se modifica una firma congelada.

## Riesgos que se deben resolver mediante ejecución

- La página vacía no verifica los montajes: E0/E1 deben ejecutar App y sus casos reales.
- El orden de resolutores puede reaplicar enmiendas: firmas efectivas y negativos deben rechazarlo.
- Los reportes de mutación antiguos solo llevan sourceHash: recibos de ejecución nueva deben contener huella de verificación estable, sin metadatos retrospectivos.
- El arranque local de Docker ha sido intermitente: E2 no admite cerrar RLS sin ejecución fresca y cleanup; el resto de tareas puede avanzar independientemente.
- La espera de montaje no diagnosticada de 007 y el DNS de producción no quedan resueltos por reparar esta carrera.

No se identifican otras contradicciones documentales que justifiquen ampliar
el alcance. La revisión no acredita conformidad de código aún inexistente,
ejecución de pruebas contractuales ni cierre de TEST-002.

## Resolución de A-009-001 — 2026-10-27

El propietario aprobó el plan, tareas, análisis y precisión de SC-001, y autorizó E0–E2 local antes del documental. La barrera de autorización queda resuelta; las limitaciones de ejecución y entrega remota siguen vigentes.
