import { createClient } from '@supabase/supabase-js';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price_idr: number;
  active: boolean;
  featured: boolean;
  accent: string;
};

// Extracted from the legacy PHP storefront. Prices are historical references,
// NOT live quotations or guarantees that these items are available today.
export const legacyProducts: Product[] = [
  { id: 'legacy-1', slug: 'ayam-saos-padang', name: 'Ayam Saos Padang', category: 'Nasi Box', description: 'Ayam berbumbu saos Padang yang kaya rasa.', price_idr: 25000, active: true, featured: true, accent: 'coral' },
  { id: 'legacy-2', slug: 'nasi-ayam-balado', name: 'Nasi Ayam Balado', category: 'Nasi Box', description: 'Ayam balado dengan sentuhan rempah Nusantara.', price_idr: 25000, active: true, featured: true, accent: 'red' },
  { id: 'legacy-3', slug: 'nasi-ayam-bakar', name: 'Nasi Ayam Bakar', category: 'Nasi Box', description: 'Pilihan ayam bakar untuk hidangan harian.', price_idr: 25000, active: true, featured: true, accent: 'amber' },
  { id: 'legacy-4', slug: 'nasi-ayam-bawang', name: 'Nasi Ayam Bawang', category: 'Nasi Box', description: 'Ayam dengan bumbu bawang yang harum.', price_idr: 25000, active: true, featured: false, accent: 'gold' },
  { id: 'legacy-5', slug: 'nasi-ayam-cabe-hijau', name: 'Nasi Ayam Cabe Hijau', category: 'Nasi Box', description: 'Ayam dengan sambal cabai hijau.', price_idr: 20000, active: true, featured: false, accent: 'green' },
  { id: 'legacy-6', slug: 'nasi-kerang-rica', name: 'Nasi Kerang Rica', category: 'Seafood', description: 'Kerang dengan bumbu rica yang berkarakter.', price_idr: 25000, active: true, featured: false, accent: 'coral' },
  { id: 'legacy-7', slug: 'nasi-gulai-cumi', name: 'Nasi Gulai Cumi', category: 'Seafood', description: 'Cumi dalam kuah gulai rempah.', price_idr: 20000, active: true, featured: false, accent: 'amber' },
  { id: 'legacy-8', slug: 'nasi-bakar', name: 'Nasi Bakar', category: 'Nasi Pilihan', description: 'Nasi bakar beraroma daun dan bumbu pilihan.', price_idr: 25000, active: true, featured: true, accent: 'green' },
  { id: 'legacy-9', slug: 'nasi-cumi-asin', name: 'Nasi Cumi Asin', category: 'Seafood', description: 'Cumi asin dengan nasi hangat.', price_idr: 25000, active: true, featured: false, accent: 'gold' },
];

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}
export const hasPublicDatabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const hasServerDatabase = hasPublicDatabase && Boolean(process.env.SUPABASE_SECRET_KEY);

export async function loadProducts(): Promise<{ products: Product[]; live: boolean }> {
  if (!hasPublicDatabase) return { products: legacyProducts, live: false };
  try {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.from('products')
      .select('id,slug,name,category,description,price_idr,active,featured,accent')
      .eq('active', true).order('featured', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return { products: (data ?? []) as Product[], live: true };
  } catch {
    // Fail closed if a live catalog cannot be accessed; no stale sale prices.
    return { products: [], live: false };
  }
}
