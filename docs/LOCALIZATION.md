---
kind: howto
---

# Language and source-install guide

This guide applies to [sanchezrobertodev/peach](https://github.com/sanchezrobertodev/peach), the English and Spanish localization fork of [peach-mitao/peach](https://github.com/peach-mitao/peach).

Read the project overview in [English](../README.en.md), [Spanish](../README.es.md) or [Chinese](../README.zh-CN.md). Most detailed operations and development guides remain in Chinese.

## Choose a language

Use the language selector on the setup or login page, or in settings, to choose English (`en`), Spanish (`es`) or Simplified Chinese (`zh-CN`). Without a saved preference, the interface follows the browser's supported language and falls back to English.

The selection is stored in the current browser under the `peach.locale` local-storage key. It is a browser preference, so another browser or device can use a different language. Clearing site data also clears the saved choice. Selecting a language reloads the page so interface text initialized when modules load uses the selected language.

## Translation scope

The browser translations cover navigation, setup and login, settings, playback controls, collection screens and notices. Some server-generated responses and error details can still contain Chinese. Language selection and persistence are tested in both languages at desktop and mobile viewport sizes.

Media titles, performer names, tags, source metadata and user-entered text keep their original values. Language selection does not rewrite the library. Desktop tray text, installers, terminal output and most detailed documentation can also remain in Chinese. Subtitle search retains the sources and subtitle languages described in the README; interface language does not translate subtitles.

The upstream website, demo and screenshots show the upstream application. Upstream installers and container images do not contain this fork's localization changes. Release availability must be checked in the repository that publishes each artifact.

## Run this fork from source

Install Git and uv. The project requires Python 3.14 or newer and pins its interpreter in `.python-version`; uv downloads a missing interpreter as needed. The commands below run from the checkout root.

Clone this fork:

```text
git clone https://github.com/sanchezrobertodev/peach.git peach-app
cd peach-app
```

On Windows, use PowerShell 7:

```powershell
uv sync --locked --python 3.14
& .\.venv\Scripts\peach-tray.exe
```

On macOS, use zsh:

```sh
uv sync --locked --python 3.14 --extra macos
./.venv/bin/peach-tray
```

The tray opens the setup page in your browser. Select a language, choose media directories and access permissions, and start scanning. The [operations guide](OPERATIONS.md) explains configuration, media tools, access from other devices and data locations. Its clone command refers to upstream; use the fork URL above for this version.

## Rebuild the interface

The repository includes compiled browser assets in `web/dist/`. Running those assets does not require Node.js. Editing frontend source requires Node.js 24 or newer and the locked frontend dependencies:

```text
npm --prefix frontend ci
npm --prefix frontend run build
```

The build produces the main application bundle and the separate setup, login and error-page bundle. Refresh the browser after building. When contributing frontend changes, include the rebuilt `web/dist/` files. See [frontend development](FRONTEND.md#开发循环) for the complete workflow.

## Contribute translations

The browser catalogs are `frontend/src/i18n/en.json` and `frontend/src/i18n/es.json`. Chinese source messages are their keys. `t(source, values)` resolves a message; placeholders such as `{{v0}}` must occur in both translations. New messages must be added to both catalogs. `npm --prefix frontend run check:i18n` checks key parity, placeholders and source consumers, and also runs before each build.

Locale precedence is a supported `?lang=` URL parameter, the saved browser preference, then a supported browser language. English is the fallback. For example, `?lang=es-MX` selects Spanish. Language switching updates both the saved preference and URL so it also works when browser storage is unavailable. Server-supplied setup errors use a small, explicit set of templates in `frontend/src/i18n/server-message.ts`; unknown diagnostics remain verbatim.

Keep the meaning of actions, confirmation prompts and privacy choices consistent across languages. Translate visible labels and explanations; preserve API fields, configuration keys, routes, file paths, media metadata and product names. Preserve interpolation placeholders and HTML escaping when editing messages.

Check every place that uses a shared message, including setup, login, settings, navigation, empty states and errors. Check long Spanish labels at desktop and mobile widths, and verify that changing the language persists across a reload. Report any untranslated server or desktop text separately from browser interface text.

Run the repository's standard test entry point from your isolated worktree after installing its locked development environment:

```powershell
& .\scripts\test.ps1
```

On macOS or Linux:

```sh
./scripts/test.sh
```

Follow [the development agreement](../AGENTS.md) and [testing guide](TESTING.md) for setup and required checks. A passing build does not establish translation completeness or browser usability; report those checks separately.

Maintain `README.md` and `README.en.md` together as the English entry points, `README.es.md` as the Spanish overview, and `README.zh-CN.md` as the preserved upstream Chinese overview with fork navigation. Keep the upstream copyright, license and attribution links intact.

## Report a translation issue

Use [this fork's issue tracker](https://github.com/sanchezrobertodev/peach/issues). Include the selected language, page or action, current wording, suggested wording and version or commit. Remove credentials, local addresses, full paths and private media details from screenshots.
