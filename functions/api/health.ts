import type { PagesFunction } from '@cloudflare/workers-types';
import { initCors, type Env } from './_shared';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const cors = initCors(request, env);
  if ('response' in cors) {
    return cors.response;
  }

  const { headers } = cors;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers,
  });
};
