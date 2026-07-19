/**
 * visualizador.js — Espiral Dulce · "Diseña tu pastel"
 *
 * Arma un pedido de pastel personalizado y lo manda por WhatsApp como mensaje
 * ya formateado. No envía nada a ningún backend: el chat de WhatsApp es el canal.
 *
 * El chrome compartido (menú hamburguesa, sombra del header, smooth scroll) vive
 * en nav.js, que se carga antes que este archivo.
 *
 * Módulos:
 *   1. Chips de selección (single / multi)
 *   2. Subida de fotos de referencia (solo vista previa local)
 *   3. Constructor del mensaje de WhatsApp
 *   4. Validación y envío
 */
(function () {
  'use strict';

  /* ============================================================
     1. CHIPS
  ============================================================ */
  document.querySelectorAll('.chip-group').forEach(group => {
    const isMulti = group.dataset.type === 'multi';

    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (isMulti) {
          chip.classList.toggle('sel');
        } else {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
          chip.classList.add('sel');
        }
      });
    });
  });


  /* ============================================================
     2. SUBIDA DE FOTOS
     Las fotos no se suben a ningún lado: solo se cuentan y se
     previsualizan, y se le pide al cliente que las adjunte en el chat.
  ============================================================ */
  let uploadedFiles = [];
  const photoDrop     = document.getElementById('photoDrop');
  const photoInput    = document.getElementById('photoInput');
  const photoPreviews = document.getElementById('photoPreviews');
  const photoCountEl  = document.getElementById('photoCount');

  photoInput.addEventListener('change', () => handleFiles(photoInput.files));

  photoDrop.addEventListener('dragover',  e => { e.preventDefault(); photoDrop.classList.add('drag-over'); });
  photoDrop.addEventListener('dragleave', ()  => photoDrop.classList.remove('drag-over'));
  photoDrop.addEventListener('drop', e => {
    e.preventDefault();
    photoDrop.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      uploadedFiles.push(file);

      const img = document.createElement('img');
      img.className = 'photo-thumb';
      img.alt = file.name;

      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(file);

      photoPreviews.appendChild(img);
    });

    const n = uploadedFiles.length;
    photoCountEl.textContent = n > 0
      ? `${n} foto${n > 1 ? 's' : ''} seleccionada${n > 1 ? 's' : ''} — recuerda adjuntarlas en el chat de WhatsApp.`
      : '';
  }


  /* ============================================================
     3. CONSTRUCTOR DEL MENSAJE DE WHATSAPP
  ============================================================ */
  function getChipValues(field, multi) {
    const group = document.querySelector(`.chip-group[data-field="${field}"]`);
    if (!group) return multi ? [] : '';

    const sel = Array.from(group.querySelectorAll('.chip.sel')).map(c => c.dataset.value);
    return multi ? sel : (sel[0] || '');
  }

  function formatDate(val) {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                   'agosto','septiembre','octubre','noviembre','diciembre'];
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
  }

  function buildMessage() {
    const size     = getChipValues('size', false);
    const flavors  = getChipValues('flavor', true);
    const frosting = getChipValues('frosting', false);
    const filling  = getChipValues('filling', false);
    const occasion = getChipValues('occasion', false);
    const fecha    = formatDate(document.getElementById('fechaInput').value);
    const notas    = document.getElementById('notasInput').value.trim();
    const nFotos   = uploadedFiles.length;

    let msg = `Hola ${window.SITE.nombre}! 🎂 Me gustaría cotizar un *pastel personalizado*:\n\n`;
    msg += `📋 *Detalles del pedido:*\n`;
    if (size)           msg += `• Tamaño: ${size}\n`;
    if (flavors.length) msg += `• Sabor: ${flavors.join(' + ')}\n`;
    if (frosting)       msg += `• Betún: ${frosting}\n`;
    if (filling)        msg += `• Relleno: ${filling}\n`;
    if (occasion)       msg += `• Ocasión: ${occasion}\n`;
    if (fecha)          msg += `• Fecha deseada: ${fecha}\n`;
    if (notas)          msg += `\n📝 *Notas:*\n${notas}\n`;
    if (nFotos > 0)
      msg += `\n📎 Adjunto ${nFotos} foto${nFotos > 1 ? 's' : ''} de referencia en este chat.`;

    return msg;
  }


  /* ============================================================
     4. VALIDACIÓN Y ENVÍO
     El tamaño es el único campo obligatorio: sin él no se puede cotizar.
  ============================================================ */
  function validate() {
    const size      = getChipValues('size', false);
    const errorEl   = document.getElementById('errorSize');
    const sizeGroup = document.querySelector('.chip-group[data-field="size"]');

    if (!size) {
      errorEl.classList.add('visible');
      sizeGroup.classList.add('has-error');
      sizeGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    errorEl.classList.remove('visible');
    sizeGroup.classList.remove('has-error');
    return true;
  }

  document.getElementById('btnEnviar').addEventListener('click', () => {
    if (!validate()) return;
    // El número sale de site.json, vía nav.js.
    window.open(window.waUrl(buildMessage()), '_blank', 'noopener,noreferrer');
  });

})();
