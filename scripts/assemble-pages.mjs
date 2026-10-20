import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  html = html.split("../assets/").join("./assets/");
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

const guide = [
  "COMO PUBLICAR SANAVERA RETRO EN GITHUB PAGES",
  "",
  "No hace falta instalar nada. Estos archivos ya estan compilados.",
  "",
  "Los juegos salen de Internet Archive y el emulador se descarga de emulatorjs.org.",
  "Hace falta conexion a internet. No hay que instalar Node ni compilar nada.",
].join("\n");

writeFileSync(join(out, "COMO-PUBLICAR.txt"), guide);
console.log("pages assembled", out);
