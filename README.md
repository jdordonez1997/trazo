# Trazo · Editor de flujogramas

App en español que funciona con HTML, CSS y JavaScript. No requiere instalación, compilación, servidor propio ni claves de acceso.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo, `trazo`).
2. Descomprime el ZIP. Sube sus archivos directamente a la raíz del repositorio: `index.html`, `style.css`, `app.js`, `.nojekyll` y este `README.md`. No subas únicamente el ZIP ni coloques los archivos dentro de otra carpeta.
3. Guarda los archivos en la rama `main`.
4. En el repositorio, entra en **Settings → Pages**.
5. En **Build and deployment → Source**, elige **Deploy from a branch**.
6. Selecciona **main** y **/(root)** y pulsa **Save**.
7. Cuando termine la publicación, abre la dirección que muestre GitHub Pages. Habitualmente será `https://TU-USUARIO.github.io/trazo/`.

Guía oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Funciones

- Figuras y texto libre; conexiones con flechas.
- Texto, negrita, resaltado, tamaño y colores.
- Selección múltiple con Ctrl+clic o Shift+clic; arrastre de grupos.
- Ctrl+A, copiar y pegar, duplicar, eliminar, deshacer y rehacer.
- Guardado automático en el navegador y archivos JSON para guardar y abrir diagramas.
- Exportación SVG y PDF en una hoja A4 horizontal.

## Tus diagramas

Los diagramas se guardan en el navegador de cada dispositivo, no en el repositorio ni en una cuenta compartida. Para pasar tus avances desde la app anterior, usa **Guardar archivo** y luego **Abrir** en la nueva dirección. Conserva copias JSON de tu trabajo.

El PDF incluye una imagen del diagrama; para conservar la edición utiliza JSON, y para una imagen vectorial utiliza SVG.

## Uso local y cambios

También puedes abrir `index.html` con Chrome o Edge, manteniendo `style.css` y `app.js` en la misma carpeta. Para actualizar el sitio, sustituye los archivos de la rama publicada.

Este paquete contiene solo la aplicación y esta guía; no incluye diagramas personales ni credenciales. La disponibilidad de GitHub Pages depende del plan y las políticas de tu cuenta. La publicación estándar de Pages es pública; no equivale al acceso privado del sitio original.
