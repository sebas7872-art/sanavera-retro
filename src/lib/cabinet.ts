export type SystemId = "arcade" | "nes" | "md" | "sms" | "snes" | "ps1";

export type PadId = "arcade" | "nes" | "md" | "snes" | "ps1";

export type SystemDef = {
  id: SystemId;
  label: string;
  core: string;
  pad: PadId;
  query: string;
  exts: string[];
  note?: string;
};

export const SYSTEMS: SystemDef[] = [
  {
    id: "arcade",
    label: "Arcade",
    core: "mame",
    pad: "arcade",
    query: "collection:internetarcade AND mediatype:software",
    exts: [".zip"],
    note: "Elegí 2, 3, 4 o 6 botones en la pantalla de juego. Si no responden, cambiá el mapa.",
  },
  {
    id: "nes",
    label: "NES",
    core: "nes",
    pad: "nes",
    query: "collection:consolelivingroom AND emulator:nes AND mediatype:software",
    exts: [".nes", ".zip"],
  },
  {
    id: "md",
    label: "Mega Drive",
    core: "segaMD",
    pad: "md",
    query: "collection:consolelivingroom AND emulator:genesis AND mediatype:software",
    exts: [".md", ".gen", ".smd", ".bin", ".zip"],
  },
  {
    id: "sms",
    label: "Master System",
    core: "segaMS",
    pad: "nes",
    query: "collection:consolelivingroom AND emulator:sms AND mediatype:software",
    exts: [".sms", ".zip"],
    note: "Control de dos botones y Pausa.",
  },
  {
    id: "snes",
    label: "SNES",
    core: "snes",
    pad: "snes",
    query: "collection:consolelivingroom AND emulator:snes AND mediatype:software",
    exts: [".sfc", ".smc", ".zip"],
  },
  {
    id: "ps1",
    label: "PlayStation",
    core: "psx",
    pad: "ps1",
    query: "collection:psx-homebrew-library AND mediatype:software",
    exts: [".chd", ".pbp", ".cue", ".bin", ".iso", ".img", ".toc", ".ccd", ".m3u", ".zip"],
    note: "Homebrew y demos de PS1. Los archivos suelen ser grandes y tardan en cargar. Usa BIOS HLE (sin BIOS propietaria).",
  },
];

const GENERIC_HINTS = new Set([
  "nes",
  "snes",
  "genesis",
  "md",
  "sms",
  "gb",
  "arcade",
  "mame",
  "sega",
  "psx",
  "ps1",
  "playstation",
]);

export function getSystem(id: string | undefined): SystemDef {
  return SYSTEMS.find((system) => system.id === id) ?? SYSTEMS[1];
}

export type GameDoc = {
  id: string;
  title: string;
  year: string;
};

export type ArchiveFile = {
  name?: string;
  size?: string | number;
  format?: string;
};

type Ranked = { file: ArchiveFile; score: number };

const SKIP =
  /screenshot|thumb|cover|manual|flyer|__ia|torrent|\.xml$|\.sqlite$|\.pdf$|\.txt$|\.jpg$|\.jpeg$|\.png$|\.gif$|\.mp4$|\.ia\.|source|src\.|_source/i;

export function pickRom(files: ArchiveFile[], exts: string[], hint?: string): ArchiveFile | null {
  const cleanHint = (hint || "").toLowerCase().trim();
  const useHint = cleanHint.length > 0 && !GENERIC_HINTS.has(cleanHint);
  const ranked: Ranked[] = [];

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
    // Prefer compact single-file formats for browser play
    if (lower.endsWith(".chd") || lower.endsWith(".pbp") || lower.endsWith(".iso")) score += 25;
    if (lower.endsWith(".cue")) score += 15;
    // Soft penalty only for multi-gigabyte dumps (PS1 homebrew can be 50–400 MB)
    if (size > 900_000_000) score -= 80;
    else if (size > 400_000_000) score -= 20;
    if (Number.isFinite(size) && size > 0) score += Math.min(size / 5_000_000, 12);
    ranked.push({ file, score });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.file ?? null;
}

export function romUrl(id: string, name: string): string {
  const path = name
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://cors.archive.org/cors/${encodeURIComponent(id)}/${path}`;
}

export function coverUrl(id: string): string {
  return `https://archive.org/services/img/${encodeURIComponent(id)}`;
}

function asText(value: unknown): string {
  if (Array.isArray(value)) return asText(value[0]);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return value.trim();
  return "";
}

function phrase(raw: string): string {
  const clean = raw.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return `title:("${clean}")`;
}

export async function searchShelf(system: SystemDef, text: string, page: number): Promise<{
  games: GameDoc[];
  more: boolean;
}> {
  const title = phrase(text);
  const query = title
    ? `${system.query} AND ${title}`
    : `${system.query} AND downloads:[5 TO *]`;
  const params = new URLSearchParams({
    q: query,
    rows: "24",
    page: String(page),
    output: "json",
  });
  params.append("sort[]", "downloads desc");
  for (const field of ["identifier", "title", "year"]) params.append("fl[]", field);

  const response = await fetch(`https://archive.org/advancedsearch.php?${params}`);
  if (!response.ok) throw new Error("Internet Archive no respondió.");
  const data = (await response.json()) as {
    response?: { numFound?: number; start?: number; docs?: Array<Record<string, unknown>> };
  };
  const docs = data.response?.docs ?? [];
  const games = docs
    .map((doc) => ({
      id: asText(doc.identifier),
      title: asText(doc.title) || "Sin título",
      year: asText(doc.year),
    }))
    .filter((game) => game.id.length > 0);
  const start = data.response?.start ?? 0;
  const found = data.response?.numFound ?? 0;
  return { games, more: start + docs.length < found };
}

export async function resolvePlayable(id: string, system: SystemDef): Promise<{ url: string; file: string; size?: number }> {
  const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("No pude leer ese ítem.");
  const data = (await response.json()) as {
    metadata?: { emulator?: unknown; title?: unknown };
    files?: ArchiveFile[];
  };
  const hint = asText(data.metadata?.emulator);
  const file = pickRom(data.files ?? [], system.exts, hint);
  if (!file?.name) throw new Error("Ese ítem no tiene un archivo jugable.");
  const size = Number(file.size || 0);
  return { url: romUrl(id, file.name), file: file.name, size: Number.isFinite(size) ? size : undefined };
}
