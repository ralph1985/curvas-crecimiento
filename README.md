# Curvas de crecimiento infantiles

Aplicación web estática para registrar mediciones infantiles y visualizarlas sobre curvas de referencia de crecimiento. Funciona en el navegador y no necesita cuenta ni backend.

## Qué permite hacer

- Crear fichas para varios niños y niñas, con fecha de nacimiento, sexo y color de línea.
- Editar los datos de cada bebé en una ventana independiente, sin desplegar el resto de la página.
- Registrar peso, longitud y perímetro craneal en fechas concretas.
- Consultar curvas de peso, longitud y perímetro craneal para niñas y niños.
- Ver un detalle inicial de las primeras 13 semanas o elegir una vista personalizada de hasta 5 años, en meses o años.
- Guardar los datos en el navegador, exportarlos como JSON e importarlos más tarde.
- Elegir entre tema automático, claro u oscuro; la preferencia se guarda en el navegador.

Las curvas disponibles se basan en los estándares de crecimiento infantil de la OMS. Para longitud, las referencias están separadas en 0–2 años y 2–5 años. La fuente de datos incorporada puede consultarse en [src/data/who.ts](src/data/who.ts) y la documentación de referencia está en la [OMS](https://www.who.int/tools/child-growth-standards/standards).

> [!WARNING]
> Esta aplicación es una ayuda visual para el seguimiento de datos y no sustituye la valoración de profesionales sanitarios. No se debe usar para diagnosticar, tratar ni tomar decisiones clínicas.

## Privacidad y datos

Los datos de los bebés se guardan únicamente en el `localStorage` del navegador, bajo la clave `growth-data`. La preferencia de tema se guarda por separado bajo `theme-preference`.

- No hay cuentas, base de datos ni envío de datos a un servidor.
- Los datos permanecen en ese navegador y dispositivo hasta que se borren o se eliminen los datos del sitio.
- La aplicación muestra esta información en una modal durante la primera visita y permite volver a abrirla desde **Cómo se guardan tus datos**.
- El tema elegido y el aviso de privacidad también se guardan localmente; no se envían a ningún servidor.
- Usa **Copia de seguridad → Exportar datos** para guardar una copia JSON antes de cambiar de navegador o borrar datos.
- Al importar un archivo JSON se conservan los datos actuales: se añaden las fichas nuevas y las mediciones nuevas de fichas coincidentes. Una misma medición importada no se duplica.

## Requisitos

- Node.js `22` (se recomienda usar la versión LTS activa de Node 22)
- pnpm `10.25.0`, gestionado mediante Corepack

Comprueba las versiones:

```bash
node --version
pnpm --version
```

## Instalación y uso local

Desde la raíz del proyecto:

```bash
corepack enable
pnpm install --frozen-lockfile --ignore-scripts
pnpm start
```

Abre [http://127.0.0.1:8081](http://127.0.0.1:8081) en el navegador. El servidor de desarrollo se limita a tu equipo y recompila la aplicación al guardar cambios.

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm start` | Inicia el servidor de desarrollo en `127.0.0.1:8081`. |
| `pnpm run watch` | Recompila en modo desarrollo sin iniciar un servidor. |
| `pnpm run build` | Genera la versión de producción en `build/dist/`. |
| `pnpm run compile` | Comprueba los tipos de TypeScript. |
| `pnpm test` | Compila TypeScript y ejecuta las pruebas. |
| `pnpm run lint` | Ejecuta las comprobaciones de Biome. |
| `pnpm run fix` | Aplica las correcciones automáticas de Biome cuando sean seguras. |

Para comprobar un cambio local, ejecuta:

```bash
pnpm test
pnpm run lint
pnpm run build
```

## Estructura

```text
src/
├── data/       Curvas y configuración de los indicadores
├── models/     Estado, persistencia, exportación y utilidades temporales
├── views/      Componentes y modales de Mithril
├── styles/     Estilos Sass y Chartist
└── assets/     Icono, logotipo e ilustraciones
test/           Pruebas unitarias y de componentes
```

La interfaz está construida con TypeScript, [Mithril](https://mithril.js.org/) y [Chartist](https://gionkunz.github.io/chartist-js/). Webpack genera tanto el entorno de desarrollo como la compilación de producción.

## Estado del proyecto y contribuciones

El proyecto está en versión `0.1.0`. Actualmente no incluye integración continua ni una guía de contribución independiente.

Autor original: Frederik Leonhardt. Continuación y mantenimiento: Rafael García Prieto.

## Licencia

El proyecto se distribuye bajo licencia [ISC](LICENSE). Se conservan los avisos de copyright del autor original y de las contribuciones posteriores.
