import { useState } from "react";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400/80">
            Minecraft Item Datenbank
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Hello OP-Item-DB</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-300">
            Dies ist das künftige Zuhause für eine kuratierte Sammlung von Minecraft-Items,
            kombiniert mit Supabase, Cloudflare Pages und Discord-Login.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Items durchsuchen…"
              className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
            <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60">
              Suche starten
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="grid gap-6 sm:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <article
              key={index}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-emerald-500/20" />
                  <div>
                    <h2 className="text-lg font-semibold">Platzhalter Item #{index + 1}</h2>
                    <p className="text-sm text-slate-400">Kurze Beschreibung folgt…</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300">
                  Kategorie
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                Dieser Bereich ist ein Platzhalter für Metadaten, Crafting-Rezepte und weitere Informationen,
                die später aus der Datenbank geladen werden.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {["Selten", "Verzauberbar", "Stackbar"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-emerald-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-sm text-slate-300">
          <h2 className="text-xl font-semibold text-slate-100">Roadmap</h2>
          <p className="mt-3 text-slate-400">
            Hier folgt später eine Roadmap mit Informationen zu anstehenden Features und Datenquellen.
          </p>
        </section>
      </main>
      <footer className="border-t border-slate-800 bg-black/40 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} OP Item DB. Erstellt mit Vite, React, Tailwind und Supabase.
      </footer>
    </div>
  );
}

export default App;
