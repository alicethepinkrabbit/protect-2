(function () {
    const overlay = document.getElementById('fx-overlay');
    const msg = document.getElementById('fx-message');
    const navLinks = document.querySelectorAll('.nav a');

    function showOverlay(text = "", ms = 500) {
        if (!overlay || !msg) return Promise.resolve();

        msg.textContent = text;
        overlay.classList.add('show');
        return new Promise(resolve => setTimeout(() => {
            overlay.classList.remove('show');
            resolve();
        }, ms));
    }

    function pageGlitch(ms = 1000) {
        document.body.classList.add('page-glitch');
        return new Promise(resolve => setTimeout(() => {
            document.body.classList.remove('page-glitch');
            resolve();
        }, ms));
    }

    function buttonGlitch(el, ms = 1000) {
        if (!el.hasAttribute('data-label')) el.setAttribute('data-label', el.textContent.trim());
        el.classList.add('glitching');
        return new Promise(resolve => setTimeout(() => {
            el.classList.remove('glitching');
            resolve();
        }, ms));
    }


    async function typeOnLink(el, lines, charDelay = 35, linePause = 200) {
        const original = el.textContent;
        for (let i = 0; i < lines.length; i++) {
            el.textContent = "meow";
            const str = lines[i];
            for (let j = 0; j < str.length; j++) {
                el.textContent += str[j];
                await new Promise(r => setTimeout(r, charDelay));
            }
            await new Promise(r => setTimeout(r, linePause));
        }

        el.setAttribute('data-label', el.textContent.trim());
        return () => {
            el.textContent = original;
            el.setAttribute('data-label', original.trim());
        };
    }

    function isModifiedClick(e) {
        return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;
    }

    function routeFor(el) {
        const href = (el.getAttribute('href') || "").toLowerCase();

        if (href.includes("fake-it")) return "fake";
        if (href.includes("glance-back")) return "glance";
        if (href.includes("realistic-day")) return "realistic";

        if (href === "/" || href === "./" || href === "../") return "about";
        if (/(^|\/)index\.html$/.test(href) &&
            !href.includes("fake-it") &&
            !href.includes("glance-back") &&
            !href.includes("realistic-day")) {
            return "about";
        }

        return "default";
    }
    navLinks.forEach(a => {
        a.addEventListener('click', async (e) => {
            if (isModifiedClick(e)) return;
            e.preventDefault();

            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const href = a.getAttribute('href');

            const route = routeFor(a);

            try {
                switch (route) {
                    case "about":
                        if (!reduced) await showOverlay("", 200);
                        window.location.href = href;
                        break;
                    case "fake":
                        if (!reduced) {
                            await Promise.all([buttonGlitch(a, 1000), pageGlitch(1000)]);
                        }
                        window.location.href = href;
                        break;
                    case "glance":
                        if (!reduced) await showOverlay("what are you thinking about?", 1500);
                        window.location.href = href;
                        break;
                    case "realistic":
                        if (!reduced) {
                            const lines = [
                                "< a realistic day in my life living in New York City >",
                                "< wake up // subway // screens // repeat >",
                                "< are we documenting or performing? >",
                                "< what is real now? >"
                            ];
                            const restore = await typeOnLink(a, lines, 28, 200);
                            await new Promise(r => setTimeout(r, 200));
                            restore && restore();
                        }
                        window.location.href = href;
                        break;
                    default:
                        window.location.href = href;
                }
            } catch {

                window.location.href = href;
            }
        });
    });
})();