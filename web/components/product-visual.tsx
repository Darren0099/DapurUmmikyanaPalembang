import Image from 'next/image';
import type { Product } from '@/lib/catalog';
import FoodArt from '@/components/food-art';
import { archiveMenuPhotos } from '@/lib/archive-media';

/**
 * Product media precedence:
 * 1) owner-managed verified HTTPS URL (when the store DB is configured)
 * 2) an image actually referenced by the original index.php menu card
 * 3) a clearly labeled generic dish illustration
 *
 * No photos of unrelated third-party menu items, no false merchant claims.
 */
export default function ProductVisual({product,hero=false,compact=false}:{product:Product;hero?:boolean;compact?:boolean}) {
 const merchantUrl=typeof product.image_url==='string'&&/^https:\/\//i.test(product.image_url)?product.image_url:null;
 const historicalUrl=merchantUrl?null:archiveMenuPhotos[product.slug];
 const url=merchantUrl||historicalUrl;
 return <div className={'market-visual '+(hero?'market-visual--hero ':'')+(compact?'market-visual--compact ':'')+'market-visual--'+product.accent}>
   {url ? <>
     {historicalUrl
       ? <Image className="market-product-photo market-product-photo--archived" src={historicalUrl}
           alt={'Foto arsip menu '+product.name+' dari website Dapur Ummi Kyana terdahulu'}
           fill sizes={hero?'(max-width: 700px) 90vw, 520px':compact?'90px':'(max-width: 700px) 48vw, 300px'}
           priority={hero} quality={78}/>
       : <img className="market-product-photo" src={merchantUrl!} alt={'Foto '+product.name}
           loading={hero?'eager':'lazy'} decoding="async" referrerPolicy="no-referrer"/>}
     {historicalUrl&&<span className="market-illustration-label market-illustration-label--photo">Foto arsip situs lama</span>}
   </> : <>
     <FoodArt product={product} compact={compact}/>
     <span className="market-illustration-label">Ilustrasi menu</span>
   </>}
 </div>;
}
