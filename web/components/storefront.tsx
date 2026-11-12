'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight,
  Clock3, HeartHandshake, Leaf, MapPin, Menu, Minus, Plus, Search,
  ShoppingBag, Sparkles, Truck, UtensilsCrossed, X, Gift, ChefHat, HandPlatter, BadgeCheck, Play, Pause,
} from 'lucide-react';
import { formatRupiah, type Product } from '@/lib/catalog';
import { useCart } from '@/components/cart-provider';
import ProductVisual from '@/components/product-visual';
import ServiceCards from '@/components/service-cards';

const waPhone = '6281268552388';
const whatsappUrl = (message:string) => 'https://wa.me/'+waPhone+'?text='+encodeURIComponent(message);
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
  const [mobileNav, setMobileNav] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);

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
  const whatsAppMessage = chosen.length
    ? 'Halo Dapur Ummi Kyana, mohon konfirmasi ketersediaan dan harga menu berikut:\n'+
      chosen.map(({item,product})=>'- '+product.name+' × '+item.quantity).join('\n')+
      '\n\nMohon rincian harga final, pengiriman, dan cara pembayaran. Terima kasih.'
    : 'Halo Dapur Ummi Kyana, saya ingin bertanya tentang menu dan pemesanan.';

  useEffect(()=>{
    if(paused || featured.length<2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(()=>setActive(index=>(index+1)%featured.length),6200);
    return ()=>window.clearInterval(interval);
  },[featured.length,paused]);

  const changeSlide = (direction:number) => {if(featured.length<2)return;setActive(index=>(index+direction+featured.length)%featured.length);};
  const addToCart = (slug:string) => { cart.add(slug); setDrawer(true); };

  return <div className="market-root">
    <div className="market-topline"><div className="container market-topline-content"><span><Sparkles size={13}/> Cita rasa rumahan dari Palembang</span><span><MapPin size={13}/> Palembang, Sumatera Selatan</span></div></div>
    <header className="market-header"><div className="container market-nav">
      <Link className="market-brand" href="/" aria-label="Dapur Ummi Kyana — beranda">
        <span className="market-brand-mark"><UtensilsCrossed size={24} strokeWidth={1.8}/></span>
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
        <a className="market-contact-link" href={whatsappUrl('Halo Dapur Ummi Kyana! Saya ingin bertanya tentang pemesanan.')} target="_blank" rel="noopener noreferrer">Pesan via WhatsApp <ArrowUpRight size={15}/></a>
        <button type="button" className="market-cart-button" aria-label={'Buka keranjang, '+cart.count+' item'} onClick={()=>setDrawer(true)}><ShoppingBag size={21}/>{cart.count>0&&<span className="market-cart-badge">{cart.count}</span>}</button>
        <button type="button" className="market-mobile-trigger" aria-label={mobileNav?'Tutup menu':'Buka menu'} aria-expanded={mobileNav} onClick={()=>setMobileNav(!mobileNav)}>{mobileNav?<X size={22}/>:<Menu size={22}/>}</button>
      </div>
    </div></header>

    <main>
      <section id="beranda" className="market-hero" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={()=>setPaused(false)}>
        <div className="container market-hero-grid">
          <div className="market-hero-copy">
            <span className="market-eyebrow"><span className="market-eyebrow-dot"/> HOMEMADE FROM PALEMBANG</span>
            <p className="market-hero-pretitle">MAKANAN RUMAHAN & CATERING PALEMBANG</p>
            <h1 className="market-hero-static-title">Momen terbaik<br/>dimulai dari <em>rasa.</em></h1>
            <div className="market-hero-dish-indicator" aria-live="polite">
              <span>SEDANG DITAMPILKAN</span>
              <strong key={current?.slug} className="market-hero-dish-name">{current?.name || 'Menu pilihan dapur'}</strong>
            </div>
            <p className="market-hero-description">Pilihan menu rumahan, nasi box, dan sajian acara. Temukan hidangan favoritmu, lalu konfirmasi ketersediaannya langsung dengan dapur kami.</p>
            <div className="market-hero-actions">
              <a href="#menu" className="market-button market-button--primary">Jelajahi menu <ArrowUpRight size={17}/></a>
              <Link href="/layanan" className="market-button market-button--outline">Paket catering <ArrowRight size={17}/></Link>
            </div>
            <div className="market-hero-proof"><span><Leaf size={17}/> Masakan Nusantara</span><span><HeartHandshake size={17}/> Pilihan acara & keluarga</span></div>
          </div>
          <div className="market-hero-gallery">
            <div className="market-hero-stage">
              <div className="market-hero-disc" aria-hidden="true"/>
              <div className="market-hero-sticker"><span>PILIHAN</span><strong>{String(active+1).padStart(2,'0')}</strong><small>/ {String(featured.length).padStart(2,'0')}</small></div>
              {current&&<div key={current.slug} className="market-hero-product"><ProductVisual product={current} hero/></div>}
              <div className="market-hero-caption"><span>PILIHAN DARI KATALOG</span><strong>{current?.name||'Dapur Ummi Kyana'}</strong><small>{live?'Lihat harga dan stok pada katalog':'Harga merupakan referensi arsip; konfirmasi ke penjual'}</small></div>
              <div className="market-hero-stage-note" aria-hidden="true">HOME-COOKED FOOD · PALEMBANG</div>
              <span className="market-hero-orbit-label" aria-hidden="true">MADE WITH CARE</span>
            </div>
            <div id="favorit" className="market-hero-carousel-controls">
              <div className="market-featured-thumbs" aria-label="Pilih hidangan unggulan">
                {featured.map((item,index)=><button key={item.slug} type="button" className={'market-thumb '+(index===active?'market-thumb--active':'')} onClick={()=>setActive(index)} aria-pressed={index===active} aria-label={'Tampilkan '+item.name}>
                  <ProductVisual product={item} compact/><span>{item.name}</span>
                </button>)}
              </div>
              {featured.length>1&&<div className="market-carousel-arrows"><button onClick={()=>changeSlide(-1)} type="button" aria-label="Menu unggulan sebelumnya"><ChevronLeft size={19}/></button><button onClick={()=>setPaused(value=>!value)} type="button" aria-label={paused?'Putar carousel otomatis':'Jeda carousel otomatis'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button><button onClick={()=>changeSlide(1)} type="button" aria-label="Menu unggulan berikutnya"><ChevronRight size={19}/></button></div>}
            </div>
          </div>
        </div>
        <div className="market-hero-ground" aria-hidden="true"/>
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
        <div className="market-section-head"><div><span className="market-eyebrow">PILIH YANG KAMU SUKA</span><h2>Menu pilihan <em>dapur kami.</em></h2><p>Jelajahi hidangan dari katalog Dapur Ummi Kyana. Pilih yang kamu suka, simpan ke keranjang, dan konfirmasi pemesanan.</p></div><span className="market-section-number">01 / OUR MENU</span></div>
        {!live&&<div className="market-menu-note"><Check size={18}/><p><strong>Pratinjau katalog lama.</strong> Harga merupakan referensi historis, bukan penawaran aktif. Konfirmasikan harga dan ketersediaan sebelum membeli. Foto asli produk masih dalam proses pemulihan.</p></div>}
        <div className="market-product-toolbar">
          <div className="market-category-tabs" role="group" aria-label="Filter menu">{categories.map(cat=><button type="button" key={cat} className={category===cat?'market-tab--active':''} aria-pressed={category===cat} onClick={()=>{setCategory(cat);setShowAll(false)}}>{cat}</button>)}</div>
          <label className="market-search"><Search size={17}/><input type="search" placeholder="Cari hidangan..." aria-label="Cari menu makanan" value={search} onChange={event=>{setSearch(event.target.value);setShowAll(false)}}/></label>
        </div>
        <div className="market-product-grid">{visible.map((product,index)=><article key={product.slug} className="market-product-card" style={{animationDelay:(Math.min(index,7)*55)+'ms'}}>
          <div className="market-product-card-visual"><ProductVisual product={product}/>{product.featured&&<span className="market-product-flag">Pilihan dapur</span>}<button type="button" aria-label={'Tambah '+product.name+' ke keranjang'} title={'Tambah '+product.name} className="market-product-add" onClick={()=>addToCart(product.slug)}><ShoppingBag size={18}/></button></div>
          <div className="market-product-details"><span className="market-product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="market-product-bottom"><strong>{formatRupiah(product.price_idr)}</strong><button type="button" onClick={()=>addToCart(product.slug)}>Tambah <Plus size={16}/></button></div></div>
        </article>)}</div>
        {filtered.length===0&&<div className="market-empty-result"><Search size={27}/><h3>Menu tidak ditemukan</h3><p>Coba kategori atau kata kunci lain.</p></div>}
        {filtered.length>8&&<div className="market-view-all"><button type="button" onClick={()=>setShowAll(!showAll)}>{showAll?'Tampilkan lebih sedikit':'Lihat semua '+filtered.length+' menu'} <ChevronDown className={showAll?'market-chevron-up':''} size={17}/></button></div>}
      </div></section>

      <section className="market-offer-section"><div className="container market-offer-grid">
        <div className="market-offer-copy"><span className="market-eyebrow">DARI DAPUR UNTUK ACARA KAMU</span><h2>Ada acara? <em>Biar kami yang siapkan.</em></h2><p>Dari snack box hingga tumpeng mini dan prasmanan, temukan pilihan layanan dari arsip Dapur Ummi Kyana. Tanyakan paket, kapasitas, dan harga terkini.</p><Link href="/layanan" className="market-button market-button--primary">Eksplor paket catering <ArrowUpRight size={17}/></Link><div className="market-offer-note">Pilihan dan harga perlu konfirmasi penjual.</div></div>
        <div className="market-offer-art"><span className="market-offer-round" aria-hidden="true"/><div className="market-offer-platter">{current&&<ProductVisual product={current} hero/>}</div><span className="market-offer-stamp">DARI DAPUR<br/>UNTUK ACARA</span><span className="market-offer-decoration" aria-hidden="true"/></div>
      </div></section>

      <section id="paket" className="market-service-section"><div className="container">
        <div className="market-section-head"><div><span className="market-eyebrow">PILIHAN PAKET</span><h2>Setiap momen punya <em>ceritanya.</em></h2><p>Jelajahi empat layanan dari website pertama kami, kini dengan halaman detail masing-masing.</p></div><span className="market-section-number">02 / OUR SERVICES</span></div>
        <ServiceCards compact/>
        <div className="market-all-services"><Link href="/layanan">Selengkapnya tentang layanan <ArrowRight size={17}/></Link></div>
      </div></section>

      <section className="market-gallery-section" id="galeri"><div className="container">
        <div className="market-section-head"><div><span className="market-eyebrow">CERITA DI BALIK SETIAP SAJIAN</span><h2>Lebih dekat dengan <em>hidangan kami.</em></h2>
          <p>Area galeri menampilkan konsep fotografi makanan editorial. Foto produk asli dari Dapur Ummi Kyana akan menggantikan gambar konsep setelah tersedia.</p></div><span className="market-section-number">03 / FOOD JOURNAL</span></div>
        <div className="market-gallery-grid">
          {[
            {name:'Nasi Box',desc:'Menu untuk hari yang padat',cat:'Nasi Box'},
            {name:'Hidangan Nusantara',desc:'Rempah, sambal, dan lauk pilihan',cat:'Nasi Pilihan'},
            {name:'Pesanan acara',desc:'Dari snack box hingga katering',cat:'Catering'},
          ].map((item,index)=><article className={'market-gallery-tile market-gallery-tile--'+index} key={item.name}>
            <div className="market-gallery-image">
              {products.length>0&&<ProductVisual product={products[(galleryIndex+index*2)%products.length]} hero/>}
            </div>
            <div className="market-gallery-caption"><span>0{index+1} / {item.cat}</span><h3>{item.name}</h3><p>{item.desc}</p></div>
          </article>)}
        </div>
        <div className="market-gallery-bottom"><span>Foto asli akan ditambahkan setelah tersedia dari pengelola usaha.</span><button type="button" onClick={()=>setGalleryIndex(n=>(n+1)%Math.max(1,products.length))}>Ganti pilihan visual <ArrowRight size={16}/></button></div>
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

      <section className="market-final-cta"><div className="container market-final-inner"><div><span className="market-eyebrow">SIAP UNTUK MENIKMATI?</span><h2>Rasa istimewa, <em>berawal di sini.</em></h2><p>Hubungi kami untuk mengetahui menu yang tersedia hari ini.</p></div><a className="market-button market-button--cream" href={whatsappUrl(whatsAppMessage)} target="_blank" rel="noopener noreferrer">Tanya & pesan sekarang <ArrowUpRight size={19}/></a></div></section>
    </main>

    <footer className="market-footer"><div className="container">
      <div className="market-footer-grid"><div><div className="market-brand market-footer-brand"><span className="market-brand-mark"><UtensilsCrossed size={22}/></span><span><strong>Dapur Ummi Kyana</strong><small>HOMEMADE • PALEMBANG</small></span></div><p>Diracik dengan sepenuh hati, untuk setiap meja dan cerita.</p></div><div><strong>Jelajahi</strong><a href="#menu">Menu</a><Link href="/layanan">Paket & Catering</Link><a href="#galeri">Galeri</a><a href="#tentang">Tentang Kami</a></div><div><strong>Informasi</strong><a href="#cara-pesan">Cara memesan</a><a href={whatsappUrl('Halo Dapur Ummi Kyana!')} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={13}/></a><span>Palembang, Indonesia</span></div><div><strong>Akun</strong><Link href="/login">Masuk pelanggan</Link><Link href="/admin">Panel admin</Link></div></div>
      <div className="market-footer-base"><span>© {new Date().getFullYear()} Dapur Ummi Kyana Palembang.</span><span>Dibuat dengan sepenuh hati.</span></div>
    </div></footer>

    {drawer&&<div className="drawer-layer" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setDrawer(false)}}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="market-cart-title">
        <div className="drawer-head"><div><span className="market-eyebrow">PILIHAN KAMU</span><h2 id="market-cart-title">Keranjang <span>({cart.count})</span></h2></div><button type="button" className="icon-button" aria-label="Tutup keranjang" onClick={()=>setDrawer(false)}><X/></button></div>
        <div className="drawer-items">{chosen.length ? chosen.map(({item,product})=><div className="drawer-item" key={product.slug}><ProductVisual product={product} compact/><div className="drawer-item-text"><strong>{product.name}</strong><span>{formatRupiah(product.price_idr)}</span><div className="qty"><button type="button" aria-label={'Kurangi '+product.name} onClick={()=>cart.subtract(product.slug)}><Minus size={14}/></button><span>{item.quantity}</span><button type="button" aria-label={'Tambah '+product.name} onClick={()=>cart.add(product.slug)}><Plus size={14}/></button></div></div><button type="button" className="remove-item" aria-label={'Hapus '+product.name} onClick={()=>cart.remove(product.slug)}><X size={16}/></button></div>) : <div className="drawer-empty"><ShoppingBag size={44}/><h3>Keranjang masih kosong</h3><p>Pilih hidangan yang ingin dipesan terlebih dahulu.</p><button type="button" className="market-button market-button--outline" onClick={()=>setDrawer(false)}>Jelajahi menu</button></div>}</div>
        <div className="drawer-footer"><div className="subtotal"><span>{live?'Subtotal':'Subtotal referensi'}</span><strong>{formatRupiah(subtotal)}</strong></div><p>{live?'Belum termasuk ongkos kirim.':'Harga arsip perlu dikonfirmasi penjual; belum termasuk ongkir.'}</p>{live ? <Link href="/checkout" className={'market-button market-button--primary market-button--full '+(!chosen.length?'market-disabled':'')} aria-disabled={!chosen.length} onClick={event=>{if(!chosen.length)event.preventDefault()}}>Lanjut checkout <ArrowRight size={17}/></Link> : <a className={'market-button market-button--primary market-button--full '+(!chosen.length?'market-disabled':'')} href={whatsappUrl(whatsAppMessage)} target="_blank" rel="noopener noreferrer" aria-disabled={!chosen.length} onClick={event=>{if(!chosen.length)event.preventDefault()}}>Konfirmasi via WhatsApp <ArrowUpRight size={17}/></a>}</div>
      </aside>
    </div>}
  </div>;
}
