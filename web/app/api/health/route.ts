import { NextResponse } from 'next/server';
import { hasPublicDatabase, hasServerDatabase } from '@/lib/catalog';
export function GET(){
  return NextResponse.json({
    service:'Dapur Ummi Kyana',
    status:'online',
    catalog:hasPublicDatabase?'database-configured':'legacy-preview',
    checkout:hasServerDatabase?'configured':'disabled',
    payment:'demo-only-no-real-money',backend:'cloudflare-d1',
  },{headers:{'Cache-Control':'no-store'}});
}
