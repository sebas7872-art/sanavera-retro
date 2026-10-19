//#region node_modules/.nitro/vite/services/ssr/assets/cabinet-3Fkm7bHZ.js
var SYSTEMS = [
	{
		id: "arcade",
		label: "Arcade",
		core: "mame",
		pad: "arcade",
		query: "collection:internetarcade AND mediatype:software",
		exts: [".zip"],
		note: "Si un arcade no arranca, el ZIP de archive.org no coincide con este emulador."
	},
	{
		id: "nes",
		label: "NES",
		core: "nes",
		pad: "nes",
		query: "collection:consolelivingroom AND emulator:nes AND mediatype:software",
		exts: [".nes", ".zip"]
	},
	{
		id: "md",
		label: "Mega Drive",
		core: "segaMD",
		pad: "md",
		query: "collection:consolelivingroom AND emulator:genesis AND mediatype:software",
		exts: [
			".md",
			".gen",
			".smd",
			".bin",
			".zip"
		]
	},
	{
		id: "sms",
		label: "Master System",
		core: "segaMS",
		pad: "nes",
		query: "collection:consolelivingroom AND emulator:sms AND mediatype:software",
		exts: [".sms", ".zip"]
	},
	{
		id: "snes",
		label: "SNES",
		core: "snes",
		pad: "snes",
		query: "collection:consolelivingroom AND emulator:snes AND mediatype:software",
		exts: [
			".sfc",
			".smc",
			".zip"
		]
	}
];
var GENERIC_HINTS = /* @__PURE__ */ new Set([
	"nes",
	"snes",
	"genesis",
	"md",
	"sms",
	"gb",
	"arcade",
	"mame",
	"sega"
]);
function getSystem(id) {
	return SYSTEMS.find((system) => system.id === id) ?? SYSTEMS[1];
}
var SKIP = /screenshot|thumb|cover|manual|flyer|__ia|torrent|\.xml$|\.sqlite$|\.pdf$|\.txt$|\.jpg$|\.jpeg$|\.png$|\.gif$|\.mp4$|\.ia\./i;
function pickRom(files, exts, hint) {
	const cleanHint = (hint || "").toLowerCase().trim();
	const useHint = cleanHint.length > 0 && !GENERIC_HINTS.has(cleanHint);
	const ranked = [];
	for (const file of files) {
		const name = (file.name || "").trim();
		if (!name || SKIP.test(name) || /bios/i.test(name)) continue;
		const lower = name.toLowerCase();
		const extIndex = exts.findIndex((ext) => lower.endsWith(ext));
		if (extIndex < 0) continue;
		const base = lower.split("/").pop() || lower;
		const size = Number(file.size || 0);
		let score = (exts.length - extIndex) * 10;
		if (useHint && base === `${cleanHint}.zip`) score += 120;
		else if (useHint && base.startsWith(cleanHint)) score += 60;
		if (lower.includes("/")) score -= 8;
		if (size > 6e7) score -= 80;
		if (Number.isFinite(size)) score += Math.min(size / 2e5, 15);
		ranked.push({
			file,
			score
		});
	}
	ranked.sort((a, b) => b.score - a.score);
	return ranked[0]?.file ?? null;
}
function romUrl(id, name) {
	const path = name.split("/").filter(Boolean).map((part) => encodeURIComponent(part)).join("/");
	return `https://cors.archive.org/cors/${encodeURIComponent(id)}/${path}`;
}
function coverUrl(id) {
	return `https://archive.org/services/img/${encodeURIComponent(id)}`;
}
function asText(value) {
	if (Array.isArray(value)) return asText(value[0]);
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	if (typeof value === "string") return value.trim();
	return "";
}
function phrase(raw) {
	const clean = raw.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, " ").replace(/\s+/g, " ").trim();
	if (!clean) return "";
	return `title:("${clean}")`;
}
async function searchShelf(system, text, page) {
	const title = phrase(text);
	const query = title ? `${system.query} AND ${title}` : `${system.query} AND downloads:[40 TO *]`;
	const params = new URLSearchParams({
		q: query,
		rows: "24",
		page: String(page),
		output: "json"
	});
	params.append("sort[]", "downloads desc");
	for (const field of [
		"identifier",
		"title",
		"year"
	]) params.append("fl[]", field);
	const response = await fetch(`https://archive.org/advancedsearch.php?${params}`);
	if (!response.ok) throw new Error("Internet Archive no respondió.");
	const data = await response.json();
	const docs = data.response?.docs ?? [];
	const games = docs.map((doc) => ({
		id: asText(doc.identifier),
		title: asText(doc.title) || "Sin título",
		year: asText(doc.year)
	})).filter((game) => game.id.length > 0);
	const start = data.response?.start ?? 0;
	const found = data.response?.numFound ?? 0;
	return {
		games,
		more: start + docs.length < found
	};
}
async function resolvePlayable(id, system) {
	const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`);
	if (!response.ok) throw new Error("No pude leer ese ítem.");
	const data = await response.json();
	const hint = asText(data.metadata?.emulator);
	const file = pickRom(data.files ?? [], system.exts, hint);
	if (!file?.name) throw new Error("Ese ítem no tiene un archivo jugable.");
	return {
		url: romUrl(id, file.name),
		file: file.name
	};
}
//#endregion
export { searchShelf as a, resolvePlayable as i, coverUrl as n, getSystem as r, SYSTEMS as t };
