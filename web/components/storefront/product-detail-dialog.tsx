'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Leaf, Minus, Plus, X } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatRupiah } from '@/lib/catalog';
import ProductVisual from '@/components/product-visual';

type Props={product:Product|null;onClose:()=>void;onAdd:(slug:string,quantity:number)=>void};
export default function ProductDetailDialog({product,onClose,onAdd}:Props){
 const [quantity,setQuantity]=useState(1);
 const dialogRef=useRef<HTMLElement|null>(null);
 const closeRef=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{
   if(!product)return;
   setQuantity(1);
   const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
   const previousOverflow=document.body.style.overflow;
   document.body.style.overflow='hidden';
   closeRef.current?.focus();
   const onKey=(event:KeyboardEvent)=>{
     if(event.key==='Escape'){event.preventDefault();onClose()}
     if(event.key==='Tab'&&dialogRef.current){
       const focusables=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])'));
       if(!focusables.length)return;
       const first=focusables[0],last=focusables[focusables.length-1];
       if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
       else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
     }
   };
   document.addEventListener('keydown',onKey);
   return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow;previous?.focus()};
 },[product?.slug]);
 if(!product)return null;
 return <div className="vnext-detail-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}>
   <section className="vnext-detail" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="vnext-detail-title" tabIndex={-1}>
     <div className="vnext-detail-photo"><ProductVisual product={product} hero/><span className="vnext-detail-photo-label">FROM OUR KITCHEN · PALEMBANG</span></div>
     <div className="vnext-detail-content">
       <button ref={closeRef} className="vnext-detail-close" type="button" onClick={onClose} aria-label="Tutup detail makanan"><X size={20}/></button>
       <span className="vnext-eyebrow">{product.category} / DETAIL MENU</span>
       <h2 id="vnext-detail-title">{product.name}</h2>
       <p className="vnext-detail-description">{product.description}</p>
       <div className="vnext-detail-metadata"><span><Leaf size={17}/> Menu rumahan</span><span>Harga demo: {formatRupiah(product.price_idr)}</span></div>
       <div className="vnext-detail-info"><div><strong>Detail pesanan</strong><span>Informasi untuk pembelian demo</span></div><div><span>Komposisi & alergen</span><span>Belum diverifikasi dapur</span></div><div><span>Penjadwalan</span><span>Dipilih saat checkout</span></div></div>
       <div className="vnext-detail-action"><div className="vnext-quantity"><button type="button" onClick={()=>setQuantity(q=>Math.max(1,q-1))} disabled={quantity<=1} aria-label="Kurangi jumlah"><Minus size={16}/></button><strong>{quantity}</strong><button type="button" disabled={quantity>=50} onClick={()=>setQuantity(q=>Math.min(50,q+1))} aria-label="Tambah jumlah"><Plus size={16}/></button></div><button type="button" className="vnext-detail-buy" onClick={()=>onAdd(product.slug,quantity)}>Tambah {formatRupiah(product.price_idr*quantity)} <ArrowRight size={18}/></button></div>
       <small className="vnext-detail-disclaimer">Mode demo: tidak menerima atau memindahkan uang asli.</small>
     </div>
   </section>
 </div>;
}
