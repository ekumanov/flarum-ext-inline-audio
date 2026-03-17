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

    function filenameFromUrl(url) {
        try { return decodeURIComponent(url.split('/').pop().split('?')[0]); }
        catch (e) { return url.split('/').pop().split('?')[0]; }
    }

    function processPost(el) {
        // Auto-detected audio links → build full collapsible player
        el.querySelectorAll('a[href]:not([data-ap])').forEach((a) => {
            if (!audioRe.test(a.getAttribute('href'))) return;
            a.setAttribute('data-ap', '1');

            const details = document.createElement('details');
            details.className = 'pc-audio-wrap';

            const summary = document.createElement('summary');
            summary.className = 'pc-audio-name';
            summary.textContent = getFilename(a);

            const au = document.createElement('audio');
            au.controls = true;
            au.preload = 'none';
            au.src = a.href;
            au.setAttribute('aria-label', summary.textContent);

            details.appendChild(summary);
            details.appendChild(au);
            a.parentNode.replaceChild(details, a);
        });

        // [player] BBCode → PHP already output <details>, just fill in the filename
        el.querySelectorAll('details.pc-audio-wrap[data-audio-url]:not([data-ap])').forEach((details) => {
            details.setAttribute('data-ap', '1');
            const url = details.getAttribute('data-audio-url');
            const name = filenameFromUrl(url);
            const summary = details.querySelector('.pc-audio-name');
            if (summary) summary.textContent = name;
            const au = details.querySelector('audio');
            if (au) au.setAttribute('aria-label', name);
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
        document.querySelectorAll('audio').forEach((audio) => {
            if (audio !== e.target) {
                audio.pause();
                audio.closest('.pc-audio-wrap')?.removeAttribute('data-playing');
            }
        });
        e.target.closest('.pc-audio-wrap')?.setAttribute('data-playing', '');
    }, true);

    document.addEventListener('pause', (e) => {
        if (e.target.tagName !== 'AUDIO') return;
        e.target.closest('.pc-audio-wrap')?.removeAttribute('data-playing');
    }, true);
});
