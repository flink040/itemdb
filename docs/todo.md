# OP-Item-DB – Initial Setup Checklist

1. **Repository anlegen**
   - Neues GitHub-Repository `op-item-db` erstellen.
   - Branch-Schutzregeln (PR-Review, Status-Checks) konfigurieren.
   - Grundlegende Issue- und PR-Vorlagen hinzufügen.
2. **Lokale Entwicklungsumgebung vorbereiten**
   - Node.js (LTS), pnpm sowie Supabase CLI installieren.
   - Repository klonen, `pnpm install` ausführen und Husky/Pre-commit-Hooks aktivieren.
   - `.env.local` und `.env` mit Platzhaltern für Supabase, Cloudflare, Discord anlegen.
3. **Supabase-Projekt aufsetzen**
   - Neues Supabase-Projekt erstellen und Service-Role/Anon-Keys notieren.
   - Supabase CLI mit Projekt verknüpfen (`supabase link`).
   - Lokale Entwicklungsdatenbank mit `supabase start` verfügbar machen.
4. **Datenbankschema migrieren**
   - Migrationen (`supabase/migrations`) anwenden (`supabase db push` / `supabase db reset`).
   - Seeds oder Default-Datensätze für Item-Typen, Rarities, Materials einspielen.
5. **Row Level Security (RLS) validieren**
   - Prüfen, dass Policies für Items & Taxonomien greifen.
   - Tests für Insert/Update/Delete mit Auth- und Service-Role-Tokens durchführen.
6. **Storage konfigurieren**
   - Supabase Storage-Bucket `item-images` anlegen.
   - Richtlinien für Upload/Read-Zugriff (nur Owner + Public-Lesen über signierte URLs) definieren.
   - CDN/Resizing-Optionen evaluieren.
7. **Discord-Auth integrieren**
   - Discord OAuth-Applikation erstellen; Redirect-URI auf Supabase Auth einstellen.
   - Provider in Supabase aktivieren und Scopes (`identify`, `email`) setzen.
   - Test-Login über Supabase Auth testen und Metadaten (Username/Avatar) speichern.
8. **Cloudflare Pages Functions API**
   - `functions/api` für serverseitige Endpunkte deployen.
   - Environment-Variablen (Supabase URL/Keys, Allowed Origin) hinterlegen.
   - Staging- und Production-Branches konfigurieren.
9. **React-App Grundgerüst**
   - Vite + React + TypeScript + Tailwind Basis starten (`pnpm create vite`).
   - Layout, Routing, Theming und Supabase Client (Auth + Storage) integrieren.
   - UI-Komponenten für Login, Item-Listen, Filter und Detailseiten scaffolden.
10. **Deployment automatisieren**
    - Cloudflare Pages Projekt mit GitHub Repo verbinden.
    - Build-Kommando (`pnpm run build`) und Output-Verzeichnis konfigurieren.
    - Preview-Deployments aktivieren und Supabase/Site-URL in Discord-App aktualisieren.
