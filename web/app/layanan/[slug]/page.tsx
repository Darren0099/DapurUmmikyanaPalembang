import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, MessageCircle, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { serviceBySlug, serviceInquiryUrl, services } from '@/lib/services';

export function generateStaticParams(){return services.map(({slug})=>({slug}));}
export const dynamicParams = false;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
 const {slug}=await params;
 const service=serviceBySlug(slug);
 if(!service)return {title:'Layanan tidak ditemukan'};
 return {
  title:service.name+' — Paket Dapur Ummi Kyana',
  description:service.description+' Konfirmasi harga dan ketersediaan terkini langsung melalui penjual.',
  alternates:{canonical:`/layanan/${slug}`},
 };
}
export default async function ServiceDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const service=serviceBySlug(slug);
 if(!service)notFound();
 const others=services.filter(item=>item.slug!==slug);
 return <main className="service-page">
   <header className="service-page-hero service-page-hero--detail"><div className="container">
     <Link href="/#paket" className="service-back"><ArrowLeft size={16}/> Kembali ke pilihan paket</Link>
     <div className="service-hero-layout"><div>
       <span className="eyebrow">LAYANAN {service.index} / DAPUR UMMI KYANA</span>
       <h1>{service.name}<span className="service-heading-dot">.</span></h1>
       <p>{service.description} Informasi pada halaman ini adalah arsip penawaran lama dan belum dikonfirmasi sebagai penawaran aktif.</p>
       <a className="btn btn-primary service-hero-btn" href={serviceInquiryUrl(service)} target="_blank" rel="noopener noreferrer">Tanyakan paket via WhatsApp <ArrowUpRight size={17}/></a>
     </div><div className="service-hero-mark"><span>{service.index} / 04</span><UtensilsCrossed size={72} strokeWidth={1} aria-hidden="true"/><small>SEJAK DAPUR LAMA</small></div></div>
   </div></header>
   <section className="service-page-content section-spacing"><div className="container service-detail-layout">
     <article className="service-detail-main">
       <span className="eyebrow">KENALI LAYANAN</span><h2>Yang perlu kamu <em>ketahui.</em></h2><p>{service.overview}</p>
       <div className="service-archive"><span className="service-archive-label">REFERENSI DARI KODE LAMA · BUKAN PENAWARAN AKTIF</span><strong>{service.archivePrice}</strong><small>Harga arsip dan syarat lama hanya untuk dokumentasi, bukan harga checkout saat ini.</small></div>
       <h3>Catatan dari website pertama</h3><ul className="service-fact-list">{service.archiveNotes.map(note=><li key={note}><Check size={17} aria-hidden="true"/>{note}</li>)}</ul>
       <p className="service-origin">Sumber: {service.archiveSource}. File halaman khusus lama tidak tersedia apabila disebutkan dalam tautan arsip.</p>
     </article>
     <aside className="service-detail-aside">
       <div className="service-inquiry-panel"><div className="service-inquiry-icon"><MessageCircle size={26}/></div><span className="eyebrow">KONFIRMASI KE DAPUR</span><h2>Tanya harga & ketersediaan.</h2><p>Agar pengelola dapat memberi rincian yang tepat, siapkan informasi berikut:</p>
       <ul>{service.inquiryTips.map(item=><li key={item}><Check size={15}/>{item}</li>)}</ul>
       <a href={serviceInquiryUrl(service)} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-full">Hubungi via WhatsApp <ArrowUpRight size={16}/></a>
       <small><ShieldCheck size={15}/> Pembayaran tidak dilakukan melalui halaman ini.</small>
       </div>
     </aside>
   </div></section>
   <section className="service-related"><div className="container"><div className="section-top"><div><span className="eyebrow">PILIHAN LAIN</span><h2>Jelajahi layanan <em>lainnya.</em></h2></div></div><div className="service-related-grid">{others.map(item=><Link href={`/layanan/${item.slug}`} key={item.slug}><span>{item.index}</span><strong>{item.name}</strong><ArrowRight size={20}/></Link>)}</div></div></section>
   <footer className="service-page-footer"><div className="container"><span>© {new Date().getFullYear()} Dapur Ummi Kyana Palembang</span><Link href="/layanan">Semua layanan <ArrowUpRight size={15}/></Link></div></footer>
 </main>;
}
