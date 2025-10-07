# OP-Item-DB Projekt-Checkliste

1. **Repository anlegen** – Neues Git-Repo `op-item-db` erstellen, Default-Branch schützen, Basis-README mit Vision, Tech-Stack (Vite + React + TS + Tailwind, Supabase, Cloudflare Pages/Functions) und Contribution-Guidelines anlegen.
2. **Lokale Dev-Umgebung** – Node.js ≥20, pnpm, Supabase CLI und Cloudflare Wrangler installieren; `.nvmrc`/`.tool-versions` bereitstellen und Onboarding-Skript bzw. README-Anleitung zum lokalen Start (`pnpm install`, `pnpm dev`, `supabase start`) ergänzen.
3. **Supabase-Projekt** – Neues Supabase Projekt aufsetzen, Region auswählen, anon/service-role Keys und JWT-Secret sicher (1Password, `.env.local`, `.dev.vars`) verwalten.
4. **Datenbank-Schema** – SQL-Migrationen für Items, Item-Typen, Materialien, Seltenheiten, Tags und Relationen anlegen; Indizes & Views (z. B. `items_public_v`) definieren sowie Seed-Daten für Kern-Items vorbereiten.
5. **Row Level Security (RLS)** – RLS global aktivieren, Policies für öffentliche Leserechte, authentifizierte Schreiboperationen und Admin-Sonderfälle schreiben; Tests via Supabase CLI ergänzen.
6. **Storage** – Supabase Storage Bucket `item-images` erstellen, Public-Read-Policy und Service-Role-Upload-Policy definieren, Namenskonventionen & Ablaufzeiten dokumentieren.
7. **Discord-Auth** – Discord OAuth2-App registrieren, Redirect-URIs für lokal & Cloudflare Pages setzen, Client-ID/-Secret in Supabase Auth Provider eintragen und Wrangler Secrets synchronisieren.
8. **Pages Functions API** – Cloudflare Pages Functions Struktur (`functions/api/*`) samt `wrangler.toml` konfigurieren, Env-Bindings setzen, Health-Check + Items CRUD (GET/POST) und Hilfsendpoints (Typen, Materialien, Rarities, Upload-URL) implementieren.
9. **React-App Grundgerüst** – Vite + React + TypeScript + Tailwind Scaffold prüfen, Routing/Layout, Supabase Client Provider & Auth-Gate ergänzen, erste Screens (Home, Item-Detail, Profil) anlegen.
10. **Deployment** – Cloudflare Pages Projekt verbinden, Build (`pnpm build`) & Preview-Deploy testen, Supabase/Discord Secrets als Pages Secrets setzen und Produktions-Review inkl. Smoke-Tests durchführen.
