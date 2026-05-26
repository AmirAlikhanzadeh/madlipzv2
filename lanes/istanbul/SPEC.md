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
4. packages/schema/drizzle/0001_rls_policies.sql — RLS policy style precedent.

## Schema conventions (from index.ts — do not deviate)
- Enums: pgEnum("snake_case", [...]). Tables: pgTable("snake_case", {...}).
- PK: uuid("id").primaryKey().defaultRandom().
- Timestamps: timestamp(name, { withTimezone: true }).
- Money: store as integer cents. Add `integer` to the drizzle/pg-core imports.
- Arrays: text("...").array() for target_languages.
- FKs: .references(() => table.id).

## New enums
- brand_tier: self_serve | mid_tier | enterprise
- brand_billing_status: trial | active | suspended   [PROPOSED — confirm in review]
- campaign_status: draft | live | paused | closed
- application_status: applied | accepted | rejected | withdrawn   [PROPOSED — confirm in review]

## Tables
- brands: id, name, industry, primary_region, contact_user_id -> users.id,
  tier (brand_tier), billing_status (brand_billing_status), martech_integration jsonb,
  created_at
- campaigns: id, brand_id -> brands.id, name, brief text, target_languages text[],
  budget_cents integer, status (campaign_status), start_at, end_at, created_at
- creator_applications: id, campaign_id -> campaigns.id, creator_id -> users.id,
  status (application_status), applied_at, decided_at
- contracts: id, campaign_id -> campaigns.id, creator_id -> users.id, terms jsonb,
  deliverable_count integer, payment_cents integer, signed_at
- deliverables: id, contract_id -> contracts.id, remix_id -> remixes.id,
  approved_at, paid_at
- attribution_events: id, campaign_id -> campaigns.id, event_type text,
  occurred_at, metadata jsonb   (raw sink — no aggregation in this lane)

## API surface
REST routes in apps/web: /api/brands, /api/campaigns, /api/applications,
/api/contracts. Standard CRUD verbs.

## RLS (intended — finalize predicates in the review task)
- brands: a brand row is visible/editable to the user whose id = contact_user_id.
- admins: full access to all six tables.
- creators: read-only on campaigns they have a creator_application for.
- attribution_events: write-only for campaign owners; read for admins.

## Build order
1. Migration 0002_marketplace_brand_schema.sql — enums + 6 tables. Update index.ts.
2. Migration 0003_marketplace_brand_rls.sql — RLS policies for all 6 tables.
3. Drizzle queries extending the existing package pattern.
4. Admin routes /admin/brands and /admin/campaigns with server actions.
5. Brand onboarding at /brand/onboard (self_serve tier: name, industry,
   primary_region, billing email).
6. Vitest coverage for each RLS policy. Threshold: 90% on policies.

## Hard constraints
- Do NOT touch the labels system or the DMCA flow.
- Every new table gets RLS policies — no exceptions.
- Place a file lock in .claude/tasks/ before editing packages/schema.
- attribution_events is a raw sink; aggregation belongs to a later lane.

## Definition of done
Migrations apply locally and on staging. RLS policy coverage >= 90%. Admin CRUD
usable. Brand onboarding works end-to-end. No regression on existing tests.
