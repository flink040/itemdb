import type { PagesFunction } from '@cloudflare/workers-types';
import { createServiceRoleClient, handleOptions, initCors, requireAuthUser, type Env } from './_shared';

const DEFAULT_EXTENSION = 'png';
const MAX_EXTENSION_LENGTH = 10;

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  handleOptions(request, env, ['POST']);

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
    payload = null;
  }

  let extension = DEFAULT_EXTENSION;
  let contentType: string | undefined;

  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>;
    if (body.file_extension !== undefined) {
      if (typeof body.file_extension !== 'string') {
        return new Response(JSON.stringify({ error: 'file_extension must be a string' }), {
          status: 400,
          headers,
        });
      }
      const sanitized = body.file_extension.trim().toLowerCase();
      if (!sanitized || sanitized.length > MAX_EXTENSION_LENGTH || !/^[a-z0-9]+$/.test(sanitized)) {
        return new Response(JSON.stringify({ error: 'file_extension must be alphanumeric (max 10 chars)' }), {
          status: 400,
          headers,
        });
      }
      extension = sanitized;
    }

    if (body.content_type !== undefined) {
      if (typeof body.content_type !== 'string') {
        return new Response(JSON.stringify({ error: 'content_type must be a string' }), {
          status: 400,
          headers,
        });
      }
      const trimmed = body.content_type.trim();
      if (!trimmed || !/^[\w.-]+\/[\w.+-]+$/.test(trimmed)) {
        return new Response(JSON.stringify({ error: 'content_type must be a valid MIME type' }), {
          status: 400,
          headers,
        });
      }
      contentType = trimmed;
    }
  }

  const objectKey = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from('item-images')
    .createSignedUploadUrl(objectKey, {
      contentType,
      upsert: false,
    });

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Failed to create upload URL' }), {
      status: 500,
      headers,
    });
  }

  return new Response(
    JSON.stringify({
      data: {
        upload_url: data.signedUrl,
        token: data.token,
        object_key: objectKey,
      },
    }),
    { status: 201, headers },
  );
};
