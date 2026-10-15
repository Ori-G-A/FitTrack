# Survey 001 — Datos

Fecha: 2026-10-14. Etapa: lectura y documentación, sin cambios productivos.
Base inspeccionada: `46697650f18043319a7c96ccdf93ebbdf29e2d75`.
Rama de trabajo: `codex/001-datos`. Constitución ratificada:
[referencia](../../.specify/memory/constitution.md).

## Resultado y fronteras

El usuario necesita recuperar sus registros, guardar sus cambios y gestionar
copias sin alterar silenciosamente su contenido. El área incluye app_data,
sincronización, carga, backup y coordinación de borrado. Las operaciones internas
de fotos siguen siendo responsabilidad de 002; sus efectos en 001 se caracterizan
mediante dobles. No se cambia nutrición, entrenamiento ni inferencias.

## Inventario de llamadores

Clasificación por alcance observado: principal, preview o compartido. Ninguno se
declara legacy congelado; preview también puede ejecutar código compartido.

| Llamador | Dependencia y efecto | Clasificación |
| --- | --- | --- |
| `src/main.jsx:3` | Monta App desde FitTrack | Principal |
| `src/FitTrack.jsx:15` | Importa API de sincronización | Compartido por importación de FitTrack |
| `src/FitTrack.jsx:706` | Carga 11 colecciones y goals | Principal, App |
| `src/FitTrack.jsx:767` | Sincroniza las mismas 12 claves | Principal, App |
| `src/FitTrack.jsx:783` | Suspende, espera cola, elimina fotos/datos, cierra sesión | Principal, App |
| `src/FitTrack.jsx:800` | Exporta snapshot de estado con fotos materializadas | Principal, App |
| `src/FitTrack.jsx:810` | Lee y valida backup y aplica colecciones incluidas | Principal, App |
| `src/FitTrack.jsx:1182` | Train carga timer por separado | Compartido principal/preview |
| `src/FitTrack.jsx:1199` | Train escribe timer al iniciar/pausar/reiniciar | Compartido principal/preview |
| `src/AuthUI.jsx:4` | SaveIndicator suscribe estado global | Principal; revisar montaje si cambia API |
| `src/AccountScreen.jsx:64` | Pasa acciones de datos a SettingsScreen | Compartido principal/preview |
| `src/SettingsScreen.jsx:46` | Ejecuta borrado recibido por props | Compartido principal/preview |
| `src/preview-main.jsx:15` | Importa Train y símbolos desde FitTrack | Preview, código compartido |
| `src/preview-main.jsx:224` | Acciones de cuenta sustituidas por funciones vacías | Preview |
| `preview/maqueta.jsx:10` | Importa Train desde FitTrack | Preview, código compartido |
| `test/supabase-contracts.test.js:5` | Importa operaciones con cliente inyectado | Pruebas |

Las funciones vacías de cuenta no prueban que todo preview sea inocuo: Train
conserva acceso a timer. No ejecutar previews contra credenciales reales como
parte de una prueba de datos.

## Comportamiento observado

1. `loadAppDataKey` lee value por usuario y clave; `null` o ausencia devuelve
   fallback; un error del cliente se lanza (`src/data-operations.js:5`). La
   escritura usa upsert con conflicto user_id,key (`src/data-operations.js:21`).
   Ambas peticiones compiten con timeout 15000 ms; el timeout no cancela la
   operación remota (`src/async-utils.js:10`).
2. `saveKey` serializa por usuario:clave; claves diferentes pueden ejecutarse
   concurrentemente. Conserva los valores recibidos por referencia, sin clonarlos.
   Sin usuario publica error y resuelve; un usuario suspendido no escribe ni
   emite evento (`src/data-sync.js:40`).
3. `persistKey` incrementa pending al comenzar el trabajo, publica saving,
   captura errores del backend y termina publicando saved/error al llegar
   pending a cero (`src/data-sync.js:25`). Pending cuenta escrituras en ejecución,
   no todas las tareas encoladas; puede haber un saved entre dos tareas seriales.
   La promesa de guardado resuelta no prueba éxito remoto.
4. El bus es global, no por usuario. Cada saving reinicia su error; un fallo
   intercalado con otro inicio puede ser sobrescrito (`src/data-sync.js:9`).
   Estas limitaciones se conservan en una refactorización estricta, salvo CHANGE.
5. `waitForUserSaves` hace allSettled de las colas capturadas al invocarlo;
   no es un monitor de trabajos futuros. Suspender bloquea nuevas entradas,
   sin cancelar lo ya encolado (`src/data-sync.js:64`).
6. El hook agenda un guardado a 600 ms, con cancelación del timer al limpiar
   el efecto. Requiere enabled y userId (`src/data-sync.js:56`).
7. App carga las 12 claves en paralelo; espera hidratación de fotos y transforma
   workouts y foods antes de habilitar loaded. Ignora resultados tras cleanup;
   un fallo de carga deja loaded falso y muestra estado de fallo
   (`src/FitTrack.jsx:695`). La hidratación captura fallos individuales y
   conserva la foto original (`src/photo-storage.js:57`).
8. Las URLs firmadas no se guardan en app_data (`src/photo-storage.js:47`,
   `src/FitTrack.jsx:777`). El timer se carga y guarda fuera de las 12 claves
   (`src/FitTrack.jsx:1179`).
9. El backup exporta las 12 claves desde estado React, sin esperar la cola;
   no incluye timer. Incluye fotos embebidas; si obtener alguna falla, no se
   descarga un backup parcial (`src/FitTrack.jsx:800`, `src/photo-storage.js:82`).
10. Importar rechaza archivos mayores de 50 MiB, valida antes de confirmar,
    aplica solo claves presentes y no cambia timer (`src/FitTrack.jsx:810`).
    `validateBackup` filtra claves conocidas y normaliza goals con defaults;
    valida estructura y fechas, pero no toda semántica numérica
    (`src/app-utils.js:257`). La aplicación de setters precede a la espera de
    fotos y no representa una transacción atómica.
11. Borrar requiere usuario, suspende y espera colas existentes, elimina fotos,
    elimina app_data del usuario y cierra sesión. Una excepción reanuda y marca
    loaded, sin restaurar fotos eliminadas (`src/FitTrack.jsx:783`). El resultado
    `{error}` de signOut no se inspecciona; no afirmar que todo fallo de cierre
    de sesión produce excepción. No existe rollback entre sistemas.

## Evidencia disponible y huecos

- `test/supabase-contracts.test.js`: cliente doble; valida filtros y payload del
  upsert en un caso de éxito. No prueba cola, suspensión ni servidor/RLS real.
- `test/app-utils.test.js:83`: validación de backup y defaults; no cubre flujo
  completo de FileReader, confirmación, estado o persistencia posterior.
- `test/async-utils.test.js`: éxito y timeout; no prueba cancelación remota.
- La línea base del survey general fue 124/124; todavía no es un pin completo
  de esta área. Esta sesión no reejecuta runtime por cambios solo documentales.

## Propuesta para refactorizar sin cambiar producto

Separar responsabilidades manteniendo las APIs externas y el comportamiento
documentado; el plan decidirá módulos. Caracterizar cola, carga y acciones antes
de mover código. No aprovechar la extracción para cambiar atomicidad, reintentos,
mensajes, defaults ni inferencias. Las limitaciones siguientes se registran para
clarify y requieren aprobación propia si se decide corregirlas.

## Aclaraciones recomendadas

- C-001: preservar guardado con promesa resuelta y errores por bus durante esta
  refactorización; corregir estado global/intercalado en un CHANGE posterior.
- C-002: preservar importación parcial y política actual de fallos de fotos;
  no introducir atomicidad sin decisión explícita sobre datos.
- C-003: preservar borrado secuencial y recuperación actual; diseñar una política
  de recuperación como CHANGE separado antes de alterar sus efectos.

Consecuencia común: reduce el alcance de esta refactorización, pero no soluciona
estas limitaciones. El propietario puede elegir corregirlas en 001; en tal caso
se añaden requisitos CHANGE y pruebas rojas antes de implementar.

Estado actualizado 2026-10-14: el propietario aprobó el alcance presentado;
C-001 a C-003 quedan resueltas en la spec. Se pasa a checklist y plan, sin
haber iniciado implementación ni declarar los pins completos.
