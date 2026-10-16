# Roadmap de adopción SDD

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
No se ha declarado ningún hito completado. Commits y aprobaciones vigentes:
[registro](approvals.md). No hay PRs publicados ni merges realizados.

## Automatización

| ID | Comprobación pendiente | Criterio de aceptación | Hito |
| --- | --- | --- | --- |
| AUTO-001 | Verificador implementado; 001 con 21/21 y 002 con 23/23 IDs completos | test:sdd cruza resultados reales y rechaza pruebas inexistentes/omitidas; modo completo rechaza partial/pending y evidencia RLS obsoleta | Aplicado a 001/002; extender a futuras specs |
| AUTO-002 | Límites de capas implementados en 001 | Imports transitivos y DOM directo comprobados; fixtures negativos y tres módulos de datos | Completo local para 001; CI remoto pendiente |
| AUTO-003 | RLS real y BD local implementadas | Tres contratos reales A/B/anónimo aprobados, guardas y limpieza verificadas; CI configurado sin credenciales reales | Completo local 002; CI remoto pendiente |
| AUTO-004 | Tres recorridos Chromium de datos y humo de previews implementados | Resto de escenarios de UI por área; texto fuente no sustituye prueba funcional | 001 verificada localmente; resto incremental hasta M7 |
| AUTO-005 | Entorno local alineado y CI configurado; ejecución remota pendiente | Node/pnpm fijados y copia limpia comprobada; observar jobs obligatorios del commit revisado antes de declarar CI verde | M1 |

## Registro de seguimiento

Las citas de hallazgos originales corresponden a BASE
`46697650f18043319a7c96ccdf93ebbdf29e2d75`, no a líneas movidas tras refactorizar.
El estado actual de 001 está en verification.md de su spec.

| ID | Hallazgo y reproducción | Aceptación medible | Momento |
| --- | --- | --- | --- |
| ENV-001 | Fallo de pnpm dentro del sandbox; fuera del aislamiento funciona sin reparar estado global | Evidencia y límites registrados en readiness; usar ejecución autorizada para sus scripts | Diagnóstico local registrado |
| ENV-002 | Diferencia inicial Node/pnpm local/CI | Node 24.21.0/pnpm 11.11.0 fijados y verificados; CI remoto sigue pendiente | Local resuelto; AUTO-005 pendiente remoto |
| DOC-001 | README mencionaba desktop/ ausente | Referencia sustituida por previews existentes; sin declarar código legacy congelado | Resuelto documentalmente |
| TEST-001 | UI y RLS contienen asserts sobre texto, no ejecución completa | Requisitos tocados tienen pruebas de comportamiento suficientes; mantener evidencia estática útil | M7 / AUTO-003/004 |
| PERF-001 | Build inicial avisa chunk index 507,04 kB | Medir coste y decidir presupuesto antes de optimizar; no basta ocultar warning | Survey 006 |
| DATA-001 | Importación aplica setters antes de esperar hidratación; hydratePhotos captura fallos individuales y conserva originales (`src/FitTrack.jsx:814`, `src/photo-storage.js:57`) | Caracterizar secuencia y foto no hidratada; no asumir que falla toda importación por un fallo individual; dueño decide semántica | Clarify 001 |
| DATA-002 | Borrado elimina fotos antes de app_data sin transacción común (`src/FitTrack.jsx:783`) | Caracterizar fallos de cada paso y aprobar política explícita de recuperación | Clarify 001 |
| DATA-003 | Bus global puede sobrescribir error al comenzar otro guardado (`src/data-sync.js:9`, `25`) | En un CHANGE posterior, aprobar política de agregación y escribir regresión determinista antes de corregir | Después de 001; priorizar en cierre M2 |
| DATA-004 | Borrado no inspecciona retorno error de signOut (`src/FitTrack.jsx:792`) | En un CHANGE posterior, decidir resultado visible y probar retorno error separado de rechazo de promesa | Después de 001; priorizar en cierre M2 |
| DATA-005 | Al deshabilitar loaded durante borrado, Settings se desmonta y su mensaje de fallo puede perderse | Reproducir con Storage diferido y rechazo; decidir feedback visible persistente y escribir regresión antes de corregir | Revisión al cierre M2; no se cambia en refactor AS-IS |
| DOC-002 | Contradicciones editoriales sobre KD e idioma | PATCH 1.0.1 e informe creados en rama propia; integración por el propietario pendiente | Corrección local registrada; merge pendiente |
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

## Publicación para integración — 2026-10-16

PRs remotos #2–#7 publicados en orden constitucional/readiness/001 docs/001
código/002 docs/002 código; enlaces y autorización en [approvals](approvals.md).
CI encontró y permitió corregir dos problemas de reproducibilidad: pin pnpm
contradictorio en la primera rama y maqueta de preview excluida del repositorio.
Se conserva la evidencia histórica anterior. La integración sigue pendiente de
CI verde y de aclarar el despliegue automático de Vercel asociado a main.
