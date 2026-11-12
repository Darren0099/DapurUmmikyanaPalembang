import { NextResponse } from 'next/server';
import { adminUser, serviceSupabase } from '@/lib/supabase';
export async function POST(request:Request){
 if(!await adminUser(request))return NextResponse.json({error:'Akses admin ditolak.'},{status:403});
 const db=serviceSupabase();if(!db)return NextResponse.json({error:'Database belum aktif.'},{status:503});
 let body:{name?:string;price_idr?:number;category?:string;description?:string;featured?:boolean;image_url?:string|null};
 try{body=await request.json()}catch{return NextResponse.json({error:'JSON tidak valid.'},{status:400})}
 const name=String(body.name||'').trim(); const category=String(body.category||'Nasi Box').trim();
 if(name.length<3||name.length>120||category.length<2||category.length>50||!Number.isInteger(body.price_idr)||body.price_idr!<=0||body.price_idr!>100000000)return NextResponse.json({error:'Data produk tidak valid.'},{status:400});
 const slug=name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);
 if(slug.length<2)return NextResponse.json({error:'Nama tidak dapat dijadikan slug.'},{status:400});
 const imageUrl=typeof body.image_url==='string'?body.image_url.trim():'';
 if(imageUrl&&(imageUrl.length>2000||!/^https:\/\//.test(imageUrl)))return NextResponse.json({error:'URL foto harus HTTPS.'},{status:400});
 const {data,error}=await db.from('products').insert({name,slug,category,description:String(body.description||'').slice(0,300),price_idr:body.price_idr!,featured:body.featured===true,active:true,accent:'amber',image_url:imageUrl||null}).select('id,slug').single();
 if(error)return NextResponse.json({error:error.code==='23505'?'Nama/slug sudah digunakan.':'Gagal menambah produk.'},{status:error.code==='23505'?409:500});
 return NextResponse.json({product:data},{status:201});
}
