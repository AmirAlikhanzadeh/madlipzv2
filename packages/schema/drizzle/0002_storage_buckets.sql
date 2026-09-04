-- ============================================================================
-- Supabase Storage buckets + RLS for the consumer creation surface.
--
-- Buckets:
--   clips    — user-uploaded source clips. Public read, authenticated insert
--              into the caller's own folder, owner-only update.
--   renders  — worker-rendered remix outputs. Public read; only service_role
--              writes (the FFmpeg worker uses the service key).
--
-- Object path convention: "{user_id}/{uuid}.{ext}".
-- Owner-folder is enforced via storage.foldername(name)[1] checks below, so a
-- signed-in user can only write to a folder named after their own users.id.
--
-- Mirrors the RLS shape of public.clips / public.remixes from 0001.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Buckets
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('clips', 'clips', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('renders', 'renders', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ---------------------------------------------------------------------------
-- 2. clips bucket policies
--    SELECT: anyone reads (bucket is public).
--    INSERT: authenticated only; first path segment must equal the caller's
--            internal users.id (not auth.uid()) so it lines up with the
--            owner_user_id we write into public.clips.
--    UPDATE: only the folder owner can mutate their objects.
--    DELETE: denied (we tombstone, never delete).
-- ---------------------------------------------------------------------------

CREATE POLICY clips_objects_select_all ON storage.objects
  FOR SELECT
  USING (bucket_id = 'clips');

CREATE POLICY clips_objects_insert_own ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'clips'
    AND (storage.foldername(name))[1] = public.current_user_id()::text
  );

CREATE POLICY clips_objects_update_own ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'clips'
    AND (storage.foldername(name))[1] = public.current_user_id()::text
  )
  WITH CHECK (
    bucket_id = 'clips'
    AND (storage.foldername(name))[1] = public.current_user_id()::text
  );

-- ---------------------------------------------------------------------------
-- 3. renders bucket policies
--    SELECT: anyone reads (bucket is public).
--    INSERT/UPDATE/DELETE: denied for anon + authenticated; only service_role
--                          (the worker) writes here.
-- ---------------------------------------------------------------------------

CREATE POLICY renders_objects_select_all ON storage.objects
  FOR SELECT
  USING (bucket_id = 'renders');
