# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Flarum forum extension (`ekumanov/flarum-ext-inline-audio`) that automatically converts audio file links in posts into inline HTML5 players. It also provides a `[player]URL[/player]` BBCode tag.

## Build Commands

All JS commands run from the `js/` directory:

```bash
cd js
npm run build   # production build → js/dist/forum.js
npm run dev     # development build with watch mode
```

There is no test suite.

## Architecture

The extension follows the standard Flarum extension pattern:

- **`extend.php`** — PHP bootstrap that wires everything together: registers the compiled JS, CSS, BBCode formatter, and locales with Flarum's extender system.
- **`js/src/forum/index.js`** — All JS logic. Uses a `MutationObserver` to watch for `.Post-body` elements added to the DOM, then scans their `<a>` tags for audio file extensions and replaces matching links with a `<span class="pc-audio-wrap">` play button. All play buttons drive a single global player bar (filename button, `<audio controls>`, download and close buttons) fixed to the bottom of the viewport. The bar — including its composer-position observer and Media Session handlers — is built lazily on the first play click via `ensureBar()`: creating an `<audio controls>` element and appending it to `<body>` costs ~25ms on a phone-class CPU, so it must stay off the `app.boot` path.
- **`resources/css/audio-player.css`** — Styles for `.pc-audio-wrap`, `.pc-audio-name` and the `.pc-player-bar`. Includes dark mode support via `color-scheme`.
- **`locale/en.yml`** — Single translation key for the BBCode tag description.

### How audio detection works

The JS regex `/\.(mp3|wav|ogg|flac|m4a|mpeg|mpg|mp4|wave|aac|webm)(\?[^#]*)?(#.*)?$/i` is matched against each `<a>` tag's `href`. Matching links are wrapped in the audio player DOM structure. The `getFilename` helper strips protocol/hostname and URL-decodes the path for display.

### FoF Upload integration

Optional — requires manually adding a filename-link upload template in FoF Upload settings with a MIME regex for audio types. Documented in README.md.

## Branch / Docker testing rules

Two branches, two Flarum versions:

| Branch | Flarum | FontAwesome | webpack-config |
|--------|--------|-------------|----------------|
| `main` | 2.0+   | FA6 (`"Font Awesome 6 Free"`) | v3 |
| `1.x`  | 1.8    | FA5 (`"Font Awesome 5 Free"`) | v2 |

**When switching branches for a build, always run `npm ci` (not `npm install`) from the `js/` directory.** `node_modules` is not tracked by git, so after a branch switch the installed `flarum-webpack-config` version may be wrong. `npm ci` reinstalls exactly what the branch's `package-lock.json` specifies. Building with the wrong config version produces `flarum.reg.get(...)` calls in the dist that crash on the incompatible Flarum version.

**When testing in the Flarum 1.8 Docker (`localhost:80`), both extensions mounted in that container must be on their `1.x` branches:**
- `flarum-ext-inline-audio` → `1.x`
- `flarum-ext-new-posts-notice` → `1.x`

If either is on `main`, its dist will contain `flarum.reg.get(...)` calls that crash the entire JS bundle in Flarum 1.8, silently breaking all extensions.
