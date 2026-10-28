# Verificación local 010

Estado: E0 completada, E1/E2 pendientes. No publicación ni integración autorizadas.

Plan aprobado en c8be7bd33b30b6e40f0006e5e270c695bd525208; [G-PIN](evidence/baseline.json).
Baseline original: 372 Node, 35 Chromium y build aprobados. [Checkpoint](evidence/original-checkpoint-attempt-1.json).
Regresiones propias: tres controles originales pasan y cinco casos CHANGE fallan por FR-005–010, con dos tests de metadatos verdes. [Recibos E0](evidence/e0-attempt-3.json).

Los intentos e0-browser-attempt-1/2 son preparación, no cierre: el primero no avanzaba la animación de medidas y obtuvo un fallo de instrumental; se corrigió antes de congelar y se repitieron los ocho casos. El checkpoint 3 captura huellas antes/después y confirma 3/5. No cambió src.

sourceHash: e4e98de0fa1bced3a4372dab58e63172257ed8003eafad8febe306260312b377.
verificationHash E0: 5ed93975663b772143bc8c1be23b9c8d5db7f446ce53c0b73d2748c1d15337ba.
123 firmas anteriores intactas y nueve propias congeladas. Seis IDs completos/dieciocho pending; ninguna garantía CHANGE cerrada todavía.

RLS fresco, mutaciones y los diez contratos/274 IDs pertenecen al cierre E2 y no se presentan como ejecutados.
