import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle, Search, Star } from "lucide-react";
import { coverUrl, getSystem, searchShelf, SYSTEMS, type GameDoc, type SystemId } from "@/lib/cabinet";

type HomeSearch = { sys: string; fav: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    sys: typeof search.sys === "string" ? search.sys : "nes",
    fav: search.fav === "1" ? "1" : "",
  }),
  component: Home,
});

type Saved = { id: string; title: string; year: string; sys: SystemId };

const FAV_KEY = "vitrina.favs";

function readFavs(): Saved[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? (JSON.parse(raw) as Saved[]) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.sys) : [];
  } catch {
    return [];
  }
}

function Home() {
  const { sys, fav } = Route.useSearch();
  const system = getSystem(sys);
  const showingFavs = fav === "1";
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<GameDoc[]>([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favs, setFavs] = useState<Saved[]>([]);

  useEffect(() => {
    setFavs(readFavs());
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setQuery(text.trim()), 280);
    return () => window.clearTimeout(handle);
  }, [text]);

  useEffect(() => {
    if (showingFavs) return;
    let cancel = false;
    setLoading(true);
    setError("");
    searchShelf(system, query, 1)
      .then((result) => {
        if (cancel) return;
        setGames(result.games);
        setMore(result.more);
        setPage(1);
      })
      .catch((reason: unknown) => {
        if (cancel) return;
        setGames([]);
        setError(reason instanceof Error ? reason.message : "No pude cargar el estante.");
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [system, query, showingFavs]);

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
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "No pude cargar más.");
    } finally {
      setLoading(false);
    }
  }

  function toggleFav(game: GameDoc) {
    setFavs((current) => {
      const exists = current.some((item) => item.id === game.id);
      const next = exists
        ? current.filter((item) => item.id !== game.id)
        : [{ id: game.id, title: game.title, year: game.year, sys: system.id }, ...current].slice(0, 80);
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }

  const shelf = showingFavs
    ? favs.filter((item) => item.sys === system.id).map((item) => ({ id: item.id, title: item.title, year: item.year }))
    : games;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-5xl flex-col">
      <header className="shrink-0 px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="" className="size-14 rounded-2xl border border-line object-cover" />
          <div>
            <h1 className="font-display text-[1.7rem] leading-none tracking-tight text-fg">Sanavera Retro</h1>
            <p className="mt-1 text-[0.68rem] font-semibold tracking-[0.18em] text-accent uppercase">Sala de juegos</p>
          </div>
        </div>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          El catálogo de Internet Archive. La pantalla arriba, el joystick abajo.
        </p>
        <label className="mt-4 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2">
          <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={showingFavs ? "Los guardados no se buscan" : `Buscar en ${system.label}`}
            disabled={showingFavs}
            className="w-full bg-transparent text-base text-fg outline-none placeholder:text-muted disabled:opacity-50"
          />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {SYSTEMS.map((item) => {
            const active = !showingFavs && item.id === system.id;
            return (
              <Link
                key={item.id}
                to="/"
                search={{ sys: item.id, fav: "" }}
                className={
                  "shrink-0 rounded-full border border-line px-3 py-2 text-sm font-medium " +
                  (active ? "border-accent bg-accent text-bg" : "bg-surface text-fg")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/"
            search={{ sys: system.id, fav: "1" }}
            className={
              "shrink-0 rounded-full border border-line px-3 py-2 text-sm font-medium " +
              (showingFavs ? "border-accent bg-accent text-bg" : "bg-surface text-fg")
            }
          >
            Guardados
          </Link>
        </div>
        {system.note && !showingFavs ? <p className="mt-2 text-xs leading-relaxed text-muted">{system.note}</p> : null}
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        {error ? <p className="mb-3 text-sm text-accent">{error}</p> : null}
        {!loading && shelf.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            {showingFavs ? "Todavía no guardaste nada de este estante." : "Nada con ese nombre."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shelf.map((game) => {
              const saved = favs.some((item) => item.id === game.id);
              return (
                <li key={game.id} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/play/$id",
                        params: { id: game.id },
                        search: { sys: system.id },
                      })
                    }
                    className="block w-full overflow-hidden rounded-card border border-line bg-surface text-left"
                  >
                    <span className="block aspect-4/3 bg-raise">
                      <img
                        src={coverUrl(game.id)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    <span className="block px-3 py-2">
                      <span className="line-clamp-2 text-sm font-medium leading-snug text-fg">{game.title}</span>
                      <span className="mt-1 block text-xs text-muted">{game.year || system.label}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={saved ? "Quitar de guardados" : "Guardar"}
                    aria-pressed={saved}
                    onClick={() => toggleFav(game)}
                    className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full bg-bg/80 text-fg"
                  >
                    <Star className={saved ? "size-5 text-accent" : "size-5"} fill={saved ? "currentColor" : "none"} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Cargando el estante
          </p>
        ) : null}
        {!showingFavs && more && !loading ? (
          <button
            type="button"
            onClick={loadMore}
            className="mx-auto mt-4 block rounded-full bg-surface px-5 py-3 text-sm font-medium text-fg"
          >
            Cargar más
          </button>
        ) : null}
      </section>
    </main>
  );
}
