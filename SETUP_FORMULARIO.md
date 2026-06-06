# Setup del formulario de contacto — Google Sheets + Apps Script

Pasos para que los pedidos del formulario lleguen a una Google Sheet en tu cuenta de Google business.

## 1. Crea la Google Sheet

1. Abre Google Drive con tu cuenta business.
2. Click derecho → **Nuevo** → **Hojas de cálculo**.
3. Nombra la hoja: `Pedidos Espiral Dulce`.
4. En la primera fila, pon estos encabezados (columna A a H):

   | timestamp | nombre | email | tipo_evento | fecha_evento | personas | descripcion | enviado_en |

5. Anota el ID de la Sheet — está en la URL:
   `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`

## 2. Crea el Apps Script

1. En esa misma Google Sheet, ve a **Extensiones → Apps Script**.
2. Borra todo el código que aparece.
3. Pega este código:

```javascript
const SHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_SHEET';
const SHEET_NAME = 'Hoja 1'; // O el nombre exacto de tu hoja
const NOTIFY_EMAIL = 'tu-correo@gmail.com'; // Opcional: déjalo vacío si no quieres notificación

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.nombre || '',
      data.email || '',
      data.tipo_evento || '',
      data.fecha_evento || '',
      data.personas || '',
      data.descripcion || '',
      new Date().toISOString(),
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: `Nuevo pedido — ${data.nombre}`,
        body: `Nuevo pedido de Espiral Dulce:\n\n` +
              `Nombre: ${data.nombre}\n` +
              `Email: ${data.email}\n` +
              `Tipo de evento: ${data.tipo_evento}\n` +
              `Fecha: ${data.fecha_evento}\n` +
              `Personas: ${data.personas}\n` +
              `Descripción: ${data.descripcion}\n`,
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Reemplaza `PEGA_AQUI_EL_ID_DE_TU_SHEET` con el ID que anotaste.
5. Reemplaza `tu-correo@gmail.com` con tu correo (o déjalo en cadena vacía `''` si no quieres notificaciones).
6. Guarda (Ctrl+S / Cmd+S).

## 3. Publica como Web App

1. Click en **Implementar → Nueva implementación**.
2. En "Tipo", click el engrane → selecciona **Aplicación web**.
3. Configura:
   - Descripción: `Form Espiral Dulce`
   - Ejecutar como: **Tú** (tu cuenta business)
   - Quién tiene acceso: **Cualquier persona** (importante — sin esto el form web no puede llegar)
4. Click **Implementar**.
5. Google te pedirá autorizar permisos — acepta.
6. **Copia la URL** que te da. Se ve así:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Pega la URL en el código del sitio

1. Abre `js/script.js`.
2. Busca la línea `const APPS_SCRIPT_URL = 'PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT';`
3. Reemplaza `'PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT'` con la URL real entre comillas.
4. Guarda.

## 5. Prueba

1. Abre `index.html` en el navegador.
2. Llena el formulario de contacto y envía.
3. Revisa tu Google Sheet — debería aparecer una fila nueva.
4. Si pusiste correo de notificación, revisa tu Gmail.

## Si actualizas el código del Apps Script

Cada vez que cambies el `.gs`, debes **redeployar**:
- Implementar → **Administrar implementaciones** → engrane → Nueva versión → Implementar.
- La URL **NO cambia** entre versiones.

## Backup automático

El sitio guarda cada envío también en `localStorage` del navegador del visitante, como respaldo en caso de que Apps Script falle. Para verlo en DevTools: Application → Local Storage → `espiraldulce_submissions`.

## Límites

Apps Script tiene cuotas generosas para uso normal:
- 6 min de ejecución por request (más que suficiente).
- ~20,000 envíos de email/día con cuenta Google Workspace.
- Sin límite práctico de filas en la Sheet.
