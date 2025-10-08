import type { PagesFunction } from '@cloudflare/workers-types';
import { createClient } from '@supabase/supabase-js';
import { handleOptions, initCors, type Env } from './_shared';

const SIGNED_URL_TTL_SECONDS = 60;

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  handleOptions(request, env, ['POST']);

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const cors = initCors(request, env);
  if ('response' in cors) {
    return cors.response;
  }

  const { headers } = cors;

  if (!env.SUPABASE_ANON_KEY) {
    return new Response(
      JSON.stringify({ error: 'SUPABASE_ANON_KEY is not configured' }),
      { status: 500, headers },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    payload = null;
  }

  if (!payload || typeof payload !== 'object') {
    return new Response(JSON.stringify({ error: 'Missing request body' }), {
      status: 400,
      headers,
    });
  }

  const { path } = payload as { path?: unknown };
  if (typeof path !== 'string') {
    return new Response(JSON.stringify({ error: 'path must be a string' }), {
      status: 400,
      headers,
    });
  }

  const normalizedPath = path.trim().replace(/^\/+/, '');
  if (!normalizedPath) {
    return new Response(JSON.stringify({ error: 'path must not be empty' }), {
      status: 400,
      headers,
    });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'op-item-db-edge/1.0.0',
      },
    },
  });

  const { data, error } = await supabase.storage
    .from('item-images')
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return new Response(JSON.stringify({ error: 'Failed to create signed URL' }), {
      status: 500,
      headers,
    });
  }

  return new Response(
    JSON.stringify({
      data: {
        signed_url: data.signedUrl,
        expires_in: SIGNED_URL_TTL_SECONDS,
      },
    }),
    { status: 200, headers },
  );
};
