const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  bookings: path.join(DATA_DIR, 'bookings.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
  users: path.join(DATA_DIR, 'users.json'),
};

function readJSON(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const content = fs.readFileSync(file, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return fallback;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// === BOOKINGS (STOL BRONLARI) ===
function getBookings() {
  return readJSON(FILES.bookings, []);
}

function getBookingsByDate(date) {
  const all = getBookings();
  if (!date) return all;
  return all.filter((b) => b.date === date && b.status !== 'cancelled');
}

function addBooking(data) {
  const bookings = getBookings();
  const id = 'BRON-' + Date.now().toString().slice(-6);
  const code = Math.floor(1000 + Math.random() * 9000);
  const booking = {
    id,
    code,
    ...data,
    status: 'pending', // pending | confirmed | cancelled
    createdAt: new Date().toISOString(),
  };
  bookings.unshift(booking);
  writeJSON(FILES.bookings, bookings);
  return booking;
}

function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const item = bookings.find((b) => b.id === id || String(b.code) === String(id));
  if (!item) return null;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  writeJSON(FILES.bookings, bookings);
  return item;
}

// === ORDERS (YETKAZIB BERISH VA RESTORAN ICHIDAN) ===
function getOrders() {
  return readJSON(FILES.orders, []);
}

function addOrder(data) {
  const orders = getOrders();
  const id = 'ORD-' + Date.now().toString().slice(-6);
  const code = Math.floor(1000 + Math.random() * 9000);
  const order = {
    id,
    code,
    ...data,
    status: 'new', // new | accepted | preparing | delivering | completed | cancelled
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  writeJSON(FILES.orders, orders);
  return order;
}

function updateOrderStatus(id, status) {
  const orders = getOrders();
  const item = orders.find((o) => o.id === id || String(o.code) === String(id));
  if (!item) return null;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  writeJSON(FILES.orders, orders);
  return item;
}

// === TELEGRAM BOT USERS ===
function getUsers() {
  return readJSON(FILES.users, []);
}

function upsertUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.chatId === user.chatId);
  const now = new Date().toISOString();
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user, updatedAt: now };
  } else {
    users.push({ ...user, createdAt: now });
  }
  writeJSON(FILES.users, users);
}

function findUserByPhone(phone) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  const users = getUsers();
  return users.find((u) => u.phone && u.phone.replace(/\D/g, '').includes(cleanPhone.slice(-9)));
}

module.exports = {
  getBookings,
  getBookingsByDate,
  addBooking,
  updateBookingStatus,
  getOrders,
  addOrder,
  updateOrderStatus,
  getUsers,
  upsertUser,
  findUserByPhone,
};

