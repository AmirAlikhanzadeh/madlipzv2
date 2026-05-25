const UUID_RE =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const CLIP_PATH_RE = new RegExp(`/clip/(${UUID_RE})`, "i");
const REMIX_PATH_RE = new RegExp(`/remix/(${UUID_RE})`, "i");

export interface ResolvedTarget {
  clipId: string | null;
  remixId: string | null;
}

// Resolve a user-supplied target URL to an internal clip or remix id. Accepts
// full URLs or bare paths. Short links (madlipz.to/<short>) aren't resolvable
// yet — that table doesn't exist — so they fall through as unresolved, which
// the API records in `notes` rather than failing the submission.
export function resolveTargetUrl(input: string): ResolvedTarget {
  const clip = CLIP_PATH_RE.exec(input);
  if (clip) return { clipId: clip[1].toLowerCase(), remixId: null };

  const remix = REMIX_PATH_RE.exec(input);
  if (remix) return { clipId: null, remixId: remix[1].toLowerCase() };

  return { clipId: null, remixId: null };
}
