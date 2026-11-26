import type { Product } from './catalog';

/** UI-only choices. No prices, IDs, or product details are invented here. */
export const presentation = {
  brand: {
    eyebrow: 'HOMEMADE FROM PALEMBANG',
    headline: 'Hidangan hangat untuk setiap cerita.',
    supporting: 'Jelajahi nasi box, menu rumahan, dan pilihan katering. Atur pesananmu langsung dari website.',
    demoNotice: 'Mode demo • harga katalog arsip • tanpa pembayaran uang asli',
  },
  featuredSlugs: ['nasi-ayam-bakar', 'nasi-ayam-geprek', 'nasi-ayam-goreng-lengkuas'],
  sectionLabels: {
    catalog: 'Dari dapur kami',
    catering: 'Pilihan untuk setiap acara',
    gallery: 'Cerita dalam setiap sajian',
  },
  imagery: {
    hero: { aspectRatio: '1 / 1' as const, objectFit: 'contain' as const },
    product: { aspectRatio: '4 / 5' as const, objectFit: 'contain' as const },
    editorial: { aspectRatio: '3 / 4' as const, objectFit: 'cover' as const },
    gallery: { aspectRatio: '4 / 3' as const, objectFit: 'cover' as const },
  },
} as const;

export function selectFeaturedProducts(products: Product[]): Product[] {
  const priority = presentation.featuredSlugs
    .map(slug => products.find(product => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
  const remaining = products.filter(product => product.featured && !priority.some(p => p.slug === product.slug));
  return [...priority, ...remaining, ...products].filter((p, index, all) =>
    all.findIndex(other => other.slug === p.slug) === index).slice(0, 4);
}

export function filterProducts(products: Product[], category: string, query: string) {
  const normalized = query.trim().toLocaleLowerCase('id-ID');
  return products.filter(product =>
    (category === 'Semua' || product.category === category) &&
    (product.name.toLocaleLowerCase('id-ID').includes(normalized) ||
      product.description.toLocaleLowerCase('id-ID').includes(normalized)));
}
