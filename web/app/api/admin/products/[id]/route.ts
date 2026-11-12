import { NextResponse } from 'next/server';
import { adminUser, serviceSupabase } from '@/lib/supabase';
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
 if(!await adminUser(request))return NextResponse.json({error:'Akses admin ditolak.'},{status:403});
 const db=serviceSupabase();if(!db)return NextResponse.json({error:'Database belum aktif.'},{status:503});
 let body:Record<string,unknown>;
 try{body=await request.json()}catch{return NextResponse.json({error:'JSON tidak valid.'},{status:400})}
 const patch:Record<string,unknown>={};
 if(typeof body.active==='boolean')patch.active=body.active;
 if(typeof body.featured==='boolean')patch.featured=body.featured;
 if(typeof body.price_idr==='number'&&Number.isInteger(body.price_idr)&&body.price_idr>0&&body.price_idr<=100000000)patch.price_idr=body.price_idr;
 if(typeof body.name==='string'&&body.name.trim().length>=3&&body.name.length<=120)patch.name=body.name.trim();
 if(!Object.keys(patch).length)return NextResponse.json({error:'Tidak ada perubahan yang valid.'},{status:400});
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:'ID tidak valid.'},{status:400});
 const {data,error}=await db.from('products').update(patch).eq('id',id).select('id,name,active,featured,price_idr').single();
 if(error)return NextResponse.json({error:'Gagal memperbarui menu.'},{status:500});
 return NextResponse.json({product:data},{headers:{'Cache-Control':'no-store'}});
}
