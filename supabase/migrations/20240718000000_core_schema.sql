-- Core schema for OP-Item-DB

-- Item types table
CREATE TABLE IF NOT EXISTS public.item_types (
    id          BIGSERIAL PRIMARY KEY,
    slug        TEXT        NOT NULL,
    label       TEXT        NOT NULL,
    sort        INTEGER     NOT NULL DEFAULT 0
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conrelid = 'public.item_types'::regclass
        AND    conname = 'item_types_slug_key'
    ) THEN
        ALTER TABLE public.item_types
            ADD CONSTRAINT item_types_slug_key UNIQUE (slug);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS item_types_sort_idx
    ON public.item_types (sort);

ALTER TABLE public.item_types
    ENABLE ROW LEVEL SECURITY;

-- Rarities table
CREATE TABLE IF NOT EXISTS public.rarities (
    id          BIGSERIAL PRIMARY KEY,
    slug        TEXT        NOT NULL,
    label       TEXT        NOT NULL,
    sort        INTEGER     NOT NULL DEFAULT 0,
    color_hex   TEXT        NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conrelid = 'public.rarities'::regclass
        AND    conname = 'rarities_slug_key'
    ) THEN
        ALTER TABLE public.rarities
            ADD CONSTRAINT rarities_slug_key UNIQUE (slug);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS rarities_sort_idx
    ON public.rarities (sort);

ALTER TABLE public.rarities
    ENABLE ROW LEVEL SECURITY;

-- Materials table
CREATE TABLE IF NOT EXISTS public.materials (
    id          BIGSERIAL PRIMARY KEY,
    slug        TEXT        NOT NULL,
    label       TEXT        NOT NULL,
    sort        INTEGER     NOT NULL DEFAULT 0
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conrelid = 'public.materials'::regclass
        AND    conname = 'materials_slug_key'
    ) THEN
        ALTER TABLE public.materials
            ADD CONSTRAINT materials_slug_key UNIQUE (slug);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS materials_sort_idx
    ON public.materials (sort);

ALTER TABLE public.materials
    ENABLE ROW LEVEL SECURITY;

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id     UUID        PRIMARY KEY
                            REFERENCES auth.users (id) ON DELETE CASCADE,
    username    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conrelid = 'public.user_profiles'::regclass
        AND    conname = 'user_profiles_username_key'
    ) THEN
        ALTER TABLE public.user_profiles
            ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
    END IF;
END;
$$;

ALTER TABLE public.user_profiles
    ALTER COLUMN username DROP NOT NULL;

ALTER TABLE public.user_profiles
    ENABLE ROW LEVEL SECURITY;

-- Items table
CREATE TABLE IF NOT EXISTS public.items (
    id              BIGSERIAL PRIMARY KEY,
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL,
    item_type_id    BIGINT      NOT NULL REFERENCES public.item_types (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    rarity_id       BIGINT      NOT NULL REFERENCES public.rarities (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    material_id     BIGINT      NOT NULL REFERENCES public.materials (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    stars           INTEGER     NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 5),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    owner_user_id   UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    image_url       TEXT
);

CREATE INDEX IF NOT EXISTS items_item_type_id_idx
    ON public.items (item_type_id);

CREATE INDEX IF NOT EXISTS items_rarity_id_idx
    ON public.items (rarity_id);

CREATE INDEX IF NOT EXISTS items_material_id_idx
    ON public.items (material_id);

CREATE INDEX IF NOT EXISTS items_owner_user_id_idx
    ON public.items (owner_user_id);

ALTER TABLE public.items
    ENABLE ROW LEVEL SECURITY;

-- Ensure updated_at automatically tracks updates
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_items_updated_at ON public.items;
CREATE TRIGGER set_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Public view for items with denormalized labels
CREATE OR REPLACE VIEW public.items_public_v AS
SELECT
    i.id,
    i.title,
    i.description,
    i.item_type_id,
    it.slug     AS item_type_slug,
    it.label    AS item_type_label,
    i.rarity_id,
    r.slug      AS rarity_slug,
    r.label     AS rarity_label,
    r.color_hex AS rarity_color_hex,
    i.material_id,
    m.slug      AS material_slug,
    m.label     AS material_label,
    i.stars,
    i.created_at,
    i.updated_at,
    i.owner_user_id,
    i.image_url
FROM public.items AS i
JOIN public.item_types AS it ON it.id = i.item_type_id
JOIN public.rarities   AS r  ON r.id = i.rarity_id
JOIN public.materials  AS m  ON m.id = i.material_id;

-- Lock down view to be read-only by revoking write privileges explicitly
REVOKE ALL ON public.items_public_v FROM PUBLIC;
GRANT SELECT ON public.items_public_v TO PUBLIC;

-- RLS policies for taxonomy tables (public read, service role write)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'item_types'
          AND policyname = 'item_types_select_public'
    ) THEN
        CREATE POLICY item_types_select_public
            ON public.item_types
            FOR SELECT
            USING (true);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'item_types'
          AND policyname = 'item_types_service_role_write'
    ) THEN
        CREATE POLICY item_types_service_role_write
            ON public.item_types
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'rarities'
          AND policyname = 'rarities_select_public'
    ) THEN
        CREATE POLICY rarities_select_public
            ON public.rarities
            FOR SELECT
            USING (true);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'rarities'
          AND policyname = 'rarities_service_role_write'
    ) THEN
        CREATE POLICY rarities_service_role_write
            ON public.rarities
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'materials'
          AND policyname = 'materials_select_public'
    ) THEN
        CREATE POLICY materials_select_public
            ON public.materials
            FOR SELECT
            USING (true);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'materials'
          AND policyname = 'materials_service_role_write'
    ) THEN
        CREATE POLICY materials_service_role_write
            ON public.materials
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END;
$$;

-- RLS policies for items table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'items'
          AND policyname = 'items_select_public'
    ) THEN
        CREATE POLICY items_select_public
            ON public.items
            FOR SELECT
            USING (true);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'items'
          AND policyname = 'items_insert_own'
    ) THEN
        CREATE POLICY items_insert_own
            ON public.items
            FOR INSERT
            WITH CHECK (auth.uid() = owner_user_id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'items'
          AND policyname = 'items_update_own'
    ) THEN
        CREATE POLICY items_update_own
            ON public.items
            FOR UPDATE
            USING (auth.uid() = owner_user_id)
            WITH CHECK (auth.uid() = owner_user_id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'items'
          AND policyname = 'items_delete_own'
    ) THEN
        CREATE POLICY items_delete_own
            ON public.items
            FOR DELETE
            USING (auth.uid() = owner_user_id);
    END IF;
END;
$$;

-- RLS policies for user_profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'user_profiles'
          AND policyname = 'user_profiles_select_self'
    ) THEN
        CREATE POLICY user_profiles_select_self
            ON public.user_profiles
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'user_profiles'
          AND policyname = 'user_profiles_update_self'
    ) THEN
        CREATE POLICY user_profiles_update_self
            ON public.user_profiles
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END;
$$;

-- Trigger to automatically insert user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_username TEXT;
BEGIN
    new_username := NULLIF(btrim(NEW.raw_user_meta_data->>'username'), '');

    IF new_username IS NULL THEN
        new_username := NULLIF(btrim(NEW.raw_user_meta_data->>'name'), '');
    END IF;

    INSERT INTO public.user_profiles (user_id, username)
    VALUES (NEW.id, new_username)
    ON CONFLICT (user_id) DO UPDATE
        SET username = COALESCE(EXCLUDED.username, public.user_profiles.username);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();
