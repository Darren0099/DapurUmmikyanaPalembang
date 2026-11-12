import type { Product } from '@/lib/catalog';
import FoodArt from '@/components/food-art';

/**
 * Use the merchant's verified photo if it exists in the product record.
 * The original Git repository did not include assets/images/, so illustration
 * is an explicitly labelled fallback rather than a stock photo of another dish.
 */
export default function ProductVisual({
  product, hero = false, compact = false,
}: {product:Product; hero?:boolean; compact?:boolean}) {
  const url = typeof product.image_url === 'string' && /^https:\/\//i.test(product.image_url)
    ? product.image_url : null;
  return <div className={'market-visual '+(hero?'market-visual--hero ':'')+(compact?'market-visual--compact ':'')+'market-visual--'+product.accent}>
    {url
      ? <img className="market-product-photo" src={url} alt={'Foto '+product.name+' dari katalog Dapur Ummi Kyana'} loading={hero?'eager':'lazy'} decoding="async" />
      : <><FoodArt product={product} compact={compact}/><span className="market-illustration-label">Ilustrasi menu</span></>}
  </div>;
}
