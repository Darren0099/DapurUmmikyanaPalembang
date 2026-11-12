import { NextResponse } from 'next/server';
import { adminUser, serviceSupabase } from '@/lib/supabase';
const states=['pending','confirmed','preparing','delivering','completed','cancelled'];
const paymentStates=['awaiting_confirmation','paid','failed','refunded'];
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!await adminUser(request))return NextResponse.json({error:'Akses admin ditolak.'},{status:403});
  const db=serviceSupabase();if(!db)return NextResponse.json({error:'Database belum aktif.'},{status:503});
  const {id}=await params;
  if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:'ID pesanan tidak valid.'},{status:400});
  let body:{status?:string;payment_status?:string;confirm_manual?:boolean};
  try{body=await request.json()}catch{return NextResponse.json({error:'JSON tidak valid.'},{status:400})}
  const changes:Record<string,unknown>={};
  if(body.status!==undefined){if(!states.includes(body.status))return NextResponse.json({error:'Status pesanan tidak valid.'},{status:400});changes.status=body.status}
  if(body.payment_status!==undefined){
    if(!paymentStates.includes(body.payment_status))return NextResponse.json({error:'Status pembayaran tidak valid.'},{status:400});
    const {data:order,error}=await db.from('orders').select('payment_method,payment_status').eq('id',id).single();
    if(error||!order)return NextResponse.json({error:'Pesanan tidak ditemukan.'},{status:404});
    if(order.payment_method!=='manual')return NextResponse.json({error:'Pembayaran gateway harus diverifikasi melalui webhook resmi.'},{status:400});
    if(body.payment_status==='paid'&&body.confirm_manual!==true)return NextResponse.json({error:'Konfirmasi pembayaran manual wajib diberikan.'},{status:400});
    changes.payment_status=body.payment_status;
    changes.paid_at=body.payment_status==='paid'?new Date().toISOString():null;
  }
  if(!Object.keys(changes).length)return NextResponse.json({error:'Tidak ada perubahan.'},{status:400});
  const {data,error}=await db.from('orders').update(changes).eq('id',id).select('id,status,payment_status').single();
  if(error)return NextResponse.json({error:'Gagal menyimpan status.'},{status:500});
  return NextResponse.json({order:data},{headers:{'Cache-Control':'no-store'}});
}
