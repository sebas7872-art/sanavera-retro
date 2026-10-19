import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as LoaderCircle } from "../_libs/lucide-react.mjs";
import { i as previewPathPrefix, n as Route } from "./router-DEOd79Qz.mjs";
import { i as resolvePlayable, r as getSystem } from "./cabinet-3Fkm7bHZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play._id-BsNPjphk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlayGate() {
	const { id } = Route.useParams();
	const { sys } = Route.useSearch();
	const system = getSystem(sys);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let cancel = false;
		resolvePlayable(id, system).then(({ url }) => {
			if (cancel) return;
			const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
			const params = new URLSearchParams({
				core: system.core,
				url,
				sys: system.id,
				back: `${prefix}/?sys=${system.id}`
			});
			window.location.assign(`${prefix}/player.html?${params}`);
		}).catch((reason) => {
			if (cancel) return;
			setError(reason instanceof Error ? reason.message : "No pude abrir el juego.");
		});
		return () => {
			cancel = true;
		};
	}, [id, system]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center",
		children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-sm text-base text-fg",
			children: error
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			search: {
				sys: system.id,
				fav: ""
			},
			className: "rounded-full bg-accent px-5 py-3 text-sm font-semibold text-bg",
			children: "Volver al estante"
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-4 animate-spin",
				"aria-hidden": "true"
			}), "Buscando el archivo en Internet Archive"]
		})
	});
}
//#endregion
export { PlayGate as component };
