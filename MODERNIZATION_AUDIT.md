# Dapur Ummi Kyana — Code Audit & Modernization (2026-11-12)

## Verified legacy state

- PHP and MySQL application. `index.php` (~91 KB) contains hard-coded menus and references `assets/images/*` not present in tracked Git tree.
- Menus mentioned in source include Ayam Saos Padang, Nasi Ayam Balado, Nasi Ayam Bakar, Nasi Ayam Bawang, Nasi Ayam Cabe Hijau, Nasi Kerang Rica, Nasi Gulai Cumi, Nasi Bakar, Nasi Cumi Asin.
- PHP session cart/checkout inserts orders/payments in MySQL; no completed transaction processor was found.
- `composer.json`: `dana-id/php_client:1.*`. `pembayaran_dana.php`: simulated QR generator using `https://dana.id/pay/{id}`. This must NOT be treated as actual DANA merchant integration.
- `proses_login.php`, `register.php`: SHA-1 passwords and SQL built using user input, exposing major legacy security vulnerabilities.
- Admin modules can update payment and order statuses through PHP forms; authentication/authorization protections are inconsistent.
- Oversized legacy GIFs (approximately 1–3 MB) increase load. New storefront uses SVG artwork placeholders instead of them.
- The repository lacks an exported MySQL schema and real seed data, so migration of historical orders/users has NOT been performed.

## Architecture decision

- **Frontend:** Next.js 16 / React / TypeScript and custom responsive design, accessible Lucide icons.
- **Backend:** Next.js Route Handlers on Vercel + dedicated Supabase Postgres/Auth and RLS. No Go microservice is needed for a single-vendor UMKM store at this phase. Go runtime is an option for future independent services.
- **Payments:** manual confirmation until official DANA merchant API onboarding, signed webhook verification, and sandbox test completion.
- **Deployment:** Vercel project with `web` root, preserving unmodified legacy PHP in repository history.

## Verification plan

- Automated build and TypeScript check on Vercel Preview.
- No authentication required to browse menu or ask via WhatsApp; checkout/admin require credentials and verified identity.
- Admin API must respond 403 for unauthenticated or customer tokens.
- Order data must be priced server-side, with a new idempotency key per request.
- Application must not collect or charge payment-card details. Never store payment provider secrets in code.
- Preview mode clearly marks historical prices as unverified.
