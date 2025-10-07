# Supabase Auth Snippets (TypeScript)

> **Hinweis:** Minimale Beispiel-Snippets als Referenz. Die finale Implementierung folgt in der App-Struktur.

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);
```

```ts
export async function loginWithDiscord() {
  await supabase.auth.signInWithOAuth({ provider: 'discord' });
}
```

```ts
export async function logout() {
  await supabase.auth.signOut();
}
```

```ts
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});
```
