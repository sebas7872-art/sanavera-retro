import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as LoaderCircle, n as Star, r as Search } from "../_libs/lucide-react.mjs";
import { r as Route$1 } from "./router-DEOd79Qz.mjs";
import { a as searchShelf, n as coverUrl, r as getSystem, t as SYSTEMS } from "./cabinet-3Fkm7bHZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bn5Wdvdt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FAV_KEY = "vitrina.favs";
function readFavs() {
	try {
		const raw = localStorage.getItem(FAV_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.sys) : [];
	} catch {
		return [];
	}
}
function Home() {
	const { sys, fav } = Route$1.useSearch();
	const system = getSystem(sys);
	const showingFavs = fav === "1";
	const navigate = useNavigate();
	const [text, setText] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [games, setGames] = (0, import_react.useState)([]);
	const [page, setPage] = (0, import_react.useState)(1);
	const [more, setMore] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)("");
	const [favs, setFavs] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setFavs(readFavs());
	}, []);
	(0, import_react.useEffect)(() => {
		const handle = window.setTimeout(() => setQuery(text.trim()), 280);
		return () => window.clearTimeout(handle);
	}, [text]);
	(0, import_react.useEffect)(() => {
		if (showingFavs) return;
		let cancel = false;
		setLoading(true);
		setError("");
		searchShelf(system, query, 1).then((result) => {
			if (cancel) return;
			setGames(result.games);
			setMore(result.more);
			setPage(1);
		}).catch((reason) => {
			if (cancel) return;
			setGames([]);
			setError(reason instanceof Error ? reason.message : "No pude cargar el estante.");
		}).finally(() => {
			if (!cancel) setLoading(false);
		});
		return () => {
			cancel = true;
		};
	}, [
		system,
		query,
		showingFavs
	]);
	async function loadMore() {
		const next = page + 1;
		setLoading(true);
		try {
			const result = await searchShelf(system, query, next);
			setGames((current) => {
				const seen = new Set(current.map((game) => game.id));
				return [...current, ...result.games.filter((game) => !seen.has(game.id))];
			});
			setMore(result.more);
			setPage(next);
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "No pude cargar más.");
		} finally {
			setLoading(false);
		}
	}
	function toggleFav(game) {
		setFavs((current) => {
			const next = current.some((item) => item.id === game.id) ? current.filter((item) => item.id !== game.id) : [{
				id: game.id,
				title: game.title,
				year: game.year,
				sys: system.id
			}, ...current].slice(0, 80);
			localStorage.setItem(FAV_KEY, JSON.stringify(next));
			return next;
		});
	}
	const shelf = showingFavs ? favs.filter((item) => item.sys === system.id).map((item) => ({
		id: item.id,
		title: item.title,
		year: item.year
	})) : games;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex h-dvh w-full max-w-5xl flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "shrink-0 px-4 pt-5 pb-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl leading-none tracking-tight text-fg",
					children: "Vitrina"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-md text-sm leading-relaxed text-muted",
					children: "El catálogo de Internet Archive. La pantalla arriba, el joystick abajo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "size-4 shrink-0 text-muted",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: text,
						onChange: (event) => setText(event.target.value),
						placeholder: showingFavs ? "Los guardados no se buscan" : `Buscar en ${system.label}`,
						disabled: showingFavs,
						className: "w-full bg-transparent text-base text-fg outline-none placeholder:text-muted disabled:opacity-50"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2 overflow-x-auto pb-1",
					children: [SYSTEMS.map((item) => {
						const active = !showingFavs && item.id === system.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							search: {
								sys: item.id,
								fav: ""
							},
							className: "shrink-0 rounded-full border border-line px-3 py-2 text-sm font-medium " + (active ? "border-accent bg-accent text-bg" : "bg-surface text-fg"),
							children: item.label
						}, item.id);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						search: {
							sys: system.id,
							fav: "1"
						},
						className: "shrink-0 rounded-full border border-line px-3 py-2 text-sm font-medium " + (showingFavs ? "border-accent bg-accent text-bg" : "bg-surface text-fg"),
						children: "Guardados"
					})]
				}),
				system.note && !showingFavs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs leading-relaxed text-muted",
					children: system.note
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "min-h-0 flex-1 overflow-y-auto px-4 pb-8",
			children: [
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-accent",
					children: error
				}) : null,
				!loading && shelf.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-16 text-center text-sm text-muted",
					children: showingFavs ? "Todavía no guardaste nada de este estante." : "Nada con ese nombre."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
					children: shelf.map((game) => {
						const saved = favs.some((item) => item.id === game.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => navigate({
									to: "/play/$id",
									params: { id: game.id },
									search: { sys: system.id }
								}),
								className: "block w-full overflow-hidden rounded-card border border-line bg-surface text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block aspect-4/3 bg-raise",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: coverUrl(game.id),
										alt: "",
										className: "h-full w-full object-cover",
										loading: "lazy"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "line-clamp-2 text-sm font-medium leading-snug text-fg",
										children: game.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-xs text-muted",
										children: game.year || system.label
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": saved ? "Quitar de guardados" : "Guardar",
								"aria-pressed": saved,
								onClick: () => toggleFav(game),
								className: "absolute top-2 right-2 flex size-11 items-center justify-center rounded-full bg-bg/80 text-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
									className: saved ? "size-5 text-accent" : "size-5",
									fill: saved ? "currentColor" : "none"
								})
							})]
						}, game.id);
					})
				}),
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center justify-center gap-2 py-8 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": "true"
					}), "Cargando el estante"]
				}) : null,
				!showingFavs && more && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: loadMore,
					className: "mx-auto mt-4 block rounded-full bg-surface px-5 py-3 text-sm font-medium text-fg",
					children: "Cargar más"
				}) : null
			]
		})]
	});
}
//#endregion
export { Home as component };
