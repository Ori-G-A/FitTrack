# PR de código 008 — borrador de cierre

Estado: preparado para revisión local; E3 incompleta, RLS y checkpoint final
pendientes. No publicar ni solicitar integración con este estado.

Título: `fix(datos): conservar bloqueo y recuperación segura del borrado`.

El borrado podía perder su error al desmontar Ajustes, reactivar guardados del
estado anterior y despachar efectos tardíos sobre otra cuenta. El flujo ahora
conserva estado por intento/sesión, distingue DELETE despachado de confirmado y
mantiene bloqueados carga ordinaria y guardados. Antes del despacho ofrece
recarga manual con confirmación de aplicación; después permite solo cierre
manual, sin repetir fotos ni DELETE. Feedback accesible a 390/1280.

Validación ejecutada: E2 355 Node/30 Chromium/build; 29 IDs 008 completos,
107 firmas previas intactas, una enmienda explícita y ocho pins E0 intactos.
Cinco mutaciones con cinco controles positivos y limpieza; dos casos suplementarios
de cargas y controles negativos de trazabilidad. [Evidencia](verification.md).
El perfil local posterior pasó 358 Node/30 Chromium/build y siete contratos/211 IDs;
las seis mutaciones heredadas también se renovaron. Falta RLS local fresco con
limpieza confirmada y el checkpoint final de ocho contratos.
No se atribuyen 234 IDs/ocho contratos completos hasta superar esa puerta.

Bundle E2 +5,36 kB / +2,10 kB gzip; aviso >500 kB conservado. No se garantiza
rollback, cancelación de red ni continuidad tras recargar. No se certifica una
sesión productiva autenticada ni RLS productivo. SQL y dependencias conservados.

Orden futuro: PR documental del snapshot aprobado `2ee8edc`, después este código
con converge y CI remoto verdes. Publicación, fusiones y Vercel requieren
autorización específica posterior. Revert coordinado de código, adendas 001/006
y PIN-008-001; nunca restauración automática de datos ya eliminados.
