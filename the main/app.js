(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Menyu: bosilgan havola faol bo'ladi ---------- */
    const links = document.querySelectorAll('.main_a');
    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            // Faqat hali tayyor bo'lmagan ("#") havolalar to'xtatiladi,
            // haqiqiy sahifalarga (masalan menu.html) o'tish ishlaydi
            if (link.getAttribute('href') === '#') e.preventDefault();
            links.forEach((l) => l.classList.remove('is-active'));
            link.classList.add('is-active');
        });
    });

    if (reduceMotion) return; // harakat o'chirilgan bo'lsa, matnlar oddiy holatda qoladi

    /* ---------- 1) "taomlarimiz": harf-harf chiqadi va to'lqin bo'ladi ---------- */
    const title = document.querySelector('.hero_mak');
    if (title) {
        const text = title.textContent.trim();
        title.setAttribute('aria-label', text);
        title.textContent = '';
        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'ch';
            span.setAttribute('aria-hidden', 'true');
            span.style.setProperty('--i', i);
            span.textContent = char;
            title.appendChild(span);
        });
    }

    /* ---------- 2) Sarlavha yozilib chiqadi (typewriter) ---------- */
    const typed = document.querySelector('.hero_h1');
    if (typed) {
        const text = typed.textContent.trim().replace(/\s+/g, ' ');
        typed.setAttribute('aria-label', text);
        typed.style.minHeight = typed.offsetHeight + 'px'; // sahifa sakramasligi uchun
        typed.textContent = '';

        const node = document.createElement('span');
        node.setAttribute('aria-hidden', 'true');
        typed.appendChild(node);
        typed.classList.add('is-typing');

        let i = 0;
        setTimeout(function tick() {
            node.textContent = text.slice(0, ++i);
            if (i < text.length) setTimeout(tick, 45);
        }, 900);
    }

    /* ---------- 3) Matnlar so'zma-so'z ochiladi ---------- */
    const targets = document.querySelectorAll(
        '.hero_text, .the_h1, .the_text, .inner_h1, .inner_text'
    );

    targets.forEach((el) => {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        words.forEach((word, i) => {
            const wrap = document.createElement('span');
            wrap.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = word;
            inner.style.setProperty('--d', Math.min(i * 35, 1400) + 'ms');
            wrap.appendChild(inner);
            el.appendChild(wrap);
            if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.25 }
    );

    targets.forEach((el) => observer.observe(el));
})();