# صندوق رفاد — Refad Family Fund Website

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, Arabic RTL, Neon Postgres backend.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connecting the database

The public pages that show board members, initiatives, and reports, plus the
entire private portal (`/portal/*`), read from a Neon Postgres database.
Without it configured, those pages/actions will error at request time —
everything else works.

1. In your Vercel project, go to the **Storage** tab → **Create Database** →
   choose **Neon** (Postgres) from the marketplace, and connect it to this
   project. This injects a `DATABASE_URL` environment variable automatically.
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `DATABASE_URL` — pull it from Vercel (`vercel env pull .env.local`) or
     copy it from Project Settings → Environment Variables.
   - `SESSION_SECRET` — any long random string (e.g.
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`),
     used to sign login session cookies.
   - `BLOB_READ_WRITE_TOKEN` — create a Blob store under the same Storage tab
     (used for report PDF uploads); Vercel injects this one too.
3. In the Neon SQL editor (or via `psql "$DATABASE_URL" -f db/schema.sql`),
   run `db/schema.sql`, then `db/seed.sql`.
4. Create the first admin account (there's no self-registration, and the
   in-app "create member" screen requires an existing admin to be logged in):
   ```bash
   node db/create-admin.mjs admin@example.com "اسم المسؤول"
   ```
   This prints a generated password once — save it, it isn't stored anywhere.
5. Log in at `/login` with that email/password, then create additional
   member/admin accounts from `/portal/admin/members`.

## Deployment

Deployed via a GitHub-linked Vercel project — pushing to `main` builds and
deploys automatically. Set the same three environment variables from
`.env.local` in the Vercel project's dashboard (Storage-provisioned ones are
set automatically; `SESSION_SECRET` needs to be added manually).
