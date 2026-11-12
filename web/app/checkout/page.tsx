'use client';
import { useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, ShoppingBag } from 'lucide-react';
import { browserSupabase } from '@/lib/supabase';
import { useCart } from '@/components/cart-provider';
import { formatRupiah, type Product } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export default function CheckoutPage(){
 const supabase=useMemo(()=>browserSupabase(),[]);const cart=useCart();
 const [products,setProducts]=useState<Product[]>([]);const [loading,setLoading]=useState(true);
 const [name,setName]=useState('');const [phone,setPhone]=useState('');const [fulfillment,setFulfillment]=useState<'pickup'|'delivery'>('pickup');const [address,setAddress]=useState('');const [notes,setNotes]=useState('');
 const [submitting,setSubmitting]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');
 useEffect(()=>{fetch('/api/products',{cache:'no-store'}).then(r=>r.json()).then(d=>setProducts(d.live?d.products:[])).catch(()=>{}).finally(()=>setLoading(false))},[]);
 const chosen=cart.items.map(i=>({item:i,product:products.find(p=>p.slug===i.slug)})).filter((x):x is {item:typeof cart.items[number];product:Product}=>Boolean(x.product));
 const subtotal=chosen.reduce((sum,x)=>sum+x.product.price_idr*x.item.quantity,0);
 async function submit(e:React.FormEvent){
  e.preventDefault(); if(!supabase)return;
  setSubmitting(true);setError('');
  try{
   const {data}=await supabase.auth.getSession();
   if(!data.session){window.location.assign('/login?next=checkout');return}
   const id=crypto.randomUUID();
   const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({items:chosen.map(x=>({slug:x.product.slug,quantity:x.item.quantity})),customer_name:name,customer_phone:phone,fulfillment,delivery_address:address,notes,client_request_id:id})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||'Pemesanan gagal.');
   setSuccess(result.order_id);cart.clear();
  }catch(err){setError(err instanceof Error?err.message:'Checkout gagal.')}finally{setSubmitting(false)}
 }
 return <main className="checkout-shell"><div className="container"><Link href="/" className="small-link"><ArrowLeft size={15}/> Kembali ke katalog</Link><div className="checkout-panel" style={{marginTop:20}}><div className="eyebrow"><ShoppingBag size={14}/> CHECKOUT</div><h1>Detail pesanan</h1>{success?<div className="notice" style={{background:'#e8f5e7'}}><CheckCircle2 size={20}/><div><strong>Pesanan tercatat.</strong><p>Nomor pesanan: <code>{success}</code>. Pembayaran belum terkonfirmasi. Penjual akan menghubungi kamu untuk konfirmasi stok, ongkir bila diperlukan, dan instruksi pembayaran.</p><Link href="/" className="small-link">Kembali ke toko <ArrowRight size={14}/></Link></div></div>:(!supabase?<p className="checkout-note">Checkout database belum diaktifkan. Gunakan WhatsApp dari keranjang belanja untuk menghubungi penjual.</p>:loading?<p>Memuat menu...</p>:!chosen.length?<p className="checkout-note">Keranjang kosong atau menu tidak lagi tersedia. <Link href="/">Pilih menu dahulu.</Link></p>:<><h2 style={{fontSize:17,marginTop:28}}>Ringkasan</h2>{chosen.map(x=><div className="checkout-row" key={x.product.slug}><span>{x.product.name} × {x.item.quantity}</span><strong>{formatRupiah(x.product.price_idr*x.item.quantity)}</strong></div>)}<div className="checkout-row"><strong>Subtotal</strong><strong>{formatRupiah(subtotal)}</strong></div><p className="checkout-note">Ongkos kirim dan total akhir pesanan delivery dikonfirmasi penjual. Tidak ada pembayaran otomatis dalam checkout ini.</p><form onSubmit={submit}><div className="form-grid"><div className="field"><label htmlFor="buyer-name">Nama pemesan</label><input id="buyer-name" required minLength={3} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></div><div className="field"><label htmlFor="buyer-phone">Telepon/WhatsApp</label><input id="buyer-phone" required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08xxxxxxxxxx"/></div></div><div className="field"><label htmlFor="fulfillment">Metode penerimaan</label><select id="fulfillment" value={fulfillment} onChange={e=>setFulfillment(e.target.value as 'pickup'|'delivery')}><option value="pickup">Ambil sendiri — lokasi dikonfirmasi penjual</option><option value="delivery">Diantar — ongkir dikonfirmasi penjual</option></select></div>{fulfillment==='delivery'&&<div className="field"><label htmlFor="address">Alamat lengkap</label><textarea id="address" required minLength={12} maxLength={500} rows={3} value={address} onChange={e=>setAddress(e.target.value)}/></div>}<div className="field"><label htmlFor="notes">Catatan (opsional)</label><textarea id="notes" maxLength={800} rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Contoh: untuk acara atau tanggal tertentu"/></div>{error&&<p className="error-text" role="alert">{error}</p>}<button className="btn btn-primary btn-full" type="submit" disabled={submitting}>{submitting?'Memproses...':'Kirim pesanan (belum bayar)'} <ArrowRight size={17}/></button><p className="checkout-note" style={{textAlign:'center'}}><LockKeyhole size={12} style={{verticalAlign:'middle'}}/> Data pesanan tersimpan setelah login dan konfirmasi email.</p></form></> )}</div></div></main>
}
