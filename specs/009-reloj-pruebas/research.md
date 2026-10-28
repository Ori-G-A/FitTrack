# Decisiones técnicas propuestas — 009

Estado: plan pendiente; investigación autorizada por el alcance. Ninguna
decisión se ha aplicado a los fixtures congelados.

| ID | Decisión y motivo | Alternativas y límites |
| --- | --- | --- |
| R-001 | Helper único con install/setFixedTime/pauseAt/setSystemTime, antes de App | Instalar y pausar en el mismo instante reproduce la carrera; un margen fijo de tiempo solo desplaza el riesgo |
| R-002 | Fijar Date durante la pausa y restaurar avance normal estando ya detenido | setFixedTime solo no detiene temporizadores; dejarlo como estado final impediría que Date avanzase con runFor |
| R-003 | Instrumentar las APIs públicas y addScriptTag desde el caso nuevo | No tocar internals ni reimplementar las funciones reales; guardar etapa/error original y distinguir control esperado de montaje aprobado |
| R-004 | Mantener función local de guardado sin exportarla | El fixture 009 extrae su cuerpo real con anclas únicas y enlaza expect/bundle/helper explícitamente; cualquier deriva de anclas falla de forma visible |
| R-005 | Un BrowserContext nuevo por combinación de fixture/demora | Clock controla el contexto completo; páginas distintas de un contexto no constituyen aislamiento temporal independiente |
| R-006 | Tres enmiendas y composición estricta tras 006/007/008 | No reescribir firmas originales; no aceptar after arbitrario ni volver a aplicar enmiendas sobre firmas ya transformadas |
| R-007 | Huella de verificación además de sourceHash | src no cambia: usar solo su hash permitiría confundir reportes anteriores con pruebas del nuevo instrumental |
| R-008 | Precisar SC-001 antes de E0 | FR-006 contiene propagación ya existente y FR-007 es evidencia de ciclo completo; no fabricar rojos por reportes/API ausentes |
| R-009 | Conservar contador legado con significado actual y prueba estricta | Ajustar el conteo de integridad 008 a sus tres cambios anteriores y uno nuevo; no devolver cifras antiguas como si las firmas siguieran intactas |
| R-010 | Ejecutar RLS nuevo en E2, aunque políticas y producto no cambien | Mantener las puertas de los nueve contratos y cleanup; sin acceso productivo ni certificación de sus políticas |

## Comprobación de viabilidad, no implementación

[Código del spike](evidence/api-spike.mjs) y [resultado](evidence/api-spike.json):
Node 24.21.0/Playwright 1.64.0/Chromium 156.0.8078.4. En una página vacía,
demoras del host de 0/250/1500 ms entre las cuatro operaciones conservan la fecha
exacta. Un timeout sintético de 10 ms no se dispara por la espera del host;
runFor(9) no lo dispara y runFor(1) posterior sí, avanzando Date diez ms.
Las tres firmas y src permanecen idénticos. Esto no verifica aún los montajes
ni reemplaza las pruebas de producto, el G-PIN o la reintroducción negativa.

La referencia pública distingue fijar Date de detener temporizadores y permite
cambiar el reloj de sistema sin dispararlos. También documenta el alcance por
BrowserContext. [API oficial Clock](https://playwright.dev/docs/api/class-clock).
La guía muestra instalación, pausa y avances manuales como operaciones
separadas. [Guía oficial](https://playwright.dev/docs/clock).
La inspección local de Playwright 1.64.0 confirma sus métodos públicos en
`node_modules/.pnpm/playwright-core@1.64.0/node_modules/playwright-core/lib/coreBundle.js:13114`.
Ese archivo de dependencia no se modifica ni se importa desde los fixtures.

## Enmiendas sin cambiar oráculos

El resolutor validará el diff canónico contra los originales archivados:
solamente importar el helper y sustituir el par original por su llamada con la
misma fecha. Prefijo/sufijo, datos, nombres y aserciones deben seguir idénticos
tras normalizar CRLF. Calcular el after desde ese parche permitido y exigir que
coincida con el archivo actual; un booleano que diga «aserciones intactas» no
es prueba suficiente. Las negativas deben alterar también una aserción externa
al parche y demostrar rechazo aunque se presente un after recalculado.

Las baselines existentes y PIN-006-001 se conservan. Los tres originales se
archivan antes de E1; los ayudantes nuevos de validación quedan congelados en
E0 para impedir adaptarlos silenciosamente al candidato.
