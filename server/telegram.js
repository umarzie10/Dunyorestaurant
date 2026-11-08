const db = require('./db');

class TelegramService {
  constructor() {
    this.token = process.env.BOT_TOKEN || '';
    this.adminChatId = process.env.ADMIN_CHAT_ID || '';
    this.baseUrl = this.token ? `https://api.telegram.org/bot${this.token}` : null;
    this.polling = false;
    this.offset = 0;
  }

  getAdminChatIds() {
    const raw = process.env.ADMIN_CHAT_ID || this.adminChatId || '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !s.includes('YOUR_'));
  }

  getSiteUrl() {
    if (process.env.SITE_URL && process.env.SITE_URL !== 'YOUR_SITE_URL_HERE' && !process.env.SITE_URL.includes('YOUR_')) {
      return process.env.SITE_URL.replace(/\/$/, '');
    }

    // Telefonlar ochishi uchun lokal tarmoq (Wi-Fi/LAN) IP manzilini aniqlash
    try {
      const os = require('os');
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            return `http://${net.address}:${process.env.PORT || 3000}`;
          }
        }
      }
    } catch (e) {}

    return `http://localhost:${process.env.PORT || 3000}`;
  }

  makeLinkButton(text, path) {
    const fullUrl = `${this.getSiteUrl()}${path}`;
    if (fullUrl.startsWith('https://')) {
      return { text, web_app: { url: fullUrl } };
    }
    return { text, url: fullUrl };
  }

  isConfigured() {
    const token = process.env.BOT_TOKEN || this.token;
    return Boolean(token && token !== 'YOUR_BOT_TOKEN_HERE' && !token.includes('YOUR_'));
  }

  isAdminConfigured() {
    return this.getAdminChatIds().length > 0;
  }

  init() {
    this.token = process.env.BOT_TOKEN || this.token;
    if (!this.isConfigured()) {
      console.log('⚠️ [Telegram Bot] BOT_TOKEN kiritilmagan. Bot simulyatsiya rejimida ishlaydi.');
      console.log('💡 Telegram botni ulash uchun .env fayliga BOT_TOKEN va ADMIN_CHAT_ID ni kiriting.');
      return;
    }
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    console.log('🚀 [Telegram Bot] Telegram bot ulanmoqda...');
    console.log(`👥 [Telegram Bot] Sozlangan adminlar soni: ${this.getAdminChatIds().length} ta (${this.getAdminChatIds().join(', ')})`);
    this.startPolling();
  }

  async apiCall(method, body = {}) {
    if (!this.isConfigured() || !this.baseUrl) return null;
    try {
      const res = await fetch(`${this.baseUrl}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) {
        console.error(`[Telegram API Error] ${method}:`, data.description);
      }
      return data;
    } catch (err) {
      console.error(`[Telegram API Fetch Error] ${method}:`, err.message);
      return null;
    }
  }

  async sendMessage(chatId, text, options = {}) {
    if (!chatId) return null;
    return this.apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      ...options,
    });
  }

  async editMessageText(chatId, messageId, text, options = {}) {
    return this.apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...options,
    });
  }

  async answerCallbackQuery(callbackQueryId, text = '') {
    return this.apiCall('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    });
  }

  async startPolling() {
    if (this.polling) return;
    this.polling = true;
    console.log('🤖 [Telegram Bot] Polling muvaffaqiyatli boshlandi!');

    // Get bot username
    try {
      const me = await this.apiCall('getMe');
      if (me && me.result) {
        console.log(`✅ [Telegram Bot] Bot nomi: @${me.result.username} (${me.result.first_name})`);
      }
    } catch (e) { }

    while (this.polling) {
      try {
        const res = await this.apiCall('getUpdates', {
          offset: this.offset,
          timeout: 25,
          allowed_updates: ['message', 'callback_query'],
        });

        if (res && res.result && res.result.length > 0) {
          for (const update of res.result) {
            this.offset = update.update_id + 1;
            await this.handleUpdate(update);
          }
        }
      } catch (err) {
        console.error('[Polling error]', err.message);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }

  async handleUpdate(update) {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallback(update.callback_query);
    }
  }

  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const from = msg.from || {};

    // Foydalanuvchini bazada saqlash/yangilash
    db.upsertUser({
      chatId,
      firstName: from.first_name || '',
      lastName: from.last_name || '',
      username: from.username || '',
      phone: msg.contact ? msg.contact.phone_number : undefined,
    });

    // Kontakt ulashilganda
    if (msg.contact) {
      const phone = msg.contact.phone_number;
      db.upsertUser({ chatId, phone });
      await this.sendMessage(
        chatId,
        `✅ <b>Raqamingiz qabul qilindi:</b> <code>${phone}</code>\n\nEndi sayt yoki bot orqali buyurtma berganingizda, barcha yangilanishlar sizga shu yerda avtomatik keladi! 🎉`,
        {
          reply_markup: {
            keyboard: [
              [{ text: '🍽 Raqamli menyu' }, { text: '📅 Stol bron qilish' }],
              [{ text: '🛵 Yetkazib berish' }, { text: '📋 Buyurtmalarim' }],
              [{ text: '📞 Restoran bilan aloqa' }],
            ],
            resize_keyboard: true,
          },
        }
      );
      return;
    }

    if (text === '/start') {
      const welcome = `Assalomu alaykum, <b>${from.first_name || 'Hurmatli mehmon'}</b>! 🍽🇺🇿\n\n` +
        `<b>Dunyo Restaurant</b> rasmiy botiga xush kelibsiz!\n\n` +
        `Bu yerda siz:\n` +
        `• 🍲 Milliy va xorijiy taomlar menyusini ko'rishingiz\n` +
        `• 📅 Restorandan o'zingizga qulay stolni bron qilishingiz\n` +
        `• 🛵 Issiq taomlarni yetkazib berishga buyurtma qilishingiz\n` +
        `• 📦 Buyurtmalaringiz holatini kuzatib borishingiz mumkin!\n\n` +
        `<i>Buyurtmalaringiz holatini to'liq kuzatib borish uchun pastdagi "📱 Telefon raqamni ulashish" tugmasini bosing:</i>`;

      await this.sendMessage(chatId, welcome, {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni ulashish', request_contact: true }],
            [{ text: '🍽 Raqamli menyu' }, { text: '📅 Stol bron qilish' }],
            [{ text: '🛵 Yetkazib berish' }, { text: '📋 Buyurtmalarim' }],
            [{ text: '📞 Restoran bilan aloqa' }],
          ],
          resize_keyboard: true,
        },
      });
      return;
    }

    if (text === '/id' || text === 'ID') {
      await this.sendMessage(chatId, `Sizning Telegram Chat ID: <code>${chatId}</code>\n\nAgar siz restoran administratori bo'lsangiz, bu ID ni .env faylidagi ADMIN_CHAT_ID ga qo'ying.`);
      return;
    }

    if (text === '🍽 Raqamli menyu') {
      const menuText = `🍽 <b>DUNYO RESTAURANT MENYUSI</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🍱 <b>SETLAR:</b>\n` +
        `• Oilaviy set (4 kishilik) — 175,000 so'm\n` +
        `• Do'stlar seti — 190,000 so'm\n` +
        `• Juftlik seti — 105,000 so'm\n\n` +
        `🍛 <b>OSH VA GO'SHT:</b>\n` +
        `• To'y oshi — 45,000 so'm\n` +
        `• Choyxona oshi — 38,000 so'm\n` +
        `• Yumshoq go'sht — 68,000 so'm\n` +
        `• Qozon kabob — 72,000 so'm\n\n` +
        `🍢 <b>SHASHLIKLAR:</b>\n` +
        `• Mol go'shti shashlik — 18,000 so'm\n` +
        `• Jigar kabob — 15,000 so'm\n` +
        `• Lyulya kabob — 17,000 so'm\n\n` +
        `🍲 <b>SHO'RVA VA SALATLAR:</b>\n` +
        `• Lag'mon — 36,000 so'm\n` +
        `• Mastava — 28,000 so'm\n` +
        `• Achichuk salati — 14,000 so'm\n` +
        `• Toshkent salati — 26,000 so'm\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<i>Taomlarni rasmlari bilan ko'rish yoki buyurtma berish uchun pastdagi tugmalardan foydalaning:</i>`;

      await this.sendMessage(chatId, menuText, {
        reply_markup: {
          inline_keyboard: [
            [this.makeLinkButton('🌐 Saytda Menyuni Ochish', '/raqamli%20menyu/index.html')],
            [this.makeLinkButton('🛵 Yetkazib berishga buyurtma', '/yetkazib%20berish/index.html')],
            [this.makeLinkButton('📅 Stol bron qilish', '/stol%20buyurtma/index.html')],
          ],
        },
      });
      return;
    }

    if (text === '📅 Stol bron qilish') {
      const bronText = `📅 <b>STOL BRON QILISH XIZMATI</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Restoranimizda 4 ta shinam zal mavjud:\n` +
        `1. <b>1-korpus (Asosiy zal):</b> Umumiy zal, oshxonaga yaqin, tez xizmat\n` +
        `2. <b>2-korpus (Oilaviy zal):</b> Katta stollar va bolalar maydonchasi\n` +
        `3. <b>3-korpus (VIP kabinalar):</b> Shaxsiy uchrashuvlar va tantanalar uchun\n` +
        `4. <b>4-korpus (Yozgi bog'):</b> Ochiq osmon ostida shinam tapchanlar\n\n` +
        `<i>Interaktiv rejamizdan bo'sh stolni tanlab, 1 daqiqada band qilishingiz mumkin:</i>`;

      await this.sendMessage(chatId, bronText, {
        reply_markup: {
          inline_keyboard: [
            [this.makeLinkButton('🗺 Xaritadan Stol Tanlash', '/stol%20buyurtma/index.html')],
            [{ text: '📞 Qo\'ng\'iroq qilish', url: 'tel:+998712000000' }],
          ],
        },
      });
      return;
    }

    if (text === '🛵 Yetkazib berish') {
      const devText = `🛵 <b>TEZKOR YETKAZIB BERISH</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `• <b>Yetkazish narxi:</b> 15,000 so'm\n` +
        `• <b>150,000 so'mdan yuqori:</b> BEPUL yetkazamiz!\n` +
        `• <b>Eng kam buyurtma:</b> 50,000 so'm\n` +
        `• <b>Vaqti:</b> 35–50 daqiqa (issiq holda eshigingizgacha)\n\n` +
        `<i>Manzilingizni tanlab, issiq taomlarga buyurtma berish uchun quyidagi tugmani bosing:</i>`;

      await this.sendMessage(chatId, devText, {
        reply_markup: {
          inline_keyboard: [
            [this.makeLinkButton('🛍 Taomlarni Tanlash va Buyurtma', '/yetkazib%20berish/index.html')],
            [this.makeLinkButton('🍽 Menyuni ko\'rish', '/raqamli%20menyu/index.html')],
          ],
        },
      });
      return;
    }

    if (text === '📞 Restoran bilan aloqa') {
      await this.sendMessage(chatId, `📞 <b>Dunyo Restaurant Aloqa Ma'lumotlari:</b>\n\n📍 <b>Manzil:</b> Toshkent shahri, Markaz\n☎️ <b>Telefon:</b> +998 71 200 00 00\n⏰ <b>Ish vaqti:</b> 10:00 - 23:00 (har kuni)\n💬 <b>Administrator:</b> @dunyo_admin`);
      return;
    }

    if (text === '📋 Buyurtmalarim') {
      const user = db.getUsers().find((u) => u.chatId === chatId);
      const orders = db.getOrders().filter((o) => (user && user.phone && o.phone && o.phone.includes(user.phone.slice(-9))));
      const bookings = db.getBookings().filter((b) => (user && user.phone && b.phone && b.phone.includes(user.phone.slice(-9))));

      if (!orders.length && !bookings.length) {
        await this.sendMessage(chatId, `Sizda hozircha faol buyurtmalar yoki bronlar topilmadi.\n\nTaom buyurtma qilish uchun quyidagi tugmalardan foydalaning.`);
        return;
      }

      let reply = `📋 <b>Sizning buyurtmalaringiz:</b>\n\n`;
      if (orders.length) {
        reply += `<b>🛵 Taom buyurtmalari:</b>\n`;
        orders.slice(0, 5).forEach((o) => {
          const statusIcons = { new: '🆕 Yangi', accepted: '👨‍🍳 Tayyorlanmoqda', delivering: '🛵 Yetkazilmoqda', completed: '✅ Yetkazildi', cancelled: '❌ Bekor qilingan' };
          reply += `• <b>#${o.id}</b> | ${o.total.toLocaleString()} so'm | ${statusIcons[o.status] || o.status}\n`;
        });
        reply += `\n`;
      }
      if (bookings.length) {
        reply += `<b>📅 Stol bronlari:</b>\n`;
        bookings.slice(0, 5).forEach((b) => {
          const statusIcons = { pending: '⏳ Kutilmoqda', confirmed: '✅ Tasdiqlangan', cancelled: '❌ Bekor qilingan' };
          reply += `• <b>#${b.id}</b> | ${b.date} soat ${b.time} | Stol №${b.tableName || b.tableId} | ${statusIcons[b.status] || b.status}\n`;
        });
      }
      await this.sendMessage(chatId, reply);
      return;
    }

    // Default javob
    await this.sendMessage(chatId, `Buyurtma berish yoki ma'lumot olish uchun quyidagi tugmalardan foydalaning:`, {
      reply_markup: {
        keyboard: [
          [{ text: '🍽 Raqamli menyu' }, { text: '📅 Stol bron qilish' }],
          [{ text: '🛵 Yetkazib berish' }, { text: '📋 Buyurtmalarim' }],
          [{ text: '📞 Restoran bilan aloqa' }],
        ],
        resize_keyboard: true,
      },
    });
  }

  async handleCallback(cb) {
    const data = cb.data || '';
    const chatId = cb.message ? cb.message.chat.id : null;
    const msgId = cb.message ? cb.message.message_id : null;
    const from = cb.from || {};
    const adminName = from.first_name || 'Admin';

    await this.answerCallbackQuery(cb.id, 'Amal bajarildi!');

    // Buyurtma holatlari
    if (data.startsWith('order_')) {
      const [, action, orderId] = data.split('_');
      let newStatus = '';
      let statusText = '';
      let customerMsg = '';

      if (action === 'accept') {
        newStatus = 'accepted';
        statusText = '✅ QABUL QILINDI (Oshxonaga berildi)';
        customerMsg = `👨‍🍳 <b>Xushxabar!</b> Sizning <b>#${orderId}</b> raqamli buyurtmangiz tasdiqlandi va tayyorlanmoqda!`;
      } else if (action === 'delivering') {
        newStatus = 'delivering';
        statusText = '🛵 KURYERGA TOPSHIRILDI (Yo\'lda)';
        customerMsg = `🛵 <b>Buyurtmangiz yo'lda!</b> <b>#${orderId}</b> raqamli buyurtmangiz kuryerga topshirildi va manzilga yetkazilmoqda.`;
      } else if (action === 'complete') {
        newStatus = 'completed';
        statusText = '✔️ YAKUNLANDI (Yetkazildi)';
        customerMsg = `🎉 <b>#${orderId}</b> raqamli buyurtmangiz yetkazildi. Yoqimli ishtaha! Dunyo Restaurant ni tanlaganingiz uchun rahmat!`;
      } else if (action === 'cancel') {
        newStatus = 'cancelled';
        statusText = '❌ BEKOR QILINDI';
        customerMsg = `❌ Hurmatli mijoz, afsuski sizning <b>#${orderId}</b> raqamli buyurtmangiz bekor qilindi. Ma'lumot uchun: +998 71 200 00 00`;
      }

      const updated = db.updateOrderStatus(orderId, newStatus);
      if (updated) {
        // Admin xabarini yangilash
        const oldText = cb.message.text || '';
        const updatedText = `${cb.message.html_text || oldText}\n\n<b>━━━━━━━━━━━━━━━━━━━━</b>\n<b>Holati:</b> ${statusText}\n<i>👤 Mas'ul: ${adminName}</i>`;

        // Yangi inline tugmalar
        let inline_keyboard = [];
        if (newStatus === 'accepted') {
          inline_keyboard = [
            [{ text: '🛵 Kuryerga berildi', callback_data: `order_delivering_${orderId}` }],
            [{ text: '❌ Bekor qilish', callback_data: `order_cancel_${orderId}` }],
          ];
        } else if (newStatus === 'delivering') {
          inline_keyboard = [
            [{ text: '✔️ Yetkazildi (Yakunlash)', callback_data: `order_complete_${orderId}` }],
          ];
        }

        await this.editMessageText(chatId, msgId, updatedText, {
          reply_markup: inline_keyboard.length ? { inline_keyboard } : undefined,
        });

        // Mijozga xabar yuborish
        this.notifyCustomer(updated.phone, customerMsg);
      }
    }

    // Stol broni holatlari
    if (data.startsWith('bron_')) {
      const [, action, bronId] = data.split('_');
      let newStatus = '';
      let statusText = '';
      let customerMsg = '';

      if (action === 'confirm') {
        newStatus = 'confirmed';
        statusText = '✅ TASDIQLANDI (Stol band qilindi)';
        customerMsg = `🎉 <b>Hurmatli mehmon!</b> Sizning <b>#${bronId}</b> raqamli stol broningiz tasdiqlandi! Sizni restoranoshimizda kutib qolamiz.`;
      } else if (action === 'cancel') {
        newStatus = 'cancelled';
        statusText = '❌ BEKOR QILINDI';
        customerMsg = `❌ Hurmatli mehmon, afsuski <b>#${bronId}</b> raqamli stol broni bekor qilindi. Boshqa vaqtni tanlash uchun biz bilan bog'laning.`;
      }

      const updated = db.updateBookingStatus(bronId, newStatus);
      if (updated) {
        const oldText = cb.message.text || '';
        const updatedText = `${cb.message.html_text || oldText}\n\n<b>━━━━━━━━━━━━━━━━━━━━</b>\n<b>Holati:</b> ${statusText}\n<i>👤 Mas'ul: ${adminName}</i>`;

        await this.editMessageText(chatId, msgId, updatedText, { reply_markup: undefined });
        this.notifyCustomer(updated.phone, customerMsg);
      }
    }
  }

  // Mijozga avtomatik xabar yuborish (agar botdan ro'yxatdan o'tgan bo'lsa)
  async notifyCustomer(phone, message) {
    if (!phone) return;
    const user = db.findUserByPhone(phone);
    if (user && user.chatId) {
      await this.sendMessage(user.chatId, message);
    }
  }

  // === ADMIN VA MIJOZGA YANGI BUYURTMA XABARNOMASI ===
  async notifyNewOrder(order) {
    const isDelivery = order.mode === 'delivery';
    const isDineIn = order.mode === 'dinein';

    const header = isDineIn
      ? `🔔 <b>RESTORAN ICHIDAN BUYURTMA #${order.id}</b>`
      : isDelivery
        ? `🔔 <b>YANGI YETKAZIB BERISH BUYURTMASI #${order.id}</b>`
        : `🔔 <b>YANGI OLIB KETISH BUYURTMASI #${order.id}</b>`;

    const itemsText = (order.items || [])
      .map((i) => `• <b>${i.name}</b> × ${i.qty || 1} = ${(i.price ? (i.price * (i.qty || 1)).toLocaleString() : '')} so'm`)
      .join('\n');

    let locationLink = '';
    if (order.loc && order.loc.includes(',')) {
      locationLink = `\n🗺 <b>GPS Joylashuv:</b> <a href="https://www.google.com/maps?q=${order.loc}">Xaritada ochish (Google Maps)</a>`;
    }

    const cleanPhone = (order.phone || '').replace(/\D/g, '');
    const tgDirect = cleanPhone ? ` | <a href="https://t.me/+${cleanPhone}">Telegramda yozish</a>` : '';

    const text = `${header}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Mijoz:</b> ${order.name || 'Noma\'lum'}\n` +
      `📞 <b>Telefon:</b> <code>${order.phone || '—'}</code>${tgDirect}\n` +
      (isDineIn ? `🪑 <b>Stol raqami:</b> № ${order.table || '—'}\n` : '') +
      (isDelivery ? `📍 <b>Manzil:</b> ${order.address || 'Kiritilmagan'}${locationLink}\n` : '') +
      `💳 <b>To'lov turi:</b> ${order.pay === 'karta' ? 'Karta orqali' : 'Naqd pul'}\n\n` +
      `🍲 <b>Taomlar:</b>\n${itemsText}\n\n` +
      (order.fee ? `🛵 <b>Yetkazish xizmati:</b> ${order.fee.toLocaleString()} so'm\n` : '') +
      `💵 <b>Jami summa:</b> <b>${order.total ? order.total.toLocaleString() : 0} so'm</b>\n` +
      (order.comment ? `💬 <b>Izoh:</b> <i>${order.comment}</i>\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Holati: ⏳ Yangi (Kutilmoqda)`;

    const inline_keyboard = [
      [
        { text: '✅ Qabul qilish', callback_data: `order_accept_${order.id}` },
        { text: '🛵 Kuryerga berildi', callback_data: `order_delivering_${order.id}` },
      ],
      [
        { text: '❌ Bekor qilish', callback_data: `order_cancel_${order.id}` },
      ],
    ];

    // Barcha adminlarga xabar yuborish
    const adminIds = this.getAdminChatIds();
    if (adminIds.length > 0) {
      for (const adminId of adminIds) {
        await this.sendMessage(adminId, text, {
          reply_markup: { inline_keyboard },
        });
      }
    } else {
      console.log('\n📌 [YANGI BUYURTMA - ADMIN XABARNOMASI]:\n' + text.replace(/<[^>]*>/g, '') + '\n');
    }

    // Mijozga xabar (agar botda ro'yxatdan o'tgan bo'lsa)
    const customerWelcome = `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n` +
      `Buyurtma raqami: <b>#${order.id}</b>\n` +
      `Jami summa: <b>${order.total ? order.total.toLocaleString() : 0} so'm</b>\n\n` +
      `Restoran ma'muriyati tez orada buyurtmangizni ko'rib chiqadi. Holat o'zgarganda sizga xabar beramiz! 😊`;

    await this.notifyCustomer(order.phone, customerWelcome);
  }

  // === ADMIN VA MIJOZGA YANGI STOL BRONI XABARNOMASI ===
  async notifyNewBooking(booking) {
    const cleanPhone = (booking.phone || '').replace(/\D/g, '');
    const tgDirect = cleanPhone ? ` | <a href="https://t.me/+${cleanPhone}">Telegramda yozish</a>` : '';

    const text = `🔔 <b>YANGI STOL BRONI #${booking.id}</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏛 <b>Korpus:</b> ${booking.korpusName || booking.korpusId || '1-korpus'}\n` +
      `🪑 <b>Stol:</b> № ${booking.tableNumber || booking.tableId} (${booking.seats || booking.guests || 2} kishilik)\n` +
      `🗓 <b>Sana va Vaqt:</b> ${booking.date}, soat <b>${booking.time}</b>\n` +
      `👥 <b>Mehmonlar:</b> ${booking.guests} kishi\n` +
      `👤 <b>Mijoz:</b> ${booking.name}\n` +
      `📞 <b>Telefon:</b> <code>${booking.phone}</code>${tgDirect}\n` +
      (booking.comment ? `💬 <b>Izoh:</b> <i>${booking.comment}</i>\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Holati: ⏳ Tasdiqlash kutilmoqda`;

    const inline_keyboard = [
      [
        { text: '✅ Tasdiqlash', callback_data: `bron_confirm_${booking.id}` },
        { text: '❌ Rad etish', callback_data: `bron_cancel_${booking.id}` },
      ],
    ];

    // Barcha adminlarga xabar yuborish
    const adminIds = this.getAdminChatIds();
    if (adminIds.length > 0) {
      for (const adminId of adminIds) {
        await this.sendMessage(adminId, text, {
          reply_markup: { inline_keyboard },
        });
      }
    } else {
      console.log('\n📌 [YANGI STOL BRONI - ADMIN XABARNOMASI]:\n' + text.replace(/<[^>]*>/g, '') + '\n');
    }

    const customerMsg = `📅 <b>Stol band qilish so'rovingiz qabul qilindi!</b>\n\n` +
      `Bron raqami: <b>#${booking.id}</b>\n` +
      `Sana: <b>${booking.date}</b>, soat <b>${booking.time}</b>\n` +
      `Stol: <b>№ ${booking.tableNumber || booking.tableId}</b> (${booking.guests} kishi)\n\n` +
      `Restoran ma'muriyati tez orada tasdiqlaydi!`;

    await this.notifyCustomer(booking.phone, customerMsg);
  }
}

const telegramService = new TelegramService();
module.exports = telegramService;
