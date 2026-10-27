# Decisiones técnicas 008

Estado: R-001–012 aprobadas junto al plan el 2026-10-22; alcance en `462a344`.
R-013/014 registran ajustes técnicos de ejecución del 2026-10-24 dentro de ese
alcance, sin nuevos CHANGE ni una aprobación de producto adicional inferida.

R-015, revisión final: distinguir el booleano de fallo de su motivo rechazado.
Un rechazo puede ser undefined/null/false/0/cadena vacía; el guard no puede usar
la verdad del motivo para decidir si existe recuperación. T038 reproduce rojo
en candidato E2 y añade verde suplementario sin alterar los ocho pins E0.

| ID | Decisión propuesta | Motivo y límite |
| --- | --- | --- |
| R-001 | Mantener deleteUserData como motor inyectado y añadir coordinador de intento | Una sola secuencia; evita duplicar lógica o acoplarla a React; preserva consumidores estables |
| R-002 | Capturar UID + generación de sesión + ID de intento | UID solo no distingue A→B→A; el finally anterior no puede limpiar el siguiente |
| R-003 | Actualizar actor en el callback de auth, antes de efectos de React | Cierra el intervalo entre cambio de cuenta y render; refrescar token del mismo usuario no invalida |
| R-004 | Bloqueo síncrono antes del primer await, sin recuperación automática en catch | Protege duplicados, visibilidad y hooks, y evita los doce guardados reproducidos |
| R-005 | Estado del intento en App mediante snapshot estable y useSyncExternalStore | Sobrevive a Settings, limpia suscripción y no mezcla raíces/previews |
| R-006 | Recovery lista + confirmación posterior al commit | Resolver una lectura no demuestra que React haya aplicado todos los valores; resume solo después de esa barrera |
| R-007 | Despacho y confirmación de DELETE son estados distintos | Un error de red no demuestra que el servidor no actuó; aplica C-001 conservadora |
| R-008 | Cierre manual posterior no vuelve a ejecutar borrado | Evita repetir efectos; no amplía el cierre de sesión normal ni promete cancelación |
| R-009 | Conservar prompt, props y anclas de Settings/App | nutrition-build instrumenta removeAllData; build-harness captura deleteAllData; previews usan noops |
| R-010 | Resolver PIN-008-001 por composición central, no editando cinco validadores | Los cinco ya usan el helper 007; un módulo independiente evita ciclos y conserva hashes originales |
| R-011 | Harnesses 008 nuevos y callbacks de los dobles existentes | DELETE sintético debe borrar filas cuando se mide reescritura; no cambiar fake-supabase congelado |
| R-012 | Reutilizar loader con cancelación lógica por actor e intento | Conserva migraciones/hidratación; no habrá segunda interpretación de copias ni rollback ficticio |
| R-013 | Mutar conjuntamente las barreras de entrada visible y carga ordinaria | Quitar solo una conserva la otra y puede ser equivalente; se prueba el bypass coherente del camino completo mediante lecturas/guardados, no un detalle textual aislado |
| R-014 | Validar las firmas efectivas 008 con el resolutor de la adenda 008 | Las 108 firmas archivadas ya incluyen 006/007; no reaplicar su cadena sobre hashes que ya son posteriores |

## Carrera de carga y commit

No se libera el bloqueo en un finally genérico ni al resolver fetch. La carga
fresca aplica setters con guardas de vigencia; el adaptador confirma su commit
con un identificador aún válido. Los hooks siguen deshabilitados hasta entonces.
Los tests deben observar valores en el primer guardado permitido y bloquear el
commit de recuperación, no inferir seguridad únicamente de loaded o de un texto.

La carga ordinaria ya iniciada antes de borrar también usa una guarda dinámica:
si termina con el intento bloqueado o actor obsoleto, no publica setters.
El callback de visibilidad y el intervalo conservan el refresco de fotos normal
cuando no hay bloqueo. No se altera el algoritmo de la cola ni los defaults.

## API, imports y harnesses

deleteUserData conserva nombre y forma de dependencias; los callbacks internos
de vigencia/fase los proporciona el coordinador productivo. El grafo es
App → hook/coordinador → motor, sin motor → coordinador. El límite histórico
data-architecture no requiere importar módulos React ni ampliar su allowlist.

Conservar removeAllData y la captura antes de Misma lectura que usa Ajustes.
No añadir props obligatorias a AccountScreen o Settings que rompan sus montajes
aislados. El fallback local de Settings no será el registro autoritativo de App
y no expondrá errores técnicos. Las raíces StrictMode deben soportar cleanup y
reattachment, sin convertir el primer cleanup de desarrollo en cierre permanente.

## Evidencia antes de APIs nuevas

Los trece CHANGE iniciales ejercitan App y la firma existente del motor. Una
comprobación de fase puede aportar un callback que el original ignore y fallar
por resultado incorrecto; no por llamar a un constructor aún inexistente.
Un botón nuevo ausente debe producir una aserción FR clara antes de hacer clic.
Las pruebas del nuevo coordinador son suplementos posteriores, no sustituyen
los rojos E0. Retorno error/rechazo y 390/1280 se ejecutarán como subcasos
independientes para no esconder el segundo caso tras la primera aserción fallida.

E0 congela el bootstrap 008 con reloj detenido antes de montar App. No repara el
helper 006 ni cambia sus tiempos como parte de este plan. Si TEST-001 vuelve a
bloquear un checkpoint, registrar el fallo; no aceptarlo como rojo de negocio.

## Enmienda de firmas

Solo test/data-delete.test.js tiene contradicción de comportamiento identificada.
Se conservará su original, hash efectivo, prueba BASE y diff por FR. El helper
007 puede delegar al resolutor 008 independiente, manteniendo sus propios cinco
registros y los dos 006; archivos desconocidos no quedan autorizados por defecto.
Se probará rechazo de hash falso y enmienda inválida. Un cambio extra exige tarea
de converge; la previsión de 107/108 intactos no es una licencia para más cambios.
