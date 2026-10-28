Estado vigente — 2026-10-28 (Bogotá): publicación de ambas ramas/PRs, integración con CI remoto verde y Vercel autorizadas. [Decisión](evidence/remote-authorization.json). Pendiente ejecutar y verificar la entrega; las esperas de autorización anteriores son históricas.

# PR documental 010 — preparado, sin publicar

Título propuesto: `docs(sdd): especificar y planificar entradas válidas de Cuerpo (010)`.

## Cuerpo propuesto

Especifica la validación de los nueve campos numéricos de Cuerpo y el rechazo completo con error accesible, conservando historia y fórmulas. Incluye las aclaraciones de decimales, signo/cero y límites del alcance, aprobadas expresamente.

El snapshot c8be7bd contiene el plan original de 31 tareas E0–E2, matriz de pruebas, seis enmiendas propuestas y revisión. El propietario autorizó ejecución local antes de integrar este PR; las tareas aditivas y su evidencia van en el PR de código. La documentación heredada también registra el cierre remoto verificado de 009.

Este PR no contiene implementación ni se usa su CI como prueba de cambios todavía ausentes en su árbol. Integrar primero el snapshot documental aprobado y después el código, con CI remoto verde. Publicación/fusión/Vercel requieren autorización específica posterior al cierre local.

Límites: no limpieza de historia, cambios clínicos/SQL/dependencias, backend real ni certificación productiva. [Plan](plan.md), [spec](spec.md), [análisis](analyze.md).
