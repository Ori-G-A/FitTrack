# Verificación preparatoria — 002

Fecha: 2026-10-15. Rama: `codex/002-identidad-fotos`.
Producción base: `80920d4c1ff86648ef5f39ce459284929d7cf975`.
No hay refactor productivo de 002 ni gate PIN completo declarado.

## Pruebas ejecutadas

Comando diagnóstico sobre dependencias instaladas:

```powershell
node --test --test-isolation=none test/identity-auth.test.js test/identity-photos.test.js test/identity-diagnostics.test.js
```

Resultado inicial, antes de ampliar casos de fotos: 27/27 aprobadas, cero
omitidas, código 0. Cinco grupos principales:
autenticación; diagnóstico; validación/firma/subida/recuperación; borrado;
compresión/materialización de backup. La cifra incluye los grupos, conforme
al contador Node, y no significa 27 requisitos cubiertos.

El harness empaqueta módulos originales con esbuild, alias del cliente y entorno
de ejecución vm separado por caso. Reloj controlado para 5000/15000/20000 ms,
sin esperas reales ni conexiones. Las pruebas de compresión ejercitan cálculo
de dimensiones y callbacks sobre primitivas simuladas; no prueban códec real.

## Límites

- UI de acceso, sesión y recuperación probadas en DOM jsdom; no se atribuye
  esa ejecución a un recorrido nuevo en Chromium ni a códec real de imágenes.
- Sin ejecución RLS: docker info código 1 por motor/pipe ausente. No se conectó
  ningún backend; pruebas SQL textuales existentes siguen siendo estáticas.
- FR-012/013 aprobados posteriormente, todavía sin implementar. KD-003/004/005
  siguen abiertos. La evidencia de tests anterior a esa aprobación se conserva.
- Sin PR publicado, merge o CI remoto observado.
- Las pruebas nuevas no sustituyen el gate PIN completo de 002: RLS y decisiones
  siguen pendientes en tasks/trazabilidad. No se cambia la evidencia histórica de 001.

## Checkpoint final de preparación

```powershell
pnpm run test:sdd --spec=002-identidad-fotos
pnpm run build
```

Ambos terminaron con código 0, usando Node 24.21.0 en el checkpoint SDD.
Suite completa final: 210/210 Node, cero omitidas; 3/3 Chromium, sin retries ni
flaky. Las pruebas nuevas aportan 45 comprobaciones de identidad, dos del selector
de contratos y tres de la guarda local; las cifras Node incluyen grupos y subcasos.
El runner cruza 160 nombres de nivel superior (157 Node y 3 Chromium), sin
contarlos de nuevo.

Trazabilidad 002: 18 complete, cero partial, cinco pending. Pendientes exactos:
FR-011, FR-012, FR-013, US2-AS5 y US3-AS2. Los dos CHANGE aún no implementados y la
protección efectiva del servidor impiden declarar contrato completo o PR de código.
El comando sin --complete permite evidencia preparatoria pendiente; el gate
completo sigue rechazándola. La selección de spec rechaza rutas y argumentos
ambiguos, incluye CHANGE propuestos y conserva 001 como default.

La guarda local de RLS se prueba aparte de la autorización del servidor:
`test/local-rls-guard.test.js` tiene tres casos aprobados, sin conexiones.
Rechaza destinos remotos, nombres DNS, falta de marcador desechable, protocolos
inadecuados, credenciales en URL HTTP y rutas/parámetros ambiguos. Sus errores
no incluyen valores de configuración. Todavía no hay runner de BD que la invoque:
este resultado no prueba permisos ni protege una integración inexistente.

Revisión cruzada con esos mismos resultados: 21/21 IDs de 001 completos, sin
errores. Los seis archivos pin de 001 conservan SHA-256 de baseline. El hash de
src coincide con el cierre de 001 y git diff HEAD -- src está vacío: no hubo
refactor productivo de 002. La evidencia histórica de 001 no se sobrescribe.

Build: 2254 módulos, 16,86 s, chunk index 508,72 kB; persiste el aviso conocido
de tamaño PERF-001. Sin cambios de dependencias, lockfile ni migraciones.
Enlaces locales de los documentos revisados y git diff --check correctos.

Durante la preparación falló el caso de timeout de sesión porque avanzó reloj
antes del efecto de React. Se añadió espera de suscripción instalada, sin tocar
producción ni cambiar la expectativa de 15000 ms; luego se repitieron el grupo
afectado y el checkpoint completo con resultado verde.

Evidencia persistida: [preparatory.json](evidence/preparatory.json). Los cinco
archivos de tests de identidad tienen hashes preparatorios sobre src intacto;
esto no sustituye la aprobación de la etapa ni el gate PIN completo con RLS.

## Actualización de gobierno tras el checkpoint

El propietario aprobó alcance y FR-012/013 con «Aprobar alcance y ambos cambios
propuestos». Se resolvieron C2 y se concretaron plan, research, casos rojos/verdes
y revisión cruzada. No se ejecutaron cambios productivos ni se reetiquetó el
snapshot preparatorio histórico como una etapa aprobada. Plan/tasks requieren
su propia aprobación antes de E1–E3; RLS real sigue siendo gate de cierre E4.
