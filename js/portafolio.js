/**
 * portafolio.js — Espiral Dulce
 *
 * Módulos:
 *   1. Menú hamburguesa (mobile)
 *   2. Sombra dinámica del header
 *   3. Catálogo de productos
 *   4. Renderizado de tarjetas flip
 *   5. Filtros por categoría
 *   6. Toggle de flip por clic
 *   7. Tilt 3D en hover (desktop)
 */


/* ============================================================
   1. MENÚ HAMBURGUESA
============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileNav.classList.toggle('open', isOpen);
});

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
  });
});


/* ============================================================
   2. SOMBRA DINÁMICA DEL HEADER
============================================================ */
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 4px 30px rgba(0, 0, 0, 0.1)'
    : '0 2px 20px rgba(0, 0, 0, 0.06)';
}, { passive: true });


/* ============================================================
   3. CATÁLOGO DE PRODUCTOS
   Para agregar un producto nuevo, añade un objeto a este array.
   Campos: id, nombre, descripcion, categoria, categoriaLabel,
           imagen, ingredientes (array de strings, máx. 8).
============================================================ */
const PRODUCTOS = [
  {
    id: 'panque-zanahoria',
    nombre: 'Panque de Zanahoria',
    descripcion: 'Tierno, húmedo y lleno de sabor natural.',
    categoria: 'panes',
    categoriaLabel: 'Panes y Panques',
    imagen: 'images/portafolio/panque_zanahoria_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Zanahoria rallada fresca',
      'Huevo',
      'Aceite vegetal',
      'Azúcar mascabado',
      'Canela molida',
      'Nuez',
    ],
  },
  {
    id: 'brownie',
    nombre: 'Brownie de Chocolate',
    descripcion: 'Denso, fudgy y con corteza crujiente.',
    categoria: 'chocolates',
    categoriaLabel: 'Chocolates',
    imagen: 'images/portafolio/brownie_sin_fondo.png',
    ingredientes: [
      'Chocolate amargo 70%',
      'Mantequilla sin sal',
      'Huevo',
      'Azúcar',
      'Harina de trigo',
      'Nuez',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'gelatina',
    nombre: 'Gelatina Artesanal',
    descripcion: 'Postre refrescante con frutas naturales.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/gelatina_sin_fondo.png',
    ingredientes: [
      'Grenetina natural',
      'Leche entera',
      'Crema',
      'Frutas de temporada',
      'Azúcar',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'tiramisu',
    nombre: 'Tiramisú Cuchareable',
    descripcion: 'Clásico italiano, intenso y cremoso.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/tiramisu_cuchareable_sin_fondo.png',
    ingredientes: [
      'Queso mascarpone',
      'Café espresso',
      'Huevo',
      'Azúcar glass',
      'Cocoa en polvo',
      'Galleta savoiardi',
    ],
  },
  {
    id: 'panque-mantequilla',
    nombre: 'Panque de Mantequilla',
    descripcion: 'Esponjoso, dorado y con toque de azúcar glass.',
    categoria: 'panes',
    categoriaLabel: 'Panes y Panques',
    imagen: 'images/portafolio/panque_de_mantequilla_con_azúcar_glass_arriba_sin_fondo.png',
    ingredientes: [
      'Mantequilla sin sal',
      'Harina de trigo',
      'Huevo',
      'Azúcar',
      'Leche',
      'Extracto de vainilla',
      'Azúcar glass',
    ],
  },
  {
    id: 'panque-naranja',
    nombre: 'Panque de Naranja',
    descripcion: 'Fresco, cítrico y perfectamente húmedo.',
    categoria: 'panes',
    categoriaLabel: 'Panes y Panques',
    imagen: 'images/portafolio/panque_de_naranja_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Jugo de naranja natural',
      'Ralladura de naranja',
      'Huevo',
      'Aceite vegetal',
      'Azúcar',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'panque-platano',
    nombre: 'Panque de Plátano',
    descripcion: 'Suave y aromático, ideal para cualquier hora.',
    categoria: 'panes',
    categoriaLabel: 'Panes y Panques',
    imagen: 'images/portafolio/panque_platano_sin_fondo.png',
    ingredientes: [
      'Plátano maduro',
      'Harina de trigo',
      'Huevo',
      'Mantequilla',
      'Azúcar mascabado',
      'Nuez',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'cupcakes-florales',
    nombre: 'Cupcakes Florales',
    descripcion: 'Esponjosos cupcakes decorados con flores de betún.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/cupcakes_florales_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Mantequilla',
      'Huevo',
      'Azúcar',
      'Leche',
      'Betún de mantequilla',
      'Colorantes naturales',
    ],
  },
  {
    id: 'cake-pop',
    nombre: 'Cake Pops',
    descripcion: 'Bocados de pastel bañados en chocolate, perfectos para regalar.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/cake_pop_sin_fondo.png',
    ingredientes: [
      'Bizcocho de vainilla',
      'Betún de queso crema',
      'Chocolate para baño',
      'Decoraciones de azúcar',
    ],
  },
  {
    id: 'pastel-matilda',
    nombre: 'Pastel Matilda',
    descripcion: 'Pastel de chocolate intenso con ganache espejo.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/pastel_matilda_sin_fondo.png',
    ingredientes: [
      'Chocolate amargo',
      'Harina de trigo',
      'Cocoa en polvo',
      'Huevo',
      'Buttermilk',
      'Ganache de chocolate',
      'Mantequilla',
    ],
  },
  {
    id: 'pasteles-mini-triple-chocolate',
    nombre: 'Pasteles Mini Triple Chocolate',
    descripcion: 'Tres capas de chocolate: oscuro, con leche y blanco.',
    categoria: 'chocolates',
    categoriaLabel: 'Chocolates',
    imagen: 'images/portafolio/pasteles_mini_triple_chocolate_sin_fondo.png',
    ingredientes: [
      'Chocolate amargo 70%',
      'Chocolate con leche',
      'Chocolate blanco',
      'Crema para batir',
      'Huevo',
      'Mantequilla',
      'Harina de trigo',
    ],
  },
  {
    id: 'tarta-frutas-chocolate-blanco',
    nombre: 'Tarta de Frutas con Chocolate Blanco',
    descripcion: 'Base crujiente, ganache de chocolate blanco y frutas frescas.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/tarta_de_frutas_con_chocolate_blanco_sin_fondo.png',
    ingredientes: [
      'Masa sablée',
      'Chocolate blanco',
      'Crema para batir',
      'Fresas frescas',
      'Kiwi',
      'Arándanos',
      'Mantequilla',
    ],
  },
  {
    id: 'tarta-frutas-crema-pastelera',
    nombre: 'Tarta de Frutas con Crema Pastelera',
    descripcion: 'Clásica francesa con crema sedosa y frutas de temporada.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/tarta_de_frutas_con_crema_pastelera_sin_fondo.png',
    ingredientes: [
      'Masa sablée',
      'Crema pastelera',
      'Leche entera',
      'Yema de huevo',
      'Azúcar',
      'Frutas de temporada',
      'Brillo de fruta',
    ],
  },
  {
    id: 'tarta-vasca',
    nombre: 'Tarta Vasca',
    descripcion: 'Pastel tradicional del País Vasco: rústico y cremoso por dentro.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/tarta_vasca_sin_fondo.png',
    ingredientes: [
      'Queso crema',
      'Huevo',
      'Crema para batir',
      'Azúcar',
      'Harina de trigo',
    ],
  },
  {
    id: 'alfajores',
    nombre: 'Alfajores',
    descripcion: 'Suaves y desmoronables, rellenos de cajeta artesanal.',
    categoria: 'galletas',
    categoriaLabel: 'Galletas',
    imagen: 'images/portafolio/alfajores_sin_fondo.png',
    ingredientes: [
      'Maicena',
      'Harina de trigo',
      'Mantequilla',
      'Azúcar glass',
      'Yema de huevo',
      'Cajeta artesanal',
      'Coco rallado',
    ],
  },
  {
    id: 'alfajores-chocolate',
    nombre: 'Alfajores de Chocolate',
    descripcion: 'Alfajores bañados en chocolate oscuro con relleno de cajeta.',
    categoria: 'galletas',
    categoriaLabel: 'Galletas',
    imagen: 'images/portafolio/alfajores_de_chocolate_sin_fondo.png',
    ingredientes: [
      'Maicena',
      'Harina de trigo',
      'Mantequilla',
      'Cajeta artesanal',
      'Chocolate amargo 70%',
      'Cacao en polvo',
    ],
  },
  {
    id: 'galletas-chocolate-blanco',
    nombre: 'Galletas con Chocolate Blanco',
    descripcion: 'Crujientes por fuera, suaves por dentro, con chispas de chocolate blanco.',
    categoria: 'galletas',
    categoriaLabel: 'Galletas',
    imagen: 'images/portafolio/galletas_chocolate_blanco_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Mantequilla',
      'Azúcar mascabado',
      'Huevo',
      'Chocolate blanco en trozos',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'galletas-chocolate',
    nombre: 'Galletas de Chocolate',
    descripcion: 'Intensas, con corteza crujiente y centro suave.',
    categoria: 'galletas',
    categoriaLabel: 'Galletas',
    imagen: 'images/portafolio/galletas_de_chocolate_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Cacao en polvo',
      'Mantequilla',
      'Azúcar',
      'Huevo',
      'Chocolate en trozos',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'galletas-doble-chocolate',
    nombre: 'Galletas de Doble Chocolate',
    descripcion: 'El doble de chocolate para los amantes del cacao.',
    categoria: 'galletas',
    categoriaLabel: 'Galletas',
    imagen: 'images/portafolio/galletas_de_doble_chocolate_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Chocolate amargo 70%',
      'Cacao en polvo',
      'Mantequilla',
      'Azúcar mascabado',
      'Huevo',
      'Chispas de chocolate',
    ],
  },
  {
    id: 'galleta-red-velvet',
    nombre: 'Galleta Red Velvet',
    descripcion: 'Suave y aterciopelada, con corazón de queso crema.',
    categoria: 'galletas',
    categoriaLabel: 'Galletas',
    imagen: 'images/portafolio/galleta_red_velvet_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Cacao en polvo',
      'Mantequilla',
      'Queso crema',
      'Azúcar',
      'Huevo',
      'Colorante rojo',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'panque-marmoleado',
    nombre: 'Panque Marmoleado',
    descripcion: 'Vainilla y chocolate entrelazados en cada rebanada.',
    categoria: 'panes',
    categoriaLabel: 'Panes y Panques',
    imagen: 'images/portafolio/panque_marmoleado_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Mantequilla',
      'Huevo',
      'Azúcar',
      'Leche',
      'Cacao en polvo',
      'Extracto de vainilla',
    ],
  },
  {
    id: 'pastel-mini-chocolate',
    nombre: 'Pastel Mini de Chocolate',
    descripcion: 'Pastelito individual con capas de bizcocho y ganache de chocolate.',
    categoria: 'chocolates',
    categoriaLabel: 'Chocolates',
    imagen: 'images/portafolio/pastel_mini_chocolate_sin_fondo.png',
    ingredientes: [
      'Chocolate amargo',
      'Harina de trigo',
      'Cocoa en polvo',
      'Huevo',
      'Buttermilk',
      'Ganache de chocolate',
      'Mantequilla',
    ],
  },
  {
    id: 'pastel-mini-moka',
    nombre: 'Pastel Mini de Moka',
    descripcion: 'La mezcla perfecta de café y chocolate en formato individual.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/pastel_mini_moka_sin_fondo.png',
    ingredientes: [
      'Café espresso',
      'Harina de trigo',
      'Chocolate amargo',
      'Huevo',
      'Mantequilla',
      'Crema de moka',
      'Azúcar mascabado',
    ],
  },
  {
    id: 'pastel-mini-red-velvet',
    nombre: 'Pastel Mini Red Velvet',
    descripcion: 'Tierno bizcocho rojo con cremoso betún de queso crema.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/pastel_mini_red_velvet_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Cacao en polvo',
      'Buttermilk',
      'Huevo',
      'Colorante rojo',
      'Queso crema',
      'Mantequilla',
    ],
  },
  {
    id: 'pastel-mini-vainilla',
    nombre: 'Pastel Mini de Vainilla',
    descripcion: 'Clásico esponjoso con betún de vainilla suave y delicado.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/pastel_mini_vainilla_sin_fondo.png',
    ingredientes: [
      'Harina de trigo',
      'Mantequilla',
      'Huevo',
      'Azúcar',
      'Leche',
      'Extracto de vainilla puro',
      'Betún de mantequilla',
    ],
  },
  {
    id: 'pastel-mini-zanahoria',
    nombre: 'Pastel Mini de Zanahoria',
    descripcion: 'Húmedo y aromático, coronado con betún de queso crema.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/pastel_mini_zanahoria_sin_fondo.png',
    ingredientes: [
      'Zanahoria rallada fresca',
      'Harina de trigo',
      'Huevo',
      'Aceite vegetal',
      'Azúcar mascabado',
      'Canela',
      'Queso crema',
    ],
  },
  {
    id: 'pastel-personalizado',
    nombre: 'Pastel Personalizado',
    descripcion: 'Diseñado a tu medida: sabor, decoración y tamaño a tu elección.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/pastel_personalizado_sin_fondo.png',
    ingredientes: [
      'Bizcocho a elegir',
      'Betún a elegir',
      'Decoraciones artesanales',
      'Fondant o betún suizo',
      'Relleno personalizado',
    ],
  },
  {
    id: 'pastel-selva-negra',
    nombre: 'Pastel Selva Negra',
    descripcion: 'Clásico alemán con cerezas, crema y chocolate amargo.',
    categoria: 'chocolates',
    categoriaLabel: 'Chocolates',
    imagen: 'images/portafolio/pastel_selva_negra_sin_fondo.png',
    ingredientes: [
      'Bizcocho de chocolate',
      'Cerezas en almíbar',
      'Crema para batir',
      'Chocolate amargo',
      'Kirsch (opcional)',
      'Azúcar glass',
    ],
  },
  {
    id: 'pastel-vintage',
    nombre: 'Pastel Vintage',
    descripcion: 'Elegante decoración estilo vintage con flores y texturas artesanales.',
    categoria: 'postres',
    categoriaLabel: 'Postres',
    imagen: 'images/portafolio/pastel_vintage_sin_fondo.png',
    ingredientes: [
      'Bizcocho de vainilla',
      'Betún de mantequilla suizo',
      'Flores de azúcar',
      'Fondant artesanal',
      'Relleno de frutos rojos',
      'Colorantes naturales',
    ],
  },
  {
    id: 'principe-alberto',
    nombre: 'Príncipe Alberto',
    descripcion: 'Postre tradicional de capas de galleta, cajeta y chocolate.',
    categoria: 'chocolates',
    categoriaLabel: 'Chocolates',
    imagen: 'images/portafolio/principe_alberto_sin_fondo.png',
    ingredientes: [
      'Galleta María',
      'Cajeta artesanal',
      'Chocolate amargo',
      'Mantequilla',
      'Leche condensada',
      'Nuez',
    ],
  },
];


/* ============================================================
   4. RENDERIZADO DE TARJETAS FLIP
============================================================ */
function buildWhatsAppUrl(producto) {
  const msg = `Hola, me gustaría pedir: ${producto.nombre}. ¿Me podrían dar más información y precio?`;
  return `https://wa.me/525610003837?text=${encodeURIComponent(msg)}`;
}

function renderCard(producto) {
  const ingredientesHTML = producto.ingredientes
    .map(i => `<li>${i}</li>`)
    .join('');

  const article = document.createElement('article');
  article.className = 'flip-card';
  article.dataset.categoria = producto.categoria;
  article.setAttribute('role', 'button');
  article.setAttribute('tabindex', '0');
  article.setAttribute('aria-label', `${producto.nombre} — activa para ver ingredientes`);

  article.innerHTML = `
    <div class="flip-card-inner">

      <div class="flip-card-front">
        <div class="card-img">
          <img src="${producto.imagen}"
               alt="${producto.nombre}"
               loading="lazy" />
        </div>
        <div class="card-info">
          <span class="card-categoria">${producto.categoriaLabel}</span>
          <p class="card-nombre">${producto.nombre}</p>
          <p class="card-hint">
            <span aria-hidden="true">✦</span>
            <span class="card-hint-hover">Clic para ver ingredientes</span>
            <span class="card-hint-touch">Toca para ver ingredientes</span>
          </p>
        </div>
      </div>

      <div class="flip-card-back" aria-hidden="true">
        <span class="back-label">Ingredientes</span>
        <p class="back-nombre">${producto.nombre}</p>
        <p class="back-desc">${producto.descripcion}</p>
        <p class="ingredientes-title">Hecho con:</p>
        <ul class="ingredientes-list">
          ${ingredientesHTML}
        </ul>
        <a href="${buildWhatsAppUrl(producto)}"
           class="back-cta"
           target="_blank"
           rel="noopener noreferrer"
           tabindex="-1"
           aria-label="Pedir ${producto.nombre} por WhatsApp">
          Pedir este producto →
        </a>
      </div>

    </div>
  `;

  return article;
}

const grid = document.getElementById('catalogo-grid');

PRODUCTOS.forEach((producto, index) => {
  const card = renderCard(producto);
  card.style.setProperty('--i', index);
  grid.appendChild(card);
});


/* ============================================================
   5. FILTROS POR CATEGORÍA
============================================================ */
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.categoria;

    document.querySelectorAll('.flip-card').forEach(card => {
      const match = cat === 'todos' || card.dataset.categoria === cat;

      if (match) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
        card.classList.remove('flipped');
        resetTilt(card);
      }
    });
  });
});


/* ============================================================
   6. TOGGLE DE FLIP POR CLIC / TECLADO
   El flip solo ocurre al hacer clic — el hover ahora hace tilt 3D.
============================================================ */
function flipCard(card) {
  resetTilt(card);

  const isFlipped = card.classList.toggle('flipped');
  const back = card.querySelector('.flip-card-back');
  const cta  = card.querySelector('.back-cta');

  back.setAttribute('aria-hidden', !isFlipped);
  cta.setAttribute('tabindex', isFlipped ? '0' : '-1');
}

grid.addEventListener('click', e => {
  const card = e.target.closest('.flip-card');
  if (!card || e.target.closest('a')) return;
  flipCard(card);
});

grid.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.flip-card');
  if (!card) return;
  e.preventDefault();
  flipCard(card);
});


/* ============================================================
   7. TILT 3D EN HOVER (solo dispositivos con cursor real)
   Mueve el mouse sobre una tarjeta para inclinarla en 3D.
   El tilt se resetea al hacer clic para no interferir con el flip.
============================================================ */
let tiltCard = null;

function applyTilt(card, e) {
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width  / 2); // -1 a 1
  const dy = (e.clientY - cy) / (rect.height / 2); // -1 a 1

  const rotX = (-dy * 7).toFixed(2);
  const rotY = ( dx * 7).toFixed(2);

  card.style.transform =
    `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

function resetTilt(card) {
  if (!card) return;
  card.style.transform = '';
  if (tiltCard === card) tiltCard = null;
}

grid.addEventListener('mousemove', e => {
  const card = e.target.closest('.flip-card');

  if (tiltCard && tiltCard !== card) {
    resetTilt(tiltCard);
  }

  if (!card || card.classList.contains('flipped')) return;

  tiltCard = card;
  applyTilt(card, e);
});

grid.addEventListener('mouseleave', () => {
  resetTilt(tiltCard);
});
