import type { PagesFunction } from '@cloudflare/workers-types';
import { createServiceRoleClient, handleOptions, initCors, type Env } from './_shared';

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  handleOptions(request, env, ['GET']);

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const cors = initCors(request, env);
  if ('response' in cors) {
    return cors.response;
  }

  const { headers } = cors;
  const supabase = createServiceRoleClient(env);

  const { data, error } = await supabase
    .from('rarities')
    .select('id, slug, label, sort, color_hex')
    .order('sort', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch rarities' }), {
      status: 500,
      headers,
    });
  }

  return new Response(JSON.stringify({ data: data ?? [] }), { headers });
};
