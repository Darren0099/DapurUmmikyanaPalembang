import { NextResponse } from 'next/server';
import { authenticatedUser, serviceSupabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Login diperlukan.' }, { status: 401 });
  const db = serviceSupabase();
  if (!db) return NextResponse.json({ error: 'Database belum aktif.' }, { status: 503 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'ID pesanan tidak valid.' }, { status: 400 });
  const { data: order, error } = await db.from('orders')
    .select('id,user_id,payment_method,payment_status,status,fulfillment,delivery_fee_idr')
    .eq('id', id).eq('user_id', user.id).single();
  if (error || !order) return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
  if (order.payment_method !== 'demo') return NextResponse.json({ error: 'Metode pembayaran bukan demo.' }, { status: 409 });
  if (order.payment_status === 'paid') return NextResponse.json({ success: true, already_paid: true, demo: true });
  if (order.status === 'cancelled' || order.payment_status !== 'awaiting_confirmation') return NextResponse.json({ error: 'Pesanan tidak bisa dibayar.' }, { status: 409 });
  // Demo-only simulation; NEVER calls a financial gateway or transfers money.
  const { data: updated, error: updateError } = await db.from('orders')
    .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id).eq('payment_method', 'demo')
    .eq('payment_status', 'awaiting_confirmation').eq('status', order.status)
    .select('id').maybeSingle();
  if (updateError) return NextResponse.json({ error: 'Simulasi gagal disimpan.' }, { status: 500 });
  if (!updated) return NextResponse.json({ error: 'Status pesanan berubah. Muat ulang.' }, { status: 409 });
  await db.from('payment_events').insert({ order_id: id, actor_user_id: user.id, type: 'demo_payment_simulated', previous_status: 'awaiting_confirmation', next_status: 'paid' });
  return NextResponse.json({ success: true, demo: true, message: 'Pembayaran simulasi berhasil. Tidak ada uang yang dipindahkan.' }, { headers: { 'Cache-Control': 'no-store' } });
}
