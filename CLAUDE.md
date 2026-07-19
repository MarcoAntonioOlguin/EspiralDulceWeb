# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EspiralDulceWeb** is a static, single-page marketing site for **Espiral Dulce**, an
artisanal pastry studio based in Anzures, Miguel Hidalgo (CDMX). It sells pasteles,
galletas, panques, tartas y postres a pedido — la venta es por WhatsApp y la entrega
es a domicilio en toda la CDMX. No tienda física, no checkout online.

Plain HTML/CSS/JS output — no framework, no client-side runtime. The site is now built
with **Eleventy**: sources live in `src/`, the static output is generated into `_site/`.

```
npm install      # una vez
npm start        # dev server con recarga (http://localhost:8080)
npm run build    # compila a _site/
npm test         # compila y valida la salida (links, anclas, WhatsApp, alt, SEO)
```

Corre `npm test` antes de abrir un PR — el CI lo corre igual en cada PR hacia `develop`/`main`.
Las pruebas viven en `tests/` y validan `_site/` (el HTML real), no los templates.

Cada PR usa `.github/pull_request_template.md`: llena la checklist de **revisión manual** con
lo que *ese* PR puede haber roto y la máquina no puede ver (que un CTA abra bien WhatsApp, que
las flip cards giren, el responsive). No pegues una checklist genérica.

> See `ARQUITECTURA.md` for the current-state analysis and the Eleventy migration design.
> Migration is in progress, phase by phase, on `develop` + feature PRs.

## File Structure

| File | Purpose |
|------|---------|
| `src/index.njk`, `src/portafolio.njk`, `src/visualizador-pastel.njk` | Las 3 páginas — **solo el cuerpo**; el chrome sale del layout |
| `src/_includes/layouts/base.njk` | `<head>` + header + footer + botón flotante + scripts — compartido por las 3 páginas |
| `src/_includes/partials/` | `head-seo`, `header-nav`, `footer`, `whatsapp-float`, `scripts`, `producto-card` (macro de tarjeta) |
| `src/_data/site.json` | **Única fuente** del número de WhatsApp, mensajes prellenados, email, dirección y redes |
| `src/_data/productos.json` | **Única fuente** de los productos. La usan el index (destacados) y el portafolio (catálogo), renderizados en build-time |
| `src/js/nav.js` | Chrome compartido: menú hamburguesa, sombra del header, smooth scroll, scroll reveal. Define `window.SITE` y `window.waUrl()` |
| `src/js/flip-cards.js` | Flip por clic/teclado + tilt 3D de las `.flip-card` (index y portafolio). Se carga en todas las páginas; no-op si no hay tarjetas. Expone `window.unflipCard()` |
| `src/js/portafolio.js`, `visualizador.js` | Lo específico de cada página (filtros del catálogo, cotizador). El index no tiene `pageScript` |
| `src/css/styles.css` | Estilos base; secciones numeradas y comentadas igual que el HTML |
| `.eleventy.js` | Build config + filtros `waUrl` / `waProducto` (arman los links de WhatsApp desde `site.json`) |

### Reglas al agregar o tocar una página

- **Nunca hardcodees el número de WhatsApp.** En templates usa
  `{{ site.whatsapp.mensajes.pedido | waUrl }}` o `{{ 'Nombre del producto' | waProducto }}`;
  en JS usa `window.waUrl(mensaje)` y `window.SITE` (los inyecta `nav.js` desde el mismo `site.json`).
- **Nada de CSS ni JS inline**: van a `src/css/*.css` (declarado con `pageCss`) y `src/js/*.js`
  (declarado con `pageScript`). Hay una prueba que lo verifica.
- Cada página declara en su front matter: `inicio` (`""` en la home, `"index.html"` en las demás —
  hace que los links del nav apunten al ancla correcta), `pageScript` (opcional — solo si la
  página tiene JS propio), y su SEO (`title`, `description`, `canonical`, `ogTitle`, …).
- **Para agregar/editar un producto**: toca solo `src/_data/productos.json`. Aparece en el
  catálogo del portafolio automáticamente; marca `"destacado": true` (máx. 3) para que salga
  también en la vista previa del index. El markup de la tarjeta es la macro `producto-card.njk`.

## Architecture

The page is a single scrollable document with 8 sections (in order): Header/Nav → Hero → Portafolio → Servicios → Testimonios → CTA Principal → Proceso → Contacto → Footer.

**CSS** uses CSS custom properties (`:root` variables) for the design system: pink (`--pink`), gold (`--gold`), dark (`--dark`/`--dark-2`), and shared spacing/shadow/typography tokens. All responsive breakpoints are inline in each section's block — not centralized.

**JavaScript** is plain browser JS — no imports, no classes, no bundler. Shared behavior
lives in `nav.js` (chrome) and `flip-cards.js` (tarjetas); each page may add its own
`pageScript` on top. There is **no contact form** on the site: the Contacto section is
cards linking to WhatsApp/tel/email (a real form is a pending business decision, see
`SETUP_FORMULARIO.md`).

**WhatsApp CTAs** salen todos de `site.json` — nunca se hardcodea el número (ver reglas arriba).

**Scroll animations** use the `.reveal` / `.reveal-delay-N` CSS classes together with an `IntersectionObserver` in `nav.js`. Elements animate in once and are then unobserved.

## Language

All user-visible content is in **Spanish (Mexican)**. Keep any new UI copy in Spanish.
