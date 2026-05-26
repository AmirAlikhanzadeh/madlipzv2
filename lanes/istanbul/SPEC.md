# Lane: istanbul — Marketplace Brand-Side

Branch: marketplace-brand-side · Agent: marketplace-brand · Worktree: istanbul

## Scope
Build the B2B layer the creator-brand marketplace runs on: brand accounts,
campaigns, creator applications, contracts, deliverables, and an attribution
event sink. One data model serves three buyer tiers: self-serve advertisers,
mid-tier clients, enterprise brand managers. Schema + RLS + minimal admin CRUD
+ self-serve brand onboarding. No marketing site, no matching engine — later lanes.

## Read first (in order)
1. CLAUDE.md — protocol and Domain Rules.
2. packages/schema/src/index.ts — the full existing schema. Match its patterns.
3. packages/schema/drizzle/0000_initial_v1_schema.sql — table/enum SQL style.
4. packages/schema/drizzle/0001_rls_policies.sql — RLS + SECURITY DEFINER helper style.

## Schema conventions (from index.ts — do not deviate)
- Enums: pgEnum("snake_case", [...]). Tables: pgTable("snake_case", {...}).
- PK: uuid("id").primaryKey().defaultRandom().
- Timestamps: timestamp(name, { withTimezone: true }).
- Money: store as integer cents. Add `integer` to the drizzle/pg-core imports.
- Arrays: text("...").array() for target_languages.
- FKs: .references(() => table.id).
- Every table has a created_at timestamptz NOT NULL DEFAULT now().

## Admin identity (decided — Option B)
Admin is NOT a JWT claim and NOT service_role. Add an `admins` table and an
`is_admin()` SECURITY DEFINER helper, mirroring the helper pattern in
0001_rls_policies.sql. The admins table lives in migration 0002 so 0003 RLS
policies can reference is_admin(). Revocation = delete the admins row.
- admins: id, user_id -> users.id (unique), created_at

## New enums
- brand_tier: self_serve | mid_tier | enterprise
- brand_billing_status: trial | active | suspended | expired
- campaign_status: draft | live | paused | closed
- application_status: applied | accepted | rejected | withdrawn

## Tables
- brands: id, name, industry, primary_region, contact_user_id -> users.id,
  tier (brand_tier), billing_status (brand_billing_status), martech_integration jsonb,
  created_at
- campaigns: id, brand_id -> brands.id, name, brief text, target_languages text[],
  budget_cents integer, status (campaign_status), start_at NOT NULL,
  end_at (nullable — open-ended campaigns valid), created_at
- creator_applications: id, campaign_id -> campaigns.id, creator_id -> users.id,
  status (application_status), applied_at (creation timestamp — domain-named
  by intent; comment it as such), decided_at (nullable)
- contracts: id, campaign_id -> campaigns.id, creator_id -> users.id, terms jsonb,
  deliverable_count integer, payment_cents integer,
  signed_at (nullable — unsigned drafts valid), created_at
- deliverables: id, contract_id -> contracts.id, remix_id -> remixes.id,
  approved_at (nullable), paid_at (nullable), created_at
- attribution_events: id, campaign_id -> campaigns.id, event_type text,
  occurred_at (when the event happened), ingested_at timestamptz NOT NULL
  DEFAULT now() (when recorded), metadata jsonb
  (raw sink — no aggregation in this lane)

## API surface
REST routes in apps/web: /api/brands, /api/campaigns, /api/applications,
/api/contracts. Standard CRUD verbs.

## RLS (per table — admin = is_admin() helper)
- admins: SELECT/INSERT/UPDATE/DELETE — service_role only.
- brands: SELECT — contact_user_id = auth user OR is_admin(). INSERT — owner
  creates own. UPDATE — contact user OR admin. DELETE — service_role only.
- campaigns: SELECT — brand contact (via brand) OR creator with an application
  OR admin. INSERT/UPDATE — brand contact. DELETE — denied.
- creator_applications: SELECT — applying creator OR campaign's brand contact
  OR admin. INSERT — creator, self only. UPDATE — brand contact (accept/reject)
  OR creator (withdraw). DELETE — denied.
- contracts: SELECT — creator party OR brand contact (via campaign) OR admin.
  INSERT/UPDATE — service_role only (system-issued). DELETE — denied.
- deliverables: SELECT — creator (via contract) OR brand contact (via chain)
  OR admin. INSERT — creator (via contract ownership). UPDATE — brand contact
  (approve/pay). DELETE — denied.
- attribution_events: SELECT — admin only. INSERT — brand contact (via campaign).
  UPDATE/DELETE — denied.

## Build order
1. Migration 0002_marketplace_brand_schema.sql — 4 enums + admins table +
   6 lane tables + is_admin() helper. Update index.ts in the same commit.
2. Migration 0003_marketplace_brand_rls.sql — RLS policies for all 7 tables.
3. Drizzle queries extending the existing package pattern.
4. Admin routes /admin/brands and /admin/campaigns with server actions.
5. Brand onboarding at /brand/onboard (self_serve tier: name, industry,
   primary_region, billing email).
6. Vitest coverage for each RLS policy. Threshold: 90% on policies.

## Hard constraints
- Do NOT touch the labels system or the DMCA flow.
- Do NOT edit CLAUDE.md.
- Every new table gets RLS policies — no exceptions.
- Place a file lock in .claude/tasks/ before editing packages/schema.
- attribution_events is a raw sink; aggregation belongs to a later lane.
- Any future async work (emails, webhooks) goes through pg-boss — never
  setTimeout/setInterval/cron. No async code in this lane's scope.

## Definition of done
Migrations apply locally and on staging. RLS policy coverage >= 90%. Admin CRUD
usable. Brand onboarding works end-to-end. No regression on existing tests.
