import { SYSTEMS, coverUrl, getSystem, resolvePlayable, searchShelf } from "../src/lib/cabinet.ts";

const FAV_KEY = "vitrina.favs";
const params = new URLSearchParams(location.search);
const system = getSystem(params.get("sys") || "nes");
const showingFavs = params.get("fav") === "1";

const q = document.querySelector("#q");
const tabs = document.querySelector("#tabs");
const note = document.querySelector("#note");
const error = document.querySelector("#error");
const empty = document.querySelector("#empty");
const grid = document.querySelector("#grid");
const status = document.querySelector("#status");
const moreBtn = document.querySelector("#more");

let page = 1;
let more = false;
let query = "";
let loading = false;

function readFavs() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((item) => item && item.id && item.sys) : [];
  } catch {
    return [];
  }
}

let favs = readFavs();

function esc(value) {
  return String(value)
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "#39;");
}

function href(sys, fav) {
  const next = new URLSearchParams();
  next.set("sys", sys);
  if (fav) next.set("fav", "1");
  return `./index.html?${next}`;
}

function renderTabs() {
  const chips = SYSTEMS.map(
    (item) => `<a class="${!showingFavs && item.id === system.id ? "on" : ""}" href="${href(item.id, false)}">${esc(item.label)}</a>`,
  );
  chips.push(`<a class="${showingFavs ? "on" : ""}" href="${href(system.id, true)}">Guardados</a>`);
  tabs.innerHTML = chips.join("");
  note.hidden = showingFavs || !system.note;
  note.textContent = system.note || "";
  q.disabled = showingFavs;
  q.placeholder = showingFavs ? "Los guardados no se buscan" : `Buscar en ${system.label}`;
}

function star(on) {
  return on
    ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1L3.2 9.4l6.1-.9L12 3z"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1L3.2 9.4l6.1-.9L12 3z"/></svg>';
}

function renderGames(games) {
  grid.innerHTML = games
    .map((game) => {
      const saved = favs.some((item) => item.id === game.id);
      return `<li class="card">
        <button class="open" type="button" data-id="${esc(game.id)}">
          <span class="cover"><img alt="" src="${esc(coverUrl(game.id))}" loading="lazy" /></span>
          <span class="meta"><span class="title">${esc(game.title)}</span><span class="year">${esc(game.year || system.label)}</span></span>
        </button>
        <button class="fav${saved ? " on" : ""}" type="button" data-fav="${esc(game.id)}" data-title="${esc(game.title)}" data-year="${esc(game.year || "")}" aria-label="${saved ? "Quitar de guardados" : "Guardar"}">${star(saved)}</button>
      </li>`;
    })
    .join("");
}

function shelfFromFavs() {
  return favs
    .filter((item) => item.sys === system.id)
    .map((item) => ({ id: item.id, title: item.title, year: item.year }));
}

async function load(reset) {
  if (showingFavs) {
    const games = shelfFromFavs();
    renderGames(games);
    empty.hidden = games.length > 0;
    empty.textContent = "Todavía no guardaste nada de este estante.";
    status.hidden = true;
    moreBtn.hidden = true;
    return;
  }
  loading = true;
  error.hidden = true;
  status.hidden = false;
  moreBtn.hidden = true;
  if (reset) grid.innerHTML = "";
  try {
    const result = await searchShelf(system, query, reset ? 1 : page);
    page = reset ? 1 : page;
    more = result.more;
    if (reset) renderGames(result.games);
    else {
      const seen = new Set([...grid.querySelectorAll("[data-id]")].map((node) => node.dataset.id));
      const extra = result.games.filter((game) => !seen.has(game.id));
      grid.insertAdjacentHTML(
        "beforeend",
        extra
          .map((game) => {
            const saved = favs.some((item) => item.id === game.id);
            return `<li class="card">
              <button class="open" type="button" data-id="${esc(game.id)}">
                <span class="cover"><img alt="" src="${esc(coverUrl(game.id))}" loading="lazy" /></span>
                <span class="meta"><span class="title">${esc(game.title)}</span><span class="year">${esc(game.year || system.label)}</span></span>
              </button>
              <button class="fav${saved ? " on" : ""}" type="button" data-fav="${esc(game.id)}" data-title="${esc(game.title)}" data-year="${esc(game.year || "")}" aria-label="${saved ? "Quitar de guardados" : "Guardar"}">${star(saved)}</button>
            </li>`;
          })
          .join(""),
      );
    }
    const count = grid.children.length;
    empty.hidden = count > 0;
    empty.textContent = "Nada con ese nombre.";
    moreBtn.hidden = !more;
  } catch (reason) {
    error.hidden = false;
    error.textContent = reason instanceof Error ? reason.message : "No pude cargar el estante.";
    if (reset) grid.innerHTML = "";
    empty.hidden = true;
  } finally {
    loading = false;
    status.hidden = true;
  }
}

grid.addEventListener("click", async (event) => {
  const fav = event.target.closest("[data-fav]");
  if (fav) {
    const id = fav.dataset.fav;
    const exists = favs.some((item) => item.id === id);
    favs = exists
      ? favs.filter((item) => item.id !== id)
      : [{ id, title: fav.dataset.title, year: fav.dataset.year, sys: system.id }, ...favs].slice(0, 80);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    if (showingFavs) {
      load(true);
      return;
    }
    const nowSaved = !exists;
    fav.classList.toggle("on", nowSaved);
    fav.innerHTML = star(nowSaved);
    fav.setAttribute("aria-label", nowSaved ? "Quitar de guardados" : "Guardar");
    return;
  }
  const open = event.target.closest("[data-id]");
  if (!open || loading) return;
  open.disabled = true;
  error.hidden = true;
  try {
    const playable = await resolvePlayable(open.dataset.id, system);
    if (system.id === "ps1" && playable.size && playable.size > 20_000_000) {
      const mb = Math.round(playable.size / 1_000_000);
      const ok = window.confirm(
        `Este juego pesa unos ${mb} MB. En el celular puede tardar varios minutos en descargar. ¿Continuar?`,
      );
      if (!ok) {
        open.disabled = false;
        return;
      }
    }
    const back = `index.html?sys=${encodeURIComponent(system.id)}`;
    const next = new URLSearchParams({
      core: system.core,
      url: playable.url,
      sys: system.id,
      back,
    });
    location.href = `./player.html?${next}`;
  } catch (reason) {
    error.hidden = false;
    error.textContent = reason instanceof Error ? reason.message : "No pude abrir el juego.";
    open.disabled = false;
  }
});

moreBtn.addEventListener("click", () => {
  if (loading || !more) return;
  page += 1;
  load(false);
});

let timer = 0;
q.addEventListener("input", () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    query = q.value.trim();
    page = 1;
    load(true);
  }, 280);
});

renderTabs();
load(true);
