/**
 * Configuración de Eleventy — Espiral Dulce
 *
 * El sitio se escribe en `src/` y se compila a `_site/` (HTML/CSS/JS estático puro,
 * sin runtime de framework). Ver ARQUITECTURA.md para el diseño completo.
 */
const fs = require('fs');
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
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/manifest.json');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/sitemap.xml');

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
