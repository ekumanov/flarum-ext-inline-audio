# Inline Audio Player for Flarum

A Flarum extension that automatically converts audio file links in posts into inline `<audio>` players, with an optional `[player]` BBCode tag.

## Features

- Auto-detects links to audio files (`.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, `.webm`, and more) and replaces them with an inline player
- Pauses other players on the page when a new one starts
- `[player]URL[/player]` BBCode for explicit embedding
- Works seamlessly with [FoF Upload](https://github.com/FriendsOfFlarum/upload) when using a filename-link upload template (see below)

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

## FoF Upload Integration

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

To restrict the template to audio files only, set a MIME type filter in FoF Upload using a regex such as:

```
^audio\/(flac|x-flac|mp3|x-mp3|mpg|mpeg|mpeg3|x-mpeg|x-mpeg3|x-mpg|x-mp4a|x-mpegaudio|mp4|vnd.wave|wav|wave|x-wav|x-pn-wav|ogg|x-ogg|x-ogg-flac)
```

## License

MIT
