# Changelog

## [1.9.0] - 2026-05-22

### Added
- Optional `start=` attribute on the `[player]` BBCode tag for seeking on first play. Accepts seconds (`83`), `mm:ss` (`1:23`), or `h:mm:ss` (`0:01:23`). Implemented via the W3C media-fragment `#t=` URL syntax.

## [1.0.0] - 2026-03-15

### Added
- Auto-detect audio links in posts and render inline `<audio>` players
- Pause-others behaviour when a player starts
- `[player]URL[/player]` BBCode support
- English locale file
