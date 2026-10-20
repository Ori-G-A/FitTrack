# PR documental preparado — 006

Estado: alcance aprobado; plan/tareas/analyze propuestos y pendientes.
Rama: codex/006-interfaz. Base: main, 86299a4. No hay PR remoto creado.

Título propuesto: Definir contratos y plan de interfaz y accesibilidad 006

## Problema y contrato

La interfaz mezcla coordinación, navegación, tema y estilos; las regresiones
de UI comprueban principalmente texto fuente. La spec aprobada fija 21 AS-IS
y dos CHANGE, con 23 escenarios: preservación de recorridos/fechas/apariencia,
foco y teclado en Registrar/DetailSheet y nombres accesibles en tres inputs.
No cambia algoritmos, datos, diseño visual ni otros campos del producto.

El plan propuesto contiene 39 tareas E0–E6, baseline antes de src, cinco casos
CHANGE rojos, extracciones pequeñas, seis contratos y revisión de 21 regresiones.
La aprobación del alcance en 25230b7 no aprueba este plan ni su ejecución.

## Validación prevista y ejecutada

Ejecutado: exploración sintética de App en Chromium a 390/1280, red bloqueada,
registrada como diagnóstico en evidence/survey.json. Revisión documental de IDs,
trazabilidad, dependencias, enlaces y diff según verification.md.

Previsto tras aprobar: 21 grupos AS-IS, siete recorridos de navegador, cinco
rojos CHANGE, cuatro mutaciones AS-IS y dos CHANGE después del verde; cierre
con seis manifiestos (182 IDs), Node/Chromium/build y RLS local fresco/limpieza.
No presentar esas pruebas como ejecutadas. La revisión documental del agente
no equivale a aceptación humana ni cierre de KD-002.

## Orden, exclusiones y permisos

La rama incluye el cierre remoto ya comprobado de 005 y la propuesta 006.
Una vez aprobado el plan, preparar snapshot documental anterior a E0; integrar
ese PR antes del de código. La ejecución local antes de su merge requiere
autorización explícita. Publicar, fusionar y el Vercel automático asociado
requieren autorización propia de 006; la autorización de 005 no se reutiliza.

KD-002 permanece activa: eventual retirada exige evidencia, informe PATCH y
ratificación separada. Fuera: rediseño, nuevas validaciones/fórmulas, optimización
sin objetivo, backend real y certificación global de accesibilidad.

Estado actualizado 2026-10-20: el plan original sí fue aprobado en e06f105;
el snapshot documental codex/006-interfaz-docs permanece local. E0 solo prueba
el original. FR-024 aprobado amplía alcance a 48 IDs; T040–T043 pendientes de
aprobación separada. No hay PR, fusión ni despliegue 006 autorizados.

## Estado vigente — 2026-10-20

Snapshot documental aprobado e06f105 y extensión3d542bc preservados. Ejecución local previa autorizada: E0/G-PIN completada, sin src modificado. [Baseline](evidence/baseline.json); no se ha publicado este PR ni se autoriza Vercel por esta evidencia.
