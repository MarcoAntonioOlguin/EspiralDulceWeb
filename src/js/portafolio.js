/**
 * portafolio.js — Espiral Dulce · página de portafolio
 *
 * Las tarjetas del catálogo se renderizan en build-time desde
 * src/_data/productos.json (ver partials/producto-card.njk). El chrome
 * compartido (menú, sombra del header, smooth scroll, scroll reveal) vive en
 * nav.js y el flip/tilt de las tarjetas en flip-cards.js. Aquí solo quedan
 * los filtros por categoría.
 */


/* ============================================================
   FILTROS POR CATEGORÍA
   Al ocultar una tarjeta también se regresa a su cara frontal,
   para que no reaparezca volteada al cambiar de filtro.
============================================================ */
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.categoria;

    document.querySelectorAll('.flip-card').forEach(card => {
      const match = cat === 'todos' || card.dataset.categoria === cat;
      card.classList.toggle('hidden', !match);
      if (!match) window.unflipCard(card);
    });
  });
});
