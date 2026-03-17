> ℹ️ If you've been using [Inline Audio (aka Audio URL to Player)](https://discuss.flarum.org/d/27255-inline-audio-aka-audio-url-to-player), that extension has been abandoned. This is a fresh, actively maintained replacement built for Flarum 2.0+ (and 1.8 via the [`1.x` branch](https://github.com/ekumanov/flarum-ext-inline-audio/tree/1.x)).

---

## Inline Audio Player

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ekumanov/flarum-ext-inline-audio/blob/main/LICENSE)
[![Latest Stable Version](https://img.shields.io/packagist/v/ekumanov/flarum-ext-inline-audio.svg)](https://packagist.org/packages/ekumanov/flarum-ext-inline-audio)
[![Total Downloads](https://img.shields.io/packagist/dt/ekumanov/flarum-ext-inline-audio.svg)](https://packagist.org/packages/ekumanov/flarum-ext-inline-audio)

A Flarum extension that automatically converts audio file links in posts into inline players, with an optional `[player]` BBCode tag.

![Screenshot](https://raw.githubusercontent.com/ekumanov/flarum-ext-inline-audio/main/docs/player.png)

---

### Features

- Auto-detects links to audio files and replaces them with an inline player — no BBCode required
- When a player starts, any other playing audio on the page is paused automatically
- `[player]URL[/player]` BBCode for explicit embedding
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
```

### Uninstall
```bash
composer remove ekumanov/flarum-ext-inline-audio
```

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
