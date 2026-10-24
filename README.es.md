<p align="center">
  <img src="resources/peach-logo.png" alt="Peach" width="96">
</p>

<h1 align="center">Peach</h1>

<p align="center">Tu biblioteca privada de vídeos: discos locales, almacenamiento en la nube y los creadores que sigues, en un solo lugar.</p>

<p align="center">
  <a href="https://github.com/sanchezrobertodev/peach">Repositorio de esta versión</a> ·
  <a href="https://peach.video">Web del proyecto original</a> ·
  <a href="https://github.com/peach-mitao/peach/releases">Instaladores originales</a> ·
  <a href="https://demo.peach.video">Demostración original</a> ·
  <a href="https://github.com/peach-mitao/peach/releases/tag/intro-video">Vídeo de presentación</a> ·
  <a href="https://github.com/sanchezrobertodev/peach/issues">Informar de un problema</a> ·
  <a href="https://github.com/orgs/peach-mitao/projects/7/views/3">Hoja de ruta original</a> ·
  <a href="#documentación">Documentación</a> ·
  <a href="README.en.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/peach-mitao/peach/releases"><img src="https://img.shields.io/github/v/release/peach-mitao/peach?include_prereleases&amp;filter=v*&amp;sort=semver&amp;display_name=tag" alt="Versión del proyecto original"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0--or--later-blue?logo=gnu&amp;logoColor=white" alt="Licencia"></a>
  <a href="docs/TESTING_DESKTOP.md"><img src="https://img.shields.io/badge/Windows-x64-0078D4" alt="Windows x64"></a>
  <a href="docs/OPERATIONS.md#macos-独立测试包"><img src="https://img.shields.io/badge/macOS-DMG-555555?logo=apple&amp;logoColor=white" alt="Compilación e instalación en macOS"></a>
  <img src="https://img.shields.io/badge/18%2B-adult%20content-critical" alt="Contenido para mayores de 18 años">
</p>

https://github.com/user-attachments/assets/a5610874-e611-41bb-be22-7d99f0d64b62

> **18+** Para personas adultas que gestionan sus propias colecciones de contenido para adultos. El repositorio no contiene archivos multimedia ni datos de sitios externos. El acceso a esos sitios requiere las cuentas y los permisos correspondientes.

Esta es la [versión con localización al inglés y al español](https://github.com/sanchezrobertodev/peach) de [peach-mitao/peach](https://github.com/peach-mitao/peach), creado por longmeidao y quienes contribuyen al proyecto original. La web, la demostración, las capturas, los indicadores de versión, los instaladores y la hoja de ruta enlazados pertenecen al proyecto original. Sus instaladores no incluyen los cambios de localización de este repositorio; para utilizarlos, ejecuta esta versión desde el código fuente.

## Idioma de la interfaz

Elige **English**, **Español** o **简体中文** en la configuración inicial, en la página de inicio de sesión o en los ajustes. Si no has guardado una preferencia, Peach utiliza el idioma del navegador y recurre al inglés cuando no hay un idioma compatible. La elección se guarda en ese navegador; cambiar el idioma recarga la página.

La traducción de la interfaz es progresiva. Los títulos, las etiquetas, los metadatos de las fuentes, algunos mensajes del servidor, el menú de la bandeja del sistema y la mayoría de las guías detalladas pueden aparecer en su idioma original. La [guía de localización](docs/LOCALIZATION.md), en inglés, explica el alcance y cómo contribuir.

## Funciones

- **Contenido local y en la nube**: reúne discos duros y unidades de nube montadas, como 115, PikPak y OneDrive, en una sola biblioteca.
- **Muro de vídeos**: desplázate por las portadas a pantalla completa y reproduce sin salir de la vista. Las versiones y partes de una misma obra se agrupan.
- **Subtítulos**: carga archivos locales o busca subtítulos en chino simplificado y tradicional en SubtitleCat mediante el código del vídeo. Ajusta fuente, tamaño, colores y fondo. No se necesita una clave de API; los resultados pueden incluir traducciones automáticas.
- **Tu colección existente**: lee archivos NFO y carteles; completa títulos, intérpretes, estudios y portadas desde varias fuentes, respetando tus cambios.
- **Creadores en varios sitios**: reúne novedades de FANBOX, Patreon, Kemono y otras fuentes, y agrupa las publicaciones coincidentes en una tarjeta.
- **Descubrimiento**: sigue los estrenos de intérpretes, descubre obras según tus gustos y guárdalas en tu lista de deseos.
- **Descargas en la nube**: busca por código de vídeo o pega un enlace magnet, envíalo a 115 o PikPak e incorpora automáticamente el vídeo descargado a la biblioteca.
- **Añadir JAV desde el navegador**: detecta o selecciona un código en JavDB, MissAV, Jable y otros sitios para enviarlo a Peach. El [script de usuario](https://github.com/peach-mitao/peach-userscript) se mantiene por separado; consulta la [instalación y vinculación](docs/JAV_BROWSER.md).
- **Preferencias**: combina historial de reproducción, valoraciones, biblioteca, historial del navegador, marcadores y seguimientos. Lee el historial y los marcadores de navegadores locales compatibles o importa marcadores HTML y archivos Bookmarks JSON de Chromium. Puedes dejar de leer una fuente o eliminarla. Consulta las [fuentes de preferencias](docs/TASTE_SOURCES.md).

El historial de reproducción, los favoritos y los ajustes se guardan en tu equipo. El escaneo no modifica los archivos originales. La organización manual permite previsualizar los cambios y deshacer el último lote.

Los escaneos, las actualizaciones de seguimientos y la recopilación de metadatos de estrenos guardan su progreso y continúan las tareas pendientes tras reiniciar la aplicación. Consulta los límites de la [recuperación de tareas](docs/OPERATIONS.md#长时任务断点续跑).

La opción conjunta «Enviar estadísticas de versión y diagnósticos de errores (recomendado)» está activada de forma predeterminada. Puedes desactivarla durante la instalación, la configuración inicial o en los ajustes; la elección se conserva. Si está activada, envía a Sentry los campos técnicos indicados, sin registros completos, archivos ZIP de diagnóstico, datos de los vídeos ni historial de reproducción. Consulta los [diagnósticos remotos](docs/DIAGNOSTICS.md#可选远程诊断).

Compartir detalles de la biblioteca y los gustos es una opción independiente, desactivada de forma predeterminada. Los ajustes muestran todos los campos y una vista previa local antes de pedir consentimiento explícito para enviar cada semana obras, etiquetas, puntuaciones, resúmenes de reproducción y dimensiones de preferencias. No se incluyen identificadores de cuenta, dispositivo ni instalación. Los detalles pueden permitir relacionar envíos o volver a identificar a una persona; el servicio receptor puede ver la IP de la conexión. Consulta la [referencia de diagnósticos](docs/DIAGNOSTICS.md#馆藏与口味群体研究).

## Capturas de pantalla

Prueba las búsquedas, los filtros y los perfiles en la [demostración original de solo lectura](https://demo.peach.video). Estas capturas pertenecen al proyecto original y muestran la interfaz en chino. Haz clic para abrir la imagen original.

<table>
  <tr>
    <td width="50%"><a href="https://peach.video/assets/screenshots/home-20261014.png" target="_blank" rel="noopener"><img src="https://peach.video/assets/screenshots/home-20261014.webp" alt="Filtros de biblioteca y tarjetas de vídeos" width="600"></a></td>
    <td width="50%"><a href="https://peach.video/assets/screenshots/profile-20261014.png" target="_blank" rel="noopener"><img src="https://peach.video/assets/screenshots/profile-20261014.webp" alt="Retrato, perfil y vídeos de una intérprete" width="600"></a></td>
  </tr>
  <tr>
    <td align="center">Biblioteca: busca por intérprete, fuente y etiqueta</td>
    <td align="center">Perfil: datos, alias y todas las obras</td>
  </tr>
  <tr>
    <td><a href="https://peach.video/assets/screenshots/follow-20261014.png" target="_blank" rel="noopener"><img src="https://peach.video/assets/screenshots/follow-20261014.webp" alt="Navegación de creadores y novedades" width="600"></a></td>
    <td><a href="https://peach.video/assets/screenshots/stats-20261014.png" target="_blank" rel="noopener"><img src="https://peach.video/assets/screenshots/stats-20261014.webp" alt="Estadísticas de biblioteca, almacenamiento y contenido" width="600"></a></td>
  </tr>
  <tr>
    <td align="center">Seguimientos: novedades de varios sitios</td>
    <td align="center">Estadísticas: almacenamiento e historial de reproducción</td>
  </tr>
  <tr>
    <td colspan="2"><a href="https://peach.video/assets/screenshots/wall-20261014.png" target="_blank" rel="noopener"><img src="https://peach.video/assets/screenshots/wall-20261014-readme.webp" alt="Muro de portadas a pantalla completa" width="1200"></a></td>
  </tr>
  <tr>
    <td colspan="2" align="center">Muro de vídeos: explora y reproduce en la misma vista</td>
  </tr>
</table>

## Instalación y uso

Para utilizar la interfaz localizada, sigue las instrucciones de código fuente de esta sección. Los paquetes del proyecto original no incluyen la localización de este repositorio.

### Ejecutar esta versión desde el código fuente

Necesitas Git, uv y Python 3.14 o posterior. uv puede descargar el intérprete necesario. Los comandos siguientes se ejecutan desde la carpeta del proyecto.

Clona este repositorio:

```text
git clone https://github.com/sanchezrobertodev/peach.git peach-app
cd peach-app
```

En Windows, utiliza PowerShell 7:

```powershell
uv sync --locked --python 3.14
& .\.venv\Scripts\peach-tray.exe
```

En macOS, utiliza zsh:

```sh
uv sync --locked --python 3.14 --extra macos
./.venv/bin/peach-tray
```

La bandeja del sistema abre la configuración inicial en el navegador. Elige el idioma, las carpetas de contenido y quién puede acceder; después inicia el escaneo. Los archivos compilados de la interfaz están incluidos en el repositorio. Para modificarla o recompilarla, consulta la [guía de localización](docs/LOCALIZATION.md#rebuild-the-interface).

### Paquetes originales de Windows

Descarga `Peach-<versión>-windows-x64-setup.exe` en las [publicaciones originales](https://github.com/peach-mitao/peach/releases) e instálalo sin permisos de administrador. También puedes extraer el paquete portátil completo y ejecutar `Peach.exe`. El instalador completo incluye herramientas multimedia para instalar sin conexión; el instalador ligero las descarga cuando son necesarias.

Los paquetes de prueba no están firmados. Si Windows muestra «Windows protegió su PC», comprueba que el archivo procede de las publicaciones del proyecto original antes de seleccionar «Más información → Ejecutar de todas formas». Consulta la [guía de Windows](docs/TESTING_DESKTOP.md), en chino.

### macOS y Docker

Puedes compilar una aplicación `.app` y un DMG autónomos en macOS; una vez instalados, no necesitan Python ni el código fuente. Consulta la [guía de compilación](docs/OPERATIONS.md#macos-独立测试包). Las publicaciones originales pueden ofrecer paquetes Apple Silicon (`macos-arm64.dmg`) e Intel (`macos-x86_64.dmg`); comprueba los archivos disponibles y el chip de tu Mac antes de elegir. Los paquetes de prueba no están notarizados y requieren instalar las herramientas multimedia por separado.

Para VPS y NAS, consulta el [despliegue con Docker](docs/DOCKER.md), en chino. Verifica el origen de la imagen: una imagen del proyecto original no incluye los cambios de este repositorio.

## Preguntas frecuentes

- **¿Modifica mis archivos?** El escaneo y la recopilación de metadatos no modifican los originales. La organización manual puede renombrar o mover archivos; vaciar la papelera elimina archivos y la limpieza de sincronización elimina carpetas vacías. Estas acciones requieren confirmación.
- **¿Qué unidades de nube admite?** Las montadas como carpetas locales con herramientas como CloudDrive2; consulta los [montajes de nube](docs/CLOUDDRIVE.md). Las descargas en la nube admiten 115 y PikPak; los tokens de acceso se guardan localmente.
- **¿Cómo accedo desde el móvil?** Permite el acceso desde la red local durante la configuración, conecta el móvil a esa red, abre la dirección indicada y configura una contraseña de acceso.
- **¿Dónde se guardan los datos?** En la carpeta local `peach-data`. En Windows, la ubicación predeterminada del paquete es `%LOCALAPPDATA%\Peach\peach-data`.
- **¿Por qué hay texto en otro idioma?** La traducción de la interfaz es progresiva. Los metadatos y el contenido de las fuentes conservan su idioma; algunas pantallas y mensajes aún pueden contener texto sin traducir.

## Informar de problemas

Comunica los problemas de traducción o de esta versión en [su gestor de incidencias](https://github.com/sanchezrobertodev/peach/issues). Incluye la versión o el commit, el idioma seleccionado, los pasos y los resultados esperado y real. Para problemas del proyecto original, consulta [sus incidencias](https://github.com/peach-mitao/peach/issues). Oculta credenciales, direcciones de red local y rutas completas en las capturas; no adjuntes bases de datos ni archivos multimedia. Comunica los problemas de seguridad en privado según la [política de seguridad](SECURITY.md).

## Documentación

[Guía de idioma e instalación desde el código fuente (inglés)](docs/LOCALIZATION.md) · [English](README.en.md) · [README original en chino](README.zh-CN.md)

Las siguientes guías están principalmente en chino: [operaciones](docs/OPERATIONS.md) · [fuentes](docs/SOURCING.md) · [reproductores externos](docs/EXTERNAL_PLAYERS.md) · [registro de cambios](CHANGELOG.md).

Para contribuir: [acuerdos de desarrollo](AGENTS.md) · [pruebas y dependencias](docs/TESTING.md).

## Agradecimientos y licencia

Peach es obra de longmeidao y de quienes contribuyen a [peach-mitao/peach](https://github.com/peach-mitao/peach). Gracias también a [amane](https://github.com/sqzw-x/amane), [Gfriends](https://github.com/gfriends/gfriends), [CloudDrive2](https://www.clouddrive2.com/) y otros proyectos. La [lista de reutilización](docs/REUSE.md) detalla las atribuciones.

[AGPL-3.0-or-later](LICENSE) · Copyright (C) 2026 longmeidao. Los componentes de terceros conservan sus respectivas licencias.
