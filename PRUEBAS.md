# Pruebas — Espiral Dulce

Cómo se valida que el sitio sigue funcionando. Dos niveles: lo que la máquina revisa sola
(`npm test`, y el CI en cada PR) y lo que **solo tú puedes revisar** con los ojos y el mouse.

---

## 1. Pruebas automáticas

```bash
npm test        # compila el sitio y valida la salida de _site/
```

Corren contra `_site/` — o sea, contra el HTML real que recibe el navegador, no contra los
templates. Eso importa: si un refactor de plantillas genera HTML roto, la prueba lo ve.

| Prueba | Qué protege |
|---|---|
| Páginas y assets generados | Que el build no se "coma" una página o el CSS |
| Sin sintaxis de plantilla sin renderizar | Que no se escape un `{{ variable }}` literal al HTML |
| Referencias locales existen | Links, `<img src>` y `<link href>` que apuntan a archivos que sí están |
| Anclas existen | Que `#proceso`, `#contacto`, etc. lleven a una sección que existe |
| WhatsApp consistente | Que **todos** los links usen el número de `site.json` y no uno viejo pegado a mano |
| Teléfono y email | Que lo visible coincida con `site.json` |
| Toda imagen tiene `alt` | Accesibilidad y SEO |
| SEO mínimo por página | `title`, `description`, `canonical`, `og:title`, `og:image` |
| Sitemap coherente | Que no liste páginas que ya no existen |
| Chrome compartido | Que header, menú móvil, hamburguesa, footer y botón flotante estén en las 3 páginas |

Estas pruebas están **verificadas por mutación**: se rompió el sitio a propósito (borrar el
CSS, cambiar un número de WhatsApp, quitar un `alt`, romper un ancla) y en los cuatro casos
la prueba correspondiente falló. No son decorativas.

**CI**: `.github/workflows/ci.yml` corre `npm test` en cada PR hacia `develop` y `main`. Si
algo se rompe, el PR lo marca en rojo antes de que llegue a producción.

---

## 2. Revisión manual (lo que la máquina no puede ver)

Las pruebas automáticas no saben si algo **se ve bien** o si una animación se siente rara.
Eso es tuyo. Corre el sitio:

```bash
npm start     # http://localhost:8080
```

### 2.1 Recorrido por página

**Home (`/`)**
- [ ] El hero se ve completo: título, los 3 botones/stats y la imagen del cheesecake.
- [ ] Las 3 flip cards giran al hacer clic y muestran los ingredientes atrás.
- [ ] El efecto de tilt 3D al pasar el mouse por encima se siente suave, no tembloroso.
- [ ] Las secciones aparecen con la animación de scroll-reveal al bajar (no todas de golpe).
- [ ] Los degradados entre secciones se ven parejos, sin líneas duras ni saltos de color.

**Portafolio (`/portafolio.html`)**
- [ ] Cargan los 26 productos con su imagen.
- [ ] Los filtros por categoría (panes, postres, chocolates, galletas) esconden y muestran bien.
- [ ] Las flip cards giran igual que en la home.

**Visualizador (`/visualizador-pastel.html`)**
- [ ] Los chips de tamaño/sabor/relleno/ocasión se seleccionan y deseleccionan.
- [ ] La subida de foto muestra la vista previa.
- [ ] El botón final abre WhatsApp con el mensaje armado y los datos correctos.

### 2.2 Navegación y CTAs (en las 3 páginas)
- [ ] El menú hamburguesa abre y cierra en mobile, y se cierra solo al elegir un link.
- [ ] El header proyecta sombra al hacer scroll.
- [ ] Los links del nav y del footer llevan a donde dicen.
- [ ] **Cada botón de WhatsApp abre el chat con el número y el mensaje correctos.** Ojo con
      los de las flip cards: el mensaje debe traer el nombre del producto.
- [ ] El botón flotante de WhatsApp aparece **solo en mobile**.

### 2.3 Responsive
Revisa en DevTools al menos en estos anchos:
- [ ] **375px** (iPhone SE): nada se desborda horizontalmente, el texto se lee.
- [ ] **768px** (tablet): el grid del portafolio pasa a 2 columnas.
- [ ] **1440px** (desktop): el contenido no se estira feo ni queda perdido al centro.

### 2.4 Navegadores
- [ ] Chrome/Edge y Safari (los iconos de Lucide y los emojis se comportan distinto entre
      sistemas — vale la pena mirar en los dos).

---

## 3. Estado conocido (no son bugs nuevos, están en el roadmap)

Cosas que **hoy no funcionan** y que ya están contempladas en `ARQUITECTURA.md`. Anótalas
para no perseguirlas como si fueran regresiones:

- **No hay formulario de contacto en el sitio.** Ninguna página tiene un `<form>`: la sección
  de Contacto son tarjetas con links a WhatsApp, teléfono y email. Por lo tanto, las ~100
  líneas del módulo de formulario en `src/js/script.js` (validación, `localStorage`, POST a
  Apps Script) son **código muerto que nunca se ejecuta**, y lo que describe
  `SETUP_FORMULARIO.md` no está conectado a nada. Se limpia en la Fase 4.
- **Google Analytics no mide nada.** El ID sigue siendo el placeholder `G-XXXXXXXXXX`.
- **`openWhatsApp()` en `script.js` no se llama desde ningún lado** — otro resto muerto.
- **El `<title>` de `portafolio.html` tiene un guión perdido**: dice "Portafolio  Espiral
  Dulce" (doble espacio). Se corrige al migrar la página al layout, en la Fase 2.
