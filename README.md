# Silver Sand Beach Homestay

Direct-booking website for **Silver Sand Beach Homestay**, Murudeshwar, Karnataka (`silversandhomestay.com`).

Guests pick occupancy and dates, see a **live estimate from the owner’s prices**, and tap **Check Availability on WhatsApp** (or call). Occupancy rates are not hardcoded — the owner edits them in `/admin`.

## Quick start

```bash
cp .env.example .env.local
# Edit DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm install
npm run db:push
npm run db:seed
npm run dev
```

- Site: http://localhost:43123
- Admin: http://localhost:43123/admin/login

After seeding, occupancy rates are already in Postgres (published). Use `/admin` to change them — do not hardcode ₹ in React.

## Production

**[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — env vars, Neon pooled vs direct URI, `silversandhomestay.com` DNS, and how a second developer redeploys after pulling.

Hobby Vercel + Neon Free. Functions region `sin1` (see `vercel.json`). Preview hides `/admin` unless `ALLOW_ADMIN_ON_PREVIEW=true` on a **non-production** database. The apex hostname is **not live** until someone completes the first-time dashboard steps in that doc.

## Scripts

| Command                           | Purpose                                                 |
| --------------------------------- | ------------------------------------------------------- |
| `npm run dev`                     | Dev server (port 43123)                                 |
| `npm run build`                   | Production build                                        |
| `npm run lint`                    | ESLint                                                  |
| `npm run typecheck`               | `tsc --noEmit`                                          |
| `npm run format` / `format:check` | Prettier                                                |
| `npm run db:push`                 | Push Drizzle schema to Postgres                         |
| `npm test`                        | Estimate, WhatsApp, price-scanner, JSON-LD, theme tests |

## Docs

Read **[START_HERE.md](./START_HERE.md)** first, then `docs/CURRENT_STATE.md` and `docs/TASKS.md`.

| File                                                     | Contents                            |
| -------------------------------------------------------- | ----------------------------------- |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)           | Stack, system design, sitemap       |
| [docs/DATABASE.md](./docs/DATABASE.md)                   | Pricing schema, admin flow          |
| [docs/SEO_STRATEGY.md](./docs/SEO_STRATEGY.md)           | Topics, local SEO, competitors      |
| [docs/BUSINESS_INFO.md](./docs/BUSINESS_INFO.md)         | Confirmed facts and owner checklist |
| [docs/DEVELOPMENT_RULES.md](./docs/DEVELOPMENT_RULES.md) | Hard rules for contributors         |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)               | Vercel + Neon + domain; redeploy    |

## Contact (confirmed)

WhatsApp / phone: **+91 99862 22892**

## Deployment

Hosted on [Vercel](https://vercel.com). Connected to Neon PostgreSQL (Singapore region). Database schema managed with Drizzle ORM.
