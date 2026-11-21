'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock3, CreditCard, PackageCheck, UserRound, MapPin, LogOut } from 'lucide-react';
import { browserSupabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/catalog';

type Catering = {id:string;service_slug:string;package_name:string;quantity:number;scheduled_for:string;status:string};
type Item = { product_name: string; quantity: number; line_total_idr: number };
type Order = { id:string; customer_name:string; customer_phone:string; fulfillment:string; delivery_address:string|null; total_idr:number; payment_method:string; payment_status:string; status:string; created_at:string; order_items:Item[] };
export default function AccountPage(){
 const client=useMemo(()=>browserSupabase(),[]);
 const [orders,setOrders]=useState<Order[]>([]);const [catering,setCatering]=useState<Catering[]>([]);
 const [email,setEmail]=useState('');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 async function load(){
  if(!client){setError('Akun belum tersedia karena database belum terhubung.');setLoading(false);return;}
  const {data}=await client.auth.getSession();
  if(!data.session){window.location.assign('/login?next=account');return;}
  setEmail(data.session.user.email||'');
  try{
   const r=await fetch('/api/orders/mine',{headers:{Authorization:'Bearer '+data.session.access_token},cache:'no-store'});
   const j=await r.json();if(!r.ok)throw new Error(j.error||'Gagal memuat pesanan.');
   setOrders(j.orders||[]);setCatering(j.catering||[]);
  }catch(e){setError(e instanceof Error?e.message:'Gagal memuat pesanan.')}finally{setLoading(false)}
 }
 useEffect(()=>{void load()},[client]);
 async function pay(id:string){
  if(!client)return;
  const {data}=await client.auth.getSession();
  if(!data.session)return;
  const r=await fetch('/api/orders/'+id+'/demo-pay',{method:'POST',headers:{Authorization:'Bearer '+data.session.access_token}});
  const j=await r.json();if(!r.ok){setError(j.error||'Simulasi gagal.');return;}await load();
 }
 return <main className="account-page"><div className="container"><Link href="/" className="small-link"><ArrowLeft size={16}/> Kembali ke menu</Link><div className="account-head"><div><span className="eyebrow">DAPUR UMMI KYANA / AKUN</span><h1>Pesanan saya</h1><p>Lihat progres pesanan dan pembayaran demo dalam satu tempat.</p></div><div className="account-identity"><UserRound size={18}/><span>{email||'Akun pelanggan'}</span><button onClick={async()=>{await client?.auth.signOut();window.location.assign('/login')}} aria-label="Keluar"><LogOut size={17}/></button></div></div>
 <div className="account-notice"><CreditCard size={20}/><div><strong>Mode pembayaran simulasi</strong><p>Tombol bayar demo tidak memindahkan uang. Status hanya digunakan untuk menguji alur pemesanan.</p></div></div>
 {loading?<p>Memuat riwayat pesanan...</p>:error?<p role="alert" className="error-text">{error}</p>:!orders.length&&!catering.length?<div className="account-empty"><PackageCheck size={38}/><h2>Belum ada pesanan</h2><p>Menu yang kamu pilih akan muncul di sini setelah checkout.</p><Link className="btn btn-primary" href="/#menu">Pilih menu</Link></div>:<div className="account-order-list">{orders.map(order=><article className="account-order" key={order.id}><div className="account-order-top"><div><small>#{order.id.slice(0,8).toUpperCase()}</small><strong>{new Date(order.created_at).toLocaleDateString('id-ID',{dateStyle:'long'})}</strong></div><div className="account-order-badges"><span className="status-badge">{order.status.replaceAll('_',' ')}</span><span className="status-badge">{order.payment_status==='paid'?'Demo terbayar':'Belum dibayar'}</span></div></div><div className="account-order-items">{order.order_items?.map((item,i)=><div key={i}><span>{item.product_name} × {item.quantity}</span><strong>{formatRupiah(item.line_total_idr)}</strong></div>)}</div><div className="account-order-foot"><div><div><MapPin size={15}/>{order.fulfillment==='pickup'?'Ambil sendiri':order.delivery_address}</div><div><Clock3 size={15}/> Status: {order.status}</div><strong>Total {formatRupiah(order.total_idr)}</strong></div>{order.payment_method==='demo'&&order.payment_status==='awaiting_confirmation'&&order.status!=='cancelled'&&<button className="btn btn-primary" onClick={()=>pay(order.id)}>Bayar Demo · Tanpa uang asli</button>}</div></article>)}</div>}{catering.length>0&&<section className="account-catering"><h2>Permintaan katering</h2><div className="account-order-list">{catering.map(c=><article className="account-order" key={c.id}><span className="eyebrow">#{c.id.slice(0,8).toUpperCase()} · {c.status}</span><h3>{c.package_name}</h3><p>{c.quantity} porsi/box · {new Date(c.scheduled_for).toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short'})}</p><p>Permintaan bukan pembayaran atau pemesanan final sebelum dikonfirmasi admin.</p></article>)}</div></section>}</div></main>;
}
