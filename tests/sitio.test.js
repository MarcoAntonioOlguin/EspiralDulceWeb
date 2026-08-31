/**
 * Pruebas del sitio compilado.
 *
 * Corren contra `_site/` (la salida real del build), no contra los templates: lo que
 * se valida es lo que el navegador va a recibir. Se ejecutan con `npm test`, que
 * compila primero.
 *
 * La idea es blindar las cosas que un refactor puede romper en silencio: links rotos,
 * anclas que ya no existen, el número de WhatsApp cambiado a medias, imágenes sin alt,
 * o una variable de plantilla que se quedó sin renderizar.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const SITE = path.join(__dirname, '..', '_site');
const site = require('../src/_data/site.json');

const PAGINAS = ['index.html', 'portafolio.html', 'visualizador-pastel.html', '404.html'];

/** Carga una página del build y la devuelve parseada. */
function cargar(pagina) {
  const html = fs.readFileSync(path.join(SITE, pagina), 'utf8');
  return { html, $: cheerio.load(html) };
}

/** ¿La referencia apunta a un archivo local del sitio (y no a http, mailto, tel, #…)? */
function esLocal(ref) {
  if (!ref) return false;
  return !/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(ref);
}

/** Extrae las URLs de un atributo srcset ("a.webp 400w, b.webp 800w" → ["a.webp", "b.webp"]). */
function refsDeSrcset(srcset) {
  if (!srcset) return [];
  return srcset.split(',').map((entrada) => entrada.trim().split(/\s+/)[0]);
}

test('el build genera las páginas y los assets esperados', () => {
  for (const pagina of PAGINAS) {
    assert.ok(fs.existsSync(path.join(SITE, pagina)), `falta ${pagina}`);
  }
  for (const asset of ['manifest.json', 'robots.txt', 'sitemap.xml', 'css/tokens.css', 'css/base.css', 'css/componentes.css', 'css/secciones.css', 'js/nav.js', 'js/flip-cards.js', 'images/logos/logo_minimalista.svg', 'images/logos/icon-180.png', 'images/logos/icon-512.png']) {
    assert.ok(fs.existsSync(path.join(SITE, asset)), `falta ${asset}`);
  }
});

test('ninguna página deja sintaxis de plantilla sin renderizar', () => {
  for (const pagina of PAGINAS) {
    const { html } = cargar(pagina);
    assert.ok(!html.includes('{{'), `${pagina} tiene {{ }} sin renderizar`);
    assert.ok(!html.includes('{%'), `${pagina} tiene {% %} sin renderizar`);
  }
});

test('todas las referencias locales (css, js, imágenes, páginas) existen en el build', () => {
  const rotas = [];

  for (const pagina of PAGINAS) {
    const { $ } = cargar(pagina);

    $('[href], [src], [srcset]').each((_, el) => {
      const refs = [
        $(el).attr('href'),
        $(el).attr('src'),
        ...refsDeSrcset($(el).attr('srcset')),
      ].filter(Boolean);

      for (const ref of refs) {
        if (!esLocal(ref)) continue;

        const destino = ref.split('#')[0].split('?')[0];
        if (!destino) continue;

        if (!fs.existsSync(path.join(SITE, destino))) {
          rotas.push(`${pagina} → ${destino}`);
        }
      }
    });
  }

  assert.deepEqual(rotas, [], `referencias rotas:\n  ${rotas.join('\n  ')}`);
});

test('todas las anclas apuntan a una sección que existe — también las que cruzan de página', () => {
  // Cubre tanto "#proceso" (misma página) como "index.html#proceso" (otra página).
  // Esta última es la que se rompe en silencio: el nav de portafolio apuntaba a
  // "index.html#servicios" mucho después de que la sección Servicios dejó de existir.
  const rotas = [];

  for (const pagina of PAGINAS) {
    const { $ } = cargar(pagina);

    $('a[href*="#"]').each((_, el) => {
      const href = $(el).attr('href');
      if (/^(https?:|mailto:|tel:)/.test(href)) return;

      const [destino, id] = href.split('#');
      if (!id) return; // href="#" (el logo del nav) no navega a ningún lado

      const paginaDestino = destino === '' ? pagina : destino;
      if (!fs.existsSync(path.join(SITE, paginaDestino))) return; // ya lo cubre la prueba de refs

      const $destino = paginaDestino === pagina ? $ : cargar(paginaDestino).$;
      if ($destino(`#${id}`).length === 0) {
        rotas.push(`${pagina} → ${href}`);
      }
    });
  }

  assert.deepEqual(rotas, [], `anclas rotas:\n  ${rotas.join('\n  ')}`);
});

test('ninguna página deja CSS ni JS inline (todo va en archivos compartidos)', () => {
  for (const pagina of PAGINAS) {
    const { $ } = cargar(pagina);

    assert.equal($('style').length, 0, `${pagina}: tiene un <style> inline`);

    // Solo miramos los <script> que el navegador ejecuta como JS: los de datos
    // (application/json de la config, ld+json del Schema.org) no son lógica.
    const esJavaScript = (el) => {
      const type = $(el).attr('type');
      return !type || type === 'text/javascript' || type === 'module';
    };

    // Se permiten dos snippets que por naturaleza van inline: el de GA4 y la
    // llamada a lucide.createIcons() (necesita que el CDN ya haya cargado).
    const inline = $('script:not([src])')
      .toArray()
      .filter(esJavaScript)
      .map((el) => $(el).html().trim())
      .filter((js) => !js.includes('lucide.createIcons') && !js.includes('dataLayer'));

    assert.deepEqual(inline, [], `${pagina}: tiene lógica JS inline que debería vivir en un archivo`);
  }
});

test('todos los links de WhatsApp usan el número de site.json', () => {
  const numero = site.whatsapp.numero;
  const encontrados = new Set();

  for (const pagina of PAGINAS) {
    const { html } = cargar(pagina);
    for (const [, n] of html.matchAll(/wa\.me\/(\d+)/g)) {
      encontrados.add(n);
    }
  }

  assert.ok(encontrados.size > 0, 'no se encontró ningún link de WhatsApp en el sitio');
  assert.deepEqual(
    [...encontrados],
    [numero],
    `hay números de WhatsApp que no son el de site.json (${numero})`
  );
});

test('el teléfono y el email del sitio son los de site.json', () => {
  const { html } = cargar('index.html');
  assert.ok(html.includes(site.telefono.display), 'el teléfono visible no coincide con site.json');
  assert.ok(html.includes(`tel:${site.telefono.e164}`), 'el link tel: no coincide con site.json');
  assert.ok(html.includes(`mailto:${site.email}`), 'el link mailto: no coincide con site.json');
});

test('cada imagen tiene atributo alt (vacío si es decorativa)', () => {
  const sinAlt = [];

  for (const pagina of PAGINAS) {
    const { $ } = cargar(pagina);
    $('img').each((_, el) => {
      if ($(el).attr('alt') === undefined) {
        sinAlt.push(`${pagina} → ${$(el).attr('src')}`);
      }
    });
  }

  assert.deepEqual(sinAlt, [], `imágenes sin alt:\n  ${sinAlt.join('\n  ')}`);
});

test('las imágenes con URL absoluta (og:image, favicon, Schema.org) apuntan a un archivo real', () => {
  // og:image, apple-touch-icon, manifest.json y el image/logo del JSON-LD no se
  // arman con href/src normales (uno es meta[content], otro vive dentro de un
  // <script type="application/ld+json">) — la prueba de "referencias locales"
  // no los toca. Se rompieron en silencio una vez al pasar a imágenes optimizadas
  // con nombre generado: og:image y el logo del JSON-LD seguían apuntando al
  // PNG plano que dejó de copiarse tal cual.
  const rotas = [];

  for (const pagina of PAGINAS) {
    const { $, html } = cargar(pagina);

    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      const destino = ogImage.replace(site.url, '').replace(/^\//, '');
      if (!fs.existsSync(path.join(SITE, destino))) rotas.push(`${pagina} → og:image ${ogImage}`);
    }

    const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr('href');
    if (appleTouchIcon && !fs.existsSync(path.join(SITE, appleTouchIcon))) {
      rotas.push(`${pagina} → apple-touch-icon ${appleTouchIcon}`);
    }

    const ldJson = $('script[type="application/ld+json"]').html();
    if (ldJson) {
      const datos = JSON.parse(ldJson);
      for (const campo of ['image', 'logo']) {
        if (!datos[campo]) continue;
        const destino = datos[campo].replace(site.url, '').replace(/^\//, '');
        if (!fs.existsSync(path.join(SITE, destino))) rotas.push(`${pagina} → JSON-LD ${campo} ${datos[campo]}`);
      }
    }
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(SITE, 'manifest.json'), 'utf8'));
  for (const icono of manifest.icons) {
    if (!fs.existsSync(path.join(SITE, icono.src))) rotas.push(`manifest.json → ${icono.src}`);
  }

  assert.deepEqual(rotas, [], `referencias absolutas rotas:\n  ${rotas.join('\n  ')}`);
});

test('cada página tiene el SEO mínimo: title, description, canonical y Open Graph', () => {
  for (const pagina of PAGINAS) {
    const { $ } = cargar(pagina);

    assert.ok($('title').text().trim().length > 0, `${pagina}: <title> vacío`);
    assert.ok(
      $('meta[name="description"]').attr('content')?.trim().length > 0,
      `${pagina}: falta meta description`
    );
    assert.ok($('link[rel="canonical"]').attr('href'), `${pagina}: falta canonical`);
    assert.ok($('meta[property="og:title"]').attr('content'), `${pagina}: falta og:title`);
    assert.ok($('meta[property="og:image"]').attr('content'), `${pagina}: falta og:image`);
  }
});

test('el sitemap lista solo páginas que el build realmente genera', () => {
  const xml = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, u]) => u);

  assert.ok(urls.length > 0, 'el sitemap no tiene ninguna <loc>');

  const faltantes = urls
    .map((u) => u.replace(site.url, '').replace(/^\//, ''))
    .map((ruta) => (ruta === '' ? 'index.html' : ruta))
    .filter((ruta) => !fs.existsSync(path.join(SITE, ruta)));

  assert.deepEqual(faltantes, [], `el sitemap apunta a páginas que no existen: ${faltantes.join(', ')}`);
});

test('todas las páginas cargan el header, el footer y el botón flotante de WhatsApp', () => {
  for (const pagina of PAGINAS) {
    const { $ } = cargar(pagina);
    assert.equal($('header#header').length, 1, `${pagina}: falta el header`);
    assert.equal($('nav#mobile-nav').length, 1, `${pagina}: falta el menú móvil`);
    assert.equal($('button#hamburger').length, 1, `${pagina}: falta el botón hamburguesa`);
    assert.equal($('footer').length, 1, `${pagina}: falta el footer`);
    assert.equal($('a.wa-float').length, 1, `${pagina}: falta el botón flotante de WhatsApp`);
  }
});

test('las tarjetas de producto se generan desde productos.json (fuente única)', () => {
  // Blinda la extracción de datos de la Fase 3: el portafolio renderiza TODOS los
  // productos y el index renderiza exactamente los marcados como destacado. Si
  // alguien agrega un producto al JSON, aparece solo; si rompe el render, esto falla.
  const productos = require('../src/_data/productos.json');
  const destacados = productos.filter((p) => p.destacado);

  assert.ok(productos.length >= 20, 'productos.json trae sospechosamente pocos productos');
  assert.equal(destacados.length, 3, 'el index espera exactamente 3 productos destacados');

  const catalogo = cargar('portafolio.html').$;
  assert.equal(
    catalogo('#catalogo-grid .flip-card').length,
    productos.length,
    'el portafolio no renderiza todos los productos de productos.json'
  );

  const home = cargar('index.html').$;
  assert.equal(
    home('.portfolio-grid .flip-card').length,
    destacados.length,
    'el index no renderiza los 3 productos destacados'
  );

  // Cada producto del catálogo muestra su nombre y todos sus ingredientes.
  for (const p of productos) {
    const html = catalogo.html();
    assert.ok(html.includes(p.nombre), `el portafolio no muestra "${p.nombre}"`);
    for (const ing of p.ingredientes) {
      assert.ok(html.includes(ing), `"${p.nombre}" no muestra su ingrediente "${ing}"`);
    }
  }
});

test('el formulario de contacto existe con los campos que espera la Google Sheet', () => {
  const { $ } = cargar('index.html');

  const form = $('#contact-form');
  assert.equal(form.length, 1, 'el index no tiene el formulario #contact-form');

  // Los name= coinciden con las columnas de la Sheet (ver SETUP_FORMULARIO.md)
  for (const campo of ['nombre', 'email', 'tipo_evento', 'fecha_evento', 'personas', 'descripcion']) {
    assert.equal(
      form.find(`[name="${campo}"]`).length, 1,
      `el formulario no tiene el campo name="${campo}"`
    );
  }

  assert.equal(form.find('button[type="submit"]').length, 1, 'falta el botón de enviar');
  assert.equal($('#form-success').length, 1, 'falta el mensaje de éxito #form-success');

  // La URL del backend nunca se hardcodea en templates ni JS: viene del .env
  // vía la config inyectada (#site-config). Sin .env, queda cadena vacía.
  const config = JSON.parse($('#site-config').html());
  assert.ok('appsScriptUrl' in config, 'la config del cliente no incluye appsScriptUrl');
});
