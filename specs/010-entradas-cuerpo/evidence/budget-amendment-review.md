# Revisión de converge T034 — presupuesto de las pruebas nuevas

E1 intento 2 aprobó 377 Node y 41 de 43 Chromium. B1/B2 finalizaron timedOut a
30000 ms. En la configuración dedicada E0/E1 se ejecutaron con 120000 ms y
pasaron sobre el candidato (B1 26521 ms, B2 33037 ms en el verde dirigido).
El descubrimiento ordinario heredaba un límite de 30000 ms para esos archivos.

Corrección técnica necesaria: declarar 120000 ms en el archivo CHANGE nuevo,
el mismo presupuesto usado al fijar G-PIN; no cambiar timeout de aserciones,
esperas, nombres o datos. Los 35 casos anteriores y su configuración permanecen
intactos. La condición «sin ampliar timeouts» del plan conserva los presupuestos
originales de negocio y del instrumental dedicado, no exige ejecutar una matriz
nueva con un límite distinto en su integración ordinaria.

Se añaden dos enmiendas propias E0: change-tests/body-inputs.spec.js (una línea
de presupuesto) y scripts/body-inputs-evidence.js (resolver y contar exactamente
esas dos firmas nuevas). Las seis enmiendas legadas siguen iguales. El resolver
suplementario es independiente y solo admite esas dos transformaciones desde
sus originales E0 firmados. Sus negativos son un test Node nuevo.

Antes de emitir adendas: repetir los ocho casos nuevos con source original
reconstruido y comprobado contra e4e98de0, exigir tres verdes/cinco rojos
funcionales y limpieza; después repetir seis Node dirigidos y ocho Chromium
del candidato. Generar recibos con la huella nueva y repetir E1 completo.
No reescribir baselines, resultados fallidos ni el primer verde dirigido.

Esta revisión no amplía el alcance de producto. Se ejecuta dentro del converge
local aprobado; la aprobación inicial de 31 tareas se conserva. T032/T033/T034
son tareas aditivas. Publicación, integración y Vercel siguen sin autorizar.
