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
Ver `PRUEBAS.md` para la guía completa, incluida la checklist de revisión manual.

> See `ARQUITECTURA.md` for the current-state analysis and the Eleventy migration design.
> Migration is in progress, phase by phase, on `develop` + feature PRs.

## File Structure

| File | Purpose |
|------|---------|
| `src/index.njk` | Home page — body content only; the chrome comes from the layout |
| `src/portafolio.html`, `src/visualizador-pastel.html` | Aún páginas HTML completas (migran al layout en la Fase 2) |
| `src/_includes/layouts/base.njk` | `<head>` + header + footer + botón flotante + scripts — compartido por todas las páginas |
| `src/_includes/partials/` | `head-seo`, `header-nav`, `footer`, `whatsapp-float`, `scripts` |
| `src/_data/site.json` | **Única fuente** del número de WhatsApp, mensajes prellenados, email, dirección y redes |
| `src/css/styles.css` | All styles; sections are numbered and commented to match the HTML |
| `src/js/script.js` | All client-side behavior: hamburger menu, smooth scroll, scroll-reveal, header shadow, WhatsApp helper, contact form |
| `.eleventy.js` | Build config + filtros `waUrl` / `waProducto` (arman los links de WhatsApp desde `site.json`) |

**Nunca hardcodees el número de WhatsApp en un template.** Usa
`{{ site.whatsapp.mensajes.pedido | waUrl }}` o `{{ 'Nombre del producto' | waProducto }}`.

## Architecture

The page is a single scrollable document with 8 sections (in order): Header/Nav → Hero → Portafolio → Servicios → Testimonios → CTA Principal → Proceso → Contacto → Footer.

**CSS** uses CSS custom properties (`:root` variables) for the design system: pink (`--pink`), gold (`--gold`), dark (`--dark`/`--dark-2`), and shared spacing/shadow/typography tokens. All responsive breakpoints are inline in each section's block — not centralized.

**JavaScript** is structured as 6 independent, clearly-commented modules at the top of the file. No imports, no classes. The contact form saves submissions to `localStorage` under the key `mipasteleria_submissions`; it does **not** POST to a backend.

**WhatsApp CTAs** use the `wa.me/525610003837` number en todos lados (CTAs visibles, botón flotante y helper de JS).

**Scroll animations** use the `.reveal` / `.reveal-delay-N` CSS classes together with an `IntersectionObserver` in `script.js`. Elements animate in once and are then unobserved.

## Language

All user-visible content is in **Spanish (Mexican)**. Keep any new UI copy in Spanish.
