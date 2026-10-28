# Registro de aprobaciones y estado

Revisado: 2026-10-20 (Bogotá). Este archivo conserva cronológicamente las
decisiones; los estados de tablas antiguas son históricos. El cierre verificado
de 001–006 figura en la entrada final de integración 006. Las reglas siguen en
la [constitución](../../.specify/memory/constitution.md) y cada spec es dueña de
su alcance. La [PATCH 1.0.3](amendment-1.0.3.md) fue ratificada mediante
«Ratificar PATCH y autorizar publicación, integración con CI verde y Vercel».
Autoriza su aplicación, publicación, fusión con CI verde y despliegue asociado.
El «continua» anterior autorizó preparar la entrega; la decisión posterior
expresa ratifica la retirada de KD-002. La integración documental y sus
verificaciones se registran en el [PR #15](https://github.com/Ori-G-A/FitTrack/pull/15).

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

## Plan 003 aprobado y ejecución local autorizada — 2026-10-16

«adelante» responde a la petición concreta de aprobar plan, tareas y revisión
para ejecutar localmente pins y extracciones. Se autoriza E0–E5 y se conserva
G-PIN antes de producción. La etapa documental queda preparada en a74651d;
esta autorización permite ejecutar localmente antes del merge documental.
No autoriza despliegues ni nuevas correcciones CHANGE.


## Continuación de ejecución 003 — 2026-10-17

El propietario indicó «continua» después del checkpoint con Docker/RLS
bloqueado. Se retomó T025 dentro de la ejecución E0–E5 ya autorizada: Docker
volvió a responder, se renovó RLS con limpieza y el gate 002 pasó 23/23.
La verificación local está completa; [evidencia final](../../specs/003-entrenamiento/evidence/final.json).
Esta continuación no se interpreta como aceptación final de implementación
ni autorización de publicación, fusión o despliegue. El propietario dispone
del [cuerpo de PR preparado](../../specs/003-entrenamiento/code-pr.md) para revisar.


## Integración 003 autorizada — 2026-10-17

El propietario indicó «continua e integra» tras la entrega local completa de
003 en c0be838. Autoriza publicar la rama/PR e integrar la refactorización.
Al consultar expresamente el efecto de Vercel sobre main, respondió
«Autorizar integración y despliegue automático». La autorización sustituye
para esta entrega la reserva anterior de apertura/fusión por el propietario.
La fusión se ejecutará con ambos jobs CI aprobados y SHA de head comprobado.
No se declara aún PR publicado, merge ni despliegue completado, y no se
concede permiso permanente para futuras áreas.


## Integración 003 comprobada y preparación 004 — 2026-10-18

La autorización «continua e integra», con confirmación «Autorizar integración
y despliegue automático», se ejecutó mediante PR #9. Head 28bd509, CI del PR
39090760297 aprobado; merge 2a7004277bd75d87fdf9746c90853b4c34eac044, CI
de main 39090941895 aprobado; Vercel Production 7148987435 exitoso sobre ese SHA.
La URL individual exige login de Vercel: no se afirma prueba funcional con datos
productivos. El [PR #9](https://github.com/Ori-G-A/FitTrack/pull/9) conserva la
evidencia remota posterior al checkpoint local. M4 queda integrado; KD-002 sigue.

El propietario indicó después «continua». Autoriza preparar survey/propuesta
de la siguiente área del roadmap, 004-nutricion-objetivos. Se proponen 16 FR
AS-IS y 15 escenarios con C-001/002/003 pendientes. No se interpreta como
aprobación anticipada del alcance nuevo, su plan, código ni integración.

## Alcance 004 aprobado — 2026-10-18

El propietario respondió «Aprobar alcance y las tres aclaraciones» a la petición
concreta de aprobar 16 FR AS-IS, 15 escenarios y C-001/002/003. Se autoriza
preparar plan, tareas y analyze. Se preservan diferencias numéricas y temporales
y quedan fuera cambios clínicos y algoritmos de peso/ciclo. No se infiere
aprobación del plan, ejecución local, publicación, integración ni despliegue.

## Plan 004 aprobado y ejecución local autorizada — 2026-10-18

El propietario respondió «Aprobar plan, tareas y revisión; autorizar ejecución local»
a la propuesta concreta en 3d3e20b. Autoriza E0–E5 antes de integrar el PR
documental, con baseline original bloqueante y RLS real desechable en cierre.
No autoriza CHANGE, publicación, integración ni despliegue de004.

## Continuación y cierre local 004 — 2026-10-18

El propietario indicó «continua» después de informar que revisaría Docker.
El motor volvió a responder; se retomó T029 dentro de E0–E5 ya autorizada.
Fixture anterior retirado con guardas, nueva RLS 3/3 y cleanup verificado;
gate 002 repetido íntegro y cuatro contratos completos.
[Resumen final](../../specs/004-nutricion-objetivos/evidence/final.json).
No se infiere aceptación final ni autorización para publicar, integrar o desplegar.

## Integración 004 autorizada — 2026-10-18

El propietario respondió «Autorizar publicación, integración con CI verde y
despliegue automático» a la propuesta concreta de publicar rama/PR de004,
fusionar con CI remoto aprobado y permitir Vercel asociado. Esta autorización
sustituye para esta entrega la reserva de apertura/fusión por el propietario.
La verificación local quedó cerrada enef44f9b. No se concede permiso permanente
para otras áreas ni se declara aún publicación, merge o despliegue completados.

## Integración 004 comprobada y preparación 005 — 2026-10-18

La autorización «Autorizar publicación, integración con CI verde y despliegue
automático» se ejecutó mediante PR #10. Head 25f64de; CI del PR 39182872610
aprobado. Merge 02ab5193f9d01e0037e9640626b25742e5224a5a; CI de main 39183165576
aprobado. Vercel Production 7163298676 exitoso sobre el mismo SHA. La URL
individual responde 200 con login de Vercel, sin prueba funcional con datos reales.
[Evidencia remota](../../specs/004-nutricion-objetivos/evidence/integration.json).
El propietario indicó después «continua»: autoriza preparar survey/propuesta 005,
sin aprobar anticipadamente alcance, aclaraciones, plan, código ni despliegue.

## Alcance y aclaraciones 005 aprobados — 2026-10-18

El propietario respondió «continua» a la solicitud explícita de aprobar la spec
005 (20 FR, 20 escenarios) y C-001/002/003: registros y consumidores necesarios,
preservación de diferencias actuales BODY-001–005 y fórmulas/incertidumbre sin
cambios clínicos. Se autoriza preparar plan, tareas y analyze. La respuesta no
aprueba anticipadamente el plan ni ejecución local, publicación, merge o despliegue.

## Plan 005 preparado para revisión — 2026-10-18

Se prepararon plan, research, validación, 33 tareas, analyze y borrador de PR
sobre el alcance aprobado. Veinte grupos de pins y cuatro recorridos Chromium,
G-PIN previo a src y cierre con cinco contratos y RLS local. Revisión documental:
40 IDs trazados, tareas acíclicas y enlaces válidos; sin ejecución de producto.
[Plan](../../specs/005-cuerpo-ciclo/plan.md),
[verificación](../../specs/005-cuerpo-ciclo/verification.md).
Plan/tareas/analyze y ejecución local E0–E6 permanecen pendientes de aprobación.

## Plan y ejecución local 005 aprobados — 2026-10-18

El propietario respondió «aprobado» a la solicitud explícita de aprobar plan,
33 tareas y revisión, y autorizar ejecución local E0–E6 antes de integrar el PR
documental. Se permite iniciar caracterización sobre original y después extraer
solo tras G-PIN completo verde. No autoriza publicación, merge ni despliegue.

## Ejecución local 005 verificada — 2026-10-19

La autorización del plan/E0–E6 se ejecutó: 34 tareas completas (T034 añadida
por convergencia para precisar FR-016 sin cambiar conducta), 286 Node,13 Chromium,
3 RLS con limpieza, build y cinco manifiestos completos sobre el mismo src.
68 pins intactos; revisión de aserciones del agente. [Cierre](../../specs/005-cuerpo-ciclo/converge.md).
No se infiere aceptación final ni autorización de publicar, integrar o desplegar005.

## Publicación e integración 005 autorizadas — 2026-10-19

El propietario respondió «autorizo. continua» a la solicitud explícita de
publicar los PRs documental y de código, integrarlos con CI verde y permitir
el despliegue automático de Vercel. Se autoriza ejecutar esas acciones en ese
orden; los resultados remotos se registrarán al comprobarlos. La autorización
no cambia el contrato ni equivale a una prueba funcional con datos reales.

## Integración 005 comprobada y comienzo de diagnóstico 006 — 2026-10-19

Autorización ejecutada en orden: PR documental #11 (e949c08, CI 39364246304)
y PR de código #12 (ce7e123, CI 39364579779), ambos con los dos jobs aprobados.
Merge documental 73e02a1; merge de código 86299a4497e3c19180c30a640598a1358d61cc8f.
CI de main 39364536428/39365039074 verde y Production 7190788024/7190866939
exitoso sobre sus respectivos merges. Árbol src idéntico al validado localmente.
[Evidencia](../../specs/005-cuerpo-ciclo/evidence/integration.json).
HTTP 200 muestra Login de Vercel; no hay prueba funcional autenticada.
El posterior «continua» autoriza preparar diagnóstico y propuesta 006; no aprueba
anticipadamente alcance, cambios, plan, implementación ni despliegue de esa área.

## Propuesta 006 preparada, sin aprobación — 2026-10-19

El posterior «continua» autoriza preparar survey y alcance de interfaz.
Se proponen 21 FR AS-IS y dos CHANGE (FR-021/022), 23 escenarios y C-001/002/003.
[Propuesta](../../specs/006-interfaz/spec.md). Los artefactos son borradores;
no se crea commit como etapa aprobada, plan ni implementación anticipada.

## Alcance y aclaraciones 006 aprobados — 2026-10-19

El propietario respondió «Aprobar alcance, ambos cambios y las tres aclaraciones»
a la pregunta explícita sobre la spec 006 y C-001/002/003. Aprueba 21 AS-IS,
dos CHANGE (FR-021/022) y 23 escenarios; conserva compatibilidades temporales,
medición sin optimización y revisión KD-002 con ratificación separada.
Autoriza preparar plan/tasks/analyze; no anticipa su aprobación, ejecución local,
publicación, integración ni despliegue de 006.

## Plan 006 preparado para revisión — 2026-10-19

Sobre alcance aprobado se prepararon plan, research, validación, 39 tareas,
mapa de regresiones, analyze y borrador de PR documental. 46 IDs pending;
21 grupos AS-IS, siete recorridos Chromium y cinco rojos CHANGE previstos.
Revisión documental: tareas acíclicas, matriz coherente, enlaces válidos y
producto intacto. [Plan](../../specs/006-interfaz/plan.md).
Plan/tareas/analyze y ejecución local E0–E6 previos al merge siguen pendientes
de aprobación. No se anticipan publicación, integración ni despliegue de 006.

## Plan y ejecución local 006 aprobados — 2026-10-19

El propietario respondió «Aprobar plan, tareas y revisión; autorizar ejecución
local E0–E6» a la solicitud explícita sobre plan/tasks/analyze y ejecución local
antes de integrar el PR documental. Se autoriza E0 y las entregas posteriores
solo tras G-PIN. No autoriza publicar, fusionar ni desplegar 006.

## Solicitud de CHANGE de resaltado — 2026-10-20

El propietario eligió «Proponer un CHANGE separado para corregir el resaltado»
ante la discrepancia FR-008 detectada en E0. Se preparó FR-024/US1-AS9, precisión
propuesta de FR-008 y extensión T040–T043. La respuesta autoriza preparar la
propuesta; alcance y extensión técnica siguen pendientes de aprobación expresa.
Las 39 tareas ya aprobadas conservan su autorización dentro de sus puertas.

## Alcance adicional FR-024 aprobado — 2026-10-20

El propietario respondió «Aprobar alcance FR-024 y precisión de FR-008» a la
primera pregunta explícita de la adenda. Quedan aprobados FR-024/US1-AS9 y la
referencia de duración/limpieza desde FR-008, sin corregir tarjeta ausente.
El alcance vigente suma 48 IDs. La segunda pregunta sobre T040–T043 y ejecución
sigue pendiente; no se interpreta aprobación de alcance como aprobación técnica.

## Extensión técnica T040–T043 aprobada — 2026-10-20

El propietario respondió «aprobado. continua» a la solicitud pendiente de aprobar
la extensión técnica T040–T043. Autoriza esas cuatro tareas, las dependencias
adicionales y su ejecución local en E0–E6 antes del merge documental. No autoriza
publicación, fusión ni despliegue. FR-024 y precisión FR-008 ya aprobados.

## Evidencia de ejecución006 — 2026-10-20

El alcance y el plan local previamente aprobados se ejecutaron E0–E6. [Cierre local](../../specs/006-interfaz/converge.md). Esta anotación registra evidencia del agente y no una nueva aceptación humana. Publicación, fusión y despliegue006 siguen pendientes de autorización específica; KD-002 conserva su decisión separada.

## Publicación, integración y Vercel de 006 autorizados — 2026-10-20

El propietario respondió «Autorizar publicación, integración con CI verde y
Vercel» tras revisar el cierre local 55cdd20 y los dos PRs preparados. Autoriza
publicar las ramas y PRs documental y de código, integrarlos en ese orden al
aprobar CI remoto y permitir los despliegues automáticos asociados. No cambia
la constitución ni ratifica la retirada de KD-002. El PR documental es
[#13](https://github.com/Ori-G-A/FitTrack/pull/13), snapshot 3d542bc.

## Integración 006 verificada — 2026-10-20 (Bogotá)

Los PRs [#13 documental](https://github.com/Ori-G-A/FitTrack/pull/13) y
[#14 de código](https://github.com/Ori-G-A/FitTrack/pull/14) están integrados.
El commit resultante `492be5d22a71a885c9be158aa3401f8a229f7326` aprobó
ambos jobs de [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/39538254800),
con los seis contratos completos, RLS local real y mutaciones. Vercel confirmó
Production para ese mismo SHA. [Registro verificable](../../specs/006-interfaz/evidence/integration.json).

Las correcciones de preparación remota conservan src y los 68 pins anteriores;
PIN-006-002 añade sincronización de fixture FR-023, con reproducción renovada
sobre el original. Sin prueba autenticada de producción. KD-002 sigue activa
hasta una PATCH ratificada. Este cierre sustituye los estados históricos pendientes
de publicación, autorización e integración de 006; no aprueba una etapa nueva.

## Ratificación PATCH 1.0.3 — 2026-10-20 (Bogotá)

El propietario respondió «Ratificar PATCH y autorizar publicación, integración
con CI verde y Vercel» a la propuesta revisable de retirar KD-002 y cerrar M7,
con informe de impacto, diff y guía de continuidad. Autoriza aplicar 1.0.3,
publicar el PR documental de esta rama, fusionarlo al aprobar CI remoto y
permitir el despliegue automático asociado. No es autorización permanente.

La constitución se actualizó localmente y KD-002 se retiró del registro activo.
M7 satisface la puerta normativa; la integración de esta entrega sigue pendiente
de CI verde. Los hallazgos y límites de producción no cambian.
[Informe ratificado](amendment-1.0.3.md). Incluye el registro local de cierre
006 del commit `7b523f7`, todavía ausente de main al preparar esta entrega.

## Alcance 007 aprobado — 2026-10-21 (Bogotá)

El propietario respondió «Aprobar alcance y las tres aclaraciones» a la pregunta
de aprobar [007](../../specs/007-guardado-fiable/spec.md): cuatro AS-IS, cinco
CHANGE, doce escenarios y C-001/002/003. Autoriza preparar plan, tareas y análisis.
No autoriza implementar ni publicar/fusionar/desplegar. La reproducción del
survey con Node global es diagnóstica; G-PIN exige runtime fijado y evidencia nueva.

## Plan 007 aprobado — 2026-10-21 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución
local E0–E3». Aprueba las 24 tareas, decisiones, puertas y enmiendas controladas
de dos pins descritas en el plan; autoriza ejecución local antes de integrar
el PR documental. No autoriza publicar, fusionar ni desplegar 007.

## Cierre local 007 — 2026-10-21 (Bogotá)

E0–E3 completadas localmente: 325 Node y 29 Chromium, sin skips/retries; build aprobado, siete contratos y 205 IDs completos sobre el mismo sourceHash. RLS local fresco: tres contratos reales y limpieza confirmada. Tres mutaciones detectadas con cuatro controles positivos. 97 de 101 archivos anteriores intactos, cuatro archivos con cinco enmiendas explícitas; seis archivos E0 intactos y prueba suplementaria de cambio de cuenta con rojo original/verde candidato.
[Evidencia](../../specs/007-guardado-fiable/verification.md).
La autorización local del plan está cumplida; publicación, integración y Vercel
siguen pendientes de decisión específica. DATA-004/005 y producción quedan fuera.

## Entrega remota 007 autorizada — 2026-10-21 (Bogotá)

Sobre el cierre local `5f8334e`, el propietario respondió «Autorizar publicación,
integración con CI verde y Vercel». Autoriza publicar ambas ramas y PRs,
integrarlos con CI remoto verde y permitir el despliegue automático asociado.
Se integra primero el snapshot documental aprobado y después el código.
La evidencia de integración se registrará por SHA; esta autorización no convierte
el cierre local en CI remoto ni certifica una sesión autenticada de producción.

## Integración 007 verificada — 2026-10-22 (Bogotá)

Los PRs [#16 documental](https://github.com/Ori-G-A/FitTrack/pull/16) y
[#17 de código](https://github.com/Ori-G-A/FitTrack/pull/17) están integrados,
en ese orden, tras aprobar ambos jobs de CI de cada PR. El resultado `0617764`
aprobó [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/39881154170)
y Vercel confirmó Production para ese mismo SHA. Siete contratos, 205 IDs,
325 pruebas Node, mutaciones y RLS local real con limpieza confirmados.
[Registro](../../specs/007-guardado-fiable/evidence/integration.json).

Este estado sustituye las esperas históricas de autorización, publicación e
integración de 007. No certifica una sesión autenticada de producción: la URL
técnica redirige al acceso de Vercel. TEST-001, DATA-004/005 y el aviso de bundle
siguen documentados. No se amplía el alcance de producto aprobado.

## Alcance 008 aprobado — 2026-10-22 (Bogotá)

El propietario respondió «Aprobar alcance y las tres aclaraciones» a la propuesta
[008](../../specs/008-borrado-fiable/spec.md): cuatro AS-IS, nueve CHANGE,
dieciséis escenarios y C-001/002/003. Aprueba recuperación manual antes del
despacho de DELETE y bloqueo hasta salir de la sesión después; resultado de datos
separado del cierre; aislamiento por sesión y prevención de duplicados y
reactivación ordinaria. No promete rollback ni reintentos destructivos automáticos.
Autoriza preparar plan, tareas y análisis; no implementar ni publicar/integrar/Vercel.

## Plan 008 aprobado — 2026-10-22 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución
local E0–E3». Aprueba las 36 tareas, decisiones, puertas y enmienda controlada
del pin contradictorio descritas en el plan. Autoriza ejecución local antes de
integrar el PR documental, conservando un snapshot aprobado. No autoriza publicar,
fusionar ni desplegar 008. El cierre exige ocho contratos/234 IDs y RLS local fresco.

## Avance local 008 — 2026-10-24 (Bogotá)

E0–E2 verificadas y conservadas; E3 parcial con perfil local de 358 Node,
30 Chromium/build, siete contratos/211 IDs y once mutaciones nuevas/heredadas.
Se añadió T037 por converge dentro de FR-008/011, sin nuevo comportamiento.
RLS fresco sigue pendiente tras fallar Docker; la limpieza del intento propio
no se confirmó y se conserva su recuperación. No hay aceptación de esta brecha,
cierre E3 ni autorización de publicar/fusionar/Vercel.
[Evidencia](../../specs/008-borrado-fiable/verification.md).

## Cierre local 008 — 2026-10-24 (Bogotá)

Ejecución local autorizada E0–E3 completada: 370 Node, 30 Chromium y build; ocho contratos/234 IDs completos; RLS real fresco (tres contratos) y limpieza confirmados; once mutaciones detectadas. 107 firmas anteriores intactas, una enmendada y ocho E0 intactas.
38 tareas, incluidas T037/T038 dentro de requisitos aprobados. Docker y el
fixture anterior recuperados; nuevo RLS fresco y cleanup aprobados. Las pruebas
de T038 se caracterizaron en candidato previo, sin atribuir rojo al original E0.
[Converge](../../specs/008-borrado-fiable/converge.md).
La autorización local queda ejecutada; no se autoriza aún publicar, fusionar ni
desplegar 008. CI remoto y producción no se infieren desde pruebas locales.

## Entrega remota 008 autorizada — 2026-10-27 (Bogotá)

Sobre el cierre local `00de5f2`, el propietario respondió «Autorizar publicación,
integración con CI verde y Vercel». Autoriza publicar ambas ramas y PRs,
integrarlos con CI remoto verde y permitir el despliegue automático asociado.
Se integra primero el snapshot documental aprobado `2ee8edc` y después el código.
Esta autorización sustituye las esperas anteriores de decisión remota de 008;
no convierte la evidencia local en CI remoto ni certifica producción.

## Integración 008 verificada — 2026-10-27 (Bogotá)

Los PRs [#18 documental](https://github.com/Ori-G-A/FitTrack/pull/18) y
[#19 de código](https://github.com/Ori-G-A/FitTrack/pull/19) están integrados,
en ese orden, tras aprobar ambos jobs de CI de cada PR. El resultado `1f6b29d`
aprobó [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/40537644734)
y Vercel confirmó Production para ese mismo SHA. Ocho contratos/234 IDs,
370 pruebas Node, once mutaciones y RLS real local con limpieza confirmados.
[Registro](../../specs/008-borrado-fiable/evidence/integration.json).

Este estado sustituye las esperas históricas de autorización, publicación e
integración de 008 y el bloqueo Docker ya resuelto. No certifica una sesión
autenticada ni RLS del backend productivo; TEST-001 y el aviso de bundle siguen
documentados. No se amplía el alcance de producto aprobado.

La comprobación HTTP anónima no pudo resolver o alcanzar la URL técnica de
Vercel. Production está confirmado por el proveedor; la navegación pública no
se presenta como verificada.

## Alcance 009 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar alcance y las tres aclaraciones» a
[009](../../specs/009-reloj-pruebas/spec.md): tres AS-IS, cuatro CHANGE y nueve
escenarios. Aprueba limitar el cambio a los tres montajes reproducidos,
preservar fechas/plazos/nombres/aserciones y proponer las enmiendas de firmas
en el plan; distingue la carrera como TEST-002 sin reescribir las referencias
históricas. Autoriza preparar plan/tareas/análisis para aprobación separada;
no implementar, publicar, fusionar ni desplegar 009.

## Plan 009 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan y precisión SC-001; autorizar ejecución local E0–E2». Aprueba las 26 tareas, plan, análisis y precisión SC-001: rojo específico de carrera FR-004/005, preservación de controles de error FR-006 y evidencia completa FR-007 sin inventar defectos previos. Autoriza E0–E2 local antes del PR documental; no publicar, fusionar ni desplegar 009.

## Cierre local 009 — 2026-10-27 (Bogotá)

372 Node, 35 Chromium/build, nueve contratos/250 IDs completos, catorce mutaciones con quince controles positivos, nueve negativos de recibos y RLS real fresco con limpieza. 113 firmas anteriores intactas, tres enmiendas canónicas y siete E0 propios intactos. Plan local autorizado cumplido; 27 tareas (T027 aditiva) y dos PRs preparados. [Verificación](../../specs/009-reloj-pruebas/verification.md). Publicación, integración y Vercel requieren decisión específica; no se certifica producción ni toda inestabilidad.

## Entrega remota 009 autorizada — 2026-10-27 (Bogotá)

Sobre el cierre local `6dc93fb`, el propietario respondió «Autorizar publicación,
integración con CI verde y Vercel». Autoriza publicar ambas ramas y PRs,
integrarlos con CI remoto verde y permitir el despliegue automático asociado.
Se integra primero el snapshot documental aprobado `5658328` y después el código.
Esta decisión sustituye las esperas anteriores de autorización remota de 009;
no convierte la evidencia local en CI remoto ni certifica una sesión productiva.

## Integración 009 verificada — 2026-10-27 (Bogotá)

Los PRs [#20 documental](https://github.com/Ori-G-A/FitTrack/pull/20) y
[#21 de código](https://github.com/Ori-G-A/FitTrack/pull/21) están integrados,
en ese orden, con ambos jobs de CI aprobados para cada PR. El resultado
`392e797` aprobó [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/40617873796)
y Vercel confirmó Production para ese mismo SHA. 372 Node, 35 Chromium,
nueve contratos/250 IDs, catorce mutaciones y RLS fresco real con limpieza
confirmados. Las huellas de producto y verificación coinciden con el cierre local.
[Registro](../../specs/009-reloj-pruebas/evidence/integration.json).

La URL técnica respondió HTTP 302 y redirigió al acceso de Vercel; no se realizó
una prueba autenticada de FitTrack ni se certifican políticas del backend
productivo. Esta observación sustituye la limitación DNS anterior para esa URL
en este entorno. La espera de montaje no diagnosticada de 007, los demás
hallazgos y el aviso de bundle se conservan; no se promete estabilidad absoluta.

Este estado sustituye las esperas históricas de autorización, publicación e
integración de 009. No concede autorizaciones permanentes para futuras specs.

## Propuesta 010 — 2026-10-27 (Bogotá)

El «continua» posterior al cierre remoto de 009 autoriza preparar la siguiente
propuesta. [010](../../specs/010-entradas-cuerpo/spec.md) contiene cuatro AS-IS,
seis CHANGE, catorce escenarios y C-001/002/003 pendientes. Se reprodujo el
original con datos sintéticos, sin modificar producto, pruebas ni contratos.
No se infiere aprobación de alcance o plan, ni autorización para implementar,
publicar, integrar o desplegar 010.

## Alcance 010 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar alcance y las tres aclaraciones» a
[010](../../specs/010-entradas-cuerpo/spec.md): cuatro AS-IS, seis CHANGE,
catorce escenarios y C-001/002/003. Aprueba decimal explícito coma/punto,
positivos para peso/medidas/pulso, cero conocido para sueño/pasos, sin máximos
ni enteros nuevos; rechazo completo con error accesible y borrador conservado,
sin limpiar historia. Autoriza preparar plan/tareas/análisis y proponer
enmiendas de 005 y del verificador 009, para aprobación separada. No autoriza
implementar, publicar, fusionar ni desplegar 010.

## Planificación 010 preparada — 2026-10-27 (Bogotá)

[Plan](../../specs/010-entradas-cuerpo/plan.md), 31 tareas E0–E2, matriz,
seis enmiendas y análisis preparados para aprobación separada. 24 IDs propios
pending, con nombres previstos y tareas. Se propone cierre de diez contratos/
274 IDs, 43 Chromium, diecinueve mutaciones postverde y RLS local fresco con
limpieza. Las seis firmas y las 123 efectivas actuales se inventariaron sin
modificarlas; producto, pruebas y verificadores intactos. Plan y ejecución
local antes del PR documental pendientes; publicación, integración y Vercel
requieren decisión posterior. 010 es la última entrega actual propuesta:
informe final y backlog separado, sin iniciar 011 automáticamente.

## Plan 010 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan, tareas y análisis; autorizar ejecución local E0–E2» a
[010](../../specs/010-entradas-cuerpo/plan.md). Aprueba las 31 tareas, plan,
análisis, seis enmiendas acotadas y ejecución local E0–E2 antes del PR documental,
con snapshot aprobado. Incluye informe final y mantiene RLS local fresco como
requisito de cierre. No publicar, fusionar ni desplegar sin decisión específica.

## Cierre local 010 — 2026-10-28 (Bogotá)

379 Node, 43 Chromium/build, diez contratos/274 IDs, diecinueve
mutaciones postverde, trece negativos de recibos/dos positivos y RLS fresco
real con limpieza verificados. Seis enmiendas legadas y dos técnicas propias;
123 firmas anteriores, nueve E0 y ocho E1 verificadas. [Converge](../../specs/010-entradas-cuerpo/converge.md)
y [informe final](refactor-final.md). Las 31 tareas originales se conservan
con T032–T035 aditivas; publicación, integración y Vercel siguen pendientes de
autorización específica. BODY-001 queda resuelto localmente, sin certificar
producción ni cerrar los demás hallazgos; no se inicia otra spec por inferencia.

## Entrega remota 010 autorizada — 2026-10-28 (Bogotá)

Sobre el cierre local e3b1d04, el propietario respondió «Autorizar publicación,
integración con CI verde y Vercel». Autoriza ambas ramas/PRs, documental primero
y código después, con CI remoto verde y despliegue automático asociado.
[Decisión](../../specs/010-entradas-cuerpo/evidence/remote-authorization.json).
No se presenta aún como integración o despliegue verificados.

## Integración 010 verificada — 2026-10-28 (Bogotá)

Los PRs [#22 documental](https://github.com/Ori-G-A/FitTrack/pull/22) y [#23 de código](https://github.com/Ori-G-A/FitTrack/pull/23) están integrados, en ese orden, con ambos trabajos de CI aprobados para cada PR. El resultado `e427682` aprobó [CI de main](https://github.com/Ori-G-A/FitTrack/actions/runs/40775635221) y Vercel confirmó Production para ese mismo SHA. 379 Node, 43 Chromium, diez contratos/274 IDs, diecinueve mutaciones y RLS real local con limpieza confirmados. Las huellas coinciden con el cierre local. [Registro](../../specs/010-entradas-cuerpo/evidence/integration.json).

BODY-001 queda resuelto en el alcance aprobado de los nueve campos. Se conservan historia, fórmulas y BODY-002–005. La comprobación del proveedor y de la URL técnica no constituye un smoke autenticado de FitTrack ni certifica las políticas del backend productivo. Los demás hallazgos y el aviso de bundle siguen en el backlog. Esta entrega cierra el alcance actual; no inicia 011.

Este registro posterior se publica en la rama 010; no se atribuye al árbol del commit de main verificado. Las esperas anteriores son históricas y no conceden autorización permanente para otras entregas.
