import { NextResponse } from 'next/server';
import { adminUser, serviceSupabase } from '@/lib/supabase';
export async function GET(request:Request) {
  const user=await adminUser(request);
  if(!user)return NextResponse.json({error:'Tidak memiliki akses admin.'},{status:403});
  const db=serviceSupabase();
  if(!db)return NextResponse.json({error:'Database belum dikonfigurasi.'},{status:503});
  const [orders,products,orderCount,catering]=await Promise.all([
    db.from('orders').select('id,customer_name,customer_phone,fulfillment,total_idr,subtotal_idr,payment_status,payment_method,status,created_at,delivery_address,notes,scheduled_for,user_id').order('created_at',{ascending:false}).limit(100),
    db.from('products').select('id,slug,name,category,description,price_idr,active,featured,accent,image_url,created_at').order('created_at',{ascending:false}).limit(200),
    db.from('orders').select('id',{count:'exact',head:true}),
    db.from('catering_requests').select('id,user_id,service_slug,package_name,quantity,scheduled_for,phone,address,notes,status,created_at').order('created_at',{ascending:false}).limit(100),
  ]);
  if(orders.error||products.error||orderCount.error||catering.error)return NextResponse.json({error:'Tidak dapat memuat dashboard.'},{status:500});
  return NextResponse.json({orders:orders.data||[],products:products.data||[],totalOrders:orderCount.count||0,catering:catering.data||[]},{headers:{'Cache-Control':'private, no-store'}});
}
