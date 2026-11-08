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

        try {
            const res = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            let replyHtml = (data.reply || "Kechirasiz, javob topilmadi.")
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\n/g, '<br>');

            if (data.action) {
                replyHtml += `<br><a class="ai-btn-action" href="${data.action.url}">${data.action.text} →</a>`;
            }

            botMsg.innerHTML = replyHtml;
        } catch (e) {
            botMsg.innerHTML = 'Server bilan bog\'lanishda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.';
        }
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

