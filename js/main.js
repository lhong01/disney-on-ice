/* =============================================================
   MAIN — Inicialización y microanimaciones globales
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  Scrubber.init();
  Products.init();

  /* ── Header sombra al scroll ── */
  const headerEl = document.getElementById('header');
  window.addEventListener('scroll', () => {
    headerEl.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ── Entrada del texto hero ── */
  if (typeof gsap !== 'undefined') {
    gsap.from('#heroContent', {
      opacity: 0, y: 32, duration: 1.1, ease: 'power3.out', delay: 0.3,
    });
  } else {
    const hc = document.getElementById('heroContent');
    if (hc) {
      hc.style.transition = 'opacity 1s ease, transform 1s ease';
      hc.style.opacity = '0';
      hc.style.transform = 'translateY(32px)';
      requestAnimationFrame(() => setTimeout(() => {
        hc.style.opacity = '1';
        hc.style.transform = 'translateY(0)';
      }, 300));
    }
  }

  initSparkles();

  /* ── Detener animación del hint al primer scroll ── */
  const hint = document.getElementById('scrollHint');
  if (hint) {
    window.addEventListener('scroll', () => {
      hint.classList.add('stop');
    }, { passive: true, once: true });
  }

});

/* ──────────────────────────────────────────────────────────────
   SPARKLES — Partículas mágicas flotantes (v2: más visibles)
   65 partículas, mayor opacidad, estrellas más grandes.
────────────────────────────────────────────────────────────── */
function initSparkles() {
  const canvas = document.getElementById('sparklesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  const COUNT = 65;
  const particles = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.parentElement.offsetWidth;
    H = canvas.parentElement.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
  }

  function rnd(min, max) { return Math.random() * (max - min) + min; }

  function mkParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      size:  rnd(1.0, 4.2),
      maxOp: rnd(0.28, 0.82),
      op:    0,
      speed: rnd(0.003, 0.012),
      phase: Math.random() * Math.PI * 2,
      vy:    rnd(-0.25, -0.08),
      // Mezcla colores: oro y blanco-azulado Disney
      color: Math.random() > 0.35 ? '#C9A84C' : '#D6E8FF',
    };
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) particles.push(mkParticle());
  }, { passive: true });
  for (let i = 0; i < COUNT; i++) particles.push(mkParticle());

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.014;

    particles.forEach(p => {
      // Opacidad pulsante orgánica
      p.op = p.maxOp * (0.45 + 0.55 * Math.sin(t * p.speed * 75 + p.phase));
      p.y += p.vy;
      if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }

      ctx.save();
      ctx.globalAlpha = p.op;
      ctx.fillStyle   = p.color;

      // Estrella de 4 puntas
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x,            p.y - s);
      ctx.lineTo(p.x + s * 0.22, p.y - s * 0.22);
      ctx.lineTo(p.x + s,        p.y);
      ctx.lineTo(p.x + s * 0.22, p.y + s * 0.22);
      ctx.lineTo(p.x,            p.y + s);
      ctx.lineTo(p.x - s * 0.22, p.y + s * 0.22);
      ctx.lineTo(p.x - s,        p.y);
      ctx.lineTo(p.x - s * 0.22, p.y - s * 0.22);
      ctx.closePath();
      ctx.fill();

      // Halo suave para las partículas más grandes
      if (s > 2.5) {
        ctx.globalAlpha = p.op * 0.18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
}
