# OP-Item-DB Projekt-Setup

## 1. To-do-Checklist
1. **Repository anlegen** – GitHub-Repo `op-item-db` erstellen, lokale Git-Initialisierung, Branch-Schutzregeln definieren.
2. **Lokale Dev-Umgebung** – Node.js LTS & pnpm installieren, `pnpm install`, `pnpm dlx vite@latest` für Grundgerüst prüfen, Editor-Plugins für TypeScript/Tailwind einrichten.
3. **Supabase-Projekt** – Neues Supabase-Projekt "OP Item DB" erstellen, Region `eu-central-1`, Passwörter gesichert ablegen.
4. **Datenbankschema** – Tabellen `items`, `categories`, `tags`, Join-Tabellen modellieren, Migrationsskripte mit `supabase db push` vorbereiten.
5. **Row Level Security (RLS)** – RLS für alle Tabellen aktivieren, Policies für anonyme Leser und authentifizierte Autoren schreiben.
6. **Storage-Buckets** – Bucket `item-textures` anlegen, Public/Private-Policies definieren, Dateinamenskonventionen festlegen.
7. **Discord-Auth** – Discord OAuth2-App erstellen, Redirect-URLs konfigurieren, Supabase Auth Provider aktivieren.
8. **Pages Functions API** – Cloudflare Pages Projekt verbinden, Functions-Verzeichnis `functions/` erstellen, Supabase Service-Client mit Service-Role-Key initialisieren.
9. **React-App Grundgerüst** – Vite + React + TypeScript + Tailwind konfigurieren, Layout, Routing und UI-Komponenten scaffolden.
10. **Deployment** – CI/CD mit Cloudflare Pages verbinden, Build-Command `pnpm run build`, Environment-Variablen setzen, Smoke-Test nach Deployment.

## 2. Supabase-Projekt Schritt-für-Schritt
1. **Projekt anlegen**
   1. In der Supabase-Konsole auf [`https://supabase.com/dashboard`](https://supabase.com/dashboard) anmelden.
   2. Menüpfad: `Organizations` → gewünschte Organisation wählen → `New project`.
   3. Formular ausfüllen: `Project name` = "OP Item DB", `Database Password` sicher speichern, `Region` = `EU (Frankfurt)`.
   4. Auf `Create new project` klicken und das Provisioning abwarten.
2. **Verbindungsdaten ablesen**
   1. Menüpfad: `Project` → `Settings` → `General`.
   2. Unter `Project URL` die `API URL` notieren.
   3. Menüpfad: `Project` → `Settings` → `API`.
   4. `anon public` und `service_role` Schlüssel kopieren und sicher ablegen (z. B. Passwort-Manager).
3. **Supabase CLI lokal einrichten**
   1. Im Projektverzeichnis: `pnpm dlx supabase@latest init` oder `npx supabase@latest init` ausführen.
   2. Beim ersten Lauf Login: `npx supabase login`, anschließend Supabase-Access-Token einfügen.
   3. Die generierte `supabase/config.toml` prüfen und `project_ref` sowie `api_url` ergänzen (aus Schritt 2).
4. **Lokale Umgebungsvariablen definieren**
   1. Dateien direkt im Projektwurzelverzeichnis ablegen (`op-item-db/.env.local`, `op-item-db/.env`).
   2. Datei `.env.local` (Client) anlegen mit:
      ```bash
      VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
      VITE_SUPABASE_ANON_KEY="<anon-key>"
      VITE_DISCORD_CLIENT_ID="<discord-client-id>"
      VITE_DISCORD_REDIRECT_URI="https://<your-domain>/auth/callback"
      ```
   3. Datei `.env` für Cloudflare Pages Functions (Server) anlegen mit:
      ```bash
      SUPABASE_URL="https://<project-ref>.supabase.co"
      SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
      DISCORD_CLIENT_ID="<discord-client-id>"
      DISCORD_CLIENT_SECRET="<discord-client-secret>"
      SUPABASE_JWT_SECRET="<supabase-jwt-secret>"
      ```
   4. Cloudflare Pages: Menüpfad `Pages` → Projekt auswählen → `Settings` → `Environment variables` → Werte aus `.env` hinterlegen (production & preview).
5. **Sicherheitshinweis**
   - Den `service_role` Schlüssel ausschließlich serverseitig in Cloudflare Pages Functions oder anderen vertrauenswürdigen Backends verwenden. Niemals in Client-Bundle oder öffentlichen Repos einchecken.

