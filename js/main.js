/* =============================================================
   MAIN — Inicialización y microanimaciones globales
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Scrubbing del hero ── */
  Scrubber.init();

  /* ── 2. Grilla de productos + lightbox ── */
  Products.init();

  /* ── 3. Header: sombra al hacer scroll ── */
  const headerEl = document.getElementById('header');
  window.addEventListener('scroll', () => {
    headerEl.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ── 4. Animación de entrada del texto del hero ──
     Fade in suave con GSAP o con clase CSS si no está disponible */
  if (typeof gsap !== 'undefined') {
    gsap.from('#heroContent', {
      opacity:  0,
      y:        32,
      duration: 1.1,
      ease:     'power3.out',
      delay:    0.25,
    });
  } else {
    // Fallback CSS
    const hc = document.getElementById('heroContent');
    if (hc) {
      hc.style.transition = 'opacity 1s ease, transform 1s ease';
      hc.style.opacity    = '0';
      hc.style.transform  = 'translateY(32px)';
      requestAnimationFrame(() => {
        setTimeout(() => {
          hc.style.opacity   = '1';
          hc.style.transform = 'translateY(0)';
        }, 250);
      });
    }
  }

  /* ── 5. Sparkles decorativos en el hero (canvas separado) ──
     Partículas sutiles que dan el toque "Disney mágico". */
  initSparkles();

});

/* ──────────────────────────────────────────────────────────────
   SPARKLES — Partículas flotantes en el hero
   Pequeñas estrellas que aparecen y desaparecen lentamente.
   Muy ligeras: solo ~30 partículas, sin física compleja.
────────────────────────────────────────────────────────────── */
function initSparkles() {
  const canvas = document.getElementById('sparklesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  const PARTICLE_COUNT = 28;
  const particles = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.parentElement.offsetWidth;
    H = canvas.parentElement.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
  }

  function randomParticle() {
    return {
      x:       Math.random() * W,
      y:       Math.random() * H,
      size:    Math.random() * 2.2 + 0.6,
      opacity: 0,
      maxOp:   Math.random() * 0.45 + 0.1,
      speed:   Math.random() * 0.008 + 0.003,
      phase:   Math.random() * Math.PI * 2,
      drift:   (Math.random() - 0.5) * 0.2,
    };
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randomParticle());
  }, { passive: true });

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randomParticle());

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.012;

    particles.forEach(p => {
      // Opacidad pulsante
      p.opacity = p.maxOp * (0.5 + 0.5 * Math.sin(t * p.speed * 80 + p.phase));
      // Deriva vertical lenta
      p.y -= 0.12 + p.drift * 0.1;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle   = '#C9A84C';

      // Forma de estrella de 4 puntas pequeña
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x,     p.y - s);
      ctx.lineTo(p.x + s * 0.25, p.y - s * 0.25);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s * 0.25, p.y + s * 0.25);
      ctx.lineTo(p.x,     p.y + s);
      ctx.lineTo(p.x - s * 0.25, p.y + s * 0.25);
      ctx.lineTo(p.x - s, p.y);
      ctx.lineTo(p.x - s * 0.25, p.y - s * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
}
