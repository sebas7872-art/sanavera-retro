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

/**
 * Curated PS1 titles with an explicit Archive.org file path.
 * Prefer individual games with single-file disc images (ISO/CHD/PBP).
 * Collections, BIOS dumpers, tools and untested multi-track dumps are excluded.
 */
export type Ps1Entry = {
  id: string;
  title: string;
  year: string;
  file: string;
  /** Optional short note shown only in code comments / future UI */
  kind?: "iso" | "zip";
};

export const PS1_VERIFIED: Ps1Entry[] = [
  {
    id: "doukutsu_test5_2",
    title: "DoukutsuPSX (Cave Story port)",
    year: "2021",
    file: "doukutsu_test5_2.iso",
    kind: "iso",
  },
  {
    id: "dark-souls",
    title: "Dark Souls (homebrew)",
    year: "2010",
    file: "DarkSouls.iso",
    kind: "iso",
  },
  {
    id: "fromage-0.93e",
    title: "Fromage",
    year: "2021",
    file: "fromage-0.93e.zip",
    kind: "zip",
  },
  {
    id: "Yarmico2",
    title: "Yarmico 2",
    year: "2022",
    file: "yarmico2.zip",
    kind: "zip",
  },
  {
    id: "psx_rocksngems",
    title: "Rocks'n'Gems",
    year: "1994",
    file: "psx_rocksngems.zip",
    kind: "zip",
  },
  {
    id: "hover_202203",
    title: "Hover Racing (Net Yaroze)",
    year: "1997",
    file: "HOVER120.zip",
    kind: "zip",
  },
  {
    id: "nu-pogodi-11",
    title: "Nu, Pogodi! 11",
    year: "2021",
    file: "NuPogodi_11.zip",
    kind: "zip",
  },
];

const PS1_BY_ID = new Map(PS1_VERIFIED.map((entry) => [entry.id, entry]));

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
    // Curated list only — query unused for searchShelf when id is ps1
    query: "collection:psx-homebrew-library AND mediatype:software",
    exts: [".iso", ".chd", ".pbp", ".bin", ".cue", ".img", ".zip"],
    note: "Catálogo curado de homebrew/demos individuales. Preferí los ISO; algunos ZIP pueden tardar o no arrancar según el emulador.",
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
  /screenshot|thumb|cover|manual|flyer|__ia|torrent|\.xml$|\.sqlite$|\.pdf$|\.txt$|\.jpg$|\.jpeg$|\.png$|\.gif$|\.mp4$|\.ia\.|source|src\.|_source|bios/i;

const BAD_PS1_TITLE =
  /\b(collection|compil|bios|dumper|boot\s*cd|hacker\s*kit|music\s*disk|sdk|trainer|test\s*suite|emulator|graphics\s*demo|net\s*yaroze\s*collection|\d+\s*in\s*1|import\s*player|tool)\b/i;

export function pickRom(files: ArchiveFile[], exts: string[], hint?: string): ArchiveFile | null {
  const cleanHint = (hint || "").toLowerCase().trim();
  const useHint = cleanHint.length > 0 && !GENERIC_HINTS.has(cleanHint);
  const ranked: Ranked[] = [];

  for (const file of files) {
    const name = (file.name || "").trim();
    if (!name || SKIP.test(name)) continue;
    const lower = name.toLowerCase();
    const extIndex = exts.findIndex((ext) => lower.endsWith(ext));
    if (extIndex < 0) continue;
    const base = lower.split("/").pop() || lower;
    const size = Number(file.size || 0);
    let score = (exts.length - extIndex) * 10;
    if (useHint && base === `${cleanHint}.zip`) score += 120;
    else if (useHint && base.startsWith(cleanHint)) score += 60;
    if (lower.includes("/")) score -= 8;
    if (lower.endsWith(".chd") || lower.endsWith(".pbp") || lower.endsWith(".iso")) score += 40;
    if (lower.endsWith(".cue")) score -= 30; // never pick cue alone
    if (lower.endsWith(".bin") && files.some((f) => (f.name || "").toLowerCase().endsWith(".cue"))) {
      score -= 15; // multi-track sets are unreliable in browser
    }
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

function searchPs1Curated(text: string, page: number): { games: GameDoc[]; more: boolean } {
  const needle = text.trim().toLowerCase();
  const filtered = PS1_VERIFIED.filter((entry) => {
    if (BAD_PS1_TITLE.test(entry.title)) return false;
    if (!needle) return true;
    return entry.title.toLowerCase().includes(needle) || entry.id.toLowerCase().includes(needle);
  });
  const rows = 24;
  const start = Math.max(0, (page - 1) * rows);
  const slice = filtered.slice(start, start + rows);
  return {
    games: slice.map((entry) => ({ id: entry.id, title: entry.title, year: entry.year })),
    more: start + slice.length < filtered.length,
  };
}

export async function searchShelf(system: SystemDef, text: string, page: number): Promise<{
  games: GameDoc[];
  more: boolean;
}> {
  if (system.id === "ps1") {
    return searchPs1Curated(text, page);
  }

  const title = phrase(text);
  const query = title
    ? `${system.query} AND ${title}`
    : `${system.query} AND downloads:[40 TO *]`;
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
  // PS1: only curated entries with an explicit file path
  if (system.id === "ps1") {
    const entry = PS1_BY_ID.get(id);
    if (!entry) {
      throw new Error("Ese título no está en el catálogo verificado de PlayStation.");
    }
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error("No pude leer ese ítem en Internet Archive.");
    const data = (await response.json()) as { files?: ArchiveFile[] };
    const files = data.files ?? [];
    const match = files.find((f) => (f.name || "") === entry.file);
    if (!match?.name) {
      throw new Error("El archivo verificado ya no está disponible en Archive.");
    }
    const size = Number(match.size || 0);
    if (Number.isFinite(size) && size > 0 && size < 64_000) {
      throw new Error("El archivo es demasiado pequeño para ser un juego de PS1.");
    }
    return {
      url: romUrl(id, match.name),
      file: match.name,
      size: Number.isFinite(size) ? size : undefined,
    };
  }

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
