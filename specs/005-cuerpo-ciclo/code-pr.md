# PR de código preparado — 005

Estado: verificado localmente; publicación, integración y despliegue pendientes de autorización.
Rama: codex/005-cuerpo-ciclo. Base prevista: main tras integrar documentación aprobada.

Título: Separar cuerpo, ciclo y métricas de peso con contratos SDD 005

## Problema y resultado

Cuerpo y Métricas mezclaban formularios, transformaciones de registros e inferencias.
Se separan nueve módulos puros para contexto/fase/resumen/lecturas, registros y
métricas de cuerpo/peso. Las pantallas conservan resultados, formatos, efectos,
fechas y firmas públicas. La confianza y los desconocidos del ciclo permanecen visibles.

Por ejemplo, guardar dos pesos en una fecha sigue reemplazándolos por uno; un
borrador de bienestar sigue recargándose solo al cambiar de fecha. No se unifican
ventanas ni proyecciones que ya daban resultados diferentes. BODY-001–005 se preservan.

## Validación

- Baseline sobre original antes de src; cuatro mutaciones detectadas con controles originales.
- Cierre: 286 pruebas Node, 13 Chromium, build y tres contratos RLS reales con limpieza.
- Cinco manifiestos completos: 21/23/21/31/40 IDs; 136 en total, mismo sourceHash.
- 68 archivos congelados intactos; exports originales y negativos de arquitectura transitiva.
- Una prueba no congelada de rutas pasó de inspeccionar ubicación a comprobar salidas;
  la misma aserción pasó también sobre original. Checkpoint E5 repetido íntegramente.
- CI añade gate/artifacts005; src LF fijado para reproducir anclas en Windows/Linux.

Comandos: pnpm run test:sdd:complete --spec=005-cuerpo-ciclo; pnpm test:rls
con CLI local 2.121.0 y guardas; pnpm run build. Sin dependencias ni SQL nuevos.
[Evidencia](evidence/final.json), [RLS](evidence/rls-final.json),
[converge](converge.md), [llamadores](callers.md).

## Orden y reversión

Preparar/integrar primero el [PR documental](doc-pr.md) desde e949c08, revisión
aprobada anterior a E0; después este PR de código. La ejecución local previa a
ese merge fue autorizada expresamente. El propietario decide publicación y
fusiones; Vercel despliega main, por lo que se requiere autorización asociada.
Revertir entregas E5→E1 restaura código sin migraciones de datos; los checkpoints
permiten localizar cada entrega. El baseline E0 permite verificar la vuelta al original.

## Límites para revisión

CI remoto aún no ejecutado; sin despliegue005 ni prueba con datos reales.
Sin instalación limpia/auditoría nuevas porque el lockfile no cambió. Se conserva
el aviso de chunk>500kB. No hay ratificación clínica ni retirada global de KD-002.
Aceptación final del propietario pendiente.
