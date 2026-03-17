import app from 'flarum/forum/app';

// Set to false to load the track into the bar without auto-starting playback
const AUTO_PLAY_ON_SELECT = true;

app.initializers.add('ekumanov/flarum-ext-inline-audio', () => {
    const audioRe = /\.(mp3|wav|ogg|flac|m4a|mpeg|mpg|mp4|wave|aac|webm)(\?[^#]*)?(#.*)?$/i;

    // ── Build the global player bar ───────────────────────────────────────────

    const bar = document.createElement('div');
    bar.className = 'pc-player-bar';
    bar.hidden = true;
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Audio player');

    const barName = document.createElement('button');
    barName.className = 'pc-player-bar-name';
    barName.setAttribute('aria-label', 'Scroll to post');

    const barAudio = document.createElement('audio');
    barAudio.controls = true;
    barAudio.preload = 'none';

    const barClose = document.createElement('button');
    barClose.className = 'pc-player-bar-close';
    barClose.setAttribute('aria-label', 'Close player');
    barClose.textContent = '✕';

    bar.append(barName, barAudio, barClose);
    document.body.appendChild(bar);

    // ── Track the active filename button ──────────────────────────────────────

    let currentBtn = null;

    function setCurrentBtn(btn) {
        if (currentBtn) {
            currentBtn.removeAttribute('data-current');
            currentBtn.removeAttribute('data-playing');
            currentBtn.setAttribute('aria-label', 'Play ' + currentBtn.textContent);
        }
        currentBtn = btn;
        if (btn) {
            btn.setAttribute('data-current', '');
            btn.setAttribute('aria-label', 'Pause ' + btn.textContent);
        }
    }

    // ── Load a track into the bar ─────────────────────────────────────────────

    function loadTrack(url, name, btn) {
        setCurrentBtn(btn);
        barName.textContent = name;
        barName.setAttribute('aria-label', 'Scroll to post: ' + name);
        barAudio.src = url;
        bar.hidden = false;
        if (AUTO_PLAY_ON_SELECT) barAudio.play();
    }

    // ── Bar controls ──────────────────────────────────────────────────────────

    barName.addEventListener('click', () => {
        if (currentBtn) currentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    barClose.addEventListener('click', () => {
        barAudio.pause();
        barAudio.src = '';
        bar.hidden = true;
        setCurrentBtn(null);
    });

    barAudio.addEventListener('play', () => {
        bar.setAttribute('data-playing', '');
        if (currentBtn) {
            currentBtn.setAttribute('data-playing', '');
            currentBtn.setAttribute('aria-label', 'Pause ' + currentBtn.textContent);
        }
    });

    barAudio.addEventListener('pause', () => {
        bar.removeAttribute('data-playing');
        if (currentBtn) {
            currentBtn.removeAttribute('data-playing');
            currentBtn.setAttribute('aria-label', 'Resume ' + currentBtn.textContent);
        }
    });

    barAudio.addEventListener('ended', () => {
        bar.hidden = true;
        setCurrentBtn(null);
    });

    // ── Adjust bar position when Flarum composer is open ─────────────────────

    function adjustBarForComposer() {
        const composer = document.querySelector('.Composer');
        if (!composer || composer.classList.contains('Composer--minimized')) {
            bar.style.bottom = '';
        } else {
            bar.style.bottom = composer.offsetHeight + 'px';
        }
    }

    new MutationObserver(adjustBarForComposer).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
    });

    // ── Helpers ───────────────────────────────────────────────────────────────

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

    function makeButton(url, name) {
        const btn = document.createElement('button');
        btn.className = 'pc-audio-name';
        btn.setAttribute('data-audio-url', url);
        btn.setAttribute('aria-label', 'Play ' + name);
        btn.textContent = name;
        btn.addEventListener('click', () => {
            if (btn === currentBtn) {
                barAudio.paused ? barAudio.play() : barAudio.pause();
            } else {
                loadTrack(url, name, btn);
            }
        });
        return btn;
    }

    // ── Process post ──────────────────────────────────────────────────────────

    function processPost(el) {
        // Auto-detected audio links → replace <a> with <span><button>
        el.querySelectorAll('a[href]:not([data-ap])').forEach((a) => {
            if (!audioRe.test(a.getAttribute('href'))) return;
            a.setAttribute('data-ap', '1');

            const wrap = document.createElement('span');
            wrap.className = 'pc-audio-wrap';
            wrap.appendChild(makeButton(a.href, getFilename(a)));
            a.parentNode.replaceChild(wrap, a);
        });

        // [player] BBCode → PHP outputs <span class="pc-audio-wrap" data-audio-url="...">
        el.querySelectorAll('span.pc-audio-wrap[data-audio-url]:not([data-ap])').forEach((wrap) => {
            wrap.setAttribute('data-ap', '1');
            const url = wrap.getAttribute('data-audio-url');
            wrap.appendChild(makeButton(url, filenameFromUrl(url)));
        });
    }

    // ── MutationObserver ──────────────────────────────────────────────────────

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
});
