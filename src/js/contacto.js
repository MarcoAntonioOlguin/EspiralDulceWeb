/**
 * contacto.js — Espiral Dulce · formulario de pedido (sección Contacto del index)
 *
 * - Validación en tiempo real (campo verde cuando es válido)
 * - Valida requeridos y formato de email al enviar
 * - Guarda cada envío en localStorage como respaldo
 * - Postea al Google Apps Script (ver SETUP_FORMULARIO.md); la URL viene de
 *   window.SITE.appsScriptUrl, inyectada en el build desde el .env — si está
 *   vacía, solo se guarda el respaldo local.
 */
(function () {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const formSuccess      = document.getElementById('form-success');
  const nombreField      = document.getElementById('nombre');
  const emailField       = document.getElementById('email');
  const descripcionField = document.getElementById('descripcion');

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function markFieldInvalid(field) {
    field.classList.add('invalid');
    setTimeout(() => field.classList.remove('invalid'), 2500);
  }

  // Validación en vivo: la clase .valid pinta el borde verde
  nombreField.addEventListener('input', () => {
    nombreField.classList.toggle('valid', nombreField.value.trim().length > 0);
  });
  emailField.addEventListener('input', () => {
    emailField.classList.toggle('valid', isValidEmail(emailField.value.trim()));
  });
  descripcionField.addEventListener('input', () => {
    descripcionField.classList.toggle('valid', descripcionField.value.trim().length > 10);
  });

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
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const payload = {
      nombre, email,
      tipo_evento:  document.getElementById('tipo-evento').value,
      fecha_evento: document.getElementById('fecha-evento').value,
      personas:     document.getElementById('personas').value,
      descripcion,
      timestamp: new Date().toISOString(),
    };

    // Respaldo local: siempre se guarda, por si el POST falla o no hay backend configurado
    try {
      const submissions = JSON.parse(localStorage.getItem('espiraldulce_submissions') || '[]');
      submissions.push(payload);
      localStorage.setItem('espiraldulce_submissions', JSON.stringify(submissions));
    } catch (err) {
      console.warn('No se pudo guardar en localStorage:', err);
    }

    if (window.SITE.appsScriptUrl) {
      try {
        // mode: 'no-cors' porque Apps Script no devuelve headers CORS.
        // Trade-off: no podemos leer la respuesta, asumimos éxito si no hay throw.
        await fetch(window.SITE.appsScriptUrl, {
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

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
})();
