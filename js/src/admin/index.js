import app from 'flarum/admin/app';

app.initializers.add('ekumanov/flarum-ext-inline-audio', () => {
    app.registry
        .for('ekumanov-inline-audio')
        .registerSetting({
            setting: 'ekumanov-inline-audio.showDownloadButton',
            type: 'boolean',
            label: app.translator.trans('ekumanov-inline-audio.admin.settings.show_download_button'),
        })
        .registerSetting({
            setting: 'ekumanov-inline-audio.showRightClickDownload',
            type: 'boolean',
            label: app.translator.trans('ekumanov-inline-audio.admin.settings.show_right_click_download'),
        })
        .registerSetting({
            setting: 'ekumanov-inline-audio.autoPlay',
            type: 'boolean',
            label: app.translator.trans('ekumanov-inline-audio.admin.settings.auto_play'),
        });
});
