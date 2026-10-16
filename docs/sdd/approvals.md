# Registro de aprobaciones y estado

Revisado: 2026-10-16. Este archivo registra evidencia de decisiones; las reglas
siguen en la [constitución](../../.specify/memory/constitution.md) y el alcance
en la [spec 001](../../specs/001-datos/spec.md).

| Elemento | Evidencia de autorización | Estado actual |
| --- | --- | --- |
| Adopción SDD y preparación de fase 0 | «haremos una refactorización… de acuerdo a las reglas del SDD»; «empecemos» | Autorizado; fase 0 aún no cerrada en su totalidad |
| Constitución inicial, KD e idioma | «aprobado. Crea las carpetas», respondiendo a la constitución y comenzar por 001 | Ratificada; estados editoriales corregidos en 1.0.1 |
| Carpetas de specs | «Crea las carpetas» | Creadas las seis áreas; no implica aprobar sus specs futuras |
| Área 001 y alcance AS-IS | «aprobado el alcance», respondiendo a preservar comportamiento y corregir defectos después | Aprobado; C-001/002/003 resueltas |
| Mejoras propuestas de evidencia | «aplica tus sugerencias y revisa el estado actual de lo aprobado» | Autorizadas: entorno, piloto, entregas pequeñas, compatibilidad temporal, mutaciones, trazabilidad y navegador |
| Preparación técnica anticipada | Misma autorización anterior, que incluye validar el entorno y el código original antes del plan | Autorizada para infraestructura y pruebas; no autoriza extracción productiva |
| Checklist de requisitos | Revisión realizada por el agente | Completo documentalmente; no es aprobación del dueño ni analyze |
| Plan 001 revisado | «continua» del 2026-10-15 tras presentarlo como siguiente decisión pendiente | Aprobado para avanzar a tareas/analyze; no se infiere dispensa de puertas restantes |
| Tareas y analyze 001 | «apruebo todo. Cotninua con el trabajo» tras presentar tareas/analyze | Aprobados; autorización directa para continuar localmente con pins y extracciones por puertas |
| PR documental 001 | Título/cuerpo preparados; no hay merge registrado | Pendiente de apertura/fusión por el propietario |
| Refactor productivo / converge | Misma autorización directa de continuar el trabajo | E1–E4 verificadas localmente, 21/21 IDs completos y converge sin gaps nuevos; CI e integración remota pendientes |
| Calendario | Fechas propuestas por el agente | Tentativo, no compromiso del propietario |
| Despliegue | Ninguna autorización | Fuera de alcance; vínculo real de main con Vercel sin verificar |
| Preparación 002 | «continua hast llgar al limite de uso de tokens», después del cierre local de 001 | Survey, spec/plan/tasks en borrador y pruebas previas; no se infiere aprobación de CHANGE nuevos ni cierre de puertas |
| Alcance 002 y FR-012/013 | «Aprobar alcance y ambos cambios propuestos», 2026-10-15, en respuesta a la spec presentada | Aprobados AS-IS de identidad/fotos, validación de configuración y diagnóstico local sanitizado |
| Plan, tareas y revisión 002 | «Aprobar plan, tareas y revisión; continuar implementación local», seguido de «adelante» al pasar a RLS y «continua» | Aprobados; E1–E4 verificadas localmente, 23/23 IDs completos; CI/integración remotos pendientes |

## Estado vigente de integración — 2026-10-16

Este checkpoint sustituye los estados pendientes de integración de la tabla
histórica anterior. No reinterpreta las aprobaciones de alcance o plan.

- «integra los pr y veamos como nos va» autorizó publicar e integrar los seis PRs.
- «Autorizar fusiones y despliegue automático» autorizó expresamente el efecto
  de Vercel sobre main; no es una autorización permanente de despliegues futuros.
- PRs #2–#7 fusionados en orden, sin conflictos. Commit final integrado:
  `9a10a54efbf50fcac281397e30f149e31d73a9cd`.
- [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/38939114677):
  test-and-build y rls-and-sdd-002 completados correctamente. La suite verifica
  contratos completos de 001 y 002, con RLS local desechable y Chromium.
- Vercel confirmó Production success, deployment `7125230490`. La comprobación
  HTTP del agente recibió el login de Vercel, no una prueba visual de la app.
- El propietario informó después «la aplicación funciona bien. seguimos».
  Se registra como validación manual general de la aplicación publicada; no
  afirma recorridos, cuenta de prueba o pruebas de datos que no describió.
- La retirada normativa de KD-001/003/004/005 se prepara en una PATCH separada.
  La constitución vigente continúa siendo 1.0.1 hasta ratificación explícita.

## Git y orden de integración (histórico previo a los merges)

La documentación creada al inicio estaba sin versionar; no había commits de
sus etapas. La primera enmienda registrada incorpora la constitución completa
con su corrección editorial, no un diff frente a una 1.0.0 previamente versionada.

1. `codex/sdd-constitution-1.0.1`: commit de constitución e informe editorial.
2. `codex/sdd-readiness`: preparación técnica y revisión documental; depende del anterior.
3. `codex/001-datos-docs`: tareas/analyze de 001; depende de readiness.
4. `codex/001-datos`: rama inicial de área; deberá incorporar lo fusionado por el
   dueño antes de avanzar con la refactorización.
5. `codex/001-datos-code`: implementación final local, dependiente de la rama documental.
6. `codex/002-identidad-fotos`: preparación de pruebas y alcance de la siguiente
   área, dependiente del cierre local de 001; sin implementación productiva aún.

No hay PRs publicados ni merges realizados. Los borradores de plan no se
consideran etapas aprobadas por estar guardados en el workspace.
La autorización directa posterior del propietario permite continuar la ejecución
local; la integración remota conserva sus aprobaciones y no se da por realizada.

## Próxima decisión concreta

Revisar el código y su [convergencia](../../specs/001-datos/converge.md), abrir los
PRs respetando el orden de dependencias y observar CI antes de integrar.
[Cuerpo de PR de código](../../specs/001-datos/code-pr.md) preparado.
No se amplía el dominio ni se da CI remoto por observado.

## Preparación de la siguiente área

Se preparó la [spec 002](../../specs/002-identidad-fotos/spec.md) con dos CHANGE:
configuración al iniciar y diagnóstico local sanitizado. El propietario aprobó
posteriormente alcance y ambos cambios mediante su respuesta explícita del
2026-10-15. La instrucción anterior de continuar no se utiliza como aprobación
retroactiva del contenido; la aceptación se atribuye a esta respuesta posterior.
Rama local `codex/002-identidad-fotos`, dependiente de 001-code. Plan/tasks
aprobados posteriormente, como registra la sección siguiente. RLS sigue pendiente
porque el motor local no está disponible; no hay conexión a un backend real.

Las pruebas preparatorias verificadas se guardaron en `a35f7aa`, separadas de
la aprobación de alcance. El [plan 002](../../specs/002-identidad-fotos/plan.md),
[research](../../specs/002-identidad-fotos/research.md), tareas y revisión cruzada
se presentaron antes de la aprobación posterior explícita. No se marcan aprobados
solo por estar escritos. No se exige aprobar otra vez FR-012/013 ni decisiones C2.

## Plan 002 aprobado — 2026-10-15

Respuesta explícita: «Aprobar plan, tareas y revisión; continuar implementación
local». Autoriza E1–E3 locales; RLS real sigue siendo requisito de cierre.
No requiere repetir aprobación de alcance, plan o entregas ya incluidas.

E1–E3 implementadas en `74de716`, `4a23f37` y `54deef5`: 220 Node y tres
Chromium aprobados, build correcto, once archivos pin originales intactos.
Ese checkpoint mantenía dos IDs RLS pendientes; E4 los completa posteriormente.

## E4 verificada — 2026-10-16

`ed077ec` incorpora RLS real desechable, guardas y CI. Resultado final: 226 Node,
tres contratos RLS reales y tres Chromium aprobados; 23/23 IDs de 002 y 21/21
de 001 completos. El propietario conserva apertura/fusión de PRs y observación
remota de CI. Cuerpo de PR listo en specs/002-identidad-fotos/code-pr.md.
La referencia codex/002-identidad-fotos-docs conserva 357503d para separar etapas.
No se declara cierre integrado M3 ni retirada constitucional de KD por este registro.

## Integración remota solicitada — 2026-10-16

La instrucción directa «integra los pr y veamos como nos va» autoriza publicar
las ramas y abrir/fusionar sus PRs; actualiza la reserva operativa anterior de
apertura y merge por el propietario. No modifica los contratos de producto ni
ratifica una nueva versión constitucional.

Se publicaron seis PRs dependientes: [#2](https://github.com/Ori-G-A/FitTrack/pull/2)
(constitución), [#3](https://github.com/Ori-G-A/FitTrack/pull/3) (readiness),
[#4](https://github.com/Ori-G-A/FitTrack/pull/4) (001 docs),
[#5](https://github.com/Ori-G-A/FitTrack/pull/5) (001 código),
[#6](https://github.com/Ori-G-A/FitTrack/pull/6) (002 docs) y
[#7](https://github.com/Ori-G-A/FitTrack/pull/7) (002 código).

CI remoto reveló un pin contradictorio de pnpm en la rama constitucional y una
maqueta de smoke tests excluida mediante .git/info/exclude. Se eliminó el pin
redundante de CI, se versionó la maqueta existente y se incluyó preview en la
copia limpia. Las correcciones se propagaron sin reescribir historial ni pins.
El primer PR pasó CI tras corregir pnpm; los siguientes vuelven a verificarse.

GitHub registra despliegues Production de los commits de main mediante Vercel
y un Preview del PR #7. La exclusión previa de despliegues sigue vigente hasta
respuesta explícita sobre ese efecto automático. Se solicitó aclaración antes
de fusionar a main. Ningún merge se declara realizado en este checkpoint.


## Ratificación PATCH 1.0.2 — 2026-10-16

El propietario respondió «adelante» a la propuesta concreta del PR #8 para
ratificar, aplicar e integrar la PATCH. KD-001/003/004/005 se retiran del
registro activo; KD-002 y los seguimientos DATA/IDEN/PHOTO se conservan.
M2/M3 cumplen la puerta normativa con esta ratificación; la integración de
esta entrega documental queda sujeta a CI verde del PR #8. No se aprueba
un nuevo alcance de producto. La autorización incluye el despliegue automático
asociado a esta integración puntual y no establece un permiso permanente.

## Preparación de alcance 003 — 2026-10-16

«adelante», tras presentar la preparación de 003 como siguiente etapa, autoriza
survey y propuesta de alcance. Se preparan once FR AS-IS y diez escenarios con
C-001/002/003 propuestos. La aprobación del alcance todavía no se ha recibido;
plan, tareas, analyze e implementación no se consideran aprobados.

## Alcance 003 aprobado — 2026-10-16

El propietario respondió «si» a la propuesta concreta: once FR AS-IS, diez
escenarios y preservación del temporizador con mejoras separadas. C-001/002/003
resueltas. Autoriza preparar plan técnico; «continua» durante su preparación
mantiene esa tarea. No se infiere aprobación anticipada del plan ni ejecución
productiva. La evidencia previa de alcance está en 47e06c6.
