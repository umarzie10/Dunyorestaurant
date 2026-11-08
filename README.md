# 🍽 Dunyo Restaurant - Veb-sayt, Backend API va Telegram Bot

Dunyo Restaurant uchun to'liq avtomatlashtirilgan restoran boshqaruv tizimi.

---

## 🚀 Loyiha Imkoniyatlari

1. **🌐 Asosiy sayt (`/the main`):**
   - Zamonaviy interaktiv animatsiyalar, taomlar va restoran taqdimoti.

2. **🍽 Raqamli Menyu (`/raqamli menyu`):**
   - QR-kod orqali restoran ichidagi stollardan buyurtma berish.
   - Stol raqamini kiritish va buyurtmani to'g'ridan-to'g'ri oshxona / botga yuborish.

3. **📅 Stol Bron Qilish (`/stol buyurtma`):**
   - **Xaritada real vaqt rejimida stollar bandligini ko'rish.**
   - 4 xil korpus: Asosiy zal, Oilaviy zal, VIP kabinalar va Yozgi bog'.
   - Stol tanlanganda boshqa mijozlar uchun xaritada avtomatik **"Band"** bo'lib qoladi (Double-booking bo'lmaydi).

4. **🛵 Yetkazib Berish va Olib Ketish (`/yetkazib berish`):**
   - Taomlarni savatga yig'ish, to'lov usulini tanlash (Naqd / Karta).
   - GPS joylashuvni bitta tugma orqali xaritadan aniqlash.
   - Minimal buyurtma va bepul yetkazish chegaralari.

5. **⚙️ Administrator Boshqaruv Markazi (`/admin`):**
   - Brauzer orqali real vaqtda kelgan barcha buyurtmalar va stol bronlarini boshqarish.
   - Buyurtmani qabul qilish, kuryerga topshirish yoki bekor qilish.
   - Xaritada yetkazish manzilini ochish (Google Maps).

6. **🤖 Telegram Bot Integratsiyasi (`server/telegram.js`):**
   - **Admin uchun:** Yangi buyurtma yoki stol broni tushishi bilan barcha tafsilotlar (mijoz ismi, telefon, taomlar, xarita havolasi) va interaktiv tugmalar (`[✅ Qabul qilish]`, `[🛵 Kuryerga berildi]`, `[❌ Bekor qilish]`) bilan xabar keladi.
   - **Mijoz uchun:** Buyurtma holati o'zgarganda (tasdiqlandi, yo'lda, yetkazildi) mijozning Telegramiga avtomatik xabar boradi.

---

## 🛠 O'rnatish va Ishga Tushirish

### 1. Talablar:
- **Node.js** (v18 yoki undan yuqori)

### 2. Loyihani ishga tushirish:
```bash
npm start
```
Server standart bo'yicha **http://localhost:3000** manzilida ishlaydi.

---

## 🤖 Telegram Botni Ulash (2 daqiqalik qo'llanma)

1. Telegramda [@BotFather](https://t.me/BotFather) ga kiring va `/newbot` buyrug'i orqali yangi bot yarating.
2. BotFather bergan **HTTP API Token**ni nusxalang.
3. Loyihaning bosh ildizidagi `.env` faylini oching:
   ```env
   PORT=3000
   BOT_TOKEN=bu_yerga_botfather_tokenini_yozing
   ADMIN_CHAT_ID=bu_yerga_admin_chat_id_yozing
   ```
4. O'zingizning Telegram **Chat ID** raqamingizni bilish uchun:
   - Botni ishga tushirib unga `/id` deb yozing yoki [@userinfobot](https://t.me/userinfobot) orqali bilib oling.
5. Serverni qayta ishga tushiring:
   ```bash
   npm start
   ```

Tayyor! Endi saytdan buyurtma berilganida yoki stol bron qilinganida Telegram orqali lahzada xabar keladi!

