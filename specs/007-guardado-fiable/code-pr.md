# PR de código preparado — 007

Estado: cierre local verificado; publicación, integración con CI verde y Vercel
autorizadas expresamente el 2026-10-21. Pendiente de ejecución remota.
Rama: codex/007-guardado-fiable. Base prevista: documental
codex/007-guardado-fiable-docs (snapshot e5df628), antes de main.

Título: Conservar errores de guardado por cuenta y clave y mostrar su recuperación

Un fallo de A podía desaparecer cuando B/C terminaban, mostrando Guardado.
Ahora solo un éxito posterior del mismo usuario y clave elimina su fallo.
El indicador lee el snapshot al montar/cambiar cuenta, conserva aislamiento ante
resultados tardíos y presenta una región accesible en móvil y escritorio.
No añade reintentos ni persistencia local de errores.

E0–E3 completadas localmente: 325 Node y 29 Chromium, sin skips/retries; build aprobado, siete contratos y 205 IDs completos sobre el mismo sourceHash. RLS local fresco: tres contratos reales y limpieza confirmada. Tres mutaciones detectadas con cuatro controles positivos. 97 de 101 archivos anteriores intactos, cuatro archivos con cinco enmiendas explícitas; seis archivos E0 intactos y prueba suplementaria de cambio de cuenta con rojo original/verde candidato.

[Verificación](verification.md), [revisión por cláusula](clause-review.md),
[fallos y repeticiones E2](evidence/e2-failures.json). Las adendas 001/006
se limitan a los CHANGE aprobados. No hay SQL ni dependencias nuevas.

Orden: publicar/integrar primero el snapshot documental aprobado; después este
PR con CI remoto verde. El cuerpo se aplica al diff de código restante tras
retarget a main. Publicación, fusión y Vercel requieren autorización del propietario.

Límites: sin prueba autenticada de producción, instalación limpia local nueva ni
lectores de pantalla reales; permanece el aviso de bundle >500 kB. DATA-004/005
quedan fuera. Reversión: revertir el commit de merge de código con sus adendas y
expectativas enmendadas, sin borrar datos ni aplicar migraciones.

TEST-001 permanece documentado en el [roadmap](../../docs/sdd/roadmap.md): una
ejecución falló al preparar el reloj heredado antes de montar App. Se conservan
los reportes; E2 y el checkpoint final posteriores pasaron completos sin retries
internos. Esa repetición verde no demuestra inmunidad a demoras del host.
