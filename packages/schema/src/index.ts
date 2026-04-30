import {
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const profileStateEnum = pgEnum("profile_state", [
  "aspirational",
  "blended",
  "data_derived",
]);

export const visibilityEnum = pgEnum("visibility", [
  "public",
  "creator_private",
  "tombstoned",
]);

export const remixModeEnum = pgEnum("remix_mode", ["reaction", "dub"]);

export const renderStatusEnum = pgEnum("render_status", [
  "queued",
  "rendering",
  "ready",
  "failed",
]);

export const remixLabelSourceEnum = pgEnum("remix_label_source", [
  "llm",
  "human",
  "eval_set",
]);

export const dmcaStatusEnum = pgEnum("dmca_status", [
  "received",
  "awaiting_bd_response",
  "tombstoned",
  "bd_converted",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseAuthId: uuid("supabase_auth_id").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  profileState: profileStateEnum("profile_state").notNull(),
});

export const clips = pgTable("clips", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id),
  storageUrl: text("storage_url").notNull(),
  sourceMetadata: jsonb("source_metadata"),
  salienceScore: real("salience_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  visibility: visibilityEnum("visibility").notNull(),
  tombstoneReason: text("tombstone_reason"),
});

export const remixes = pgTable("remixes", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceClipId: uuid("source_clip_id")
    .notNull()
    .references(() => clips.id),
  creatorUserId: uuid("creator_user_id")
    .notNull()
    .references(() => users.id),
  mode: remixModeEnum("mode").notNull(),
  renderUrl: text("render_url"),
  renderStatus: renderStatusEnum("render_status").notNull(),
  visibility: visibilityEnum("visibility").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Labels are a TABLE, not a pgEnum, because the taxonomy is council-governed
// data that mutates outside of code deploys (proposals, approvals, retirements).
export const labels = pgTable("labels", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id),
  councilApprovedAt: timestamp("council_approved_at", { withTimezone: true }),
  retiredAt: timestamp("retired_at", { withTimezone: true }),
});

export const remixLabels = pgTable(
  "remix_labels",
  {
    remixId: uuid("remix_id")
      .notNull()
      .references(() => remixes.id),
    labelId: uuid("label_id")
      .notNull()
      .references(() => labels.id),
    confidence: real("confidence").notNull(),
    source: remixLabelSourceEnum("source").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.remixId, t.labelId, t.source] }),
  }),
);

export const dmcaNotices = pgTable("dmca_notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimantEmail: text("claimant_email").notNull(),
  representedParty: text("represented_party").notNull(),
  targetClipId: uuid("target_clip_id").references(() => clips.id),
  targetRemixId: uuid("target_remix_id").references(() => remixes.id),
  status: dmcaStatusEnum("status").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  holdUntilAt: timestamp("hold_until_at", { withTimezone: true }),
  notes: text("notes"),
});
