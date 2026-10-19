# Verificación — 004

Fecha: 2026-10-18. Estado: verificación local completa; pendiente de revisión del
propietario e integración. Alcance/plan y ejecución local autorizados; sin CHANGE.
[Resumen final](evidence/final.json), [converge](converge.md), [tareas](tasks.md).

## Resultados actuales

- Node 24.21.0, pnpm 11.11.0 declarados; Supabase CLI 2.121.0 para fixture local.
- Gate002 repetido íntegramente tras recuperar Docker:23/23 contratos.
- Suite: 263/263 pruebas Node; Chromium: 9/9, sin omisiones/reintentos.
- RLS real:3/3; fixture nuevo retirado y cleanup confirmado. Fixture anterior
  también retirado con verificación de propietario/ruta/nonce y cero contenedores.
- Manifiestos001/002/003/004 completos:21/23/21/31 IDs respectivamente, usando
  la misma colección fresca de resultados y sourceHash; verificador original.
- Build correcto; aviso heredado de chunk>500kB. Sin SQL ni dependencias nuevas.
- Ocho módulos puros y negativos transitivos; inferencia tras guardas;40 hashes
  congelados intactos. NUTR-001/002/003 preservados.
- 29 tareas completas, sin gaps locales; CI 004 configurado, sin resultado remoto.

## Comandos y evidencia

pnpm test:rls; pnpm run test:sdd:complete --spec=002-identidad-fotos; pnpm run build.
Contraste de los cuatro manifiestos con scripts/sdd-trace.js y sdd-contract.js,
misma colección y hash, sin repetir innecesariamente todas las pruebas por spec.

[Baseline previa a src](evidence/baseline.json), checkpoints
[E1](evidence/e1.json), [E2](evidence/e2.json), [E3](evidence/e3.json),
[E4](evidence/e4.json), [E5 histórico](evidence/e5.json),
[RLS renovada](evidence/rls-final.json), [recuperación](evidence/recovery.json).
Las evidencias fallidas previas no se reescriben como éxitos.

## Límites

No instalación limpia/auditoría nuevas: no cambió el lockfile. RLS es local
con guardas, no contra backend real ni .env.local. No se declaró aprobación
clínica. KD-002 sigue para el resto del proyecto. Sin publicación, merge ni
despliegue004, ni aceptación final del propietario inferida desde «continua».

Revisión documental final:110 enlaces locales existentes,29 tareas completas
con dependencias acíclicas y git diff --check correcto. Sin cambios de runtime
después del checkpoint final; las evidencias históricas permanecen intactas.
