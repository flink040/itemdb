# OP-Item-DB

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
