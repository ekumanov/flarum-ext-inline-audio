> ℹ️ If you've been using [Inline Audio (aka Audio URL to Player)](https://discuss.flarum.org/d/27255-inline-audio-aka-audio-url-to-player), that extension has been abandoned. This is a fresh, actively maintained replacement built for Flarum 2.0+ (and 1.8 via the [`1.x` branch](https://github.com/ekumanov/flarum-ext-inline-audio/tree/1.x)).

---

## Inline Audio Player

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ekumanov/flarum-ext-inline-audio/blob/main/LICENSE)
[![Latest Stable Version](https://img.shields.io/packagist/v/ekumanov/flarum-ext-inline-audio.svg)](https://packagist.org/packages/ekumanov/flarum-ext-inline-audio)
[![Total Downloads](https://img.shields.io/packagist/dt/ekumanov/flarum-ext-inline-audio.svg)](https://packagist.org/packages/ekumanov/flarum-ext-inline-audio)

A Flarum extension that automatically converts audio file links in posts into clickable filenames backed by a shared overlay player bar, with an optional `[player]` BBCode tag.

Audio links are replaced with a compact filename button. Clicking it loads the track into a **fixed player bar** at the bottom of the page — keeping posts clean while giving you a persistent, always-visible player.

![No player open](https://raw.githubusercontent.com/ekumanov/flarum-ext-inline-audio/main/docs/No%20player%20open.png)

![Player open](https://raw.githubusercontent.com/ekumanov/flarum-ext-inline-audio/main/docs/Player%20open.png)

---

### Features

- Auto-detects links to audio files and replaces them with a clickable filename — no BBCode required
- Clicking a filename loads it into a **shared overlay player bar** fixed at the bottom of the page
- Clicking the same filename again **toggles play/pause**
- Clicking the track name in the bar **scrolls back to the source post**
- A **circle-play icon** precedes each filename in the post; it switches to a **pulsating circle-pause** while that track is playing
- When a new track starts, any currently playing audio is **stopped automatically** — one track at a time
- **Right-click a filename** to get the browser's native "Save link as" menu (configurable)
- **Download button** in the player bar; works correctly in all browsers including Safari (opt-in via admin settings)
- **Auto-play** on first click is configurable
- `[player]URL[/player]` BBCode for explicit embedding — identical behavior to auto-detected links
- The player bar follows the **Flarum theme** (light/dark) rather than the OS theme
- On narrow screens the filename expands to fill available width; audio controls shrink to their natural size
- The bar has a **close button** that stops playback and dismisses the bar
- Bar rises above the Flarum composer when it is open
- Accessible: keyboard navigation, screen reader labels, respects `prefers-reduced-motion`
- Works seamlessly with [FoF Upload](https://github.com/FriendsOfFlarum/upload) when using a filename-link upload template (see below)

**Supported formats:** `mp3` · `wav` · `ogg` · `flac` · `m4a` · `aac` · `webm` · `mp4` · `mpeg` · `mpg` · `wave`

---

### Installation
```bash
composer require ekumanov/flarum-ext-inline-audio
```

### Update
```bash
composer update ekumanov/flarum-ext-inline-audio
php flarum cache:clear
```

### Uninstall
```bash
composer remove ekumanov/flarum-ext-inline-audio
```

---

### Admin Settings

All settings are found under **Extensions → Inline Audio Player** in the admin panel.

| Setting | Default | Description |
|---------|---------|-------------|
| Show download button on player bar | Off | Adds a download icon to the overlay player bar |
| Allow right-click on filename to save | On | Renders the in-post filename as an `<a download>` link, enabling the browser's native "Save link as" on right-click |
| Start playing immediately when a filename is clicked | On | Auto-plays the track when loaded; disable to require a manual play press |
| Hide numeric prefix from uploaded filenames | On | Strips the `timestamp-userId-` prefix that FoF Upload adds (e.g. `1774205518-685373-song.mp3` → `song.mp3`) |

---

### BBCode
```
[player]https://example.com/audio/track.mp3[/player]
```

---

### FoF Upload Integration

If you use [FoF Upload](https://github.com/FriendsOfFlarum/upload) and want audio files to automatically render as inline players after uploading — without requiring users to manually wrap links in `[player]` tags — you can register a filename-link upload template in your forum's `extend.php`.

FoF Upload does not ship with this template; add it yourself as follows:
```php
use FoF\Upload\Contracts\Template;
use FoF\Upload\File;
use Flarum\Foundation\AbstractServiceProvider;
use FoF\Upload\Helpers\Util;

class FilenameLink implements Template
{
    public function tag(): string   { return 'filenamelink'; }
    public function name(): string  { return 'Filename link'; }
    public function description(): string { return 'Generates a link with the filename as text'; }

    public function preview(File $file): string
    {
        return '[' . $file->base_name . '](' . $file->url . ')';
    }
}

class FilenameLinkServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        $this->container->make(Util::class)
            ->addRenderTemplate($this->container->make(FilenameLink::class));
    }
}

// In your return array:
(new Extend\ServiceProvider())->register(FilenameLinkServiceProvider::class),
```

Once registered, select **Filename link** as the upload template in the FoF Upload admin settings.

To restrict the template to audio files only, set a MIME type filter in FoF Upload using this regex:
```
^audio\/(flac|x-flac|mp3|x-mp3|mpg|mpeg|mpeg3|x-mpeg|x-mpeg3|x-mpg|x-mp4a|x-mpegaudio|mp4|vnd.wave|wav|wave|x-wav|x-pn-wav|ogg|x-ogg|x-ogg-flac)
```

---

### Compatibility

| Branch | Flarum version |
|--------|---------------|
| `main` (this) | Flarum 2.0+ |
| [`1.x`](https://github.com/ekumanov/flarum-ext-inline-audio/tree/1.x) | Flarum 1.8 |

---

### Links

* [GitHub](https://github.com/ekumanov/flarum-ext-inline-audio)
* [Packagist](https://packagist.org/packages/ekumanov/flarum-ext-inline-audio)
