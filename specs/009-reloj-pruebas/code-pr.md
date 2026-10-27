# PR de código 009 — preparado localmente

Rama codex/009-reloj-pruebas; dependencia documental 5658328.
Título: `fix(test): detener el reloj antes de montar los fixtures`.

## Cuerpo para el PR

Una demora del host entre instalar el reloj y pausarlo en el mismo instante podía interrumpir los montajes de interfaz, guardado y borrado antes de App. Un protocolo compartido de APIs públicas fija Date durante la pausa y restablece su avance virtual antes de inyectar la aplicación. Conserva fechas, nombres, plazos y aserciones de negocio.

372 Node, 35 Chromium/build, nueve contratos/250 IDs completos, catorce mutaciones con quince controles positivos, nueve negativos de recibos y RLS real fresco con limpieza. Producto, SQL y dependencias intactos. Tres enmiendas canónicas, 113 firmas anteriores intactas y siete E0 propios intactos. Se verificaron rojo original, verde candidato y tres reintroducciones de la carrera, con cleanup. La huella de todo el conjunto verificable evita reciclar reportes por tener src idéntico.

T027 completó la huella del reportador genérico; sus pruebas anteriores se archivan como históricas y las mutaciones se repitieron. Precisión SC-001 aprobada: controles de error ya verdes se preservan sin fingir defectos originales. Evidencia en specs/009-reloj-pruebas/{verification,converge}.md y evidence/final.json.

Se mantiene el aviso de bundle >500 kB. Sin prueba autenticada de producción, reparación de DNS ni promesa de eliminar toda inestabilidad. Integrar documental primero y código después con CI verde, solo tras autorización de publicación/integración/Vercel. Reversión coordinada de helper, tres fixtures, enmiendas y resolutores.
