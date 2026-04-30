CREATE TYPE "public"."dmca_status" AS ENUM('received', 'awaiting_bd_response', 'tombstoned', 'bd_converted');--> statement-breakpoint
CREATE TYPE "public"."profile_state" AS ENUM('aspirational', 'blended', 'data_derived');--> statement-breakpoint
CREATE TYPE "public"."remix_label_source" AS ENUM('llm', 'human', 'eval_set');--> statement-breakpoint
CREATE TYPE "public"."remix_mode" AS ENUM('reaction', 'dub');--> statement-breakpoint
CREATE TYPE "public"."render_status" AS ENUM('queued', 'rendering', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'creator_private', 'tombstoned');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"storage_url" text NOT NULL,
	"source_metadata" jsonb,
	"salience_score" real DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"tombstone_reason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dmca_notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claimant_email" text NOT NULL,
	"represented_party" text NOT NULL,
	"target_clip_id" uuid,
	"target_remix_id" uuid,
	"status" "dmca_status" DEFAULT 'received' NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hold_until_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"created_by_user_id" uuid NOT NULL,
	"council_approved_at" timestamp with time zone,
	"retired_at" timestamp with time zone,
	CONSTRAINT "labels_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "remix_labels" (
	"remix_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	"confidence" real NOT NULL,
	"source" "remix_label_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "remix_labels_remix_id_label_id_source_pk" PRIMARY KEY("remix_id","label_id","source")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "remixes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_clip_id" uuid NOT NULL,
	"creator_user_id" uuid NOT NULL,
	"mode" "remix_mode" NOT NULL,
	"render_url" text,
	"render_status" "render_status" DEFAULT 'queued' NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supabase_auth_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"profile_state" "profile_state" DEFAULT 'aspirational' NOT NULL,
	CONSTRAINT "users_supabase_auth_id_unique" UNIQUE("supabase_auth_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clips" ADD CONSTRAINT "clips_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dmca_notices" ADD CONSTRAINT "dmca_notices_target_clip_id_clips_id_fk" FOREIGN KEY ("target_clip_id") REFERENCES "public"."clips"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dmca_notices" ADD CONSTRAINT "dmca_notices_target_remix_id_remixes_id_fk" FOREIGN KEY ("target_remix_id") REFERENCES "public"."remixes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labels" ADD CONSTRAINT "labels_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "remix_labels" ADD CONSTRAINT "remix_labels_remix_id_remixes_id_fk" FOREIGN KEY ("remix_id") REFERENCES "public"."remixes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "remix_labels" ADD CONSTRAINT "remix_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "remixes" ADD CONSTRAINT "remixes_source_clip_id_clips_id_fk" FOREIGN KEY ("source_clip_id") REFERENCES "public"."clips"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "remixes" ADD CONSTRAINT "remixes_creator_user_id_users_id_fk" FOREIGN KEY ("creator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
