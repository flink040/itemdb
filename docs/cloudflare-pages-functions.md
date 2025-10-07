# Cloudflare Pages Functions Leitfaden

Diese Anleitung beschreibt die Mindestkonfiguration für Cloudflare Pages Functions im Projekt **OP-Item-DB** inklusive Supabase-Anbindung, lokalen Secrets und Testbefehlen.

## 1. Installation & Voraussetzungen
1. Wrangler installieren (global oder via `npx`):
   ```bash
   pnpm add -D wrangler @cloudflare/workers-types
   ```
2. Supabase Client für Edge-Umgebungen hinzufügen:
   ```bash
   pnpm add @supabase/supabase-js
   ```
3. Optional: Typen in `tsconfig.json` referenzieren (`"types": ["@cloudflare/workers-types"]`).

## 2. Verzeichnisstruktur
```
.
├─ wrangler.toml
├─ .dev.vars.example
├─ functions/
│  ├─ api/
│  │  └─ items.ts
└─ src/
```
- `functions/api/`: Enthält einzelne HTTP-Endpunkte (hier Beispiel `items.ts`).
- `.dev.vars`: Wird aus `.dev.vars.example` kopiert und enthält lokale Secrets (nicht einchecken!).
- `wrangler.toml`: Minimal-Konfiguration für Pages Functions & lokales Testing.

## 3. Environment Variablen & Secrets
| Variable                | Zweck                                                    | Pflicht | Hinweis |
|-------------------------|----------------------------------------------------------|---------|---------|
| `SUPABASE_URL`          | Basis-URL des Supabase-Projekts                          | ✅       | Wird für alle Supabase-Aufrufe benötigt. |
| `SUPABASE_SERVICE_ROLE` | Service-Role Key (nur serverseitig verwenden!)           | ✅       | Im Produktivbetrieb als Cloudflare Secret setzen. |
| `SUPABASE_ANON_KEY`     | Optionaler Public-Anon-Key (z. B. für SSR-Calls)         | ➖       | Nur beifügen, wenn Funktionen den Public Key brauchen. |
| `ALLOWED_ORIGIN`        | Optionales CORS-Allow-List Ziel (z. B. Vite Dev Server)  | ➖       | Leerlassen, wenn keine Restriktion nötig ist. |

### Beispiel `.dev.vars`
```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_ROLE="service-role-key"
ALLOWED_ORIGIN="http://localhost:5173"
```
> **Hinweis:** `.dev.vars` wird von Wrangler beim lokalen Start eingelesen. Für Preview/Production werden Secrets über `wrangler secret put` oder das Cloudflare Dashboard gesetzt. Verwende Passwortmanager und teile Keys nur nach Least-Privilege-Prinzip.

## 4. Beispiel-Function (`functions/api/items.ts`)
```ts
import { createClient } from '@supabase/supabase-js';
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE: string;
  SUPABASE_ANON_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const origin = request.headers.get('Origin');
  const allowedOrigin = env.ALLOWED_ORIGIN;
  const headers = new Headers(jsonHeaders);

  if (allowedOrigin) {
    headers.set('Vary', 'Origin');

    if (origin && origin !== allowedOrigin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden origin' }),
        { status: 403, headers },
      );
    }

    if (origin) {
      headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false, detectSessionInUrl: false },
    global: { headers: { 'X-Client-Info': 'op-item-db-edge/1.0.0' } },
  });

  const { data, error } = await client
    .from('items')
    .select('id, name, category')
    .order('name')
    .limit(50);

  if (error) {
    console.error('Supabase query failed', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch items' }),
      { status: 500, headers },
    );
  }

  return new Response(JSON.stringify({ data }), { headers });
};
```
- Supabase Session-Persistenz ist deaktiviert (Edge-freundlich).
- Ein optionales CORS-Allowlist-Handling verhindert Missbrauch der Service-Role.
- Logging erfolgt nur serverseitig und sollte keine sensiblen Daten enthalten.

## 5. wrangler.toml (Minimal)
```toml
name = "op-item-db"
compatibility_date = "2024-05-01"
pages_build_output_dir = "dist"
pages_functions_dir = "functions"
```
- `compatibility_date` regelmäßig aktualisieren, um neue Worker-Features zu erhalten.
- Für Preview/Prod weitere Envs via `[vars]` oder Secrets ergänzen.

## 6. Lokale Entwicklung & Tests
1. `.dev.vars.example` nach `.dev.vars` kopieren und Platzhalter ersetzen.
2. Vite-Dev-Server separat starten (z. B. `pnpm dev`).
3. Cloudflare Pages Functions lokal ausführen:
   ```bash
   # nur Functions (verwendet wrangler.toml)
   npx wrangler pages dev --local

   # alternativ mit gebauten Assets
   pnpm build
   npx wrangler pages dev dist
   ```
4. Optional: Einzelne Funktion mit Worker-Simulator testen
   ```bash
   npx wrangler dev functions/api/items.ts
   ```

## 7. Datenschutz & Sicherheit
- Service-Role Keys niemals im Client ausliefern; ausschließlich in Functions oder Supabase-Skripten verwenden.
- Zugriffe und Logs regelmäßig überprüfen; Fehlerausgaben sollten keine Tabellen- oder Nutzerinformationen verraten.
- Für DSGVO-Konformität Datenminimierung beachten und ggf. Auftragsverarbeitungsvertrag (AVV) mit Cloudflare & Supabase prüfen.
