/**
 * Configuración de Eleventy — Espiral Dulce
 *
 * El sitio se escribe en `src/` y se compila a `_site/` (HTML/CSS/JS estático puro,
 * sin runtime de framework). Ver ARQUITECTURA.md para el diseño completo.
 *
 * Estado: Fase 0 — solo el andamiaje del build. Las plantillas, los datos y el
 * passthrough de assets llegan en las fases siguientes.
 */
module.exports = function (eleventyConfig) {
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
