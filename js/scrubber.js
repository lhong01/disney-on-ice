/* =============================================================
   IMAGE SEQUENCE SCRUBBER — v2
   Fixes: DPR bug en móvil (canvas left-aligned), frame blending
   para suavizar transiciones con pocas fotos.
   ============================================================= */

const Scrubber = (() => {

  let frames      = [];
  let loadedCount = 0;
  let totalFrames = 0;
  let currentF    = 0;    // frame actual (decimal)
  let targetF     = 0;    // frame objetivo según scroll
  let cssW        = 0;    // ancho CSS del canvas (para drawFrame)
  let cssH        = 0;    // alto CSS del canvas
  let canvas      = null;
  let ctx         = null;
  let loaderEl    = null;

  /* ── Precarga ── */
  function preload(baseUrl, cfg, onProgress) {
    const { firstFrame, lastFrame, folder, ext } = cfg;
    totalFrames = lastFrame - firstFrame + 1;
    frames = new Array(totalFrames);

    for (let i = 0; i < totalFrames; i++) {
      const num = firstFrame + i;
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        onProgress?.(loadedCount / totalFrames);
        if (i === 0) drawFrame(0);
      };
      img.onerror = () => {
        loadedCount++;
        onProgress?.(loadedCount / totalFrames);
        console.warn(`[Scrubber] No se pudo cargar: ${img.src}`);
      };
      img.src = `${baseUrl}${folder}${num}.${ext}`;
      frames[i] = img;
    }
  }

  /* ── Dibujar una imagen centrada (contain) en el canvas ── */
  function drawImg(img) {
    if (!img?.complete || !img.naturalWidth) return;
    const iR = img.naturalWidth / img.naturalHeight;
    const cR = cssW / cssH;
    let dw, dh;
    if (iR > cR) { dw = cssW; dh = cssW / iR; }
    else          { dh = cssH; dw = cssH * iR; }
    ctx.drawImage(img, (cssW - dw) / 2, (cssH - dh) / 2, dw, dh);
  }

  /* ── Dibujar frame con BLENDING entre frames adyacentes ──
     Con pocas fotos, interpolar entre f1 y f2 crea frames
     "virtuales" que suavizan el salto visual enormemente. */
  function drawFrame(index) {
    if (!ctx || !cssW || totalFrames === 0) return;

    const clamped = Math.max(0, Math.min(totalFrames - 1, index));
    const f1      = Math.floor(clamped);
    const f2      = Math.min(totalFrames - 1, f1 + 1);
    const blend   = clamped - f1; // 0.0 → 1.0

    ctx.clearRect(0, 0, cssW, cssH);

    // Frame base
    ctx.globalAlpha = 1;
    drawImg(frames[f1]);

    // Frame siguiente blended encima
    if (blend > 0.01 && f1 !== f2 && frames[f2]) {
      ctx.globalAlpha = blend;
      drawImg(frames[f2]);
      ctx.globalAlpha = 1;
    }
  }

  /* ── Loop RAF con interpolación suave (lerp) ── */
  function animLoop() {
    const EASE = 0.09;
    const prev = currentF;
    currentF += (targetF - currentF) * EASE;
    if (Math.abs(currentF - prev) > 0.003) drawFrame(currentF);
    requestAnimationFrame(animLoop);
  }

  function setProgress(progress) {
    targetF = Math.max(0, Math.min(1, progress)) * (totalFrames - 1);
  }

  /* ── Resize: FIX — guardar cssW/cssH y usar setTransform ──
     El bug anterior: canvas.width / devicePixelRatio era incorrecto
     cuando el DPR real (ej: 3) difería del DPR usado (clamped a 2).
     Ahora se usan las dimensiones CSS directamente. */
  function resizeCanvas() {
    if (!canvas) return;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();

    // Fallback a window dimensions si el rect aún no está calculado
    cssW = rect.width  || window.innerWidth;
    cssH = rect.height || window.innerHeight;

    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';

    // setTransform es atómico: reset + scale en un paso (evita acumulación)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawFrame(currentF);
  }

  /* ── Init ── */
  function init() {
    canvas   = document.getElementById('heroCanvas');
    loaderEl = document.getElementById('heroLoader');
    if (!canvas) return;

    ctx = canvas.getContext('2d', { alpha: true });

    // Primer resize tras un tick (asegura que el DOM esté pintado)
    requestAnimationFrame(resizeCanvas);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    }, { passive: true });

    preload(CONFIG.BASE_URL, CONFIG.FRAMES, (progress) => {
      if (loaderEl) loaderEl.style.width = (progress * 100) + '%';
      if (progress >= 1 && loaderEl) {
        setTimeout(() => { loaderEl.style.opacity = '0'; }, 500);
      }
    });

    animLoop();

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.create({
        trigger:  '#hero',
        start:    'top top',
        end:      'bottom bottom',
        scrub:    true,
        onUpdate: (self) => {
          setProgress(self.progress);
          updateScrollHint(self.progress);
        },
      });

      gsap.to('#heroContent', {
        opacity: 0, y: -50, ease: 'power2.in',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: '22% top', scrub: true },
      });

      // Fade gradual desde el comienzo del scroll hasta el 55%
      gsap.to('#scrollHint', {
        opacity: 0,
        scrollTrigger: { trigger: '#hero', start: '4% top', end: '55% top', scrub: true },
      });

    } else {
      const heroEl = document.getElementById('hero');
      window.addEventListener('scroll', () => {
        const rect     = heroEl.getBoundingClientRect();
        const scrolled = -rect.top;
        const total    = heroEl.offsetHeight - window.innerHeight;
        const p        = Math.max(0, Math.min(1, scrolled / total));
        setProgress(p);
        updateScrollHint(p);
      }, { passive: true });
    }
  }

  /* ── Actualizar la barra de progreso del scroll hint ── */
  function updateScrollHint(progress) {
    const line = document.getElementById('scrollLine');
    if (line) line.style.setProperty('--fill', `${Math.min(progress, 0.98) * 100}%`);
  }

  return { init, setProgress };

})();
