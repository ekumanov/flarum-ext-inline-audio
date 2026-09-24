import app from 'flarum/forum/app';

app.initializers.add('ekumanov/flarum-ext-inline-audio', () => {
    const audioRe = /\.(mp3|wav|ogg|flac|m4a|mpeg|mpg|mp4|wave|aac|webm)(\?[^#]*)?(#.*)?$/i;

    // ── Global player bar (created lazily on first play) ─────────────────────
    //
    // Building the bar — in particular creating an <audio controls> element and
    // appending it to <body> — costs ~25ms on a phone-class CPU. The bar is
    // hidden until a track is loaded, so none of this may run during app.boot:
    // everything bar-related (DOM, listeners, Media Session handlers, composer
    // observer) is deferred to the first play click via ensureBar().

    let bar = null;
    let barName = null;
    let barAudio = null;
    let barDownload = null;

    function ensureBar() {
        if (bar) return;

        bar = document.createElement('div');
        bar.className = 'pc-player-bar';
        bar.hidden = true;
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', 'Audio player');

        barName = document.createElement('button');
        barName.className = 'pc-player-bar-name';
        barName.setAttribute('aria-label', 'Scroll to post');

        barAudio = document.createElement('audio');
        barAudio.controls = true;
        barAudio.preload = 'none';

        barDownload = document.createElement('a');
        barDownload.className = 'pc-player-bar-download';
        barDownload.setAttribute('aria-label', 'Download');
        barDownload.hidden = app.forum.attribute('ekumanov-inline-audio.showDownloadButton') === false;

        const barClose = document.createElement('button');
        barClose.className = 'pc-player-bar-close';
        barClose.setAttribute('aria-label', 'Close player');
        barClose.textContent = '✕';

        bar.append(barName, barAudio, barDownload, barClose);
        document.body.appendChild(bar);

        // ── Media Session API (lock screen / OS media controls) ──────────────

        if ('mediaSession' in navigator) {
            const safeSet = (action, handler) => {
                try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) { /* unsupported action */ }
            };
            safeSet('play', () => playBar());
            safeSet('pause', () => barAudio.pause());
            safeSet('stop', () => { barAudio.pause(); barAudio.currentTime = 0; });
        }

        // ── Bar controls ──────────────────────────────────────────────────────

        barDownload.addEventListener('click', (e) => {
            e.preventDefault();
            triggerDownload(barDownload.href, barDownload.getAttribute('download') || barDownload.href.split('/').pop());
        });

        barName.addEventListener('click', () => {
            // PostStream may have unloaded and re-rendered the post since the
            // track started, leaving currentBtn detached — find its replacement.
            if (currentBtn && !currentBtn.isConnected) setCurrentBtn(findButtonFor(currentUrl));
            if (currentBtn) currentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        barClose.addEventListener('click', () => {
            barAudio.pause();
            barAudio.src = '';
            bar.hidden = true;
            currentUrl = null;
            setCurrentBtn(null);
            clearMediaSession();
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
            currentUrl = null;
            setCurrentBtn(null);
        });

        // ── Adjust bar position when Flarum composer is open ─────────────────
        //
        // Once mounted, core's composer only ever changes its classes and
        // (jQuery-animated) height, so a ResizeObserver on that one element
        // sees every open/close/minimize/drag-resize, frame by frame. It
        // replaces a body-wide class observer that forced a layout on every
        // class toggle anywhere on the page for the rest of the session.
        //
        // Core mounts `.Composer` into `#composer` lazily, on first open, so
        // it may not exist yet: watch that one host for the mount (childList
        // only, no subtree), then hand over to the ResizeObserver.
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(adjustBarForComposer);
            const attach = () => {
                const composer = document.querySelector('.Composer');
                if (composer) resizeObserver.observe(composer);
                return !!composer;
            };
            const host = document.getElementById('composer');
            if (!attach() && host) {
                const mountObserver = new MutationObserver(() => {
                    if (attach()) mountObserver.disconnect();
                });
                mountObserver.observe(host, { childList: true });
            }
        }
        // The composer may already be open by the time the bar is created.
        adjustBarForComposer();
    }

    // Track whatever height the composer currently occupies — including the
    // minimized strip, which the bar deliberately sits above. (Don't special-case
    // minimized: Flarum 1.8 and 2.x class it `minimized`, not `Composer--minimized`.)
    function adjustBarForComposer() {
        if (!bar || bar.hidden) return;
        const composer = document.querySelector('.Composer');
        const h = composer ? composer.offsetHeight : 0;
        bar.style.bottom = h ? h + 'px' : '';
    }

    // ── Track the active filename button ──────────────────────────────────────

    // The playing track is identified by URL, not by button: PostStream can
    // unload and re-render a post (or the user can navigate away and back)
    // while it plays, and the fresh button must still act as pause/resume.
    let currentBtn = null;
    let currentUrl = null;

    function findButtonFor(url) {
        if (!url) return null;
        for (const b of document.querySelectorAll('.pc-audio-name[data-audio-url]')) {
            if (b.getAttribute('data-audio-url') === url) return b;
        }
        return null;
    }

    function playBar() {
        // play() rejects on autoplay denial, a 404, or an AbortError from
        // switching tracks quickly; none of those deserve an uncaught error.
        const p = barAudio.play();
        if (p && p.catch) p.catch(() => {});
    }

    function setCurrentBtn(btn) {
        if (currentBtn) {
            currentBtn.removeAttribute('data-current');
            currentBtn.removeAttribute('data-playing');
            currentBtn.setAttribute('aria-label', 'Play ' + currentBtn.textContent);
        }
        currentBtn = btn;
        if (btn) {
            btn.setAttribute('data-current', '');
            if (barAudio && !barAudio.paused) {
                btn.setAttribute('data-playing', '');
                btn.setAttribute('aria-label', 'Pause ' + btn.textContent);
            } else {
                btn.setAttribute('aria-label', 'Resume ' + btn.textContent);
            }
        }
    }

    // ── Load a track into the bar ─────────────────────────────────────────────

    function loadTrack(url, name, btn) {
        ensureBar();
        currentUrl = url;
        setCurrentBtn(btn);
        barName.textContent = name;
        barName.setAttribute('aria-label', 'Scroll to post: ' + name);
        barAudio.src = url;
        barDownload.href = url;
        barDownload.setAttribute('download', name);
        barDownload.setAttribute('aria-label', 'Download ' + name);
        bar.hidden = false;
        updateMediaSession(name);
        if (app.forum.attribute('ekumanov-inline-audio.autoPlay') !== false) playBar();
    }

    // ── Media Session API (lock screen / OS media controls) ──────────────────

    function updateMediaSession(name) {
        if (!('mediaSession' in navigator)) return;
        try {
            navigator.mediaSession.metadata = new MediaMetadata({ title: name });
        } catch (e) { /* ignore */ }
    }

    function clearMediaSession() {
        if (!('mediaSession' in navigator)) return;
        try { navigator.mediaSession.metadata = null; } catch (e) { /* ignore */ }
    }

    // ── Download helper (used by bar download button) ─────────────────────────

    function triggerDownload(url, filename) {
        fetch(url)
            .then((r) => { if (!r.ok) throw new Error(); return r.blob(); })
            .then((blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(a.href), 10000);
            })
            .catch(() => window.open(url, '_blank'));
    }

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
        return text || filenameFromUrl(a.href);
    }

    function filenameFromUrl(url) {
        try { return decodeURIComponent(url.split('/').pop().split('?')[0]); }
        catch (e) { return url.split('/').pop().split('?')[0]; }
    }

    function parseStartTime(s) {
        if (!s) return 0;
        const parts = s.split(':');
        if (parts.some((p) => !/^\d+$/.test(p))) return 0;
        const nums = parts.map(Number);
        if (nums.length === 1) return nums[0];
        if (nums.length === 2) return nums[0] * 60 + nums[1];
        if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
        return 0;
    }

    function applyStartFragment(url, seconds) {
        if (!seconds) return url;
        return url.replace(/#.*$/, '') + '#t=' + seconds;
    }

    function stripUploadPrefix(name) {
        if (app.forum.attribute('ekumanov-inline-audio.stripUploadPrefix') === false) return name;
        return name.replace(/^\d+-\d+-/, '');
    }

    function makeButton(url, name) {
        name = stripUploadPrefix(name);
        const useLink = app.forum.attribute('ekumanov-inline-audio.showRightClickDownload') !== false;
        const btn = document.createElement(useLink ? 'a' : 'button');
        btn.className = 'pc-audio-name';
        btn.setAttribute('data-audio-url', url);
        btn.setAttribute('data-ap', '1');
        btn.setAttribute('aria-label', 'Play ' + name);
        btn.title = name;
        const nameSpan = document.createElement('span');
        nameSpan.className = 'pc-audio-name-text';
        nameSpan.textContent = name;
        btn.appendChild(nameSpan);
        if (useLink) {
            btn.href = url;
            btn.setAttribute('download', name);
        }
        if (url === currentUrl && bar && !bar.hidden) {
            // A re-render of the post that holds the playing track: adopt the
            // new button once it is in the document (the old one is detached).
            queueMicrotask(() => {
                if (btn.isConnected && url === currentUrl && (!currentBtn || !currentBtn.isConnected)) setCurrentBtn(btn);
            });
        }
        btn.addEventListener('click', (e) => {
            if (useLink) e.preventDefault();
            if (url === currentUrl && bar && !bar.hidden) {
                if (btn !== currentBtn) setCurrentBtn(btn);
                barAudio.paused ? playBar() : barAudio.pause();
            } else {
                loadTrack(url, name, btn);
            }
        });
        return btn;
    }

    // ── Process post ──────────────────────────────────────────────────────────

    function processPost(el) {
        // Never rewrite a live rich-text editor. fof/rich-text's TipTap/ProseMirror editor
        // element carries the `Post-body` class (to inherit post styling) but is a
        // contenteditable surface whose DOM ProseMirror owns: it re-renders to restore its
        // model whenever that DOM is mutated from outside. Replacing an audio <a> in there
        // makes ProseMirror redraw the <a>, which re-triggers this observer → an unbounded
        // rewrite/redraw loop that hard-hangs the browser (seen when uploading/inserting an
        // mp3 in the composer). Links must stay plain while editing; they become players once
        // the post is rendered.
        if (el.isContentEditable) return;

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
            const start = parseStartTime(wrap.getAttribute('data-start'));
            const title = (wrap.getAttribute('data-title') || '').trim();
            const displayName = title || filenameFromUrl(url);
            wrap.appendChild(makeButton(applyStartFragment(url, start), displayName));
        });
    }

    // ── MutationObserver ──────────────────────────────────────────────────────
    // Registered at init on purpose (it must see the very first render's posts);
    // registration itself is sub-0.1ms, the cost was only ever the bar build.

    // Posts are collected into a Set first: a batch that adds N nodes inside
    // one post (our own wraps, link-preview cards, cls-fix wrappers) used to
    // re-scan that whole post N times.
    new MutationObserver((muts) => {
        const posts = new Set();
        muts.forEach((m) => {
            m.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) return;
                if (node.classList.contains('Post-body')) {
                    posts.add(node);
                    return;
                }
                const parent = node.closest('.Post-body');
                if (parent) {
                    posts.add(parent);
                } else {
                    node.querySelectorAll('.Post-body').forEach((b) => posts.add(b));
                }
            });
        });
        posts.forEach(processPost);
    }).observe(document.documentElement, { childList: true, subtree: true });
});
