/**
 * Configuración de Eleventy — Espiral Dulce
 *
 * El sitio se escribe en `src/` y se compila a `_site/` (HTML/CSS/JS estático puro,
 * sin runtime de framework). Ver ARQUITECTURA.md para el diseño completo.
 */
const site = require('./src/_data/site.json');

module.exports = function (eleventyConfig) {
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
