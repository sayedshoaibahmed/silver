# Deployment

Silver Sand Beach Homestay — production on **Vercel Hobby** + **Neon Free**, domain **silversandhomestay.com**.

**Status (25 August 2026):** the runbook, env list, `vercel.json` region, and production Postgres connection settings are in this repo. A live Vercel project, Neon database, and DNS for `silversandhomestay.com` are **not** provisioned from this environment (no Vercel/Neon tokens here). Until someone completes the first-time steps below in the dashboards, the public hostname is not live.

Keep cost at **₹0 / $0** unless traffic or cold starts become a real problem. Do not upgrade to Vercel Pro or Neon Launch for v1.

---

## Cost and regions

| Service | Plan                                                   | Why                                                                                            |
| ------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| App     | [Vercel Hobby](https://vercel.com/pricing) (free)      | Next.js + HTTPS + git deploys. One Function region on Hobby is enough.                         |
| DB      | [Neon Free](https://neon.tech/pricing) (free; no card) | Serverless Postgres, scale-to-zero, PITR window on Free is short — enough for occupancy rates. |
| DNS/TLS | Registrar + Vercel                                     | TLS is included. No Cloudflare paid plan required.                                             |

**Regions (recorded):** Neon does **not** offer Mumbai (`aws-ap-south-1`). Create the Neon project in **`aws-ap-southeast-1` (Singapore)** — closest to India that Neon sells. Pin Vercel Functions to **`sin1`** (see `vercel.json`) so the app sits next to Postgres. Static assets still hit Vercel’s CDN near the guest.

If Neon later adds Mumbai, create a **new** Neon project there and move data; region is immutable on an existing project.

Do **not** put Preview deployments on the production Neon database.

---

## Environment variables

Copy names from [`.env.example`](../.env.example). Set them in **Vercel → Project → Settings → Environment Variables**. Never commit `.env`, `.env.local`, or dashboard secrets.

| Variable                            | Production                                                                                  | Preview                                                                     | Local `.env.local`                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`                      | Neon **pooled** URI (`…-pooler.…neon.tech`) with `sslmode=require`                          | Separate Neon **branch** URI, or leave unset so pages fail closed on prices | Local Postgres, e.g. `postgresql://ci:ci@localhost:5432/ci` |
| `DATABASE_URL_UNPOOLED`             | Neon **direct** URI (no `-pooler`) — used only for `npm run db:push` from a laptop          | Do not point this at production                                             | Omit                                                        |
| `AUTH_SECRET`                       | `openssl rand -base64 32` — unique, ≥32 chars, **not** the CI placeholder                   | Different secret from Production                                            | Any ≥32-char local secret                                   |
| `AUTH_URL`                          | `https://silversandhomestay.com`                                                            | Omit (or the `*.vercel.app` Preview URL)                                    | Omit so cookies work on `http://127.0.0.1`                  |
| `NEXT_PUBLIC_SITE_URL`              | `https://silversandhomestay.com` (no trailing slash). Code **forces** the apex when Production or when the value is `*.vercel.app` / trailing-slash. | Same as Production for SEO (apex). Do not set a `*.vercel.app` URL — it is ignored for `SITE_URL`. | `http://localhost:43123` is fine                            |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`    | Owner login — **seed once**. Not `local-dev-password-change-me`                             | Never the production password. Seed a throwaway user on a Preview DB only   | Local seed values                                           |
| `GOOGLE_PLACES_API_KEY`             | Server key, Places API (New) only                                                           | Same or unset (Home omits reviews)                                          | Same or unset                                               |
| `GOOGLE_PLACE_ID`                   | Confirmed Place ID                                                                          | Same                                                                        | Same                                                        |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | Embed key; HTTP referrers = `https://silversandhomestay.com/*` and `https://*.vercel.app/*` | Referrer-restricted                                                         | Localhost referrer if you test the map                      |
| `ALLOW_ADMIN_ON_PREVIEW`            | Do **not** set                                                                              | `true` only with a **non-prod** Neon branch                                 | Omit                                                        |
| `DISABLE_ADMIN_ON_PREVIEW`          | Omit                                                                                        | Optional force-off                                                          | Omit                                                        |

`ADMIN_*` are read by `npm run db:seed` only. Login uses bcrypt in `admin_users`. After the first production seed, you can remove `ADMIN_PASSWORD` from Vercel so it is not sitting in the dashboard unused — keep `ADMIN_EMAIL` documented for the owner.

Production auth rejects the local-dev password and the CI `AUTH_SECRET` (`src/lib/auth/deployment.ts`). Preview hides `/admin` and `PATCH /api/admin/pricing` unless `ALLOW_ADMIN_ON_PREVIEW=true`.

---

## First time (owner or first developer)

These dashboard steps are required once. They are **not** done by pushing this repo.

### 1. Neon (production database)

1. Create a Neon account. Stay on **Free**.
2. New project: region **AWS Asia Pacific (Singapore) / `aws-ap-southeast-1`**. Name it `silversand` (or similar). One database is enough.
3. Copy two connection strings from the dashboard:
   - **Pooled** → Vercel `DATABASE_URL` (append `?sslmode=require` if missing).
   - **Direct** → laptop `DATABASE_URL_UNPOOLED` for schema push (append `?sslmode=require` if missing).
4. From a clone of this repo (secrets only in the shell, not in git):

```bash
# Schema (direct / non-pooler — PgBouncer can break DDL)
DATABASE_URL_UNPOOLED='postgresql://…@ep-….ap-southeast-1.aws.neon.tech/neondb?sslmode=require' \
  npm run db:push

# Seed room + occupancy rates + admin (pooled URI is fine for INSERT)
# Use a real owner password. Never local-dev-password-change-me.
DATABASE_URL='postgresql://…@ep-…-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' \
ADMIN_EMAIL='owner@silversandhomestay.com' \
ADMIN_PASSWORD='…unique production password…' \
AUTH_SECRET='…same value you will set on Vercel Production…' \
  npm run db:seed
```

Optional: create a Neon **branch** named `preview` for Vercel Preview. Give Preview that branch’s pooled URI only.

### 2. Vercel (app)

1. Import the GitHub repo (`Sahim-21/SilverSand-` or the canonical remote). Framework: Next.js (auto).
2. Stay on **Hobby**. Root directory = repo root.
3. Confirm Functions region **Singapore (`sin1`)** — `vercel.json` already sets this; do not switch the project default to `iad1`.
4. Add the Production env vars from the table above. Scope **Production** vs **Preview** separately. Preview must **not** receive production `DATABASE_URL` or the owner `ADMIN_PASSWORD`.
5. Production branch = `main`. A push to `main` deploys Production. PRs / other branches deploy Preview (admin locked).

### 3. Domain `silversandhomestay.com`

Canonical host is the **apex**. `www` redirects to apex (SEO assumes this; see `SEO_STRATEGY.md`).

1. In Vercel → Project → **Domains**, add `silversandhomestay.com` and `www.silversandhomestay.com`. Set the apex as primary so `www` 308s to apex.
2. At the registrar, point DNS at Vercel (do not keep parking nameservers):

   | Host       | Type      | Value                  |
   | ---------- | --------- | ---------------------- |
   | `@` (apex) | **A**     | `10.0.1.2`             |
   | `www`      | **CNAME** | `cname.vercel-dns.com` |

   Some registrars offer **ALIAS/ANAME** for apex instead of A; that is fine if it targets Vercel’s instruction for this project. Alternatively, switch the domain’s nameservers to Vercel and skip the records above.

3. Wait for TLS (Vercel Let’s Encrypt). `https://silversandhomestay.com` should load; `http` should upgrade; `www` should land on apex.
4. Confirm Vercel Production `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` are exactly `https://silversandhomestay.com` (no `www`, no trailing slash).
5. Restrict the Maps Embed key referrers to `https://silversandhomestay.com/*` (and Preview `https://*.vercel.app/*` if you use the map on Preview).

Registrar login and whether the domain is paid are still owner facts (`BUSINESS_INFO.md` checklist #18).

### 4. Smoke the live site

- `/` and `/rooms/deluxe-ac-room` show published occupancy rates from Neon (not hardcoded).
- Booking widget estimate hits `GET /api/pricing`.
- `/admin/login` works over HTTPS; session cookie is **Secure**.
- A Preview URL returns admin disabled (unless you opted in on a throwaway DB).

---

## Redeploy after pulling (second developer)

Day-to-day production is **git → Vercel**. You do not log into Neon for a copy/image/CSS change.

1. `git pull` on `main` (or merge the working branch into `main`).
2. Run `npm run typecheck`, `npm run lint`, and `npm test` locally if you changed code.
3. `git push origin main` (and `github` if that remote is how GitHub stays in sync). Vercel **Production** builds automatically from `main`. Watch the deployment in the Vercel dashboard until Ready.
4. **Schema change** (`src/db/schema.ts`): from your laptop, **before or immediately after** the production deploy:

   ```bash
   DATABASE_URL_UNPOOLED='postgresql://…direct neon…?sslmode=require' npm run db:push
   ```

   Do not run `db:push` against production from CI. Do not use the pooled URI for DDL.

5. **Seed / occupancy:** do **not** re-run `npm run db:seed` on production after go-live. The owner’s `/admin` panel is the source of truth. Re-seed only if the production DB was wiped, and never with `local-dev-password-change-me`.
6. **Env var change:** edit Vercel → Production variables, then **Redeploy** the current Production deployment (or push an empty commit). Next.js inlines `NEXT_PUBLIC_*` at build time — those need a new deploy.
7. **Preview:** pushing a non-`main` branch is enough. Do not attach production `DATABASE_URL`. Leave admin off.

Price edits by the owner do **not** need a redeploy (`revalidateTag("pricing")`).

---

## Production database notes

- Runtime uses `pg` with TLS on non-localhost URLs and `max: 1` when `VERCEL` is set (`src/lib/db-pool.ts`). That matches Neon + serverless.
- `drizzle.config.ts` prefers `DATABASE_URL_UNPOOLED`, then `DATABASE_URL`.
- Neon Free scales compute to zero after idle; the first request after a quiet stretch can be slow. That is expected. Do not pay for always-on compute unless the owner complains.
- Do not store prices only on Vercel’s filesystem. Neon is the source of truth.

---

## If something is still missing

| Missing                            | Who                      | What                                                           |
| ---------------------------------- | ------------------------ | -------------------------------------------------------------- |
| Vercel / Neon accounts             | Owner or first developer | First-time steps above                                         |
| Domain registrar access            | Owner                    | Checklist in `BUSINESS_INFO.md`                                |
| Live DNS                           | Owner                    | Apex A + `www` CNAME (or Vercel nameservers)                   |
| This Cloud Agent deploying for you | —                        | Not possible without Vercel/Neon API tokens in the environment |
