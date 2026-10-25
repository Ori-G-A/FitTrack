# PR documental 008 — preparación local completa

Rama: codex/008-borrado-fiable-docs. Snapshot aprobado: 2ee8edca15a95012344e0dca3823e8b103b231f3.
Publicación, integración y Vercel pendientes de autorización específica. [Ejecución posterior](verification.md).

Título: `docs(sdd): especificar borrado fiable por sesión (008)`.

## Cuerpo para el PR

El borrado actual puede perder el error al desmontar Ajustes, reactivar guardados anteriores y aplicar efectos tardíos a otra sesión. La spec 008 define feedback persistente y recuperación manual según el despacho de DELETE, aislando intentos sin prometer rollback ni reintentos destructivos automáticos.

Snapshot documental aprobado: cuatro AS-IS, nueve CHANGE, dieciséis escenarios y C-001/002/003; plan E0–E3 y 36 tareas. Validación documental: IDs, nombres, 103 enlaces y 108 firmas efectivas del producto original. Los 29 IDs permanecen pending en este snapshot; los sondeos sintéticos son diagnóstico y no G-PIN.

No cambia src, SQL, dependencias ni la suite contractual. La ejecución posterior está preparada en la rama de código; se integra primero este documental y después el código con converge y CI remoto verdes. Las autorizaciones se registran por etapa en docs/sdd/approvals.md.
