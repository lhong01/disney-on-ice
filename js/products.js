/* =============================================================
   GRILLA DE PRODUCTOS + LIGHTBOX
   Genera las tarjetas dinámicamente desde CONFIG.PRODUCTS
   e implementa galería interactiva con lightbox.
   ============================================================= */

const Products = (() => {

  /* ── Estado del lightbox ── */
  let lbImages     = [];
  let lbIndex      = 0;
  let lbTouchStart = 0;

  /* ──────────────────────────────────────────────────────────
     HELPERS
  ────────────────────────────────────────────────────────── */

  // Formatear número como precio ARS: 17000 → "$17.000"
  function fmtPrice(n) {
    return '$' + n.toLocaleString('es-AR');
  }

  // URL completa de una imagen
  function imgSrc(folder, file) {
    return CONFIG.BASE_URL + folder + file;
  }

  // URL de WhatsApp con mensaje pre-llenado
  function waLink(productName, price) {
    const msg = encodeURIComponent(
      `Hola! Vi tu catálogo y me interesa: *${productName}* (${fmtPrice(price)}). ¿Tenés disponibilidad? ✨`
    );
    return `https://wa.me/${CONFIG.WA_NUMBER}?text=${msg}`;
  }

  // SVG del ícono de WhatsApp (reutilizado en tarjetas y footer)
  const WA_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.845L.057 23.617a.75.75 0 00.916.927l5.92-1.548A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.89 0-3.658-.494-5.19-1.36l-.373-.214-3.872 1.013 1.03-3.758-.237-.386A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
  </svg>`;

  /* ──────────────────────────────────────────────────────────
     RENDERIZAR TARJETA
  ────────────────────────────────────────────────────────── */
  function buildCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card';
    // Delay escalonado para animación de entrada
    card.style.animationDelay = `${index * 0.07}s`;

    /* Galería de imágenes */
    const imagesHtml = product.images.map((file, i) => `
      <img
        class="product-card__img${i === 0 ? ' active' : ''}"
        src="${imgSrc(product.folder, file)}"
        alt="${product.name}${product.images.length > 1 ? ` — ángulo ${i + 1}` : ''}"
        loading="${i === 0 ? 'eager' : 'lazy'}"
        data-idx="${i}"
      >
    `).join('');

    /* Dots solo si hay múltiples imágenes */
    const dotsHtml = product.images.length > 1
      ? `<div class="product-card__dots" aria-hidden="true">
           ${product.images.map((_, i) => `
             <button class="product-card__dot${i === 0 ? ' active' : ''}" data-dot="${i}" tabindex="-1"></button>
           `).join('')}
         </div>`
      : '';

    const badgeHtml = product.badge
      ? `<div class="product-card__badge">${product.badge}</div>`
      : '';

    // Margen de ganancia
    const margin    = product.priceRetail - product.priceWhole;

    card.innerHTML = `
      <div
        class="product-card__gallery"
        role="button"
        tabindex="0"
        aria-label="Ampliar fotos de ${product.name}"
      >
        ${badgeHtml}
        ${imagesHtml}
        ${dotsHtml}
      </div>

      <div class="product-card__body">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__desc">${product.desc}</p>

        <div class="product-card__prices">
          <div class="product-card__price-main">
            <span class="product-card__price-label">Tu precio</span>
            <span class="product-card__price-value">${fmtPrice(product.priceWhole)}</span>
          </div>
          <p class="product-card__price-retail">
            PVP sugerido: <strong>${fmtPrice(product.priceRetail)}</strong>
            &nbsp;· Ganás <strong>${fmtPrice(margin)}</strong>
          </p>
        </div>

        <a
          href="${waLink(product.name, product.priceWhole)}"
          class="product-card__btn"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pedir ${product.name} por WhatsApp"
          onclick="event.stopPropagation()"
        >
          ${WA_SVG}
          Pedir por WhatsApp
        </a>
      </div>
    `;

    /* ── Interacciones de galería ── */
    const galleryEl = card.querySelector('.product-card__gallery');
    const imgEls    = card.querySelectorAll('.product-card__img');
    const dotEls    = card.querySelectorAll('.product-card__dot');
    let   curImg    = 0;
    let   autoTimer = null;

    function showImg(idx) {
      imgEls[curImg].classList.remove('active');
      dotEls[curImg]?.classList.remove('active');
      curImg = ((idx % product.images.length) + product.images.length) % product.images.length;
      imgEls[curImg].classList.add('active');
      dotEls[curImg]?.classList.add('active');
    }

    // Auto-avance en hover (desktop) o ciclo lento en móvil
    function startAuto() {
      if (product.images.length <= 1) return;
      autoTimer = setInterval(() => showImg(curImg + 1), 2000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    galleryEl.addEventListener('mouseenter', startAuto, { passive: true });
    galleryEl.addEventListener('mouseleave', stopAuto,  { passive: true });

    // Dots manuales
    dotEls.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        stopAuto();
        showImg(parseInt(dot.dataset.dot, 10));
      });
    });

    // Touch swipe en la galería de la tarjeta
    let swipeStart = 0;
    galleryEl.addEventListener('touchstart', (e) => {
      swipeStart = e.touches[0].clientX;
    }, { passive: true });
    galleryEl.addEventListener('touchend', (e) => {
      const diff = swipeStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 35) {
        stopAuto();
        showImg(curImg + (diff > 0 ? 1 : -1));
      }
    }, { passive: true });

    // Click / Enter → abrir lightbox
    function openThisProduct() {
      const urls = product.images.map(f => imgSrc(product.folder, f));
      openLightbox(urls, curImg);
    }

    galleryEl.addEventListener('click', openThisProduct);
    galleryEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openThisProduct();
    });

    return card;
  }

  /* ──────────────────────────────────────────────────────────
     LIGHTBOX
  ────────────────────────────────────────────────────────── */
  function openLightbox(images, startIndex) {
    lbImages = images;
    lbIndex  = startIndex;
    renderLightbox();
    document.getElementById('lb').classList.add('open');
    document.getElementById('lbOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }

  function closeLightbox() {
    document.getElementById('lb').classList.remove('open');
    document.getElementById('lbOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function navLightbox(dir) {
    lbIndex = ((lbIndex + dir) + lbImages.length) % lbImages.length;
    renderLightbox();
  }

  function renderLightbox() {
    const imgEl  = document.getElementById('lbImg');
    const dotsEl = document.getElementById('lbDots');
    const prevEl = document.getElementById('lbPrev');
    const nextEl = document.getElementById('lbNext');

    // Fade suave al cambiar imagen
    imgEl.style.opacity = '0';
    setTimeout(() => {
      imgEl.src         = lbImages[lbIndex];
      imgEl.alt         = `Imagen ${lbIndex + 1} de ${lbImages.length}`;
      imgEl.style.opacity = '1';
    }, 110);

    const single    = lbImages.length <= 1;
    prevEl.disabled = single;
    nextEl.disabled = single;

    // Dots del lightbox
    dotsEl.innerHTML = lbImages.map((_, i) => `
      <button class="lb__dot${i === lbIndex ? ' active' : ''}" data-lbi="${i}" aria-label="Imagen ${i + 1}"></button>
    `).join('');

    dotsEl.querySelectorAll('.lb__dot').forEach(d => {
      d.addEventListener('click', () => {
        lbIndex = parseInt(d.dataset.lbi, 10);
        renderLightbox();
      });
    });
  }

  function initLightbox() {
    document.getElementById('lbClose').addEventListener('click', closeLightbox);
    document.getElementById('lbOverlay').addEventListener('click', closeLightbox);
    document.getElementById('lbPrev').addEventListener('click', () => navLightbox(-1));
    document.getElementById('lbNext').addEventListener('click', () => navLightbox(1));

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('lb').classList.contains('open')) return;
      const map = { ArrowLeft: -1, ArrowRight: 1 };
      if (map[e.key] !== undefined) navLightbox(map[e.key]);
      if (e.key === 'Escape') closeLightbox();
    });

    // Touch swipe en lightbox
    const lbEl = document.getElementById('lb');
    lbEl.addEventListener('touchstart', (e) => {
      lbTouchStart = e.touches[0].clientX;
    }, { passive: true });
    lbEl.addEventListener('touchend', (e) => {
      const diff = lbTouchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) navLightbox(diff > 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     ANIMACIONES DE ENTRADA (IntersectionObserver)
  ────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    // Tarjetas
    document.querySelectorAll('.product-card').forEach(el => observer.observe(el));

    // Header de la sección
    const hdr = document.querySelector('.products__header');
    if (hdr) observer.observe(hdr);
  }

  /* ──────────────────────────────────────────────────────────
     INIT PÚBLICO
  ────────────────────────────────────────────────────────── */
  function init() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    CONFIG.PRODUCTS.forEach((p, i) => grid.appendChild(buildCard(p, i)));

    initLightbox();

    // Dar un tick para que el DOM se pinte antes de observar
    requestAnimationFrame(initScrollReveal);
  }

  return { init };

})();
