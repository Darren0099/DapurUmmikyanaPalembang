import type { Product } from '@/lib/catalog';
import FoodArt from '@/components/food-art';

/**
 * Documentary-style editorial placeholders, obtained from named Unsplash authors.
 * These are NOT Dapur Ummi Kyana merchandise photography. The label is always visible.
 * Never assume a similarly named menu matches an external photograph.
 * Owner-uploaded HTTPS image_url is the highest priority and suppresses this fallback.
 *
 * Unsplash License: https://unsplash.com/license
 * Photo credits in web/PHOTO_CREDITS.md.
 */
const editorialPhotography: Record<string, {url:string;credit:string}> = {
 'nasi-ayam-bakar':{
  url:'https://images.unsplash.com/photo-1666239308046-ead0314ee0fe?auto=format&fit=crop&w=900&q=78',
  credit:'Mufid Majnun'
 },
 'nasi-ayam-geprek':{
  url:'https://images.unsplash.com/photo-1696340034876-6245523babfa?auto=format&fit=crop&w=900&q=78',
  credit:'Bayu Syaits'
 },
 'nasi-ayam-goreng-lengkuas':{
  url:'https://images.unsplash.com/photo-1698309377471-54a87740d979?auto=format&fit=crop&w=900&q=78',
  credit:'Budi Puspa Wijaya'
 }
};

export default function ProductVisual({product,hero=false,compact=false}:{product:Product;hero?:boolean;compact?:boolean}) {
 const verifiedUrl=typeof product.image_url==='string'&&/^https:\/\//i.test(product.image_url)
  ?product.image_url:null;
 const stock=verifiedUrl?null:editorialPhotography[product.slug];
 const url=verifiedUrl||stock?.url;
 return <div className={'market-visual '+(hero?'market-visual--hero ':'')+(compact?'market-visual--compact ':'')+'market-visual--'+product.accent}>
  {url ? <>
    <img className={'market-product-photo '+(stock?'market-product-photo--illustrative':'')} src={url}
      alt={verifiedUrl?'Foto '+product.name+' milik Dapur Ummi Kyana':'Foto ilustrasi hidangan sejenis; bukan foto produk aktual '+product.name}
      loading={hero?'eager':'lazy'} decoding="async" referrerPolicy="no-referrer"/>
    {stock&&<span className="market-illustration-label market-illustration-label--photo" title={'Fotografi editorial: '+stock.credit+' / Unsplash'}>Foto ilustrasi</span>}
  </>:<><FoodArt product={product} compact={compact}/><span className="market-illustration-label">Ilustrasi menu</span></>}
 </div>;
}
