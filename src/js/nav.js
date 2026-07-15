/**
 * nav.js — Espiral Dulce
 *
 * Comportamiento del chrome compartido: lo que existe en TODAS las páginas.
 * Se carga antes que el script de cada página, así que `window.SITE` ya está
 * disponible para ellos.
 *
 * Módulos:
 *   0. Config del sitio (leída del JSON que inyecta el layout)
 *   1. Menú hamburguesa (mobile)
 *   2. Sombra dinámica del header al hacer scroll
 *   3. Smooth scroll con offset del header fijo
 *   4. Scroll reveal (IntersectionObserver)
 */


/* ============================================================
   0. CONFIG DEL SITIO
   Viene de src/_data/site.json, inyectado por el layout como JSON.
   Es la misma fuente que usan los templates: el número de WhatsApp
   nunca se hardcodea en el JS.
============================================================ */
window.SITE = JSON.parse(document.getElementById('site-config').textContent);

/** Arma un link de WhatsApp con el mensaje ya codificado. */
window.waUrl = function (mensaje) {
  return `https://wa.me/${window.SITE.whatsapp.numero}?text=${encodeURIComponent(mensaje)}`;
};


/* ============================================================
   1. MENÚ HAMBURGUESA
============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileNav.classList.toggle('open', isOpen);
});

// Cierra el menú al hacer clic en cualquier enlace
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
   3. SMOOTH SCROLL CON OFFSET
   Compensa la altura del header fijo para que el título de la
   sección no quede tapado.
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    // El logo del nav usa href="#": querySelector('#') es un selector inválido y truena.
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const targetTop = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 12;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});


/* ============================================================
   4. SCROLL REVEAL
   Hace aparecer los elementos .reveal al entrar en el viewport.
   Cada elemento se anima una sola vez.
============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
