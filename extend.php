<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->css(__DIR__ . '/resources/css/audio-player.css')
        ->js(__DIR__ . '/js/dist/forum.js'),

    (new Extend\Formatter)
        ->configure(function ($config) {
            $config->BBCodes->addCustom(
                '[player]{URL}[/player]',
                '<details class="pc-audio-wrap" data-audio-url="{URL}"><summary class="pc-audio-name"></summary><audio controls preload="none" src="{URL}"></audio></details>'
            );
        }),

    new Extend\Locales(__DIR__ . '/locale'),
];
