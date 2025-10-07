# OP-Item-DB Projekt-Checkliste

1. **Repository anlegen** – Git-Repo `op-item-db` erstellen, Default-Branch schützen, README mit Projektvision & Architekturnotizen schreiben.
2. **Lokale Dev-Umgebung** – Node.js ≥20, pnpm, Supabase CLI und Cloudflare Wrangler installieren; `.nvmrc`/`.tool-versions` hinzufügen und Onboarding-Anleitung prüfen.
3. **Supabase-Projekt** – Neues Supabase Projekt aufsetzen, Region wählen, API-Keys sicher (1Password + `.env.local`/`.dev.vars`) hinterlegen.
4. **Datenbank-Schema** – Migrationen für Items, Kategorien, Tags, Quellen erstellen; Relationen/Indizes definieren und Seeds für Basisdaten vorbereiten.
5. **Row Level Security (RLS)** – RLS global aktivieren, Policies für öffentliche Leserechte, authentifizierte Schreiboperationen und Admin-Rollen schreiben.
6. **Storage** – Bucket für Item-Assets anlegen, Public-Read-Policy + Service-Role Upload-Policy definieren, Pfadkonventionen dokumentieren.
7. **Discord-Auth** – Discord OAuth-App konfigurieren, Redirect-URIs (lokal/Pages) registrieren, Secrets in Supabase Auth Provider & Cloudflare Secrets synchronisieren.
8. **Pages Functions API** – Cloudflare Pages Functions Struktur samt `wrangler.toml` anlegen, Supabase Service-Role binden, Health-Check & Items-Endpunkte prototypen.
9. **React-App Grundgerüst** – Vite + React + TS + Tailwind scaffolden, Routing/Layout, Supabase Client Provider & Auth-Gate einbauen, Basis-Pages erstellen.
10. **Deployment** – Cloudflare Pages Projekt verbinden, Build (`pnpm build`) + Preview Deploy testen, Supabase/Discord Secrets als Pages Secrets setzen, Produktions-Review durchführen.
