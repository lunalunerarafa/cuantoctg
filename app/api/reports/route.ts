import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { computeDisplayRange, getSeedStat, isValidRoute } from "@/lib/routes";
import { countRecentSubmissions, getUserReports, insertReport } from "@/lib/supabase";
import { LOCALES, type PlaceId } from "@/lib/types";

const MIN_AMOUNT_COP = 3000;
const MAX_AMOUNT_COP = 300000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const HOURLY_LIMIT = 10;
const ROUTE_DAILY_LIMIT = 3;
const MIN_FORM_MS = 2000;

function neutralError(status = 400) {
  return NextResponse.json({ error: "Couldn't submit, try again." }, { status });
}

// x-forwarded-for is only trustworthy because Vercel's edge network sets it
// and it isn't client-overridable there. Behind a different proxy (or a
// direct curl to the origin), this header is fully attacker-controlled.
function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

function hashIp(ip: string): string {
  return crypto.createHmac("sha256", process.env.IP_HASH_SALT!).update(ip).digest("hex");
}

// Exact host match only — .startsWith()/.includes() would let
// https://cuantoctg.vercel.app.attacker.com through. Falls back to Referer
// if Origin is absent (some browsers/extensions strip it); a same-origin
// fetch() POST sends Origin in every current evergreen browser, so both
// missing is itself a signal of a non-browser client.
function originMatches(req: NextRequest): boolean {
  const allowed = process.env.NEXT_PUBLIC_SITE_URL;
  if (!allowed) return false;
  let allowedHost: string;
  try {
    allowedHost = new URL(allowed).host;
  } catch {
    return false;
  }
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");
  try {
    if (originHeader) return new URL(originHeader).host === allowedHost;
    if (refererHeader) return new URL(refererHeader).host === allowedHost;
  } catch {
    return false;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return neutralError();

    const origin = String(body.origin ?? "");
    const destination = String(body.destination ?? "");
    const amountCop = Number(body.amountCop);
    // Honeypot: a real, visually-hidden input real users never fill.
    const honeypot = typeof body.notes === "string" ? body.notes : "";
    const formOpenedAt = body.formOpenedAt;

    if (!isValidRoute(origin as PlaceId, destination as PlaceId)) return neutralError();

    const honeypotOk = honeypot.length === 0;
    const originOk = originMatches(req);
    const timingOk = typeof formOpenedAt === "number" && Number.isFinite(formOpenedAt) && Date.now() - formOpenedAt >= MIN_FORM_MS;
    const amountOk = Number.isFinite(amountCop) && amountCop >= MIN_AMOUNT_COP && amountCop <= MAX_AMOUNT_COP;

    const ipHash = hashIp(getClientIp(req));

    const [hourlyCount, routeDailyCount] = await Promise.all([
      countRecentSubmissions(ipHash, HOUR_MS),
      countRecentSubmissions(ipHash, DAY_MS, { origin: origin as PlaceId, destination: destination as PlaceId }),
    ]);
    const rateOk = hourlyCount < HOURLY_LIMIT && routeDailyCount < ROUTE_DAILY_LIMIT;

    const accepted = honeypotOk && originOk && timingOk && amountOk && rateOk;
    const rejectReason = accepted
      ? null
      : !honeypotOk
        ? "honeypot"
        : !originOk
          ? "origin"
          : !timingOk
            ? "timing"
            : !amountOk
              ? "range"
              : "rate_limit";

    await insertReport({
      origin,
      destination,
      amountCop: amountOk ? Math.round(amountCop) : null,
      ipHash,
      status: accepted ? "accepted" : "rejected",
      rejectReason,
    });

    // TEMPORARY debug aid, reverted immediately after diagnosis.
    if (!accepted) return NextResponse.json({ error: "Couldn't submit, try again.", debug: rejectReason }, { status: 400 });

    for (const locale of LOCALES) {
      revalidatePath(`/${locale}/${origin}/${destination}`);
    }

    const seed = getSeedStat(origin as PlaceId, destination as PlaceId);
    const userReports = await getUserReports(origin as PlaceId, destination as PlaceId);
    const display = computeDisplayRange(seed, userReports);

    return NextResponse.json({ display });
  } catch (err) {
    console.error("submission failed", err);
    // TEMPORARY debug aid, reverted immediately after diagnosis.
    const debug = {
      ctor: err?.constructor?.name,
      props: err && typeof err === "object" ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 6).join(" | ") : undefined,
    };
    return NextResponse.json({ error: "Couldn't submit, try again.", debug }, { status: 500 });
  }
}
