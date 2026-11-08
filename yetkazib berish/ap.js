(() => {
    /* ====== SOZLAMALAR (o'zingizga moslang) ====== */
    const RESTAURANT = 'Dunyo restaurant';

    // Server manzili
    const API_URL = window.location.origin;

    const DELIVERY_FEE = 15000;   // yetkazib berish narxi
    const FREE_FROM = 150000;     // shu summadan yuqori buyurtmada yetkazish bepul
    const MIN_ORDER = 50000;      // yetkazib berish uchun eng kam buyurtma
    const ETA = '35–50 daqiqa';   // taxminiy yetkazish vaqti

    /* ====== YETKAZIB BERISH MENYUSI (narxlar namuna, o'zingiznikiga almashtiring) ====== */
    const CATS = ['Hammasi', 'Setlar', 'Osh', 'Go’sht', 'Shashlik', 'Sho’rva', 'Salat', 'Non va ichimlik'];

    const DISHES = [
        {
            id: 'dset1', cat: 'Setlar', name: 'Oilaviy set (4 kishilik)', price: 175000, hot: true, emoji: '🍱',
            desc: '2 porsiya osh, 2 ta achichuk, 4 ta non va 1 l kompot.'
        },
        {
            id: 'dset2', cat: 'Setlar', name: 'Do’stlar seti', price: 190000, emoji: '🍱',
            desc: '10 ta aralash shashlik, 3 ta non va achichuk.'
        },
        {
            id: 'dset3', cat: 'Setlar', name: 'Juftlik seti', price: 105000, emoji: '🍱',
            desc: 'Yumshoq go’sht, yangi sabzavotlar, non va 2 ta ichimlik.'
        },

        {
            id: 'dosh1', cat: 'Osh', name: 'To’y oshi', price: 45000, hot: true, img: '../images/osh.img.jpg', emoji: '🍛',
            desc: 'Sara guruch, mol go’shti, sabzi va zira. Qozonda damlangan.'
        },
        {
            id: 'dosh2', cat: 'Osh', name: 'Choyxona oshi', price: 38000, emoji: '🍛',
            desc: 'Yengil va xushbo’y osh.'
        },
        {
            id: 'dosh3', cat: 'Osh', name: 'Bayram oshi (qazi bilan)', price: 55000, emoji: '🍛',
            desc: 'Qazi, no’xat va mayiz qo’shilgan osh.'
        },

        {
            id: 'dgo1', cat: 'Go’sht', name: 'Yumshoq go’sht', price: 68000, hot: true, img: '../images/yumshoq.jpg', emoji: '🍖',
            desc: 'Yosh go’sht past olovda soatlab dimlangan.'
        },
        {
            id: 'dgo2', cat: 'Go’sht', name: 'Dimlama', price: 58000, emoji: '🍖',
            desc: 'Go’sht, kartoshka va sabzavotlar o’z sharbatida.'
        },
        {
            id: 'dgo3', cat: 'Go’sht', name: 'Qozon kabob', price: 72000, emoji: '🍖',
            desc: 'Qovurilgan go’sht va kartoshka, ko’katlar bilan.'
        },

        { id: 'dsh1', cat: 'Shashlik', name: 'Mol go’shti shashlik', price: 18000, emoji: '🍢', desc: 'Ko’mirda pishirilgan. 1 shish.' },
        { id: 'dsh2', cat: 'Shashlik', name: 'Jigar kabob', price: 15000, emoji: '🍢', desc: 'Yumshoq jigar, yog’ bilan. 1 shish.' },
        { id: 'dsh3', cat: 'Shashlik', name: 'Tovuq shashlik', price: 14000, emoji: '🍢', desc: 'Marinadlangan tovuq go’shti. 1 shish.' },
        { id: 'dsh4', cat: 'Shashlik', name: 'Lyulya kabob', price: 17000, emoji: '🍢', desc: 'Maydalangan go’shtdan. 1 shish.' },

        { id: 'dsho1', cat: 'Sho’rva', name: 'Mastava', price: 28000, emoji: '🍲', desc: 'Guruch, go’sht va sabzavotli quyuq sho’rva.' },
        { id: 'dsho2', cat: 'Sho’rva', name: 'Lag’mon', price: 36000, emoji: '🍲', desc: 'Qo’lda cho’zilgan lag’mon, go’sht qovurmasi bilan.' },
        { id: 'dsho3', cat: 'Sho’rva', name: 'Sho’rva', price: 32000, emoji: '🍲', desc: 'Katta bo’lak go’sht va kartoshkali.' },

        { id: 'dsal1', cat: 'Salat', name: 'Achichuk', price: 14000, emoji: '🥗', desc: 'Pomidor, piyoz va achchiq qalampir.' },
        { id: 'dsal2', cat: 'Salat', name: 'Toshkent salati', price: 26000, emoji: '🥗', desc: 'Go’sht, turp, sabzi va piyozli salat.' },
        { id: 'dsal3', cat: 'Salat', name: 'Yangi sabzavotlar', price: 22000, emoji: '🥗', desc: 'Bodring, pomidor, qalampir va ko’katlar.' },

        { id: 'dn1', cat: 'Non va ichimlik', name: 'Tandir non', price: 6000, emoji: '🫓', desc: 'Issiq, tandirdan yangi uzilgan.' },
        { id: 'dn2', cat: 'Non va ichimlik', name: 'Patir', price: 12000, emoji: '🫓', desc: 'Yumshoq, qatlamli patir non.' },
        { id: 'dn3', cat: 'Non va ichimlik', name: 'Kompot 1 l', price: 18000, emoji: '🧃', desc: 'Quritilgan mevalardan, sovuq.' },
        { id: 'dn4', cat: 'Non va ichimlik', name: 'Ayron 1 l', price: 16000, emoji: '🥛', desc: 'Sovuq, tuzli.' },
        { id: 'dn5', cat: 'Non va ichimlik', name: 'Mineral suv 1 l', price: 8000, emoji: '💧', desc: 'Gazsiz.' }
    ];

    /* ====== HOLAT ====== */
    const state = { cat: 'Hammasi', q: '', mode: 'delivery', pay: 'naqd', loc: '', done: null };
    let cart = {};
    try { cart = JSON.parse(localStorage.getItem('dunyo_delivery_cart')) || {}; } catch (e) { cart = {}; }

    const $ = (id) => document.getElementById(id);
    const fmt = (n) => Math.round(n).toLocaleString('ru-RU') + ' so’m';
    const byId = (id) => DISHES.find((d) => d.id === id);
    const saveCart = () => { try { localStorage.setItem('dunyo_delivery_cart', JSON.stringify(cart)); } catch (e) { /* e'tibor bermaymiz */ } };

    function toast(msg) {
        const el = document.createElement('div');
        el.className = 'toast';
        el.setAttribute('role', 'status');
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4500);
    }

    /* ====== HISOB-KITOB ====== */
    function calc() {
        let count = 0, sub = 0;
        Object.keys(cart).forEach((id) => {
            const d = byId(id);
            if (!d) return;
            count += cart[id];
            sub += cart[id] * d.price;
        });
        const fee = state.mode === 'delivery' && sub > 0 && sub < FREE_FROM ? DELIVERY_FEE : 0;
        return { count, sub, fee, total: sub + fee };
    }

    /* ====== MA'LUMOT CHIPLARI ====== */
    $('chips').innerHTML = [
        `Yetkazish <b>${fmt(DELIVERY_FEE)}</b>`,
        `<b>${fmt(FREE_FROM)}</b> dan yuqori buyurtmada bepul`,
        `Eng kam buyurtma <b>${fmt(MIN_ORDER)}</b>`,
        `Taxminan <b>${ETA}</b>`
    ].map((c) => `<li class="d_chip">${c}</li>`).join('');

    /* ====== TOIFALAR VA QIDIRUV ====== */
    function renderCats() {
        $('cats').innerHTML = CATS.map((c) =>
            `<button class="cat${c === state.cat ? ' is-active' : ''}" role="tab" aria-selected="${c === state.cat}" data-cat="${c}">${c}</button>`
        ).join('');
    }

    $('cats').addEventListener('click', (e) => {
        const b = e.target.closest('[data-cat]');
        if (!b) return;
        state.cat = b.dataset.cat;
        renderCats();
        renderDishes();
    });

    $('search').addEventListener('input', (e) => {
        state.q = e.target.value.trim().toLowerCase();
        renderDishes();
    });

    /* ====== TAOMLAR ====== */
    function controlHTML(id) {
        const q = cart[id] || 0;
        return q
            ? `<div class="step"><button type="button" data-act="dec" aria-label="Kamaytirish">−</button><span>${q}</span><button type="button" data-act="inc" aria-label="Ko’paytirish">+</button></div>`
            : `<button type="button" class="add" data-act="inc">Qo’shish</button>`;
    }

    function dishHTML(d, i) {
        const media = d.img
            ? `<img class="dish_img" src="${d.img}" alt="${d.name}" loading="lazy">`
            : `<div class="dish_img dish_emoji" aria-hidden="true">${d.emoji}</div>`;
        return `
        <article class="dish" data-id="${d.id}" style="animation-delay:${Math.min(i * 40, 400)}ms">
            ${d.hot ? '<span class="dish_badge">Mashhur</span>' : ''}
            ${media}
            <h3 class="dish_name">${d.name}</h3>
            <p class="dish_desc">${d.desc}</p>
            <div class="dish_foot">
                <span class="dish_price">${fmt(d.price)}</span>
                <div class="dish_ctrl">${controlHTML(d.id)}</div>
            </div>
        </article>`;
    }

    function renderDishes() {
        const list = DISHES.filter((d) =>
            (state.cat === 'Hammasi' || d.cat === state.cat) &&
            (!state.q || (d.name + ' ' + d.desc).toLowerCase().includes(state.q))
        );
        $('dishes').innerHTML = list.map(dishHTML).join('');
        $('empty').hidden = list.length > 0;
    }

    /* ====== SAVAT ====== */
    function change(id, delta) {
        const next = (cart[id] || 0) + delta;
        if (next <= 0) delete cart[id];
        else cart[id] = Math.min(next, 99);
        saveCart();

        const ctrl = $('dishes').querySelector(`[data-id="${id}"] .dish_ctrl`);
        if (ctrl) ctrl.innerHTML = controlHTML(id);
        updatePanel();
    }

    function onStepClick(e) {
        const btn = e.target.closest('[data-act]');
        const host = e.target.closest('[data-id]');
        if (!btn || !host) return;
        change(host.dataset.id, btn.dataset.act === 'inc' ? 1 : -1);
    }

    $('dishes').addEventListener('click', onStepClick);
    $('dItems').addEventListener('click', onStepClick);

    /* ====== BUYURTMA PANELI ====== */
    const row = (k, v, cls = '') => `<div class="sum_row ${cls}"><dt>${k}</dt><dd>${v}</dd></div>`;

    function updatePanel() {
        const c = calc();

        const ids = Object.keys(cart).filter(byId);
        $('dItems').innerHTML = ids.length
            ? ids.map((id) => {
                const d = byId(id);
                return `
                <li class="cart_row" data-id="${id}">
                    <div>
                        <div class="cart_row_name">${d.name}</div>
                        <div class="cart_row_price">${fmt(d.price)} × ${cart[id]} = ${fmt(d.price * cart[id])}</div>
                    </div>
                    <div class="step">
                        <button type="button" data-act="dec" aria-label="Kamaytirish">−</button>
                        <span>${cart[id]}</span>
                        <button type="button" data-act="inc" aria-label="Ko’paytirish">+</button>
                    </div>
                </li>`;
            }).join('')
            : '<li class="cart_empty">Savat bo’sh. Chap tomondagi menyudan taom tanlang.</li>';

        const feeText = state.mode === 'pickup' ? 'Olib ketish' : c.sub === 0 ? '—' : c.fee ? fmt(c.fee) : 'Bepul';
        $('dTotals').innerHTML = row('Taomlar', fmt(c.sub)) + row('Yetkazib berish', feeText) + row('Jami', fmt(c.total), 'is_total');

        // Yo'l-yo'riq matni
        const hint = $('dHint');
        hint.classList.remove('is-warn');
        if (!c.count) {
            hint.textContent = '';
        } else if (state.mode === 'pickup') {
            hint.textContent = 'Buyurtmangiz tayyor bo’lgach, restoranga kelib olib ketasiz.';
        } else if (c.sub < MIN_ORDER) {
            hint.textContent = `Yetkazib berish uchun eng kam buyurtma ${fmt(MIN_ORDER)}. Yana ${fmt(MIN_ORDER - c.sub)} qo’shing.`;
            hint.classList.add('is-warn');
        } else if (c.sub < FREE_FROM) {
            hint.textContent = `Yana ${fmt(FREE_FROM - c.sub)} qo’shsangiz, yetkazib berish bepul bo’ladi.`;
        } else {
            hint.textContent = 'Yetkazib berish bepul.';
        }

        const canOrder = c.count > 0 && (state.mode === 'pickup' || c.sub >= MIN_ORDER);
        $('sendBtn').disabled = !canOrder;

        // Telefondagi pastki tugma
        $('fab').hidden = c.count === 0;
        $('fabCount').textContent = c.count;
        $('fabTotal').textContent = fmt(c.total);
    }

    /* ====== OLISH USULI VA TO'LOV ====== */
    document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
        state.mode = b.dataset.mode;
        document.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('is-active', x === b));
        $('addrBox').hidden = state.mode === 'pickup';
        $('formError').hidden = true;
        updatePanel();
    }));

    document.querySelectorAll('[data-pay]').forEach((b) => b.addEventListener('click', () => {
        state.pay = b.dataset.pay;
        document.querySelectorAll('[data-pay]').forEach((x) => x.classList.toggle('is-active', x === b));
    }));

    /* ====== JOYLASHUV ====== */
    $('locBtn').addEventListener('click', () => {
        const btn = $('locBtn');
        if (!navigator.geolocation) return toast('Brauzeringiz joylashuvni aniqlay olmaydi. Manzilni yozing.');
        btn.textContent = 'Aniqlanmoqda...';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                state.loc = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
                btn.textContent = 'Joylashuv aniqlandi ✓';
                btn.classList.add('is-set');
            },
            () => {
                state.loc = '';
                btn.textContent = 'Joylashuvimni aniqlash';
                btn.classList.remove('is-set');
                toast('Joylashuvni aniqlab bo’lmadi. Manzilni qo’lda yozing.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });

    /* ====== FORMA ====== */
    function normalizePhone(v) {
        let d = v.replace(/\D/g, '');
        if (d.length === 9) d = '998' + d;
        return d.length === 12 && d.startsWith('998') ? d : null;
    }
    const prettyPhone = (d) => `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;

    function showError(msg) {
        const el = $('formError');
        el.textContent = msg;
        el.hidden = false;
    }

    // Oxirgi ism, telefon va manzilni eslab qolamiz (faqat shu qurilmada)
    try {
        const saved = JSON.parse(localStorage.getItem('dunyo_customer')) || {};
        $('name').value = saved.name || '';
        $('phone').value = saved.phone || '';
        $('address').value = saved.address || '';
    } catch (e) { /* e'tibor bermaymiz */ }

    $('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const c = calc();
        if (!c.count) return showError('Savat bo’sh. Avval taom tanlang.');
        if (state.mode === 'delivery' && c.sub < MIN_ORDER) {
            return showError(`Yetkazib berish uchun eng kam buyurtma ${fmt(MIN_ORDER)}.`);
        }

        const name = $('name').value.trim();
        const phone = normalizePhone($('phone').value);
        const address = $('address').value.trim();
        if (name.length < 2) return showError('Ismingizni kiriting.');
        if (!phone) return showError('Telefon raqamini to’g’ri kiriting, masalan: +998 90 123 45 67');
        if (state.mode === 'delivery' && address.length < 6) return showError('Yetkazib berish manzilini kiriting.');

        const items = Object.keys(cart).filter(byId).map((id) => ({ name: byId(id).name, qty: cart[id] }));
        const comment = $('comment').value.trim();
        const payload = {
            mode: state.mode, pay: state.pay, items,
            sub: c.sub, fee: c.fee, total: c.total,
            name, phone, address: state.mode === 'delivery' ? address : '',
            loc: state.mode === 'delivery' ? state.loc : '', comment
        };

        const btn = $('sendBtn');
        let ok = true;

        let orderCode = 1000 + Math.floor(Math.random() * 9000);
        btn.disabled = true;
        btn.textContent = 'Yuborilmoqda...';

        try {
            const res = await fetch('/api/delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                ok = false;
            } else {
                ok = true;
                if (data.order && (data.order.id || data.order.code)) {
                    orderCode = data.order.id || ('№ ' + data.order.code);
                }
            }
        } catch (err) {
            ok = false;
        } finally {
            btn.textContent = 'Buyurtmani yuborish';
            btn.disabled = false;
        }

        if (!ok) return showError('Buyurtmani yuborib bo’lmadi. Qayta urinib ko’ring yoki restoranga qo’ng’iroq qiling.');

        try { localStorage.setItem('dunyo_customer', JSON.stringify({ name, phone: $('phone').value.trim(), address })); } catch (err) { /* e'tibor bermaymiz */ }

        // Muvaffaqiyatli: tasdiq oynasi
        $('doneId').textContent = `Buyurtma raqami: #${orderCode}`;
        $('doneList').innerHTML =
            row('Taomlar', items.map((i) => `${i.name} × ${i.qty}`).join('<br>')) +
            row('Jami', fmt(c.total)) +
            row('Olish usuli', state.mode === 'pickup' ? 'Olib ketish' : 'Yetkazib berish') +
            row('To’lov', state.pay === 'karta' ? 'Karta orqali' : 'Naqd pul') +
            row('Holati', '<span id="liveOrderStatusBadge" class="status-badge status-badge-pending">⏳ Kutilmoqda (Telegramga yuborildi)</span>');
        $('doneNote').textContent = state.mode === 'pickup'
            ? 'Buyurtmangiz tayyor bo’lganda sizga qo’ng’iroq qilamiz.'
            : `Taxminiy yetkazish vaqti: ${ETA}. Kuryer yo’lga chiqishdan oldin qo’ng’iroq qiladi.`;
        $('dForm').hidden = true;
        $('dDone').hidden = false;

        cart = {};
        saveCart();
        renderDishes();
        updatePanel();
        $('order').scrollIntoView({ behavior: 'smooth', block: 'start' });

        trackDeliveryOrderStatus(orderCode);
    });

    let orderPollTimer = null;
    function trackDeliveryOrderStatus(orderId) {
        if (orderPollTimer) clearInterval(orderPollTimer);
        orderPollTimer = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                const data = await res.json();
                if (!data.success || !data.order) return;

                const status = data.order.status;
                const badge = $('liveOrderStatusBadge');
                const title = document.querySelector('#dDone .done_title');
                const note = $('doneNote');

                if (['accepted', 'delivering', 'completed'].includes(status)) {
                    clearInterval(orderPollTimer);
                    orderPollTimer = null;
                    if (badge) {
                        badge.className = 'status-badge status-badge-confirmed';
                        badge.innerHTML = status === 'delivering' ? '🛵 Kuryer yo\'lda' : status === 'completed' ? '✔️ Yetkazildi' : '✅ Zakazingiz qabul qilindi!';
                    }
                    if (title) {
                        title.textContent = '🎉 Zakazingiz qabul qilindi!';
                        title.style.color = '#10b981';
                    }
                    if (note) {
                        note.innerHTML = '<div class="status-alert-box status-alert-success">🎊 <b>Zakazingiz qabul qilindi!</b> Oshxonada tayyorlanmoqda va tez orada yetkaziladi. Yoqimli ishtaha!</div>';
                    }
                    if (window.celebrationManager) {
                        window.celebrationManager.startCelebration(7000);
                    }
                } else if (status === 'cancelled') {
                    clearInterval(orderPollTimer);
                    orderPollTimer = null;
                    if (badge) {
                        badge.className = 'status-badge status-badge-cancelled';
                        badge.innerHTML = '❌ Afsuski, qabul qilinmadi';
                    }
                    if (title) {
                        title.textContent = 'Afsuski, qabul qilinmadi';
                        title.style.color = '#ef4444';
                    }
                    if (note) {
                        note.innerHTML = '<div class="status-alert-box status-alert-danger">😔 <b>Afsus!</b> Buyurtmangiz qabul qilinmadi. Iltimos qaytadan urinib ko\'ring yoki qo\'ng\'iroq qiling: +998 71 200 00 00</div>';
                    }
                }
            } catch (e) {}
        }, 2000);
    }
    });

    $('newBtn').addEventListener('click', () => {
        if (orderPollTimer) { clearInterval(orderPollTimer); orderPollTimer = null; }
        if (window.celebrationManager) window.celebrationManager.stopCelebration();
        const title = document.querySelector('#dDone .done_title');
        if (title) { title.textContent = 'Buyurtma qabul qilindi'; title.style.color = ''; }
        $('dDone').hidden = true;
        $('dForm').hidden = false;
        $('comment').value = '';
        $('formError').hidden = true;
    });

    /* ====== SARLAVHA ANIMATSIYASI ====== */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
        const title = document.querySelector('.d_title');
        const text = title.textContent.trim();
        title.setAttribute('aria-label', text);
        title.textContent = '';
        [...text].forEach((ch, i) => {
            const s = document.createElement('span');
            s.className = 'ch';
            s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', i);
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            title.appendChild(s);
        });

        const para = document.querySelector('.d_text');
        const words = para.textContent.trim().split(/\s+/);
        para.textContent = '';
        words.forEach((w, i) => {
            const wrap = document.createElement('span');
            wrap.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = w;
            inner.style.setProperty('--d', 600 + Math.min(i * 35, 1000) + 'ms');
            wrap.appendChild(inner);
            para.appendChild(wrap);
            if (i < words.length - 1) para.appendChild(document.createTextNode(' '));
        });
        requestAnimationFrame(() => para.classList.add('is-visible'));
    }

    /* ====== BOSHLASH ====== */
    renderCats();
    renderDishes();
    updatePanel();
})();