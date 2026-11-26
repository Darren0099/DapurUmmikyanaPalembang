'use client';
import { ArrowRight, ArrowUpRight, ChevronDown, Plus, Search, UtensilsCrossed } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatRupiah } from '@/lib/catalog';
import { presentation } from '@/lib/storefront-presentation';
import ProductVisual from '@/components/product-visual';

type Props={
  products:Product[]; categories:string[]; total:number;
  category:string; search:string; expanded:boolean;
  onCategory:(category:string)=>void;onSearch:(value:string)=>void;
  onExpand:()=>void;onOpen:(product:Product)=>void;onAdd:(slug:string)=>void;
};
export default function CatalogSection({products,categories,total,category,search,expanded,onCategory,onSearch,onExpand,onOpen,onAdd}:Props){
 return <section className="market-catalog-section vnext-catalog" id="menu" aria-labelledby="vnext-catalog-heading"><div className="container">
    <div className="vnext-section-head"><div><span className="vnext-eyebrow">01 / OUR KITCHEN</span><h2 id="vnext-catalog-heading">{presentation.sectionLabels.catalog}<em>.</em></h2><p>Temukan menu favorit dengan pilihan rasa Nusantara untuk setiap kesempatan.</p></div><span className="vnext-section-side"><UtensilsCrossed size={18}/> MADE WITH CARE</span></div>
    <div className="vnext-catalog-toolbar">
      <div className="vnext-category-list" aria-label="Filter kategori">{categories.map(c=><button key={c} type="button" aria-pressed={category===c} className={category===c?'active':''} onClick={()=>onCategory(c)}>{c}</button>)}</div>
      <label className="vnext-search"><Search size={18}/><input type="search" value={search} onChange={e=>onSearch(e.target.value)} placeholder="Cari menu favorit..." aria-label="Cari nama atau deskripsi menu"/></label>
    </div>
    <div className="vnext-catalog-note"><span aria-hidden="true">i</span><p>{presentation.brand.demoNotice}. Nama dan foto dari arsip, perlu verifikasi pemilik untuk pemesanan nyata.</p></div>
    {products.length>0?<div className="vnext-product-grid">{products.map((product,index)=><article className="vnext-product-card" key={product.slug} style={{animationDelay:Math.min(index,7)*45+'ms'}}>
      <div className="vnext-product-frame">
        {product.featured&&<span className="vnext-product-tag">Pilihan dapur</span>}
        <button type="button" className="vnext-product-photo" onClick={()=>onOpen(product)} aria-label={'Lihat detail '+product.name}><ProductVisual product={product}/></button>
        <button type="button" className="vnext-product-add" aria-label={'Tambah '+product.name+' ke keranjang'} onClick={()=>onAdd(product.slug)}><Plus size={20}/></button>
      </div>
      <div className="vnext-product-body"><span className="vnext-product-category">{product.category}</span><h3><button type="button" onClick={()=>onOpen(product)}>{product.name} <ArrowUpRight size={16}/></button></h3><p>{product.description}</p><div className="vnext-product-foot"><strong>{formatRupiah(product.price_idr)}</strong><button type="button" onClick={()=>onOpen(product)}>Detail <ArrowRight size={15}/></button></div></div>
    </article>)}</div>:<div className="vnext-no-results"><Search size={29}/><h3>Menu tidak ditemukan</h3><p>Coba kata kunci atau kategori yang berbeda.</p></div>}
    {total>8&&<div className="vnext-showmore"><button type="button" onClick={onExpand} aria-expanded={expanded}>{expanded?'Tampilkan lebih sedikit':`Lihat semua ${total} menu`} <ChevronDown size={17} className={expanded?'up':''}/></button></div>}
  </div></section>;
}
