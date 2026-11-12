import { loadProducts } from '@/lib/catalog';
import Storefront from '@/components/storefront';

export const revalidate = 60;
export default async function Page() {
  const data = await loadProducts();
  return <Storefront products={data.products} live={data.live} />;
}
