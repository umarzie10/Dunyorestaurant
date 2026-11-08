(() => {
    // Inject floating button and modal if not present
    if (document.getElementById('aiAssistantModal')) return;

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/ai-widget.css';
    document.head.appendChild(link);

    // Create Widget DOM
    const wrap = document.createElement('div');
    wrap.innerHTML = `
        <button class="ai-fab" id="aiFabBtn" aria-label="AI Yordamchi">
            <span class="ai-fab-icon">🤖</span>
            <span>AI Yordamchi</span>
        </button>

        <div class="ai-modal" id="aiAssistantModal" aria-hidden="true">
            <div class="ai-head">
                <div class="ai-title-wrap">
                    <span class="ai-head-icon">🤖</span>
                    <div>
                        <h3 class="ai-title">Dunyo AI Yordamchi</h3>
                        <p class="ai-subtitle">● Onlayn maslahatchi</p>
                    </div>
                </div>
                <button class="ai-close" id="aiCloseBtn" aria-label="Yopish">✕</button>
            </div>

            <div class="ai-body" id="aiMessages">
                <div class="ai-msg ai-msg-bot">
                    Assalomu alaykum! Men <b>Dunyo Restaurant</b>ning sun'iy intellekt yordamchisiman 🤖✨<br><br>
                    Sizga taom tanlash, stol bron qilish yoki yetkazib berish bo'yicha yordam bera olaman.
                    <div class="ai-chips">
                        <button class="ai-chip" data-prompt="Bugungi osh va go'shtli taomlar">🍲 Osh va go'sht</button>
                        <button class="ai-chip" data-prompt="4 kishilik oilaga nima tavsiya qilasiz?">🍱 Oilaviy setlar</button>
                        <button class="ai-chip" data-prompt="Qanday qilib stol bron qilsam bo'ladi?">📅 Stol bron qilish</button>
                        <button class="ai-chip" data-prompt="Yetkazib berish shartlari qanaqa?">🛵 Yetkazib berish</button>
                    </div>
                </div>
            </div>

            <form class="ai-foot" id="aiForm">
                <input type="text" class="ai-input" id="aiInput" placeholder="Savolingizni yozing..." autocomplete="off">
                <button type="submit" class="ai-send">Yuborish</button>
            </form>
        </div>
    `;
    document.body.appendChild(wrap);

    const modal = document.getElementById('aiAssistantModal');
    const fab = document.getElementById('aiFabBtn');
    const closeBtn = document.getElementById('aiCloseBtn');
    const form = document.getElementById('aiForm');
    const input = document.getElementById('aiInput');
    const body = document.getElementById('aiMessages');

    function toggleModal(open) {
        const isOpen = open !== undefined ? open : !modal.classList.contains('is-open');
        modal.classList.toggle('is-open', isOpen);
        modal.setAttribute('aria-hidden', String(!isOpen));
        if (isOpen) {
            input.focus();
            body.scrollTop = body.scrollHeight;
        }
    }

    fab.addEventListener('click', () => toggleModal(true));
    closeBtn.addEventListener('click', () => toggleModal(false));

    // Bog'lash: Sahifadagi barcha "AI yordamchi" havolalari shu oynani ochadi
    document.querySelectorAll('a').forEach(a => {
        if (a.textContent.trim().toLowerCase().includes('ai yordamchi')) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                toggleModal(true);
            });
        }
    });

    // Avtonom aqlli bilimlar bazasi (server vaqtincha uzilsa ham ishlaydi)
    function getLocalAIResponse(message) {
        const q = (message || '').toLowerCase().trim();
        let reply = "";
        let action = null;

        if (q.includes('osh') || q.includes('palov') || q.includes('to\'y oshi')) {
            reply = "Bizda qozonda sekin damlangan haqiqiy to'y oshi mavjud! 🍛\n\n• **To'y oshi:** 45,000 so'm (sara guruch, mayin go'sht, zira)\n• **Choyxona oshi:** 38,000 so'm (yengil va xushbo'y)\n• **Bayramona osh (qazi bilan):** 55,000 so'm\n\nAchichuk salati va issiq tandir noni bilan birga buyurtma berishingizni tavsiya qilamiz!";
            action = { text: "Raqamli menyuda ko'rish", url: "/raqamli menyu/index.html" };
        } else if (q.includes('oila') || q.includes('bolalar') || q.includes('set')) {
            reply = "Oila va do'stlar davrasi uchun bizning maxsus setlarimiz juda qulay va tejamkor: 🍱\n\n• **Oilaviy set (4 kishilik):** 175,000 so'm (2 osh, 2 achichuk, 4 non, 1 l kompot)\n• **Do'stlar seti:** 190,000 so'm (10 ta aralash shashlik, 3 non, achichuk)\n• **Juftlik seti:** 105,000 so'm (yumshoq go'sht, sabzavotlar, 2 ichimlik)\n\nShuningdek, 2-korpusimizda bolalar maydonchasi bor!";
            action = { text: "Yetkazib berishga buyurtma", url: "/yetkazib berish/index.html" };
        } else if (q.includes('stol') || q.includes('bron') || q.includes('joy') || q.includes('band')) {
            reply = "Restoranimizda 4 ta zal mavjud: 🏛\n1. **Asosiy zal (1-korpus):** Tez xizmat, do'stlar va juftliklar uchun\n2. **Oilaviy zal (2-korpus):** Bolalar maydoni va keng stollar\n3. **VIP kabinalar (3-korpus):** Yopiq xonalar, tantanalar uchun\n4. **Yozgi bog' (4-korpus):** Favvora va shinam tapchanlar\n\nInteraktiv xaritadan o'zingizga yoqqan bo'sh stolni tanlab, bir zumda band qilishingiz mumkin!";
            action = { text: "Stol bron qilish xaritasi", url: "/stol buyurtma/index.html" };
        } else if (q.includes('yetkaz') || q.includes('dastavka') || q.includes('manzil')) {
            reply = "Yetkazib berish xizmati shartlari: 🛵\n\n• **Yetkazish narxi:** 15,000 so'm\n• **150,000 so'mdan yuqori:** Yetkazib berish MUTLAQO BEPUL!\n• **Eng kam buyurtma:** 50,000 so'm\n• **Vaqti:** 35–50 daqiqada issiq holda yetkaziladi!\n\nSaytimizda bitta tugma orqali GPS joylashuvingizni xaritadan aniqlash imkoni bor.";
            action = { text: "Buyurtma berish", url: "/yetkazib berish/index.html" };
        } else if (q.includes('go\'sht') || q.includes('shashlik') || q.includes('kabob')) {
            reply = "Go'sht ixlosmandlari uchun oshpazimizdan maxsus tavsiyalar: 🍖\n\n• **Yumshoq go'sht:** 68,000 so'm (og'izda eriydigan yosh mol go'shti)\n• **Qozon kabob:** 72,000 so'm (qovurilgan go'sht va qizarib pishgan kartoshka)\n• **Mol go'shti shashlik:** 18,000 so'm / shish\n• **Lyulya kabob:** 17,000 so'm / shish\n• **Jigar kabob:** 15,000 so'm / shish";
            action = { text: "Menyuda ko'rish", url: "/raqamli menyu/index.html" };
        } else if (q.includes('vaqt') || q.includes('ish vaqti') || q.includes('soat') || q.includes('telefon') || q.includes('aloqa')) {
            reply = "Restoranimiz har kuni soat **10:00 dan 23:00 gacha** xizmatingizda! ⏰\n\n📞 **Telefon:** +998 71 200 00 00\n📍 **Manzil:** Toshkent shahri, Markaziy korpus\n💬 **Telegram:** @dunyo_restaurant";
        } else if (q.includes('halol') || q.includes('halal')) {
            reply = "Ha, albatta! Bizning restoranda ishlatiladigan barcha go'sht va mahsulotlar **100% halol** va sertifikatlangan yetkazib beruvchilardan olinadi. 🌿";
        } else {
            reply = "Savolingiz uchun rahmat! Men Dunyo Restaurant bo'yicha barcha ma'lumotlarni bilaman: \n\n• 🍛 Osh, kabob va maxsus setlar tavsiyasi\n• 📅 Bo'sh stollarni interaktiv xaritadan tanlash va bron qilish\n• 🛵 Manzilgacha tezkor yetkazib berish\n\nQuyidagi tugmalardan birini tanlashingiz yoki o'zingizni qiziqtirgan savolni yozishingiz mumkin!";
            action = { text: "Raqamli menyuga o'tish", url: "/raqamli menyu/index.html" };
        }

        return { success: true, reply, action };
    }

    async function sendQuery(text) {
        if (!text || !text.trim()) return;

        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'ai-msg ai-msg-user';
        userMsg.textContent = text;
        body.appendChild(userMsg);
        body.scrollTop = body.scrollHeight;
        input.value = '';

        // Bot loading
        const botMsg = document.createElement('div');
        botMsg.className = 'ai-msg ai-msg-bot';
        botMsg.innerHTML = '<i>Javob tayyorlanmoqda... ⏳</i>';
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;

        let data = null;
        // Agar boshqa portda (masalan, Live Server 5500) ochilgan bo'lsa, http://localhost:3000 ga murojaat qilamiz
        const apiBase = window.location.origin.includes(':3000') ? '' : 'http://localhost:3000';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch(`${apiBase}/api/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                data = await res.json();
            }
        } catch (e) {
            // Agar tarmoq xatosi bo'lsa, mahalliy AI bilimlar bazasiga o'tadi
        }

        if (!data || !data.reply) {
            data = getLocalAIResponse(text);
        }

        let replyHtml = (data.reply || "Kechirasiz, javob topilmadi.")
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\n/g, '<br>');

        if (data.action) {
            replyHtml += `<br><a class="ai-btn-action" href="${data.action.url}">${data.action.text} →</a>`;
        }

        botMsg.innerHTML = replyHtml;
        body.scrollTop = body.scrollHeight;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendQuery(input.value);
    });

    body.addEventListener('click', (e) => {
        const chip = e.target.closest('.ai-chip');
        if (chip && chip.dataset.prompt) {
            sendQuery(chip.dataset.prompt);
        }
    });
})();
