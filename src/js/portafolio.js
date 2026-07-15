/**
 * portafolio.js — Espiral Dulce · página de portafolio
 *
 * Las tarjetas del catálogo se renderizan en build-time desde
 * src/_data/productos.json (ver partials/producto-card.njk). Este archivo solo
 * opera sobre ese DOM ya existente. El chrome compartido (menú hamburguesa,
 * sombra del header, smooth scroll y scroll reveal) vive en nav.js, que se carga
 * antes que este archivo.
 *
 * Módulos:
 *   1. Filtros por categoría
 *   2. Toggle de flip por clic
 *   3. Tilt 3D en hover (desktop)
 */


const grid = document.getElementById('catalogo-grid');


/* ============================================================
   1. FILTROS POR CATEGORÍA
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
   2. TOGGLE DE FLIP POR CLIC / TECLADO
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
   3. TILT 3D EN HOVER (solo dispositivos con cursor real)
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
