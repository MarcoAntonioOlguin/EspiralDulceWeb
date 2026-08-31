/**
 * Configuración de Eleventy — Espiral Dulce
 *
 * El sitio se escribe en `src/` y se compila a `_site/` (HTML/CSS/JS estático puro,
 * sin runtime de framework). Ver ARQUITECTURA.md para el diseño completo.
 */
const fs = require('fs');
const Image = require('@11ty/eleventy-img').default;
const site = require('./src/_data/site.json');

/**
 * Config de entorno (ver .env.example): GA4_ID y APPS_SCRIPT_URL.
 * Se lee de `.env` si existe; las variables de entorno del proceso (CI,
 * hosting) tienen prioridad. Sin dependencias — el parseo es KEY=valor.
 */
function leerEnv() {
  const env = {};
  try {
    for (const linea of fs.readFileSync('.env', 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !m[0].trim().startsWith('#')) env[m[1]] = m[2];
    }
  } catch {
    /* sin .env — se usan solo las variables del proceso */
  }
  for (const clave of ['GA4_ID', 'APPS_SCRIPT_URL']) {
    if (process.env[clave] !== undefined) env[clave] = process.env[clave];
  }
  return env;
}

module.exports = function (eleventyConfig) {
  const env = leerEnv();

  // `env` queda disponible en los templates (p. ej. GA4 condicional en head-seo).
  eleventyConfig.addGlobalData('env', env);

  /**
   * Config que se inyecta al JS del cliente como JSON (#site-config):
   * el mismo site.json de los templates + la URL del Apps Script del .env.
   * Así ni el número de WhatsApp ni la URL del backend se hardcodean en JS.
   */
  eleventyConfig.addFilter('clientConfig', (siteObj) => {
    return JSON.stringify({ ...siteObj, appsScriptUrl: env.APPS_SCRIPT_URL || '' });
  });
  // Assets: se copian tal cual, sin procesar.
  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/js');
  eleventyConfig.addPassthroughCopy('src/manifest.json');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/sitemap.xml');

  // El favicon SVG se sirve tal cual (ya es vectorial, no hay nada que optimizar).
  eleventyConfig.addPassthroughCopy('src/images/logos/logo_minimalista.svg');

  /**
   * Imágenes: en vez de copiar src/images tal cual (las fotos de producto pesan
   * 1.6-4.2MB cada una, muy por encima del tamaño real al que se muestran),
   * @11ty/eleventy-img las redimensiona al ancho que realmente se usa en pantalla
   * y genera WebP (con PNG como fallback, ambos con canal alfa) en build-time.
   *
   * Se resuelve por completo en addGlobalData (no como shortcode de Nunjucks):
   * los shortcodes async de Nunjucks no sobreviven dentro de {% include %} ni
   * {% macro %} (limitación conocida de Eleventy/Nunjucks) y producto-card.njk
   * es justo un include dentro de un for. addGlobalData sí espera promesas de
   * forma nativa, así que el <picture> de cada imagen se arma una vez al
   * arrancar el build y los templates solo hacen una lectura síncrona.
   */
  async function imagenHTML(src, alt, widths, atributosExtra = {}) {
    const metadata = await Image(`src/${src}`, {
      widths,
      formats: ['webp', 'png'],
      outputDir: '_site/images/optimizadas/',
      urlPath: 'images/optimizadas/',
      sharpPngOptions: { compressionLevel: 9, quality: 80 },
      sharpWebpOptions: { quality: 75 },
    });
    return Image.generateHTML(metadata, {
      alt,
      sizes: '100vw',
      loading: 'lazy',
      decoding: 'async',
      ...atributosExtra,
    });
  }

  eleventyConfig.addGlobalData('imagenes', async () => {
    const productos = require('./src/_data/productos.json');

    const sizesProducto =
      '(max-width: 480px) 88vw, (max-width: 780px) 44vw, (max-width: 1100px) 30vw, 300px';
    const porProducto = {};
    for (const p of productos) {
      porProducto[p.id] = await imagenHTML(p.imagen, p.nombre, [420, 760], { sizes: sizesProducto });
    }

    return {
      productos: porProducto,
      hero: await imagenHTML(
        'images/hero.png',
        'Cheesecake de zarzamora artesanal de Espiral Dulce',
        [600, 1000],
        { sizes: '(max-width: 900px) 90vw, 550px', loading: 'eager' }
      ),
      navLogo: await imagenHTML('images/logos/logo_final_sin_letras.png', '', [84], {
        sizes: '42px',
        loading: 'eager',
        'aria-hidden': 'true',
      }),
      footerLogo: await imagenHTML(
        'images/logos/logo_final.png',
        `${site.nombre} — Repostería Artesanal`,
        [150, 300],
        { sizes: '150px' }
      ),
      // El "0" de la página 404 — decorativo, alt vacío (el contenedor ya lleva aria-hidden).
      error404: await imagenHTML('images/portafolio/alfajores_sin_fondo.png', '', [140, 280], {
        sizes: '(max-width: 480px) 64px, 112px',
        loading: 'eager',
      }),
    };
  });

  /**
   * Íconos de PWA/favicon: el logo fuente es 2048×2048 (4.2MB) pero
   * apple-touch-icon y el ícono del manifest solo necesitan 180px/512px.
   *
   * Imagen de Open Graph: crawlers de redes sociales (WhatsApp, Facebook) piden
   * la URL de `og:image` directamente — no leen srcset — así que necesita una
   * ruta fija y predecible, igual que los íconos.
   *
   * Ambas se generan una vez al inicio del build con nombres fijos (manifest.json
   * y el front matter de `ogImage` no son plantillas, necesitan rutas conocidas).
   */
  eleventyConfig.on('eleventy.before', async () => {
    await Image('src/images/logos/logo_final_sin_letras.png', {
      widths: [180, 512],
      formats: ['png'],
      outputDir: '_site/images/logos/',
      urlPath: 'images/logos/',
      filenameFormat: (id, srcPath, width, format) => `icon-${width}.${format}`,
      sharpPngOptions: { compressionLevel: 9, quality: 80 },
    });
    await Image('src/images/hero.png', {
      widths: [1200],
      formats: ['png'],
      outputDir: '_site/images/',
      urlPath: 'images/',
      sharpPngOptions: { compressionLevel: 9, quality: 80 },
      filenameFormat: () => 'og-image.png',
    });
  });

  /**
   * Link de WhatsApp con mensaje prellenado.
   * El número vive solo en `src/_data/site.json` — no se hardcodea en ningún template.
   *   {{ site.whatsapp.mensajes.pedido | waUrl }}
   */
  eleventyConfig.addFilter('waUrl', (mensaje) => {
    return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensaje)}`;
  });

  /**
   * Link de WhatsApp para pedir un producto concreto, usando la plantilla de
   * mensaje de site.json.
   *   {{ 'Panque de Zanahoria' | waProducto }}
   */
  eleventyConfig.addFilter('waProducto', (nombre) => {
    const mensaje = site.whatsapp.mensajes.producto.replace('{producto}', nombre);
    return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensaje)}`;
  });

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    // Nunjucks para todo: layouts, partials y páginas.
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['njk', 'html', 'md'],
  };
};
