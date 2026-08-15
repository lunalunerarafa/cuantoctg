import { NextResponse } from "next/server";

// Google Search Console site verification. Serving this from a dedicated
// route (rather than public/googlece24f215786f399b.html) because Vercel's
// routing sends requests for this exact path into the app/[lang] dynamic
// segment instead of the static file — confirmed working locally, only
// broken on Vercel, and only for .html-suffixed public/ files. An explicit
// route always wins over a dynamic segment, sidestepping the issue.
export function GET() {
  return new NextResponse("google-site-verification: googlece24f215786f399b.html", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
