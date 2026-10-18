# Roadmap de adopción SDD

Estado actual, 2026-10-18: 001/002/003 integradas y PATCH 1.0.2 ratificada.
M4 integrado mediante [PR #9](https://github.com/Ori-G-A/FitTrack/pull/9), con
CI del PR/main y Vercel Production aprobados sobre 2a70042. La propuesta 004
está preparada; alcance y aclaraciones pendientes. Los registros siguientes
conservan el historial. [Survey 004](nutricion-objetivos-survey.md).


Estado: constitución y comienzo por 001-datos aprobados el 2026-10-14;
fechas y estimaciones continúan siendo tentativas.
Gobierno: [constitución](../../.specify/memory/constitution.md).
Baseline: [survey](project-survey.md). Sin implementación autorizada por estos borradores.

## Áreas por riesgo

Estimación orientativa en sesiones de trabajo, sin duración contractual;
incluye documentación, revisión, caracterización e implementación, sujeta al survey.

| Spec | Área y resultado | Alcance propuesto | Sesiones |
| --- | --- | --- | --- |
| 001-datos | Conservar registros al cargar y guardar | app_data, cola, cambio de usuario, import/export y coordinación de borrado | 5–8 |
| 002-identidad-fotos | Acceder solo a datos y fotos propios | auth, Storage, RLS, configuración, diagnósticos y recuperación de fotos | 4–7 |
| 003-entrenamiento | Registrar y consultar sesiones sin alterar métricas | rutinas, series, temporizador, progresión y fechas | 4–6 |
| 004-nutricion-objetivos | Registrar ingesta y entender ajustes | alimentos, recetas, unidades, macros, objetivos y avisos de ritmo | 4–6 |
| 005-cuerpo-ciclo | Consultar medidas e inferencias con incertidumbre visible | pesos, medidas, bienestar y ciclo | 4–7 |
| 006-interfaz | Completar tareas en móvil y escritorio | navegación, pantallas, accesibilidad, temas y feedback | 4–6 |

001 coordina borrado e importación; 002 es dueño de las operaciones de fotos e
identidad. Si 001 cambia una firma compartida, incluye sus llamadores y pruebas;
no aplaza una dependencia necesaria a 002. Las fórmulas permanecen en su spec
de dominio aunque aparezcan en varias pantallas.

## Hitos y calendario tentativo

Fechas objetivo para revisión, no promesas de entrega. Ajustar según aprobación
y hallazgos; no acelerar omitiendo puertas.

| Hito | Fecha propuesta | Cierre verificable |
| --- | --- | --- |
| M0 | 2026-10-16 | Constitución y decisiones de fase 0 ratificadas; plantillas y guía revisadas |
| M1 | 2026-10-23 | 001: survey leído, spec/plan/tareas aprobados, analyze sin CRITICAL, PR documental fusionado por dueño |
| M2 | 2026-11-06 | 001: pins previos, verificación verde y converge sin gaps; KD-001 revisada |
| M3 | 2026-11-20 | 002 completada; KD-003/004/005 cerradas o enmienda explícita |
| M4 | 2026-12-04 | 003 completada con trazabilidad y métricas preservadas |
| M5 | 2026-12-18 | 004 completada con fronteras numéricas verificadas |
| M6 | 2027-01-08 | 005 completada con inferencias y desconocidos caracterizados |
| M7 | 2027-01-22 | 006 completada; KD-002 cerrada; revisión final y guía de transferencia si aplica |

Cada cierre incluye revisión de constitución/KD y aprobación del propietario.
Estado vigente al 2026-10-16: M0 y M1 integrados; implementación y verificación
de M2/M3 integradas, con revisión KD realizada y retirada normativa pendiente
de PATCH ratificada. No se declara M3 cerrado mientras falte esa puerta.
PRs #2–#7 fusionados, CI de main verde y aplicación validada por el propietario.
Commits, autorizaciones y límites: [registro](approvals.md).

## Automatización

| ID | Comprobación pendiente | Criterio de aceptación | Hito |
| --- | --- | --- | --- |
| AUTO-001 | Verificador implementado; 001 con 21/21 y 002 con 23/23 IDs completos | test:sdd cruza resultados reales y rechaza pruebas inexistentes/omitidas; modo completo rechaza partial/pending y evidencia RLS obsoleta | Aplicado a 001/002; extender a futuras specs |
| AUTO-002 | Límites de capas implementados en 001/002 | Imports transitivos y DOM directo comprobados; fixtures negativos | Verificado en CI de main; extender a futuras áreas |
| AUTO-003 | RLS real y BD local implementadas | Tres contratos reales A/B/anónimo aprobados, guardas y limpieza verificadas; sin credenciales reales | Verificado en CI de main para 002 |
| AUTO-004 | Tres recorridos Chromium de datos y humo de previews implementados | Resto de escenarios de UI por área; texto fuente no sustituye prueba funcional | 001 verificada localmente; resto incremental hasta M7 |
| AUTO-005 | Entorno local y CI alineados | Node/pnpm fijados; checkout remoto instalado, probado y compilado; jobs obligatorios aprobados | Verificado en main 9a10a54 |

## Registro de seguimiento

Las citas de hallazgos originales corresponden a BASE
`46697650f18043319a7c96ccdf93ebbdf29e2d75`, no a líneas movidas tras refactorizar.
El estado actual de 001 está en verification.md de su spec.

| ID | Hallazgo y reproducción | Aceptación medible | Momento |
| --- | --- | --- | --- |
| ENV-001 | Fallo de pnpm dentro del sandbox; fuera del aislamiento funciona sin reparar estado global | Evidencia y límites registrados en readiness; usar ejecución autorizada para sus scripts | Diagnóstico local registrado |
| ENV-002 | Diferencia inicial Node/pnpm local/CI | Node 24.21.0/pnpm 11.11.0 fijados y verificados en CI | Resuelto; CI de main aprobado |
| DOC-001 | README mencionaba desktop/ ausente | Referencia sustituida por previews existentes; sin declarar código legacy congelado | Resuelto documentalmente |
| TEST-001 | UI y RLS contienen asserts sobre texto, no ejecución completa | Requisitos tocados tienen pruebas de comportamiento suficientes; mantener evidencia estática útil | M7 / AUTO-003/004 |
| PERF-001 | Build inicial avisa chunk index 507,04 kB | Medir coste y decidir presupuesto antes de optimizar; no basta ocultar warning | Survey 006 |
| DATA-001 | Importación aplica setters antes de esperar hidratación; hydratePhotos captura fallos individuales y conserva originales (`src/FitTrack.jsx:814`, `src/photo-storage.js:57`) | Caracterizar secuencia y foto no hidratada; no asumir que falla toda importación por un fallo individual; dueño decide semántica | Clarify 001 |
| DATA-002 | Borrado elimina fotos antes de app_data sin transacción común (`src/FitTrack.jsx:783`) | Caracterizar fallos de cada paso y aprobar política explícita de recuperación | Clarify 001 |
| DATA-003 | Bus global puede sobrescribir error al comenzar otro guardado (`src/data-sync.js:9`, `25`) | En un CHANGE posterior, aprobar política de agregación y escribir regresión determinista antes de corregir | Después de 001; priorizar en cierre M2 |
| DATA-004 | Borrado no inspecciona retorno error de signOut (`src/FitTrack.jsx:792`) | En un CHANGE posterior, decidir resultado visible y probar retorno error separado de rechazo de promesa | Después de 001; priorizar en cierre M2 |
| DATA-005 | Al deshabilitar loaded durante borrado, Settings se desmonta y su mensaje de fallo puede perderse | Reproducir con Storage diferido y rechazo; decidir feedback visible persistente y escribir regresión antes de corregir | Revisión al cierre M2; no se cambia en refactor AS-IS |
| DOC-002 | Contradicciones editoriales sobre KD e idioma | PATCH 1.0.1 e informe creados en rama propia | Integrada mediante PR #2 |
| IDEN-001 | Reporter consume fingerprint/cupo antes de consultar sesión y su getSession carece de timeout propio | Pins preparatorios lo reproducen; conservar AS-IS y decidir cambio separado de FR-013 | Clarify 002 C2-004 |
| PHOTO-001 | Fuente admite 25 MiB; migración Storage limita resultado a 5 MiB sin comprobación local del tamaño comprimido | No prometer aceptación remota por validar origen; decidir si hace falta CHANGE y prueba de frontera del resultado | Survey 002; sin cambio aprobado |

Estos hallazgos no son autorización para corregir comportamiento en fase 0.

## Decisiones pendientes

| ID | Decisión | Recomendación y consecuencia |
| --- | --- | --- |
| D-001 | Idioma nuevo/modificado | Español para documentación/comentarios; conservar identificadores y evitar traducción masiva |
| D-002 | Despliegue real y vínculo de esta copia | Confirmar si main despliega automáticamente; excluir despliegues de esta iniciativa |
| D-003 | Área inicial y calendario | Aprobar 001-datos primero; fechas tentativas ajustables tras su survey |
| D-004 | Legacy | No congelar código todavía; inventariar callers del entrypoint principal y preview antes de clasificar |

La indicación «empecemos» del 2026-10-14 autoriza preparar estos borradores;
no se registra como ratificación de su contenido ni de cambios de dominio.
Posteriormente, «aprobado. Crea las carpetas» ratifica la constitución y el
comienzo por 001-datos, y autoriza crear la estructura de carpetas del roadmap.
D-001: se adopta el español propuesto en la constitución aprobada.
D-002: despliegues excluidos; sigue pendiente verificar el vínculo real con Vercel.
D-003: área 001 aprobada; calendario tentativo, no comprometido.
D-004: se mantiene la decisión de no congelar legacy sin inventario de callers.
El survey y alcance de 001 ya se presentaron y aprobaron posteriormente;
la secuencia histórica no sustituye el [estado vigente](approvals.md).

## Avance de 001 — 2026-10-14

- Rama local `codex/001-datos` creada; producción conserva la revisión base.
- Survey: [datos](datos-survey.md), presentado al propietario con spec.
- Alcance aprobado mediante «aprobado el alcance»; C-001/002/003 resueltas
  preservando comportamiento. Las correcciones de DATA-001/002/003/004
  requieren CHANGE posterior; no se declaran defectos resueltos.
- Checklist de requisitos completado documentalmente; [plan](../../specs/001-datos/plan.md)
  y [research](../../specs/001-datos/research.md) preparados para aprobación.
- Actualización 2026-10-15: tareas/analyze e implementación local autorizados
  mediante «apruebo todo. Cotninua con el trabajo». G-PIN verde antes de extraer;
  E1–E4 y convergencia completadas localmente en `codex/001-datos-code`.
- Actualización 2026-10-15: mejoras de preparación autorizadas y ejecutadas;
  [readiness](readiness.md) recoge versiones, piloto, mutaciones, navegador,
  trazabilidad inicial, instalación limpia y auditoría sobre src en BASE.
  Cierre de implementación: [verification](../../specs/001-datos/verification.md),
  160/160 Node, 3/3 Chromium, build verde y 21/21 IDs completos. CI y merges
  remotos pendientes; no se declara M1/M2 integrado ni se retira KD-001 todavía.

## Avance de 002 — 2026-10-15 a 2026-10-16

- [Survey](identidad-fotos-survey.md), [spec](../../specs/002-identidad-fotos/spec.md),
  plan, tareas y matriz preparados en `codex/002-identidad-fotos`.
- El propietario aprobó alcance y ambos CHANGE de configuración/diagnóstico
  local, y después plan/tasks/revisión y ejecución local el 2026-10-15.
- Pruebas de módulos, UI y sesión preparadas; estado por caso y límites en
  [verification](../../specs/002-identidad-fotos/verification.md).
- El bloqueo inicial de Docker se resolvió; E4 ejecuta RLS real en una instancia
  desechable, sin migraciones productivas nuevas ni acceso a datos reales.
- No se declaran M3 ni KD-003/004/005 cerrados. Las etapas de 001 siguen con
  integración/CI remotos pendientes y no se reescribe su evidencia histórica.
- Pruebas preparatorias guardadas en `a35f7aa`. Plan técnico concretado con
  [research](../../specs/002-identidad-fotos/research.md), casos de validación y
  revisión cruzada, aprobados en `357503d`.
- E1–E3 implementadas (`74de716`, `4a23f37`, `54deef5`): 220/220 Node,
  3/3 Chromium y build verde; once pins intactos. 002 tiene 21/23 IDs completos,
  solo FR-011/US2-AS5 pendientes por RLS. [Converge parcial](../../specs/002-identidad-fotos/converge.md).
- E1–E3 corrigieron localmente KD-004/005; E4 aporta evidencia para KD-003.
  Su retirada requiere enmienda PATCH separada; no se declara M3 integrado.

Actualización E4: `ed077ec`, 226/226 Node, 3/3 RLS reales, 3/3 Chromium y build
verde. 002 alcanza 23/23 IDs completos y 001 conserva 21/21; once pins intactos.
KD-003 también tiene evidencia de corrección local, pendiente de PATCH junto con
KD-004/005. CI configurado en rls-and-sdd-002, sin ejecución remota observada.
[PR preparado](../../specs/002-identidad-fotos/code-pr.md); apertura/fusión por propietario.

## Publicación para integración — checkpoint anterior a las fusiones

PRs remotos #2–#7 publicados en orden constitucional/readiness/001 docs/001
código/002 docs/002 código; enlaces y autorización en [approvals](approvals.md).
CI encontró y permitió corregir dos problemas de reproducibilidad: pin pnpm
contradictorio en la primera rama y maqueta de preview excluida del repositorio.
Se conserva la evidencia histórica anterior. La integración sigue pendiente de
CI verde y de aclarar el despliegue automático de Vercel asociado a main.

## Cierre de integración y siguiente puerta — 2026-10-16

El checkpoint anterior quedó superado por la autorización expresa del despliegue,
las seis fusiones, CI verde de main y la confirmación manual del propietario.
Los detalles y límites están en [approvals](approvals.md). Se prepara la
[PATCH 1.0.2](amendment-1.0.2.md) para retirar únicamente KD-001/003/004/005.
KD-002 y los seguimientos DATA/IDEN/PHOTO siguen abiertos. La propuesta todavía
no cambia la constitución ni aprueba un alcance para 003-entrenamiento.


## Ratificación PATCH 1.0.2 — 2026-10-16

El propietario respondió «adelante» a la propuesta concreta del PR #8 para
ratificar, aplicar e integrar la PATCH. KD-001/003/004/005 se retiran del
registro activo; KD-002 y los seguimientos DATA/IDEN/PHOTO se conservan.
M2/M3 cumplen la puerta normativa con esta ratificación; la integración de
esta entrega documental queda sujeta a CI verde del PR #8. No se aprueba
un nuevo alcance de producto. La autorización incluye el despliegue automático
asociado a esta integración puntual y no establece un permiso permanente.

## Preparación de 003-entrenamiento — 2026-10-16

La PATCH 1.0.2 se integró mediante PR #8 (c7d9e81), después de CI aprobado
sobre su head 845d619. El propietario autorizó después preparar la siguiente
área mediante «adelante»; no se interpreta como aprobación de una spec aún
no presentada. [Survey](entrenamiento-survey.md),
[alcance propuesto](../../specs/003-entrenamiento/spec.md) y checklist preparados.
Once FR AS-IS, diez escenarios y tres aclaraciones propuestas; sin CHANGE ni
implementación. Alcance y plan siguen sujetos a sus puertas independientes.

Hallazgos TRAIN-001/002/003: carga timer sin guarda de cancelación observada por
lectura (carrera pendiente de reproducir), contador guiado por ticks y distinta
semántica de duración al guardar. Se caracterizarán; no hay corrección autorizada.
No se congelan módulos compartidos ni se altera proteína/ciclo/avisos por mover
sus utilidades de entrenamiento. La frontera incluye llamadores inventariados.

## Plan 003 preparado — 2026-10-16

Alcance aprobado mediante «si». Plan, research, validación, 24 tareas y analyze
preparados en specs/003-entrenamiento, con once grupos de pins y tres recorridos
Chromium previstos. El selector existente admite 003; manifiesto inicial con
21 pending y tests vacíos. G-PIN bloquea la extracción hasta verificar original.
Plan/tareas/revisión pendientes de aprobación; sin implementación iniciada.


## Ejecución 003 — 2026-10-17

Baseline b0fec02 y extracciones b69104f, a5412b8, 973ed8b, 6c8d3f8, con
checkpoints completos por entrega. Cierre local: 242 pruebas Node, 6 Chromium,
21/21 contratos de entrenamiento y datos; límites de capas y hashes comprobados.
TRAIN-001 reproducido; TRAIN-002/003 conservados. CI 003 configurado, sin
resultado remoto observado. T025 bloquea G-CLOSE: Docker falla al abrir el socket
de inferencia y no permite renovar RLS. No se corrigen políticas ni se restaura
evidencia invalidada. KD-002 sigue activa para las áreas restantes.


## Verificación local 003 completa — 2026-10-17

T025 resuelta al volver a responder Docker; RLS renovada 3/3 y fixture retirado.
Gate 002 repetido íntegramente: 23/23 contratos. Los tres gates coinciden con
el código actual: 001 21/21, 002 23/23, 003 21/21, 242 Node, 6 Chromium y build
correcto. Converge local sin gaps; 25 tareas completadas y cuerpo de PR preparado.
M4 aún requiere revisión e integración por el propietario; KD-002 sigue activa
para el resto del proyecto. [Resumen final](../../specs/003-entrenamiento/evidence/final.json).


## Preparación de 004 — 2026-10-18

003 integrado en 2a70042 con CI y despliegue aprobados. M4 integrado sin
retirar KD-002 para el resto del proyecto. La comprobación funcional con datos
de producción no se ejecutó; URL individual protegida por login de Vercel.

[Survey](nutricion-objetivos-survey.md) y [alcance propuesto](../../specs/004-nutricion-objetivos/spec.md):
16 AS-IS, 15 escenarios y 31 filas pending. Incluye alimentos/recetas, cantidades,
objetivos, métricas nutricionales y avisos de ritmo; conserva algoritmos de
peso/ciclo de 005 y contratos de 001/002/003. Sin cambios productivos ni pruebas
runtime nuevas. Alcance y tres aclaraciones pendientes antes del plan.

| ID | Observación por lectura en BASE 2a70042 | Tratamiento propuesto |
| --- | --- | --- |
| NUTR-001 | Guardas numéricas distintas; amount > 0 no exige finitud y Biblioteca admite negativos en distintas entradas | Reproducir en E0; preservar AS-IS y reservar corrección para CHANGE |
| NUTR-002 | Ventanas de métricas distintas; algunos filtros no excluyen registros futuros | Caracterizar y no unificar filtros al extraer |
| NUTR-003 | AutoMacros depende del montaje/actualización de Ajustes, también en section datos | Caracterizar timing/cleanup; no trasladar a un efecto global sin CHANGE |

## Alcance 004 aprobado — 2026-10-18

Respuesta explícita «Aprobar alcance y las tres aclaraciones». C-001/002/003
resueltas en la spec; siguiente etapa: plan técnico, tareas y revisión cruzada.
NUTR-001/002/003 se preservan AS-IS, con reproducción pendiente en E0.

## Plan 004 preparado — 2026-10-18

[Plan](../../specs/004-nutricion-objetivos/plan.md), validación, research, 28 tareas
y analyze propuestos. 16 grupos de pins y tres recorridos Chromium; E0 exige
31 contratos completos sobre original antes de E1–E4. No hay código ni pruebas
runtime nuevos. Plan/tareas/revisión y ejecución local pendientes de aprobación.

## Caracterización 004: límite de maqueta — 2026-10-18

El preview principal monta Nutrición; preview/maqueta.jsx conserva un marcador
para esa pestaña y no importa esa pantalla. El pin FR-016 abre ambos y verifica
su conducta actual; no se añade funcionalidad al preview antiguo. Posible mejora
futura de006, fuera de esta extracción AS-IS.
