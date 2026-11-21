import { NextResponse } from 'next/server';
import { authenticatedUser, serviceSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
  const db = serviceSupabase();
  if (!db) return NextResponse.json({ error: 'Database belum aktif.' }, { status: 503 });
  const { data, error } = await db.from('orders')
    .select('id,customer_name,customer_phone,fulfillment,delivery_address,notes,subtotal_idr,delivery_fee_idr,total_idr,payment_method,payment_status,status,created_at,paid_at,order_items(product_name,unit_price_idr,quantity,line_total_idr)')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: 'Gagal memuat pesanan.' }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}
