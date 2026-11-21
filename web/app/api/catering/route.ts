import { NextResponse } from 'next/server';
import { authenticatedUser, serviceSupabase } from '@/lib/supabase';
const allowed = ['daily-catering','snack-box','tumpeng-mini','prasmanan-gubukan'];
export async function POST(request:Request){
 const user=await authenticatedUser(request);
 if(!user)return NextResponse.json({error:'Silakan login untuk mengirim permintaan katering.'},{status:401});
 const db=serviceSupabase();if(!db)return NextResponse.json({error:'Database belum diaktifkan.'},{status:503});
 let b:Record<string,unknown>;try{b=await request.json()}catch{return NextResponse.json({error:'Data tidak valid.'},{status:400})}
 const service_slug=String(b.service_slug||'');
 const package_name=String(b.package_name||'').trim().slice(0,120);
 const phone=String(b.phone||'').replace(/[\s-]/g,'');
 const address=String(b.address||'').trim().slice(0,500);
 const notes=String(b.notes||'').trim().slice(0,800);
 const qty=Number(b.quantity);
 const schedule=new Date(String(b.scheduled_for||''));
 if(!allowed.includes(service_slug)||!Number.isInteger(qty)||qty<1||qty>5000||!/^[+]?\d{9,16}$/.test(phone)||address.length<12||!Number.isFinite(schedule.getTime())||schedule.getTime()<Date.now()+3600000)
 return NextResponse.json({error:'Lengkapi jumlah, kontak, lokasi dan jadwal yang valid.'},{status:400});
 const {data,error}=await db.from('catering_requests').insert({user_id:user.id,service_slug,package_name,quantity:qty,scheduled_for:schedule.toISOString(),phone,address,notes,status:'requested'}).select('id').single();
 if(error)return NextResponse.json({error:'Gagal menyimpan permintaan katering.'},{status:500});
 return NextResponse.json({request_id:data.id,status:'requested',message:'Permintaan katering tersimpan. Harga dan kapasitas belum dikonfirmasi.'},{status:201});
}
