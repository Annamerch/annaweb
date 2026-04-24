/* ═══════════════════════════════════════════════════════════════════
   St. Anna Merch Shop – script.js
   ═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────
   ① EMAILJS KONFIGURATION
   Trage hier deine Keys aus https://dashboard.emailjs.com ein:
   ───────────────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY    = "Dud4-yGPgxrJfb0ny";        // Account → API Keys
const EMAILJS_SERVICE_ID    = "service_9qtdftz";       // Email Services → Service ID
const EMAILJS_ADMIN_TPL_ID  = "template_8qh2y65";  // Template für Bestelleingang
const EMAILJS_USER_TPL_ID   = "template_giifnmo";   // Template für Bestätigungsmail

/* ─────────────────────────────────────────────────────────────────────
   ② PRODUKTDATEN – hier kannst du alle Produkte einfach anpassen
   Felder:
     id        – eindeutige ID (Zahl)
     name      – Produktname
     price     – Preis als String, z.B. "24,99 €"
     priceNum  – Preis als Zahl für PayPal, z.B. 24.99
     desc      – kurze Beschreibung
     badge     – optionaler Aufkleber (z.B. "NEU"), null = kein Badge
     img       – Pfad zum Produktbild (relativ zu index.html)
     colors    – Array der verfügbaren Farben
   ───────────────────────────────────────────────────────────────────── */
const products = [
  {
    id: 1,
    name: "Classic Hoodie",
    price: "32,99 €",
    priceNum: 32.99,
    desc: "Unser Hoodie-Klassiker aus 80 % Baumwolle. Weich, warm und zeitlos.",
    badge: "Bestseller",
    img: "img/hoodie.jpg",        // ← Bild ersetzen
    colors: ["#1a1b2e", "#ffffff", "#8b0000"],
  },
  {
    id: 2,
    name: "T-Shirt Basic",
    price: "18,99 €",
    priceNum: 18.99,
    desc: "Leichtes 100 % Bio-Baumwoll-Shirt für jeden Tag.",
    badge: "NEU",
    img: "img/tshirt.jpg",
    colors: ["#1a1b2e", "#e8a020", "#ffffff"],
  },
  {
    id: 3,
    name: "Snapback Cap",
    price: "19,99 €",
    priceNum: 19.99,
    desc: "Strukturierte 6-Panel-Cap mit gesticktem St.-Anna-Logo.",
    badge: null,
    img: "img/cap.jpg",
    colors: ["#1a1b2e", "#555566"],
  },
  {
    id: 4,
    name: "Trainingsjacke",
    price: "44,99 €",
    priceNum: 44.99,
    desc: "Leichte Zip-Through-Jacke, ideal für Sport und Freizeit.",
    badge: "Limitiert",
    img: "img/jacket.jpg",
    colors: ["#1a1b2e", "#2e4a6e"],
  },
  {
    id: 5,
    name: "Tote Bag",
    price: "12,99 €",
    priceNum: 12.99,
    desc: "Robuste Canvas-Tasche – ideal für Bücher und Sportkram.",
    badge: null,
    img: "img/totebag.jpg",
    colors: ["#c8b89a", "#1a1b2e"],
  },
  {
    id: 6,
    name: "Bucket Hat",
    price: "16,99 €",
    priceNum: 16.99,
    desc: "Der angesagte Fischerhut mit Schuld-Logo-Stickerei.",
    badge: "NEU",
    img: "img/bucket.jpg",
    colors: ["#e8e3d8", "#1a1b2e"],
  },
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
    const colorDots = p.colors
      .map(c => `<span class="color-dot" style="background:${c}" title="${c}"></span>`)
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
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") openModal(p); });

    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────────────────────────────
   ⑤ MODAL – ÖFFNEN / SCHLIESSEN
   ───────────────────────────────────────────────────────────────────── */
function openModal(product) {
  currentProduct = product;

  // Produktvorschau befüllen
  document.getElementById("modalImg").src  = product.img;
  document.getElementById("modalImg").alt  = product.name;
  document.getElementById("modalImg").onerror = function () {
    this.src = `https://placehold.co/100x100/12131f/e8a020?text=${encodeURIComponent(product.name)}`;
  };
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalPrice").textContent  = product.price;

  // Farben befüllen
  const colorSelect = document.getElementById("fieldColor");
  colorSelect.innerHTML = `<option value="">– bitte wählen –</option>`;
  product.colors.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    colorSelect.appendChild(opt);
  });

  // Formular & Erfolg zurücksetzen
  document.getElementById("orderForm").reset();
  document.getElementById("orderForm").hidden = false;
  document.getElementById("modalSuccess").hidden = true;
  document.getElementById("formError").textContent = "";
  document.getElementById("submitLabel").textContent = "Bestellung absenden";
  document.getElementById("submitSpinner").hidden = true;
  document.getElementById("submitBtn").disabled = false;

  // PayPal Button initialisieren
  initPayPal(product);

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
   ⑥ FORMULAR-VALIDIERUNG
   ───────────────────────────────────────────────────────────────────── */
function validateForm() {
  const fields = [
    { id: "fieldSize",        label: "Größe" },
    { id: "fieldColor",       label: "Farbe" },
    { id: "fieldGender",      label: "Geschlecht" },
    { id: "fieldClassLevel",  label: "Klassenstufe" },
    { id: "fieldClassLetter", label: "Klassenbuchtabe" },
    { id: "fieldName",        label: "Voller Name" },
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
   ⑦ BESTELLUNG ABSENDEN (EmailJS)
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
    to_email:       "st.anna.merch@protonmail.com",
    reply_to:       document.getElementById("fieldEmail").value.trim(),
  };

  try {
    // ── Mail 1: Bestelleingang an den Shop ──────────────────────────
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TPL_ID, {
      ...orderData,
      to_email: "st.anna.merch@protonmail.com",
    });

    // ── Mail 2: Bestätigungsmail an den Kunden ──────────────────────
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
      "Beim Senden ist ein Fehler aufgetreten. Bitte versuche es erneut oder schreibe uns direkt an st.anna.merch@protonmail.com";
    document.getElementById("submitLabel").textContent = "Bestellung absenden";
    document.getElementById("submitSpinner").hidden = true;
    document.getElementById("submitBtn").disabled = false;
  }
});

/* ─────────────────────────────────────────────────────────────────────
   ⑧ PAYPAL INTEGRATION
   Trage deine echte Client-ID im <script>-Tag in index.html ein.
   ───────────────────────────────────────────────────────────────────── */
function initPayPal(product) {
  const container = document.getElementById("paypal-button-container");
  container.innerHTML = ""; // alten Button entfernen

  // Warte bis PayPal SDK geladen ist
  if (typeof paypal === "undefined") {
    container.innerHTML =
      `<p style="font-size:.8rem;color:#999;text-align:center">
        PayPal wird geladen… (Client-ID in index.html eintragen)
      </p>`;
    return;
  }

  paypal.Buttons({
    style: {
      layout: "horizontal",
      color:  "gold",
      shape:  "rect",
      label:  "buynow",
      tagline: false,
    },

    /* ── Bestellung erstellen ─────────────────────────────────────── */
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [{
          description: product.name,
          amount: {
            currency_code: "EUR",
            value: product.priceNum.toFixed(2),
          },
        }],
      });
    },

    /* ── Zahlung genehmigt ─────────────────────────────────────────── */
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert(`✓ Zahlung erfolgreich! Transaktions-ID: ${details.id}`);
        // Optional: hier noch eine eigene Logik nach erfolgreicher Zahlung
      });
    },

    /* ── Fehler ────────────────────────────────────────────────────── */
    onError: function (err) {
      console.error("PayPal Fehler:", err);
      document.getElementById("formError").textContent =
        "PayPal-Zahlung fehlgeschlagen. Bitte erneut versuchen.";
    },
  }).render("#paypal-button-container");
}

/* ─────────────────────────────────────────────────────────────────────
   ⑨ APP STARTEN
   ───────────────────────────────────────────────────────────────────── */
(function init() {
  // EmailJS initialisieren
  emailjs.init(EMAILJS_PUBLIC_KEY);

  // Produkte rendern
  renderProducts();
})();
