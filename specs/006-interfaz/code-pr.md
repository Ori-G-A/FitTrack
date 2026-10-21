# PR de código preparado — 006

Estado: implementación validada localmente; publicación autorizada.

Integración documental — 2026-10-20 (Bogotá): el PR #13 se fusionó en
`41c73b410498f460b4e559e53ea9902c26f66ceb` tras aprobar ambos jobs de
[CI documental](https://github.com/Ori-G-A/FitTrack/actions/runs/39534948800)
y el estado Vercel del head `3d542bcfd85c2dfad28f6c82dd3a03bcb197d887`.
Esto habilita la publicación del PR de código según el orden aprobado.

Actualización de gobierno — 2026-10-20: publicación, integración con CI remoto
verde y despliegue automático de Vercel autorizados expresamente. El PR
documental [#13](https://github.com/Ori-G-A/FitTrack/pull/13) ya está abierto;
este PR de código se publicará después de integrarlo. La evidencia local se
conserva y los resultados remotos se registrarán por separado.

Título: Separar shell de interfaz y corregir foco, etiquetas y resaltado

FitTrack concentraba navegación, CSS y tema en su composición. Registrar y DetailSheet tenían recorridos de teclado incompletos, tres campos carecían de asociación accesible y el resaltado de Métricas persistía al consumirse focusCard. La implementación separa esas responsabilidades y aplica los tres CHANGE aprobados, con un temporizador de 2200 ms independiente de la petición.

Navegación, fechas, alias y CSS mantienen los contratos AS-IS. Los cierres por cancelación restauran el foco en un disparador visible y conectado; seleccionar una ruta conserva el destino y su fecha. Se mantienen las fachadas CSS/Train/app-utils y los 68 pins anteriores. La corrección técnica del reloj se documenta en [PIN-006-001](evidence/pin-amendment-001.json).

Validación: 314/314 Node, 27/27 Chromium sin omisiones ni reintentos, seis contratos con 184 IDs completos, tres pruebas RLS locales reales con retirada del entorno y tres negativos detectados tras la corrección. [Resultados y hashes](evidence/final.json).

Build: index de 506,49 kB minificados y 147,10 kB gzip; aumento de 2,11 y 0,59 kB frente al original. LineChart conserva 393,31 y 107,99 kB. Los tamaños de todos los chunks están en la evidencia; persiste el aviso heredado de chunk mayor de 500 kB.

Orden: publicar y revisar el PR documental del snapshot aprobado 3d542bc (rama codex/006-interfaz-docs), integrarlo con CI verde y después publicar y revisar este PR desde codex/006-interfaz. La ejecución local previa fue autorizada. Publicación, fusión y Vercel requieren autorización específica para 006. Quedan pendientes CI remoto y la prueba autenticada de producción. SQL, index.html, dependencias y datos persistidos no cambian.

Reversión: revertir las entregas E5b→E1 en orden inverso; no hay migraciones de datos. Mantener evidencia y pins para comprobar la reversión. KD-002 conserva su ratificación separada.
