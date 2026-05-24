# Changelog

## [1.10.0] - 2026-05-24

### Added
- Optional `title="..."` attribute on the `[player]` BBCode tag. Replaces the URL-derived filename as the display name in the post button, the player bar, and the OS lock-screen / Media Session metadata. Falls back to the filename when omitted or empty.
- README documents the Markdown-vs-BBCode equivalence: link text already works as a title in `[Text](url.mp3)` form, and `#t=N` URL fragments seek natively.

## [1.9.0] - 2026-05-22

### Added
- Optional `start=` attribute on the `[player]` BBCode tag for seeking on first play. Accepts seconds (`83`), `mm:ss` (`1:23`), or `h:mm:ss` (`0:01:23`). Implemented via the W3C media-fragment `#t=` URL syntax.

## [1.0.0] - 2026-03-15

### Added
- Auto-detect audio links in posts and render inline `<audio>` players
- Pause-others behaviour when a player starts
- `[player]URL[/player]` BBCode support
- English locale file
