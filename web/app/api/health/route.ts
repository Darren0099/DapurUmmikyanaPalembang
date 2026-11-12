import { NextResponse } from 'next/server';
import { hasPublicDatabase, hasServerDatabase } from '@/lib/catalog';
export function GET(){
  return NextResponse.json({
    service:'Dapur Ummi Kyana',
    status:'online',
    catalog:hasPublicDatabase?'database-configured':'legacy-preview',
    checkout:hasServerDatabase?'configured':'disabled',
    payment:'manual-confirmation-only',
  },{headers:{'Cache-Control':'no-store'}});
}
