import { NextResponse } from 'next/server';
import { authenticatedUser, serviceSupabase } from '@/lib/supabase';

type CheckoutBody = {
  items?: { slug?: string; quantity?: number }[];
  customer_name?: string;
  customer_phone?: string;
  fulfillment?: 'pickup' | 'delivery';
  delivery_address?: string;
  notes?: string;
  client_request_id?: string;
};
function invalid(message:string, status=400){return NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}})}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request:Request){
  const db=serviceSupabase();
  if(!db) return invalid('Checkout database belum diaktifkan. Silakan pesan melalui WhatsApp.',503);
  const user=await authenticatedUser(request);
  if(!user) return invalid('Silakan login dan verifikasi email terlebih dahulu.',401);
  let body:CheckoutBody;
  try {body=await request.json() as CheckoutBody;}catch{return invalid('JSON tidak valid.')}
  if(!body||!Array.isArray(body.items)||!body.items.length||body.items.length>30) return invalid('Keranjang tidak valid.');
  if(!uuid.test(body.client_request_id||'')) return invalid('ID permintaan tidak valid.');
  const name=String(body.customer_name||'').trim().slice(0,100);
  const phone=String(body.customer_phone||'').replace(/\s|\-/g,'');
  const address=String(body.delivery_address||'').trim().slice(0,500);
  const notes=String(body.notes||'').trim().slice(0,800);
  const fulfillment=body.fulfillment==='delivery'?'delivery':'pickup';
  if(name.length<3||!/^\+?\d{9,16}$/.test(phone)) return invalid('Nama atau nomor telepon tidak valid.');
  if(fulfillment==='delivery'&&address.length<12) return invalid('Alamat pengiriman belum lengkap.');
  const ids=new Set<string>();
  for (const item of body.items) {
    if(typeof item.slug!=='string'|| !/^[a-z0-9-]{1,80}$/.test(item.slug)||!Number.isInteger(item.quantity)||item.quantity!<1||item.quantity!>50||ids.has(item.slug))return invalid('Isi keranjang atau jumlah item tidak valid.');
    ids.add(item.slug);
  }
  const {data:existing}=await db.from('orders').select('id').eq('user_id',user.id).eq('client_request_id',body.client_request_id!).maybeSingle();
  if(existing) return NextResponse.json({order_id:existing.id,reused:true},{status:200});
  const {data:products,error:productError}=await db.from('products').select('id,slug,name,price_idr,active').in('slug',[...ids]).eq('active',true);
  if(productError||!products||products.length!==ids.size)return invalid('Sebagian produk tidak tersedia. Silakan muat ulang katalog.',409);
  const bySlug=new Map(products.map(p=>[p.slug,p]));
  const lines=body.items.map(i=>({product:bySlug.get(i.slug!)!, quantity:i.quantity!}));
  const subtotal=lines.reduce((sum,x)=>sum+x.product.price_idr*x.quantity,0);
  if(!Number.isSafeInteger(subtotal)||subtotal<=0||subtotal>1000000000)return invalid('Total pesanan tidak valid.');
  const {data:order,error:orderError}=await db.from('orders').insert({
    user_id:user.id,client_request_id:body.client_request_id!,customer_name:name,customer_phone:phone,fulfillment,
    delivery_address:fulfillment==='delivery'?address:null,notes,subtotal_idr:subtotal,total_idr:subtotal,
    delivery_fee_idr:fulfillment==='pickup'?0:null,payment_method:'manual',payment_status:'awaiting_confirmation',status:'pending',
  }).select('id').single();
  if(orderError||!order) {
    if(orderError?.code==='23505'){
      const {data:again}=await db.from('orders').select('id').eq('user_id',user.id).eq('client_request_id',body.client_request_id!).maybeSingle();
      if(again)return NextResponse.json({order_id:again.id,reused:true});
    }
    return invalid('Gagal membuat pesanan. Coba beberapa saat lagi.',500);
  }
  const {error:itemsError}=await db.from('order_items').insert(lines.map(x=>({order_id:order.id,product_id:x.product.id,product_name:x.product.name,unit_price_idr:x.product.price_idr,quantity:x.quantity,line_total_idr:x.product.price_idr*x.quantity})));
  if(itemsError){await db.from('orders').delete().eq('id',order.id);return invalid('Gagal menyimpan detail pesanan, tidak ada pembayaran yang diproses.',500)}
  return NextResponse.json({order_id:order.id,subtotal_idr:subtotal,payment_status:'awaiting_confirmation',shipping_pending:fulfillment==='delivery'},{status:201,headers:{'Cache-Control':'no-store'}});
}
