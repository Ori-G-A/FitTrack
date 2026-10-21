# Convergencia local — 005

Fecha: 2026-10-19. Estado: sin gaps locales; aceptación del propietario e integración pendientes.
[Spec](spec.md), [plan](plan.md), [tareas](tasks.md), [evidencia final](evidence/final.json).

| Control | Resultado |
| --- | --- |
| Contrato | 20 FR y 20 escenarios, 40 filas completas, sin IDs huérfanos ni pruebas omitidas |
| Antes de transformar | E0 sobre BASE 02ab519; 284 Node/13 Chromium/build, cuatro mutaciones detectadas |
| Entregas | E1–E5 con suite/Chromium/build y hashes por entrega; E5 falló por prueba textual no congelada y se repitió íntegro tras contrastar su nueva aserción con original |
| Cierre | 286 Node, 13 Chromium, build y 3 RLS reales con cleanup confirmado |
| Gates | 001:21, 002:23, 003:21, 004:31, 005:40; 136 IDs completos sobre mismo src/resultados frescos |
| Capas | Nueve módulos puros, fachada de ciclo con exports originales, grafo acíclico y negativos transitivos |
| Pins | 28 nuevos y 40 anteriores intactos; prueba arquitectónica suplementaria separada |
| Consumidores | Cuerpo/Perfil/Métricas/Training, Diario/Plan, App/Account y ambas previews; inventario y recorridos comprobados |
| Datos y seguridad | Formatos, fotos, identidad y persistencia previos conservados; sin SQL ni dependencias nuevas, backend real no utilizado |
| CI | Gate/artifacts005 añadidos conservando jobs/gates previos; ejecución remota pendiente de publicación |

## Hallazgos y decisiones

- T034 añadida y completada: FR-016 aclara default minPerPhase=3 y comparación
  del residuo JavaScript <=0,2. C-002/FR-020 ya exigían preservar números y firma;
  los pins E0 comprueban parámetro explícito y diferencias de punto flotante.
  No se alteró el algoritmo ni una aserción congelada.
- BODY-001–005 reproducidos y preservados conforme al alcance aprobado. No se
  declaran resueltos como defectos; cualquier corrección necesita CHANGE separado.
- UI-005-001 queda en roadmap para 006: asociación accesible del input de peso.
- ENV-005-002 resuelto mediante LF para src; pins congelados no se modificaron.
  Docker arrancó con su CLI; se reutilizó Supabase 2.121.0 local. Fixture RLS retirado.

## Constitución y límites

Constitución 1.0.2 aplicada, sin enmienda normativa nueva. P1/P3: contrato y pins
previos; P2/P5: efectos y separación por usuario conservados; P4: límites puros;
P6: comandos, fallos y omisiones registrados. KD-002 permanece para el resto de
la interfaz; 005 no retira esa deuda global ni ratifica fórmulas clínicamente.

34 tareas completas. No hay nuevos CHANGE aprobados/implementados, instalación
limpia ni auditoría nuevas (dependencias intactas). Aviso heredado de chunk>500kB.
Publicación, merge, despliegue y prueba autenticada en producción no realizados.
La revisión local del agente no constituye aceptación final del propietario.

## Decisión del propietario — 2026-10-19

Publicación de ambos PRs, integración con CI verde y despliegue automático
expresamente autorizados mediante «autorizo. continua». El estado anterior
registra el cierre local; la evidencia remota se añadirá tras comprobarla.

## Cierre de integración — 2026-10-19

Publicación e integración autorizadas y ejecutadas: PR documental #11 y código
#12, CI de ambos y de main verde; Production exitoso sobre 86299a4.
[Evidencia](evidence/integration.json). Sin cambios de contrato ni pins.
KD-002 continúa para la interfaz restante. No se declara prueba autenticada real.
