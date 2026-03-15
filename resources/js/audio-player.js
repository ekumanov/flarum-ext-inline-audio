(function () {
    var audioRe = /\.(mp3|wav|ogg|flac|m4a|mpeg|mpg|mp4|wave|aac|webm)(\?[^#]*)?(#.*)?$/i;

    function getFilename(a) {
        var text = a.textContent.trim();
        var host = a.href.replace(/^https?:\/\//, '').split('/')[0];
        var di = text.indexOf(host);
        if (di > 0 && text.substring(di - 3, di) !== '://') text = text.substring(0, di).trim();
        var extMatch = text.match(/^(.+?\.(mp3|wav|ogg|flac|m4a|mpeg|mpg|mp4|wave|aac|webm))/i);
        if (extMatch) text = extMatch[1];
        if (/^https?:\/\//.test(text)) {
            try { return decodeURIComponent(text.split('/').pop().split('?')[0]); }
            catch (e) { return text.split('/').pop().split('?')[0]; }
        }
        return text || decodeURIComponent(a.href.split('/').pop().split('?')[0]);
    }

    function processPost(el) {
        var links = el.querySelectorAll('a[href]:not([data-ap])');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            if (!audioRe.test(a.getAttribute('href'))) continue;
            a.setAttribute('data-ap', '1');

            var wrap = document.createElement('span');
            wrap.className = 'pc-audio-wrap';

            var name = document.createElement('a');
            name.className = 'pc-audio-name';
            name.href = a.href;
            name.target = '_blank';
            name.download = '';
            name.setAttribute('data-ap', '1');
            name.textContent = getFilename(a);

            var au = document.createElement('audio');
            au.controls = true;
            au.preload = 'none';
            au.src = a.href;
            au.setAttribute('aria-label', name.textContent);

            wrap.appendChild(name);
            wrap.appendChild(au);
            a.parentNode.replaceChild(wrap, a);
        }
    }

    new MutationObserver(function (muts) {
        for (var m = 0; m < muts.length; m++) {
            for (var n = 0; n < muts[m].addedNodes.length; n++) {
                var node = muts[m].addedNodes[n];
                if (node.nodeType !== 1) continue;
                if (node.classList && node.classList.contains('Post-body')) {
                    processPost(node);
                } else if (node.querySelectorAll) {
                    var bodies = node.querySelectorAll('.Post-body');
                    for (var b = 0; b < bodies.length; b++) processPost(bodies[b]);
                    if (!bodies.length && node.closest) {
                        var parent = node.closest('.Post-body');
                        if (parent) processPost(parent);
                    }
                }
            }
        }
    }).observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener('play', function (e) {
        if (e.target.tagName !== 'AUDIO') return;
        var audios = document.querySelectorAll('.pc-audio-wrap audio');
        for (var i = 0; i < audios.length; i++) {
            if (audios[i] !== e.target) audios[i].pause();
        }
    }, true);
})();
