require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const telegram = require('./telegram');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === API ROUTES ===

// 1. Stol bronlari ro'yxati (xaritada bandlikni ko'rsatish uchun)
app.get('/api/reservations', (req, res) => {
  const { date } = req.query;
  const bookings = db.getBookingsByDate(date);
  res.json({ success: true, bookings });
});

// 2. Yangi stol bron qilish
app.post('/api/reservations', async (req, res) => {
  try {
    const { tableId, tableNumber, korpusId, korpusName, seats, date, time, guests, name, phone, comment } = req.body;

    if (!tableId || !date || !time || !name || !phone) {
      return res.status(400).json({ success: false, message: 'Barcha zarur ma\'lumotlarni to\'ldiring.' });
    }

    // Bandlikni qayta tekshirish (Double-booking oldini olish)
    const existing = db.getBookingsByDate(date);
    const STAY_HOURS = 2;
    const toMin = (t) => {
      const [h, m] = (t || '0:0').split(':').map(Number);
      return h * 60 + m;
    };

    const isConflict = existing.some(
      (b) => b.tableId === tableId && Math.abs(toMin(b.time) - toMin(time)) < STAY_HOURS * 60
    );

    if (isConflict) {
      return res.status(409).json({
        success: false,
        message: 'Kechirasiz, ushbu stol bu vaqtda boshqa mijoz tomonidan band qilib bo\'lingan.',
      });
    }

    const booking = db.addBooking({
      tableId,
      tableNumber,
      korpusId,
      korpusName,
      seats,
      date,
      time,
      guests: Number(guests) || 2,
      name,
      phone,
      comment: comment || '',
    });

    // Telegram bot orqali Adminga va Mijozga xabar yuborish
    telegram.notifyNewBooking(booking).catch((err) => console.error('Booking notification error:', err));

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi.' });
  }
});

// 3. Yetkazib berish yoki Olib ketish buyurtmasi
app.post('/api/delivery', async (req, res) => {
  try {
    const { mode, pay, items, sub, fee, total, name, phone, address, loc, comment } = req.body;

    if (!items || !items.length || !name || !phone) {
      return res.status(400).json({ success: false, message: 'Buyurtma ma\'lumotlari to\'liq emas.' });
    }

    const order = db.addOrder({
      mode: mode || 'delivery',
      pay: pay || 'naqd',
      items,
      sub: Number(sub) || 0,
      fee: Number(fee) || 0,
      total: Number(total) || 0,
      name,
      phone,
      address: address || '',
      loc: loc || '',
      comment: comment || '',
    });

    // Telegram bot orqali Adminga va Mijozga xabar yuborish
    telegram.notifyNewOrder(order).catch((err) => console.error('Delivery notification error:', err));

    res.json({ success: true, order });
  } catch (err) {
    console.error('Delivery order error:', err);
    res.status(500).json({ success: false, message: 'Buyurtmani qabul qilishda xatolik yuz berdi.' });
  }
});

// 4. Restoran ichidan (Raqamli menyu orqali) buyurtma
app.post('/api/dinein', async (req, res) => {
  try {
    const { table, items, total, comment, phone, name } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Savat bo\'sh.' });
    }

    const order = db.addOrder({
      mode: 'dinein',
      table: table || 'Noma\'lum',
      items,
      total: Number(total) || 0,
      name: name || `Mijoz (Stol ${table || '—'})`,
      phone: phone || '',
      comment: comment || '',
    });

    telegram.notifyNewOrder(order).catch((err) => console.error('Dine-in notification error:', err));

    res.json({ success: true, order });
  } catch (err) {
    console.error('Dine-in order error:', err);
    res.status(500).json({ success: false, message: 'Buyurtmani yuborishda xatolik.' });
  }
});

// 5. Barcha buyurtmalar va bronlarni olish
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: db.getOrders() });
});

// Bitta buyurtma holatini olish (real vaqt rejimida kuzatish uchun)
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = db.getOrders();
  const item = orders.find((o) => o.id === id || String(o.code) === String(id));
  if (!item) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
  res.json({ success: true, order: item });
});

// 6. Buyurtma holatini yangilash
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = db.updateOrderStatus(id, status);
  if (!updated) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi.' });
  res.json({ success: true, order: updated });
});

// Bitta bron holatini olish (real vaqt rejimida kuzatish uchun)
app.get('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const bookings = db.getBookings();
  const item = bookings.find((b) => b.id === id || String(b.code) === String(id));
  if (!item) return res.status(404).json({ success: false, message: 'Bron topilmadi' });
  res.json({ success: true, booking: item });
});

// 7. Bron holatini yangilash
app.patch('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = db.updateBookingStatus(id, status);
  if (!updated) return res.status(404).json({ success: false, message: 'Bron topilmadi.' });
  res.json({ success: true, booking: updated });
});

// 8. AI Yordamchi (Sun'iy intellekt maslahatchisi)
app.post('/api/ai-chat', (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.json({ success: true, reply: "Assalomu alaykum! Dunyo Restaurant AI yordamchisiman. Sizga taom tanlash yoki stol bron qilishda qanday yordam bera olaman?" });
  }

  const q = message.toLowerCase().trim();
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
    reply = `Savolingiz uchun rahmat! Men Dunyo Restaurant bo'yicha barcha ma'lumotlarni bilaman: \n\n• 🍛 Osh, kabob va maxsus setlar tavsiyasi\n• 📅 Bo'sh stollarni interaktiv xaritadan tanlash va bron qilish\n• 🛵 Manzilgacha tezkor yetkazib berish\n\nIltimos, o'zingizni qiziqtirgan savolni bering yoki pastdagi tugmalardan foydalaning!`;
    action = { text: "Raqamli menyuga o'tish", url: "/raqamli menyu/index.html" };
  }

  res.json({ success: true, reply, action });
});

// 8. Tizim holati (Statistika va Bot holati)
app.get('/api/status', (req, res) => {
  const orders = db.getOrders();
  const bookings = db.getBookings();
  const users = db.getUsers();

  res.json({
    success: true,
    botConnected: Boolean(process.env.BOT_TOKEN && process.env.BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE'),
    adminConfigured: Boolean(process.env.ADMIN_CHAT_ID),
    stats: {
      totalOrders: orders.length,
      totalBookings: bookings.length,
      registeredUsers: users.length,
      activeOrders: orders.filter((o) => ['new', 'accepted', 'delivering'].includes(o.status)).length,
      activeBookings: bookings.filter((b) => b.status === 'pending').length,
    },
  });
});

// === ADMIN PANEL SAHIFASI ===
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// === STATIK FAYLLARNI ULASH ===
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// 404 handler
app.use((req, res) => {
  res.redirect('/the main/index.html');
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🌟 DUNYO RESTAURANT TIZIMI ISHGA TUSHDI! 🌟`);
  console.log(`======================================================`);
  console.log(`  🌐 Veb-sayt:         http://localhost:${PORT}`);
  console.log(`  🍽 Raqamli menyu:    http://localhost:${PORT}/raqamli%20menyu/index.html`);
  console.log(`  📅 Stol bron qilish: http://localhost:${PORT}/stol%20buyurtma/index.html`);
  console.log(`  🛵 Yetkazib berish:  http://localhost:${PORT}/yetkazib%20berish/index.html`);
  console.log(`  ⚙️ Admin boshqaruv:  http://localhost:${PORT}/admin`);
  console.log(`======================================================\n`);

  // Telegram botni faollashtirish
  telegram.init();
});

