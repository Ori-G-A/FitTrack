# Operación del repositorio FitTrack

Guía operativa de fase 0. Gobierno y reglas normativas:
[constitución](.specify/memory/constitution.md), ratificada el 2026-10-14.
Estado de adopción y decisiones: [roadmap](docs/sdd/roadmap.md).

## Mapa

- `src/main.jsx`: arranque y error boundary.
- `src/FitTrack.jsx`: composición principal, estado y adaptadores de navegador.
- `src/app-navigation.js`, `AppNavigation.jsx`, `app-styles.js`: destinos puros, presentación del shell y cadena CSS compatible.
- `src/ui-theme.js`, `use-app-theme.js`: validación de preferencia con lectura inyectada y coordinación de tema.
- `src/ModalSheet.jsx`: foco, teclado y restauración de las hojas compartidas.
- `src/*Screen.jsx`: pantallas; revisar llamadores antes de extraer símbolos.
- `src/app-utils.js`, `settings-utils.js`, `cycle-inference.js`, `fase1Config.js`: fachadas y responsabilidades compartidas; revisar sus llamadores.
- `src/cycle-context.js`, `cycle-phase.js`, `cycle-summary.js`, `cycle-readings.js`: contexto, fase, resumen y lecturas puras de ciclo.
- `src/body-config.js`, `body-records.js`, `body-metrics.js`: constantes, transformaciones y selectores de cuerpo.
- `src/weight-model.js`, `weight-metrics.js`: algoritmos y métricas puras de peso.
- `src/data-operations.js`, `data-sync.js`: acceso a app_data y sincronización.
- `src/save-coordinator.js`: cola, bus y suspensión con persistencia inyectada.
- `src/app-data-lifecycle.js`: coordinación de carga, copias y borrado con dependencias explícitas.
- `src/auth-service.js`, `photo-operations.js`, `photo-storage.js`: identidad/fotos.
- `supabase/migrations/`: SQL; `test/`: pruebas Node; `.github/workflows/ci.yml`: CI.
- `.specify/templates/`: overrides locales; `specs/NNN-<área>/`: specs futuras.

## Comandos y evidencia

Entorno fijado: pnpm 11.11.0 y Node 24.21.0 en package.json; CI lee
packageManager y .node-version. Los scripts pnpm usan el runtime declarado,
aunque `node` global sea otra versión. Verificar con `pnpm exec node --version`.

```powershell
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm run build
pnpm audit --prod
pnpm test:sdd
```

Si pnpm falla antes de iniciar scripts, registrar el fallo. En esta sesión el
error de su base de datos se reprodujo dentro del sandbox y desapareció al
ejecutar fuera de él con autorización; no se borró el estado global.
Para comprobar los
scripts con dependencias YA instaladas, equivalentes diagnósticos:

```powershell
node --test --test-isolation=none
node node_modules/vite/bin/vite.js build
```

No equivalen a probar instalación limpia ni auditoría. No reinstalar ni actualizar
dependencias para un cambio documental. La preparación técnica autorizada sí
incorpora herramientas de pruebas y lockfile; su evidencia está en readiness.
`pnpm exec playwright install chromium` prepara el navegador de pruebas.
`pnpm test:sdd` ejecuta piloto/mutaciones y Chromium y comprueba el manifiesto
contra resultados TAP/JSON. `pnpm test:sdd:complete` exige todos los IDs completos;
debe fallar mientras existan filas partial/pending. Los reportes van a test-results
(ignorado); el resumen verificado se registra en docs/sdd/readiness.md.
`./scripts/verify-clean.ps1` comprueba instalación, suite y build en una copia
temporal sin credenciales; conserva log en test-results/clean-install.log.

Para docs: comprobar enlaces locales, placeholders solo en plantillas y diff.
Para runtime: pruebas relevantes, suite y build; para cambios de dependencias,
también auditoría. SQL/RLS requiere pruebas ejecutadas sobre entorno local
desechable con guardas; no configurar pruebas contra `.env.local` ni backend real.
Las pruebas existentes de Supabase usan dobles e inspección de SQL.

## Procedimiento SDD

Los comandos `/speckit-*` no se han identificado como capacidades instaladas.
Ejecutar sus etapas mediante artefactos equivalentes, conservando las puertas
definidas en la constitución. Copiar plantillas y corregir enlaces relativos al
destino. No modificar skills externas.

Para la siguiente etapa aprobada crear rama `codex/NNN-<área>`; para fase 0,
`codex/sdd-foundation`. No cambiar de rama si arrastra trabajo ajeno sin revisar
primero `git status`. No crear commits de borradores como etapas aprobadas.
Preparar PRs con alcance, pruebas previstas/ejecutadas, omisiones y orden de merge.

## Configuración y límites

Nombres de variables y arranque: [README](README.md). No imprimir `.env.local`.
Estado de aprobaciones: [registro](docs/sdd/approvals.md). No confundir aprobación
de alcance con aprobación del plan ni evidencia parcial con contrato completo.
No tocar despliegues ni aplicar migraciones para inspeccionar documentación.
No existe archivo local de instrucciones que adelgazar en el inventario inicial;
no crear uno duplicando reglas. No congelar una carpeta como legacy sin llamadas
inventariadas. Hallazgos fuera de la spec se registran en el roadmap.
