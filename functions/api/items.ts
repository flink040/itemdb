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
