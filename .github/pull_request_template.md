<!--
Plantilla de PR de Espiral Dulce.
Borra las secciones que no apliquen. Las casillas [x] son cosas ya verificadas por quien
abre el PR; las [ ] son las que el revisor debe comprobar antes de mergear.
-->

## Qué cambia

<!-- 1-3 bullets. Qué hace este PR y por qué, no cómo. -->

## Qué NO cambia

<!-- Importante en refactors: qué queda intacto (diseño, URLs, comportamiento, hosting).
     Si el HTML generado no cambia, dilo aquí explícitamente. Borra esta sección si el PR
     sí cambia lo que ve el usuario. -->

## Verificación automática

- [ ] `npm test` en verde (compila y valida links, anclas, WhatsApp, `alt`, SEO, sitemap).
- [ ] CI en verde en este PR.
<!-- Si agregaste o cambiaste pruebas, di cuáles y qué protegen. -->

## Revisión manual — para el revisor

<!-- Solo lo que este PR puede haber roto y la máquina no puede ver. No pegues una checklist
     genérica: si el PR toca el portafolio, pide revisar el portafolio, no el sitio entero.
     Arranca el sitio con `npm start` → http://localhost:8080 -->

- [ ] …

<!-- Recordatorios de cosas que suelen romperse y conviene mirar cuando aplican:
     · Los CTAs de WhatsApp abren el chat con el número Y el mensaje correctos
       (los de las flip cards deben traer el nombre del producto).
     · El menú hamburguesa abre/cierra en mobile y se cierra al elegir un link.
     · Las flip cards giran y el tilt 3D se siente suave.
     · Las animaciones de scroll-reveal aparecen al bajar, no todas de golpe.
     · Responsive: 375px (sin scroll horizontal), 768px, 1440px.
     · Los degradados entre secciones no muestran líneas duras. -->

## Notas

<!-- Deuda que este PR deja abierta a propósito, decisiones que quieres discutir, o cosas
     que el revisor podría confundir con una regresión pero ya venían así. Borra si no hay. -->
