import { NextResponse } from 'next/server';
import { adminUser, serviceSupabase } from '@/lib/supabase';
export async function GET(request:Request) {
  const user=await adminUser(request);
  if(!user)return NextResponse.json({error:'Tidak memiliki akses admin.'},{status:403});
  const db=serviceSupabase();
  if(!db)return NextResponse.json({error:'Database belum dikonfigurasi.'},{status:503});
  const [orders,products,orderCount]=await Promise.all([
    db.from('orders').select('id,customer_name,customer_phone,fulfillment,total_idr,subtotal_idr,payment_status,payment_method,status,created_at,delivery_address').order('created_at',{ascending:false}).limit(100),
    db.from('products').select('id,slug,name,category,description,price_idr,active,featured,accent,created_at').order('created_at',{ascending:false}).limit(200),
    db.from('orders').select('id',{count:'exact',head:true}),
  ]);
  if(orders.error||products.error||orderCount.error)return NextResponse.json({error:'Tidak dapat memuat dashboard.'},{status:500});
  return NextResponse.json({orders:orders.data||[],products:products.data||[],totalOrders:orderCount.count||0},{headers:{'Cache-Control':'private, no-store'}});
}
