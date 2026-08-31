# Changelog

Historial de cambios de **EspiralDulceWeb**. El formato se inspira en
[Keep a Changelog](https://keepachangelog.com/es-ES/), adaptado al flujo del repo
(ver `CONTRIBUTING.md`): **no usamos versionado semántico** — cada entrada agrupa
lo que llegó a `main` en un despliegue, identificado por fecha y PR.

**Cómo mantenerlo:** cada PR hacia `develop` agrega su línea bajo **[Sin publicar]**
(con el número de PR). Cuando `develop` se mergea a `main`, esa sección se renombra
con la fecha del despliegue y se abre un **[Sin publicar]** nuevo.

---

## [Sin publicar] — en `develop`

### Agregado
- **Página 404 personalizada** (#16): `src/404.njk`, con el mismo header/footer/
  botón flotante de WhatsApp que el resto del sitio. Reusa una foto de producto
  ya existente (los alfajores) como el "0" de "404" en vez de pedir un asset
  nuevo. Agregada a la lista de páginas que valida `tests/sitio.test.js`.

## [2026-08-30] — develop → main (#15)

Tercer despliegue de la migración a Eleventy: optimización de imágenes.

### Agregado
- **Optimización de imágenes** (#14): `@11ty/eleventy-img` redimensiona cada
  imagen al ancho real en que se muestra y genera WebP (con PNG como fallback,
  ambos con canal alfa) en build-time — antes se servían tal cual, hasta 50x
  más grandes que su tamaño en pantalla (`_site/` bajó de ~64MB a ~10MB de
  imágenes). Los íconos de favicon/PWA y la imagen de Open Graph también se
  generan comprimidos en vez de reusar el logo de 4.2MB. Nueva prueba que
  blinda `og:image`, `apple-touch-icon`, `manifest.json` y el `image`/`logo`
  del JSON-LD contra rutas rotas (no las cubría la prueba de referencias
  locales, al no usar `href`/`src`).

## [2026-08-30] — develop → main (#13)

Segundo despliegue de la migración a Eleventy: Fases 4-5, CHANGELOG/CONTRIBUTING y formulario de pedido real.

### Agregado
- **Formulario de pedido real** (#12): en la sección Contacto del index, con
  validación en vivo, respaldo en `localStorage` y envío a Google Apps Script
  (los pedidos caen en una Google Sheet + aviso por correo — receta en
  `SETUP_FORMULARIO.md`). La URL del backend y el ID de GA4 ahora se inyectan en
  el build desde el `.env` (ver `.env.example`); sin configurar, el formulario
  solo guarda el respaldo local y GA4 ni se carga.
- `CHANGELOG.md` y `CONTRIBUTING.md` para llevar control de cambios y documentar el flujo de trabajo.

### Cambiado
- **Fase 4 — JS consolidado** (#9): el flip por clic/teclado y el tilt 3D de las
  tarjetas ahora viven una sola vez en `src/js/flip-cards.js` (antes estaban
  duplicados entre el index y el portafolio). `portafolio.js` queda solo con los
  filtros; al filtrar una tarjeta volteada ahora también se resetea su estado de
  accesibilidad.
- **Fase 5 — CSS modular** (#10): `styles.css` (1284 líneas) se separó en
  `tokens.css` → `base.css` → `componentes.css` → `secciones.css`, cargadas en
  orden de cascada.

### Eliminado
- **Código muerto de JS** (#9): `src/js/script.js` completo — su lógica de flip ya
  vive en `flip-cards.js` y sus ~100 líneas de formulario nunca se ejecutaban
  (ninguna página tiene `<form>`).
- **CSS muerto** (#10, −352 líneas netas): toda la sección Servicios (quitada del
  sitio desde mayo pero su CSS quedó huérfano), el layout viejo de contacto, el CSS
  del formulario, las tarjetas viejas del portafolio y 4 variantes de botón sin uso.

### Corregido
- El título del cotizador en el visualizador usaba `var(--font-heading)`, variable
  que nunca existió (caía en silencio al font del cuerpo); ahora usa
  `--font-display` (#10).

## [2026-07-19] — develop → main (#8)

Primer despliegue de la migración a Eleventy: fases 0–3 + pruebas/CI + fix de Safari.

### Agregado
- **`ARQUITECTURA.md`** (#1): diagnóstico del sitio y diseño de la migración por fases.
- **Eleventy como generador** (#2, Fase 0): `package.json`, `.eleventy.js`, build a `_site/`.
- **Suite de pruebas + CI** (#4): 12 pruebas que validan el HTML generado (links,
  anclas, número de WhatsApp, alt, SEO, sitemap); GitHub Actions las corre en cada
  PR hacia `develop`/`main`; plantilla de PR con checklist de revisión manual.
- **`src/_data/site.json`**: única fuente del número de WhatsApp, mensajes
  prellenados, email y dirección — nada de eso se hardcodea ya en templates ni JS.
- **`src/_data/productos.json`** (#7, Fase 3): única fuente de los productos; las
  tarjetas del index (destacados) y el catálogo del portafolio se generan en
  build-time desde ahí con la macro `producto-card.njk`.

### Cambiado
- **Fase 1** (#3): el sitio se movió a `src/`; `index.html` se reconstruyó desde
  `base.njk` + partials con paridad byte-a-byte.
- **Fase 2** (#5): `portafolio.html` y `visualizador-pastel.html` migraron al mismo
  layout compartido; el CSS/JS inline del visualizador se movió a archivos.

### Corregido
- **Flip cards en Safari** (#6): la cara frontal se veía en espejo al voltear.

## [2026-07-14] — tag `pre-eleventy-migration`

Punto de rollback: el último estado del sitio como HTML/CSS/JS plano, antes de la
migración a Eleventy.

## [2026-06-05]

### Agregado
- SEO/PWA: `manifest.json`, `robots.txt`, `sitemap.xml`, Open Graph y metadatos.
- `SETUP_FORMULARIO.md` con la receta de Google Apps Script para un formulario futuro.

## [2026-05] — rediseño y reenfoque del sitio

Resumen del trabajo de mayo (pre-changelog, reconstruido del historial de git):

### Agregado
- Página de **portafolio** con flip cards, filtros por categoría y tilt 3D; 11
  productos nuevos en el catálogo.
- **Visualizador / cotizador** de pasteles ("Diseña tu pastel") integrado al sitio.

### Cambiado
- Renombre de marca a **Espiral Dulce** con logos reales; enfoque de corporativo a
  repostería general a pedido; nueva paleta tierra/chocolate; imágenes locales en
  lugar de Unsplash; transiciones degradadas entre secciones.

### Eliminado
- Sección **Servicios** del index y del footer (reemplazada por Proceso).

## [2026-05-09] — versión inicial

Sitio estático de una página en HTML/CSS/JS plano.
