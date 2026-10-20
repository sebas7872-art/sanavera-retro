import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "pages-dist");
mkdirSync(out, { recursive: true });

// Vite puts the entry HTML under pages-dist/pages-src/ because the input is pages-src/index.html.
// Move it to the root of pages-dist and fix relative asset paths (../assets -> ./assets).
const nestedIndex = join(out, "pages-src", "index.html");
const rootIndex = join(out, "index.html");
if (existsSync(nestedIndex)) {
  let html = readFileSync(nestedIndex, "utf8");
  // Vite emits paths relative to pages-src/, e.g. ../assets/index-xxxx.js
  html = html.replaceAll("../assets/", "./assets/");
  html = html.replaceAll('src="../', 'src="./");
  html = html.replaceAll("href=\"../", "href=\"./");
  writeFileSync(rootIndex, html);
  try {
    rmSync(join(out, "pages-src"), { recursive: true, force: true });
  } catch {
    // ignore
  }
}

for (const file of ["player.html", "logo.jpg", "favicon.svg", "favicon-32.png"]) {
  copyFileSync(join(root, "public", file), join(out, file));
}

const guide = `COMO PUBLICAR SANAVERA RETRO EN GITHUB PAGES

No hace falta instalar nada. Estos archivos ya estan compilados.

1. Entra a https://github.com y crea una cuenta si no tenes.
2. Crea un repositorio nuevo. Nombre sugerido: sanavera-retro.
   Dejalo publico. No marques "Add a README".
3. En el repositorio, elegi "uploading an existing file" (subir archivos).
4. Arrastra TODO el contenido de esta carpeta, no la carpeta misma:
   - index.html tiene que quedar en la raiz del repositorio
   - player.html, logo.jpg, favicon.svg y la carpeta assets tambien
5. Escribi un mensaje como "Publicar Sanavera Retro" y confirma el upload.
6. Anda a Settings -> Pages.
7. En "Build and deployment", Source: Deploy from a branch.
8. Branch: main, carpeta: / (root). Guarda.
9. Espera uno o dos minutos. GitHub te muestra el enlace.
   Va a ser parecido a:
   https://TU-USUARIO.github.io/sanavera-retro/

Abri ese enlace en el celular o en la computadora.

Si el enlace no carga, espera un minuto y recarga. La primera vez GitHub tarda un poco.

Los juegos salen de Internet Archive y el emulador se descarga de emulatorjs.org.
Hace falta conexion a internet. No hay que instalar Node ni compilar nada.
`;

writeFileSync(join(out, "COMO-PUBLICAR.txt"), guide);
console.log("pages assembled", out);
