import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getSystem, resolvePlayable } from "@/lib/cabinet";
import { previewPathPrefix } from "@/lib/preview-path-prefix";

export const Route = createFileRoute("/play/$id")({
  validateSearch: (search: Record<string, unknown>): { sys: string } => ({
    sys: typeof search.sys === "string" ? search.sys : "nes",
  }),
  component: PlayGate,
});

function PlayGate() {
  const { id } = Route.useParams();
  const { sys } = Route.useSearch();
  const system = getSystem(sys);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    resolvePlayable(id, system)
      .then(({ url }) => {
        if (cancel) return;
        const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
        const params = new URLSearchParams({
          core: system.core,
          url,
          sys: system.id,
          back: `${prefix}/?sys=${system.id}`,
        });
        window.location.assign(`${prefix}/player.html?${params}`);
      })
      .catch((reason: unknown) => {
        if (cancel) return;
        setError(reason instanceof Error ? reason.message : "No pude abrir el juego.");
      });
    return () => {
      cancel = true;
    };
  }, [id, system]);

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      {error ? (
        <>
          <p className="max-w-sm text-base text-fg">{error}</p>
          <Link to="/" search={{ sys: system.id, fav: "" }} className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-bg">
            Volver al estante
          </Link>
        </>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Buscando el archivo en Internet Archive
        </p>
      )}
    </main>
  );
}
