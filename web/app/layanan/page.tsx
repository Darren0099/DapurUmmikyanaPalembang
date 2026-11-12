import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BadgeCheck } from 'lucide-react';
import ServiceCards from '@/components/service-cards';

export const metadata:Metadata={
 title:'Layanan Catering, Snack Box, Tumpeng Mini & Prasmanan',
 description:'Jelajahi arsip jenis layanan Dapur Ummi Kyana Palembang: daily catering, snack box, tumpeng mini, serta prasmanan dan gubukan. Konfirmasi penawaran terkini.',
 alternates:{canonical:'/layanan'},
};
export default function ServicesPage() {
 return <main className="service-page">
   <header className="service-page-hero"><div className="container">
     <Link href="/#paket" className="service-back"><ArrowLeft size={16}/> Kembali ke beranda</Link>
     <div className="service-hero-layout"><div>
       <span className="eyebrow">DAPUR UMMI KYANA / LAYANAN</span>
       <h1>Paket untuk <em>setiap momen.</em></h1>
       <p>Dari makan harian sampai kebutuhan acara. Kenali pilihan yang pernah tersedia, lalu tanyakan langsung komposisi paket, harga serta jadwal terbaru.</p>
     </div><div className="service-hero-counter"><strong>04</strong><span>kategori layanan yang tercatat di arsip</span></div></div>
   </div></header>
   <section className="service-page-content section-spacing"><div className="container">
     <div className="service-context"><BadgeCheck size={20}/><p>Informasi di halaman ini bersumber dari website lama. Harga, ketentuan minimum, gratis ongkir, dan stok tidak dianggap berlaku saat ini tanpa konfirmasi penjual.</p></div>
     <ServiceCards />
   </div></section>
   <footer className="service-page-footer"><div className="container"><span>© {new Date().getFullYear()} Dapur Ummi Kyana Palembang</span><Link href="/#menu">Lihat katalog makanan <ArrowUpRight size={15}/></Link></div></footer>
 </main>;
}
