'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { archiveFeatures } from '@/lib/archive-media';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight,
  Clock3, HeartHandshake, Leaf, MapPin, Menu, Minus, Plus, Search,
  ShoppingBag, Sparkles, Truck, UtensilsCrossed, X, Gift, ChefHat, HandPlatter, BadgeCheck, Play, Pause,
} from 'lucide-react';
import { formatRupiah, type Product } from '@/lib/catalog';
import { useCart } from '@/components/cart-provider';
import ProductVisual from '@/components/product-visual';
import ServiceCards from '@/components/service-cards';



const archiveQuotes = [
  'Menu Makanannya beragam, jadi pengen pesen lagi mana murah di kantong.',
  'Menu nya enak-enak, apalagi ayam bakar nya. Favorit banget tuh menunya!',
];

export default function Storefront({products, live}:{products:Product[];live:boolean}) {
  const cart = useCart();
  const [category, setCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [selectedProduct,setSelectedProduct]=useState<Product|null>(null);
  const [detailQty,setDetailQty]=useState(1);
  const [mobileNav, setMobileNav] = useState(false);
  const [active, setActive] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const paused = hoverPaused || manualPaused;
  const [testimonial, setTestimonial] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const archivedGallery = [
    {src:archiveFeatures.nasiBritani,name:'Nasi Britani',desc:'Dari halaman bestseller tahun 2025',cat:'MENU',alt:'Foto arsip Nasi Britani dari website lama'},
    {src:archiveFeatures.tumpeng,name:'Tumpeng Mini',desc:'Dokumentasi katalog paket tumpeng',cat:'CATERING',alt:'Foto arsip tumpeng mini dari halaman layanan lama'},
    {src:archiveFeatures.gubukan,name:'Prasmanan & Gubukan',desc:'Visual arsip layanan acara',cat:'ACARA',alt:'Foto arsip layanan gubukan dari situs lama'},
  ];

  const categories = useMemo(()=>['Semua',...Array.from(new Set(products.map(p=>p.category)))],[products]);
  const featured = useMemo(()=>{
    // First carousel slide shows a historically listed dish with a matching
    // illustrative photograph. Real merchant imagery always takes priority.
    const priority=['nasi-ayam-bakar','nasi-ayam-geprek','nasi-ayam-goreng-lengkuas'];
    const selected=priority.map(slug=>products.find(p=>p.slug===slug)).filter((p):p is Product=>Boolean(p));
    const extras=products.filter(p=>p.featured&&!selected.some(x=>x.slug===p.slug));
    return [...selected,...extras,...products].filter((p,index,all)=>all.findIndex(item=>item.slug===p.slug)===index).slice(0,4);
  },[products]);
  const current = featured[active%Math.max(1,featured.length)] || products[0];
  const filtered = useMemo(()=>
    products.filter(p=>(category==='Semua'||p.category===category)&&
      p.name.toLocaleLowerCase('id-ID').includes(search.toLocaleLowerCase('id-ID'))),
    [products,category,search]);
  const visible = showAll ? filtered : filtered.slice(0,8);
  const chosen = cart.items.map(item=>({item,product:products.find(p=>p.slug===item.slug)}))
    .filter((item):item is {item:typeof cart.items[number];product:Product}=>Boolean(item.product));
  const subtotal = chosen.reduce((sum,{item,product})=>sum+product.price_idr*item.quantity,0);


  useEffect(()=>{
    if(paused || featured.length<2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(()=>setActive(index=>(index+1)%featured.length),6200);
    return ()=>window.clearInterval(interval);
  },[featured.length,paused]);

  useEffect(()=>{
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced||!('IntersectionObserver' in window))return;
    const targets=[...document.querySelectorAll<HTMLElement>('.market-quick-categories,.market-editorial-picks,.market-catalog-section,.market-offer-section,.market-service-section,.market-gallery-section,.market-about-section,.market-how-section,.market-final-cta')];
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('duy-revealed');observer.unobserve(entry.target)}}
    },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
    for(const el of targets){el.classList.add('duy-reveal');observer.observe(el)}
    return ()=>{observer.disconnect();for(const el of targets)el.classList.remove('duy-reveal','duy-revealed')};
  },[]);
  useEffect(()=>{
    if(!selectedProduct&&!drawer)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){setSelectedProduct(null);setDrawer(false)}};
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[selectedProduct,drawer]);

  const changeSlide = (direction:number) => {if(featured.length<2)return;setActive(index=>(index+direction+featured.length)%featured.length);};
  const addToCart = (slug:string) => { cart.add(slug); setDrawer(true); };

  return <div className="market-root">
    <div className="market-topline"><div className="container market-topline-content"><span><Sparkles size={13}/> DEMO TOKO — pembayaran simulasi, harga menu referensi arsip</span><span><MapPin size={13}/> Palembang, Sumatera Selatan</span></div></div>
    <header className="market-header"><div className="container market-nav">
      <Link className="market-brand" href="/" aria-label="Dapur Ummi Kyana — beranda">
        <span className="market-brand-mark market-brand-mark--archive"><Image src="/archive/brand/logo12.jpg" alt="" width={44} height={44} priority/></span>
        <span><strong>Dapur Ummi Kyana</strong><small>HOMEMADE • PALEMBANG</small></span>
      </Link>
      <nav className={'market-links '+(mobileNav?'market-links--open':'')} aria-label="Navigasi utama">
        <a href="#beranda" onClick={()=>setMobileNav(false)}>Beranda</a>
        <a href="#menu" onClick={()=>setMobileNav(false)}>Menu</a>
        <Link href="/layanan" onClick={()=>setMobileNav(false)}>Paket & Catering</Link>
        <a href="#galeri" onClick={()=>setMobileNav(false)}>Galeri</a>
        <a href="#tentang" onClick={()=>setMobileNav(false)}>Tentang</a>
      </nav>
      <div className="market-nav-actions">
        <Link className="market-contact-link" href="/account">Pesanan saya <ArrowUpRight size={15}/></Link>
        <button type="button" className="market-cart-button" aria-label={'Buka keranjang, '+cart.count+' item'} onClick={()=>setDrawer(true)}><ShoppingBag size={21}/>{cart.count>0&&<span className="market-cart-badge">{cart.count}</span>}</button>
        <button type="button" className="market-mobile-trigger" aria-label={mobileNav?'Tutup menu':'Buka menu'} aria-expanded={mobileNav} onClick={()=>setMobileNav(!mobileNav)}>{mobileNav?<X size={22}/>:<Menu size={22}/>}</button>
      </div>
    </div></header>

    <main>
      <section id="beranda" className="duy-hero" aria-label="Menu unggulan Dapur Ummi Kyana" onMouseEnter={()=>setHoverPaused(true)} onMouseLeave={()=>setHoverPaused(false)} onFocusCapture={()=>setHoverPaused(true)} onBlurCapture={()=>setHoverPaused(false)}>
        <div className="container duy-hero-layout">
          <div className="duy-hero-intro">
            <span className="duy-kicker"><span className="duy-kicker-dot"/> MADE WITH LOVE IN PALEMBANG</span>
            <h1>Good food.<br/><em>Good moments.</em></h1>
            <p>Masakan rumahan, nasi box, dan katering untuk setiap cerita. Pilih hidangan favoritmu, atur jumlahnya, dan pesan langsung melalui website.</p>
            <div className="duy-hero-intro-actions">
              <a href="#menu" className="duy-text-link">Explore our menu <ArrowUpRight size={17}/></a>
              <span>01 — MENU PILIHAN</span>
            </div>
          </div>
          <div className="duy-hero-center">
            <span className="duy-hero-orbit duy-hero-orbit-one" aria-hidden="true"/>
            <span className="duy-hero-orbit duy-hero-orbit-two" aria-hidden="true"/>
            <div className="duy-hero-dish" key={current?.slug}>
              {current&&<ProductVisual product={current} hero/>}
            </div>
            <div className="duy-hero-price">
              <div><small>MENU UNGGULAN · HARGA DEMO</small><strong>{formatRupiah(current?.price_idr||0)}</strong></div>
              {current&&<button type="button" onClick={()=>addToCart(current.slug)}>Add to cart <ArrowRight size={18}/></button>}
            </div>
          </div>
          <div className="duy-hero-choices" aria-label="Pilih makanan unggulan">
            <div className="duy-choices-heading"><span>OUR FAVORITES</span><small>{String(active+1).padStart(2,'0')} / {String(featured.length).padStart(2,'0')}</small></div>
            {featured.slice(0,3).map((item,index)=><button className={'duy-choice '+(index===active?'duy-choice-active':'')} key={item.slug} type="button" onClick={()=>setActive(index)} aria-pressed={index===active}>
              <span className="duy-choice-photo"><ProductVisual product={item} compact/></span>
              <span className="duy-choice-label"><strong>{item.name}</strong><small>{formatRupiah(item.price_idr)}</small></span>
              <ArrowUpRight size={16}/>
            </button>)}
            <div className="duy-hero-controls">
              <button type="button" onClick={()=>changeSlide(-1)} aria-label="Makanan sebelumnya"><ChevronLeft size={19}/><span>Prev</span></button>
              <span className="duy-progress-track"><i key={active} style={{animationPlayState:paused?'paused':'running'}}/></span>
              <button type="button" onClick={()=>changeSlide(1)} aria-label="Makanan selanjutnya"><span>Next</span><ChevronRight size={19}/></button>
              <button className="duy-pause" type="button" onClick={()=>setManualPaused(x=>!x)} aria-label={paused?'Putar carousel':'Jeda carousel'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>
            </div>
          </div>
        </div>
        <div className="container duy-hero-bottom"><span><Sparkles size={15}/> HOMEMADE • FRESHLY PREPARED</span><span>PALEMBANG, SUMATERA SELATAN</span><a href="#menu">SCROLL TO DISCOVER ↓</a></div>
      </section>

      <section className="market-quick-categories" aria-label="Jelajahi kategori">
        <div className="container market-shortcut-grid">
          {[
            {name:'Semua menu',label:'Jelajahi pilihan',icon:UtensilsCrossed,cat:'Semua'},
            {name:'Nasi Box',label:'Untuk makan harian',icon:ShoppingBag,cat:'Nasi Box'},
            {name:'Seafood',label:'Lauk penuh rasa',icon:Leaf,cat:'Seafood'},
            {name:'Snack Box',label:'Untuk pertemuan',icon:Gift,href:'/layanan/snack-box'},
            {name:'Tumpeng Mini',label:'Untuk perayaan',icon:ChefHat,href:'/layanan/tumpeng-mini'},
            {name:'Prasmanan',label:'Untuk acara',icon:HandPlatter,href:'/layanan/prasmanan-gubukan'},
          ].map(item=>{
            const Icon=item.icon;
            const content=<><span className="market-shortcut-icon"><Icon size={23} strokeWidth={1.6}/></span><strong>{item.name}</strong><small>{item.label}</small></>;
            return item.href ? <Link href={item.href} className="market-shortcut-card" key={item.name}>{content}</Link>
              : <a href="#menu" key={item.name} className="market-shortcut-card" onClick={()=>{setCategory(item.cat||'Semua');setShowAll(false)}}>{content}</a>;
          })}
        </div>
      </section>
      <section className="market-editorial-picks">
        <div className="container">
          <div className="market-editorial-picks-heading"><span className="market-eyebrow">PILIHAN DARI KATALOG LAMA</span><p>Inspirasi hidangan untuk berbagai suasana. Harga yang ditampilkan adalah referensi arsip.</p></div>
          <div className="market-editorial-picks-grid">
            {[featured[1]||products[1],featured[2]||products[2]].filter((p):p is Product=>Boolean(p)).map((p,i)=>(
              <article className={'market-editorial-pick market-editorial-pick--'+(i+1)} key={p.slug}>
                <div className="market-editorial-pick-image"><ProductVisual product={p} hero/></div>
                <div className="market-editorial-pick-copy"><span>PILIHAN 0{i+1}</span><h2>{p.name}</h2><p>{p.description}</p><div><strong>{formatRupiah(p.price_idr)} <small>referensi</small></strong><button type="button" onClick={()=>addToCart(p.slug)}>Pilih menu <ArrowUpRight size={16}/></button></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="market-ticker"><div className="container market-ticker-inner"><span><Leaf size={18}/> Menu rumahan</span><i/><span><UtensilsCrossed size={18}/> Rasa Nusantara</span><i/><span><Truck size={18}/> Tanya jadwal pengiriman</span><i/><span><HeartHandshake size={18}/> Catering & acara</span></div></div>

      <section className="market-catalog-section" id="menu"><div className="container">
        <div className="market-section-head"><div><span className="market-eyebrow">PILIH YANG KAMU SUKA</span><h2>Menu pilihan <em>dapur kami.</em></h2><p>Jelajahi menu, pilih porsi, dan selesaikan checkout demo langsung di website.</p></div><span className="market-section-number">01 / OUR MENU</span></div>
        {<div className="market-menu-note"><Check size={18}/><p><strong>Mode demo.</strong> Harga merupakan referensi historis dan bukan penawaran aktif. Pembayaran hanya simulasi tanpa uang asli. Foto berasal dari aset website arsip 2025; menu, komposisi, dan harga terkini tetap perlu dikonfirmasi.</p></div>}
        <div className="market-product-toolbar">
          <div className="market-category-tabs" role="group" aria-label="Filter menu">{categories.map(cat=><button type="button" key={cat} className={category===cat?'market-tab--active':''} aria-pressed={category===cat} onClick={()=>{setCategory(cat);setShowAll(false)}}>{cat}</button>)}</div>
          <label className="market-search"><Search size={17}/><input type="search" placeholder="Cari hidangan..." aria-label="Cari menu makanan" value={search} onChange={event=>{setSearch(event.target.value);setShowAll(false)}}/></label>
        </div>
        <div className="duy-product-grid">{visible.map((product,index)=><article key={product.slug} className="duy-product-card" style={{animationDelay:(Math.min(index,7)*65)+'ms'}}>
          <div className="duy-product-image">
            {product.featured&&<span className="duy-featured-label">OUR FAVORITE</span>}
            <button className="duy-product-visual-trigger" type="button" onClick={()=>{setSelectedProduct(product);setDetailQty(1)}} aria-label={'Lihat detail '+product.name}><ProductVisual product={product}/></button>
            <button type="button" className="duy-quick-cart" onClick={()=>addToCart(product.slug)} aria-label={'Tambahkan '+product.name}><Plus size={20}/></button>
          </div>
          <div className="duy-product-content"><span>{product.category}</span><h3><button type="button" onClick={()=>{setSelectedProduct(product);setDetailQty(1)}}>{product.name} <ArrowUpRight size={15}/></button></h3><p>{product.description}</p><div className="duy-product-bottom"><strong>{formatRupiah(product.price_idr)}</strong><button type="button" onClick={()=>{setSelectedProduct(product);setDetailQty(1)}}>Lihat menu <ArrowRight size={16}/></button></div></div>
        </article>)}</div>
        {filtered.length===0&&<div className="market-empty-result"><Search size={27}/><h3>Menu tidak ditemukan</h3><p>Coba kategori atau kata kunci lain.</p></div>}
        {filtered.length>8&&<div className="market-view-all"><button type="button" onClick={()=>setShowAll(!showAll)}>{showAll?'Tampilkan lebih sedikit':'Lihat semua '+filtered.length+' menu'} <ChevronDown className={showAll?'market-chevron-up':''} size={17}/></button></div>}
      </div></section>

      <section className="market-offer-section"><div className="container market-offer-grid">
        <div className="market-offer-copy"><span className="market-eyebrow">DARI DAPUR UNTUK ACARA KAMU</span><h2>Ada acara? <em>Biar kami yang siapkan.</em></h2><p>Dari snack box hingga tumpeng mini dan prasmanan, temukan pilihan layanan dari arsip Dapur Ummi Kyana. Tanyakan paket, kapasitas, dan harga terkini.</p><Link href="/layanan" className="market-button market-button--primary">Eksplor paket catering <ArrowUpRight size={17}/></Link><div className="market-offer-note">Pilihan dan harga perlu konfirmasi penjual.</div></div>
        <div className="market-offer-art"><span className="market-offer-round" aria-hidden="true"/><div className="market-offer-platter"><Image src={archiveFeatures.tumpeng} alt="Foto arsip tumpeng mini dari website catering lama" fill sizes="(max-width: 860px) 100vw, 45vw" quality={78}/></div><span className="market-offer-stamp">DARI DAPUR<br/>UNTUK ACARA</span><span className="market-offer-decoration" aria-hidden="true"/></div>
      </div></section>

      <section id="paket" className="market-service-section"><div className="container">
        <div className="market-section-head"><div><span className="market-eyebrow">PILIHAN PAKET</span><h2>Setiap momen punya <em>ceritanya.</em></h2><p>Jelajahi empat layanan dari website pertama kami, kini dengan halaman detail masing-masing.</p></div><span className="market-section-number">02 / OUR SERVICES</span></div>
        <ServiceCards compact/>
        <div className="market-all-services"><Link href="/layanan">Selengkapnya tentang layanan <ArrowRight size={17}/></Link></div>
      </div></section>

      <section className="market-gallery-section" id="galeri"><div className="container">
        <div className="market-section-head"><div><span className="market-eyebrow">CERITA DI BALIK SETIAP SAJIAN</span><h2>Lebih dekat dengan <em>hidangan kami.</em></h2>
          <p>Galeri ini memulihkan foto dan visual dari website Dapur Ummi Kyana versi 2025. Dokumentasi arsip tidak menjadi bukti harga atau paket yang masih berlaku saat ini.</p></div><span className="market-section-number">03 / FOOD JOURNAL</span></div>
        <div className="market-gallery-grid">
          {archivedGallery.map((_,index)=>{
            const item=archivedGallery[(galleryIndex+index)%archivedGallery.length];
            return <article className={'market-gallery-tile market-gallery-tile--'+index} key={item.src}>
              <div className="market-gallery-image market-gallery-image--archive">
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 700px) 100vw, 33vw" quality={78}/>
                <span className="market-gallery-archive-stamp">FOTO ARSIP 2025</span>
              </div>
              <div className="market-gallery-caption"><span>0{index+1} / {item.cat}</span><h3>{item.name}</h3><p>{item.desc}</p></div>
            </article>;
          })}
        </div>
        <div className="market-gallery-bottom"><span>Sumber: folder gambar dari repository versi final 2025.</span><button type="button" onClick={()=>setGalleryIndex(n=>(n+1)%archivedGallery.length)}>Ganti pilihan visual <ArrowRight size={16}/></button></div>
      </div></section>

      <section id="tentang" className="market-story-section"><div className="container market-story-grid">
        <div className="market-story-visual"><div className="market-story-shape" aria-hidden="true"/><div className="market-story-dish">{current&&<ProductVisual product={current} hero/>}</div><span className="market-story-signature">Hangat dari dapur kami.</span><div className="market-story-vertical">D A P U R &nbsp; U M M I &nbsp; K Y A N A</div></div>
        <div className="market-story-copy"><span className="market-eyebrow">CERITA DI BALIK DAPUR</span><h2>Lebih dari makanan. <em>Ini tentang rasa pulang.</em></h2><p>Dapur Ummi Kyana berawal dari pilihan hidangan rumahan di Palembang. Mulai dari nasi box untuk keseharian hingga menu untuk berbagai kesempatan, setiap hidangan menyimpan cerita di meja makan.</p><div className="market-story-features">
          <div><span className="market-story-icon"><Leaf size={19}/></span><div><strong>Aneka hidangan Nusantara</strong><small>Menu nasi, ayam, seafood, dan pilihan acara.</small></div></div>
          <div><span className="market-story-icon"><HeartHandshake size={19}/></span><div><strong>Pesanan lebih personal</strong><small>Konsultasi detail pesanan langsung dengan pengelola.</small></div></div>
          <div><span className="market-story-icon"><MapPin size={19}/></span><div><strong>Berbasis di Palembang</strong><small>Jadwal dan jangkauan pengiriman dikonfirmasi terlebih dahulu.</small></div></div>
        </div><Link className="market-story-link" href="/layanan">Kenali layanan kami <ArrowUpRight size={17}/></Link></div>
      </div></section>

      <section className="market-voice-section"><div className="container market-voice-grid">
        <div><span className="market-eyebrow">ARSIP WEBSITE PERTAMA</span><h2>Kalimat yang <em>pernah ditinggalkan.</em></h2><p>Cuplikan testimoni tercantum dalam sumber website lama. Identitas dan ulasan ini belum diverifikasi ulang, jadi ditampilkan sebagai arsip, bukan rating aktif.</p></div>
        <div className="market-voice-card"><span className="market-quote-mark" aria-hidden="true">“</span><blockquote>{archiveQuotes[testimonial]}</blockquote><div className="market-voice-bottom"><span>Arsip testimoni · Dapur Ummi Kyana</span><div><button type="button" aria-label="Lihat testimoni sebelumnya" onClick={()=>setTestimonial(index=>(index-1+archiveQuotes.length)%archiveQuotes.length)}><ArrowLeft size={17}/></button><button type="button" aria-label="Lihat testimoni berikutnya" onClick={()=>setTestimonial(index=>(index+1)%archiveQuotes.length)}><ArrowRight size={17}/></button></div></div></div>
      </div></section>

      <section id="cara-pesan" className="market-how-section"><div className="container"><div className="market-section-head market-section-head--center"><div><span className="market-eyebrow">PEMESANAN LEBIH MUDAH</span><h2>Dari pilihan, <em>jadi pesanan.</em></h2><p>Tiga langkah sederhana untuk menghubungi Dapur Ummi Kyana.</p></div></div>
      <div className="market-how-grid"><div><span>01</span><ShoppingBag size={28}/><h3>Pilih menu favorit</h3><p>Jelajahi hidangan dan masukkan pilihan ke keranjang.</p></div><div><span>02</span><HeartHandshake size={28}/><h3>Konfirmasi pesanan</h3><p>Hubungi penjual untuk memastikan stok, harga, dan kebutuhan acara.</p></div><div><span>03</span><Clock3 size={28}/><h3>Tentukan pembayaran</h3><p>Ikuti informasi pembayaran resmi dari pengelola. Pembayaran otomatis belum diaktifkan.</p></div></div>
      </div></section>

      <section className="market-final-cta"><div className="container market-final-inner"><div><span className="market-eyebrow">SIAP UNTUK MENIKMATI?</span><h2>Rasa istimewa, <em>berawal di sini.</em></h2><p>Pilih hidangan favorit, lalu coba checkout langsung di website tanpa transaksi uang sungguhan.</p></div><a className="market-button market-button--cream" href="#menu">Pilih menu sekarang <ArrowUpRight size={19}/></a></div></section>
    </main>

    <footer className="market-footer"><div className="container">
      <div className="market-footer-grid"><div><div className="market-brand market-footer-brand"><span className="market-brand-mark market-brand-mark--archive"><Image src="/archive/brand/logo12.jpg" alt="" width={44} height={44}/></span><span><strong>Dapur Ummi Kyana</strong><small>HOMEMADE • PALEMBANG</small></span></div><p>Diracik dengan sepenuh hati, untuk setiap meja dan cerita.</p></div><div><strong>Jelajahi</strong><a href="#menu">Menu</a><Link href="/layanan">Paket & Catering</Link><a href="#galeri">Galeri</a><a href="#tentang">Tentang Kami</a></div><div><strong>Informasi</strong><a href="#cara-pesan">Cara memesan</a><Link href="/account">Status pesanan <ArrowUpRight size={13}/></Link><span>Palembang, Indonesia</span></div><div><strong>Akun</strong><Link href="/account">Akun & Pesanan</Link><Link href="/login">Masuk pelanggan</Link><Link href="/admin">Panel admin</Link></div></div>
      <div className="market-footer-base"><span>© {new Date().getFullYear()} Dapur Ummi Kyana Palembang.</span><span>Dibuat dengan sepenuh hati. · Fotografi situs lama, direstorasi dari arsip GitHub</span></div>
    </div></footer>

    {selectedProduct&&<div className="duy-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedProduct(null)}}>
      <section className="duy-detail-dialog" role="dialog" aria-modal="true" aria-label={'Detail '+selectedProduct.name}>
        <div className="duy-detail-photo">
          <span className="duy-detail-deco" aria-hidden="true">FRESH FROM OUR KITCHEN</span>
          <ProductVisual product={selectedProduct} hero/>
          <div className="duy-detail-photo-caption"><span>MADE WITH LOVE</span><strong>Homemade,<br/>for you.</strong></div>
        </div>
        <div className="duy-detail-info">
          <button type="button" className="duy-dialog-close" aria-label="Tutup detail" onClick={()=>setSelectedProduct(null)}><X size={21}/></button>
          <span className="duy-kicker">{selectedProduct.category} / DETAIL MENU</span>
          <h2>{selectedProduct.name}</h2>
          <div className="duy-detail-summary"><span><Leaf size={16}/> Masakan rumahan</span><span><Clock3 size={16}/> Pesan terjadwal</span></div>
          <p>{selectedProduct.description}</p>
          <div className="duy-detail-inclusions">
            <div><strong>Informasi pesanan</strong><small>Disesuaikan dengan kebutuhanmu</small></div>
            <div className="duy-detail-row"><span>Harga referensi per porsi</span><strong>{formatRupiah(selectedProduct.price_idr)}</strong></div>
            <div className="duy-detail-row"><span>Komposisi & alergen</span><small>Belum diverifikasi oleh dapur</small></div>
            <div className="duy-detail-row"><span>Ketersediaan</span><small>Konfirmasi melalui jadwal checkout</small></div>
          </div>
          <div className="duy-detail-checkout">
            <div className="duy-quantity"><button type="button" aria-label="Kurangi jumlah" disabled={detailQty<=1} onClick={()=>setDetailQty(n=>Math.max(1,n-1))}><Minus size={16}/></button><strong>{detailQty}</strong><button type="button" aria-label="Tambah jumlah" disabled={detailQty>=50} onClick={()=>setDetailQty(n=>Math.min(50,n+1))}><Plus size={16}/></button></div>
            <button type="button" className="duy-detail-add" onClick={()=>{for(let i=0;i<detailQty;i++)cart.add(selectedProduct.slug);setSelectedProduct(null);setDrawer(true)}}>Tambah {formatRupiah(selectedProduct.price_idr*detailQty)} <ArrowRight size={18}/></button>
          </div>
          <small className="duy-detail-disclaimer">Harga arsip untuk demo. Pembayaran simulasi, tidak ada transaksi uang asli.</small>
        </div>
      </section>
    </div>}
    <nav className="duy-mobile-dock" aria-label="Navigasi cepat mobile"><a href="#beranda" aria-label="Beranda"><UtensilsCrossed size={20}/><span>Home</span></a><a href="#menu" aria-label="Menu makanan"><Search size={20}/><span>Menu</span></a><button type="button" aria-label="Keranjang" onClick={()=>setDrawer(true)}><ShoppingBag size={20}/><span>Cart {cart.count>0?'('+cart.count+')':''}</span></button><Link href="/account" aria-label="Akun"><HeartHandshake size={20}/><span>Akun</span></Link></nav>
    {drawer&&<div className="drawer-layer" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDrawer(false)}}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="market-cart-title">
        <div className="drawer-head"><div><span className="market-eyebrow">PILIHAN KAMU</span><h2 id="market-cart-title">Keranjang <span>({cart.count})</span></h2></div><button type="button" className="icon-button" aria-label="Tutup keranjang" onClick={()=>setDrawer(false)}><X/></button></div>
        <div className="drawer-items">{chosen.length ? chosen.map(({item,product})=><div className="drawer-item" key={product.slug}><ProductVisual product={product} compact/><div className="drawer-item-text"><strong>{product.name}</strong><span>{formatRupiah(product.price_idr)}</span><div className="qty"><button type="button" aria-label={'Kurangi '+product.name} onClick={()=>cart.subtract(product.slug)}><Minus size={14}/></button><span>{item.quantity}</span><button type="button" aria-label={'Tambah '+product.name} onClick={()=>cart.add(product.slug)}><Plus size={14}/></button></div></div><button type="button" className="remove-item" aria-label={'Hapus '+product.name} onClick={()=>cart.remove(product.slug)}><X size={16}/></button></div>) : <div className="drawer-empty"><ShoppingBag size={44}/><h3>Keranjang masih kosong</h3><p>Pilih hidangan yang ingin dipesan terlebih dahulu.</p><button type="button" className="market-button market-button--outline" onClick={()=>setDrawer(false)}>Jelajahi menu</button></div>}</div>
        <div className="drawer-footer"><div className="subtotal"><span>{live?'Subtotal':'Subtotal referensi'}</span><strong>{formatRupiah(subtotal)}</strong></div><p>{live?'Belum termasuk ongkos kirim.':'Harga arsip perlu dikonfirmasi penjual; belum termasuk ongkir.'}</p>{live ? <Link href="/checkout" className={'market-button market-button--primary market-button--full '+(!chosen.length?'market-disabled':'')} aria-disabled={!chosen.length} onClick={event=>{if(!chosen.length)event.preventDefault()}}>Lanjut checkout <ArrowRight size={17}/></Link> : <span className="market-button market-button--primary market-button--full market-disabled" role="status">Checkout menunggu aktivasi toko</span>}</div>
      </aside>
    </div>}
  </div>;
}
