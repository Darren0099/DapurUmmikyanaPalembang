import { NextResponse } from 'next/server';
import { adminUser, serviceSupabase } from '@/lib/supabase';
const transitions:Record<string,string[]>={requested:['reviewing','declined'],reviewing:['approved','declined'],approved:[],declined:[]};
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const admin=await adminUser(request);if(!admin)return NextResponse.json({error:'Akses admin ditolak.'},{status:403});
 const db=serviceSupabase();if(!db)return NextResponse.json({error:'Database belum tersedia.'},{status:503});
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:'ID tidak valid.'},{status:400});
 let body:{status?:string};try{body=await request.json()}catch{return NextResponse.json({error:'JSON tidak valid.'},{status:400})}
 const {data:current,error}=await db.from('catering_requests').select('status').eq('id',id).single();
 if(error||!current)return NextResponse.json({error:'Permintaan tidak ditemukan.'},{status:404});
 if(typeof body.status!=='string'||!transitions[current.status]?.includes(body.status))return NextResponse.json({error:'Status berikutnya tidak valid.'},{status:409});
 const {data, error:changeError}=await db.from('catering_requests').update({status:body.status}).eq('id',id).eq('status',current.status).select('id,status').maybeSingle();
 if(changeError||!data)return NextResponse.json({error:'Permintaan telah berubah. Muat ulang.'},{status:409});
 return NextResponse.json({request:data},{headers:{'Cache-Control':'no-store'}});
}
