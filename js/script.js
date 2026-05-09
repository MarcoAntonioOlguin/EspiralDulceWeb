/**
 * script.js — Espiral Dulce
 *
 * Módulos:
 *   1. Menú hamburguesa (mobile)
 *   2. Smooth scroll con offset del header fijo
 *   3. Scroll reveal (IntersectionObserver)
 *   4. Sombra dinámica del header al hacer scroll
 *   5. Ayudante para abrir WhatsApp
 *   6. Validación y envío del formulario de contacto
 */


/* ============================================================
   1. MENÚ HAMBURGUESA
   Abre/cierra el menú móvil al hacer clic en el botón ≡
============================================================ */
const hamburger = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);

  if (isOpen) {
    mobileNav.classList.add('open');
  } else {
    mobileNav.classList.remove('open');
  }
});

// Cierra el menú al hacer clic en cualquier enlace interno
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
  });
});


/* ============================================================
   2. SMOOTH SCROLL CON OFFSET
   Navega suavemente a la sección y compensa la altura
   del header fijo para que el título no quede tapado.
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetSelector = this.getAttribute('href');
    const target = document.querySelector(targetSelector);

    if (target) {
      e.preventDefault();
      const headerHeight = document.getElementById('header').offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});


/* ============================================================
   3. SCROLL REVEAL
   Hace aparecer los elementos .reveal al entrar en el viewport.
   Usa IntersectionObserver para mejor rendimiento que scroll events.
============================================================ */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // Solo se anima una vez
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px',
  }
);

revealElements.forEach(el => revealObserver.observe(el));


/* ============================================================
   4. SOMBRA DINÁMICA DEL HEADER
   Aumenta la sombra del header cuando el usuario hace scroll.
============================================================ */
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.06)';
  }
}, { passive: true });


/* ============================================================
   5. AYUDANTE WHATSAPP
   Abre WhatsApp con un mensaje pre-llenado según el producto.
   Se llama desde los botones "Ver Detalles" de cada pastel.
============================================================ */
function openWhatsApp(producto) {
  const message = `Hola, me gustaría más información sobre el ${producto} para mi evento corporativo.`;
  const encodedMsg = encodeURIComponent(message);
  window.open(
    `https://wa.me/5215512345678?text=${encodedMsg}`,
    '_blank',
    'noopener,noreferrer'
  );
}


/* ============================================================
   6. FORMULARIO DE CONTACTO
   - Valida campos requeridos y formato de email
   - Muestra feedback visual en campos inválidos
   - Guarda el envío en localStorage como historial
   - Muestra mensaje de éxito tras el envío
============================================================ */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

/**
 * Marca un campo como inválido con borde rojo,
 * luego lo restaura después de 2.5 segundos.
 * @param {HTMLElement} field
 */
function markFieldInvalid(field) {
  field.style.borderColor = '#ef4444';
  field.style.boxShadow   = '0 0 0 3px rgba(239, 68, 68, 0.15)';
  setTimeout(() => {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
  }, 2500);
}

/**
 * Valida el formato básico de un email.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  // Lectura de valores
  const nombreField     = document.getElementById('nombre');
  const emailField      = document.getElementById('email');
  const descripcionField = document.getElementById('descripcion');

  const nombre     = nombreField.value.trim();
  const email      = emailField.value.trim();
  const descripcion = descripcionField.value.trim();

  // --- Validación de campos requeridos ---
  let hasErrors = false;

  if (!nombre) { markFieldInvalid(nombreField);      hasErrors = true; }
  if (!email)  { markFieldInvalid(emailField);       hasErrors = true; }
  if (!descripcion) { markFieldInvalid(descripcionField); hasErrors = true; }

  if (hasErrors) return;

  // --- Validación de formato de email ---
  if (!isValidEmail(email)) {
    markFieldInvalid(emailField);
    return;
  }

  // --- Guardar en localStorage ---
  try {
    const submissions = JSON.parse(
      localStorage.getItem('espiraldulce_submissions') || '[]'
    );

    submissions.push({
      nombre,
      email,
      tipo_evento:  document.getElementById('tipo-evento').value,
      fecha_evento: document.getElementById('fecha-evento').value,
      personas:     document.getElementById('personas').value,
      descripcion,
      timestamp:    new Date().toISOString(),
    });

    localStorage.setItem('espiraldulce_submissions', JSON.stringify(submissions));
  } catch (err) {
    // localStorage puede no estar disponible en algunos contextos
    console.warn('No se pudo guardar en localStorage:', err);
  }

  // --- Mostrar mensaje de éxito ---
  contactForm.reset();
  formSuccess.style.display = 'flex';
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Ocultar el mensaje después de 6 segundos
  setTimeout(() => {
    formSuccess.style.display = 'none';
  }, 6000);
});
