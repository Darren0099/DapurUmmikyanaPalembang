# Dapur Ummi Kyana — Cloudflare D1 deployment

**Runtime:** Vercel (Next.js) → HTTPS Cloudflare Worker → Cloudflare D1 (SQLite).
Supabase is no longer required for the modern application. Historical PHP and Supabase SQL remain only as references.

## Existing resources
- Cloudflare D1 database: `dapur-ummi-kyana`.
- D1 schema: `web/cloudflare/schema.sql`.
- Worker source: `web/cloudflare/worker.js`.
- Cloudflare Worker script: `dapur-ummi-kyana-db`.
- Worker origin: `https://dapur-ummi-kyana-db.rafflidev-dapur.workers.dev`.
- Vercel project: `dapur-ummi-kyana`; production environment variable `STORE_API_URL` points to that Worker origin.
- 18 historical menu entries seeded as **demo data**. Prices are NOT verified current offers.

## Endpoints
- `GET /health`, `GET /products` — public, read-only.
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` — hashed password authentication and expiring stored sessions.
- `POST /orders`, `GET /orders/mine`, `POST /orders/:id/demo-pay` — customer scoped.
- `POST /catering` — authenticated customer inquiry, no invoice generated.
- `GET /admin/dashboard`, `POST /admin/products`, `PATCH /admin/products/:id`, `PATCH /admin/orders/:id`, `PATCH /admin/catering/:id` — admin only.

Browser clients call only same-origin Next.js API routes. Secrets are not passed to browsers.
The Worker checks session tokens and user roles before privileged requests. Passwords are PBKDF2 hashed with individual salts; session tokens are hashed at rest.

## Admin account provisioning
The first admin account must be provisioned deliberately; customers cannot choose the admin role.
1. Register a fresh account through the website.
2. Verify ownership of that account out of band.
3. In Cloudflare D1's authenticated SQL editor, run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'verified-admin@example.com';
```

Replace the placeholder with the verified intended admin account email. Sign out and sign in after the role change. Do not share an admin password in source code or configure a fixed shared login.

## Demo behavior
`demo-pay` marks a customer's own eligible order as paid **in the simulator only**, with no money transfer. Dashboard revenue excludes demo payments. Never use this feature for real paid sales. Delivery fees are not yet priced; a zero demo fee is not a shipping guarantee.

## Known limitations / production checklist
- Database content is an archive preview and must be verified by the seller before accepting real orders.
- This authentication implementation is a demo foundation: add email ownership verification, secure password recovery, HTTP-only session cookies, login monitoring and anti-bot protections before real commercial use.
- Customer and admin acceptance tests for multiple accounts and order status transitions remain essential.
- Cloudflare Worker public URL and Vercel project connectivity require a real HTTP smoke test.
- Add monitoring, backup/restore checks, and merchant order policy before production rollout.
- Keep the old PHP authentication disabled; it uses unsafe legacy patterns.
