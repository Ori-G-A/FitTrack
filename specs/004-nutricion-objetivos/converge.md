# Converge — 004-nutricion-objetivos

Fecha: 2026-10-18. Estado: REVISIÓN PRELIMINAR; G-CLOSE bloqueado por RLS.
[Spec](spec.md), [plan](plan.md), [tareas](tasks.md), [verificación](verification.md).

## Resultado comprobado

E0 fijó comportamiento sobre BASE antes de src. E1 catálogo/proteína, E2
alimentos/recetas, E3 objetivos/acciones y E4 métricas están verificadas por
entrega. Se conservan fachadas, formatos, ID dentro del updater, deduplicación
desde snapshot, efecto autoMacros en Ajustes y callbacks de inferencia tras
guardas. Ventanas desiguales y NUTR-001/002/003 reproducidos y preservados.

[Checkpoint E5](evidence/e5.json): 263 pruebas Node, 9 Chromium, 31/31 contratos de 004,
ocho módulos puros y 40 hashes congelados intactos (18 propios,22 anteriores).
Build correcto, con aviso heredado de chunk>500kB. Arquitectura incluye negativos
React/DOM/Supabase/ciclo y prueba de momento de inferencia. CI de 004 añadido sin
retirar gates anteriores; no hay ejecución remota observada.

[Regresiones](evidence/regressions.json):001 y 003: 21/21 cada una sobre los mismos
resultados TAP/Chromium y hash de código. No se repitió innecesariamente esa
colección para evaluar los manifiestos con el verificador original.

## Gap abierto

GAP-001 / T029 / FR-016, US3-AS6: el motor local no arranca. Docker Desktop
registra acceso denegado al socket dockerInference; dockerDesktopLinuxEngine
no existe. Inicio oculto y CLI oficial no resolvieron el fallo. No se modificó
configuración global, permisos, bases de Docker ni datos del proyecto.

El runner RLS 2.121.0 se ejecutó con las guardas existentes; falló al inspeccionar
el fixture antes de ejecutar contratos. [Resultado actual](evidence/rls-local.json):
passed=false, cleanupPassed=false, cero resultados. No se reutiliza evidencia
002 antigua ni se afirma que sus 23 IDs estén completos en esta revisión.

Se conserva el directorio propio indicado en el resultado RLS para recuperación.
Cuando el motor esté disponible, verificar ruta temporal/propietario/nonce,
retirar solo ese proyecto con el CLI y sus guardas, y comprobar ausencia del
fixture. Después ejecutar pnpm test:rls y repetir íntegro gate 002 con el mismo
código, renovación RLS y cleanup correctos. T026/T027/T028 siguen pendientes.
La consulta al propietario solicita disponibilidad de motor local, no una nueva
aprobación del plan ya autorizado.

## Revisión de alcance y límites

Sin cambios de SQL, dependencias productivas, inferencia de peso/ciclo ni
corrección de NUTR. preview/maqueta conserva el marcador existente; el principal
monta Nutrición. La prueba textual heredada FR-014 se adapta a llamada+operación
extraída, sin alterar los pins congelados. El traslado incompleto inicial de
recipeTotals se corrigió y se repitió su checkpoint íntegro antes del commit E2.
El nombre local window de goals-model se aclaró a recentPoints para distinguirlo
del global del navegador, y se repitieron arquitectura y checkpoint final.

KD-002 no se retira globalmente. Sin gaps de código identificados en esta revisión;
la verificación global y aceptación final siguen bloqueadas por GAP-001. No se
publicó PR, integró ni desplegó004. El [borrador de revisión](code-pr.md) no es
un PR de código listo para integrar.
