'use client';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatRupiah } from '@/lib/catalog';
import ProductVisual from '@/components/product-visual';

/**
 * Editorial highlights, inspired by the supplied Foodbar and Flying Food
 * compositions. Values come exclusively from the Product API.
 */
export default function EditorialShowcase({products,onOpen,onAdd}:{products:Product[];onOpen:(product:Product)=>void;onAdd:(slug:string)=>void}){
  const [lead,...rest]=products;
  if(!lead)return null;
  return <section className="duy24-editorial" aria-label="Pilihan menu dan cerita dapur">
    <div className="container duy24-editorial-inner">
      <div className="duy24-editorial-heading"><span>THE KITCHEN EDIT / 01</span><p>Pilihan rasa rumahan, dengan tampilan yang membuat makanan menjadi pusat perhatian.</p></div>
      <div className="duy24-editorial-stage">
        <div className="duy24-editorial-art">
          <span className="duy24-editorial-watermark" aria-hidden="true">Dapur<br/>Ummi</span>
          <div className="duy24-editorial-plate"><ProductVisual product={lead} hero/></div>
          <span className="duy24-editorial-side-label">FRESHLY PREPARED — PALEMBANG</span>
        </div>
        <div className="duy24-editorial-text">
          <span className="duy24-label">HANDPICKED FOR YOU</span>
          <h2>{lead.name}<em>.</em></h2>
          <p>{lead.description}</p>
          <span className="duy24-editorial-price">{formatRupiah(lead.price_idr)} <small>harga demo</small></span>
          <button type="button" onClick={()=>onOpen(lead)}>Lihat detail menu <ArrowUpRight size={18}/></button>
        </div>
      </div>
      {rest.length>0&&<div className="duy24-editorial-mini-grid">{rest.slice(0,4).map((item,index)=><article className="duy24-editorial-mini" key={item.slug}>
        <button type="button" aria-label={'Lihat '+item.name} onClick={()=>onOpen(item)} className="duy24-editorial-mini-photo"><ProductVisual product={item} compact/></button>
        <div><small>0{index+2} / {item.category}</small><h3>{item.name}</h3><strong>{formatRupiah(item.price_idr)}</strong></div>
        <button type="button" className="duy24-editorial-mini-add" onClick={()=>onAdd(item.slug)} aria-label={'Tambah '+item.name}><ArrowRight size={17}/></button>
      </article>)}</div>}
    </div>
  </section>;
}
