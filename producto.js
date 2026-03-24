const PRODUCT_SOURCES = [
  "productos.html",
  "trituradoras-desplazables.html",
  "accesorios.html"
];

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

function cleanText(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function extractTitle(card) {
  const h3 = card.querySelector("h3");
  if (!h3) return "Producto";

  const clone = h3.cloneNode(true);
  clone.querySelectorAll(".tag, .badge").forEach(el => el.remove());

  return cleanText(clone.textContent);
}

function extractMeta(card) {
  const meta = card.querySelector(".meta");
  return meta ? cleanText(meta.textContent) : "";
}

function extractImage(card) {
  const img = card.querySelector("img");
  if (!img) return null;

  return {
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || ""
  };
}

function extractTags(card) {
  return [...card.querySelectorAll(".tag, .badge")]
    .map(el => cleanText(el.textContent))
    .filter(Boolean);
}

function extractSpecs(card) {
  const specs = [];

  card.querySelectorAll(".specs tbody tr").forEach(row => {
    const cells = [...row.querySelectorAll("td")].map(td => cleanText(td.textContent));
    if (cells.length >= 2) {
      specs.push(`${cells[0]}: ${cells[1]}`);
    }
  });

  card.querySelectorAll(".specs li").forEach(li => {
    const text = cleanText(li.textContent);
    if (text) specs.push(text);
  });

  card.querySelectorAll(".more-info__content li").forEach(li => {
    const text = cleanText(li.textContent);
    if (text) specs.push(text);
  });

  return [...new Set(specs)];
}

function extractDescription(card) {
  const detailParagraph =
    card.querySelector(".more-info__content p") ||
    card.querySelector(".card__body p") ||
    card.querySelector(".meta");

  return detailParagraph
    ? cleanText(detailParagraph.textContent)
    : "Consultanos para conocer más detalles de este equipo, disponibilidad y configuración.";
}

function buildWhatsappLink(title) {
  const text = `Hola, me interesa el producto ${title}. Quisiera más información.`;
  return `https://wa.me/59892825972?text=${encodeURIComponent(text)}`;
}

function buildBackLink(sourcePage) {
  if (sourcePage.includes("trituradoras-desplazables")) {
    return "trituradoras-desplazables.html";
  }

  if (sourcePage.includes("accesorios")) {
    return "accesorios.html";
  }

  return "productos.html";
}

function sourceLabel(sourcePage) {
  if (sourcePage.includes("trituradoras-desplazables")) {
    return "Línea de trituradoras desplazables";
  }

  if (sourcePage.includes("accesorios")) {
    return "Accesorios";
  }

  return "Catálogo de productos";
}

async function shareProduct(product) {
  const shareData = {
    title: `${product.title} | VolGep`,
    text: `Mirá este producto: ${product.title}`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado para compartir.");
      return;
    }

    fallbackCopyLink();
  } catch (error) {
    console.error("No se pudo compartir el producto:", error);
    fallbackCopyLink();
  }
}

function fallbackCopyLink() {
  try {
    const input = document.createElement("input");
    input.value = window.location.href;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(input);
    alert("Enlace copiado para compartir.");
  } catch (error) {
    console.error("No se pudo copiar el enlace:", error);
    alert("No se pudo compartir ni copiar el enlace.");
  }
}

function renderProduct(product) {
  const container = document.getElementById("product-content");

  const tagsHtml = product.tags.length
    ? `
      <div class="product-tags">
        ${product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join("")}
      </div>
    `
    : "";

  const specsHtml = product.specs.length
    ? `
      <div class="product-card-block">
        <h3>Información del producto</h3>
        <ul class="product-spec-list">
          ${product.specs.map(item => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `
    : "";

  container.className = "product-wrap";
  container.innerHTML = `
    <a class="product-back" href="${buildBackLink(product.source)}">← Volver al catálogo</a>

    <section class="product-shell">
      <div class="product-grid">
        <div class="product-gallery">
          <img src="${product.image?.src || ""}" alt="${product.image?.alt || product.title}">
        </div>

        <div class="product-info">
          <span class="product-kicker">${sourceLabel(product.source)}</span>

          <h1 class="product-title">${product.title}</h1>

          ${product.meta ? `<p class="product-meta">${product.meta}</p>` : ""}

          ${tagsHtml}

          <div class="product-description">
            <p>${product.description}</p>
          </div>

          ${specsHtml}

          <div class="product-actions">
            <a class="btn btn--primary" href="${buildWhatsappLink(product.title)}" target="_blank" rel="noopener">
              Consultar por WhatsApp
            </a>

            <a class="btn btn--secondary" href="index.html#contacto">
              Solicitar información
            </a>

            <button class="btn btn--secondary" id="share-product-btn" type="button">
              Compartir producto
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  const shareBtn = document.getElementById("share-product-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => shareProduct(product));
  }

  document.title = `${product.title} | VolGep`;
}

function renderError(message = "No se pudo encontrar el producto.") {
  const container = document.getElementById("product-content");
  container.className = "product-error";
  container.innerHTML = `
    <div class="product-error-box">
      <h1>Producto no encontrado</h1>
      <p>${message}</p>
      <p style="margin-top:1rem;">
        <a class="btn btn--primary" href="productos.html">Volver a productos</a>
      </p>
    </div>
  `;
}

async function findProductBySlug(slug) {
  for (const source of PRODUCT_SOURCES) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const card = doc.querySelector(
        `.card[data-name="${slug}"], .procard[data-name="${slug}"], .port-card[data-name="${slug}"]`
      );

      if (!card) continue;

      return {
        slug,
        source,
        title: extractTitle(card),
        meta: extractMeta(card),
        image: extractImage(card),
        tags: extractTags(card),
        specs: extractSpecs(card),
        description: extractDescription(card)
      };
    } catch (error) {
      console.error(`Error leyendo ${source}:`, error);
    }
  }

  return null;
}

async function initProductPage() {
  const slug = getSlugFromUrl();

  if (!slug) {
    renderError("No se indicó ningún producto en la URL.");
    return;
  }

  const product = await findProductBySlug(slug);

  if (!product) {
    renderError("El producto solicitado no existe o no pudo cargarse.");
    return;
  }

  renderProduct(product);
}

initProductPage();