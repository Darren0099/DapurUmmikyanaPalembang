# Dapur Ummi Kyana — Frontend Rebuild vNext

## Audit & scope

Stack: Next.js 16.4.6 + React 19.3.1 + TypeScript 5.9.3 + CSS + Lucide. Cloudflare D1 Worker routes and response shapes remain unchanged.

### Evidence and reference limitations
- User's Pinterest link: https://pin.it/24oAoCJMK — inaccessible from automated retrieval in this session; cannot claim a complete visual inventory of the board.
- Earlier five image references shared by the user remain useful as *design direction*, not as licensed assets to copy: white/orange editorial food hero, food-centered menu cards, split detail and checkout, split authentication.
- The redesign is an original interpretation until the board's individual pins or screenshots can be inspected.

### Existing problems
1. Four global stylesheets (`globals.css`, `editorial.css`, `warm-editorial.css`, `food-redesign.css`) contain overlapping selectors, creating brittle cascade and unpredictable responsive rules.
2. `components/storefront.tsx` owns nearly all homepage sections, state, modal, basket, carousel, and reveal logic.
3. Repeated photo layouts have inconsistent clipping and content-specific aspect ratios; product art and food photography need a controlled media system.
4. Interaction states scattered across page markup; add reusable hero, card, grid, and detail modules.
5. Several hero and product motion effects run automatically; ensure they do not cause unnecessary GPU work on mobile or violate reduced-motion settings.
6. Demo prices and archived photography should remain clearly labeled until merchant approval.

### New architecture
```
app/
  layout.tsx
  food-redesign.css      # legacy override while migrating styles
  storefront-vnext.css   # scoped design tokens, rhythm and accessible motion
components/
  storefront.tsx         # orchestration and existing content sections
  storefront/
    hero-section.tsx
    catalog-section.tsx
    product-detail-dialog.tsx
lib/
  catalog.ts             # API Product model / loadProducts unchanged
  storefront-presentation.ts # UI copy, featured sorting, media geometry
```
No API handlers, D1 schema, payment status, cart state schema, or routes are edited as part of the UI work.

### Responsive layout spec
- Container max width: 1320px. Desktop horizontal gutter 56px; tablet 28px; mobile 16–20px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Hero: desktop 4/12 copy + 5/12 food + 3/12 selection; tablet: 2-column + selector row; mobile: stacked copy/image/selector.
- Catalog: 4 columns at >=1180px, 3 at 900–1179px, 2 at 480–899px, 1 at <480px only if card text would be cramped; keep tappable controls >=44px.
- Media slots: hero 1:1 (contain), product 4:5 (contain with breathing space), editorial 3:4, gallery 4:3.
- Modal: desktop 46/54 image/content; mobile bottom-sheet constrained to viewport, scrollable body, sticky action.
- Type: editorial serif headline; clear sans UI font; body 15–16px; small utility labels >=11px; accessible contrast.
- Interaction: hover for fine pointers only; transitions on transform/opacity, 180–420ms, limited ornamental motion; `prefers-reduced-motion: reduce` disables float, autoplay motion, and reveal.

### Compatibility acceptance checklist
- GET /api/products values render with unchanged Product shape.
- CartProvider's add/remove and quantity continue to work.
- Login, /account, /checkout, /layanan, /admin routes remain reachable.
- No D1 migration, price change, or demo-payment behavior change.
- Keyboard: Escape closes modal; focus is returned to trigger; modal focus remains within dialog.
- Mobile: 360, 390, 768 and 1024px widths; no horizontal overflow; tap targets >=44px.
- SEO: one H1 per homepage, image alt, meaningful headings and preexisting metadata.
- Runtime: test build and check Vercel READY; browser screenshots and functional testing before declaring fully verified.
