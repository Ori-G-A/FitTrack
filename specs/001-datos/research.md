# Decisiones técnicas — 001-datos

Fecha: 2026-10-14. Propuestas técnicas del [plan](plan.md); no son nuevos
requisitos de producto ni evidencia de pruebas ejecutadas.
Actualización de preparación verificada: 2026-10-15; resultados en readiness.

## R1. Conservar una fachada y extraer coordinación

`src/data-sync.js` ya tiene llamadores en FitTrack y AuthUI; Train también se
importa en preview (survey, inventario). Se propone conservar sus exports como
fachada y extraer la cola/bus a una fábrica sin React ni cliente global.
Cada instancia de prueba será independiente; la fachada productiva conservará
una instancia global, incluido su bus actual. No se creará un store global nuevo.

Alternativa descartada: reescribir manejo de estado o introducir una biblioteca
de sincronización. Cambiaría demasiadas garantías para una refactorización AS-IS.

## R2. Probar el código original, sin extraerlo primero

Las pruebas de App deben ejecutar React y sus efectos sobre DOM simulado;
no basta leer texto ni copiar funciones en tests. Se propone jsdom con ReactDOM
ya usado por la app, y esbuild para compilar JSX en el harness de pruebas.
Solo se reemplaza el módulo cliente Supabase y las fronteras de navegador
necesarias; no se reemplazan las funciones de coordinación que se van a mover.

La preparación autorizada añadió jsdom 30.1.2 y esbuild 0.25.12 como dependencias
directas de desarrollo, y Playwright para recorridos reales de navegador.
Las versiones se fijan en package.json/lockfile. Node se fija a 24.21.0 y pnpm
a 11.11.0; el informe readiness contiene las ejecuciones, no este rationale.

La documentación primaria de [jsdom](https://github.com/jsdom/jsdom) describe
su DOM para Node y sus límites frente a navegador real; la API de
[esbuild](https://esbuild.github.io/api/#plugins) permite reemplazar la resolución
de un módulo para el bundle de pruebas. La propuesta no modifica Vite productivo.

Antes de comprometer el harness, verificar que monta App original, ejecuta
efectos reales y captura peticiones con fixtures. Si no lo consigue, bloquear
el pin y revisar el plan; nunca mover producción para que el test arranque.

Actualización: el piloto ejecuta App original en jsdom; los recorridos Chromium
usan el mismo bundle con sustitución del cliente. No se extrajeron funciones
productivas para hacer posible la prueba.

## R3. Sin backend real y sin variables del usuario

El harness sustituirá `src/supabase.js` por un doble con auth, consultas y
Storage controlados; impedirá resolver ese módulo real en el grafo de pruebas.
Un guard bloqueará fetch y otras salidas de red no simuladas. Las pruebas no
leerán `.env.local`. Suprimir globales, cerrar DOM, desmontar React y restaurar
relojes/dobles en finally evita contaminación con `--test-isolation=none`.

Los dobles conservan el comportamiento de respuestas `{data,error}` y rechazo
de promesas. No prueban RLS real; eso sigue en AUTO-003/área 002.

## R4. Mantener oráculo y puntos de entrada entre ambas revisiones

Los pins iniciales usarán los exports actuales de data-sync/data-operations y
acciones observables de App. Tras la extracción seguirán usando esos mismos
puntos, fixtures y aserciones. Tests unitarios nuevos de módulos extraídos serán
evidencia adicional, no sustitutos de los pins sobre la revisión original.

Se registrará `git diff BASE -- src` vacío al ejecutar el primer checkpoint,
además de revisión, versiones, comandos, totales y salida. Las devDependencies
y tests pueden añadirse antes; `src/` no puede cambiar hasta el checkpoint verde.

## R5. Fronteras y temporización deterministas

Usar reloj controlado para 599/600 ms y 14999/15000 ms; promesas diferidas para
probar cola, concurrencia, limpieza y finalizaciones fuera de orden. Un timeout
local no debe ser interpretado por los tests como cancelación del doble remoto.
Suscriptores que lanzan y entradas fuera del dominio observado no se normalizan
en esta refactorización; hallazgos nuevos se documentarán antes de cambiar nada.

## R6. Separar casos de uso sin cambiar orden de efectos

La carga, backup y borrado recibirán dependencias explícitas y callbacks del
estado existente. Mantener orden de setters, cleanup de carga, confirmación,
mensajes, defaults y tratamiento de errores. No se impondrá un registro único
de claves si eso cambia el orden o la distinción entre export/import y timer.

La foto firmada se filtra mediante la función existente; Storage y app_data
conservan sus fronteras. El borrado filtrado se moverá al adaptador de datos
para retirar acceso directo desde App, sin alterar la secuencia externa.

## R7. Evidencia parcial explícita y negativos

El manifiesto de trazabilidad es dueño del estado de evidencia por ID. El
verificador cruza pruebas ejecutadas TAP/JSON con la spec y rechaza IDs ausentes,
duplicados, resultados omitidos/fallidos y referencias inexistentes.
`test:sdd:complete` exige estado complete en todas las filas; hoy debe fallar.
La revisión humana sigue evaluando suficiencia de aserciones.

Las mutaciones se aplican a bundles en memoria. No se cambian archivos src ni
se considera que una excepción de infraestructura equivale a detectar el defecto.

## R8. Pin del runtime y política de paquetes

Node 24.21.0 mediante devEngines.runtime mantiene el ejecutable de los scripts
alineado con CI; pnpm/action-setup usa packageManager del manifiesto.
La [documentación de pnpm](https://pnpm.io/settings/cli) explica gestión de
runtime y validación de engines. No se cambia el Node global del usuario.
Las excepciones de antigüedad que pnpm agregó para un Playwright recién publicado
se retiraron; la versión final elegida respeta la política existente.
