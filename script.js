/* ═══════════════════════════════════════════════════════════════════
   St. Anna Merch Shop – script.js
   ═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────
   ① EMAILJS KONFIGURATION
   Keys aus https://dashboard.emailjs.com
   ───────────────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY   = "Dud4-yGPgxrJfb0ny";
const EMAILJS_SERVICE_ID   = "service_9qtdftz";
const EMAILJS_ADMIN_TPL_ID = "template_8qh2y65";  // Bestelleingang an Shop
const EMAILJS_USER_TPL_ID  = "template_giifnmo";  // Bestätigung an Käufer

/* ─────────────────────────────────────────────────────────────────────
   ② PRODUKTDATEN
   colors: Array aus { hex, name } – hex für den Farbkreis,
                                     name für E-Mail / Bestellung
   ───────────────────────────────────────────────────────────────────── */
const products = [
  {
    id: 1,
    name: "Polo Shirt",
    price: "24,99 €",
    desc: "Unser in der EU gefertigter Polo-Klassiker aus 100 % Baumwolle.",
    badge: "First edition",
    img: "polo.jpeg",
    colors: [
      { hex: "#000670", name: "Blau" },
      { hex: "#ffffff", name: "Weiß" },
      { hex: "#000000", name: "Schwarz" },
    ],
  },
  {
    id: 2,
    name: "T-Shirt",
    price: "19,99 €",
    desc: "Leichtes 100 % Baumwoll-Shirt für jeden Tag.",
    badge: "NEU",
    img: "tshirt.jpeg",
    colors: [
      { hex: "#000564", name: "Blau" },
      { hex: "#ffffff", name: "Weiß" },
      { hex: "#000000", name: "Schwarz" },
    ],
  },

  /*
  {
    id: 3,
    name: "Snapback Cap",
    price: "19,99 €",
    desc: "Strukturierte 6-Panel-Cap mit gesticktem St.-Anna-Logo.",
    badge: null,
    img: "img/cap.jpg",
    colors: [
      { hex: "#1a1b2e", name: "Dunkelblau" },
      { hex: "#555566", name: "Grau" },
    ],
  },
  */
];

/* ─────────────────────────────────────────────────────────────────────
   ③ STATE
   ───────────────────────────────────────────────────────────────────── */
let currentProduct = null;

/* ─────────────────────────────────────────────────────────────────────
   ④ PRODUKTE RENDERN
   ───────────────────────────────────────────────────────────────────── */
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach((p, idx) => {
    // Farbkreise auf der Karte zeigen den Hex-Wert als Hintergrund
    const colorDots = p.colors
      .map(c => `<span class="color-dot" style="background:${c.hex}" title="${c.name}"
                   ${c.hex === "#ffffff" ? 'style="background:#fff;border-color:#bbb"' : ""}></span>`)
      .join("");

    const badgeHTML = p.badge
      ? `<span class="card-badge">${p.badge}</span>`
      : "";

    const card = document.createElement("article");
    card.className = "product-card";
    card.style.animationDelay = `${idx * 0.07}s`;
    card.setAttribute("data-id", p.id);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${p.name} bestellen`);

    card.innerHTML = `
      <div class="card-img-wrap">
        ${badgeHTML}
        <img src="${p.img}" alt="${p.name}" loading="lazy"
             onerror="this.src='https://placehold.co/400x400/12131f/e8a020?text=${encodeURIComponent(p.name)}'">
      </div>
      <div class="card-body">
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-colors">${colorDots}</div>
        <div class="card-footer">
          <span class="card-price">${p.price}</span>
          <button class="card-btn">Bestellen</button>
        </div>
      </div>`;

    card.addEventListener("click", () => openModal(p));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") openModal(p);
    });

    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────────────────────────────
   ⑤ FARB-PICKER (visuell)
   ───────────────────────────────────────────────────────────────────── */
function buildColorPicker(colors) {
  const row = document.getElementById("colorSwatchRow");
  const hidden = document.getElementById("fieldColor");
  const label = document.getElementById("colorSelectedLabel");

  row.innerHTML = "";
  hidden.value = "";
  label.textContent = "";

  colors.forEach(c => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-swatch";
    btn.setAttribute("aria-label", c.name);
    btn.setAttribute("title", c.name);
    btn.style.setProperty("--swatch-color", c.hex);
    // White swatch needs a border so it's visible on white background
    if (c.hex === "#ffffff" || c.hex === "#fff") {
      btn.classList.add("color-swatch--light");
    }

    btn.addEventListener("click", () => {
      // Deselect all
      row.querySelectorAll(".color-swatch").forEach(b => b.classList.remove("is-selected"));
      // Select this one
      btn.classList.add("is-selected");
      hidden.value = c.name;
      label.textContent = c.name;
    });

    row.appendChild(btn);
  });
}

/* ─────────────────────────────────────────────────────────────────────
   ⑥ MODAL – ÖFFNEN / SCHLIESSEN
   ───────────────────────────────────────────────────────────────────── */
function openModal(product) {
  currentProduct = product;

  // Produktvorschau befüllen
  const img = document.getElementById("modalImg");
  img.src = product.img;
  img.alt = product.name;
  img.onerror = function () {
    this.src = `https://placehold.co/100x100/12131f/e8a020?text=${encodeURIComponent(product.name)}`;
  };
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalPrice").textContent  = product.price;

  // Farbwähler aufbauen
  buildColorPicker(product.colors);

  // Formular & Erfolg zurücksetzen
  document.getElementById("orderForm").reset();
  // reset() clears the hidden input too – colour label stays though, clear manually
  document.getElementById("fieldColor").value = "";
  document.getElementById("colorSelectedLabel").textContent = "";
  document.getElementById("colorSwatchRow")
    .querySelectorAll(".color-swatch")
    .forEach(b => b.classList.remove("is-selected"));

  document.getElementById("orderForm").hidden = false;
  document.getElementById("modalSuccess").hidden = true;
  document.getElementById("formError").textContent = "";
  document.getElementById("submitLabel").textContent = "Bestellung absenden";
  document.getElementById("submitSpinner").hidden = true;
  document.getElementById("submitBtn").disabled = false;

  // Modal einblenden
  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";

  // Fokus setzen (Accessibility)
  setTimeout(() => document.getElementById("modalClose").focus(), 350);
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "";
  currentProduct = null;
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});
document.getElementById("successClose").addEventListener("click", closeModal);

/* ─────────────────────────────────────────────────────────────────────
   ⑦ FORMULAR-VALIDIERUNG
   ───────────────────────────────────────────────────────────────────── */
function validateForm() {
  const fields = [
    { id: "fieldSize",        label: "Größe" },
    { id: "fieldColor",       label: "Farbe" },
    { id: "fieldGender",      label: "Geschlecht" },
    { id: "fieldClassLevel",  label: "Klassenstufe" },
    { id: "fieldClassLetter", label: "Klassenbuchstabe" },
    { id: "fieldName",        label: "Vollständiger Name" },
    { id: "fieldEmail",       label: "E-Mail" },
  ];

  for (const f of fields) {
    const el = document.getElementById(f.id);
    if (!el.value.trim()) return `Bitte das Feld „${f.label}" ausfüllen.`;
  }

  const email = document.getElementById("fieldEmail").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Bitte eine gültige E-Mail-Adresse eingeben.";
  }

  return null; // alles OK
}

/* ─────────────────────────────────────────────────────────────────────
   ⑧ BESTELLUNG ABSENDEN (EmailJS – 2 Mails)
   ───────────────────────────────────────────────────────────────────── */
document.getElementById("orderForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const error = validateForm();
  if (error) {
    document.getElementById("formError").textContent = error;
    return;
  }
  document.getElementById("formError").textContent = "";

  // UI: Lade-Status
  document.getElementById("submitLabel").textContent = "Wird gesendet…";
  document.getElementById("submitSpinner").hidden = false;
  document.getElementById("submitBtn").disabled = true;

  // Daten sammeln
  const orderData = {
    product_name:   currentProduct.name,
    product_price:  currentProduct.price,
    product_img:    window.location.origin + "/" + currentProduct.img,
    size:           document.getElementById("fieldSize").value,
    color:          document.getElementById("fieldColor").value,
    gender:         document.getElementById("fieldGender").value,
    class_level:    document.getElementById("fieldClassLevel").value,
    class_letter:   document.getElementById("fieldClassLetter").value,
    customer_name:  document.getElementById("fieldName").value.trim(),
    customer_email: document.getElementById("fieldEmail").value.trim(),
    note:           document.getElementById("fieldNote").value.trim() || "—",
    order_date:     new Date().toLocaleDateString("de-DE", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    }),
    reply_to: document.getElementById("fieldEmail").value.trim(),
  };

  try {
    // ── Mail 1: Bestelleingang an den Shop ──────────────────────────
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TPL_ID, {
      ...orderData,
      to_email: "bestellung@merch.st-anna.de",
    });

    // ── Mail 2: Bestätigungsmail an den Käufer ──────────────────────
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_USER_TPL_ID, {
      ...orderData,
      to_email: orderData.customer_email,
    });

    // Erfolg anzeigen
    document.getElementById("orderForm").hidden = true;
    document.getElementById("modalSuccess").hidden = false;

  } catch (err) {
    console.error("EmailJS Fehler:", err);
    document.getElementById("formError").textContent =
      "Beim Senden ist ein Fehler aufgetreten. Bitte versuche es erneut oder schreibe uns direkt an bestellung@merch.st-anna.de";
    document.getElementById("submitLabel").textContent = "Bestellung absenden";
    document.getElementById("submitSpinner").hidden = true;
    document.getElementById("submitBtn").disabled = false;
  }
});

/* ─────────────────────────────────────────────────────────────────────
   ⑨ APP STARTEN
   ───────────────────────────────────────────────────────────────────── */
(function init() {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  renderProducts();
})();
