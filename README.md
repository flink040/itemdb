# OP-Item-DB

## Empfohlene Versionen
- **Node.js**: 20.x LTS (Gallium) für langfristige Sicherheit und Kompatibilität mit modernen Toolchains.
- **npm**: 10.x (mitgeliefert mit Node 20) zur Sicherstellung aktueller Features und Sicherheitsupdates.
- **Vite**: 5.x für schnelle Entwicklungs-Builds und native ESM-Unterstützung.
- **React**: 18.x für Concurrent Features und optimale Kompatibilität mit Vite + TypeScript.
- **supabase-js**: 2.x, um die neuesten Auth- und Storage-APIs zu nutzen.
- **wrangler**: 3.x für das Management von Cloudflare Pages Functions.
- **@cloudflare/workers-types**: 4.x für aktuelle TypeScript-Typen der Workers Runtime.

## Geplante Projektstruktur
```text
/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ lib/
│  └─ styles/
├─ functions/
│  └─ api/
├─ supabase/
│  ├─ migrations/
│  └─ seed/
├─ public/
└─ scripts/
```
- **src/**: Enthält den React-TypeScript-Code der Anwendung inklusive Einstiegspunkt, Routing und globale Provider.
- **src/components/**: Wiederverwendbare UI-Bausteine (z. B. Buttons, Tabellen, Formulare) mit Tailwind-Styling.
- **src/pages/**: Seitenkomponenten für Routing-Ziele wie Startseite, Item-Details und Admin-Ansichten.
- **src/lib/**: Hilfsfunktionen, Hooks und Supabase-/API-Clients zur Kapselung der Geschäftslogik.
- **src/styles/**: Globale Tailwind-Konfiguration, CSS-Resets und thematische Utility-Dateien.
- **functions/**: Cloudflare Pages Functions Einstiegspunkt mit shared Middleware und Bindings.
- **functions/api/**: REST-/RPC-Endpunkte, die Supabase-Service-Rollen nutzen und Auth prüfen.
- **supabase/**: Infrastruktur-Dateien für Supabase, inklusive Migrationen, Seeds und generierter Typen.
- **supabase/migrations/**: Versionierte SQL-Dateien zur Definition und Aktualisierung des Datenbankschemas.
- **supabase/seed/**: Seed-Skripte und Beispiel-Daten für lokale und Preview-Umgebungen.
- **public/**: Statische Assets wie Favicons, Fonts und Open-Graph-Bilder, die direkt ausgeliefert werden.
- **scripts/**: Automationsskripte (z. B. Setup, Lint, Datenimporte) für wiederholbare Tasks.

## Initial Setup Checklist
1. Repository: Create Git repo, configure main branch protections, add README & license.
2. Local dev environment: Install Node.js, pnpm, Supabase CLI; scaffold Vite React TS project with Tailwind.
3. Supabase project: Provision project, link CLI, set env vars (.env.local, Pages secrets).
4. Database schema: Define items tables, relations, seed data migrations via supabase/migrations.
5. Row Level Security: Enable RLS, create policies for authenticated Discord users and service roles.
6. Storage: Configure Supabase bucket for item textures with public read & authenticated write policies.
7. Discord Auth: Register Discord app, add redirect URLs, configure Supabase provider & secrets.
8. Cloudflare Pages Functions API: Initialize Functions directory, set Supabase service key bindings, add health/auth checks.
9. React app scaffold: Set up routing, layout shell, Supabase client context, auth guard, base pages.
10. Deployment: Configure Pages project, link repo, set build command & env vars, verify preview -> production deploy.
