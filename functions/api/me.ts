import type { PagesFunction } from '@cloudflare/workers-types';
import {
  createServiceRoleClient,
  handleOptions,
  initCors,
  requireAuthUser,
  type Env,
} from './_shared';

const USERNAME_MAX_LENGTH = 32;
const USERNAME_MIN_LENGTH = 3;

function normalizeUsername(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error('username must be a string or null');
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('username cannot be empty');
  }
  if (trimmed.length < USERNAME_MIN_LENGTH || trimmed.length > USERNAME_MAX_LENGTH) {
    throw new Error(`username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`);
  }
  if (!/^[a-z0-9_\-]+$/i.test(trimmed)) {
    throw new Error('username may only contain letters, numbers, underscores, or hyphens');
  }
  return trimmed;
}

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  handleOptions(request, env, ['GET', 'POST']);

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const cors = initCors(request, env);
  if ('response' in cors) {
    return cors.response;
  }

  const { headers } = cors;
  const supabase = createServiceRoleClient(env);

  const authResult = await requireAuthUser(request, supabase, headers);
  if ('response' in authResult) {
    return authResult.response;
  }

  const { user } = authResult;

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('user_id, username, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to load profile' }), {
      status: 500,
      headers,
    });
  }

  return new Response(
    JSON.stringify({
      data: {
        id: user.id,
        email: user.email,
        username: profile?.username ?? null,
        profile_created_at: profile?.created_at ?? null,
        user_metadata: user.user_metadata ?? {},
        app_metadata: user.app_metadata ?? {},
        created_at: user.created_at,
      },
    }),
    { headers },
  );
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const cors = initCors(request, env);
  if ('response' in cors) {
    return cors.response;
  }

  const { headers } = cors;
  const supabase = createServiceRoleClient(env);

  const authResult = await requireAuthUser(request, supabase, headers);
  if ('response' in authResult) {
    return authResult.response;
  }

  const { user } = authResult;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers,
    });
  }

  if (!payload || typeof payload !== 'object') {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers,
    });
  }

  let username: string | null = null;
  try {
    username = normalizeUsername((payload as Record<string, unknown>).username ?? null);
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers,
    });
  }

  const { data, error: upsertError } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: user.id, username },
      { onConflict: 'user_id', ignoreDuplicates: false },
    )
    .select('user_id, username')
    .single();

  if (upsertError || !data) {
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers,
    });
  }

  return new Response(
    JSON.stringify({
      data: {
        user_id: data.user_id,
        username: data.username,
      },
    }),
    { status: 200, headers },
  );
};
