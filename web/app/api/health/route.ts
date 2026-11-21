import { NextResponse } from 'next/server';
import { storeGet } from '@/lib/store-api';
export async function GET(){
 let connected=false;
 try{const response=await storeGet('/health');connected=response.status==='ok'}catch{}
 return NextResponse.json({
  service:'Dapur Ummi Kyana',
  status:connected?'online':'degraded',
  backend:'cloudflare-d1',
  database:connected?'reachable':'unavailable',
  checkout:connected?'demo-only':'disabled',
  payment:'demo-only-no-real-money',
 },{status:connected?200:503,headers:{'Cache-Control':'no-store'}});
}
