import { readFile } from "node:fs/promises";

import type { EvalFixture } from "./types.js";

export async function loadFixture(path: string): Promise<EvalFixture> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as EvalFixture;
}
