/**
 * flip-cards.js — Espiral Dulce
 *
 * Comportamiento compartido de las tarjetas .flip-card — las 3 destacadas del
 * index y todo el catálogo del portafolio usan exactamente el mismo markup
 * (producto-card.njk), así que la interacción vive una sola vez aquí:
 *   1. Flip por clic o teclado (Enter / espacio)
 *   2. Tilt 3D en hover (solo dispositivos con cursor real)
 *
 * Se carga en todas las páginas después de nav.js; en páginas sin tarjetas
 * (visualizador) no registra nada. Usa delegación sobre document, así funciona
 * igual con cualquier cantidad de tarjetas.
 */
(function () {
  if (!document.querySelector('.flip-card')) return;

  let tiltCard = null;

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2); // -1 a 1
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2); // -1 a 1
    card.style.transform =
      `perspective(1000px) rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 7).toFixed(2)}deg)`;
  }

  function resetTilt(card) {
    if (!card) return;
    card.style.transform = '';
    if (tiltCard === card) tiltCard = null;
  }

  // El tilt se resetea antes de girar para no interferir con el flip.
  function setFlipped(card, isFlipped) {
    resetTilt(card);
    card.classList.toggle('flipped', isFlipped);
    card.querySelector('.flip-card-back').setAttribute('aria-hidden', !isFlipped);
    card.querySelector('.back-cta').setAttribute('tabindex', isFlipped ? '0' : '-1');
  }

  /** Regresa una tarjeta a su cara frontal (la usan los filtros del portafolio). */
  window.unflipCard = function (card) {
    setFlipped(card, false);
  };

  document.addEventListener('click', e => {
    const card = e.target.closest('.flip-card');
    if (!card || e.target.closest('a')) return;
    setFlipped(card, !card.classList.contains('flipped'));
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.flip-card');
    if (!card) return;
    e.preventDefault();
    setFlipped(card, !card.classList.contains('flipped'));
  });

  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.flip-card');
    if (tiltCard && tiltCard !== card) resetTilt(tiltCard);
    if (!card || card.classList.contains('flipped')) return;
    tiltCard = card;
    applyTilt(card, e);
  });

  // Si el cursor sale de la ventana, la última tarjeta no se queda inclinada.
  document.addEventListener('mouseleave', () => resetTilt(tiltCard));
})();
