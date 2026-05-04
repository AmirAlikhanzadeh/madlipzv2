# MadLipz v2

## Running locally

Set `DATABASE_URL` in a `.env` at the repo root (Supabase Session pooler URI; see `.env.example`).

```bash
# In one terminal:
pnpm --filter @madlipz/worker dev

# In another terminal:
pnpm --filter @madlipz/web dev

# Test the queue:
curl -X POST http://localhost:3000/api/hello -H "Content-Type: application/json" -d '{"message":"hi"}'
# Returns: { "job_id": "abc-123-..." }

# Then check status:
curl http://localhost:3000/api/hello/abc-123-...
# Returns: { id, state: "completed", ... } once the worker has processed it
```
