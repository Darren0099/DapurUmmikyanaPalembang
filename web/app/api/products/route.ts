import { NextResponse } from 'next/server';
import { loadProducts } from '@/lib/catalog';
export async function GET() {
  const result=await loadProducts();
  return NextResponse.json(result, { headers:{ 'Cache-Control':'public, s-maxage=60, stale-while-revalidate=120' } });
}
