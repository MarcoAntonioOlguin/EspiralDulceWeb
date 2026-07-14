/**
 * script.js — Espiral Dulce · página de inicio
 *
 * El chrome compartido (menú hamburguesa, sombra del header, smooth scroll y
 * scroll reveal) vive en nav.js, que se carga antes que este archivo en todas
 * las páginas. Aquí solo queda lo específico de la portada.
 *
 * Módulos:
 *   1. Flip cards de la portada (flip por clic + tilt 3D)
 *   2. Validación y envío del formulario de contacto
 */


/* ============================================================
   1. FLIP CARDS EN PORTADA
   Flip por clic y tilt 3D para las tarjetas del portafolio
   que se muestran en index.html.
============================================================ */
(function () {
  const cards = document.querySelectorAll('.flip-card');
  if (!cards.length) return;

  let tiltCard = null;

  function resetTilt(card) {
    card.style.transform = '';
    if (tiltCard === card) tiltCard = null;
  }

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    card.style.transform =
      `perspective(1000px) rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 7).toFixed(2)}deg)`;
  }

  cards.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      resetTilt(card);
      const isFlipped = card.classList.toggle('flipped');
      card.querySelector('.flip-card-back').setAttribute('aria-hidden', !isFlipped);
      card.querySelector('.back-cta').setAttribute('tabindex', isFlipped ? '0' : '-1');
    });

    card.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      card.click();
    });

    card.addEventListener('mousemove', e => {
      if (card.classList.contains('flipped')) return;
      if (tiltCard && tiltCard !== card) resetTilt(tiltCard);
      tiltCard = card;
      applyTilt(card, e);
    });

    card.addEventListener('mouseleave', () => resetTilt(card));
  });
})();


/* ============================================================
   2. FORMULARIO DE CONTACTO
   OJO: hoy ninguna página del sitio tiene un <form>, así que este bloque
   nunca se ejecuta (contactForm siempre es null). Ver ARQUITECTURA.md
   § Estado conocido — se limpia en la Fase 4.
   - Validación en tiempo real (campo verde cuando es válido)
   - Valida campos requeridos y formato de email al enviar
   - Muestra feedback visual en campos inválidos
   - Guarda el envío en localStorage como historial
   - Muestra mensaje de éxito tras el envío
============================================================ */
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const formSuccess = document.getElementById('form-success');

  function markFieldInvalid(field) {
    field.style.borderColor = '#ef4444';
    field.style.boxShadow   = '0 0 0 3px rgba(239, 68, 68, 0.15)';
    setTimeout(() => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
    }, 2500);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const nombreField      = document.getElementById('nombre');
  const emailField       = document.getElementById('email');
  const descripcionField = document.getElementById('descripcion');

  function markValid(f)  { f.classList.add('valid'); }
  function clearValid(f) { f.classList.remove('valid'); }

  nombreField.addEventListener('input', () => {
    nombreField.value.trim().length > 0 ? markValid(nombreField) : clearValid(nombreField);
  });
  emailField.addEventListener('input', () => {
    isValidEmail(emailField.value.trim()) ? markValid(emailField) : clearValid(emailField);
  });
  descripcionField.addEventListener('input', () => {
    descripcionField.value.trim().length > 10 ? markValid(descripcionField) : clearValid(descripcionField);
  });

  // URL del Google Apps Script web app — ver SETUP_FORMULARIO.md
  const APPS_SCRIPT_URL = 'PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT';

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre      = nombreField.value.trim();
    const email       = emailField.value.trim();
    const descripcion = descripcionField.value.trim();

    let hasErrors = false;
    if (!nombre)      { markFieldInvalid(nombreField);      hasErrors = true; }
    if (!email)       { markFieldInvalid(emailField);       hasErrors = true; }
    if (!descripcion) { markFieldInvalid(descripcionField); hasErrors = true; }
    if (hasErrors) return;

    if (!isValidEmail(email)) { markFieldInvalid(emailField); return; }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; }

    const payload = {
      nombre, email,
      tipo_evento:  document.getElementById('tipo-evento').value,
      fecha_evento: document.getElementById('fecha-evento').value,
      personas:     document.getElementById('personas').value,
      descripcion,
      timestamp: new Date().toISOString(),
    };

    // Backup local: siempre guardamos por si el POST falla o el Apps Script no está configurado
    try {
      const submissions = JSON.parse(localStorage.getItem('espiraldulce_submissions') || '[]');
      submissions.push(payload);
      localStorage.setItem('espiraldulce_submissions', JSON.stringify(submissions));
    } catch (err) {
      console.warn('No se pudo guardar en localStorage:', err);
    }

    // Enviar a Google Apps Script (si está configurado)
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.startsWith('PEGA_AQUI')) {
      try {
        // mode: 'no-cors' porque Apps Script no devuelve headers CORS.
        // Trade-off: no podemos leer la respuesta, asumimos éxito si no hay throw.
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('No se pudo enviar al Apps Script:', err);
      }
    }

    contactForm.reset();
    contactForm.querySelectorAll('.valid').forEach(f => f.classList.remove('valid'));
    formSuccess.style.display = 'flex';
    const rect = formSuccess.getBoundingClientRect();
    window.scrollBy({ top: rect.top - 100, behavior: 'smooth' });
    setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
  });
}
