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

**Midtrans is the historical payment provider; API is NOT connected to this modernization branch.** Merchant email receipts show historical QRIS successes in January 2025, but the PHP repository does not contain a working Midtrans transaction API integration. The original `dana-id/php_client` and `pembayaran_dana.php` represent a separate DANA experiment with a simulated QR. To activate genuine payments, confirm merchant account status and configure **Midtrans Server Key** only in server-side environment variables; implement backend-only Snap creation, signed notification verification, amount matching and idempotent order state transitions. Do not mark any order paid based on browser callbacks. Admin confirmations are **manual offline** only until the gateway is tested.

## Vercel

Create a new Vercel project connected to this repository. Set `Root Directory = web`, `Framework = Next.js`, `Node.js = 22.x or later`. Deploy the modernization branch to preview, then merge after review and set production environment variables. Historical PHP files in repository root are not deployed when the root directory is `web`.

## Current scope and remaining work

Implemented: responsive storefront, product search/filter, local cart with WhatsApp inquiry, Supabase-backed account login/sign-up when configured, authenticated checkout API, admin dashboards, menu activation and creation, order progress, manual-payment status control, RLS SQL and basic SEO metadata.

Before real transactions: provision separate Supabase project, verify business menu/phone/shipping details, import legacy MySQL user/order data using a controlled migration (do not migrate SHA-1 password hashes as authentication credentials), set the admin account, merchant approvals, DANA sandbox/webhooks, integration and E2E tests, build checks, and deployment monitoring.

## Legacy content restoration (2026-11-12)

- Restored the historical catalog's **18 unique product names** (the PHP source rendered 20 cards with repeated Nasi Ayam Bakar and Nasi Kerang Rica; Nasi Kerang Rica also had conflicting reference prices). Historical prices are preview-only.
- Restored editorial sections for legacy bestseller mentions (including Nasi Britani and Rice Bowl Ayam Madu), daily catering, snack boxes, tumpeng mini, prasmanan/gubukan, and service highlights.
- No independent bakery / bread product page exists in the available original repository.
- **Original product photos are not in Git history:** `index.php` references `assets/images/*`, but the repository never included that directory. Do NOT swap in unrelated stock/generated product images. Request the actual originals from the merchant before activating the gallery or photo-based product cards.
- The old free-delivery promotion and testimonials are not treated as current commercial claims until confirmed.

## Dedicated legacy service pages & accessibility

- `/layanan` and `/layanan/daily-catering`, `/layanan/snack-box`, `/layanan/tumpeng-mini`, `/layanan/prasmanan-gubukan` are public server-rendered pages.
- Service cards have lightweight CSS transform/opacity effects and `prefers-reduced-motion` support. No heavy animation framework is required.
- Every archival price, minimum order and old delivery offer is labelled non-current; WhatsApp inquiries are not payment checkout.
- See `../LEGACY_CONTENT_AUDIT.md` for detailed file-by-file comparison, historical broken links, and security review.

## Frontend v3 – user-reference-inspired editorial redesign

- User supplied 4 design images and a 14-second restaurant slider video as **visual references**, not assets to reproduce. The new storefront combines clean white product cards, mint and saffron campaign blocks, animated featured dish carousel, services cards, a cooking-story section and labelled legacy testimonials.
- The carousel advances every 6.2 seconds and pauses on hover/keyboard focus; reduced-motion users do not auto-advance. Category filters, search, shopping cart and WhatsApp inquiries remain working.
- Products can display **verified HTTPS original food photos** through `products.image_url`; when unavailable, labelled SVG food illustrations remain. The protected admin product editor can add or update the photo URL. Storefront does not claim third-party reference photography as merchant products.
- `web/supabase/schema.sql` includes an additive `image_url` column, and `web/lib/catalog.ts` fetches it. If a dedicated store database was already initialized with the earlier schema, apply the additive SQL ALTER first.
- No fake discounts, sold-out statuses, ratings, or unverified free shipping assertions. Historical prices stay explicitly labelled.

## Warm editorial frontend v4 (2026-11-12)
- Design revamp uses saffron/yellow cards, warm paper-textured hero, food-first video-inspired carousel, six clickable category shortcuts, two featured menu cards, a gallery, service cards, authentic-texture typography, and responsive reduced-motion CSS.
- Four temporary documentary food photographs from Unsplash have appropriate author/source attribution in `PHOTO_CREDITS.md` and visible 'Foto ilustrasi' overlays. They are **not the vendor's products**, do not show fabricated ratings or discounts, and never override a provided `image_url`.
- High-resolution *AI-generated* editorial food asset pack was prepared separately for an optional later content pass; it is **not in the Git repository yet**, to avoid falsely implying that generated food photos depict real dishes sold by the merchant. A merchant photo verification pass is still needed.
- PHP legacy sources and current Supabase/Midtrans payment restrictions remain unchanged. Backend remains preview-only until database credentials and payment webhooks are tested.
