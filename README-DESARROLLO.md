# Sanavera Retro — código fuente

Aplicación web para jugar el catálogo de Internet Archive (NES, Master System, Mega Drive, SNES y arcade).

Hay dos formas de ejecutarla:

- **Vista de desarrollo** (React + TanStack Start): `npm install` y `npm run dev`. Pensada para seguir editando la interfaz del estante.
- **Sitio estático**, el que se publica: `npm run build:pages`. Genera la carpeta `pages-dist/` con `index.html` en la raíz. Esa carpeta se sube a GitHub Pages. No usa servidor propio.

## Dónde está cada cosa

- `src/routes/index.tsx` — estante de la versión de desarrollo.
- `src/lib/cabinet.ts` — búsqueda en Internet Archive y elección del archivo jugable. Lo usan las dos versiones.
- `public/player.html` — pantalla de juego y controles táctiles. También se copia al sitio estático.
- `pages-src/` — estante de la versión publicable (HTML + un módulo que importa `cabinet.ts`).
- `vite.pages.config.ts` — compilación con rutas relativas, para que funcione dentro de un subdirectorio de GitHub Pages.

Los favoritos se guardan en el navegador, clave `vitrina.favs`. No los renombres si querés conservar los que ya existen.

## Controles

El joystick virtual manda las direcciones del pad (arriba, abajo, izquierda, derecha, diagonales).

- NES: A, B, A Turbo, B Turbo, Select, Start. Turbo pulsa el botón unas 8 veces por segundo mientras se mantiene apretado.
- Master System: 1, 2 y Pausa.
- Mega Drive: X Y Z / A B C, más Mode y Start. La asignación sigue el mapa RetroPad de Genesis Plus GX (el mismo que ya usaban A, B y C).
- SNES: X, Y, A, B, L, R, Select, Start.
- Arcade: botones 1 a 6, Ficha y 1P. Se puede dejar visibles 2, 3, 4 o 6, y cambiar entre el mapa clásico (1=B, 2=A, 3=Y…) y el alterno (1=B, 2=Y, 3=A…). Se recuerda en `sanavera.arcade`.

## Dependencias externas

Los juegos no están incluidos. El navegador los pide a Internet Archive (`archive.org` y `cors.archive.org`). El emulador se carga desde `https://cdn.emulatorjs.org/stable/data/`. Esas dos direcciones tienen que estar disponibles; no hace falta un backend propio.
