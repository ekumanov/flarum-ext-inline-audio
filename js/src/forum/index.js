import app from 'flarum/forum/app';

app.initializers.add('ekumanov/flarum-ext-inline-audio', () => {
    const audioRe = /\.(mp3|wav|ogg|flac|m4a|mpeg|mpg|mp4|wave|aac|webm)(\?[^#]*)?(#.*)?$/i;

    function getFilename(a) {
        let text = a.textContent.trim();
        const host = a.href.replace(/^https?:\/\//, '').split('/')[0];
        const di = text.indexOf(host);
        if (di > 0 && text.substring(di - 3, di) !== '://') text = text.substring(0, di).trim();
        const extMatch = text.match(/^(.+?\.(mp3|wav|ogg|flac|m4a|mpeg|mpg|mp4|wave|aac|webm))/i);
        if (extMatch) text = extMatch[1];
        if (/^https?:\/\//.test(text)) {
            try { return decodeURIComponent(text.split('/').pop().split('?')[0]); }
            catch (e) { return text.split('/').pop().split('?')[0]; }
        }
        return text || decodeURIComponent(a.href.split('/').pop().split('?')[0]);
    }

    function processPost(el) {
        el.querySelectorAll('a[href]:not([data-ap])').forEach((a) => {
            if (!audioRe.test(a.getAttribute('href'))) return;
            a.setAttribute('data-ap', '1');

            const wrap = document.createElement('span');
            wrap.className = 'pc-audio-wrap';

            const name = document.createElement('a');
            name.className = 'pc-audio-name';
            name.href = a.href;
            name.target = '_blank';
            name.download = '';
            name.setAttribute('data-ap', '1');
            name.textContent = getFilename(a);

            const au = document.createElement('audio');
            au.controls = true;
            au.preload = 'none';
            au.src = a.href;
            au.setAttribute('aria-label', name.textContent);

            wrap.appendChild(name);
            wrap.appendChild(au);
            a.parentNode.replaceChild(wrap, a);
        });
    }

    new MutationObserver((muts) => {
        muts.forEach((m) => {
            m.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) return;
                if (node.classList && node.classList.contains('Post-body')) {
                    processPost(node);
                } else if (node.querySelectorAll) {
                    const bodies = node.querySelectorAll('.Post-body');
                    bodies.forEach((b) => processPost(b));
                    if (!bodies.length && node.closest) {
                        const parent = node.closest('.Post-body');
                        if (parent) processPost(parent);
                    }
                }
            });
        });
    }).observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('play', (e) => {
        if (e.target.tagName !== 'AUDIO') return;
        document.querySelectorAll('.pc-audio-wrap audio').forEach((audio) => {
            if (audio !== e.target) audio.pause();
        });
    }, true);
});
