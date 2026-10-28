Estado vigente — 2026-10-28 (Bogotá): 001–010 integradas; 010 en `e427682`, con CI de PR/main y Production verificados. Diez contratos/274 IDs, 379 Node, 43 Chromium, diecinueve mutaciones y RLS local real con limpieza. [Entrega 010](../../specs/010-entradas-cuerpo/evidence/integration.json). Los registros siguientes conservan el historial.

# Roadmap de adopción SDD

Estado vigente — 2026-10-27 (Bogotá): 001–009 integradas; 009 en `392e797`,
con CI de PR/main y Production verificados. Nueve contratos/250 IDs completos,
372 Node, 35 Chromium, catorce mutaciones y RLS local real con limpieza.
[Entrega 009](../../specs/009-reloj-pruebas/evidence/integration.json).
Los registros siguientes conservan el historial y sus límites.


Estado vigente — 2026-10-27 (Bogotá): 001–008 integradas; 008 en `1f6b29d`,
con CI de PR/main y Vercel Production verificados. Ocho contratos/234 IDs,
370 Node, RLS local real con limpieza y once mutaciones aprobados.
[Entrega 008](../../specs/008-borrado-fiable/evidence/integration.json).
Los registros siguientes conservan la cronología y sus límites.


Cierre local 008 — 2026-10-24 (Bogotá): 370 Node, 30 Chromium y build; ocho contratos/234 IDs completos; RLS real fresco (tres contratos) y limpieza confirmados; once mutaciones detectadas. 107 firmas anteriores intactas, una enmendada y ocho E0 intactas.
T037/T038 aditivas completadas, incluido rechazo falsy con rojo/verde.
[Converge 008](../../specs/008-borrado-fiable/converge.md). Publicación, integración
y Vercel pendientes de autorización específica; los avances parciales se conservan como historia.

Estado actual, 2026-10-22 (Bogotá): 001–007 integradas; 007 en `0617764`, con
CI de PR/main y Vercel Production verificados. Siete contratos/205 IDs,
325 Node, 29 Chromium, RLS real desechable y mutaciones aprobados.
[Cierre 007](../../specs/007-guardado-fiable/evidence/integration.json).
008 [borrado fiable](../../specs/008-borrado-fiable/spec.md) tiene alcance y
C-001/002/003 aprobados; [plan técnico](../../specs/008-borrado-fiable/plan.md),
36 tareas y análisis aprobados por separado; ejecución local E0–E3 autorizada,
sin autorización de publicar, fusionar ni desplegar 008.

Avance local 008, 2026-10-24: E0–E2 conservadas en `2603ee1`, `a573010` y
`dd95ae3`; 355 Node/30 Chromium/build en E2, 29 IDs propios completos.
Cinco mutaciones y dos casos suplementarios aprobados. E3 sigue abierto por
RLS fresco y checkpoint final; Docker no responde tras iniciarlo.
[Registro local](../../specs/008-borrado-fiable/verification.md).

Actualización del mismo candidato: perfil local E3 con 358 Node, 30 Chromium,
build y siete contratos/211 IDs verdes; once mutaciones nuevas/heredadas detectadas.
RLS terminó fallido, sin limpieza confirmada. Se conserva el fixture propio para
recuperación; E3 no está cerrada y no hay autorización remota de 008.

Estado histórico, 2026-10-20 (Bogotá): 001–006 integradas; PATCH 1.0.3 ratificada
y aplicada. La integración documental y sus verificaciones se registran en el
[PR #15](https://github.com/Ori-G-A/FitTrack/pull/15), con CI verde como requisito.
006 integrada mediante PRs [#13](https://github.com/Ori-G-A/FitTrack/pull/13) y
[#14](https://github.com/Ori-G-A/FitTrack/pull/14), con CI de PR/main y
Vercel Production aprobados sobre `492be5d`. Cierre: 314 Node, 27 Chromium,
tres RLS reales con limpieza, tres mutaciones detectadas y seis contratos con
184 IDs completos. 101 firmas verificadas, con PIN-006-001/002 explícitas.
[Evidencia remota](../../specs/006-interfaz/evidence/integration.json).
M7 cumple la puerta normativa con la [PATCH 1.0.3](amendment-1.0.3.md);
KD-002 retirada por ratificación expresa. [Guía de continuidad](continuity.md) preparada.
Sin prueba funcional autenticada en producción; hallazgos preservados sin cambios.
Los registros siguientes conservan el historial.


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
Los hallazgos DATA-006/007/008 usan BASE `0617764` y sus reproducciones sintéticas
están en el [survey 008](borrado-fiable-survey.md), sin acreditar incidentes reales.

| ID | Hallazgo y reproducción | Aceptación medible | Momento |
| --- | --- | --- | --- |
| ENV-001 | Fallo de pnpm dentro del sandbox; fuera del aislamiento funciona sin reparar estado global | Evidencia y límites registrados en readiness; usar ejecución autorizada para sus scripts | Diagnóstico local registrado |
| ENV-002 | Diferencia inicial Node/pnpm local/CI | Node 24.21.0/pnpm 11.11.0 fijados y verificados en CI | Resuelto; CI de main aprobado |
| DOC-001 | README mencionaba desktop/ ausente | Referencia sustituida por previews existentes; sin declarar código legacy congelado | Resuelto documentalmente |
| TEST-001 | UI y RLS contienen asserts sobre texto, no ejecución completa | Requisitos tocados tienen pruebas de comportamiento suficientes; mantener evidencia estática útil | Cobertura 001–006 verificada al cerrar M7/PATCH 1.0.3; conservar las comprobaciones estáticas complementarias |
| PERF-001 | Build inicial avisa chunk index 507,04 kB | Medir coste y decidir presupuesto antes de optimizar; no basta ocultar warning | Survey 006 |
| DATA-001 | Importación aplica setters antes de esperar hidratación; hydratePhotos captura fallos individuales y conserva originales (`src/FitTrack.jsx:814`, `src/photo-storage.js:57`) | Caracterizar secuencia y foto no hidratada; no asumir que falla toda importación por un fallo individual; dueño decide semántica | Clarify 001 |
| DATA-002 | Borrado elimina fotos antes de app_data sin transacción común (`src/FitTrack.jsx:783`) | Caracterizar fallos de cada paso y aprobar política explícita de recuperación | Clarify 001 |
| DATA-003 | Bus global podía sobrescribir error al comenzar otro guardado; reproducción histórica en 007 | 007 integrada en main con CI verde y Production verificados; regresiones originales y recuperación por usuario:clave conservadas | Cerrado por 007 en 0617764; evidencia de integración disponible |
| DATA-004 | Borrado no inspecciona retorno error de signOut (`src/FitTrack.jsx:792`) | 008 FR-005/010: inspeccionar retorno y rechazo; cierre manual sin repetir borrado | Cerrado por 008 en 1f6b29d; CI y Production verificados |
| DATA-005 | Al deshabilitar loaded durante borrado, Settings se desmonta y su mensaje de fallo puede perderse | 008 FR-006/012: feedback persistente en raíz, visible y accesible | Cerrado por 008 en 1f6b29d; CI y Production verificados |
| DATA-006 | Tras DELETE confirmado, rechazo de signOut restaura loaded; el diagnóstico reemite doce guardados con valores anteriores | 008 FR-008/010: bloqueo continuo, sin reemitir valores anteriores | Cerrado por 008 en 1f6b29d; CI y Production verificados |
| DATA-007 | Resultado tardío de borrado A habilita carga de B o despacha signOut sobre B; dos reproducciones del survey | 008 FR-011: sesión/generación e invalidez de resultados tardíos | Cerrado por 008 en 1f6b29d; CI y Production verificados |
| DATA-008 | Visibilidad durante borrado vuelve a cargar y reanuda guardados; el intervalo comparte callback por inspección | 008 FR-008/009: bloquear recuperación ordinaria y confirmar commit de recarga manual | Cerrado por 008 en 1f6b29d; CI y Production verificados |
| DOC-002 | Contradicciones editoriales sobre KD e idioma | PATCH 1.0.1 e informe creados en rama propia | Integrada mediante PR #2 |
| IDEN-001 | Reporter consume fingerprint/cupo antes de consultar sesión y su getSession carece de timeout propio | Pins preparatorios lo reproducen; conservar AS-IS y decidir cambio separado de FR-013 | Clarify 002 C2-004 |
| PHOTO-001 | Fuente admite 25 MiB; migración Storage limita resultado a 5 MiB sin comprobación local del tamaño comprimido | No prometer aceptación remota por validar origen; decidir si hace falta CHANGE y prueba de frontera del resultado | Survey 002; sin cambio aprobado |
| TEST-002 | Carrera al instalar el reloj y pausarlo en el mismo instante; nombrada TEST-001 en el registro histórico de 007/008 | 009: preparación determinista, tiempos y oráculos conservados; alcance y plan ejecutados y verificados | Cerrado por 009 en 392e797; CI de main y Production verificados |

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

## Implementación local 004 — 2026-10-18

E1–E4 verificadas por entrega; checkpoint actual: 263 Node, 9 Chromium, 31/31 IDs de 004,
40 hashes congelados y build correcto. CI de 004 añadido; sin CI remoto observado.
001/003: 21/21 sobre los mismos resultados; 002/G-CLOSE bloqueados por Docker:
acceso al socket dockerInference denegado. Intento RLS actual fallido, cleanup
sin confirmar y fixture propio conservado para recuperación. T029 añadida;
[converge](../../specs/004-nutricion-objetivos/converge.md). No hay integración de 004.

## Verificación local 004 completa — 2026-10-18

T029 resuelta al volver a responder Docker. Fixture anterior retirado con
guardas y nuevo RLS 3/3, cleanup confirmado. Gate002 repetido íntegramente;
263 Node, 9 Chromium, build y contratos 001/002/003/004 completos sobre el mismo
hash. 29 tareas completadas, sin gaps locales.
[Converge](../../specs/004-nutricion-objetivos/converge.md),
[PR preparado](../../specs/004-nutricion-objetivos/code-pr.md).
M5 sigue pendiente de revisión e integración; KD-002 continúa para áreas restantes.


## Preparación 005 — 2026-10-18

M5 integrado y verificado remotamente. M6 comienza con
[survey de cuerpo/ciclo](cuerpo-ciclo-survey.md) y
[propuesta de alcance](../../specs/005-cuerpo-ciclo/spec.md): 20 FR y 20 escenarios.
BODY-001/002/003/004/005 registran diferencias numéricas, hidratación de borrador,
visibilidad, claves de avisos y ventanas/duplicados; son observaciones por lectura,
pendientes de reproducción, con revisión propuesta en M6. No se corrigen dentro
de una extracción sin CHANGE aprobado. Alcance y C-001/002/003 pendientes.

## Planificación 005 — 2026-10-18

Alcance y C-001/002/003 aprobados mediante «continua» en respuesta a su solicitud
explícita. [Plan técnico](../../specs/005-cuerpo-ciclo/plan.md), 33 tareas y analyze
preparados: 20 grupos de pins, cuatro recorridos Chromium y extracciones por
entregas con baseline bloqueante. Plan y autorización de ejecución local pendientes;
src, SQL, dependencias y CI intactos. Los registros anteriores conservan historia.

### Hallazgo de interfaz durante E0 de 005

UI-005-001: el input de peso está dentro de un label con botones intermedios;
Chromium no lo resuelve por «Peso en kg». Observado funcionalmente en un
selector de prueba fallido; se usa un selector de control existente para 005.
Revisar asociación accesible de formularios en 006; no corregirla silenciosamente
durante la refactorización AS-IS.

ENV-005-002: checkout de main con CRLF rompe anclas LF del harness congelado de
004; se reprodujeron 13 fallos de instrumentación sin cambios semánticos de src.
Se restauraron finales LF del código original, con diff de Git vacío; se repite
la suite completa antes de baseline. No se editan pins congelados ni configuración
global de Git. Los hashes de evidencia se recalculan sobre los bytes efectivos.

Resolución de ENV-005-002: regla versionada src/** text eol=lf en .gitattributes,
conservando contenido de blobs y pins. Evita repetir la reparación en futuros
checkouts; suite completa repetida antes de declarar el cierre de E0.

## Cierre local 005 — 2026-10-19

E0–E6 verificadas, 34 tareas completas y nueve módulos puros. BODY-001–005
reproducidos/preservados; T034 precisa FR-016 según parámetro y aritmética
existentes, sin CHANGE. UI-005-001 se mantiene para006; KD-002 sigue global.
ENV-005-002 resuelto con LF; Docker recuperado por CLI y RLS fresco3/3 con
fixture retirado. [PRs preparados](../../specs/005-cuerpo-ciclo/code-pr.md).
No se declara M6 integrado hasta aceptación/publicación/CI remoto/fusión.

## Integración 005 en curso — 2026-10-19

Publicación, fusiones con CI verde y despliegue automático autorizados expresamente.
[PR documental #11](https://github.com/Ori-G-A/FitTrack/pull/11) publicado desde
la revisión aprobada e949c08. Después se publica el PR de código con el cierre local.
M6 integrado se declarará únicamente tras verificar CI y fusión del código.

## Diagnóstico y propuesta 006 — 2026-10-19

M6 integrado con evidencia remota de 005. [Survey de interfaz](interfaz-survey.md)
y [spec 006](../../specs/006-interfaz/spec.md) preparados como borradores:
21 requisitos AS-IS, dos CHANGE propuestos y 23 escenarios (46 IDs pending).
La exploración sintética Chromium a 390/1280 reproduce falta de foco/Escape y
role en Registrar, y falta del nombre accesible esperado del input de peso.
FR-021 propone teclado/foco para Registrar/DetailSheet; FR-022 nombres accesibles
para peso/correo/contraseña. Alcance y C-001/002/003 pendientes; sin plan ni src.

UI-006-003: script inicial interpreta tema inválido distinto de React; lectura,
pendiente de pin. UI-006-004: reduced-motion parcial; no prometer cobertura global.
UI-006-005: Cuenta inicializa selección una vez; conservar hasta CHANGE separado.
Revisar al cierre M7 junto con BODY-001–005 y barreras accesibles adicionales.
PERF-001: medir baseline/final; no hay objetivo de optimización aprobado.
KD-002 requiere mapear las 21 regresiones textuales y pruebas funcionales por
cada afirmación de interacción/visual; retirada solo mediante PATCH ratificada.

UI-006-006: búsqueda del nodo de Métricas antes del siguiente render de filtro;
retorno temprano si falta, observado por lectura. FR-008 lo caracteriza; revisión
M7 sin corrección implícita. FR-023 incorpora descarte general de avisos y
deshacer a siete días, distinto del aviso de ritmo 004.

## Alcance 006 aprobado — 2026-10-19

21 AS-IS, dos CHANGE y 23 escenarios aprobados junto con C-001/002/003.
Se prepara el plan técnico; implementación, publicación y despliegue pendientes.

## Planificación 006 — 2026-10-19

Alcance y C-001/002/003 aprobados explícitamente. [Plan](../../specs/006-interfaz/plan.md),
39 tareas y analyze preparados para aprobación separada. G-PIN exige 42 AS-IS
completos y cuatro CHANGE pending con cinco rojos específicos; cierre con
182 IDs completos y RLS fresco. Estado de implementación: no iniciada.
KD-002 sigue activa; retirada normativa requiere informe y ratificación propios.

UI-006-007 — 2026-10-20: App consume focusCard y cleanup cancela el timer,
conservando la clase de resaltado; instancia aislada la retira a 2200 ms.
Reproducido durante E0 sobre BASE86299a4. El propietario eligió «Proponer un
CHANGE separado para corregir el resaltado». [Propuesta](../../specs/006-interfaz/change-card-highlight.md)
FR-024/US1-AS9 con cuatro tareas adicionales; ambas aprobaciones pendientes.
No se cambia el producto ni se declara G-PIN verde para ocultar la discrepancia.

2026-10-20: FR-024 y precisión de FR-008 aprobados explícitamente. Se actualiza
la spec a 48 IDs; extensión del plan T040–T043 pendiente de segunda decisión.
La aserción temporal fallida se conserva como CHANGE rojo independiente, sin
modificar src ni borrar el fallo original de evidencia E0.

## Estado vigente — 2026-10-20

Extensión T040–T043 aprobada en3d542bc. G-PIN006 superado sobre original:42 AS-IS completos, seis CHANGE pendientes,309 Node/20 Chromium verdes y siete rojos específicos. [Baseline](../../specs/006-interfaz/evidence/baseline.json). E1–E6 locales habilitadas. KD-002 permanece activa; publicación, integración y despliegue006 pendientes de autorización específica.

## Cierre local006 — 2026-10-20

E0–E6 completas:314 Node/27 Chromium,184 IDs en seis contratos, RLS real fresco con cleanup y tres negativos postverde detectados.68 pins anteriores intactos;33 firmas006 con enmienda técnica PIN-006-001. [Evidencia](../../specs/006-interfaz/evidence/final.json) y [PR preparado](../../specs/006-interfaz/code-pr.md). Publicación/CI remoto/integración/Vercel pendientes de autorización específica. KD-002 sigue activa hasta ratificación propia.

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

## Preparación 007 — 2026-10-21 (Bogotá)

La PATCH 1.0.3 se integró mediante PR #15 en `4eee59d`, con CI de PR/main y
Production aprobados. La adopción 001–006 y M7 están cerrados; KD-002 retirada
por ratificación. Se conservan los hallazgos pendientes de producto.

Se prioriza DATA-003 para la propuesta [007 guardado fiable](../../specs/007-guardado-fiable/spec.md).
[Survey](guardado-fiable-survey.md): diagnóstico sintético reproduce que A
falla y el éxito posterior de B/C termina publicando saved. Node global v26.5.0;
no equivale a baseline contractual con Node 24.21.0. Alcance propuesto: cuatro
AS-IS y cinco CHANGE, 12 escenarios, retención de error por usuario:clave,
recuperación del mismo par, aislamiento por sesión y estado visible/accesible.
Alcance y C-001/002/003 pendientes. DATA-004/005 se revisarán por separado.
No hay cambios de runtime, contratos anteriores ni pins, ni plan aprobado.

## Alcance 007 aprobado — 2026-10-21

Respuesta expresa «Aprobar alcance y las tres aclaraciones» a la propuesta
de cuatro AS-IS, cinco CHANGE y doce escenarios. C-001/002/003 aprobadas:
error retenido por usuario:clave, recuperación solo del mismo par, estado
aislado por sesión y perceptible al montar en móvil/escritorio. Se prepara
plan, tareas y análisis; sin implementación ni publicación autorizadas.

## Planificación 007 preparada — 2026-10-21

[Plan](../../specs/007-guardado-fiable/plan.md), 24 tareas E0–E3,
validación y análisis preparados para aprobación separada. G-PIN exige
siete IDs AS-IS completos y catorce CHANGE pending con seis rojos específicos;
E1 prevé tres CHANGE verdes y tres UI todavía rojos; cierre con 21 IDs de 007,
205 en siete contratos y RLS local fresco. Se proponen PIN-007-001/002 para
dos expectativas heredadas contradictorias, sin modificar otros 99 pins.
No hay código modificado ni aprobación del plan. Ejecución local previa al
PR documental, publicación, integración y Vercel no se infieren del alcance.

## Hallazgo de estabilidad durante 007 — TEST-001

Nota de seguimiento 2026-10-27: este título conserva el identificador usado en
007/008. La propuesta 009 plantea TEST-002 para la carrera de reloj, distinta
de la cobertura estática TEST-001 de la tabla. C-003 aprobada el 2026-10-27 establece la equivalencia con TEST-002;
no se reescriben los registros originales.

`test-support/interface-browser.js` instala el reloj y llama pauseAt con la misma
fecha en dos acciones separadas. El tercer checkpoint E2 registró «Cannot
fast-forward to the past» antes de montar App y un segundo montaje agotó su
espera. Se conserva el [reporte de fallos](../../specs/007-guardado-fiable/evidence/e2-failures.json).
Una repetición verde no demuestra que esta preparación sea inmune a demoras del
host. Revisar el arranque determinista del reloj en una tarea técnica con prueba
sobre el original, conservando los plazos medidos desde la petición y las firmas.
No atribuir este error de preparación a la semántica de guardado ni ocultarlo
mediante retries de Playwright.

## Cierre local 007 — 2026-10-21 (Bogotá)

E0–E3 completadas localmente: 325 Node y 29 Chromium, sin skips/retries; build aprobado, siete contratos y 205 IDs completos sobre el mismo sourceHash. RLS local fresco: tres contratos reales y limpieza confirmada. Tres mutaciones detectadas con cuatro controles positivos. 97 de 101 archivos anteriores intactos, cuatro archivos con cinco enmiendas explícitas; seis archivos E0 intactos y prueba suplementaria de cambio de cuenta con rojo original/verde candidato.
[Evidencia](../../specs/007-guardado-fiable/verification.md).
La autorización local del plan está cumplida; publicación, integración y Vercel
siguen pendientes de decisión específica. DATA-004/005 y producción quedan fuera.

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

## Propuesta 009 — 2026-10-27 (Bogotá)

Tras cerrar 008 se propone reforzar la preparación del reloj de pruebas.
[Survey](reloj-pruebas-survey.md) y [spec 009](../../specs/009-reloj-pruebas/spec.md):
tres AS-IS, cuatro CHANGE, nueve escenarios/dieciséis IDs pending. El sondeo
actual reproduce con demora sintética de 250 ms el fallo anterior al montaje
en interfaz, guardado y borrado, preservando src y las tres firmas originales.
No equivale a G-PIN ni mide frecuencia natural. Alcance y C-001/002/003
pendientes de aprobación; sin plan, implementación, publicación ni despliegue
autorizados para 009. La URL técnica de Production 008 sigue sin poder
resolverse o alcanzarse desde este entorno; el estado success del proveedor
no se convierte en prueba funcional autenticada.

## Alcance 009 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar alcance y las tres aclaraciones». Aprueba
los tres AS-IS, cuatro CHANGE, nueve escenarios y C-001/002/003 de
[009](../../specs/009-reloj-pruebas/spec.md). TEST-002 identifica la carrera de
reloj; las referencias antiguas TEST-001 se conservan como historia. Se permite
preparar plan/tareas/análisis, no implementar ni publicar/integrar/Vercel.

## Planificación 009 preparada — 2026-10-27 (Bogotá)

[Plan](../../specs/009-reloj-pruebas/plan.md), 26 tareas E0–E2 y revisión
preparados, sin aprobación ni cambios de fixtures. Se proponen tres enmiendas
técnicas, composición de verificadores, actualización explícita del contador
de integridad y huella del conjunto de pruebas además de src. La viabilidad
de API se comprobó con 0/250/1500 ms solo en página vacía.
La [precisión SC-001](../../specs/009-reloj-pruebas/precision-sc-001.md)
requiere aceptación: rojo de carrera FR-004/005 y controles/evidencia de
FR-006/007 sin simular defectos cuando el original ya cumple una garantía.
Cierre previsto: nueve contratos/250 IDs, catorce mutaciones y RLS fresco.
Plan, precisión y ejecución local pendientes; sin publicación ni despliegue.

## Plan 009 aprobado — 2026-10-27 (Bogotá)

El propietario respondió «Aprobar plan y precisión SC-001; autorizar ejecución local E0–E2». Aprueba las 26 tareas, plan, análisis y precisión SC-001: rojo específico de carrera FR-004/005, preservación de controles de error FR-006 y evidencia completa FR-007 sin inventar defectos previos. Autoriza E0–E2 local antes del PR documental; no publicar, fusionar ni desplegar 009.

## Cierre local 009 — 2026-10-27 (Bogotá)

372 Node, 35 Chromium/build, nueve contratos/250 IDs completos, catorce mutaciones con quince controles positivos, nueve negativos de recibos y RLS real fresco con limpieza. 113 firmas anteriores intactas, tres enmiendas canónicas y siete E0 propios intactos. Plan local autorizado cumplido; 27 tareas (T027 aditiva) y dos PRs preparados. [Verificación](../../specs/009-reloj-pruebas/verification.md). Publicación, integración y Vercel requieren decisión específica; no se certifica producción ni toda inestabilidad.

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

Se propone corregir BODY-001 en los nueve campos numéricos de Cuerpo.
[Survey](entradas-cuerpo-survey.md) y [spec](../../specs/010-entradas-cuerpo/spec.md):
cuatro AS-IS, seis CHANGE y catorce escenarios/24 IDs pending. Nueve casos
sintéticos reproducidos y tres caracterizaciones originales aprobadas; src,
instrumental y firmas existentes intactos. La propuesta exige decimal explícito,
positivos para peso/medidas/pulso, cero conocido para sueño/pasos y rechazo
completo con error accesible. No limpia historia ni cambia fórmulas.

BODY-001 sigue abierto. Alcance y C-001/002/003 pendientes; sin plan ni ejecución
productiva o entrega remota autorizados. PHOTO-001 y BODY-002–005 permanecen
fuera. El plan deberá proponer las enmiendas precisas de 005 y del verificador
009 para conservar evidencia histórica sin relajar las firmas.

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
