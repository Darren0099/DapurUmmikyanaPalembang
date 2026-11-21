import { NextResponse } from 'next/server';
import { loadProducts } from '@/lib/catalog';
export async function GET() {
  const result=await loadProducts();
  return NextResponse.json(result, { headers:{ 'Cache-Control':'no-store' } });
}
