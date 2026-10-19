import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "/workspace";
const out = join(root, "pages-dist");
mkdirSync(out, { recursive: true });

for (const file of ["player.html", "logo.jpg", "favicon.svg", "favicon-32.png"]) {
  copyFileSync(join(root, "public", file), join(out, file));
}

const guide = `CÓMO PUBLICAR SANAVERA RETRO EN GITHUB PAGES

No hace falta instalar nada. Estos archivos ya están compilados.

1. Entrá a https://github.com y creá una cuenta si no tenés.
2. Creá un repositorio nuevo. Nombre sugerido: sanavera-retro.
   Dejalo público. No marques "Add a README".
3. En el repositorio, elegí "uploading an existing file" (subir archivos).
4. Arrastrá TODO el contenido de esta carpeta, no la carpeta misma:
   - index.html tiene que quedar en la raíz del repositorio
   - player.html, logo.jpg, favicon.svg y la carpeta assets también
5. Escribí un mensaje como "Publicar Sanavera Retro" y confirmá el upload.
6. Andá a Settings → Pages.
7. En "Build and deployment", Source: Deploy from a branch.
8. Branch: main, carpeta: / (root). Guardá.
9. Esperá uno o dos minutos. GitHub te muestra el enlace.
   Va a ser parecido a:
   https://TU-USUARIO.github.io/sanavera-retro/

Abrí ese enlace en el celular o en la computadora.

Si el enlace no carga, esperá un minuto y recargá. La primera vez GitHub tarda un poco.

Los juegos salen de Internet Archive y el emulador se descarga de emulatorjs.org.
Hace falta conexión a internet. No hay que instalar Node ni compilar nada.
`;

writeFileSync(join(out, "COMO-PUBLICAR.txt"), guide);
console.log("pages assembled", out);
