/* =============================================================
   CONFIGURACIÓN CENTRAL — Disney On Ice · Catálogo Exclusivo
   =============================================================

   ┌─────────────────────────────────────────────────────────┐
   │  ⚠️  PASO 1 OBLIGATORIO ANTES DE PUBLICAR EN GITHUB:   │
   │                                                          │
   │  Reemplazá YOUR_USERNAME y YOUR_REPO por tus datos:     │
   │  BASE_URL: 'https://YOUR_USERNAME.github.io/YOUR_REPO/' │
   │                                                          │
   │  Ejemplo real:                                           │
   │  'https://luciohong.github.io/disney-on-ice/'           │
   └─────────────────────────────────────────────────────────┘

   Mientras trabajás LOCALMENTE (abriendo index.html directo),
   dejá BASE_URL como './' — las imágenes se leen desde tu PC.
   ============================================================= */

const CONFIG = {

  /* ──────────────────────────────────────────────────────────
     BASE URL
     - Local:         './'
     - GitHub Pages:  'https://YOUR_USERNAME.github.io/YOUR_REPO/'
  ────────────────────────────────────────────────────────── */
  BASE_URL: 'https://lhong01.github.io/disney-on-ice/',

  /* ──────────────────────────────────────────────────────────
     NÚMERO DE WHATSAPP (formato internacional, sin espacios)
  ────────────────────────────────────────────────────────── */
  WA_NUMBER: '+5491123949704',

  /* ──────────────────────────────────────────────────────────
     IMAGE SEQUENCE SCRUBBING — Hero

     firstFrame / lastFrame: números de los archivos de frame.
       Ej: si tus archivos son 11.jpeg → 25.jpeg, usá 11 y 25.

     Para cambiar cantidad de frames:
       Solo ajustá firstFrame y lastFrame. Nada más.

     Para reemplazar frames:
       Subí tus nuevas imágenes con nombres numéricos secuenciales
       a la carpeta indicada en `folder`.

     Para optimizar imágenes ANTES de subir a GitHub (importante
     para velocidad en móvil):
       → Usá https://squoosh.app (gratis, sin instalación)
       → Objetivo: < 150 KB por frame, ancho máx 900px
       → Formato: JPEG, calidad 80–85%
  ────────────────────────────────────────────────────────── */
  FRAMES: {
    firstFrame: 1,
    lastFrame:  12,
    folder:     'Image%20sequence%20scrubbing/', // "Image sequence scrubbing/" URL-encoded
    ext:        'jpeg',
  },

  /* ──────────────────────────────────────────────────────────
     CATÁLOGO DE PRODUCTOS

     id:           identificador único (no cambiar una vez online)
     name:         nombre visible del producto
     folder:       carpeta de imágenes (espacios = %20)
     images:       archivos en orden de aparición
     desc:         descripción corta (máx ~120 caracteres)
     priceWhole:   precio mayorista — lo que paga la revendedora
     priceRetail:  precio sugerido de venta al público final
     badge:        etiqueta opcional en la tarjeta (null = ninguna)
  ────────────────────────────────────────────────────────── */
  PRODUCTS: [
    {
      id:          'mickey-lightstick',
      name:        'LightStick Mickey Mouse',
      folder:      'Mickey/',
      images:      ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg'],
      desc:        'Varita luminosa Mickey con 3 modos LED intermitentes. Pila de fácil acceso para reemplazo.',
      priceWhole:  17000,
      priceRetail: 26000,
      badge:       '✦ Más visto',
    },
    {
      id:          'minnie-lightstick',
      name:        'LightStick Minnie Mouse',
      folder:      'Minnie/',
      images:      ['1.jpeg', '2.jpeg', '3.jpeg'],
      desc:        'Varita luminosa Minnie con 3 modos LED intermitentes. Pila de fácil acceso para reemplazo.',
      priceWhole:  17000,
      priceRetail: 26000,
      badge:       '✦ Más visto',
    },
    {
      id:          'frozen-vara',
      name:        'LightStick Vara Reina Frozen',
      folder:      'Frozen/',
      images:      ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg'],
      desc:        'Vara mágica de la Reina Elsa con 3 modos LED intermitentes. Pila de fácil acceso para reemplazo.',
      priceWhole:  11000,
      priceRetail: 17000,
      badge:       '❄️ Frozen',
    },
    {
      id:          'frozen-tiara',
      name:        'Tiara Frozen',
      folder:      'Frozen%202/', // carpeta "Frozen 2"
      images:      ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg'],
      desc:        'Tiara estilo Elsa con 3 modos LED intermitentes. Brilla igual que la princesa. Pila reemplazable.',
      priceWhole:  5500,
      priceRetail: 13000,
      badge:       null,
    },
    {
      id:          'minnie-vincha',
      name:        'Vincha Orejas Minnie Mouse',
      folder:      'Minnie%202/', // carpeta "Minnie 2"
      images:      ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg'],
      desc:        'Vincha orejas Minnie con 3 modos LED intermitentes. El accesorio favorito de las fans. Pila reemplazable.',
      priceWhole:  5500,
      priceRetail: 12000,
      badge:       null,
    },
    {
      id:          'stitch-llavero',
      name:        'Llavero Articulado Lilo & Stitch',
      folder:      'Lilo/',
      images:      ['1.jpeg'],
      desc:        'Llavero articulado de Stitch en 3D. Diseño artesanal único, articulaciones móviles. Souvenir especial del show.',
      priceWhole:  1500,
      priceRetail: 3000,
      badge:       '🌊 Especial',
    },
  ],
};
