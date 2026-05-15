/* =============================================================
   IMAGE SEQUENCE SCRUBBER
   Animación estilo Apple — el scroll controla el frame activo.
   Renderiza en <canvas> con interpolación suave y RAF.
   ============================================================= */

const Scrubber = (() => {

  /* ── Estado interno ── */
  let frames      = [];   // Array de objetos Image precargados
  let loadedCount = 0;    // Cuántos frames ya cargaron
  let totalFrames = 0;
  let currentF    = 0;   // Frame actual (decimal, para interpolación)
  let targetF     = 0;   // Frame objetivo según scroll
  let rafId       = null;
  let canvas      = null;
  let ctx         = null;
  let loaderEl    = null;

  /* ──────────────────────────────────────────────────────────
     PRECARGA DE FRAMES

     Carga todas las imágenes antes de que el usuario scrollee.
     onProgress(0→1) se llama por cada imagen que termina de cargar.
  ────────────────────────────────────────────────────────── */
  function preload(baseUrl, cfg, onProgress) {
    const { firstFrame, lastFrame, folder, ext } = cfg;
    totalFrames = lastFrame - firstFrame + 1;
    frames = new Array(totalFrames);

    for (let i = 0; i < totalFrames; i++) {
      const num = firstFrame + i;
      const img = new Image();

      img.onload = () => {
        loadedCount++;
        onProgress && onProgress(loadedCount / totalFrames);
        if (i === 0) drawFrame(0); // Mostrar primer frame apenas cargue
      };

      img.onerror = () => {
        loadedCount++;
        onProgress && onProgress(loadedCount / totalFrames);
        console.warn(`[Scrubber] No se pudo cargar: ${img.src}`);
      };

      img.src = `${baseUrl}${folder}${num}.${ext}`;
      frames[i] = img;
    }
  }

  /* ──────────────────────────────────────────────────────────
     DIBUJAR FRAME EN CANVAS

     Dibuja el frame `index` centrado y contenido en el canvas
     (equivalent a object-fit: contain).
  ────────────────────────────────────────────────────────── */
  function drawFrame(index) {
    if (!ctx || !canvas || totalFrames === 0) return;

    const fi  = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
    const img = frames[fi];

    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width  / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);

    // Calcular dimensiones manteniendo proporción (contain)
    const iRatio = img.naturalWidth / img.naturalHeight;
    const cRatio = cw / ch;
    let dw, dh;

    if (iRatio > cRatio) {
      dw = cw;
      dh = cw / iRatio;
    } else {
      dh = ch;
      dw = ch * iRatio;
    }

    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ──────────────────────────────────────────────────────────
     LOOP DE ANIMACIÓN

     Usa lerp (interpolación lineal) para que el frame
     se mueva suavemente hacia el objetivo. Se ejecuta con RAF
     solo cuando hay diferencia visible.
  ────────────────────────────────────────────────────────── */
  function animLoop() {
    const EASE = 0.10; // Velocidad de interpolación. Más bajo = más suave.

    const prevF = currentF;
    currentF += (targetF - currentF) * EASE;

    // Solo redibujar si el cambio es perceptible
    if (Math.abs(currentF - prevF) > 0.005) {
      drawFrame(currentF);
    }

    rafId = requestAnimationFrame(animLoop);
  }

  /* ──────────────────────────────────────────────────────────
     ACTUALIZAR FRAME OBJETIVO
     progress: número entre 0 y 1
  ────────────────────────────────────────────────────────── */
  function setProgress(progress) {
    targetF = Math.max(0, Math.min(1, progress)) * (totalFrames - 1);
  }

  /* ──────────────────────────────────────────────────────────
     ADAPTAR CANVAS AL TAMAÑO DEL CONTENEDOR

     Limita el DPR a 2x para no saturar GPU en pantallas 3x.
  ────────────────────────────────────────────────────────── */
  function resizeCanvas() {
    if (!canvas) return;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width  = rect.width  + 'px';
    canvas.style.height = rect.height + 'px';
    drawFrame(currentF);
  }

  /* ──────────────────────────────────────────────────────────
     INICIALIZACIÓN
  ────────────────────────────────────────────────────────── */
  function init() {
    canvas   = document.getElementById('heroCanvas');
    loaderEl = document.getElementById('heroLoader');
    if (!canvas) return;

    ctx = canvas.getContext('2d', { alpha: true });
    resizeCanvas();

    // Redimensionar canvas cuando cambie el viewport
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    }, { passive: true });

    // Precargar frames y actualizar barra de progreso
    preload(CONFIG.BASE_URL, CONFIG.FRAMES, (progress) => {
      if (loaderEl) loaderEl.style.width = (progress * 100) + '%';
      if (progress >= 1 && loaderEl) {
        setTimeout(() => { loaderEl.style.opacity = '0'; }, 400);
      }
    });

    // Iniciar loop de animación
    animLoop();

    // ── ScrollTrigger de GSAP (preferido) ──
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // El scroll de la sección hero controla el frame
      ScrollTrigger.create({
        trigger:  '#hero',
        start:    'top top',
        end:      'bottom bottom',
        scrub:    true,          // scrub:true = sincronizado 1:1 con el scroll
        onUpdate: (self) => setProgress(self.progress),
      });

      // El texto del hero se desvanece al comenzar el scroll
      gsap.to('#heroContent', {
        opacity:  0,
        y:        -50,
        ease:     'power2.in',
        scrollTrigger: {
          trigger: '#hero',
          start:   'top top',
          end:     '22% top',
          scrub:   true,
        },
      });

      // El hint de scroll desaparece pronto
      gsap.to('#scrollHint', {
        opacity: 0,
        scrollTrigger: {
          trigger: '#hero',
          start:   'top top',
          end:     '8% top',
          scrub:   true,
        },
      });

    } else {
      // ── Fallback sin GSAP: scroll nativo ──
      const heroEl = document.getElementById('hero');
      window.addEventListener('scroll', () => {
        const rect     = heroEl.getBoundingClientRect();
        const scrolled = -rect.top;
        const total    = heroEl.offsetHeight - window.innerHeight;
        setProgress(Math.max(0, Math.min(1, scrolled / total)));
      }, { passive: true });
    }
  }

  return { init, setProgress };

})();
