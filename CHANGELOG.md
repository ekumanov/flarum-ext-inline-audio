# Changelog

## [2.10.2] - 2026-06-12

### Fixed
- Removed a dead `Composer--minimized` check from the composer-position logic: neither Flarum 1.8 nor 2.x ever renders that class (both use `minimized`), so the branch never executed. Behavior is unchanged on purpose — the player bar keeps sitting above the minimized composer strip rather than dropping behind it.
- The bar could park at a mid-animation offset after minimizing/restoring the composer: Flarum animates composer height via style mutations, which the class-filtered `MutationObserver` cannot see. The observer callback now re-checks once ~300ms after the last class mutation, so the bar settles flush with the composer's final height.

## [2.10.1] - 2026-06-11

### Changed
- The global player bar — including its `<audio controls>` element — is now built lazily on the first play click instead of during `app.boot`. Creating the media element and inserting the bar into `<body>` cost ~25ms of main-thread time on a phone-class CPU on every page load (measured #2 JS boot cost on pianoclack.com); the initializer now only registers the post-body `MutationObserver` (~0.05ms). The composer-position observer and Media Session action handlers are likewise registered on first use, so pages where no audio is played no longer run a body-wide attribute observer at all. No user-visible behavior change: the bar was hidden until first play anyway.

## [2.10.0] - 2026-05-24

### Added
- Optional `title="..."` attribute on the `[player]` BBCode tag. Replaces the URL-derived filename as the display name in the post button, the player bar, and the OS lock-screen / Media Session metadata. Falls back to the filename when omitted or empty.
- README documents the Markdown-vs-BBCode equivalence: link text already works as a title in `[Text](url.mp3)` form, and `#t=N` URL fragments seek natively.

## [2.9.0] - 2026-05-22

### Added
- Optional `start=` attribute on the `[player]` BBCode tag for seeking on first play. Accepts seconds (`83`), `mm:ss` (`1:23`), or `h:mm:ss` (`0:01:23`). Implemented via the W3C media-fragment `#t=` URL syntax.

## [2.0.0-beta.1] - 2026-03-17

### Changed
- Require Flarum 2.0 (`flarum/core: ^2.0`) and PHP 8.2+
- Update `flarum-webpack-config` to v3 for Flarum 2.0 build toolchain

## [1.0.0] - 2026-03-15

### Added
- Auto-detect audio links in posts and render inline `<audio>` players
- Pause-others behaviour when a player starts
- `[player]URL[/player]` BBCode support
- English locale file
