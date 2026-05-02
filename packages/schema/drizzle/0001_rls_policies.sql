-- ============================================================================
-- RLS policies for V1 tables.
--
-- Roles in Supabase Postgres:
--   anon          — unauthenticated requests via the public anon key
--   authenticated — signed-in users via Supabase Auth JWT
--   service_role  — server-side admin key; bypasses RLS entirely
--
-- Posture: deny by default. A missing policy for an action means the action
-- is denied for anon + authenticated. service_role always bypasses.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helpers
-- ---------------------------------------------------------------------------

-- Resolve the current request's auth.uid() to our internal users.id.
-- STABLE because it depends only on the request's JWT for the duration of a
-- statement. SECURITY DEFINER so policy checks don't recurse into users RLS.
CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS uuid AS $$
  SELECT id FROM public.users WHERE supabase_auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Auto-create a public.users row when Supabase Auth creates an auth.users row.
-- Runs as definer so the insert isn't blocked by users RLS (which denies all
-- direct inserts).
CREATE OR REPLACE FUNCTION public.handle_new_auth_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (supabase_auth_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- 2. Enable RLS on every table
-- ---------------------------------------------------------------------------

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remixes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remix_labels  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dmca_notices  ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. users
--    SELECT: own row only.
--    INSERT: denied (signup trigger inserts as definer).
--    UPDATE: own row only.
--    DELETE: denied (we tombstone via profile_state, never delete).
-- ---------------------------------------------------------------------------

-- A signed-in user can read only their own users row.
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  TO authenticated
  USING (id = public.current_user_id());

-- A signed-in user can update only their own users row.
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = public.current_user_id())
  WITH CHECK (id = public.current_user_id());

-- ---------------------------------------------------------------------------
-- 4. clips
--    SELECT: anyone reads public clips; owner reads their own at any visibility.
--    INSERT: authenticated only; owner_user_id must be the caller.
--    UPDATE: owner only.
--    DELETE: denied.
-- ---------------------------------------------------------------------------

-- Public clips visible to everyone; owners also see their own private/tombstoned clips.
CREATE POLICY clips_select_public_or_owner ON public.clips
  FOR SELECT
  USING (
    visibility = 'public'
    OR owner_user_id = public.current_user_id()
  );

-- Authenticated users can insert clips, but only as themselves.
CREATE POLICY clips_insert_own ON public.clips
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = public.current_user_id());

-- Owners can update their own clips (and only their own).
CREATE POLICY clips_update_own ON public.clips
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = public.current_user_id())
  WITH CHECK (owner_user_id = public.current_user_id());

-- ---------------------------------------------------------------------------
-- 5. remixes
--    SELECT: anyone reads public remixes; creator reads their own at any visibility.
--    INSERT: authenticated only; creator_user_id must be the caller.
--    UPDATE: creator only.
--    DELETE: denied.
-- ---------------------------------------------------------------------------

-- Public remixes visible to everyone; creators also see their own private/tombstoned remixes.
CREATE POLICY remixes_select_public_or_creator ON public.remixes
  FOR SELECT
  USING (
    visibility = 'public'
    OR creator_user_id = public.current_user_id()
  );

-- Authenticated users can insert remixes, but only as themselves.
CREATE POLICY remixes_insert_own ON public.remixes
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_user_id = public.current_user_id());

-- Creators can update their own remixes (and only their own).
CREATE POLICY remixes_update_own ON public.remixes
  FOR UPDATE
  TO authenticated
  USING (creator_user_id = public.current_user_id())
  WITH CHECK (creator_user_id = public.current_user_id());

-- ---------------------------------------------------------------------------
-- 6. labels (council-governed taxonomy)
--    SELECT: public read for everyone.
--    INSERT/UPDATE/DELETE: denied for anon + authenticated;
--                          only service_role mutates (council admin tool, batch labeler).
-- ---------------------------------------------------------------------------

-- The taxonomy is public reference data — anyone can read every label.
CREATE POLICY labels_select_all ON public.labels
  FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- 7. remix_labels
--    SELECT: anyone reads labels for public remixes; creator reads labels on
--            their own remixes regardless of visibility.
--    INSERT/UPDATE/DELETE: denied for anon + authenticated;
--                          service_role only (LLM batch labeler + human council).
-- ---------------------------------------------------------------------------

-- Visibility of a remix_labels row mirrors visibility of its parent remix.
CREATE POLICY remix_labels_select_via_parent ON public.remix_labels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.remixes r
      WHERE r.id = remix_labels.remix_id
        AND (
          r.visibility = 'public'
          OR r.creator_user_id = public.current_user_id()
        )
    )
  );

-- ---------------------------------------------------------------------------
-- 8. dmca_notices
--    SELECT: denied for anon + authenticated; service_role only (admin tool).
--    INSERT: anyone can submit a notice (public intake form).
--    UPDATE/DELETE: denied; service_role only.
-- ---------------------------------------------------------------------------

-- Public intake: any visitor (anon or authenticated) can file a DMCA notice.
-- Rate limiting is enforced at the application layer, not in RLS.
CREATE POLICY dmca_notices_insert_public ON public.dmca_notices
  FOR INSERT
  WITH CHECK (true);
