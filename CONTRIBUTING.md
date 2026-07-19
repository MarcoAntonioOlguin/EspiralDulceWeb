# Guía de contribución — EspiralDulceWeb

Cómo se trabaja en este repo. El detalle de la arquitectura está en `ARQUITECTURA.md`
y las reglas de código en `CLAUDE.md`; esto es el flujo.

## Flujo de ramas

**GitHub Flow + rama `develop` como colchón** (no Gitflow completo: sin `release/*`,
sin `hotfix/*`, sin versionado semántico).

- **`main`** = producción/estable. Nunca se commitea directo; solo recibe merges
  desde `develop` vía PR, cuando se decide desplegar.
- **`develop`** = rama de integración y base de trabajo por defecto.
- Cada cambio = **rama corta desde `develop`**, con prefijo según el tipo:
  - `feat/` — funcionalidad nueva
  - `fix/` — corrección de un bug
  - `refactor/` — cambio interno sin cambio de comportamiento
  - `chore/` — documentación, CI, configuración

```
develop ← feat/mi-cambio     (PR, CI en verde, revisión → merge)
main    ← develop            (PR de despliegue, cuando se decide publicar)
```

El tag `pre-eleventy-migration` marca el último estado pre-Eleventy, como punto de
rollback histórico.

## Antes de abrir una PR

1. **Corre `npm test`** — compila el sitio y corre las 12 pruebas contra `_site/`
   (el HTML real que recibe el navegador). El CI corre lo mismo en cada PR hacia
   `develop`/`main`; una PR con CI en rojo no se mergea.
2. **Revisa manualmente lo que las pruebas no ven**: levanta `npm start` y verifica
   lo que *tu* cambio puede haber roto (que un CTA abra WhatsApp con el mensaje
   correcto, que las flip cards giren — también en Safari —, el responsive en
   DevTools).
3. **Agrega tu línea al `CHANGELOG.md`**, bajo la sección **[Sin publicar]**, con el
   número de tu PR. Si tu cambio no amerita mención (typo, ajuste de CI), dilo en la
   descripción de la PR.

## La PR

- Usa la plantilla (`.github/pull_request_template.md`). La checklist de **revisión
  manual** se llena con lo que *esa* PR puede haber roto y la máquina no puede ver —
  no pegues una checklist genérica.
- Título en español, descriptivo del cambio (mira el historial para el estilo:
  `Fase 5 — Separar el CSS en tokens/base/componentes/secciones`).
- Una PR = un tema. Si encontraste un bug no relacionado, abre otra rama.

## Reglas de código (resumen — el detalle vive en `CLAUDE.md`)

- **Nunca hardcodees el número de WhatsApp** ni datos de contacto: todo sale de
  `src/_data/site.json` (filtros `waUrl`/`waProducto` en templates, `window.waUrl()`
  en JS).
- **Productos**: solo se tocan en `src/_data/productos.json`; las tarjetas se
  generan en build-time.
- **Nada de CSS ni JS inline** en las páginas — hay una prueba que lo verifica.
- Todo el contenido visible al usuario va en **español (mexicano)**.

## Despliegue

Cuando `develop` acumula trabajo verificado y se decide publicar: PR de `develop` →
`main`. Al mergearla, renombra la sección **[Sin publicar]** del `CHANGELOG.md` con
la fecha del despliegue (eso puede ir en la misma PR de despliegue) y abre una
sección **[Sin publicar]** nueva.
