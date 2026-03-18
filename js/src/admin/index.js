import app from 'flarum/admin/app';

app.initializers.add('ekumanov/flarum-ext-inline-audio', () => {
    app.extensionData
        .for('ekumanov-inline-audio')
        .registerSetting({
            setting: 'ekumanov-inline-audio.showDownloadButton',
            type: 'boolean',
            label: app.translator.trans('ekumanov-inline-audio.admin.settings.show_download_button'),
        });
});
