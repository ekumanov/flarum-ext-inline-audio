# Inline Audio Player for Flarum

A Flarum extension that automatically converts audio file links in posts into inline `<audio>` players, with an optional `[player]` BBCode tag.

## Features

- Auto-detects links to audio files (`.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, `.webm`, and more) and replaces them with an inline player
- Pauses other players on the page when a new one starts
- `[player]URL[/player]` BBCode for explicit embedding
- Works with [FoF Upload](https://github.com/FriendsOfFlarum/upload) filename-link templates out of the box

## Installation

```bash
composer require ekumanov/flarum-ext-inline-audio
```

## Supported Formats

`mp3` · `wav` · `ogg` · `flac` · `m4a` · `aac` · `webm` · `mp4` · `mpeg` · `mpg` · `wave`

## BBCode

```
[player]https://example.com/audio/track.mp3[/player]
```

## License

MIT
