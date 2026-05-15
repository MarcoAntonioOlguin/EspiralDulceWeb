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
            <span class="card-hint-hover">Pasa el cursor para ver ingredientes</span>
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

PRODUCTOS.forEach(producto => {
  grid.appendChild(renderCard(producto));
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
      }
    });
  });
});


/* ============================================================
   6. TOGGLE DE FLIP POR CLIC / TECLADO
   El CSS ya maneja el hover en desktop.
   El clic agrega/quita la clase .flipped para:
     - Dispositivos táctiles (sin hover)
     - Usuarios de teclado (Tab + Enter/Space)
============================================================ */
grid.addEventListener('click', e => {
  const card = e.target.closest('.flip-card');
  if (!card) return;

  if (e.target.closest('a')) return;

  const isFlipped = card.classList.toggle('flipped');
  const back = card.querySelector('.flip-card-back');
  const cta  = card.querySelector('.back-cta');

  back.setAttribute('aria-hidden', !isFlipped);
  cta.setAttribute('tabindex', isFlipped ? '0' : '-1');
});

grid.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.flip-card');
  if (!card) return;
  e.preventDefault();

  const isFlipped = card.classList.toggle('flipped');
  const back = card.querySelector('.flip-card-back');
  const cta  = card.querySelector('.back-cta');

  back.setAttribute('aria-hidden', !isFlipped);
  cta.setAttribute('tabindex', isFlipped ? '0' : '-1');
});
