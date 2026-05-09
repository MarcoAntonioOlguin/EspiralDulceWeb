# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EspiralDulceWeb** is a static, single-page marketing website for a corporate pastry/bakery business ("Mi Pastelería Deliciosa") based in CDMX, Mexico. It has no build system, bundler, or framework — just plain HTML, CSS, and vanilla JavaScript served directly from the filesystem or any static host.

## Development

Open `index.html` directly in a browser or use any static file server:

```bash
# Quick local server (Python)
python3 -m http.server 8080

# Or with Node
npx serve .
```

There are no build steps, no dependencies to install, and no tests.

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

**WhatsApp CTAs** use the `wa.me/5215512345678` number throughout, except the floating mobile button which uses `wa.me/525610003837` — these two numbers are intentionally different (one appears to be the owner's direct number). Confirm with the client before changing either.

**Images** are sourced from Unsplash (`images.unsplash.com`) and `pravatar.cc` (testimonial avatars). No local image assets exist.

**Scroll animations** use the `.reveal` / `.reveal-delay-N` CSS classes together with an `IntersectionObserver` in `script.js`. Elements animate in once and are then unobserved.

## Language

All user-visible content is in **Spanish (Mexican)**. Keep any new UI copy in Spanish.
