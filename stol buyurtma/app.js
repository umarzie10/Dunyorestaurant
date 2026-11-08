(() => {
    /* ====== SOZLAMALAR (o'zingizga moslang) ====== */
    const RESTAURANT = 'Dunyo restaurant';
    const SLOTS = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    const STAY_HOURS = 2;      // bitta bron stolni necha soatga band qiladi
    const MAX_DAYS = 30;       // necha kun oldindan bron qilish mumkin
    const MAX_GUESTS = 20;

    /* ====== KORPUSLAR VA STOLLAR (taxminiy reja) ======
       x, y: stolning reja ichidagi joyi (foizda, 0..100)
       T(raqam, x, y, o'rin, turi): turi = round | rect | tapchan | room */
    const SIZE = {
        round: (s) => ({ w: s <= 2 ? 6.5 : s <= 4 ? 8 : 9.5, ar: 1 }),
        rect: (s) => ({ w: s <= 8 ? 15 : 18, ar: s <= 8 ? 2.2 : 2.6 }),
        tapchan: () => ({ w: 14, ar: 1.5 }),
        room: () => ({ w: 20, ar: 1.25 })
    };

    const T = (n, x, y, seats, kind = 'round') => ({ n, x, y, seats, kind, ...SIZE[kind](seats) });
    const D = (label, x, y, w, h, round = false) => ({ label, x, y, w, h, round });

    const KORPUS = [
        {
            id: 'k1', name: '1-korpus', title: 'Asosiy zal',
            note: 'Katta umumiy zal: do’stlar, juftliklar va kichik oilalar uchun. Oshxonaga yaqin, xizmat tez.',
            deco: [D('Bar', 13, 9, 20, 11), D('Oshxona', 87, 9, 22, 11), D('Kirish', 50, 95, 16, 7)],
            tables: [
                T(1, 14, 32, 2), T(2, 32, 32, 4), T(3, 50, 32, 4), T(4, 68, 32, 6), T(5, 86, 32, 4),
                T(6, 14, 56, 4), T(7, 32, 56, 4), T(8, 50, 56, 6), T(9, 68, 56, 4), T(10, 86, 56, 2),
                T(11, 20, 79, 2), T(12, 40, 79, 4), T(13, 62, 79, 6), T(14, 84, 79, 8, 'rect')
            ]
        },
        {
            id: 'k2', name: '2-korpus', title: 'Oilaviy zal',
            note: 'Katta stollar, keng oraliq va bolalar maydoni. Oilaviy dasturxon uchun qulay.',
            deco: [D('Bolalar maydoni', 14, 80, 22, 24), D('Oshxona', 87, 8, 22, 10), D('Kirish', 55, 95, 16, 7)],
            tables: [
                T(1, 18, 26, 6), T(2, 40, 26, 6), T(3, 62, 26, 8, 'rect'), T(4, 86, 28, 6),
                T(5, 18, 52, 8, 'rect'), T(6, 42, 52, 6), T(7, 64, 52, 6), T(8, 86, 54, 8, 'rect'),
                T(9, 46, 77, 10, 'rect'), T(10, 78, 77, 10, 'rect')
            ]
        },
        {
            id: 'k3', name: '3-korpus', title: 'VIP kabinalar',
            note: 'Yopiq xonalar: to’y, tug’ilgan kun va ish uchrashuvlari uchun. Har xonada alohida xizmat.',
            deco: [D('Dalliz', 50, 50, 8, 80), D('Kirish', 50, 96, 16, 6)],
            tables: [
                T(1, 20, 27, 8, 'room'), T(2, 80, 27, 10, 'room'),
                T(3, 20, 73, 12, 'room'), T(4, 80, 73, 8, 'room')
            ]
        },
        {
            id: 'k4', name: '4-korpus', title: 'Yozgi bog’',
            note: 'Ochiq havoda: tapchanlar va daraxt tagidagi stollar. Yoz kunlari eng ko’p so’raladi.',
            deco: [D('Favvora', 50, 52, 20, 24, true), D('Kirish', 50, 96, 16, 6)],
            tables: [
                T(1, 14, 22, 8, 'tapchan'), T(2, 37, 22, 8, 'tapchan'), T(3, 63, 22, 8, 'tapchan'), T(4, 86, 22, 8, 'tapchan'),
                T(5, 14, 52, 4), T(6, 86, 52, 4),
                T(7, 14, 80, 6), T(8, 34, 80, 4), T(9, 66, 80, 4), T(10, 86, 80, 6)
            ]
        }
    ];

    KORPUS.forEach((k) => k.tables.forEach((t) => { t.id = `${k.id}-${t.n}`; t.korpus = k.id; }));

    /* ====== YORDAMCHILAR ====== */
    const $ = (id) => document.getElementById(id);
    const pad = (n) => String(n).padStart(2, '0');
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const prettyDate = (s) => { const d = new Date(s + 'T00:00'); return `${d.getDate()}-${MONTHS[d.getMonth()]}`; };
    const kindName = { round: 'Stol', rect: 'Stol', tapchan: 'Tapchan', room: 'Kabina' };

    function hash(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
        return h >>> 0;
    }

    /* ====== BRONLAR (Serverdan real vaqt rejimida yuklanadi) ====== */
    const API_BASE = window.location.origin.includes(':3000') ? '' : 'http://localhost:3000';
    let serverBookings = [];

    async function fetchBookings() {
        try {
            const res = await fetch(`${API_BASE}/api/reservations?date=${state.date}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.bookings)) {
                serverBookings = data.bookings;
                refresh();
            }
        } catch (e) {
            console.warn('Bronlarni serverdan yuklab bo\'lmadi:', e);
        }
    }

    const realBooked = (id, date, time) =>
        serverBookings.some((b) => b.tableId === id && b.date === date && b.status !== 'cancelled' && Math.abs(toMin(b.time) - toMin(time)) < STAY_HOURS * 60);
    const isBooked = (t) => realBooked(t.id, state.date, state.time);

    /* ====== HOLAT ====== */
    const now = new Date();
    const today = ymd(now);
    const state = { date: today, time: '19:00', guests: 2, korpus: 'k1', selected: null, done: null };

    const slotPassed = (date, slot) => date === today && toMin(slot) <= now.getHours() * 60 + now.getMinutes() + 30;
    const firstFreeSlot = (date) => {
        const ok = SLOTS.filter((s) => !slotPassed(date, s));
        return ok.includes('19:00') ? '19:00' : ok[0] || null;
    };

    if (!firstFreeSlot(today)) {           // bugun vaqt qolmagan bo'lsa, ertangi kun
        const t = new Date(now); t.setDate(t.getDate() + 1);
        state.date = ymd(t);
    }
    state.time = firstFreeSlot(state.date);

    const korpusById = (id) => KORPUS.find((k) => k.id === id);
    const currentKorpus = () => korpusById(state.korpus);
    const fits = (t) => t.seats >= state.guests;
    const tableById = (id) => KORPUS.flatMap((k) => k.tables).find((t) => t.id === id);

    /* ====== FILTRLAR ====== */
    const dateEl = $('date');
    const minD = new Date(now), maxD = new Date(now);
    maxD.setDate(maxD.getDate() + MAX_DAYS);
    dateEl.min = today;
    dateEl.max = ymd(maxD);
    dateEl.value = state.date;

    function renderSlots() {
        $('slots').innerHTML = SLOTS.map((s) =>
            `<button type="button" class="slot${s === state.time ? ' is-active' : ''}" data-time="${s}" ${slotPassed(state.date, s) ? 'disabled' : ''}>${s}</button>`
        ).join('');
    }

    function renderGuests() { $('gVal').textContent = state.guests; }

    function validateSelection() {
        if (!state.selected) return;
        const t = tableById(state.selected);
        if (!t || isBooked(t) || !fits(t)) state.selected = null;
    }

    function refresh() {
        validateSelection();
        renderSlots();
        renderGuests();
        renderTabs();
        renderPlan();
        renderSummary();
    }

    dateEl.addEventListener('change', () => {
        if (!dateEl.value || dateEl.value < today) dateEl.value = today;
        state.date = dateEl.value;
        if (!state.time || slotPassed(state.date, state.time)) state.time = firstFreeSlot(state.date);
        fetchBookings();
    });

    $('slots').addEventListener('click', (e) => {
        const b = e.target.closest('[data-time]');
        if (!b || b.disabled) return;
        state.time = b.dataset.time;
        refresh();
    });

    $('gMinus').addEventListener('click', () => { state.guests = Math.max(1, state.guests - 1); refresh(); });
    $('gPlus').addEventListener('click', () => { state.guests = Math.min(MAX_GUESTS, state.guests + 1); refresh(); });

    /* ====== KORPUS TABLARI ====== */
    function freeCount(k) { return k.tables.filter((t) => !isBooked(t) && fits(t)).length; }

    function renderTabs() {
        $('ktabs').innerHTML = KORPUS.map((k) => {
            const free = freeCount(k);
            return `<button type="button" class="ktab${k.id === state.korpus ? ' is-active' : ''}" role="tab" aria-selected="${k.id === state.korpus}" data-k="${k.id}">
                <strong>${k.name}</strong><span>${k.title}</span>
                <em>${free ? free + ' ta mos stol bo’sh' : 'Mos stol qolmagan'}</em></button>`;
        }).join('');
        $('knote').textContent = currentKorpus().note;
    }

    $('ktabs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]');
        if (!b) return;
        state.korpus = b.dataset.k;
        state.selected = null;
        refresh();
    });

    /* ====== REJA ====== */
    function tableHTML(t) {
        const booked = isBooked(t), small = !fits(t), sel = state.selected === t.id;
        const cls = ['tbl', 'k_' + t.kind, booked ? 'is-booked' : '', !booked && small ? 'is-small' : '', sel ? 'is-selected' : ''].join(' ');
        const status = booked ? 'band' : small ? 'o’rin yetmaydi' : 'bo’sh';
        const label = t.kind === 'room' || t.kind === 'tapchan' ? `${kindName[t.kind]} ${t.n}` : t.n;
        return `<button type="button" class="${cls}" data-id="${t.id}" ${booked || small ? 'disabled' : ''}
            style="--x:${t.x}%;--y:${t.y}%;--w:${t.w}%;--ar:${t.ar}"
            aria-pressed="${sel}" aria-label="${kindName[t.kind]} ${t.n}, ${t.seats} o’rin, ${status}">
            <span class="tbl_n">${label}</span><span class="tbl_s">${t.seats} o’rin</span></button>`;
    }

    function renderPlan() {
        const k = currentKorpus();
        $('plan').innerHTML =
            k.deco.map((d) => `<div class="deco${d.round ? ' is-round' : ''}" style="--x:${d.x}%;--y:${d.y}%;--w:${d.w}%;--h:${d.h}%">${d.label}</div>`).join('') +
            k.tables.map(tableHTML).join('');
    }

    $('plan').addEventListener('click', (e) => {
        const b = e.target.closest('[data-id]');
        if (!b || b.disabled) return;
        state.selected = state.selected === b.dataset.id ? null : b.dataset.id;
        $('formError').hidden = true;
        renderPlan();
        renderSummary();
    });

    /* ====== BRON MA'LUMOTLARI ====== */
    const row = (k, v) => `<div class="sum_row"><dt>${k}</dt><dd>${v}</dd></div>`;

    function detailsHTML(t) {
        const k = korpusById(t.korpus);
        return row('Korpus', `${k.name}, ${k.title}`) +
            row(kindName[t.kind], `№ ${t.n} (${t.seats} o’rin)`) +
            row('Sana', prettyDate(state.date)) +
            row('Vaqt', state.time) +
            row('Mehmonlar', state.guests + ' kishi');
    }

    function renderSummary() {
        const t = state.selected ? tableById(state.selected) : null;
        $('sumList').innerHTML = t
            ? detailsHTML(t)
            : `<p class="sum_empty">Rejadan bo’sh stolni tanlang. Tanlangan stol shu yerda ko’rinadi.</p>`;
        $('bookBtn').disabled = !t;
    }

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

    $('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const t = state.selected ? tableById(state.selected) : null;
        if (!t) return showError('Avval rejadan stol tanlang.');
        if (isBooked(t)) { state.selected = null; refresh(); return showError('Bu stol band bo’lib qoldi. Boshqasini tanlang.'); }

        const name = $('name').value.trim();
        const phone = normalizePhone($('phone').value);
        if (name.length < 2) return showError('Ismingizni kiriting.');
        if (!phone) return showError('Telefon raqamini to’g’ri kiriting, masalan: +998 90 123 45 67');

        const k = korpusById(t.korpus);
        const bookBtn = $('bookBtn');
        bookBtn.disabled = true;
        bookBtn.textContent = 'Bron qilinmoqda...';

        const payload = {
            tableId: t.id,
            tableNumber: t.n,
            korpusId: t.korpus,
            korpusName: `${k.name} (${k.title})`,
            seats: t.seats,
            date: state.date,
            time: state.time,
            guests: state.guests,
            name,
            phone: prettyPhone(phone),
            comment: $('comment').value.trim()
        };

        try {
            const res = await fetch(`${API_BASE}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!data.success) {
                return showError(data.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
            }

            const booking = data.booking;
            serverBookings.push(booking);

            state.done = { booking, table: t };
            $('formError').hidden = true;
            $('sumForm').hidden = true;
            $('sumDone').hidden = false;
            $('doneId').textContent = `Bron raqami: № ${booking.code || booking.id}`;
            $('doneList').innerHTML = detailsHTML(t) + row('Ism', name) + row('Telefon', booking.phone) + row('Holati', '<span id="liveStatusBadge" class="status-badge status-badge-pending">⏳ Kutilmoqda (Telegramga yuborildi)</span>');
            state.selected = null;
            renderTabs();
            renderPlan();

            trackBookingStatus(booking.id || booking.code);
        } catch (err) {
            showError('Server bilan bog\'lanishda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
        } finally {
            bookBtn.disabled = false;
            bookBtn.textContent = 'Stolni band qilish';
        }
    });

    let pollTimer = null;
    function trackBookingStatus(bookingId) {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/api/reservations/${bookingId}`);
                const data = await res.json();
                if (!data.success || !data.booking) return;

                const status = data.booking.status;
                const badge = $('liveStatusBadge');
                const note = document.querySelector('#sumDone .done_note');
                const title = document.querySelector('#sumDone .done_title');

                if (status === 'confirmed') {
                    clearInterval(pollTimer);
                    pollTimer = null;
                    if (badge) {
                        badge.className = 'status-badge status-badge-confirmed';
                        badge.innerHTML = '✅ Zakazingiz qabul qilindi!';
                    }
                    if (title) {
                        title.textContent = '🎉 Zakazingiz qabul qilindi!';
                        title.style.color = '#10b981';
                    }
                    if (note) {
                        note.innerHTML = '<div class="status-alert-box status-alert-success">🎊 <b>Tabriklaymiz!</b> Restoran ma\'muriyati stolingizni tasdiqladi. Sizni kutib qolamiz!</div>';
                    }
                    if (window.celebrationManager) {
                        window.celebrationManager.startCelebration(7000);
                    }
                } else if (status === 'cancelled') {
                    clearInterval(pollTimer);
                    pollTimer = null;
                    if (badge) {
                        badge.className = 'status-badge status-badge-cancelled';
                        badge.innerHTML = '❌ Afsuski, qabul qilinmadi';
                    }
                    if (title) {
                        title.textContent = 'Afsuski, qabul qilinmadi';
                        title.style.color = '#ef4444';
                    }
                    if (note) {
                        note.innerHTML = '<div class="status-alert-box status-alert-danger">😔 <b>Afsus!</b> Bu vaqtda joylar qolmaganligi sababli buyurtmangiz qabul qilinmadi. Iltimos boshqa vaqtni tanlang yoki qo\'ng\'iroq qiling: +998 71 200 00 00</div>';
                    }
                }
            } catch (e) { }
        }, 2000);
    }

    $('tgBtn').addEventListener('click', () => {
        if (!state.done) return;
        const { booking: b, table: t } = state.done;
        const k = korpusById(t.korpus);
        const text = [
            `${RESTAURANT}: stol bron qilish № ${b.code}`,
            `${k.name} (${k.title}), ${kindName[t.kind]} ${t.n}`,
            `Sana: ${prettyDate(b.date)}, vaqt: ${b.time}`,
            `Mehmonlar: ${b.guests} kishi`,
            `Ism: ${b.name}`,
            `Telefon: ${b.phone}`,
            b.comment ? `Izoh: ${b.comment}` : ''
        ].filter(Boolean).join('\n');
        window.open('https://t.me/share/url?url=%20&text=' + encodeURIComponent(text), '_blank', 'noopener');
    });

    $('newBtn').addEventListener('click', () => {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        if (window.celebrationManager) window.celebrationManager.stopCelebration();
        const title = document.querySelector('#sumDone .done_title');
        if (title) { title.textContent = 'Bron qabul qilindi'; title.style.color = ''; }
        state.done = null;
        $('form').reset();
        $('sumDone').hidden = true;
        $('sumForm').hidden = false;
        refresh();
    });

    /* ====== SARLAVHA ANIMATSIYASI ====== */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
        const title = document.querySelector('.bron_title');
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

        const para = document.querySelector('.bron_text');
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
    refresh();
    fetchBookings();
    setInterval(fetchBookings, 8000);
})();