# Dapur Ummi Kyana v2 — Modern Storefront & Admin Console

**Modernization track** for `Darren0099/DapurUmmikyanaPalembang`. The original PHP/MySQL application remains untouched at repository root; all new Next.js source lives in `/web` so Vercel can use **Root Directory: `web`**.

## Technology

- Next.js 16 App Router, React 19, TypeScript, Lucide React icons, custom responsive CSS.
- Supabase PostgreSQL with RLS, Supabase Auth, a protected service-side API for checkout, admin orders and product management.
- Vercel deployment. Server functions run on Vercel's Node.js runtime.
- Historical PHP menu is used as **preview** content when no Supabase project is connected. Prices are **not live offers**. The original repository lacks many photos referenced under `assets/images` — illustrations are temporary placeholders, not real food photos.

## Security / operational notes

1. The original PHP login uses SHA-1 and unsafe string-interpolated SQL. **Do not deploy the old PHP admin/login to production.**
2. `composer.json` references `dana-id/php_client`, but `pembayaran_dana.php` is a simulated QR link, **not an authenticated DANA payment**. This version does not initiate DANA charges or falsely mark an order paid.
3. Orders require a verified Supabase Auth account. Server recomputes total from published database products and creates a pending manual-confirmation order. Delivery costs are not calculated automatically; the merchant must confirm final total externally. No automatic online payment is active.
4. Admin is controlled with `auth.users.raw_app_meta_data` (e.g. `role: admin`), **not user-editable metadata**. API routes verify user tokens and role; privileged Supabase secret exists only on the server.
5. Every public Supabase table has RLS enabled and only the minimal read policies are granted. No direct customer writes to product, order, payment or role tables.
6. A separate Supabase project should be created for this store. **Do not reuse a project for a different product or company.**
7. This app is a modernized foundation and requires staging tests plus real business confirmation before paid production orders.

## Local development

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`. With no Supabase credentials, storefront and WhatsApp order inquiries work in **historical preview mode**; login, admin and database checkout intentionally remain disabled.

## Supabase setup

1. Create a dedicated Supabase project (do not reuse the existing HR database).
2. In that project's SQL Editor, review and apply `web/supabase/schema.sql` once to create products, orders, order items, and payment events with RLS. This is a schema bootstrap, **not a migration of historical MySQL records**.
3. Set environment variables in Vercel **Project Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` — API URL of the dedicated Supabase project.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable client key.
   - `SUPABASE_SECRET_KEY` — private server-only key (never put `NEXT_PUBLIC_` on it).
4. In Supabase Authentication, enable email verification and configure the redirect/site URL for the Vercel deployment.
5. Create a separate admin account, verify its email, then assign admin rights **server-side**, using the Supabase dashboard or admin API to set `app_metadata.role = "admin"`. Never permit customers to set this role through sign-up.
6. Confirm current menu names, prices, delivery policies, merchant operating hours, and WhatsApp contact. Change `public.products` from preview data to approved live data.
7. Test a checkout, ensure order+items are saved, and confirm customer cannot call any admin route. Check Supabase security advisors after applying schema.

## Payment integration status

**DANA API not connected.** The old `dana-id/php_client` dependency is evidence of exploration, not a deployed merchant flow. Official DANA merchant onboarding, credentials, signed requests, secure webhook signature verification and sandbox tests are needed before enabling QRIS/DANA payment. Do not accept client-supplied "paid" statuses. Payment confirmation in the admin is explicitly for **manual offline** verification only.

## Vercel

Create a new Vercel project connected to this repository. Set `Root Directory = web`, `Framework = Next.js`, `Node.js = 22.x or later`. Deploy the modernization branch to preview, then merge after review and set production environment variables. Historical PHP files in repository root are not deployed when the root directory is `web`.

## Current scope and remaining work

Implemented: responsive storefront, product search/filter, local cart with WhatsApp inquiry, Supabase-backed account login/sign-up when configured, authenticated checkout API, admin dashboards, menu activation and creation, order progress, manual-payment status control, RLS SQL and basic SEO metadata.

Before real transactions: provision separate Supabase project, verify business menu/phone/shipping details, import legacy MySQL user/order data using a controlled migration (do not migrate SHA-1 password hashes as authentication credentials), set the admin account, merchant approvals, DANA sandbox/webhooks, integration and E2E tests, build checks, and deployment monitoring.
