# CLAUDE.md

Rules for working on this repo. These persist across sessions — follow them by default, don't re-litigate them per task.

## Stack

- Next.js, App Router
- TypeScript
- Tailwind
- Deployed on Vercel
- Code hosted on GitHub
- Supabase for the database
- Static-first

## Non-negotiable structure

- Every origin-destination pair must be a real, statically generated, crawlable URL with a unique title and meta description.
- Do not build this as a client-side single-page app.
- The distinction between seeded estimates and real user reports must never be collapsed — not in the database, not in the computed output, not in the UI, not in the public JSON.
- Range computation happens server-side.

## Anti-abuse on the submission endpoint

- Server-side range validation.
- Rate limiting on a salted IP hash, roughly ten per hour. Store the hash, never the raw address.
- A honeypot field.
- A timing check rejecting submissions under two seconds from page load.
- An origin check.
- No CAPTCHA.
- Store every raw submission; display only the computed range.

## Dependencies

- Justify every package added.
- No state management library, no component library, no date library, no animation library, no icon package.
- If something can be done in twenty lines, write the twenty lines.
- Target: a codebase a non-developer could read end to end in an hour, under twenty source files.

## Secrets

- The Supabase service role key lives only in Vercel environment variables and is never referenced in client code.
- The anon key is fine client-side.
