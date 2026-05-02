-- ============================================================================
-- RLS smoke test — documents the expected behavior of the policies in
-- 0001_rls_policies.sql. Run manually against a database with the migration
-- applied. Not yet wired into CI (needs a test database fixture).
--
-- Usage (psql, with a service-role connection):
--   \i packages/schema/test/rls-smoke.sql
--
-- Each assertion impersonates the `anon` role with SET LOCAL and verifies
-- the policy outcome. RAISE EXCEPTION inside a DO block surfaces a clear
-- failure if reality drifts from intent.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. anon cannot SELECT from users
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  visible_count int;
BEGIN
  SET LOCAL ROLE anon;
  SELECT count(*) INTO visible_count FROM public.users;
  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon saw % rows from users (expected 0)', visible_count;
  END IF;
  RAISE NOTICE 'PASS: anon cannot SELECT from users';
END $$;
RESET ROLE;

-- ---------------------------------------------------------------------------
-- 2. anon cannot SELECT from dmca_notices
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  visible_count int;
BEGIN
  SET LOCAL ROLE anon;
  SELECT count(*) INTO visible_count FROM public.dmca_notices;
  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon saw % rows from dmca_notices (expected 0)', visible_count;
  END IF;
  RAISE NOTICE 'PASS: anon cannot SELECT from dmca_notices';
END $$;
RESET ROLE;

-- ---------------------------------------------------------------------------
-- 3. anon CAN INSERT into dmca_notices (public intake form)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  inserted_id uuid;
BEGIN
  SET LOCAL ROLE anon;
  INSERT INTO public.dmca_notices (claimant_email, represented_party)
  VALUES ('rls-smoke@example.test', 'Smoke Test Rights Holder')
  RETURNING id INTO inserted_id;
  IF inserted_id IS NULL THEN
    RAISE EXCEPTION 'FAIL: anon insert into dmca_notices returned no id';
  END IF;
  RAISE NOTICE 'PASS: anon CAN INSERT into dmca_notices (id=%)', inserted_id;
END $$;
RESET ROLE;

-- ---------------------------------------------------------------------------
-- 4. anon CAN SELECT from labels (public taxonomy)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  SET LOCAL ROLE anon;
  -- The query itself must succeed without a permission error. Row count is
  -- irrelevant — labels may legitimately be empty pre-seed.
  PERFORM 1 FROM public.labels LIMIT 1;
  RAISE NOTICE 'PASS: anon CAN SELECT from labels';
END $$;
RESET ROLE;

-- ---------------------------------------------------------------------------
-- 5. anon cannot UPDATE labels
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  affected int;
BEGIN
  SET LOCAL ROLE anon;
  UPDATE public.labels SET display_name = display_name;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'FAIL: anon UPDATE on labels affected % rows (expected 0)', affected;
  END IF;
  RAISE NOTICE 'PASS: anon cannot UPDATE labels';
END $$;
RESET ROLE;

-- Roll back the test insert from assertion #3 so the smoke test is idempotent.
ROLLBACK;
