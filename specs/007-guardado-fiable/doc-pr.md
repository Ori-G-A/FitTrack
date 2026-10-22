# PR documental preparado — 007

Estado: alcance y plan/tareas/análisis aprobados; snapshot documental conservado
en `e5df628`, sin publicar. Rama documental: `codex/007-guardado-fiable-docs`.
Base: main `4eee59d`. Implementación local separada: `codex/007-guardado-fiable`.

Título: Definir estado de guardado fiable y evolución controlada de contratos 007

DATA-003 permite anunciar Guardado tras perder un error de otra clave. El
alcance aprobado conserva fallos por usuario:clave hasta recuperación de ese
par, aísla sesiones y muestra estado accesible en móvil/escritorio. Cuatro AS-IS,
cinco CHANGE y doce escenarios. DATA-004/005 quedan fuera.

Plan aprobado: 24 tareas iniciales E0–E3; baseline con Node 24.21.0, cuatro AS-IS y seis
CHANGE rojos; evolución de coordinador y UI en etapas; dos enmiendas de pins
explícitas, adendas a 001/006 y cierre con siete contratos, 205 IDs y RLS fresco.
No se reinterpretan la resolución de saveKey ni las evidencias históricas.

Validación de esta preparación: enlaces locales, 21 filas previstas, dependencias
sin ciclos, integridad de 101 firmas existentes y diff sin runtime. La reproducción
del survey usó Node global v26.5.0 y no equivale a G-PIN. Este snapshot no incluye
implementación, pruebas nuevas ejecutadas, instalación limpia nueva ni auditoría.

El propietario aprobó plan/tareas/análisis y ejecución local E0–E3 antes del
documental. Publicación, integración y Vercel requieren decisión posterior.
Integrar primero este snapshot y después el PR de código cuando se autorice
la entrega remota. La evidencia posterior está en [verificación](verification.md).
