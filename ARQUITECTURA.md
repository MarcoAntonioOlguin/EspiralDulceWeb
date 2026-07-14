# Arquitectura — Espiral Dulce

Análisis del estado actual del código y propuesta de nueva arquitectura del sitio.

## Contexto

El sitio creció de una sola página (lo que decía `CLAUDE.md` antes de esta actualización) a
**tres páginas** con lógica y contenido duplicados entre ellas. Existe un roadmap previo
(`cambios.md`) con fases 1-4 ya aplicadas (branding, tokens CSS, iconos Lucide, SEO/PWA) y
fases 5-6 pendientes, marcadas explícitamente como "esto sí toca arquitectura" / "no
empieces sin platicar primero". Este documento retoma justo esas fases pendientes y les da
forma concreta: adoptar un generador de sitio estático (Eleventy) en vez de quedarse en
vanilla puro o un script casero de build.

`cambios.md` se mantiene como está (es el roadmap táctico fase-a-fase); este documento es el
diseño de más alto nivel al que ese roadmap ahora apunta.

---

## Parte 1 — Estado actual

### Stack
HTML + CSS + JS vanilla, sin build system, sin dependencias, sin framework. Tres páginas
HTML independientes (`index.html`, `portafolio.html`, `visualizador-pastel.html`), cada una
con su propio `<head>` completo y su propio header/nav/footer copiado a mano. SEO/PWA ya
están configurados: meta tags OG/Twitter, JSON-LD `Bakery`/`LocalBusiness`, `manifest.json`,
`robots.txt`, `sitemap.xml` (lista las 3 páginas). Analítica GA4 presente pero con ID
placeholder sin configurar (`G-XXXXXXXXXX`).

### Arquitectura actual
- **`index.html`** (624 líneas): home con 8 secciones (header/nav → hero → portafolio
  preview de 3 productos hardcodeados → testimonios → CTA → proceso → contacto → footer) +
  botón flotante de WhatsApp.
- **`portafolio.html`** (209 líneas) + **`js/portafolio.js`** (726 líneas): catálogo completo.
  `portafolio.js` contiene un array `PRODUCTOS` (~500 líneas, 26 productos) que es la
  verdadera fuente de datos — pero **no** es la que usa `index.html`, que hardcodea sus 3
  tarjetas de forma independiente y debe mantenerse sincronizada a mano.
- **`visualizador-pastel.html`** (580 líneas): cotizador de pasteles (chips de
  tamaño/sabor/relleno, subida de foto, arma un link de WhatsApp). Totalmente autocontenido:
  CSS y JS inline propios, en vez de usar los archivos compartidos.
- **`css/styles.css`** (1284 líneas): buen sistema de tokens en `:root` (colores, sombras,
  radios, tipografía), pero un bloque de ~130 líneas (`.servicios-grid`, `.cake-card`, etc.)
  es CSS muerto — no hay ninguna sección "Servicios" en el HTML actual. Breakpoints
  dispersos por sección, sin escala centralizada.
- **`js/script.js`** (277 líneas): 7 módulos (menú hamburguesa, scroll suave, scroll-reveal,
  sombra de header al hacer scroll, un helper `openWhatsApp()` que nunca se llama, flip-card
  con tilt 3D, y validación/envío de formulario).

### Duplicación encontrada (el problema central)
1. **Header/nav/footer/botón flotante de WhatsApp y todo el `<head>` de SEO** están
   copiados y pegados en las 3 páginas HTML.
2. **El número de WhatsApp** (`525610003837`) y los mensajes prellenados están hardcodeados
   de forma independiente en 8+ lugares entre HTML y JS.
3. **Los datos de producto** viven en tres sitios desconectados: el array `PRODUCTOS` en
   `portafolio.js`, las 3 tarjetas hardcodeadas en `index.html`, y las categorías sueltas en
   `visualizador-pastel.html`.
4. **La lógica de menú hamburguesa / sombra de header / flip-tilt** está copiada 3 veces
   (`script.js`, `portafolio.js`, e inline dentro de `visualizador-pastel.html`).
5. No existen páginas de detalle por producto (algo que ya estaba en la lista de deseos de
   `cambios.md` Fase 6).

### Intención del sitio
Sitio de marketing para "Espiral Dulce", estudio de repostería artesanal en Anzures, CDMX.
Venta 100% por WhatsApp, entrega a domicilio, sin tienda física ni checkout online. El
formulario de contacto hoy **no envía nada a un backend real**: guarda en `localStorage`
como respaldo y tiene una URL de Google Apps Script sin configurar (`SETUP_FORMULARIO.md`
documenta el plan: Apps Script → Google Sheets). Esto es una decisión de negocio pendiente,
no un problema de arquitectura de este sitio.

---

## Parte 2 — Arquitectura propuesta: Eleventy (11ty)

**Por qué Eleventy y no quedarse en vanilla puro**: el problema real no es el stack (HTML/CSS/JS
vanilla es correcto para este sitio, no hace falta React/Vue), es la **duplicación manual**
entre 3 páginas que ya está causando desincronización de contenido (las 3 tarjetas de
`index.html` vs. el catálogo real). Eleventy resuelve esto en build time y el resultado
final sigue siendo HTML/CSS/JS estático puro — mismo hosting, cero runtime de framework en
el navegador, cero hidratación. No es una reescritura, es quitarle el copy-paste al proceso.

### Estructura de carpetas

```
EspiralDulceWeb/
  src/
    _includes/
      layouts/
        base.njk          # <head> SEO, header, footer, botón WA flotante
        page.njk           # extiende base, envuelve {{ content }}
      partials/
        head-seo.njk
        header-nav.njk
        footer.njk
        whatsapp-float.njk
    _data/
      site.json            # teléfono, plantillas de mensaje WA, dirección, redes
      productos.json         # única fuente de verdad de productos
    css/                    # se copia tal cual (passthrough)
    js/                      # módulos ES, se copian tal cual
    images/                  # passthrough
    index.njk
    portafolio.njk
    visualizador-pastel.njk
    productos/
      producto.njk           # 1 página por producto vía paginación (fase opcional)
  .eleventy.js
  package.json
  _site/                     # salida del build (gitignored — dist/ y build/ ya están
                              #  en .gitignore, alguien ya anticipó esto)
```

### Piezas clave
- **Templating**: Nunjucks. `base.njk` centraliza head/header/footer/WA-float; cada página
  define `title`/`description`/`ogImage` en su front matter.
- **Datos de producto**: `src/_data/productos.json` reemplaza el array `PRODUCTOS` de
  `portafolio.js`. `index.html` genera sus 3 tarjetas destacadas filtrando
  `productos | destacado | limit 3` en vez de hardcodearlas; `portafolio.html` recorre el
  array completo. Agregar un producto nuevo pasa a ser "una entrada de JSON", no 50 líneas
  de HTML copiadas.
- **Config de negocio**: `src/_data/site.json` centraliza teléfono, plantillas de mensaje de
  WhatsApp, dirección y redes sociales. Los templates lo leen en build time; el JS del
  cliente lo lee del mismo JSON inlineado como `<script type="application/json">` en
  `base.njk` (sin duplicar el dato, sin request extra).
- **JS**: se parte en módulos ES nativos (`menu.js`, `header-shadow.js`, `flip-tilt.js`,
  `scroll-reveal.js`, `smooth-scroll.js`, `site-config.js`, `form.js`, `portafolio.js`,
  `visualizador.js`) cargados vía `<script type="module">` — sin bundler, los navegadores
  objetivo ya soportan módulos nativos y Eleventy solo copia los archivos.
- **CSS**: separar `styles.css` en `tokens.css` / `base.css` / `components.css` /
  `sections.css` (toque ligero, sin bundler, `<link>` simples) y borrar el bloque muerto de
  `.servicios-grid`. No se toca el diseño visual en este paso.
- **`visualizador-pastel.html`**: deja de ser una página aparte con CSS/JS inline propios;
  pasa a usar el mismo `base.njk` y sus estilos/JS se mueven a `css/visualizador.css` y
  `js/visualizador.js`.

### Qué NO cambia
Hosting (sigue siendo una carpeta estática, ahora `_site/` en vez de la raíz del repo),
diseño visual y tokens, lógica de negocio (venta por WhatsApp, sin checkout), y el
comportamiento actual del formulario (respaldo en `localStorage` + Apps Script pendiente de
configurar — eso sigue siendo una decisión aparte, documentada en `SETUP_FORMULARIO.md`).

### Plan de migración por fases

| Fase | Contenido | Tipo |
|---|---|---|
| 0 | Instalar Eleventy, `.eleventy.js`, `package.json` — sin tocar contenido. Verificar `npx eleventy` corre. | Obligatoria |
| 1 | Reconstruir `index.html` byte-a-byte desde `base.njk` + partials; CSS/JS/imágenes vía passthrough sin cambios. Verificar paridad visual y de DOM antes de seguir. | Obligatoria |
| 2 | Migrar `portafolio.html` y `visualizador-pastel.html` al mismo layout; mover el CSS/JS inline del visualizador a archivos compartidos. | Obligatoria |
| 3 | Extraer `productos.json`; generar las tarjetas de `index.html` y el catálogo de `portafolio.html` desde ahí (completa la Fase 5 de `cambios.md`). | Obligatoria |
| 4 | Consolidar JS en módulos compartidos; eliminar las 3 copias de menú/tilt/sombra. | Obligatoria |
| 5 | Separar CSS en tokens/base/componentes/secciones; borrar el bloque muerto `.servicios-grid`. | Opcional |
| 6 | Páginas de detalle por producto (paginación de Eleventy), backend real de formulario, analítica sin GA, `AggregateRating` en Schema.org. | Opcional — coincide con la Fase 6 de `cambios.md`, "platicar antes de empezar" |

Cada fase deja el sitio deployable y funcionando — mismo criterio que ya usa `cambios.md`.

### Verificación al implementar
- `npx eleventy --serve` y comparar visualmente cada página (desktop + mobile) contra el
  HTML actual antes de cada fase.
- Confirmar que las 3 tarjetas destacadas de `index.html` coinciden en contenido con las
  entradas correspondientes de `productos.json` (elimina el riesgo de desincronización).
- Revisar que el número de WhatsApp y los mensajes prellenados salgan todos de `site.json`
  (buscar `525610003837` hardcodeado no debería quedar ningún resultado fuera de
  `_data/site.json`).
- `git diff` de la salida `_site/` contra el HTML actual en la Fase 1 para confirmar
  paridad byte-a-byte antes de tocar datos.

---

## Versionado y gestión de configuración

Flujo de trabajo del repo: **GitHub Flow + rama `develop` como colchón de rollback** (no
Gitflow completo — sin `release/*` ni `hotfix/*`, sin versionado semántico).

- `main` = producción/estable. Solo recibe merges desde `develop` cuando está verificado.
- `develop` = rama de integración, base de trabajo por defecto.
- Cada feature/refactor = rama corta desde `develop` (`feat/`, `refactor/`, `fix/`,
  `chore/`) → PR hacia `develop`, revisado y aprobado antes de mergear.
- `develop` → `main` vía PR cuando se decide desplegar.
- Tag `pre-eleventy-migration` en el `main` previo a esta migración, como punto de rollback.

Config sensible (ID de GA4, URL de Google Apps Script) debe moverse a variables de entorno
(`.env`, no committeado, con `.env.example` como referencia) en cuanto Eleventy esté en el
proyecto, en vez de vivir hardcodeada en archivos trackeados como hoy.
