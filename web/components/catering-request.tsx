'use client';
import { useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserSupabase } from '@/lib/supabase';
export default function CateringRequest({slug,options}:{slug:string;options:string[]}){
 const client=useMemo(()=>browserSupabase(),[]);const router=useRouter();
 const [packageName,setPackageName]=useState(options[0]||'Konsultasi paket');
 const [quantity,setQuantity]=useState('30');const [scheduledFor,setScheduledFor]=useState('');
 const [phone,setPhone]=useState('');const [address,setAddress]=useState('');const [notes,setNotes]=useState('');
 const [pending,setPending]=useState(false);const [error,setError]=useState('');const [done,setDone]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();setError('');setPending(true);
 try{
  if(!client)throw new Error('Database belum diaktifkan.');
  const {data}=await client.auth.getSession();
  if(!data.session){router.push('/login?next=account');return;}
  const r=await fetch('/api/catering',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({service_slug:slug,package_name:packageName,quantity:Number(quantity),scheduled_for:new Date(scheduledFor).toISOString(),phone,address,notes})});
  const j=await r.json();if(!r.ok)throw new Error(j.error||'Permintaan gagal.');
  setDone(j.request_id);
 }catch(e){setError(e instanceof Error?e.message:'Permintaan gagal.')}finally{setPending(false)}
 }
 return <div className="catering-request" id="form-paket"><h3>Ajukan pesanan katering</h3><p>Isi kebutuhan acara langsung di website. Admin akan memeriksa kapasitas dan harga sebelum pesanan disetujui. Tidak ada pembayaran pada tahap ini.</p>{done?<div className="notice">Permintaan berhasil dicatat: #{done.slice(0,8).toUpperCase()}. Simpan nomor ini untuk referensi.</div>:<form onSubmit={submit} className="catering-request-form"><label>Jenis paket<select value={packageName} onChange={e=>setPackageName(e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></label><label>Jumlah porsi/box<input type="number" min="1" max="5000" required value={quantity} onChange={e=>setQuantity(e.target.value)}/></label><label>Tanggal dan jam acara<input type="datetime-local" required value={scheduledFor} onChange={e=>setScheduledFor(e.target.value)}/></label><label>Nomor WhatsApp untuk kontak (tanpa berpindah ke WhatsApp)<input type="tel" required value={phone} onChange={e=>setPhone(e.target.value)}/></label><label>Alamat acara<input required minLength={12} value={address} onChange={e=>setAddress(e.target.value)}/></label><label>Catatan kebutuhan<textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)}/></label>{error&&<p role="alert" className="error-text">{error}</p>}<button type="submit" disabled={pending} className="btn btn-primary btn-full">{pending?'Mengirim...':'Kirim permintaan ke dapur'}</button></form>}</div>;
}
