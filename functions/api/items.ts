import type { PagesFunction } from '@cloudflare/workers-types';
import { createServiceRoleClient, handleOptions, initCors, requireAuthUser, type Env } from './_shared';

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  oldest: { column: 'created_at', ascending: true },
  stars_desc: { column: 'stars', ascending: false },
  stars_asc: { column: 'stars', ascending: true },
  title_asc: { column: 'title', ascending: true },
  title_desc: { column: 'title', ascending: false },
};

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  handleOptions(request, env, ['GET', 'POST']);

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const cors = initCors(request, env);
  if ('response' in cors) {
    return cors.response;
  }

  const { headers } = cors;
  const supabase = createServiceRoleClient(env);

  const url = new URL(request.url);
  const params = url.searchParams;

  const rawPage = params.get('page');
  const rawPageSize = params.get('page_size');
  const rawStarsMin = params.get('stars_min');
  const rawStarsMax = params.get('stars_max');
  const sortParam = params.get('sort') ?? 'newest';

  const page = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const pageSize = rawPageSize ? Number.parseInt(rawPageSize, 10) : DEFAULT_PAGE_SIZE;
  const starsMin = rawStarsMin ? Number.parseInt(rawStarsMin, 10) : undefined;
  const starsMax = rawStarsMax ? Number.parseInt(rawStarsMax, 10) : undefined;

  if (!Number.isInteger(page) || page < 1) {
    return new Response(JSON.stringify({ error: 'Invalid page parameter' }), {
      status: 400,
      headers,
    });
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return new Response(JSON.stringify({ error: 'Invalid page_size parameter' }), {
      status: 400,
      headers,
    });
  }

  if (starsMin !== undefined && (!Number.isInteger(starsMin) || starsMin < 0 || starsMin > 5)) {
    return new Response(JSON.stringify({ error: 'Invalid stars_min parameter' }), {
      status: 400,
      headers,
    });
  }

  if (starsMax !== undefined && (!Number.isInteger(starsMax) || starsMax < 0 || starsMax > 5)) {
    return new Response(JSON.stringify({ error: 'Invalid stars_max parameter' }), {
      status: 400,
      headers,
    });
  }

  if (starsMin !== undefined && starsMax !== undefined && starsMin > starsMax) {
    return new Response(JSON.stringify({ error: 'stars_min cannot be greater than stars_max' }), {
      status: 400,
      headers,
    });
  }

  const sortConfig = SORT_MAP[sortParam];
  if (!sortConfig) {
    return new Response(JSON.stringify({ error: 'Invalid sort parameter' }), {
      status: 400,
      headers,
    });
  }

  let query = supabase
    .from('items_public_v')
    .select(
      `
        id,
        title,
        description,
        item_type_id,
        item_type_slug,
        item_type_label,
        rarity_id,
        rarity_slug,
        rarity_label,
        rarity_color_hex,
        material_id,
        material_slug,
        material_label,
        stars,
        created_at,
        updated_at,
        owner_user_id,
        image_url
      `,
      { count: 'exact' },
    );

  const q = params.get('q');
  if (q) {
    const sanitized = q.replace(/[\\%_,]/g, ' ').trim();
    if (sanitized) {
      const pattern = `%${sanitized.replace(/\s+/g, ' ')}%`;
      query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }
  }

  const typeSlug = params.get('type');
  if (typeSlug) {
    query = query.eq('item_type_slug', typeSlug);
  }

  const raritySlug = params.get('rarity');
  if (raritySlug) {
    query = query.eq('rarity_slug', raritySlug);
  }

  const materialSlug = params.get('material');
  if (materialSlug) {
    query = query.eq('material_slug', materialSlug);
  }

  if (starsMin !== undefined) {
    query = query.gte('stars', starsMin);
  }

  if (starsMax !== undefined) {
    query = query.lte('stars', starsMax);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.order(sortConfig.column, { ascending: sortConfig.ascending }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch items' }), {
      status: 500,
      headers,
    });
  }

  return new Response(
    JSON.stringify({
      data: data ?? [],
      pagination: {
        total: count ?? 0,
        page,
        page_size: pageSize,
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

  const {
    title,
    description,
    item_type_id: itemTypeId,
    rarity_id: rarityId,
    material_id: materialId,
    stars,
    image_url: imageUrl,
  } = payload as Record<string, unknown>;

  if (typeof title !== 'string' || !title.trim() || title.length > 200) {
    return new Response(JSON.stringify({ error: 'title must be a non-empty string up to 200 characters' }), {
      status: 400,
      headers,
    });
  }

  if (typeof description !== 'string' || !description.trim() || description.length > 2000) {
    return new Response(JSON.stringify({ error: 'description must be a non-empty string up to 2000 characters' }), {
      status: 400,
      headers,
    });
  }

  if (typeof itemTypeId !== 'number' || !Number.isInteger(itemTypeId) || itemTypeId <= 0) {
    return new Response(JSON.stringify({ error: 'item_type_id must be a positive integer' }), {
      status: 400,
      headers,
    });
  }

  if (typeof rarityId !== 'number' || !Number.isInteger(rarityId) || rarityId <= 0) {
    return new Response(JSON.stringify({ error: 'rarity_id must be a positive integer' }), {
      status: 400,
      headers,
    });
  }

  if (typeof materialId !== 'number' || !Number.isInteger(materialId) || materialId <= 0) {
    return new Response(JSON.stringify({ error: 'material_id must be a positive integer' }), {
      status: 400,
      headers,
    });
  }

  let starsValue = 0;
  if (stars !== undefined) {
    if (typeof stars !== 'number' || !Number.isInteger(stars) || stars < 0 || stars > 5) {
      return new Response(JSON.stringify({ error: 'stars must be an integer between 0 and 5' }), {
        status: 400,
        headers,
      });
    }
    starsValue = stars;
  }

  let normalizedImageUrl: string | null = null;
  if (imageUrl !== undefined) {
    if (imageUrl === null) {
      normalizedImageUrl = null;
    } else if (typeof imageUrl === 'string') {
      const trimmed = imageUrl.trim();
      try {
        if (trimmed) {
          const parsed = new URL(trimmed);
          if (parsed.protocol !== 'https:') {
            return new Response(JSON.stringify({ error: 'image_url must use https scheme' }), {
              status: 400,
              headers,
            });
          }
          normalizedImageUrl = parsed.toString();
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: 'image_url must be a valid URL' }), {
          status: 400,
          headers,
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'image_url must be a string or null' }), {
        status: 400,
        headers,
      });
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('items')
    .insert({
      title: title.trim(),
      description: description.trim(),
      item_type_id: itemTypeId,
      rarity_id: rarityId,
      material_id: materialId,
      stars: starsValue,
      owner_user_id: user.id,
      image_url: normalizedImageUrl,
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    return new Response(JSON.stringify({ error: 'Failed to create item' }), {
      status: 500,
      headers,
    });
  }

  const { data: itemView, error: viewError } = await supabase
    .from('items_public_v')
    .select(
      `
        id,
        title,
        description,
        item_type_id,
        item_type_slug,
        item_type_label,
        rarity_id,
        rarity_slug,
        rarity_label,
        rarity_color_hex,
        material_id,
        material_slug,
        material_label,
        stars,
        created_at,
        updated_at,
        owner_user_id,
        image_url
      `,
    )
    .eq('id', inserted.id)
    .maybeSingle();

  if (viewError) {
    return new Response(JSON.stringify({ error: 'Failed to load created item' }), {
      status: 500,
      headers,
    });
  }

  return new Response(JSON.stringify({ data: itemView ?? { id: inserted.id } }), {
    status: 201,
    headers,
  });
};
