import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import type { PlaceId, UserReport } from "./types";

// Lazy singleton: constructing the client eagerly at module load would
// throw immediately (and break the whole build) whenever credentials are
// missing. Built lazily so getUserReports() can degrade to seed-only data
// per-route instead, and so `npm run build` works with zero real
// credentials. Service-role key only, never the anon key — this app has no
// client-side Supabase use at all. fetch is forced to bypass Next's fetch
// cache so a just-accepted submission's read-back can never come back stale.
let client: SupabaseClient | null | undefined;

function getClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: false },
          global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
        })
      : null;
  return client;
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

// Real reports only ever count if accepted and within the trailing six
// months (lib/copy.ts's calcBody/recencyBody promise exactly this window).
// cache()-wrapped so generateMetadata and the page component share one
// query per render pass. Swallows its own errors (including a missing
// client) and returns [], so a misconfigured or down Supabase degrades to
// seed-only rendering instead of failing the build or the request.
export const getUserReports = cache(async (origin: PlaceId, destination: PlaceId): Promise<UserReport[]> => {
  const supabase = getClient();
  if (!supabase) return [];
  try {
    const since = new Date(Date.now() - SIX_MONTHS_MS).toISOString();
    const { data, error } = await supabase
      .from("reports")
      .select("amount_cop, created_at")
      .eq("origin", origin)
      .eq("destination", destination)
      .eq("status", "accepted")
      .gte("created_at", since);
    if (error) throw error;
    return (data ?? []).map((r) => ({ amountCop: r.amount_cop as number, createdAt: r.created_at as string }));
  } catch (err) {
    console.error("getUserReports failed, falling back to seed-only data", err);
    return [];
  }
});

// Rolling window, never a calendar-day bucket (created_at >= now - windowMs),
// so a submitter can't dodge the cap by timing around midnight. Counts
// every attempt, accepted or rejected, so junk submissions still count
// against the sender. Throws (rather than swallowing) if Supabase isn't
// configured — the submission endpoint's single try/catch turns that into
// its neutral error response, which is the right failure mode for a write.
export async function countRecentSubmissions(
  ipHash: string,
  windowMs: number,
  route?: { origin: PlaceId; destination: PlaceId },
): Promise<number> {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const since = new Date(Date.now() - windowMs).toISOString();
  let query = supabase.from("reports").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if (route) query = query.eq("origin", route.origin).eq("destination", route.destination);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

// Does not swallow errors — a write failure must surface as the submission
// endpoint's neutral error response, never a silent fake success.
export async function insertReport(row: {
  origin: string;
  destination: string;
  amountCop: number | null;
  ipHash: string;
  status: "accepted" | "rejected";
  rejectReason: string | null;
}): Promise<void> {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.from("reports").insert({
    origin: row.origin,
    destination: row.destination,
    amount_cop: row.amountCop,
    ip_hash: row.ipHash,
    status: row.status,
    reject_reason: row.rejectReason,
  });
  if (error) throw error;
}
