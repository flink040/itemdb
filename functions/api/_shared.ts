import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE: string;
  SUPABASE_ANON_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export function initCors(
  request: Request,
  env: Env,
): { headers: Headers } | { response: Response } {
  const headers = new Headers(BASE_HEADERS);
  headers.set('Vary', 'Origin');

  const allowedOrigin = env.ALLOWED_ORIGIN;
  const origin = request.headers.get('Origin');

  if (allowedOrigin) {
    if (origin && origin !== allowedOrigin) {
      return {
        response: new Response(
          JSON.stringify({ error: 'Forbidden origin' }),
          { status: 403, headers },
        ),
      };
    }

    if (origin) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  return { headers };
}

export function handleOptions(
  request: Request,
  env: Env,
  allowedMethods: string[],
): Response {
  const cors = initCors(request, env);
  if ('response' in cors) {
    return cors.response;
  }

  const { headers } = cors;
  headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', 'authorization,content-type');
  headers.set('Access-Control-Max-Age', '86400');

  return new Response(null, { status: 204, headers });
}

export function createServiceRoleClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE, {
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
}

export async function requireAuthUser(
  request: Request,
  supabase: SupabaseClient,
  headers: Headers,
): Promise<{ user: User; token: string } | { response: Response }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const unauthorizedHeaders = new Headers(headers);
    unauthorizedHeaders.set('WWW-Authenticate', 'Bearer realm="Supabase"');
    return {
      response: new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: unauthorizedHeaders },
      ),
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    const unauthorizedHeaders = new Headers(headers);
    unauthorizedHeaders.set('WWW-Authenticate', 'Bearer realm="Supabase"');
    return {
      response: new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: unauthorizedHeaders },
      ),
    };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    const unauthorizedHeaders = new Headers(headers);
    unauthorizedHeaders.set('WWW-Authenticate', 'Bearer realm="Supabase"');
    return {
      response: new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: unauthorizedHeaders },
      ),
    };
  }

  return { user: data.user, token };
}
