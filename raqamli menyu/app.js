(() => {
  /* ====== SOZLAMALAR ====== */
  const RESTAURANT = "Dunyo restaurant";

  /* ====== TAOMLAR RO'YXATI (narxlar namuna, o'zingiznikiga almashtiring) ====== */
  const CATS = [
    "Hammasi",
    "Osh",
    "Go’sht",
    "Shashlik",
    "Sho’rva",
    "Salat",
    "Ichimlik",
  ];

  const DISHES = [
    {
      id: "osh1",
      cat: "Osh",
      name: "To’y oshi",
      price: 45000,
      hot: true,
      img: "../images/osh.img.jpg",
      emoji: "🍛",
      desc: "Sara guruch, mol go’shti, sabzi va zira. Qozonda damlangan.",
    },
    {
      id: "osh2",
      cat: "Osh",
      name: "Choyxona oshi",
      price: 38000,
      emoji: "🍛",
      desc: "Yengil va xushbo’y osh, ko’k choy bilan yaxshi ketadi.",
    },
    {
      id: "osh3",
      cat: "Osh",
      name: "Bayram oshi (qazi bilan)",
      price: 55000,
      emoji: "🍛",
      desc: "Qazi, no’xat va mayiz qo’shilgan, bayramona osh.",
    },

    {
      id: "gosht1",
      cat: "Go’sht",
      name: "Yumshoq go’sht",
      price: 68000,
      hot: true,
      img: "../images/yumshoq.jpg",
      emoji: "🍖",
      desc: "Yosh go’sht past olovda soatlab dimlangan, pichoqsiz ajraladi.",
    },
    {
      id: "gosht2",
      cat: "Go’sht",
      name: "Dimlama",
      price: 58000,
      emoji: "🍖",
      desc: "Go’sht, kartoshka va sabzavotlar o’z sharbatida pishadi.",
    },
    {
      id: "gosht3",
      cat: "Go’sht",
      name: "Qozon kabob",
      price: 72000,
      emoji: "🍖",
      desc: "Qovurilgan go’sht va kartoshka, ustiga piyoz va ko’katlar.",
    },

    {
      id: "sh1",
      cat: "Shashlik",
      name: "Mol go’shti shashlik",
      price: 18000,
      hot: true,
      emoji: "🍢",
      desc: "Ko’mirda pishirilgan, piyoz bilan. 1 shish.",
    },
    {
      id: "sh2",
      cat: "Shashlik",
      name: "Jigar kabob",
      price: 15000,
      emoji: "🍢",
      desc: "Yumshoq jigar, yog’ bilan o’ralgan. 1 shish.",
    },
    {
      id: "sh3",
      cat: "Shashlik",
      name: "Tovuq shashlik",
      price: 14000,
      emoji: "🍢",
      desc: "Marinadlangan tovuq go’shti. 1 shish.",
    },
    {
      id: "sh4",
      cat: "Shashlik",
      name: "Lyulya kabob",
      price: 17000,
      emoji: "🍢",
      desc: "Maydalangan go’shtdan, ziravorlar bilan. 1 shish.",
    },

    {
      id: "sho1",
      cat: "Sho’rva",
      name: "Mastava",
      price: 28000,
      emoji: "🍲",
      desc: "Guruch, go’sht va sabzavotli quyuq sho’rva.",
    },
    {
      id: "sho2",
      cat: "Sho’rva",
      name: "Lag’mon",
      price: 36000,
      emoji: "🍲",
      desc: "Qo’lda cho’zilgan lag’mon, go’sht va sabzavot qovurmasi bilan.",
    },
    {
      id: "sho3",
      cat: "Sho’rva",
      name: "Sho’rva",
      price: 32000,
      emoji: "🍲",
      desc: "Katta bo’lak go’sht va kartoshkali, to’yimli sho’rva.",
    },

    {
      id: "sal1",
      cat: "Salat",
      name: "Achichuk",
      price: 14000,
      emoji: "🥗",
      desc: "Pomidor, piyoz va achchiq qalampir. Osh bilan juda mos.",
    },
    {
      id: "sal2",
      cat: "Salat",
      name: "Toshkent salati",
      price: 26000,
      emoji: "🥗",
      desc: "Go’sht, turp, sabzi va piyozli to’yimli salat.",
    },
    {
      id: "sal3",
      cat: "Salat",
      name: "Yangi sabzavotlar",
      price: 22000,
      emoji: "🥗",
      desc: "Bodring, pomidor, qalampir va ko’katlar.",
    },

    {
      id: "ich1",
      cat: "Ichimlik",
      name: "Ko’k choy",
      price: 8000,
      emoji: "🍵",
      desc: "Choynakda, 2 kishiga.",
    },
    {
      id: "ich2",
      cat: "Ichimlik",
      name: "Qora choy",
      price: 8000,
      emoji: "🍵",
      desc: "Choynakda, 2 kishiga.",
    },
    {
      id: "ich3",
      cat: "Ichimlik",
      name: "Kompot",
      price: 12000,
      emoji: "🧃",
      desc: "Quritilgan mevalardan, sovuq. 0.5 l.",
    },
    {
      id: "ich4",
      cat: "Ichimlik",
      name: "Ayron",
      price: 10000,
      emoji: "🥛",
      desc: "Sovuq, tuzli. 0.5 l.",
    },
  ];

  /* ====== HOLAT ====== */
  const state = { cat: "Hammasi", q: "" };
  let cart = {};
  try {
    cart = JSON.parse(localStorage.getItem("dunyo_cart")) || {};
  } catch (e) {
    cart = {};
  }

  const $ = (id) => document.getElementById(id);
  const catsEl = $("cats"),
    gridEl = $("dishes"),
    emptyEl = $("empty"),
    searchEl = $("search");
  const fab = $("cartFab"),
    cartEl = $("cart"),
    overlay = $("cartOverlay");

  const fmt = (n) => n.toLocaleString("ru-RU") + " so’m";
  const byId = (id) => DISHES.find((d) => d.id === id);

  function saveCart() {
    try {
      localStorage.setItem("dunyo_cart", JSON.stringify(cart));
    } catch (e) {
      /* e'tibor bermaymiz */
    }
  }

  /* ====== TOIFALAR ====== */
  function renderCats() {
    catsEl.innerHTML = CATS.map(
      (c) =>
        `<button class="cat${c === state.cat ? " is-active" : ""}" role="tab" aria-selected="${c === state.cat}" data-cat="${c}">${c}</button>`,
    ).join("");
  }

  catsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.cat = btn.dataset.cat;
    renderCats();
    renderDishes();
  });

  searchEl.addEventListener("input", () => {
    state.q = searchEl.value.trim().toLowerCase();
    renderDishes();
  });

  /* ====== TAOMLAR ====== */
  function controlHTML(id) {
    const q = cart[id] || 0;
    return q
      ? `<div class="step"><button data-act="dec" aria-label="Kamaytirish">−</button><span>${q}</span><button data-act="inc" aria-label="Ko’paytirish">+</button></div>`
      : `<button class="add" data-act="inc">Qo’shish</button>`;
  }

  function dishHTML(d, i) {
    const media = d.img
      ? `<img class="dish_img" src="${d.img}" alt="${d.name}" loading="lazy">`
      : `<div class="dish_img dish_emoji" aria-hidden="true">${d.emoji}</div>`;
    return `
        <article class="dish" data-id="${d.id}" style="animation-delay:${Math.min(i * 40, 400)}ms">
            ${d.hot ? '<span class="dish_badge">Mashhur</span>' : ""}
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
    const list = DISHES.filter(
      (d) =>
        (state.cat === "Hammasi" || d.cat === state.cat) &&
        (!state.q || (d.name + " " + d.desc).toLowerCase().includes(state.q)),
    );
    gridEl.innerHTML = list.map(dishHTML).join("");
    emptyEl.hidden = list.length > 0;
  }

  /* ====== SAVAT ====== */
  function change(id, delta) {
    const next = (cart[id] || 0) + delta;
    if (next <= 0) delete cart[id];
    else cart[id] = Math.min(next, 99);
    saveCart();

    const ctrl = gridEl.querySelector(`[data-id="${id}"] .dish_ctrl`);
    if (ctrl) ctrl.innerHTML = controlHTML(id);
    updateCart();

    if (delta > 0) {
      fab.classList.remove("bump");
      void fab.offsetWidth; // animatsiyani qayta ishga tushirish
      fab.classList.add("bump");
    }
  }

  function totals() {
    let count = 0,
      total = 0;
    Object.keys(cart).forEach((id) => {
      const d = byId(id);
      if (!d) return;
      count += cart[id];
      total += cart[id] * d.price;
    });
    return { count, total };
  }

  function updateCart() {
    const { count, total } = totals();
    $("cartCount").textContent = count;
    $("cartTotalFab").textContent = fmt(total);
    $("cartTotal").textContent = fmt(total);
    $("sendOrder").disabled = count === 0;
    fab.hidden = count === 0;

    const ids = Object.keys(cart).filter(byId);
    $("cartItems").innerHTML = ids.length
      ? ids
        .map((id) => {
          const d = byId(id);
          return `
                <li class="cart_row" data-id="${id}">
                    <div>
                        <div class="cart_row_name">${d.name}</div>
                        <div class="cart_row_price">${fmt(d.price)} × ${cart[id]} = ${fmt(d.price * cart[id])}</div>
                    </div>
                    <div class="step">
                        <button data-act="dec" aria-label="Kamaytirish">−</button>
                        <span>${cart[id]}</span>
                        <button data-act="inc" aria-label="Ko’paytirish">+</button>
                    </div>
                </li>`;
        })
        .join("")
      : '<li class="cart_empty">Savat bo’sh. Menyudan taom tanlang.</li>';

    if (count === 0) closeCart();
  }

  function openCart() {
    cartEl.classList.add("is-open");
    cartEl.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
  }

  function closeCart() {
    cartEl.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
  }

  function onStepClick(e) {
    const btn = e.target.closest("[data-act]");
    const host = e.target.closest("[data-id]");
    if (!btn || !host) return;
    change(host.dataset.id, btn.dataset.act === "inc" ? 1 : -1);
  }

  gridEl.addEventListener("click", onStepClick);
  $("cartItems").addEventListener("click", onStepClick);
  fab.addEventListener("click", openCart);
  overlay.addEventListener("click", closeCart);
  $("closeCart").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  /* ====== BUYURTMANI YUBORISH ====== */
  $("sendOrder").addEventListener("click", async () => {
    const { total, count } = totals();
    if (!count) return alert("Savat bo'sh. Avval taom tanlang.");

    const table = $("table").value.trim();
    const items = Object.keys(cart)
      .filter(byId)
      .map((id) => {
        const d = byId(id);
        return { name: d.name, price: d.price, qty: cart[id] };
      });

    const btn = $("sendOrder");
    btn.disabled = true;
    btn.textContent = "Yuborilmoqda...";

    const apiBase = window.location.origin.includes(':3000') ? '' : 'http://localhost:3000';
    try {
      const res = await fetch(`${apiBase}/api/dinein`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, items, total }),
      });
      const data = await res.json();

      if (data.success) {
        alert(
          `✅ Buyurtmangiz qabul qilindi!\n\nBuyurtma raqami: #${data.order.id}\nStol: № ${table || "Belgilanmagan"}\nJami: ${fmt(total)}\n\nOshxona tayyorlashga kirishdi. Yoqimli ishtaha!`
        );
        cart = {};
        saveCart();
        updateCart();
        closeCart();
      } else {
        alert("Buyurtmani yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      }
    } catch (e) {
      alert("Server bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Buyurtmani yuborish";
    }
  });

  /* ====== SARLAVHA ANIMATSIYASI ====== */
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!reduceMotion) {
    const title = document.querySelector(".menu_title");
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", i);
      s.textContent = ch === " " ? "\u00A0" : ch;
      title.appendChild(s);
    });

    const para = document.querySelector(".menu_text");
    const words = para.textContent.trim().split(/\s+/);
    para.textContent = "";
    words.forEach((w, i) => {
      const wrap = document.createElement("span");
      wrap.className = "w";
      const inner = document.createElement("span");
      inner.textContent = w;
      inner.style.setProperty("--d", 600 + Math.min(i * 35, 1000) + "ms");
      wrap.appendChild(inner);
      para.appendChild(wrap);
      if (i < words.length - 1) para.appendChild(document.createTextNode(" "));
    });
    requestAnimationFrame(() => para.classList.add("is-visible"));
  }

  /* ====== BOSHLASH ====== */
  renderCats();
  renderDishes();
  updateCart();
})();
