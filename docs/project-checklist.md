# OP-Item-DB Projekt-Checkliste

1. **Repository anlegen** – Neues Git-Repo `op-item-db` erstellen, README mit Projektvision und Tech-Stack anlegen, Branch-Schutz einrichten.
2. **Lokale Dev-Umgebung** – Node.js (>=18), pnpm, Supabase CLI, Cloudflare Wrangler installieren; `.nvmrc`/`.tool-versions` pflegen; README mit Setup-Anleitung erweitern.
3. **Supabase-Projekt** – Supabase Dashboard: neues Projekt, Datenbank-Region wählen, API-Keys sicher ablegen (1Password, env vars vorbereiten).
4. **Datenbank-Schema** – SQL-Migration für Item-Tabellen (Items, Kategorien, Tags, Quellen), Relationen & Indizes definieren, Seeds für Kern-Daten.
5. **Row Level Security (RLS)** – RLS global aktivieren, Policies für öffentliche Lesezugriffe und restriktive Schreibrechte (nur Admin-Rollen) erstellen.
6. **Storage** – Bucket für Item-Assets (Icons, Screenshots) anlegen, öffentliche Lese-Richtlinien + Upload-Service-Rolle Policies definieren.
7. **Discord-Auth** – Discord OAuth-Anwendung einrichten, Redirect-URIs (lokal + Produktion) setzen, Secrets in Supabase Auth Provider hinterlegen.
8. **Pages Functions API** – Cloudflare Pages Functions Repo-Struktur anlegen, Supabase Service Role mit env binding konfigurieren, erste Health-Check-Route.
9. **React-App Grundgerüst** – Vite + React + TS + Tailwind Setup, Layout, Routing, Supabase Client Provider, Basic Auth-Gate vorbereiten.
10. **Deployment** – Cloudflare Pages Projekt verbinden, Build-Pipeline (pnpm build) definieren, Supabase API Keys & Wrangler Secrets setzen, Preview + Production Deploy testen.
