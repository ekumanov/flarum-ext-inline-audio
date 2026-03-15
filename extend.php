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
                '<audio controls preload="none" src="{URL}" style="width:100%;max-width:420px;height:36px;"></audio>'
            );
        }),

    new Extend\Locales(__DIR__ . '/locale'),
];
