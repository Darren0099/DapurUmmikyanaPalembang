'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { formatRupiah } from '@/lib/catalog';
import { presentation } from '@/lib/storefront-presentation';
import ProductVisual from '@/components/product-visual';

type Props = {
  featured: Product[];
  active: number;
  onSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onAdd: (slug: string) => void;
};
export default function HeroSection({ featured,active,onSelect,onPrevious,onNext,onAdd }: Props) {
  const [paused,setPaused] = useState(false);
  useEffect(()=>{
    if(paused || featured.length<2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(onNext,6500);
    return ()=>window.clearInterval(timer);
  },[paused,featured.length,onNext]);
  const current=featured[active % Math.max(1,featured.length)];
  return <section id="beranda" className="duy-hero vnext-hero" aria-labelledby="vnext-hero-heading">
    <div className="container vnext-hero-layout">
      <div className="vnext-hero-copy">
        <span className="vnext-eyebrow"><span aria-hidden="true"/> {presentation.brand.eyebrow}</span>
        <h1 id="vnext-hero-heading">Rasa rumahan.<br/><em>Untuk setiap momen.</em></h1>
        <p>{presentation.brand.supporting}</p>
        <div className="vnext-hero-cta"><a href="#menu" className="vnext-primary-link">Jelajahi menu <ArrowUpRight size={18}/></a><a href="#paket" className="vnext-secondary-link">Lihat paket <ArrowRight size={16}/></a></div>
        <span className="vnext-subnote">Makanan rumahan · Palembang, Sumatera Selatan</span>
      </div>
      <div className="vnext-hero-media" aria-live="polite">
        <span className="vnext-hero-ring" aria-hidden="true"/>
        {current ? <div key={current.slug} className="vnext-hero-plate"><ProductVisual product={current} hero/></div> : <div className="vnext-hero-empty">Menu segera hadir</div>}
        {current&&<div className="vnext-hero-action"><div><span>HARGA DEMO / PORSI</span><strong>{formatRupiah(current.price_idr)}</strong></div><button type="button" onClick={()=>onAdd(current.slug)} aria-label={'Tambahkan '+current.name+' ke keranjang'}>Tambah <ArrowRight size={18}/></button></div>}
      </div>
      <div className="vnext-hero-aside">
        <div className="vnext-selector-heading"><strong>Menu favorit</strong><span>{String(featured.length?active+1:0).padStart(2,'0')} / {String(featured.length).padStart(2,'0')}</span></div>
        <div className="vnext-selector-list">{featured.map((item,index)=><button key={item.slug} type="button" className={'vnext-selector '+(active===index?'is-current':'')} aria-pressed={active===index} onClick={()=>onSelect(index)}><span className="vnext-selector-photo"><ProductVisual product={item} compact/></span><span className="vnext-selector-copy"><strong>{item.name}</strong><small>{item.category}</small></span><ArrowUpRight size={16}/></button>)}</div>
        <div className="vnext-hero-controls"><button type="button" aria-label="Menu sebelumnya" onClick={onPrevious}><ChevronLeft size={18}/></button><span aria-hidden="true" className="vnext-control-dots">{featured.map((p,i)=><i key={p.slug} className={i===active?'active':''}/>)}</span><button type="button" aria-label="Menu berikutnya" onClick={onNext}><ChevronRight size={18}/></button><button type="button" className="vnext-play" onClick={()=>setPaused(p=>!p)} aria-label={paused?'Lanjutkan autoplay':'Hentikan autoplay'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button></div>
      </div>
    </div>
    <div className="container vnext-hero-footer"><span>MADE WITH CARE · SINCE OUR FIRST KITCHEN</span><a href="#menu">SCROLL TO DISCOVER <ArrowRight size={14}/></a></div>
  </section>;
}
