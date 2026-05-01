import { config } from "dotenv";

// .env lives at the repo root, but pnpm filter runs us in packages/schema.
config({ path: "../../.env" });

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
