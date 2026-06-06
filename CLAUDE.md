# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EspiralDulceWeb** is a static, single-page marketing site for **Espiral Dulce**, an
artisanal pastry studio based in Anzures, Miguel Hidalgo (CDMX). It sells pasteles,
galletas, panques, tartas y postres a pedido — la venta es por WhatsApp y la entrega
es a domicilio en toda la CDMX. No tienda física, no checkout online.

Plain HTML/CSS/JS — no build system, bundler, or framework. Open `index.html`
directly or serve via any static file server.

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | The entire page — all sections are defined here |
| `css/styles.css` | All styles; sections are numbered and commented to match the HTML |
| `js/script.js` | All client-side behavior: hamburger menu, smooth scroll, scroll-reveal, header shadow, WhatsApp helper, contact form |

## Architecture

The page is a single scrollable document with 8 sections (in order): Header/Nav → Hero → Portafolio → Servicios → Testimonios → CTA Principal → Proceso → Contacto → Footer.

**CSS** uses CSS custom properties (`:root` variables) for the design system: pink (`--pink`), gold (`--gold`), dark (`--dark`/`--dark-2`), and shared spacing/shadow/typography tokens. All responsive breakpoints are inline in each section's block — not centralized.

**JavaScript** is structured as 6 independent, clearly-commented modules at the top of the file. No imports, no classes. The contact form saves submissions to `localStorage` under the key `mipasteleria_submissions`; it does **not** POST to a backend.

**WhatsApp CTAs** use the `wa.me/525610003837` number en todos lados (CTAs visibles, botón flotante y helper de JS).

**Scroll animations** use the `.reveal` / `.reveal-delay-N` CSS classes together with an `IntersectionObserver` in `script.js`. Elements animate in once and are then unobserved.

## Language

All user-visible content is in **Spanish (Mexican)**. Keep any new UI copy in Spanish.
