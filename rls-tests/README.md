# Verificación RLS desechable

Runner: `scripts/run-local-rls.js`. CLI fijada: 2.121.0; Node/pnpm del proyecto.
Docker debe responder fuera del sandbox y usar contexto local, nunca SSH/TCP
remoto. Instalación de la CLI: [documentación oficial](https://supabase.com/docs/guides/local-development/cli/getting-started).
Versión verificada: [release 2.121.0](https://github.com/supabase/cli/releases/tag/v2.121.0).

Para usar una CLI ya disponible en PATH:

```powershell
pnpm test:rls
pnpm run test:sdd:complete --spec=002-identidad-fotos
```

Si el binario está en otra ruta, definir únicamente su ruta absoluta mediante
`SDD_SUPABASE_CLI` antes del primer comando. No suministrar URL ni credenciales
de una cuenta real. El runner no lee `.env.local`, no inicia sesión remota y
no enlaza proyectos Supabase existentes.

## Aislamiento y limpieza

Se crea un directorio temporal con marcador de propiedad y un project_id único
`fittrack-sdd-rls-<12 hex>`. Puertos iniciales 59321/59322, PostgreSQL 17. Solo
se arrancan servicios necesarios para Auth, REST, Storage y BD. Las migraciones
productivas se copian sin modificar; un fixture previo crea el app_data mínimo
y un RPC de identidad. Auth/Storage y sus mecanismos de autorización son reales,
no funciones recreadas para simular Supabase.

La guarda rechaza destinos no loopback antes de crear clientes. El primer
cliente anónimo verifica el RPC de identidad antes de crear el cliente de control
privilegiado. Las pruebas ejercitan usuarios A/B/anónimo con sus permisos; el
cliente privilegiado solo prepara usuarios y comprueba estado posterior.
Las credenciales locales generadas no se imprimen y el contexto temporal se
retira al finalizar, junto con el proyecto creado por el runner. Nunca se usa
`stop --all`, limpieza global Docker ni volúmenes de otros proyectos.

El código de salida es distinto de cero si falla una prueba, arranque o limpieza.
`test-results/rls-evidence.json` solo marca passed cuando pasan las tres pruebas
y la limpieza. Los hashes incluyen políticas, runner, tests, guardas y lockfile;
el gate SDD rechaza evidencia obsoleta o resultados omitidos/repetidos. Un archivo
de evidencia previo se invalida al comenzar un nuevo intento.

## Matriz ejecutable

- app_data: CRUD propio, lectura sin filas de otros, insert/update/delete ajenos
  denegados o sin efecto, transferencia de owner impedida y anónimo sin permisos.
- Storage: subida/firma/descarga/update/delete propios, operaciones ajenas y
  anónimas denegadas o sin efecto, cambio de prefijo impedido y bucket privado.
- Diagnósticos: insert propio por default, sin select/update/delete, sin insert
  anónimo ni suplantación. Estado posterior comprobado por conexión de control.

Los resultados locales no equivalen a una ejecución remota observada. El job CI
`rls-and-sdd-002` prepara la misma CLI/runner y exige el gate completo de 002.
